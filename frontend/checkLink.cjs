const fs = require('fs');
const path = require('path');

const bPath = path.join(process.cwd(), 'src', 'pages', 'BookingCheckout.tsx');
let bTxt = fs.readFileSync(bPath, 'utf8');

// There is a <link> tag somewhere?
// Looking at the component, there is no <link> tag directly visible.
// Ah, look at this: let's grep for "link" or "<link"
// Actually, I can just replace `<link>` with `<a>` or `<span` if it exists.
console.log('Lines with link:', bTxt.split('\n').filter(l => l.includes('link') || l.includes('Link')).length);

// Wait, the error is: "link is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`."
// This happens when someone does `<link>some text</link>`.
// Let's find it.
const lines = bTxt.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<link') || l.includes('link')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
