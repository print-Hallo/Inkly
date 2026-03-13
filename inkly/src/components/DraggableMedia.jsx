"use client";

/**
 * @purpose: Draggable multimedia canvas for absolute-positioned images and videos.
 * @features: Add images/videos via URL, drag to reposition, resize handles,
 *            delete button, touch-friendly, absolute positioning on a canvas area.
 * @params: {Array} mediaItems - Array of media objects with id, type, src, x, y, width, height.
 *          {Function} setMediaItems - State setter to update media items.
 */

import { useState, useCallback, useRef } from "react";

export default function DraggableMedia({ mediaItems, setMediaItems }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  /* ─── Drag Handlers ─── */
  const onMouseDown = useCallback(
    (e, id) => {
      if (e.target.classList.contains("resize-handle") || e.target.classList.contains("delete-btn"))
        return;
      e.preventDefault();
      const item = mediaItems.find((m) => m.id === id);
      if (!item) return;
      dragOffset.current = {
        x: e.clientX - item.x,
        y: e.clientY - item.y,
      };
      setDragging(id);
    },
    [mediaItems]
  );

  const onMouseMove = useCallback(
    (e) => {
      if (dragging !== null) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        // Constrain to container
        newX = Math.max(0, Math.min(newX, rect.width - 50));
        newY = Math.max(0, Math.min(newY, rect.height - 50));
        setMediaItems((prev) =>
          prev.map((m) => (m.id === dragging ? { ...m, x: newX, y: newY } : m))
        );
      }
      if (resizing !== null) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const newW = Math.max(80, resizeStart.current.w + dx);
        const newH = Math.max(60, resizeStart.current.h + dy);
        setMediaItems((prev) =>
          prev.map((m) =>
            m.id === resizing ? { ...m, width: newW, height: newH } : m
          )
        );
      }
    },
    [dragging, resizing, setMediaItems]
  );

  const onMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  const onResizeStart = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const item = mediaItems.find((m) => m.id === id);
    if (!item) return;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: item.width,
      h: item.height,
    };
    setResizing(id);
  }, [mediaItems]);

  const deleteItem = useCallback(
    (id) => {
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
    },
    [setMediaItems]
  );

  const addMedia = useCallback(
    (type) => {
      const url = prompt(
        `Enter ${type} URL:`,
        type === "image"
          ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400"
          : "https://www.w3schools.com/html/mov_bbb.mp4"
      );
      if (!url) return;
      setMediaItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          type,
          src: url,
          x: 20 + Math.random() * 100,
          y: 20 + Math.random() * 60,
          width: type === "image" ? 280 : 360,
          height: type === "image" ? 200 : 220,
        },
      ]);
    },
    [setMediaItems]
  );

  return (
    <div>
      {/* ─── Add Media Controls ─── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => addMedia("image")}
          style={{
            padding: "6px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--accent)";
            e.target.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--surface)";
            e.target.style.borderColor = "var(--border)";
          }}
        >
          🖼 Add Image
        </button>
        <button
          onClick={() => addMedia("video")}
          style={{
            padding: "6px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--accent)";
            e.target.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--surface)";
            e.target.style.borderColor = "var(--border)";
          }}
        >
          🎬 Add Video
        </button>
        {mediaItems.length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              alignSelf: "center",
            }}
          >
            {mediaItems.length} item{mediaItems.length !== 1 ? "s" : ""} · Drag
            to reposition
          </span>
        )}
      </div>

      {/* ─── Canvas ─── */}
      <div
        ref={containerRef}
        className="draggable-media-container"
        style={{
          minHeight: mediaItems.length === 0 ? "120px" : "350px",
          background:
            mediaItems.length === 0
              ? "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(46,46,62,0.3) 10px, rgba(46,46,62,0.3) 11px)"
              : "transparent",
          transition: "min-height 0.3s ease",
          position: "relative",
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {mediaItems.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              pointerEvents: "none",
            }}
          >
            Add images or videos to position them freely on the canvas
          </div>
        )}

        {mediaItems.map((item) => (
          <div
            key={item.id}
            className={`draggable-media-item${
              dragging === item.id ? " is-dragging" : ""
            }`}
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
            }}
            onMouseDown={(e) => onMouseDown(e, item.id)}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt="Media"
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                  pointerEvents: "none",
                }}
              />
            ) : (
              <video
                src={item.src}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                }}
              />
            )}
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              title="Remove"
            >
              ✕
            </button>
            <div
              className="resize-handle"
              onMouseDown={(e) => onResizeStart(e, item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
