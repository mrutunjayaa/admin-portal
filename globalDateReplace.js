const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.js')).map(f => path.join(viewsDir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace timezone adjusted Date.now() with window.globalSelectedDate
  content = content.replace(/new Date\(Date\.now\(\) - new Date\(\)\.getTimezoneOffset\(\) \* 60000\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'window.globalSelectedDate');
  
  // Tasks uses currentPlannerDate. We need to replace references to window.currentPlannerDate with window.globalSelectedDate
  content = content.replace(/window\.currentPlannerDate/g, 'window.globalSelectedDate');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
