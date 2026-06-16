const fs = require('fs');
const path = require('path');

// 1. Fix AGB.test.tsx
const agbPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'AGB.test.tsx');
let agbTxt = fs.readFileSync(agbPath, 'utf8');
agbTxt = agbTxt.replace(/Allgemeine/i, "Allgemeine"); // Keep it
// Let's check why AGB failed: "unable to find an element with the text: /Allgemeine/i"
// It means maybe we need to mock or not mock AGB properly? 
// No, AGB component uses `t('agb.title')` and our mock returns `t('agb.title')` but we changed the test to expect `'Allgemeine Geschäftsbedingungen'`.
// Wait, our new i18next mock returns actual DE json strings now.
// Let's check what 'agb.title' is in de.json: "Allgemeine Geschäftsbedingungen"
// Maybe it's uppercase "ALLGEMEINE GESCHÄFTSBEDINGUNGEN" in the DOM?
// Let's just use `expect(screen.getByText(/Geschäftsbedingungen/i)).toBeInTheDocument();`
// No, let me just replace AGB expectation to the key to be extremely safe if JSON isn't loaded right, OR change it to check for anything that renders.

// Actually, BookingCheckout fails on:
// expect(screen.getAllByText('booking.step3.payment.title').length).toBeGreaterThan(0);
// Because the mock now resolves actual text! So 'booking.step3.payment.title' -> 'Zahlungsmethode'
const bcPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingCheckout.test.tsx');
let bcTxt = fs.readFileSync(bcPath, 'utf8');
bcTxt = bcTxt.replace(/'booking\.step3\.payment\.title'/g, "/Zahlung/i");
bcTxt = bcTxt.replace(/'booking\.step3\.payment\.creditCard'/g, "/Kredit/i");
bcTxt = bcTxt.replace(/'booking\.step3\.payment\.googlePay'/g, "/Google Pay/i");
bcTxt = bcTxt.replace(/'booking\.step3\.payment\.applePay'/g, "/Apple Pay/i");
bcTxt = bcTxt.replace(/'booking\.step3\.processing\.title'/g, "/wird verarbeitet/i"); // or "Zahlung wird verarbeitet"
fs.writeFileSync(bcPath, bcTxt);

// Let's check BookingDetails test:
// It fails getting labels: "Vorname", "Nachname" etc.
// In German JSON it might be "Vorname", "Nachname".
// The error says "An update to HoldTimer inside a test was not wrapped in act(...)."
// AND it also fails to find "Vorname". 
// In BookingDetails component, the labels are rendered by Input component or label tags.
// Let's look at `de.json` for booking.step2.form to be sure.
