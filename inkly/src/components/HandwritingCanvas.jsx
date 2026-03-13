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
  const [tool, setTool] = useState("pen"); // "pen" | "eraser"
  const [strokeColor, setStrokeColor] = useState("#f0f0f5");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Live OCR State
  const [liveText, setLiveText] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const ocrTimeoutRef = useRef(null);

  /* ─── Initialize Canvas ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

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

      // Fill with black background
      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      
      // Draw the transparent strokes on top
      offCtx.drawImage(img, 0, 0);

      // Invert the whole canvas so we get black strokes on white background (perfect for OCR)
      offCtx.globalCompositeOperation = "difference";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

      const processedDataUrl = offCanvas.toDataURL("image/png");

      setIsRecognizing(true);
      try {
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(processedDataUrl, "eng", {
          // psm 6 = Assume a single uniform block of text
          tessedit_pageseg_mode: 6,
        });
        setLiveText(data.text.trim());
      } catch (err) {
        console.error("Live OCR failed:", err);
      } finally {
        setIsRecognizing(false);
      }
    };
    img.src = dataUrl;
  }, []);

  // Trigger OCR 1.5s after the user stops drawing
  useEffect(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      if (ocrTimeoutRef.current) clearTimeout(ocrTimeoutRef.current);
      ocrTimeoutRef.current = setTimeout(() => {
        runLiveOCR(history[historyIndex]);
      }, 1500);
    }
  }, [historyIndex, history, runLiveOCR]);

  /* ─── Drawing ─── */
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

  const startDrawing = useCallback(
    (e) => {
      e.preventDefault();
      const ctx = contextRef.current;
      if (!ctx) return;

      const { x, y } = getPosition(e);

      ctx.beginPath();
      ctx.moveTo(x, y);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidth * 4;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
      }

      setIsDrawing(true);
    },
    [tool, strokeColor, strokeWidth, getPosition]
  );

  const draw = useCallback(
    (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const ctx = contextRef.current;
      if (!ctx) return;

      const { x, y } = getPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, getPosition]
  );

  const stopDrawing = useCallback(
    (e) => {
      if (!isDrawing) return;
      e?.preventDefault();
      const ctx = contextRef.current;
      if (!ctx) return;
      ctx.closePath();
      ctx.globalCompositeOperation = "source-over";
      setIsDrawing(false);
      saveState();
    },
    [isDrawing, saveState]
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

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onExport?.(dataUrl);

    // Also trigger download
    const link = document.createElement("a");
    link.download = `inkly-handwriting-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [onExport]);

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

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleExport}
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
            💾 Save as PNG
          </button>
        </div>
      </div>

      {/* ─── Canvas ─── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
          cursor: tool === "eraser" ? "cell" : "crosshair",
          background: "#1e1e2a",
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
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
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            ✨ Live Text Recognition
          </h3>
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
