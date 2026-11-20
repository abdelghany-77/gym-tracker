import { useMemo } from "react";
import { ArrowLeftRight, CheckCircle2, X } from "lucide-react";
import Modal from "./Modal";
import ExerciseImage from "./ExerciseImage";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { getAngleLabel } from "../utils/angleUtils";
import { getExerciseMediaInfo } from "../utils/imageUtil";

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Side-by-side comparison modal for 2–3 exercises within the same biomechanical category.
 * Preserves the calm slate palette and allows quick slot swapping within the angle.
 */
export default function ExerciseCompareModal({
  isOpen,
  onClose,
  selectedIds = [],
  allExercises = [],
  onChangeIds,
  onOpenDetails,
}) {
  const comparedExercises = useMemo(
    () =>
      selectedIds
        .map((id) => allExercises.find((ex) => ex.id === id))
        .filter(Boolean)
        .slice(0, 3),
    [selectedIds, allExercises],
  );

  const primaryAngle = comparedExercises[0]?.targetAngle || "";
  const angleLabel = getAngleLabel(primaryAngle);

  const anglePool = useMemo(() => {
    if (!primaryAngle) return allExercises;
    const sameAngle = allExercises.filter(
      (ex) => ex.targetAngle === primaryAngle,
    );
    return sameAngle.length > 0 ? sameAngle : allExercises;
  }, [allExercises, primaryAngle]);

  const handleReplaceSlot = (slotIdx, newId) => {
    if (!onChangeIds) return;
    const next = [...selectedIds];
    next[slotIdx] = newId;
    onChangeIds(Array.from(new Set(next)));
  };

  const handleRemoveSlot = (idToRemove) => {
    if (!onChangeIds) return;
    const next = selectedIds.filter((id) => id !== idToRemove);
    if (next.length === 0) onClose();
    else onChangeIds(next);
  };

  if (!isOpen || comparedExercises.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare Alternatives"
      titleIcon={<ArrowLeftRight size={18} className="text-slate-300" />}
      maxWidth="max-w-5xl"
      position="bottom"
    >
      <div className="p-4 sm:p-6 space-y-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="text-xs text-slate-400">
            Comparing{" "}
            <span className="font-semibold text-white tabular-nums">
              {comparedExercises.length}
            </span>{" "}
            variations
            {angleLabel?.en && (
              <>
                {" · "}
                <span className="text-slate-200">{angleLabel.en}</span>
                {angleLabel.ar && (
                  <span lang="ar" className="text-slate-400">
                    {" "}
                    ({angleLabel.ar})
                  </span>
                )}
              </>
            )}
          </div>
          {comparedExercises.length < 3 &&
            anglePool.some((ex) => !selectedIds.includes(ex.id)) && (
              <button
                type="button"
                onClick={() => {
                  const nextCandidate = anglePool.find(
                    (ex) => !selectedIds.includes(ex.id),
                  );
                  if (nextCandidate && onChangeIds) {
                    onChangeIds([...selectedIds, nextCandidate.id]);
                  }
                }}
                className="min-h-10 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                + Add angle alternative
              </button>
            )}
        </div>

        <div
          className={`grid gap-4 ${
            comparedExercises.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {comparedExercises.map((ex, idx) => {
            const media = getExerciseMediaInfo(ex);
            return (
              <article
                key={ex.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-bg-surface overflow-hidden"
              >
                {/* Slot Header + Switcher */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/60 p-3">
                  <label className="sr-only" htmlFor={`compare-slot-${idx}`}>
                    Select exercise for comparison column {idx + 1}
                  </label>
                  <select
                    id={`compare-slot-${idx}`}
                    value={ex.id}
                    onChange={(e) => handleReplaceSlot(idx, e.target.value)}
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white"
                  >
                    {anglePool.map((candidate) => (
                      <option
                        key={candidate.id}
                        value={candidate.id}
                        disabled={
                          candidate.id !== ex.id &&
                          selectedIds.includes(candidate.id)
                        }
                      >
                        {candidate.name}
                      </option>
                    ))}
                  </select>
                  {comparedExercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(ex.id)}
                      aria-label={`Remove ${ex.name} from comparison`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Visual Media */}
                <div className="p-3 space-y-2.5 border-b border-slate-800/80">
                  {media.hasVerifiedDualMedia ? (
                    <div className="space-y-2">
                      <ExerciseVideoPlayer
                        src={media.videoUrl}
                        poster={media.anatomyUrl}
                        exerciseName={ex.name}
                        attribution={media.video.attribution}
                        durationSec={media.video.durationSec}
                      />
                      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0b0f17] aspect-[4/3]">
                        <img
                          src={media.anatomyUrl}
                          alt={`${ex.name} anatomical target muscles`}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <ExerciseImage
                        exercise={ex}
                        className="aspect-[2/1] w-full rounded-lg border border-slate-800 p-1.5"
                      />
                      <p className="text-[11px] text-slate-500">
                        Static reference (verified video & anatomy pending)
                      </p>
                    </div>
                  )}
                </div>

                {/* Structured Biomechanical Comparison Rows */}
                <div className="flex-1 p-3.5 space-y-3 text-xs">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {ex.name}
                    </h3>
                    {ex.nameAr && (
                      <p lang="ar" dir="rtl" className="mt-0.5 text-slate-400">
                        {ex.nameAr}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-400">
                    <span className="capitalize text-slate-200">
                      {ex.equipment || "Bodyweight"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {DIFFICULTY_LABELS[ex.difficulty] || "Intermediate"}
                    </span>
                    {media.hasVerifiedDualMedia && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          Verified Dual Media
                        </span>
                      </>
                    )}
                  </div>

                  <dl className="space-y-2 border-t border-slate-800/80 pt-2.5">
                    <div>
                      <dt className="text-[11px] font-medium text-slate-400">
                        Primary Target
                      </dt>
                      <dd className="mt-0.5 text-slate-100">
                        {ex.primaryTarget || ex.muscle}
                      </dd>
                    </div>
                    {ex.secondaryMuscles?.length > 0 && (
                      <div>
                        <dt className="text-[11px] font-medium text-slate-400">
                          Secondary Synergists
                        </dt>
                        <dd className="mt-0.5 text-slate-300">
                          {ex.secondaryMuscles.join(", ")}
                        </dd>
                      </div>
                    )}
                    {ex.jointAction && (
                      <div>
                        <dt className="text-[11px] font-medium text-slate-400">
                          Joint Action
                        </dt>
                        <dd className="mt-0.5 text-slate-300">
                          {ex.jointAction}
                        </dd>
                      </div>
                    )}
                    {ex.setupAlignment && (
                      <div>
                        <dt className="text-[11px] font-medium text-slate-400">
                          Key Setup
                        </dt>
                        <dd className="mt-0.5 text-slate-300 leading-relaxed">
                          {ex.setupAlignment}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {onOpenDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDetails(ex.id);
                      }}
                      className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
                    >
                      Open full guide
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
