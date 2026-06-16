const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminEinstellungen.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// The errors say:
// 'text-sm' applies the same CSS properties as 'text-xs'.
// At lines 978, 998, 1018, 1038 which are the textareas for WA templates.
// They have `text-sm` and `text-xs` both applied:
// className="w-full bg-background-dark border border-white/10 text-white text-sm rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs leading-relaxed"
// We will remove `text-sm` and keep `text-xs`.
content = content.replace(/text-white text-sm rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-\[120px\] resize-y font-mono text-xs/g, 
                          "text-white rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs");

// At line 1244:
// 'text-sm' applies the same CSS properties as 'text-lg'.
// This is the input for the 2FA Code
// className="bg-[#0d1208] border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 text-center tracking-[0.5em] font-mono text-lg"
// We will remove `text-sm` and keep `text-lg`.
content = content.replace(/text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2\.5 text-center tracking-\[0\.5em\] font-mono text-lg/g,
                          "text-white rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 text-center tracking-[0.5em] font-mono text-lg");

fs.writeFileSync(targetPath, content);
console.log('Fixed CSS conflicts in AdminEinstellungen');
