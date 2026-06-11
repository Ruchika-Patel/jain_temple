const fs = require('fs');
const path = require('path');

const hindiRegex = /[\u0900-\u097F]/;

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        checkDir(fullPath);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (hindiRegex.test(content)) {
          console.log(`Found Hindi in: ${fullPath}`);
          // Print lines
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (hindiRegex.test(line)) {
              console.log(`  Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

checkDir('f:/project/jain_temple');
