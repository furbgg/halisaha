const fs = require('fs');
const path = require('path');

const resPath = path.join(process.cwd(), 'src', 'pages', 'admin', 'AdminReservierungen.tsx');
let rtxt = fs.readFileSync(resPath, 'utf8');

rtxt = rtxt.replace(/const exportCSV = \(data: AdminReservation\[\]\) => \{/, "const exportCSV = (data: AdminReservation[], t: any) => {");
rtxt = rtxt.replace(/exportCSV\(filteredReservations\)/g, "exportCSV(filteredReservations, t)");
rtxt = rtxt.replace(/getStatusConfig\(t\(\)\)\[getDisplayStatus\(r\)\]/g, "getStatusConfig(t)[getDisplayStatus(r)]");

// Also check lines around 1350 for `paymentStatusLabels` -> `getPaymentStatusLabels(t())` error!
rtxt = rtxt.replace(/getPaymentStatusLabels\(t\(\)\)\[/g, "getPaymentStatusLabels(t)[");

fs.writeFileSync(resPath, rtxt);

console.log('Fixed exportCSV');
