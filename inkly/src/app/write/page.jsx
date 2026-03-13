"use client";

/**
 * @purpose: Main writing page for Inkly — the core rich text editing experience.
 * @features: Tiptap editor with full typography toolbar, draggable multimedia canvas,
 *            safe HTML preview panel, PDF export, inline image insertion, dark theme.
 * @params: None (page component).
 */

import { useState, useCallback } from "react";
import Editor from "@/components/Editor";
import DraggableMedia from "@/components/DraggableMedia";
import ExportPDF from "@/components/ExportPDF";

export default function WritePage() {
  const [htmlOutput, setHtmlOutput] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleEditorUpdate = useCallback((sanitizedHTML) => {
    setHtmlOutput(sanitizedHTML);
  }, []);

  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        minHeight: "100vh",
      }}
    >
      {/* ─── Header ─── */}
      <header
        className="animate-fade-in"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            Inkly
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              margin: "4px 0 0",
            }}
          >
            Write beautifully. Format freely.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <ExportPDF htmlContent={htmlOutput} />
          <button
            onClick={() => setShowPreview((p) => !p)}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-sm)",
              background: showPreview ? "var(--accent)" : "var(--surface)",
              color: showPreview ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            {showPreview ? "✦ Hide Preview" : "✦ Show Preview"}
          </button>
        </div>
      </header>

      {/* ─── Editor ─── */}
      <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Editor onUpdate={handleEditorUpdate} />
      </section>

      {/* ─── Draggable Media Canvas ─── */}
      <section
        className="animate-fade-in"
        style={{
          marginTop: "1.5rem",
          animationDelay: "0.2s",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            📎 Media Canvas
          </h2>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              margin: "2px 0 0",
            }}
          >
            Absolute-positioned images and videos — drag to arrange freely
          </p>
        </div>
        <DraggableMedia
          mediaItems={mediaItems}
          setMediaItems={setMediaItems}
        />
      </section>

      {/* ─── Safe HTML Preview ─── */}
      {showPreview && htmlOutput && (
        <section
          className="animate-fade-in"
          style={{
            marginTop: "1.5rem",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              🔒 Safe HTML Preview
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--success)",
                fontWeight: 500,
              }}
            >
              ✓ Sanitized with DOMPurify
            </span>
          </div>
          <pre
            style={{
              padding: "1rem 1.25rem",
              margin: 0,
              fontSize: "0.82rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {htmlOutput}
          </pre>
        </section>
      )}
    </main>
  );
}
