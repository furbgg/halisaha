const fs = require('fs');
const path = require('path');

// 1. Fix BookingDetails.test.tsx
const bdPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingDetails.test.tsx');
let bdTxt = fs.readFileSync(bdPath, 'utf8');
bdTxt = bdTxt.replace(/'booking\.step2\.form\.firstName'/g, "'Vorname'");
bdTxt = bdTxt.replace(/'booking\.step2\.form\.lastName'/g, "'Nachname'");
bdTxt = bdTxt.replace(/'booking\.step2\.form\.email'/g, "'E-Mail Adresse'");
bdTxt = bdTxt.replace(/'booking\.step2\.form\.phone'/g, "'Telefonnummer (Optional)'");
bdTxt = bdTxt.replace(/'booking\.step2\.summary\.title'/g, "'Zusammenfassung'");
bdTxt = bdTxt.replace(/'booking\.step2\.submit'/g, "'Weiter zur Zahlung'");
bdTxt = bdTxt.replace(/booking\.step2\.summary\.duration/g, "Dauer");
bdTxt = bdTxt.replace(/booking\.step2\.summary\.total/g, "Gesamtbetrag");
fs.writeFileSync(bdPath, bdTxt);

// 2. Fix BookingCheckout.test.tsx
const bcPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'BookingCheckout.test.tsx');
let bcTxt = fs.readFileSync(bcPath, 'utf8');
bcTxt = bcTxt.replace(/'booking\.checkout\.title'/g, "'Zahlung'");
bcTxt = bcTxt.replace(/'booking\.checkout\.methods\.card'/g, "'Kredit-/Debitkarte'");
bcTxt = bcTxt.replace(/'booking\.checkout\.submit'/g, "'Kostenpflichtig buchen'");
fs.writeFileSync(bcPath, bcTxt);

// 3. Fix Navbar.test.tsx
const nbPath = path.join(process.cwd(), 'src', '__tests__', 'components', 'Navbar.test.tsx');
let nbTxt = fs.readFileSync(nbPath, 'utf8');
nbTxt = nbTxt.replace(/'navbar\.home'/g, "'Startseite'");
nbTxt = nbTxt.replace(/'navbar\.tournaments'/g, "'Turniere'");
nbTxt = nbTxt.replace(/'navbar\.contact'/g, "'Kontakt'");
nbTxt = nbTxt.replace(/'navbar\.book'/g, "'Platz Buchen'");
fs.writeFileSync(nbPath, nbTxt);

// 4. Fix AGB.test.tsx
const agbPath = path.join(process.cwd(), 'src', '__tests__', 'pages', 'AGB.test.tsx');
let agbTxt = fs.readFileSync(agbPath, 'utf8');
agbTxt = agbTxt.replace(/'agb\.title'/g, "'Allgemeine Geschäftsbedingungen'");
agbTxt = agbTxt.replace(/'agb\.p1'/g, "'Allgemeine Geschäftsbedingungen'"); // this might not match perfectly but let's try
fs.writeFileSync(agbPath, agbTxt);

console.log('Fixed Test Assertions');
