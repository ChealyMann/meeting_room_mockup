const fs = require('fs');

const dir = 'd:/Meeting_Room/MRMS/meeting_room_mockup/assets/rooms';
const dataFile = 'd:/Meeting_Room/MRMS/meeting_room_mockup/js/data.js';

let files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
if (files.length !== 10) {
  console.log('Not exactly 10 images found');
  process.exit(1);
}

let content = fs.readFileSync(dataFile, 'utf8');

// We know INITIAL_ROOMS_DATA is around line 306. Let's find it.
let startIndex = content.indexOf('const INITIAL_ROOMS_DATA = [');
if (startIndex === -1) {
  console.log('Could not find INITIAL_ROOMS_DATA');
  process.exit(1);
}

let roomBlocks = content.substring(startIndex).split(/id:\s*"ROOM-\d+"/);
// roomBlocks[0] is the preamble. roomBlocks[1..10] are the rooms.

if (roomBlocks.length - 1 !== 10) {
  console.log(`Found ${roomBlocks.length - 1} rooms, expected 10`);
  // Try counting how many we actually have, maybe we can just map them
}

for (let i = 1; i <= Math.min(10, roomBlocks.length - 1); i++) {
  // Replace the first 'image: "..."' in this block
  roomBlocks[i] = roomBlocks[i].replace(/image:\s*"[^"]+"/, `image: "assets/rooms/${files[i - 1]}"`);
  // Replace the first item in 'images: [...]'
  roomBlocks[i] = roomBlocks[i].replace(/images:\s*\[\s*"[^"]+"/, `images: [\n      "assets/rooms/${files[i - 1]}"`);
}

let newContent = content.substring(0, startIndex) + roomBlocks.join('id: "ROOM-"').replace(/id: "ROOM-"/, ''); // this logic is flawed for rejoining

// Better approach with regex for the whole file:
// We want to replace the first `image: "..."` inside each room object.
// Let's just do a simple sequential replacement of all `image: "..."` after `INITIAL_ROOMS_DATA`
let before = content.substring(0, startIndex);
let after = content.substring(startIndex);

let imgCount = 0;
after = after.replace(/image:\s*"[^"]+"/g, (match) => {
  if (imgCount < 10) {
    const res = `image: "assets/rooms/${files[imgCount]}"`;
    imgCount++;
    return res;
  }
  return match;
});

let arrCount = 0;
after = after.replace(/images:\s*\[\s*"[^"]+"/g, (match) => {
  if (arrCount < 10) {
    const res = `images: [\n      "assets/rooms/${files[arrCount]}"`;
    arrCount++;
    return res;
  }
  return match;
});

fs.writeFileSync(dataFile, before + after, 'utf8');
console.log(`Replaced ${imgCount} image fields and ${arrCount} array fields.`);
