const fs = require('fs');
const files = ['views/habittracker.js', 'views/tourtravels.js', 'views/restaurant.js', 'views/finance.js', 'views/reports.js', 'views/hotel.js'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Replace \'T\' with 'T'
  content = content.replace(/split\(\\'T\\'\)/g, "split('T')");
  fs.writeFileSync(f, content);
});
