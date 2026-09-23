const fs = require('fs');
const path = 'd:/Meeting_Room/MRMS/meeting_room_mockup/js/data.js';

let content = fs.readFileSync(path, 'utf8');

const newNames = [
  "ស្ទឹងសង្កែ - Sangker River",
  "ស្ទឹងពោធិ៍សាត់ - Pursat River",
  "ស្ទឹងសែន - Sen River",
  "ស្ទឹងជីនិត - Chinit River",
  "ស្ទឹងមង្គលបូរី - Mongkol Borei River",
  "ស្ទឹងសៀមរាប - Siem Reap River",
  "ស្ទឹងស្រែង - Sreng River",
  "ស្ទឹងព្រែកត្នោត - Prek Tnot River",
  "ស្ទឹងកំចាយ - Kamchay River",
  "ស្ទឹងតៃតៃ - Tatai River"
];

const newImages = [
  "61b926e2-2e73-4e0a-8d01-7d9f45ed2d46.png",
  "pursat_river_meeting_room.jpg", // The new one generated
  "72edadb0-8408-4bd8-8e0b-fc9ade28727c.png",
  "8d3b169a-e3cf-4880-865e-5c05db7f0b96.png",
  "a5bf5363-1aba-46db-90a3-2c42d0ef3c95.png",
  "b2858b86-a480-472e-a580-869dc6e60cc3.png",
  "bbef8ed3-6540-46db-aaef-1962add7965e.png",
  "bcc94610-00b1-4a1a-922b-d0777e4a55a4.png",
  "e4465141-0937-42b6-b083-1da23ac0db31.png",
  "f96d8490-dcf1-468a-aea3-84ea8e62a4fb.png"
];

// Split the file to isolate INITIAL_ROOMS_DATA
const splitStr = 'const INITIAL_ROOMS_DATA = [';
const parts = content.split(splitStr);
if (parts.length === 2) {
  let roomsData = parts[1];
  
  // Replace names (exactly 10 instances of name: "ទន្លេ/ស្ទឹង..." in the rooms block)
  let countName = 0;
  roomsData = roomsData.replace(/name:\s*"[^\"]+"/g, (match) => {
    // Only replace if it matches the pattern of a room name (ទន្លេ or ស្ទឹង)
    if (match.includes("ទន្លេ") || match.includes("ស្ទឹង")) {
      if (countName < newNames.length) {
        const res = `name: "${newNames[countName]}"`;
        countName++;
        return res;
      }
    }
    return match;
  });

  // Replace images for exactly the first 10 occurrences in the rooms block
  let countImg = 0;
  roomsData = roomsData.replace(/image:\s*"[^\"]+"/g, (match) => {
    if (countImg < newImages.length) {
      const res = `image: "assets/rooms/${newImages[countImg]}"`;
      countImg++;
      return res;
    }
    return match;
  });

  // Replace images array first item
  let countArr = 0;
  let nextImg = true;
  roomsData = roomsData.replace(/images:\s*\[\s*("[^\"]+")/g, (match, p1) => {
    if (countArr < newImages.length) {
      const res = match.replace(p1, `"assets/rooms/${newImages[countArr]}"`);
      countArr++;
      return res;
    }
    return match;
  });

  content = parts[0] + splitStr + roomsData;
}

// Replace IT Staff
const staffRegex = /const INITIAL_IT_STAFF = \[[\s\S]*?\];/;
const newStaff = `const INITIAL_IT_STAFF = [
  {
    id: "2503",
    name: "ហ៊ី ម៉េងស្រ៊ី",
    title: "IT Support",
    phone: "855968607776",
    avatar: "assets/photo_2026-09-22_14-16-49.jpg"
  },
  {
    id: "CS 0133",
    name: "យ៉េន បូរ៉ែន",
    title: "IT Support",
    phone: "010798718",
    avatar: "assets/photo_2026-09-22_14-16-35.jpg"
  },
  {
    id: "2507",
    name: "ជ័យ សុវណ្ណ",
    title: "IT Support",
    phone: "016 227 687",
    avatar: "assets/photo_2026-09-22_14-16-24.jpg"
  },
  {
    id: "CS-0130",
    name: "វីណា ដារិទ្ធ",
    title: "IT Support",
    phone: "855769971997",
    avatar: "assets/photo_2026-09-22_14-16-15.jpg"
  },
  {
    id: "2192",
    name: "រដ្ឋា ធាណុច",
    title: "IT Support",
    phone: "010363134",
    avatar: "assets/IMG_4894.PNG"
  },
  {
    id: "CS-0134",
    name: "ឆេង ឈុនពុទ្ធិរង្សី",
    title: "IT Support",
    phone: "855965676733",
    avatar: "assets/photo_2026-09-22_14-20-29.jpg"
  },
  {
    id: "2188",
    name: "យ៉ាង ប៊ុនឡេង",
    title: "IT Support",
    phone: "077234518",
    avatar: "assets/DSC_0331 copy.jpg"
  }
];`;

content = content.replace(staffRegex, newStaff);

fs.writeFileSync(path, content, 'utf8');
console.log('Restored all fixes.');
