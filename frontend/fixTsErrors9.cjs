const fs = require('fs');
const path = require('path');

const mPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminMaterial.tsx');
let mtxt = fs.readFileSync(mPath, 'utf8');

// Replace `}\n}` with `}`
if (mtxt.endsWith('}\n}\n') || mtxt.endsWith('}\n}')) {
    mtxt = mtxt.substring(0, mtxt.lastIndexOf('}'));
}
fs.writeFileSync(mPath, mtxt);

console.log('Fixed Material Brace');
