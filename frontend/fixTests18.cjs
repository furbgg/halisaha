const fs = require('fs');
const path = require('path');

const bdPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingDetails.test.tsx');
let bdTxt = fs.readFileSync(bdPath, 'utf8');

bdTxt = bdTxt.replace(/'E-Mail Adresse'/g, "'E-Mail-Adresse'");
bdTxt = bdTxt.replace(/'Telefonnummer \(Optional\)'/g, "'Telefonnummer'");

fs.writeFileSync(bdPath, bdTxt);
console.log('Fixed BookingDetails exact label strings');
