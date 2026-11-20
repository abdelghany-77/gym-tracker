import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { isNativePlatform, isStandalonePWA } from "../utils/notificationService";

export default function PWAInstallButton({ compact = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    () => isNativePlatform() || isStandalonePWA(),
  );
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    if (installed) return undefined;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [installed]);

  if (installed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={`min-h-10 rounded-xl bg-slate-100 text-slate-950 font-semibold hover:bg-white transition-colors inline-flex items-center justify-center gap-2 ${
          compact ? "w-full px-3 text-xs" : "px-3.5 text-xs"
        }`}
      >
        <Download size={14} aria-hidden="true" />
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`min-h-10 rounded-xl border border-slate-700 bg-bg-deep text-slate-200 font-semibold hover:border-slate-500 transition-colors inline-flex items-center justify-center gap-2 ${
            compact ? "w-full px-3 text-xs" : "px-3.5 text-xs"
          }`}
        >
          <Share size={14} aria-hidden="true" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-700 bg-bg-surface p-5 space-y-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Install on iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install guide"
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> button
                in Safari.
                <br />
                2. Select{" "}
                <strong className="text-white">Add to Home Screen</strong> for
                offline access and background notifications.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="min-h-10 w-full rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
