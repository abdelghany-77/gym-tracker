import { useRef, useState, useMemo } from "react";
import {
  Trophy,
  Share2,
  X,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import useWorkoutStore from "../store/workoutStore";
import { exercisesDatabase } from "../data/exercises";
import { getAngleLabel } from "../utils/angleUtils";

export default function WorkoutReceiptModal({
  isOpen,
  onClose,
  session,
  previousPRs = {},
}) {
  const storeExercises = useWorkoutStore((s) => s.exercises);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const receiptCardRef = useRef(null);

  // Exercise lookup map
  const exerciseMap = useMemo(() => {
    const map = new Map();
    exercisesDatabase.forEach((e) => map.set(e.id, e));
    (storeExercises || []).forEach((e) => map.set(e.id, e));
    return map;
  }, [storeExercises]);

  // Compute receipt metrics
  const metrics = useMemo(() => {
    if (!session) {
      return {
        title: "Workout Completed",
        dateStr: new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        durationStr: "0m",
        totalVolumeKg: 0,
        volumeTons: "0",
        totalSets: 0,
        totalReps: 0,
        newPRs: [],
        anglesHit: [],
      };
    }

    const title = session.programName || "Custom Session";
    const dateSource = session.date || session.finishedAt || session.startedAt;
    const dateStr = dateSource
      ? new Date(dateSource).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Today";

    let durationStr = "35m";
    if (session.startedAt && session.finishedAt) {
      const diffMs = new Date(session.finishedAt) - new Date(session.startedAt);
      const mins = Math.max(1, Math.round(diffMs / 60000));
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        durationStr = `${hrs}h ${remMins}m`;
      } else {
        durationStr = `${mins}m`;
      }
    }

    let totalVolumeKg = 0;
    let totalSets = 0;
    let totalReps = 0;
    const newPRs = [];
    const anglesSet = new Set();

    (session.exercises || []).forEach((exEntry) => {
      const exDef = exerciseMap.get(exEntry.exerciseId);
      if (exDef?.targetAngle) {
        anglesSet.add(exDef.targetAngle);
      }

      let maxSessionWeight = 0;
      (exEntry.sets || []).forEach((s) => {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        totalVolumeKg += w * r;
        totalSets += 1;
        totalReps += r;
        if (w > maxSessionWeight) maxSessionWeight = w;
      });

      const oldPR = Number(previousPRs[exEntry.exerciseId]) || 0;
      if (maxSessionWeight > oldPR && maxSessionWeight > 0) {
        newPRs.push({
          exerciseId: exEntry.exerciseId,
          name: exDef?.name || exEntry.exerciseId,
          newWeight: maxSessionWeight,
          oldWeight: oldPR,
          diff: oldPR > 0 ? (maxSessionWeight - oldPR).toFixed(1) : null,
        });
      }
    });

    return {
      title,
      dateStr,
      durationStr,
      totalVolumeKg,
      volumeTons: (totalVolumeKg / 1000).toFixed(2),
      totalSets,
      totalReps,
      newPRs,
      anglesHit: Array.from(anglesSet),
    };
  }, [session, previousPRs, exerciseMap]);

  if (!isOpen || !session) return null;

  // HTML5 Canvas receipt rendering for high-res PNG export
  const renderReceiptToCanvas = () => {
    const canvas = document.createElement("canvas");
    const width = 640;
    const height = 920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Background Cyber Dark
    ctx.fillStyle = "#0B0F17";
    ctx.fillRect(0, 0, width, height);

    // Card Surface
    ctx.fillStyle = "#121824";
    ctx.roundRect(24, 24, width - 48, height - 48, 28);
    ctx.fill();

    // Glowing Cyber Borders
    const gradBorder = ctx.createLinearGradient(24, 24, width - 24, height - 24);
    gradBorder.addColorStop(0, "#73C8B4");
    gradBorder.addColorStop(0.5, "#3B82F6");
    gradBorder.addColorStop(1, "#10B981");
    ctx.strokeStyle = gradBorder;
    ctx.lineWidth = 3;
    ctx.roundRect(24, 24, width - 48, height - 48, 28);
    ctx.stroke();

    // Top Cyber Banner
    ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
    ctx.fillRect(28, 28, width - 56, 75);

    // Brand Watermark
    ctx.fillStyle = "#73C8B4";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText("GYM // RECON TX", 50, 64);

    ctx.fillStyle = "#64748B";
    ctx.font = "12px monospace";
    ctx.fillText(`RECEIPT #${(session.id || Date.now().toString()).slice(-8)}`, 50, 84);

    // Title & Date
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText(metrics.title, 50, 150);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(`${metrics.dateStr} • Duration: ${metrics.durationStr}`, 50, 180);

    // Divider
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 210);
    ctx.lineTo(width - 50, 210);
    ctx.stroke();

    // 3 Stat Boxes
    const boxW = (width - 100 - 32) / 3;
    const statY = 230;

    const stats = [
      { label: "VOLUME", val: `${metrics.totalVolumeKg.toLocaleString()} kg`, sub: `${metrics.volumeTons} tons`, color: "#73C8B4" },
      { label: "TOTAL SETS", val: `${metrics.totalSets}`, sub: "completed", color: "#10B981" },
      { label: "TOTAL REPS", val: `${metrics.totalReps}`, sub: "reps crushed", color: "#A855F7" },
    ];

    stats.forEach((st, idx) => {
      const bx = 50 + idx * (boxW + 16);
      ctx.fillStyle = "#0B0F17";
      ctx.roundRect(bx, statY, boxW, 100, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillText(st.label, bx + 16, statY + 28);

      ctx.fillStyle = st.color;
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText(st.val, bx + 16, statY + 58);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText(st.sub, bx + 16, statY + 82);
    });

    // PRs Section
    let currentY = 365;
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText("★ NEW PERSONAL RECORDS BROKEN", 50, currentY);
    currentY += 15;

    if (metrics.newPRs.length > 0) {
      metrics.newPRs.slice(0, 4).forEach((pr) => {
        currentY += 32;
        ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
        ctx.roundRect(50, currentY - 22, width - 100, 38, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillText(pr.name, 66, currentY);

        ctx.fillStyle = "#FCD34D";
        ctx.font = "bold 15px system-ui, sans-serif";
        const prStr = `${pr.newWeight} kg${pr.diff ? ` (+${pr.diff} kg)` : " (NEW PR)"}`;
        ctx.fillText(prStr, width - 66 - ctx.measureText(prStr).width, currentY);
      });
    } else {
      currentY += 28;
      ctx.fillStyle = "#64748B";
      ctx.font = "italic 13px system-ui, sans-serif";
      ctx.fillText("Solid consistent overload maintained.", 50, currentY);
    }

    // Angles Hit Section
    currentY += 50;
    ctx.fillStyle = "#73C8B4";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText("◈ BIOMECHANICAL ANGLES HIT", 50, currentY);

    currentY += 24;
    let badgeX = 50;
    metrics.anglesHit.forEach((angle) => {
      const label = getAngleLabel(angle).en;
      ctx.font = "12px system-ui, sans-serif";
      const txtWidth = ctx.measureText(label).width;
      const bW = txtWidth + 24;

      if (badgeX + bW > width - 50) {
        badgeX = 50;
        currentY += 34;
      }

      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      ctx.roundRect(badgeX, currentY - 18, bW, 26, 13);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.stroke();

      ctx.fillStyle = "#38BDF8";
      ctx.fillText(label, badgeX + 12, currentY);

      badgeX += bW + 8;
    });

    // Bottom Barcode & Footer
    const footerY = height - 90;
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.beginPath();
    ctx.moveTo(50, footerY);
    ctx.lineTo(width - 50, footerY);
    ctx.stroke();

    // Simulated Barcode
    ctx.fillStyle = "#475569";
    for (let i = 50; i < 280; i += 6) {
      const w = (i % 4 === 0) ? 3 : 1.5;
      ctx.fillRect(i, footerY + 16, w, 28);
    }

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText("STATUS: 100% VERIFIED", width - 240, footerY + 28);

    ctx.fillStyle = "#64748B";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("GYM PWA • PROGRESSIVE OVERLOAD", width - 240, footerY + 44);

    return canvas;
  };

  const handleShareOrSave = async () => {
    try {
      setIsExporting(true);
      const canvas = renderReceiptToCanvas();

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }

        const dateTag = new Date().toISOString().split("T")[0];
        const fileName = `workout-receipt-${dateTag}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        // If Web Share API is available with file support
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `${metrics.title} — Workout Receipt`,
              text: `Crushed ${metrics.title}! Lifted ${metrics.totalVolumeKg.toLocaleString()} kg across ${metrics.totalSets} sets.`,
              files: [file],
            });
            setExportNotice("Receipt shared successfully!");
            setTimeout(() => setExportNotice(null), 3000);
            setIsExporting(false);
            return;
          } catch (shareErr) {
            if (shareErr.name === "AbortError") {
              setIsExporting(false);
              return;
            }
          }
        }

        // Fallback: direct download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportNotice("Receipt saved to downloads!");
        setTimeout(() => setExportNotice(null), 3500);
        setIsExporting(false);
      }, "image/png");
    } catch (err) {
      console.error("Receipt export error:", err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B0F17] border border-[#73C8B4]/40 shadow-[0_0_40px_rgba(0,240,255,0.2)] p-5 text-white space-y-5">
        {/* Top Glow Ambient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#73C8B4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#73C8B4]/15 text-[#73C8B4] border border-neon-cyan/30">
              <Zap size={16} />
            </span>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#73C8B4]">
                Workout Completed
              </p>
              <h2 className="text-base font-extrabold text-white">
                Cyber Receipt
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Cyberpunk Receipt Card ── */}
        <div
          ref={receiptCardRef}
          className="relative bg-[#121824] rounded-2xl border border-slate-700/80 p-5 space-y-4 shadow-xl overflow-hidden"
        >
          {/* Card Neon Header Strip */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-white tracking-wide">
                {metrics.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{metrics.dateStr}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#73C8B4]">
                  <Clock size={12} /> {metrics.durationStr}
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#10B981]/15 text-[#10B981] px-2.5 py-1 rounded-full border border-[#10B981]/30 font-bold">
                <CheckCircle2 size={11} /> Verified
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0B0F17] rounded-xl p-2.5 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Volume</p>
              <p className="text-sm font-black text-[#73C8B4] mt-0.5">
                {metrics.totalVolumeKg.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">kg</span>
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{metrics.volumeTons} tons</p>
            </div>

            <div className="bg-[#0B0F17] rounded-xl p-2.5 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Sets</p>
              <p className="text-sm font-black text-[#10B981] mt-0.5">
                {metrics.totalSets}
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Crushed</p>
            </div>

            <div className="bg-[#0B0F17] rounded-xl p-2.5 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Reps</p>
              <p className="text-sm font-black text-neon-purple mt-0.5">
                {metrics.totalReps}
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Total</p>
            </div>
          </div>

          {/* New PRs Broken Today */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
              <Trophy size={13} />
              New PRs Broken Today
            </p>

            {metrics.newPRs.length > 0 ? (
              <div className="space-y-1.5">
                {metrics.newPRs.map((pr) => (
                  <div
                    key={pr.exerciseId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30"
                  >
                    <span className="text-xs font-semibold text-white truncate mr-2">
                      {pr.name}
                    </span>
                    <span className="text-xs font-black text-[#FCD34D] shrink-0 bg-[#0B0F17] px-2 py-0.5 rounded-lg border border-[#F59E0B]/40 shadow-sm">
                      {pr.newWeight} kg
                      {pr.diff && (
                        <span className="text-[10px] text-emerald-400 font-bold ml-1">
                          (+{pr.diff})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Flame size={14} className="text-orange-400 shrink-0" />
                <span>Heavy session volume maintained! High-intensity load locked in.</span>
              </div>
            )}
          </div>

          {/* Biomechanical Angles Hit */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#73C8B4] flex items-center gap-1.5">
              <Activity size={13} />
              Angles Hit This Session
            </p>
            <div className="flex flex-wrap gap-1.5">
              {metrics.anglesHit.map((angle) => {
                const label = getAngleLabel(angle).en;
                return (
                  <span
                    key={angle}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#73C8B4]/10 text-[#73C8B4] border border-[#73C8B4]/30"
                  >
                    <Layers size={10} />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Cyberpunk Receipt Perforation Simulation */}
          <div className="border-t border-dashed border-slate-700/80 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>TX_VER: 3.0.0</span>
            <span>OVERLOAD_LOGGED // 100%</span>
          </div>
        </div>

        {/* Action Button: Save / Share Receipt */}
        <div className="space-y-2 pt-1 relative z-10">
          <button
            onClick={handleShareOrSave}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-[#73C8B4] to-[#10B981] hover:opacity-95 text-[#0B0F17] font-black py-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isExporting ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#0B0F17] border-t-transparent rounded-full" />
            ) : (
              <>
                <Share2 size={16} />
                Save / Share Receipt (.PNG)
              </>
            )}
          </button>

          {exportNotice && (
            <p className="text-center text-xs text-[#10B981] font-semibold animate-fadeIn">
              {exportNotice}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl border border-slate-800 transition-colors text-xs"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
