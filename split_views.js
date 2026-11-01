const fs = require('fs');
const path = require('path');

const file = fs.readFileSync('index.html', 'utf8');
const lines = file.split('\n');

const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir);
}

const markers = [
  { name: 'login', tag: '// --- VIEW: LOGIN ---' },
  { name: 'dashboard', tag: '// --- VIEW: DASHBOARD ---' },
  { name: 'finance', tag: '// --- VIEW: FINANCE ---' },
  { name: 'tasks', tag: '// --- VIEW: TASKS ---' },
  { name: 'habittracker', tag: '// --- VIEW: HABIT TRACKER (Full Page) ---' },
  { name: 'bugbounty', tag: '// --- VIEW: BUG BOUNTY ---' },
  { name: 'hotel', tag: '// --- VIEW: HOTEL ---' },
  { name: 'restaurant', tag: '// --- VIEW: RESTAURANT ---' },
  { name: 'tourtravels', tag: '// --- VIEW: TOUR & TRAVELS ---' },
  { name: 'reports', tag: '// --- VIEW: REPORTS ---' },
  { name: 'analytics', tag: '// --- VIEW: ANALYTICS ---' },
  { name: 'settings', tag: '// --- VIEW: SETTINGS ---' },
  { name: 'profile', tag: '// --- VIEW: PROFILE ---' },
  { name: 'calendar', tag: '// --- VIEW: CALENDAR ---' },
  { name: 'notes', tag: '// --- VIEW: NOTES ---' },
  { name: 'adminpanel', tag: '// --- VIEW: ADMIN PANEL ---' },
  { name: 'marketing', tag: '// Dynamic registrations for new custom views' }
];

let currentIndex = 0;
let outHtml = [];
let i = 0;

while (i < lines.length) {
  if (currentIndex < markers.length && lines[i].includes(markers[currentIndex].tag)) {
    if (currentIndex === 0) {
      outHtml.push('  </script>');
    }
    
    const viewName = markers[currentIndex].name;
    let viewLines = [lines[i]];
    i++;
    while (i < lines.length) {
      if (currentIndex + 1 < markers.length && lines[i].includes(markers[currentIndex + 1].tag)) {
        break;
      }
      if (currentIndex === markers.length - 1 && lines[i].includes('DB.loadAll().then(() => {')) {
        break;
      }
      viewLines.push(lines[i]);
      i++;
    }
    fs.writeFileSync(path.join(viewsDir, viewName + '.js'), viewLines.join('\n'));
    currentIndex++;
    continue;
  } else {
    outHtml.push(lines[i]);
    i++;
  }
}

const finalHtml = [];
for (let j = 0; j < outHtml.length; j++) {
  if (outHtml[j].includes('DB.loadAll().then(() => {')) {
    markers.forEach(m => {
      finalHtml.push(`  <script src="views/${m.name}.js"></script>`);
    });
    finalHtml.push(`  <script>`);
    finalHtml.push(outHtml[j]);
  } else {
    finalHtml.push(outHtml[j]);
  }
}

fs.writeFileSync('index.html', finalHtml.join('\n'));
console.log('Successfully extracted ' + currentIndex + ' views.');
