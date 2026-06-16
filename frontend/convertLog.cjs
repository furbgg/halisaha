const fs = require('fs');
const txt = fs.readFileSync('test-output.log', 'utf16le');
fs.writeFileSync('test-output-utf8.txt', txt, 'utf8');
