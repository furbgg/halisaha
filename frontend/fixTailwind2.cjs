const fs = require('fs');
const path = require('path');

// Admin Material
const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');
mtxt = mtxt.replace(/bg\-white\/\[0\.02\]/g, 'bg-white/2');
mtxt = mtxt.replace(/bg\-white\/\[0\.05\]/g, 'bg-white/5');
mtxt = mtxt.replace(/z-\[100\]/g, 'z-100');
fs.writeFileSync(mPath, mtxt);

// Admin Reservierungen
const rPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(rPath, 'utf8');
rtxt = rtxt.replace(/bg\-white\/\[0\.02\]/g, 'bg-white/2');
rtxt = rtxt.replace(/z-\[9999\]/g, 'z-9999');
rtxt = rtxt.replace(/\[color\-scheme\:dark\]/g, 'scheme-dark');
fs.writeFileSync(rPath, rtxt);

// Happy Hour Badge & Admin Forgot Password
const hPath = path.join(process.cwd(), 'src', 'components', 'common', 'HappyHourBadge.tsx');
let htxt = fs.readFileSync(hPath, 'utf8');
htxt = htxt.replace(/z-\[100\]/g, 'z-100');
fs.writeFileSync(hPath, htxt);

const fPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminForgotPassword.tsx');
let ftxt = fs.readFileSync(fPath, 'utf8');
ftxt = ftxt.replace(/z-\[100\]/g, 'z-100');
fs.writeFileSync(fPath, ftxt);

console.log('Fixed Tailwind CSS Warnings');
