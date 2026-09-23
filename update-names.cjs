const fs = require('fs');

const dataFile = 'd:/Meeting_Room/MRMS/meeting_room_mockup/js/data.js';

const newNames = [
  "ស្ទឹងសង្កែ (Sangker River) – Battambang / Pailin",
  "ស្ទឹងពោធិ៍សាត់ (Pursat River) – Pursat",
  "ស្ទឹងសែន (Sen River) – Kampong Thom / Preah Vihear",
  "ស្ទឹងជីនិត (Chinit River) – Kampong Thom / Kampong Chhnang",
  "ស្ទឹងមង្គលបូរី (Mongkol Borei River) – Banteay Meanchey",
  "ស្ទឹងសៀមរាប (Siem Reap River) – Siem Reap",
  "ស្ទឹងស្រែង (Sreng River) – Oddar Meanchey / Siem Reap",
  "ស្ទឹងព្រែកត្នោត (Prek Tnot River) – Kampong Speu / Kandal / Phnom Penh",
  "ស្ទឹងកំចាយ (Kamchay River) – Kampot",
  "ស្ទឹងតៃតៃ (Tatai River) – Koh Kong"
];

let content = fs.readFileSync(dataFile, 'utf8');

let startIndex = content.indexOf('const INITIAL_ROOMS_DATA = [');
if (startIndex === -1) {
  console.log('Could not find INITIAL_ROOMS_DATA');
  process.exit(1);
}

let before = content.substring(0, startIndex);
let after = content.substring(startIndex);

let count = 0;
after = after.replace(/name:\s*"[^"]+"/g, (match) => {
  if (count < newNames.length) {
    const res = `name: "${newNames[count]}"`;
    count++;
    return res;
  }
  return match; // If there are more name fields, leave them
});

fs.writeFileSync(dataFile, before + after, 'utf8');
console.log(`Replaced ${count} room names.`);
