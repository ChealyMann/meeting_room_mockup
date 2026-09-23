const fs = require('fs');

const dataFile = 'd:/Meeting_Room/MRMS/meeting_room_mockup/js/data.js';
let content = fs.readFileSync(dataFile, 'utf8');

// The name string format is: name: "KhmerText (EnglishText) – Location"
// We want to replace ` (EnglishText)` with empty string.
// So: / \([^\)]+\)/g

let count = 0;
content = content.replace(/name:\s*"([^"]+)"/g, (match, p1) => {
  // If there are parentheses, remove them and the space before them
  if (p1.includes('(')) {
    const newName = p1.replace(/\s*\([^\)]+\)/g, '');
    count++;
    return `name: "${newName}"`;
  }
  return match;
});

fs.writeFileSync(dataFile, content, 'utf8');
console.log(`Removed parentheses from ${count} room names.`);
