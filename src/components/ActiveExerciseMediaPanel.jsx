import { useState, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Film,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import ImageLightbox from "./ImageLightbox";
import { getExerciseMediaInfo } from "../utils/imageUtil";

/**
 * Compact Active Workout Side-by-Side Visual Guide:
 * Always renders side-by-side (grid-cols-2 on mobile & desktop) so the athlete sees both
 * the anatomical image slider AND continuous movement video without pushing sets below the fold.
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
    if (Math.abs(dx) > 36) {
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
      {expanded ? (
        <div className="p-2 space-y-1.5">
          {/* Side-by-Side on ALL screen sizes: Image Slider (Left) + Continuous Video (Right) */}
          <div className="grid grid-cols-2 gap-2 items-stretch">
            {/* LEFT: Interactive Image Slider */}
            <div className="flex flex-col rounded-lg border border-slate-800/90 bg-[#0b0f17] overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-1 px-2 py-1 border-b border-slate-800/80 bg-slate-900/60 text-[10px]">
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
                        className={`h-1.5 rounded-full transition-all ${
                          idx === safeIndex
                            ? "w-3.5 bg-slate-200"
                            : "w-1.5 bg-slate-600 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative h-28 sm:h-36 lg:h-44 w-full bg-[#0b0f17] flex items-center justify-center overflow-hidden select-none"
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
                      <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-black/75 text-slate-200 opacity-85 group-hover:opacity-100">
                        <ZoomIn size={11} aria-hidden="true" />
                      </span>
                    </button>

                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          aria-label="Previous image slide"
                          className="absolute left-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/85 text-white hover:bg-slate-800 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          aria-label="Next image slide"
                          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/85 text-white hover:bg-slate-800 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 p-2 text-center text-slate-500">
                    <ImageOff size={18} aria-hidden="true" />
                    <span className="text-[10px]">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Continuous Movement Video */}
            <div className="flex flex-col rounded-lg border border-slate-800/90 bg-[#0b0f17] overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-1 px-2 py-1 border-b border-slate-800/80 bg-slate-900/60 text-[10px]">
                <span className="font-medium text-slate-200 flex items-center gap-1 truncate">
                  <Film
                    size={11}
                    className="text-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                  Video
                </span>
                <a
                  href={proCoachUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sky-400 hover:text-sky-300 shrink-0"
                  title="Watch pro coach form breakdown"
                >
                  Coach
                  <ExternalLink size={9} aria-hidden="true" />
                </a>
              </div>

              <div className="relative h-28 sm:h-36 lg:h-44 w-full bg-[#0b0f17] overflow-hidden">
                {media.videoUrl ? (
                  <ExerciseVideoPlayer
                    src={media.videoUrl}
                    poster={media.anatomyUrl || media.fallbackImageUrl}
                    exerciseName={exercise.name}
                    attribution={media.video.attribution}
                    license={media.video.license}
                    durationSec={media.video.durationSec}
                    compact
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                    <Film
                      size={18}
                      className="text-slate-500"
                      aria-hidden="true"
                    />
                    <a
                      href={proCoachUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-950 hover:bg-white transition-colors"
                    >
                      Pro Video
                      <ExternalLink size={10} aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slim 1-line Primary / Secondary Legend + Hide Button */}
          <div className="flex items-center justify-between gap-2 px-1 pt-0.5 text-[10px]">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="inline-flex items-center gap-1 text-slate-200 truncate">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#dc2626]"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {exercise.primaryTarget || exercise.muscle}
                </span>
              </span>
              {exercise.secondaryMuscles?.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 truncate">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d97706]"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {exercise.secondaryMuscles.slice(0, 2).join(", ")}
                  </span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-expanded={true}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400 hover:text-white shrink-0 py-0.5 px-1.5 rounded hover:bg-slate-800/70 transition-colors"
            >
              Hide <ChevronUp size={11} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/50 hover:bg-slate-900/80 transition-colors text-xs"
        >
          <span className="flex items-center gap-2 text-slate-300 font-medium truncate">
            <Film size={13} className="text-slate-400 shrink-0" />
            Show Anatomy Slider &amp; Movement Video
          </span>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </button>
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
