"use client";

/**
 * @purpose: PDF export button that generates a PDF from the editor's HTML content.
 * @features: Uses html2pdf.js to convert sanitized HTML to a downloadable PDF,
 *            styled to match the editor's appearance, loading state indicator.
 * @params: {String} htmlContent - The sanitized HTML string from the editor.
 */

import { useState, useCallback, useRef } from "react";

export default function ExportPDF({ htmlContent }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!htmlContent || htmlContent === "<p></p>") return;

    setIsExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Create a temporary container with print-friendly styles
      const container = document.createElement("div");
      container.innerHTML = htmlContent;
      container.style.cssText = `
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 12pt;
        line-height: 1.7;
        color: #1a1a2e;
        padding: 0;
        max-width: 100%;
      `;

      // Style headings for PDF
      container.querySelectorAll("h1").forEach((el) => {
        el.style.cssText =
          "font-size: 22pt; font-weight: 700; margin: 16pt 0 8pt; color: #1a1a2e;";
      });
      container.querySelectorAll("h2").forEach((el) => {
        el.style.cssText =
          "font-size: 17pt; font-weight: 600; margin: 14pt 0 6pt; color: #1a1a2e;";
      });
      container.querySelectorAll("h3").forEach((el) => {
        el.style.cssText =
          "font-size: 14pt; font-weight: 600; margin: 12pt 0 4pt; color: #1a1a2e;";
      });
      container.querySelectorAll("blockquote").forEach((el) => {
        el.style.cssText =
          "border-left: 3pt solid #6c5ce7; padding-left: 12pt; margin: 10pt 0; color: #444; font-style: italic;";
      });
      container.querySelectorAll("code").forEach((el) => {
        el.style.cssText =
          "background: #f0f0f5; padding: 1pt 4pt; border-radius: 3pt; font-size: 10pt;";
      });
      container.querySelectorAll("pre").forEach((el) => {
        el.style.cssText =
          "background: #f5f5fa; border: 1pt solid #e0e0e8; border-radius: 6pt; padding: 10pt; overflow-x: auto;";
      });
      container.querySelectorAll("img").forEach((el) => {
        el.style.cssText =
          "max-width: 100%; height: auto; border-radius: 6pt; margin: 8pt 0;";
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `inkly-document-${timestamp}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [htmlContent]);

  const hasContent = htmlContent && htmlContent !== "<p></p>";

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !hasContent}
      title={hasContent ? "Export as PDF" : "Write something first"}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-sm)",
        background: hasContent
          ? "linear-gradient(135deg, #6c5ce7, #7c6ef7)"
          : "var(--surface)",
        color: hasContent ? "#fff" : "var(--text-muted)",
        border: "1px solid var(--border)",
        cursor: hasContent ? "pointer" : "not-allowed",
        fontSize: "0.85rem",
        fontWeight: 500,
        transition: "all 0.2s ease",
        opacity: isExporting ? 0.7 : 1,
        boxShadow: hasContent ? "0 2px 12px rgba(108, 92, 231, 0.25)" : "none",
      }}
    >
      {isExporting ? "⏳ Exporting…" : "📄 Export PDF"}
    </button>
  );
}
