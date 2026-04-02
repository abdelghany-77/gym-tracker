import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => { setIsOffline(true); setDismissed(false); };
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[90] animate-slideDown">
      <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20 px-4 py-2 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <WifiOff size={14} className="text-amber-400" />
          <p className="text-[11px] text-amber-400 font-medium">
            You&apos;re offline — data is saved locally
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors px-2"
          aria-label="Dismiss offline notice"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
