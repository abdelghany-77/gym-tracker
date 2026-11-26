import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Film } from "lucide-react";

const SPEEDS = [0.75, 1, 1.5];

/**
 * Calm, accessible continuous movement video player for verified exercise loops.
 * Respects prefers-reduced-motion (does not auto-play when reduced motion is active).
 * Supports `compact` mode for tight active-workout cards while keeping full controls for detail modals.
 */
export default function ExerciseVideoPlayer({
  src,
  poster,
  exerciseName,
  attribution,
  license,
  durationSec,
  compact = false,
  className = "",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSec || 0);
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  if (src !== prevSrc) {
    setPrevSrc(src);
    setFailed(false);
    setCurrentTime(0);
    setSpeed(1);
    setDuration(durationSec || 0);
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = 1;
    if (!reducedMotion) {
      const playPromise = el.play?.();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      el.pause?.();
    }
  }, [src, reducedMotion]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      const p = el.play?.();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    } else {
      el.pause?.();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    setCurrentTime(0);
    if (el.paused) {
      const p = el.play?.();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleSpeedChange = (nextSpeed) => {
    setSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    handleSpeedChange(next);
  };

  const handleScrub = (e) => {
    const next = Number(e.target.value);
    setCurrentTime(next);
    if (videoRef.current) {
      videoRef.current.currentTime = next;
    }
  };

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#0b0f17] p-4 text-center text-slate-400 ${className}`}
      >
        <Film size={20} aria-hidden="true" />
        <span className="text-[11px] font-medium">
          Movement video unavailable offline
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden bg-[#0b0f17] ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`${exerciseName} movement demonstration video`}
          className="h-full w-full object-contain cursor-pointer"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) {
              setDuration(e.currentTarget.duration);
            }
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onError={() => setFailed(true)}
        />

        {/* Slim floating controls bar */}
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Playback speed ${speed}x, tap to change`}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/85 px-2 text-[11px] font-mono font-semibold text-slate-200 hover:bg-slate-800 transition-colors tabular-nums"
          >
            {speed}x
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying ? "Pause movement video" : "Play movement video"
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/85 text-white hover:bg-slate-800 transition-colors"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-800 bg-[#0b0f17] ${className}`}
    >
      <div className="relative aspect-[4/3] w-full bg-[#0b0f17] flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`${exerciseName} movement demonstration video`}
          className="h-full w-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) {
              setDuration(e.currentTarget.duration);
            }
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onError={() => setFailed(true)}
        />
      </div>

      {/* Controls bar (44px accessible touch targets) */}
      <div className="border-t border-slate-800/90 bg-slate-900/80 px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying ? "Pause movement video" : "Play movement video"
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            aria-label="Restart movement loop"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          <input
            type="range"
            min={0}
            max={duration || 4.5}
            step={0.05}
            value={Math.min(currentTime, duration || 4.5)}
            onChange={handleScrub}
            aria-label="Scrub movement timeline"
            className="h-2 flex-1 cursor-pointer accent-slate-200"
          />

          <span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-400 tabular-nums">
            {currentTime.toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800/80 p-0.5"
            role="group"
            aria-label="Playback speed"
          >
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                aria-pressed={speed === s}
                className={`min-h-8 rounded-md px-2.5 text-[11px] font-medium tabular-nums transition-colors ${
                  speed === s
                    ? "bg-slate-200 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {(attribution || license) && (
            <span className="truncate text-[10px] text-slate-500">
              {attribution || license}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
