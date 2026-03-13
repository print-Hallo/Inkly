"use client";

/**
 * @purpose: Handwriting page for Inkly — manual writing with iPad/mouse and manuscript OCR.
 * @features: Freehand drawing canvas with pen/eraser tools, manuscript image upload
 *            with Tesseract.js OCR for text extraction, dark themed layout.
 * @params: None (page component).
 */

import { useState } from "react";
import HandwritingCanvas from "@/components/HandwritingCanvas";
import ManuscriptOCR from "@/components/ManuscriptOCR";
import Link from "next/link";

export default function HandwritePage() {
  const [activeTab, setActiveTab] = useState("draw"); // "draw" | "ocr"

  const tabStyle = (active) => ({
    padding: "10px 24px",
    borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
    background: active ? "var(--bg-secondary)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    border: "none",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: active ? 600 : 400,
    transition: "all 0.2s ease",
  });

  return (
    <main
      style={{
        maxWidth: "1060px",
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
            Inkly — Handwrite
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              margin: "4px 0 0",
            }}
          >
            Draw with your pen, or let AI read your handwriting
          </p>
        </div>
        <Link
          href="/write"
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          ← Back to Editor
        </Link>
      </header>

      {/* ─── Tabs ─── */}
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          gap: "2px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "0",
          animationDelay: "0.05s",
        }}
      >
        <button style={tabStyle(activeTab === "draw")} onClick={() => setActiveTab("draw")}>
          ✏️ Freehand Drawing
        </button>
        <button style={tabStyle(activeTab === "ocr")} onClick={() => setActiveTab("ocr")}>
          📝 Manuscript → Text
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {activeTab === "draw" && <HandwritingCanvas />}
        {activeTab === "ocr" && <ManuscriptOCR />}
      </section>
    </main>
  );
}
