import fs from 'fs';

// 1. ReminderWidget.jsx
let rw = fs.readFileSync('src/components/ReminderWidget.jsx', 'utf8');
rw = rw.replaceAll('text-cyan-400', 'text-[#73C8B4]');
rw = rw.replaceAll('bg-cyan-500/8', 'bg-[#73C8B4]/8');
rw = rw.replaceAll('border-cyan-400/30', 'border-[#73C8B4]/30');
rw = rw.replaceAll('via-cyan-400/40', 'via-[#73C8B4]/40');
rw = rw.replaceAll('from-cyan-600 to-cyan-400', 'from-[#73C8B4] to-[#C4E58A]');
rw = rw.replaceAll('bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20', 'bg-[#C4E58A] text-[#0D1723] hover:bg-[#B3D875] shadow-lg shadow-[#C4E58A]/20');
fs.writeFileSync('src/components/ReminderWidget.jsx', rw, 'utf8');
console.log('ReminderWidget.jsx colors unified');

// 2. ReminderSettings.jsx
let rs = fs.readFileSync('src/components/ReminderSettings.jsx', 'utf8');
rs = rs.replaceAll('bg-cyan-500 shadow-md shadow-cyan-500/30', 'bg-[#C4E58A] shadow-md shadow-[#C4E58A]/30 text-[#0D1723]');
rs = rs.replaceAll('text-cyan-400', 'text-[#73C8B4]');
rs = rs.replaceAll('bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/30 hover:bg-cyan-500/30', 'bg-[#73C8B4]/15 text-[#73C8B4] text-[11px] font-bold border border-[#73C8B4]/30 hover:bg-[#73C8B4]/25');
rs = rs.replaceAll('focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30', 'focus:border-[#73C8B4] focus:outline-none focus:ring-1 focus:ring-[#73C8B4]/30');
fs.writeFileSync('src/components/ReminderSettings.jsx', rs, 'utf8');
console.log('ReminderSettings.jsx colors unified');

// 3. NotificationManager.jsx
let nm = fs.readFileSync('src/components/NotificationManager.jsx', 'utf8');
nm = nm.replaceAll('"bg-cyan-500/20 text-cyan-400"', '"bg-[#73C8B4]/20 text-[#73C8B4]"');
fs.writeFileSync('src/components/NotificationManager.jsx', nm, 'utf8');
console.log('NotificationManager.jsx colors unified');

// 4. BodyMeasurementsTab.jsx
let bmt = fs.readFileSync('src/components/profile/BodyMeasurementsTab.jsx', 'utf8');
bmt = bmt.replaceAll('text-cyan-400', 'text-[#73C8B4]');
fs.writeFileSync('src/components/profile/BodyMeasurementsTab.jsx', bmt, 'utf8');
console.log('BodyMeasurementsTab.jsx colors unified');

// 5. ProgramSelector.jsx
let ps = fs.readFileSync('src/components/ProgramSelector.jsx', 'utf8');
ps = ps.replaceAll('from-cyan-500/20 via-blue-500/10 to-transparent', 'from-[#C4E58A]/20 via-[#73C8B4]/10 to-transparent');
fs.writeFileSync('src/components/ProgramSelector.jsx', ps, 'utf8');
console.log('ProgramSelector.jsx colors unified');

// 6. SwapExerciseModal.jsx & WorkoutReceiptModal.jsx
let sem = fs.readFileSync('src/components/SwapExerciseModal.jsx', 'utf8');
sem = sem.replaceAll('border-neon-cyan/20', 'border-[#73C8B4]/20');
sem = sem.replaceAll('border-neon-cyan', 'border-[#C4E58A]');
sem = sem.replaceAll('focus:ring-neon-cyan/40', 'focus:ring-[#73C8B4]/40');
sem = sem.replaceAll('rgba(0,240,255,0.4)', 'rgba(196,229,138,0.4)');
fs.writeFileSync('src/components/SwapExerciseModal.jsx', sem, 'utf8');
console.log('SwapExerciseModal.jsx colors unified');

let wrm = fs.readFileSync('src/components/WorkoutReceiptModal.jsx', 'utf8');
wrm = wrm.replaceAll('border-neon-cyan/30', 'border-[#73C8B4]/30');
fs.writeFileSync('src/components/WorkoutReceiptModal.jsx', wrm, 'utf8');
console.log('WorkoutReceiptModal.jsx colors unified');
