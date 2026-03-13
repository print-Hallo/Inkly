"use client";

/**
 * @purpose: OCR component that extracts text from uploaded manuscript/handwriting images.
 * @features: Image upload with preview, Tesseract.js OCR with progress indicator,
 *            language selection, editable output text, copy-to-clipboard.
 * @params: None (self-contained component).
 */

import { useState, useCallback, useRef } from "react";

export default function ManuscriptOCR() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const fileInputRef = useRef(null);

  const languages = [
    { code: "eng", label: "English" },
    { code: "fra", label: "French" },
    { code: "spa", label: "Spanish" },
    { code: "deu", label: "German" },
    { code: "ara", label: "Arabic" },
    { code: "chi_sim", label: "Chinese (Simplified)" },
    { code: "jpn", label: "Japanese" },
  ];

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    setImage(file);
    setExtractedText("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleRecognize = useCallback(async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressLabel("Preparing image...");
    setExtractedText("");

    try {
      let ocrSource = image;
      if (invertColors) {
        ocrSource = await new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.filter = "invert(1)";
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.src = URL.createObjectURL(image);
        });
      }

      setProgressLabel("Loading OCR engine...");
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(ocrSource, language, {
        logger: (m) => {
          if (m.status) {
            setProgressLabel(m.status);
          }
          if (typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setExtractedText(data.text);
      setProgressLabel("Done!");
    } catch (error) {
      console.error("OCR failed:", error);
      alert("Text recognition failed. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  }, [image, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [extractedText]);

  const handleClear = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setExtractedText("");
    setProgress(0);
    setProgressLabel("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const btnStyle = {
    padding: "8px 18px",
    borderRadius: "var(--radius-sm)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    transition: "all 0.15s ease",
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
          📝 Manuscript → Text
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
          Upload a handwritten manuscript or note — AI will extract the text for you
        </p>
      </div>

      {/* ─── Controls ─── */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...btnStyle,
            background: "linear-gradient(135deg, #6c5ce7, #7c6ef7)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 10px rgba(108, 92, 231, 0.3)",
          }}
        >
          📤 Upload Image
        </button>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            ...btnStyle,
            appearance: "none",
            paddingRight: "30px",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239090a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleRecognize}
          disabled={!image || isProcessing}
          style={{
            ...btnStyle,
            opacity: !image || isProcessing ? 0.5 : 1,
            cursor: !image || isProcessing ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "⏳ Processing…" : "🔍 Recognize Text"}
        </button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            cursor: "pointer",
            marginLeft: "auto",
          }}
          title="Invert colors if your image has light text on a dark background"
        >
          <input
            type="checkbox"
            checked={invertColors}
            onChange={(e) => setInvertColors(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          Invert Colors (Dark Mode Fix)
        </label>

        {image && (
          <button onClick={handleClear} style={btnStyle}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ─── Progress ─── */}
      {isProcessing && (
        <div style={{ padding: "0 18px 14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            <span>{progressLabel}</span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "var(--surface)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6c5ce7, #a29bfe)",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Content Area ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: imagePreview && extractedText ? "1fr 1fr" : "1fr",
          gap: 0,
          minHeight: "200px",
        }}
      >
        {/* Image Preview */}
        {imagePreview && (
          <div
            style={{
              padding: "14px 18px",
              borderRight: extractedText ? "1px solid var(--border)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-elevated)",
            }}
          >
            <img
              src={imagePreview}
              alt="Uploaded manuscript"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "var(--radius-md)",
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <div style={{ padding: "14px 18px", position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Extracted Text
              </span>
              <button
                onClick={handleCopy}
                style={{
                  ...btnStyle,
                  padding: "4px 12px",
                  fontSize: "0.78rem",
                  background: copied ? "var(--success)" : "var(--surface)",
                  color: copied ? "#fff" : "var(--text-secondary)",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              style={{
                width: "100%",
                minHeight: "300px",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                fontFamily: "var(--font-inter)",
                resize: "vertical",
                outline: "none",
              }}
              placeholder="Recognized text will appear here..."
            />
          </div>
        )}

        {/* Empty State */}
        {!imagePreview && !extractedText && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem",
              color: "var(--text-muted)",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>📄</span>
            <span style={{ fontSize: "0.9rem" }}>
              Upload a manuscript image to extract text
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
