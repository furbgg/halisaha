const fs = require('fs');
const path = require('path');

const bcPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingCheckout.test.tsx');
let bcTxt = fs.readFileSync(bcPath, 'utf8');

// The pay button text is 'Jetzt zahlen & buchen'
bcTxt = bcTxt.replace(/booking\.step3\.buttons\.pay/i, "Jetzt zahlen & buchen");

fs.writeFileSync(bcPath, bcTxt);
console.log('Fixed pay button text');
