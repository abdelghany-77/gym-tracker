import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, RotateCcw } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SCALE = 2.5;

/**
 * Full-screen exercise image viewer.
 * Pinch-to-zoom (touch), double-tap zoom, mouse-wheel zoom (1x–3x),
 * pan/drag while zoomed, close button + backdrop tap to dismiss.
 */
export default function ImageLightbox({ src, alt = "", isOpen, onClose }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const pinchRef = useRef(null);
  const dragRef = useRef(null);
  const lastTapRef = useRef(0);

  const clampScale = useCallback(
    (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s)),
    [],
  );

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Reset the view whenever the viewer (re)opens — render-time state adjustment
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  // Lock body scroll + Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen || !src) return null;

  const toggleDoubleTapZoom = () => {
    if (scale > MIN_SCALE) {
      resetView();
    } else {
      setScale(clampScale(DOUBLE_TAP_SCALE));
    }
  };

  const onTouchStart = (event) => {
    if (event.touches.length === 2) {
      const [a, b] = event.touches;
      pinchRef.current = {
        dist: Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)),
        scale,
      };
      dragRef.current = null;
    } else if (event.touches.length === 1) {
      const touch = event.touches[0];
      dragRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        ox: offset.x,
        oy: offset.y,
        moved: false,
      };
      pinchRef.current = null;
    }
  };

  const onTouchMove = (event) => {
    if (event.touches.length === 2 && pinchRef.current) {
      const [a, b] = event.touches;
      const dist = Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY));
      const nextScale = clampScale(pinchRef.current.scale * (dist / pinchRef.current.dist));
      setScale(nextScale);
      if (nextScale <= MIN_SCALE) setOffset({ x: 0, y: 0 });
      event.preventDefault();
    } else if (event.touches.length === 1 && dragRef.current && scale > MIN_SCALE) {
      const touch = event.touches[0];
      const dx = touch.clientX - dragRef.current.x;
      const dy = touch.clientY - dragRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragRef.current.moved = true;
        setDragging(true);
        setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
      }
      event.preventDefault();
    }
  };

  const onTouchEnd = (event) => {
    const wasPinch = pinchRef.current !== null;
    const drag = dragRef.current;
    pinchRef.current = null;
    dragRef.current = null;
    setDragging(false);

    if (wasPinch) return;
    if (event.touches.length > 0) return;

    // A still single tap on the image: detect double-tap to toggle zoom
    if (drag && !drag.moved) {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        lastTapRef.current = 0;
        toggleDoubleTapZoom();
      } else {
        lastTapRef.current = now;
      }
    }
  };

  const onWheel = (event) => {
    const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    const nextScale = clampScale(scale * factor);
    setScale(nextScale);
    if (nextScale <= MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  const onBackdropClick = (event) => {
    // Only a direct tap on the dark backdrop (not the image) dismisses.
    if (event.target === event.currentTarget) close();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Exercise image viewer"}
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm animate-fadeIn flex items-center justify-center"
      onClick={onBackdropClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      style={{ touchAction: "none" }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={close}
        style={{ top: "calc(1rem + var(--safe-top))" }}
        className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
        aria-label="Close image viewer"
      >
        <X size={20} />
      </button>

      {/* Reset zoom (visible while zoomed) */}
      {scale > MIN_SCALE && (
        <button
          type="button"
          onClick={resetView}
          style={{ top: "calc(1rem + var(--safe-top))" }}
          className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
          aria-label="Reset zoom"
        >
          <RotateCcw size={18} />
        </button>
      )}

      {/* The zoomable image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-w-[92vw] max-h-[80dvh] w-auto h-auto object-contain select-none rounded-xl"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
          cursor: scale > MIN_SCALE ? "grab" : "default",
          touchAction: "none",
        }}
      />

      {/* Zoom hint */}
      <p
        style={{ bottom: "calc(1.5rem + var(--safe-bottom))" }}
        className="absolute left-1/2 -translate-x-1/2 w-full max-w-xs text-[11px] text-white/60 font-medium text-center px-4"
      >
        Pinch or double-tap to zoom · Drag to pan
      </p>
    </div>,
    document.body,
  );
}
