const fs = require('fs');
const path = require('path');

const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');

// Fix the return { label: condition // no change, ... }
mtxt = mtxt.replace(/return \{ label: condition \/\/ no change, color: 'slate', dot: false \};/, "return { label: condition, color: 'slate', dot: false };");

fs.writeFileSync(mPath, mtxt);

console.log('Fixed Material Comment');
