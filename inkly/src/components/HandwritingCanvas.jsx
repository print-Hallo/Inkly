"use client";

/**
 * @purpose: Freehand drawing canvas for manual writing with iPad stylus or mouse.
 * @features: Pen and eraser tools, adjustable stroke width and color,
 *            undo/redo, clear canvas, touch and mouse event support,
 *            pressure sensitivity for stylus, export canvas as image.
 * @params: {Function} onExport - Optional callback receiving canvas data URL on export.
 */

import { useRef, useState, useCallback, useEffect } from "react";

export default function HandwritingCanvas({ onExport }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // "pen" | "eraser" | "pan"
  const [strokeColor, setStrokeColor] = useState("#1a1a2e"); // Dark ink default
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Panning State
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Theme & Language State
  const [theme, setTheme] = useState("light-ruled");
  const [ocrLanguage, setOcrLanguage] = useState("fra"); // Default to French for cursive

  // Live OCR State
  const [liveText, setLiveText] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const ocrTimeoutRef = useRef(null);

  const languages = [
    { code: "eng", label: "English" },
    { code: "fra", label: "French" },
    { code: "spa", label: "Spanish" },
    { code: "deu", label: "German" },
    { code: "ara", label: "Arabic" },
    { code: "chi_sim", label: "Chinese (Simplified)" },
    { code: "jpn", label: "Japanese" },
  ];

  const themesData = {
    "light-ruled": { bg: "#fdfdfc", lines: "repeating-linear-gradient(transparent, transparent 31px, #e5e5f0 31px, #e5e5f0 32px)", dropShadow: true },
    "light-blank": { bg: "#fdfdfc", lines: "none", dropShadow: true },
    "dark-ruled": { bg: "#1e1e2a", lines: "repeating-linear-gradient(transparent, transparent 31px, #2a2a3e 31px, #2a2a3e 32px)", dropShadow: false },
    "dark-blank": { bg: "#1e1e2a", lines: "none", dropShadow: false },
  };

  useEffect(() => {
    if (theme.startsWith("dark") && strokeColor === "#1a1a2e") setStrokeColor("#f0f0f5");
    if (theme.startsWith("light") && strokeColor === "#f0f0f5") setStrokeColor("#1a1a2e");
  }, [theme, strokeColor]);

  /* ─── Initialize Canvas ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simulate an A4-ish page or a long continuous roll
    const canvasWidth = 800;
    const canvasHeight = 1600;

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    contextRef.current = ctx;

    // Save initial blank state
    saveState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── State Management ─── */
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const restoreState = useCallback((index) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx || !history[index]) return;
    const img = new window.Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
    };
    img.src = history[index];
  }, [history]);

  /* ─── Live Auto-Recognition ─── */
  const runLiveOCR = useCallback(async (dataUrl) => {
    if (!dataUrl) return;

    // Create an offscreen canvas to process the transparent/dark image into white bg + black text
    const img = new window.Image();
    img.onload = async () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = img.width;
      offCanvas.height = img.height;
      const offCtx = offCanvas.getContext("2d");

      // Draw the transparent strokes
      offCtx.drawImage(img, 0, 0);

      // Force all strokes to be black (to handle white ink from dark mode perfectly)
      offCtx.globalCompositeOperation = "source-in";
      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

      // Add a white background behind the black strokes
      offCtx.globalCompositeOperation = "destination-over";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

      const processedDataUrl = offCanvas.toDataURL("image/png");

      setIsRecognizing(true);
      try {
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(processedDataUrl, ocrLanguage, {
          // psm 4 = Assume a single column of text of variable sizes (better for cursive lines)
          tessedit_pageseg_mode: 4,
        });
        setLiveText(data.text.trim());
      } catch (err) {
        console.error("Live OCR failed:", err);
      } finally {
        setIsRecognizing(false);
      }
    };
    img.src = dataUrl;
  }, [ocrLanguage]);

  // Trigger OCR 1.5s after the user stops drawing
  useEffect(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      if (ocrTimeoutRef.current) clearTimeout(ocrTimeoutRef.current);
      ocrTimeoutRef.current = setTimeout(() => {
        runLiveOCR(history[historyIndex]);
      }, 1500);
    }
  }, [historyIndex, history, runLiveOCR]);

  /* ─── Drawing & Panning ─── */
  const getPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      if (tool === "pan") {
        setIsPanning(true);
        const touch = e.touches ? e.touches[0] : e;
        panStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          scrollLeft: containerRef.current?.scrollLeft || 0,
          scrollTop: containerRef.current?.scrollTop || 0,
        };
        return;
      }

      const ctx = contextRef.current;
      if (!ctx) return;

      const { x, y } = getPosition(e);

      ctx.beginPath();
      ctx.moveTo(x, y);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidth * 6; // Thicker eraser
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
      }

      setIsDrawing(true);
    },
    [tool, strokeColor, strokeWidth, getPosition]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (isPanning && containerRef.current) {
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - panStartRef.current.x;
        const dy = touch.clientY - panStartRef.current.y;
        containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
        containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
        return;
      }

      if (!isDrawing) return;
      e.preventDefault();
      const ctx = contextRef.current;
      if (!ctx) return;

      const { x, y } = getPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, isPanning, getPosition]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (!isDrawing) return;
      e?.preventDefault();
      const ctx = contextRef.current;
      if (!ctx) return;
      ctx.closePath();
      ctx.globalCompositeOperation = "source-over";
      setIsDrawing(false);
      saveState();
    },
    [isDrawing, isPanning, saveState]
  );

  /* ─── Actions ─── */
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    restoreState(newIndex);
  }, [historyIndex, restoreState]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    restoreState(newIndex);
  }, [historyIndex, history.length, restoreState]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    saveState();
  }, [saveState]);

  const handleExportPDF = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originalWidth = 800;
    const originalHeight = 1600;
    const dpr = window.devicePixelRatio || 1;

    // 1. Create an offscreen canvas to composite the background and strokes
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");

    // 2. Draw Theme Background Color
    ctx.fillStyle = themesData[theme].bg;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 3. Draw Ruled Lines
    if (theme.includes("ruled")) {
      const lineSpacing = 32 * dpr;
      
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = theme.startsWith("dark") ? "#2a2a3e" : "#e5e5f0";
      
      for (let y = 40 * dpr; y < exportCanvas.height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(exportCanvas.width, y);
        ctx.stroke();
      }

      // Draw Red Margin
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "rgba(255, 118, 117, 0.5)"; // #ff7675 with opacity
      ctx.beginPath();
      ctx.moveTo(60 * dpr, 0);
      ctx.lineTo(60 * dpr, exportCanvas.height);
      ctx.stroke();
    }

    // 4. Draw User Strokes
    ctx.drawImage(canvas, 0, 0);

    // 5. Convert to Image and add to jsPDF
    const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.95);
    
    try {
      // Safely import jsPDF in Next.js
      const jsPDFModule = await import("jspdf");
      const JsPDFClass = jsPDFModule.default ? (jsPDFModule.default.jsPDF || jsPDFModule.default) : jsPDFModule.jsPDF;
      
      // 1px = 0.75pt (assuming 96 DPI)
      const pdfWidthPt = originalWidth * 0.75;
      const pdfHeightPt = originalHeight * 0.75;

      const pdf = new JsPDFClass({
        orientation: "portrait",
        unit: "pt",
        format: [pdfWidthPt, pdfHeightPt]
      });
      
      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidthPt, pdfHeightPt);
      pdf.save(`inkly-handwriting-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Error generating PDF. Please try again.");
    }
  }, [theme, themesData]);

  const widths = [1, 2, 3, 5, 8];

  const toolBtnStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: "var(--radius-sm)",
    background: active ? "var(--accent)" : "var(--surface)",
    color: active ? "#fff" : "var(--text-secondary)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
    transition: "all 0.15s ease",
  });

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* ─── Toolbar ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-toolbar)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Tools */}
        <button style={toolBtnStyle(tool === "pan")} onClick={() => setTool("pan")}>
          🖐️ Pan
        </button>
        <button style={toolBtnStyle(tool === "pen")} onClick={() => setTool("pen")}>
          ✏️ Pen
        </button>
        <button style={toolBtnStyle(tool === "eraser")} onClick={() => setTool("eraser")}>
          🧹 Eraser
        </button>

        <div className="toolbar-divider" />

        {/* Stroke Width */}
        {widths.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            style={{
              ...toolBtnStyle(strokeWidth === w),
              width: "32px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={`Width: ${w}px`}
          >
            <span
              style={{
                display: "block",
                width: Math.min(w * 3, 20),
                height: Math.min(w * 3, 20),
                borderRadius: "50%",
                background: strokeWidth === w ? "#fff" : "var(--text-secondary)",
              }}
            />
          </button>
        ))}

        <div className="toolbar-divider" />

        {/* Color */}
        <input
          type="color"
          className="color-picker-input"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          title="Pen Color"
        />

        <div className="toolbar-divider" />

        {/* Actions */}
        <button
          style={toolBtnStyle(false)}
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          ↺
        </button>
        <button
          style={toolBtnStyle(false)}
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          ↻
        </button>
        <button style={toolBtnStyle(false)} onClick={handleClear} title="Clear All">
          🗑️
        </button>

        <div className="toolbar-divider" />

        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            ...toolBtnStyle(false),
            appearance: "none",
            paddingRight: "24px",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239090a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="light-ruled">Light (Ruled)</option>
          <option value="light-blank">Light (Blank)</option>
          <option value="dark-ruled">Dark (Ruled)</option>
          <option value="dark-blank">Dark (Blank)</option>
        </select>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleExportPDF}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #6c5ce7, #7c6ef7)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              boxShadow: "0 2px 10px rgba(108, 92, 231, 0.3)",
              transition: "all 0.15s ease",
            }}
          >
            📄 Save as PDF
          </button>
        </div>
      </div>

      {/* ─── Canvas Viewport (Scrollable Book Page) ─── */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          overflow: "auto",
          background: "var(--bg-primary)", // Darker desk background behind the page
          padding: "40px",
        }}
      >
        <div
          style={{
            position: "relative",
            margin: "0 auto",
            width: "800px",
            height: "1600px",
            background: themesData[theme].bg,
            backgroundImage: themesData[theme].lines,
            backgroundPosition: "0 40px",
            boxShadow: themesData[theme].dropShadow ? "0 8px 30px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.4)" : "none",
            borderRadius: "4px",
            cursor: tool === "pan" ? (isPanning ? "grabbing" : "grab") : tool === "eraser" ? "cell" : "crosshair",
            touchAction: tool === "pan" ? "auto" : "none",
            transition: "background 0.3s ease",
          }}
        >
          {/* Edge binding simulation (left margin line) */}
          {theme.includes("ruled") && (
            <div
              style={{
                position: "absolute",
                left: "60px",
                top: 0,
                bottom: 0,
                width: "2px",
                background: "#ff7675", // Red margin line
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
          )}

          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              position: "relative",
              zIndex: 10,
            }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>
      </div>

      {/* ─── Live Text Recognition Area ─── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "14px 18px",
          background: "var(--bg-elevated)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              ✨ Live Text Recognition
            </h3>
            <select
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value)}
              style={{
                ...toolBtnStyle(false),
                padding: "2px 24px 2px 8px",
                fontSize: "0.75rem",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%239090a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 6px center",
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {isRecognizing ? "⏳ Analyzing strokes..." : "Auto-updates when you stop drawing"}
          </span>
        </div>
        <textarea
          value={liveText}
          onChange={(e) => setLiveText(e.target.value)}
          placeholder="Draw on the canvas above, and the recognized text will appear here automatically..."
          style={{
            width: "100%",
            minHeight: "80px",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            fontFamily: "var(--font-inter)",
            resize: "vertical",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
    </div>
  );
}
