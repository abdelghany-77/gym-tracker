import { useState, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Film,
  Layers,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import ImageLightbox from "./ImageLightbox";
import { getExerciseMediaInfo } from "../utils/imageUtil";

/**
 * Active Workout Side-by-Side Visual Guide:
 * Left: Interactive Image Slider (Anatomical Target Plate <-> Start/Peak Form Reference) with swipe & zoom.
 * Right: Continuous Movement Video (offline-ready verified MP4) + Pro Coach Form Breakdown reference.
 */
export default function ActiveExerciseMediaPanel({
  exercise,
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevExerciseId, setPrevExerciseId] = useState(exercise?.id);
  const [lightboxSlide, setLightboxSlide] = useState(null);
  const [failedSrcs, setFailedSrcs] = useState({});
  const touchStartX = useRef(null);

  if (exercise?.id !== prevExerciseId) {
    setPrevExerciseId(exercise?.id);
    setSlideIndex(0);
    setLightboxSlide(null);
  }

  const media = useMemo(() => getExerciseMediaInfo(exercise), [exercise]);

  const slides = useMemo(() => {
    const list = [];
    if (media.anatomyUrl && !failedSrcs[media.anatomyUrl]) {
      list.push({
        id: "anatomy",
        label: "Targeted Anatomy",
        labelAr: "التشريح والعضلة",
        src: media.anatomyUrl,
        alt: `${exercise?.name || "Exercise"} anatomical target muscles`,
      });
    }
    if (media.fallbackImageUrl && !failedSrcs[media.fallbackImageUrl]) {
      list.push({
        id: "form",
        label: "Start / Peak Form",
        labelAr: "وضعية البداية والنهاية",
        src: media.fallbackImageUrl,
        alt: `${exercise?.name || "Exercise"} start and peak form reference`,
      });
    }
    return list;
  }, [media.anatomyUrl, media.fallbackImageUrl, failedSrcs, exercise?.name]);

  if (!exercise) return null;

  const safeIndex = slides.length > 0 ? slideIndex % slides.length : 0;
  const activeSlide = slides[safeIndex] || null;

  const goPrev = () => {
    if (slides.length < 2) return;
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (slides.length < 2) return;
    setSlideIndex((i) => (i + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const proCoachUrl =
    exercise.video ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${exercise.name} proper form technique tutorial Jeff Nippard OR Renaissance Periodization`,
    )}`;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b0f17] overflow-hidden">
      {/* Compact Header Toggle */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <Layers size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
          <span className="font-medium text-slate-200 truncate">
            Visual Guide
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {media.hasVerifiedDualMedia
              ? "· Anatomy Slider + Movement Video"
              : "· Form Slider + Pro Video"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          {expanded ? (
            <>
              Hide <ChevronUp size={13} aria-hidden="true" />
            </>
          ) : (
            <>
              Show <ChevronDown size={13} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-2.5 space-y-2.5">
          {/* Side-by-Side: Image Slider (Left) + Continuous Video (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch">
            {/* LEFT: Interactive Image Slider */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-[#0b0f17] overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-900/50 text-[11px]">
                <span className="font-medium text-slate-200 truncate">
                  {activeSlide
                    ? `${safeIndex + 1}/${slides.length} · ${activeSlide.label}`
                    : "Visual Reference"}
                </span>
                {slides.length > 1 && (
                  <div className="flex items-center gap-1 shrink-0">
                    {slides.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSlideIndex(idx)}
                        aria-label={`Show ${s.label} slide`}
                        aria-pressed={idx === safeIndex}
                        className={`h-2 rounded-full transition-all ${
                          idx === safeIndex
                            ? "w-5 bg-slate-200"
                            : "w-2 bg-slate-600 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative aspect-[4/3] w-full bg-[#0b0f17] flex items-center justify-center overflow-hidden select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {activeSlide ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setLightboxSlide(activeSlide)}
                      aria-label={`Zoom ${activeSlide.label}`}
                      className="group relative h-full w-full flex items-center justify-center focus:outline-none"
                    >
                      <img
                        src={activeSlide.src}
                        alt={activeSlide.alt}
                        className="h-full w-full object-contain"
                        loading="eager"
                        decoding="async"
                        onError={() =>
                          setFailedSrcs((prev) => ({
                            ...prev,
                            [activeSlide.src]: true,
                          }))
                        }
                      />
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-slate-200 opacity-85 group-hover:opacity-100">
                        <ZoomIn size={11} aria-hidden="true" /> Zoom
                      </span>
                    </button>

                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          aria-label="Previous image slide"
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/85 text-white hover:bg-slate-800 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          aria-label="Next image slide"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/85 text-white hover:bg-slate-800 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
                    <ImageOff size={22} aria-hidden="true" />
                    <span className="text-xs">Reference image unavailable</span>
                  </div>
                )}
              </div>

              {/* Primary / Secondary Anatomical Color Legend */}
              <div className="border-t border-slate-800/80 bg-slate-900/60 px-2.5 py-2 space-y-1 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#dc2626]"
                    aria-hidden="true"
                  />
                  <span className="text-slate-200 leading-snug">
                    <strong className="text-white">Primary:</strong>{" "}
                    {exercise.primaryTarget || exercise.muscle}
                  </span>
                </div>
                {exercise.secondaryMuscles?.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d97706]"
                      aria-hidden="true"
                    />
                    <span className="text-slate-400 leading-snug truncate">
                      <strong className="text-slate-300">Secondary:</strong>{" "}
                      {exercise.secondaryMuscles.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Continuous Movement Video + Pro Coach Link */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0b0f17] overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-900/50 text-[11px]">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <Film size={12} className="text-slate-400" aria-hidden="true" />
                  Movement Video
                </span>
                <span className="text-[10px] text-slate-400">
                  {media.videoUrl ? "Offline Loop" : "Coach Guide"}
                </span>
              </div>

              {media.videoUrl ? (
                <div className="flex-1 flex flex-col">
                  <ExerciseVideoPlayer
                    src={media.videoUrl}
                    poster={media.anatomyUrl || media.fallbackImageUrl}
                    exerciseName={exercise.name}
                    attribution={media.video.attribution}
                    license={media.video.license}
                    durationSec={media.video.durationSec}
                    className="rounded-none border-0 flex-1"
                  />
                  <div className="border-t border-slate-800/80 bg-slate-900/60 px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 truncate">
                      Want full coaching cues?
                    </span>
                    <a
                      href={proCoachUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-white shrink-0"
                    >
                      Pro Coach Video
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-5 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                    <Film size={20} aria-hidden="true" />
                  </div>
                  <div className="space-y-1 max-w-[240px]">
                    <p className="text-xs font-medium text-slate-200">
                      Offline loop pending audit
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Watch a verified pro coach form breakdown for exact
                      technique and tempo.
                    </p>
                  </div>
                  <a
                    href={proCoachUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-white transition-colors"
                  >
                    Pro Coach Form Video
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxSlide && (
        <ImageLightbox
          src={lightboxSlide.src}
          alt={lightboxSlide.alt}
          isOpen={Boolean(lightboxSlide)}
          onClose={() => setLightboxSlide(null)}
        />
      )}
    </div>
  );
}
