import fs from 'fs';
import path from 'path';

const suspicious = [
  'cyan',
  '#00F0FF',
  '#00d4ff',
  '#00ffff',
  'emerald-900',
  'emerald-800',
  'teal-900',
  'teal-800',
  '#39ff14',
  'sky-400',
  'sky-500',
];

function scanFile(p) {
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    suspicious.forEach(pattern => {
      if (l.includes(pattern)) {
        console.log(`${p}:${i+1} [${pattern}]: ${l.trim()}`);
      }
    });
  });
}

function scan(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (f.endsWith('.jsx') || f.endsWith('.js') || f.endsWith('.css')) scanFile(full);
  });
}

scan('src');
