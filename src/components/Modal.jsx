import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Shared Modal component with consistent animations, backdrop, and focus trap.
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
      } justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div
        ref={modalRef}
        className={`bg-surface-elevated rounded-2xl border border-border w-full ${maxWidth} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && (
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                {titleIcon}
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary ml-auto"
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
 * Shared ConfirmDialog with cohesive button styling.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  const variantStyles = {
    danger:
      "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25",
    warning:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25",
    default:
      "bg-accent text-slate-950 font-bold hover:bg-accent-light",
    success:
      "bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
      <div className="p-5 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 font-medium transition-colors text-xs border border-border active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors active:scale-[0.98] ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
