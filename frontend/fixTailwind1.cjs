const fs = require('fs');
const path = require('path');

const ePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let etxt = fs.readFileSync(ePath, 'utf8');

// The class `[color-scheme:dark]` can be written as `scheme-dark`
etxt = etxt.replace(/\[color\-scheme\:dark\]/g, 'scheme-dark');

// The class `after:start-[2px]` can be written as `after:inset-s-[2px]`
etxt = etxt.replace(/after\:start\-\[2px\]/g, 'after:inset-s-[2px]');

// The class `start-0` can be written as `inset-s-0`
etxt = etxt.replace(/start\-0/g, 'inset-s-0');

// The class `z-[200]` can be written as `z-200`
etxt = etxt.replace(/z-\[200\]/g, 'z-200');

// The class `bg-white/[0.02]` can be written as `bg-white/2`
etxt = etxt.replace(/bg\-white\/\[0\.02\]/g, 'bg-white/2');

// The class `bg-white/[0.01]` can be written as `bg-white/1`
etxt = etxt.replace(/bg\-white\/\[0\.01\]/g, 'bg-white/1');

// Conflicting text-xs and text-sm
etxt = etxt.replace(/text\-sm text\-xs/g, 'text-xs');
etxt = etxt.replace(/text\-xs text\-sm/g, 'text-xs');

// Conflicting text-sm and text-lg (in a button)
etxt = etxt.replace(/text\-lg.*?text\-sm/g, 'text-sm');

fs.writeFileSync(ePath, etxt);

console.log('Fixed AdminEinstellungen Tailwind');
