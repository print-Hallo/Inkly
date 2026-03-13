"use client";

import { useRef } from "react";

/**
 * @purpose: Floating formatting toolbar for the Tiptap editor.
 * @features: Bold, italic, underline, strikethrough, headings (H1-H3),
 *            text alignment (left/center/right), text color picker,
 *            blockquote, bullet list, ordered list, horizontal rule.
 * @params: {Object} editor - The Tiptap editor instance.
 */

export default function Toolbar({ editor }) {
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const btnClass = (name, attrs = {}) =>
    `toolbar-btn${editor.isActive(name, attrs) ? " is-active" : ""}`;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      className="animate-slide-down"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "2px",
        padding: "8px 12px",
        background: "var(--bg-toolbar)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        borderRadius: "0 0 var(--radius-md) var(--radius-md)",
      }}
    >
      {/* ─── Text Style ─── */}
      <button
        className={btnClass("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        className={btnClass("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
        style={{ fontStyle: "italic" }}
      >
        I
      </button>
      <button
        className={btnClass("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
        style={{ textDecoration: "underline" }}
      >
        U
      </button>
      <button
        className={btnClass("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
        style={{ textDecoration: "line-through" }}
      >
        S
      </button>

      <div className="toolbar-divider" />

      {/* ─── Headings ─── */}
      <button
        className={btnClass("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        title="Heading 1"
        style={{ fontSize: "0.8rem" }}
      >
        H1
      </button>
      <button
        className={btnClass("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        title="Heading 2"
        style={{ fontSize: "0.75rem" }}
      >
        H2
      </button>
      <button
        className={btnClass("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        title="Heading 3"
        style={{ fontSize: "0.7rem" }}
      >
        H3
      </button>

      <div className="toolbar-divider" />

      {/* ─── Alignment ─── */}
      <button
        className={btnClass("textAlign", { textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
      >
        ≡
      </button>
      <button
        className={btnClass("textAlign", { textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
      >
        ≡
      </button>
      <button
        className={btnClass("textAlign", { textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
      >
        ≡
      </button>

      <div className="toolbar-divider" />

      {/* ─── Lists ─── */}
      <button
        className={btnClass("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        •
      </button>
      <button
        className={btnClass("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
      >
        1.
      </button>

      <div className="toolbar-divider" />

      {/* ─── Block ─── */}
      <button
        className={btnClass("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        "
      </button>
      <button
        className={btnClass("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        {"</>"}
      </button>
      <button
        className="toolbar-btn"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        ―
      </button>

      <div className="toolbar-divider" />

      {/* ─── Color ─── */}
      <input
        type="color"
        className="color-picker-input"
        onChange={(e) =>
          editor.chain().focus().setColor(e.target.value).run()
        }
        defaultValue="#f0f0f5"
        title="Text Color"
      />

      <div className="toolbar-divider" />

      {/* ─── Image ─── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <button
        className="toolbar-btn"
        onClick={() => fileInputRef.current?.click()}
        title="Upload Image"
      >
        📷
      </button>
      <button
        className="toolbar-btn"
        onClick={() => {
          const url = prompt("Enter image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Insert Image from URL"
      >
        🖼
      </button>

      {/* ─── Undo / Redo ─── */}
      <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          style={{ opacity: editor.can().undo() ? 1 : 0.35 }}
        >
          ↺
        </button>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
          style={{ opacity: editor.can().redo() ? 1 : 0.35 }}
        >
          ↻
        </button>
      </div>
    </div>
  );
}
