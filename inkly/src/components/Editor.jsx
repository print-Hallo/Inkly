"use client";

/**
 * @purpose: Core Tiptap rich text editor component for Inkly.
 * @features: Full typography (bold, italic, underline, headings, alignment, color),
 *            smooth ProseMirror-based typing, placeholder text, safe HTML output via DOMPurify.
 * @params: {Function} onUpdate - Callback receiving sanitized HTML on every content change.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import Toolbar from "./Toolbar";

export default function Editor({ onUpdate }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing something beautiful…",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor }) => {
      const rawHTML = editor.getHTML();
      const cleanHTML = DOMPurify.sanitize(rawHTML, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "h1",
          "h2",
          "h3",
          "ul",
          "ol",
          "li",
          "blockquote",
          "code",
          "pre",
          "img",
          "hr",
          "span",
        ],
        ALLOWED_ATTR: [
          "style",
          "src",
          "alt",
          "class",
          "data-text-align",
          "href",
          "target",
        ],
      });
      onUpdate?.(cleanHTML);
    },
  });

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--border-focus)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
