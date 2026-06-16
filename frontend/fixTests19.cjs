const fs = require('fs');
const path = require('path');

const bdPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingDetails.test.tsx');
let bdTxt = fs.readFileSync(bdPath, 'utf8');

bdTxt = bdTxt.replace(/booking\.step2\.buttons\.continue/i, "Weiter zur Zahlung");

fs.writeFileSync(bdPath, bdTxt);
console.log('Fixed BookingDetails continue button string');
