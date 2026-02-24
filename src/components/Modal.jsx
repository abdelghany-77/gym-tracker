import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Shared Modal component with consistent animations, backdrop, and focus trap.
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} [title] - Optional header title
 * @param {React.ReactNode} [titleIcon] - Optional icon next to title
 * @param {React.ReactNode} children - Modal content
 * @param {string} [maxWidth] - Tailwind max-width class (default "max-w-sm")
 * @param {boolean} [showClose] - Show close X button (default true)
 * @param {string} [position] - "center" | "bottom" (default "center")
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  maxWidth = "max-w-sm",
  showClose = true,
  position = "center",
}) {
  const modalRef = useRef(null);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableEls = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    const handleTab = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleTab);
    first?.focus();

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        position === "bottom" ? "items-end sm:items-center" : "items-center"
      } justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div
        ref={modalRef}
        className={`bg-slate-900 rounded-2xl border border-slate-700 w-full ${maxWidth} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            {title && (
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                {titleIcon}
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-400 hover:text-white ml-auto"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

/**
 * Shared ConfirmDialog built on Modal.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title
 * @param {string} description
 * @param {string} [confirmText] - Confirm button label (default "Confirm")
 * @param {string} [cancelText] - Cancel button label (default "Cancel")
 * @param {"danger"|"warning"|"default"} [variant] - Button color scheme
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  const variantStyles = {
    danger:
      "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 focus-visible:ring-red-500/50",
    warning:
      "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 focus-visible:ring-amber-500/50",
    default:
      "bg-neon-blue/20 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/30 focus-visible:ring-neon-blue/50",
    success:
      "bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 focus-visible:ring-neon-green/50",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:outline-none active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
