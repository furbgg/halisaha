const fs = require('fs');
const path = require('path');

const trPath = path.join(__dirname, 'src', 'i18n', 'tr.json');
const dePath = path.join(__dirname, 'src', 'i18n', 'de.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));

const listTR = {
  t1: {
    title: "Salamanda Cup 2026",
    desc: "Stadl-Paura'nın kalbindeki klasik turnuva.",
    date: "12 Haziran 2026"
  },
  t2: {
    title: "Salzburg Sommerliga",
    desc: "Yılın en büyük açık hava etkinliği.",
    date: "15 Temmuz 2026"
  },
  t3: {
    title: "Graz Hallencup",
    desc: "Kışın yoğun salon turnuvası.",
    date: "20 Şubat 2026"
  },
  t4: {
    title: "Innsbruck Alpine Cup",
    desc: "Nefes kesici manzaranın önünde futbol.",
    date: "05 Ağustos 2026"
  }
};

const listDE = {
  t1: {
    title: "Salamanda Cup 2026",
    desc: "Der Klassiker im Herzen von Stadl-Paura.",
    date: "12. Juni 2026"
  },
  t2: {
    title: "Salzburg Sommerliga",
    desc: "Das größte Outdoor-Event des Jahres.",
    date: "15. Juli 2026"
  },
  t3: {
    title: "Graz Hallencup",
    desc: "Intensives Hallenturnier im Winter.",
    date: "20. Feb 2026"
  },
  t4: {
    title: "Innsbruck Alpine Cup",
    desc: "Fußball vor atemberaubender Kulisse.",
    date: "05. Aug 2026"
  }
};

if (!trData.tournaments) trData.tournaments = {};
trData.tournaments.list = listTR;

if (!deData.tournaments) deData.tournaments = {};
deData.tournaments.list = listDE;

fs.writeFileSync(trPath, JSON.stringify(trData, null, 2));
fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));

console.log('Added Tournaments static strings');
