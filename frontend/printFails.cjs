const fs = require('fs');
const lines = fs.readFileSync('test-output-utf8.txt', 'utf8').split('\n');
const fails = lines.filter(l => l.includes('FAIL') || l.includes('FAIL ') || l.match(/❯ src/));
console.log(fails.join('\n'));
