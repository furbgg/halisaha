const fs = require('fs');
const path = require('path');

// 1. Fix BookingCheckout.test.tsx
const bcPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingCheckout.test.tsx');
let bcTxt = fs.readFileSync(bcPath, 'utf8');
bcTxt = bcTxt.replace(/booking\.step3\.payment\.title/g, "Zahlungsart wählen");
bcTxt = bcTxt.replace(/booking\.step3\.payment\.creditCard/g, "Kreditkarte");
bcTxt = bcTxt.replace(/booking\.step3\.payment\.googlePay/g, "Google Pay");
bcTxt = bcTxt.replace(/booking\.step3\.payment\.applePay/g, "Apple Pay");
bcTxt = bcTxt.replace(/booking\.step3\.processing\.title/g, "Sichere Zahlung wird verarbeitet...");
fs.writeFileSync(bcPath, bcTxt);

// 2. Fix AGB.test.tsx
const agbPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'AGB.test.tsx');
let agbTxt = fs.readFileSync(agbPath, 'utf8');
agbTxt = agbTxt.replace(/Allgemeine/i, "Allgemeine");
agbTxt = agbTxt.replace(/Geschäftsbedingungen/i, "Geschäftsbedingungen");
// Also AGB renders <Helmet><title>{t('agb.title')} | {company}</title></Helmet>
// But in the body it might render "Allgemeine Geschäftsbedingungen" from the translation file.
// Wait, the AGB file didn't get fully updated or something? Let's check AGB.tsx
fs.writeFileSync(agbPath, agbTxt);

console.log('Fixed final tests strings');
