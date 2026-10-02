// ===================================================================
// National Bank of Cambodia - Meeting Room Directory Dataset
// Cloned and adapted for TypeUI Enterprise Design System
// ===================================================================

const HIERARCHY_GROUPS = [
  {
    id: 'kbal-dei',
    title: 'National Bank of Cambodia - អគារក្បាលដី',
    shortName: 'អគារក្បាលដី',
    icon: 'lucide:landmark',
    description: 'Executive suites, monetary policy committees, and leadership boardrooms',
    matches: (room) => {
      const loc = (room.location || '').toLowerCase();
      return loc.includes('ក្បាលដី') || loc.includes('kbal dei');
    }
  },
  {
    id: 'daek',
    title: 'National Bank of Cambodia - អគារដែក',
    shortName: 'អគារដែក',
    icon: 'lucide:building',
    description: 'Conference halls, collaborative rooms, and executive boardrooms in Building Daek',
    matches: (room) => {
      const loc = (room.location || '').toLowerCase();
      return loc.includes('ដែក') || loc.includes('daek');
    }
  },
  {
    id: 'hq',
    title: 'National Bank of Cambodia - Headquarters',
    shortName: 'Headquarters',
    icon: 'lucide:landmark',
    description: 'Executive suites, monetary policy committees, and leadership boardrooms',
    matches: (room) => {
      const loc = (room.location || '').toLowerCase();
      const prov = (room.province || '').toLowerCase();
      return (
        loc.includes('headquarters') ||
        (prov.includes('phnom penh') &&
          !loc.includes('it department') &&
          !loc.includes('branch') &&
          !loc.includes('sen sok'))
      );
    }
  },
  {
    id: 'it',
    title: 'National Bank of Cambodia - IT & Innovation Campus',
    shortName: 'IT Department',
    icon: 'lucide:server',
    description: 'High-tech collaboration studios, Bakong core development, and network labs',
    matches: (room) => {
      const loc = (room.location || '').toLowerCase();
      return loc.includes('it department') || loc.includes('it building') || loc.includes('networks');
    }
  },
  {
    id: 'branch',
    title: 'National Bank of Cambodia - Phnom Penh Branch & CBS',
    shortName: 'PP Branch & CBS',
    icon: 'lucide:building-2',
    description: 'Public banking hall briefing rooms and banking training institutes',
    matches: (room) => {
      const loc = (room.location || '').toLowerCase();
      const prov = (room.province || '').toLowerCase();
      return (
        loc.includes('phnom penh branch') ||
        loc.includes('sen sok') ||
        (prov.includes('phnom penh') && loc.includes('branch'))
      );
    }
  },
  {
    id: 'provinces',
    title: 'Regional Provincial Branches',
    shortName: 'Provinces',
    icon: 'lucide:map-pin',
    description: 'Battambang, Siem Reap, and provincial leadership summit suites with HQ video link',
    matches: (room) => {
      const prov = (room.province || '').toLowerCase();
      return prov !== '' && !prov.includes('phnom penh');
    }
  }
];

const NBC_ROOMS = [
  {
    "id": "ROOM-KB-01",
    "name": "ស្ទឹងព្រះនេតព្រះ - Stung Preah Net Preah",
    "subtitle": "Executive boardroom with modern video telepresence",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារក្បាលដី",
    "branch": "Phnom Penh",
    "department": "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
    "floor": "Floor 2 - Executive Suite",
    "capacity": 24,
    "size": "85 sq m",
    "category": "Executive Room",
    "description": "បន្ទប់ប្រជុំថ្នាក់ដឹកនាំធំទូលាយ បំពាក់ប្រព័ន្ធវីដេអូសន្និសីទទំនើប តុប្រជុំវែង និងកៅអីស្បែកប្រណីត (Grand executive boardroom equipped with conference telepresence, table microphones, executive armchairs, and refreshment station).",
    "features": [
      "4K Ultra HD Display & Camera",
      "Wireless Screen Sharing",
      "Table Microphones & Speakers",
      "VIP Coffee & Tea Station",
      "High-Speed Encrypted Wi-Fi"
    ],
    "image": "assets/rooms/stung-preah-net-preah/4.png",
    "images": [
      "assets/rooms/stung-preah-net-preah/4.png",
      "assets/rooms/stung-preah-net-preah/1.png",
      "assets/rooms/stung-preah-net-preah/2.png",
      "assets/rooms/stung-preah-net-preah/7.png",
      "assets/rooms/stung-preah-net-preah/5.png",
      "assets/rooms/stung-preah-net-preah/6.png",
      "assets/rooms/stung-preah-net-preah/3.png"
    ],
    "status": "Available",
    "isPrivate": true,
    "roomOwner": {
      "id": "OWNER-01",
      "name": "H.E. Chea Serey Cabinet",
      "title": "Executive Board Secretary",
      "department": "Board & Executive Office",
      "phone": "Ext. 8801",
      "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    "id": "ROOM-KB-02",
    "name": "ស្ទឹងសិរីសោភ័ណ - Stung Serei Saophoan",
    "subtitle": "Modern collaboration suite with 4K interactive screen",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារក្បាលដី",
    "branch": "Phnom Penh",
    "department": "Monetary Policy & Research (គោលនយោបាយរូបិយវត្ថុ & ស្រាវជ្រាវ)",
    "floor": "Floor 2 - Conference & Meeting",
    "capacity": 14,
    "size": "50 sq m",
    "category": "Team Room",
    "description": "បន្ទប់ប្រជុំទំនើបបំពាក់អេក្រង់ទូរទស្សន៍ឆ្លាតវៃ កៅអីស្បែកសុខផាសុកភាព និងទូឯកសារស្រស់ស្អាត (Modern collaboration suite with smart 4K display screen, ergonomic leather chairs, and quiet acoustic insulation).",
    "features": [
      "Smart 4K Commercial TV",
      "Conference Camera Rig",
      "Executive Leather Chairs",
      "Whiteboard & Document Pod",
      "High-Speed Wi-Fi"
    ],
    "image": "assets/rooms/stung-serei-saophoan/5.png",
    "images": [
      "assets/rooms/stung-serei-saophoan/5.png",
      "assets/rooms/stung-serei-saophoan/2.png",
      "assets/rooms/stung-serei-saophoan/1.png",
      "assets/rooms/stung-serei-saophoan/6.png",
      "assets/rooms/stung-serei-saophoan/7.png",
      "assets/rooms/stung-serei-saophoan/3.png",
      "assets/rooms/stung-serei-saophoan/4.png"
    ],
    "status": "Available",
    "isPrivate": false
  },
  {
    "id": "ROOM-DK-01",
    "name": "សាលប្រជុំ ស្ទឹងបរិបូរណ៍ - Stung Boribo Grand Hall",
    "subtitle": "Grand central conference hall for summits & symposiums",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារដែក",
    "branch": "Phnom Penh",
    "department": "General Secretariat (អគ្គលេខាធិការដ្ឋាន)",
    "floor": "Ground Floor - Grand Hall",
    "capacity": 120,
    "size": "250 sq m",
    "category": "Grand Hall",
    "description": "សាលប្រជុំធំទូលាយកម្រិតជាតិ បំពាក់ដោយវេទិកាកិត្តិយស អេក្រង់បញ្ចាំងធំ និងប្រព័ន្ធសំឡេងទំនើបសម្រាប់សិក្ខាសាលា និងកិច្ចប្រជុំពេញអង្គ (Prestigious central auditorium hall equipped with executive stage, high-lumen laser projector, national podium, and acoustic isolation).",
    "features": [
      "High-Lumen Laser 4K Projector & Screen",
      "Wireless Microphone System (Lapel & Handheld)",
      "Executive Stage & Official Lectern",
      "Multi-Angle Broadcast Rig",
      "Central Air Conditioning"
    ],
    "image": "assets/rooms/sal-prochum-stung-boribo/2.png",
    "images": [
      "assets/rooms/sal-prochum-stung-boribo/2.png",
      "assets/rooms/sal-prochum-stung-boribo/1.png",
      "assets/rooms/sal-prochum-stung-boribo/6.png",
      "assets/rooms/sal-prochum-stung-boribo/4.png",
      "assets/rooms/sal-prochum-stung-boribo/5.png",
      "assets/rooms/sal-prochum-stung-boribo/7.png",
      "assets/rooms/sal-prochum-stung-boribo/3.png"
    ],
    "status": "Available",
    "isPrivate": false
  },
  {
    "id": "ROOM-DK-02",
    "name": "ស្ទឹងមង្គលបុរី - Stung Mongkol Borei",
    "subtitle": "Professional conference boardroom with projector array",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារដែក",
    "branch": "Phnom Penh",
    "department": "Banking Operations (ប្រតិបត្តិការធនាគារ)",
    "floor": "Floor 1 - Conference Suite",
    "capacity": 20,
    "size": "65 sq m",
    "category": "Team Room",
    "description": "បន្ទប់ប្រជុំស្តង់ដារបំពាក់ម៉ាស៊ីនបញ្ចាំងស្លាយ ឧបករណ៍បំពងសំឡេង និងតុវែងរៀបចំកិច្ចប្រជុំការងារ (Professional conference suite with ceiling projector, motorized projection screen, conference phone, and executive armchairs).",
    "features": [
      "Ceiling Mounted HD Projector & Screen",
      "Conference Speakerphone System",
      "Executive Boardroom Table",
      "Perimeter Participant Seating",
      "High-Speed Wi-Fi"
    ],
    "image": "assets/rooms/stung-mongkol-borei/3.png",
    "images": [
      "assets/rooms/stung-mongkol-borei/3.png",
      "assets/rooms/stung-mongkol-borei/4.png",
      "assets/rooms/stung-mongkol-borei/1.png",
      "assets/rooms/stung-mongkol-borei/2.png",
      "assets/rooms/stung-mongkol-borei/5.png"
    ],
    "status": "Available",
    "isPrivate": false
  },
  {
    "id": "ROOM-DK-03",
    "name": "ស្ទឹងសង្កែ - Stung Sangkae",
    "subtitle": "Executive boardroom with table microphone system",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារដែក",
    "branch": "Phnom Penh",
    "department": "Board & Executive Office",
    "floor": "Floor 1 - Executive Boardroom",
    "capacity": 22,
    "size": "70 sq m",
    "category": "Executive Room",
    "description": "បន្ទប់ប្រជុំប្រតិបត្តិបំពាក់ប្រព័ន្ធមីក្រូហ្វូនលើតុ អេក្រង់បញ្ចាំងធំ និងប្រព័ន្ធត្រជាក់កណ្តាល (Executive boardroom in Building Daek with conference audio system, table microphones, projection screen, and comfortable seating).",
    "features": [
      "Dedicated Table Conference Microphones",
      "Ceiling HD Projector & Screen",
      "Ergonomic Leather Armchairs",
      "Beverage & Refreshment Table",
      "High-Speed Wi-Fi"
    ],
    "image": "assets/rooms/stung-sangke/3.png",
    "images": [
      "assets/rooms/stung-sangke/3.png",
      "assets/rooms/stung-sangke/2.png",
      "assets/rooms/stung-sangke/1.png",
      "assets/rooms/stung-sangke/4.png",
      "assets/rooms/stung-sangke/5.png"
    ],
    "status": "Available",
    "isPrivate": true,
    "roomOwner": {
      "id": "OWNER-02",
      "name": "Dr. Sokhom Phan",
      "title": "Chief of CAFIU Security",
      "department": "Financial Intelligence Unit",
      "phone": "Ext. 8502",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    "id": "ROOM-DK-04",
    "name": "ស្ទឹងសៀមរាប - Stung Siem Reap",
    "subtitle": "Dedicated collaboration suite for department summits",
    "province": "Phnom Penh",
    "location": "National Bank of Cambodia - អគារដែក",
    "branch": "Phnom Penh",
    "department": "General Administration & Policy",
    "floor": "Floor 1 - Meeting Suite",
    "capacity": 16,
    "size": "55 sq m",
    "category": "Team Room",
    "description": "បន្ទប់ប្រជុំស្ទឹងសៀមរាប ស្ថិតនៅអគារដែក សម្រាប់កិច្ចប្រជុំផ្ទៃក្នុង និងកិច្ចពិភាក្សាការងារក្រុម (Dedicated meeting room in Building Daek for inter-departmental collaboration, working committees, and briefings).",
    "features": [
      "Large Presentation Screen",
      "Audio Speakerphone",
      "Executive Seating",
      "Fast Internet & Wi-Fi"
    ],
    "image": "assets/rooms/stung-siem-reap/9d906836-9164-4b2e-9d48-2af82f2917a2.png",
    "images": [
      "assets/rooms/stung-siem-reap/9d906836-9164-4b2e-9d48-2af82f2917a2.png",
      "assets/rooms/stung-sangke/3.png",
      "assets/rooms/stung-mongkol-borei/4.png"
    ],
    "status": "Available",
    "isPrivate": false
  },
  {
    id: "ROOM-101",
    name: "ស្ទឹងសង្កែ - Sangker River",
    subtitle: "Executive boardroom for leadership & delegations",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
    floor: "Floor 18 - Executive Suite",
    capacity: 28,
    size: "95 sq m",
    category: "Executive Room",
    description: "បន្ទប់ប្រជុំធំទូលាយបំពាក់ដោយប្រព័ន្ធបច្ចេកវិទ្យាទំនើប សម្រាប់កិច្ចប្រជុំថ្នាក់ដឹកនាំ និងគណៈប្រតិភូអន្តរជាតិ (Grand executive room for high-level board discussions, international delegations, and video conferences).",
    features: [
      "Large Video Screen (4K TV)",
      "Wireless Screen Sharing",
      "Table Microphones & Speakers",
      "Whiteboard & Markers",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/61b926e2-2e73-4e0a-8d01-7d9f45ed2d46.png",
    images: [
      "assets/rooms/61b926e2-2e73-4e0a-8d01-7d9f45ed2d46.png",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: true,
    roomOwner: {
      id: "OWNER-01",
      name: "H.E. Chea Serey Cabinet",
      title: "Executive Board Secretary",
      department: "Board & Executive Office",
      phone: "Ext. 8801",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    id: "ROOM-102",
    name: "ស្ទឹងពោធិ៍សាត់ - Pursat River",
    subtitle: "Modern meeting space for productive teams",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Monetary Policy & Research (គោលនយោបាយរូបិយវត្ថុ & ស្រាវជ្រាវ)",
    floor: "Floor 12 - Banking Studies & Policy",
    capacity: 18,
    size: "60 sq m",
    category: "Team Room",
    description: "បន្ទប់ប្រជុំកិច្ចសហការ និងស្រាវជ្រាវគោលនយោបាយ បំពាក់អេក្រង់ Touchscreen និងបរិក្ខារពិភាក្សាឆ្លាតវៃ (Comfortable room with interactive screens, ideal for team planning, policy research, and brainstorming).",
    features: [
      "Touchscreen TV",
      "Video Call Camera",
      "Movable Chairs",
      "Coffee Machine Nearby",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/pursat_river_meeting_room.jpg",
    images: [
      "assets/rooms/pursat_river_meeting_room.jpg",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-103",
    name: "ស្ទឹងសែន - Sen River",
    subtitle: "Quiet private suite for focused discussions",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Internal Audit (សវនកម្មផ្ទៃក្នុង)",
    floor: "Floor 5 - Finance & Audit",
    capacity: 6,
    size: "22 sq m",
    category: "Small Room",
    description: "បន្ទប់ស្ងប់ស្ងាត់សម្រាប់កិច្ចប្រជុំតូច ពិភាក្សាការងារសម្ងាត់ ឬការសម្ភាសន៍បុគ្គលិក (Quiet private room for 2 to 6 people. Great for private interviews, consultations, or confidential audit discussions).",
    features: [
      "Desk & 6 Chairs",
      "HD Monitor Screen",
      "Power Sockets",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/72edadb0-8408-4bd8-8e0b-fc9ade28727c.png",
    images: [
      "assets/rooms/72edadb0-8408-4bd8-8e0b-fc9ade28727c.png",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: true,
    roomOwner: {
      id: "OWNER-02",
      name: "Dr. Sokhom Phan",
      title: "Chief of CAFIU Security",
      department: "Financial Intelligence Unit",
      phone: "Ext. 8502",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    id: "ROOM-104",
    name: "ស្ទឹងជីនិត - Chinit River",
    subtitle: "Grand auditorium for town halls & conferences",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "General Secretariat (អគ្គលេខាធិការដ្ឋាន)",
    floor: "Floor 18 - Executive Suite",
    capacity: 60,
    size: "180 sq m",
    category: "Grand Hall",
    description: "សាលសន្និសីទធំសម្រាប់សិក្ខាសាលាទូទៅ បទបង្ហាញថ្នាក់ជាតិ និងកិច្ចប្រជុំពេញអង្គ (Our grand auditorium hall for company town halls, large workshops, and VIP visits).",
    features: [
      "Dual Projector Screens",
      "Wireless Lapel Microphones",
      "Full Stage & Podium",
      "Live Streaming Camera",
      "Direct Elevator Access"
    ],
    image: "assets/rooms/8d3b169a-e3cf-4880-865e-5c05db7f0b96.png",
    images: [
      "assets/rooms/8d3b169a-e3cf-4880-865e-5c05db7f0b96.png",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-105",
    name: "ស្ទឹងមង្គលបូរី - Mongkol Borei River",
    subtitle: "High-tech studio for engineering & innovation",
    province: "Phnom Penh",
    location: "National Bank of Cambodia, IT Department",
    branch: "Phnom Penh",
    department: "Core Banking Development (អភិវឌ្ឍន៍ប្រព័ន្ធធនាគារ)",
    floor: "Floor 3 - Core Banking & Networks",
    capacity: 14,
    size: "48 sq m",
    category: "Tech Room",
    description: "បន្ទប់បច្ចេកវិទ្យាទំនើបបំពាក់អេក្រង់ភ្លោះ និងបណ្តាញល្បឿនលឿនសម្រាប់ក្រុមវិស្វករ IT និង Bakong (Modern room with dual screens and fast network ports for developers and IT teams).",
    features: [
      "2 Big Display Screens",
      "Ethernet Cable Ports",
      "Fast Video Call Rig",
      "Glass Whiteboard"
    ],
    image: "assets/rooms/a5bf5363-1aba-46db-90a3-2c42d0ef3c95.png",
    images: [
      "assets/rooms/a5bf5363-1aba-46db-90a3-2c42d0ef3c95.png",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-106",
    name: "ស្ទឹងសៀមរាប - Siem Reap River",
    subtitle: "Accessible meeting room for guests & partners",
    province: "Phnom Penh",
    location: "National Bank of Cambodia (Phnom Penh branch)",
    branch: "Phnom Penh",
    department: "Public Banking & Teller Services (សេវាធនាគារសាធារណៈ)",
    floor: "Ground Floor - Banking Hall & Tellers",
    capacity: 10,
    size: "35 sq m",
    category: "Visitor Room",
    description: "បន្ទប់ងាយស្រួលចេញចូលនៅជាន់ផ្ទាល់ដី ស័ក្តិសមសម្រាប់ទទួលភ្ញៀវជាតិ និងអន្តរជាតិ (Easy-to-reach room on the ground floor, perfect for meeting outside guests and clients).",
    features: [
      "Smart TV Screen",
      "Speakerphone Unit",
      "Comfortable Sofa Chairs",
      "Guest Wi-Fi"
    ],
    image: "assets/rooms/b2858b86-a480-472e-a580-869dc6e60cc3.png",
    images: [
      "assets/rooms/b2858b86-a480-472e-a580-869dc6e60cc3.png",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-107",
    name: "ស្ទឹងស្រែង - Sreng River",
    subtitle: "Private executive office for confidential work",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
    floor: "Floor 5 - Finance & Audit",
    capacity: 8,
    size: "32 sq m",
    category: "Private Office",
    description: "ការិយាល័យប្រជុំថ្នាក់ដឹកនាំសម្ងាត់ បំពាក់ដោយតុប្រតិបត្តិ និងប្រព័ន្ធទំនាក់ទំនងសុវត្ថិភាព (Private executive office space with quiet discussion corner, conference phone, and desktop monitors).",
    features: [
      "Executive Desk & 8 Guest Seats",
      "Confidential Video Rig",
      "Wireless Presentation Screen",
      "High-Speed Encrypted Wi-Fi"
    ],
    image: "assets/rooms/bbef8ed3-6540-46db-aaef-1962add7965e.png",
    images: [
      "assets/rooms/bbef8ed3-6540-46db-aaef-1962add7965e.png",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: true,
    roomOwner: {
      id: "OWNER-VANCE",
      name: "Jonathan Vance",
      title: "Senior Finance Officer (You)",
      department: "Finance & Accounting",
      phone: "Ext. 8421",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    id: "ROOM-108",
    name: "ស្ទឹងព្រែកត្នោត - Prek Tnot River",
    subtitle: "Regional leadership room with HQ video link",
    province: "Battambang",
    location: "Battambang Provincial Branch",
    branch: "Battambang",
    department: "Branch Management",
    floor: "Floor 2 - Branch Management & Boardroom",
    capacity: 16,
    size: "55 sq m",
    category: "Regional Boardroom",
    description: "បន្ទប់ប្រជុំថ្នាក់ដឹកនាំប្រចាំខេត្តបាត់ដំបង ជាប់ដងស្ទឹងសង្កែ បំពាក់ដោយប្រព័ន្ធវីដេអូតភ្ជាប់ជាមួយទីស្នាក់ការកណ្តាល (Regional executive boardroom located at Battambang Provincial Branch, equipped with high-speed video link to Phnom Penh HQ).",
    features: [
      "Video Conference Rig (HQ Link)",
      "Large 4K Presentation Screen",
      "Wireless Table Microphones",
      "Whiteboard & Markers",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/bcc94610-00b1-4a1a-922b-d0777e4a55a4.png",
    images: [
      "assets/rooms/bcc94610-00b1-4a1a-922b-d0777e4a55a4.png",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-109",
    name: "ស្ទឹងកំចាយ - Kamchay River",
    subtitle: "Inter-bank summit suite & provincial center",
    province: "Siem Reap",
    location: "Siem Reap Provincial Branch",
    branch: "Siem Reap",
    department: "Branch Management & Executive Office",
    floor: "Floor 2 - Executive & Meeting Suites",
    capacity: 20,
    size: "70 sq m",
    category: "Executive Suite",
    description: "បន្ទប់ប្រជុំកម្រិតខ្ពស់ប្រចាំសាខាខេត្តសៀមរាប សម្រាប់កិច្ចប្រជុំធនាគារ កិច្ចសហប្រតិបត្តិការបេតិកភណ្ឌ និងគណៈប្រតិភូជាតិ-អន្តរជាតិ (Prestigious meeting suite at Siem Reap Provincial Branch, designed for inter-bank summits and provincial leadership discussions).",
    features: [
      "4K Dual Display Screens",
      "HD Video Conferencing (HQ Link)",
      "Wireless Presentation Pods",
      "Executive Seating",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/e4465141-0937-42b6-b083-1da23ac0db31.png",
    images: [
      "assets/rooms/e4465141-0937-42b6-b083-1da23ac0db31.png",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-110",
    name: "ស្ទឹងតៃតៃ - Tatai River",
    subtitle: "Interactive seminar room for banking courses",
    province: "Phnom Penh",
    location: "National Bank of Cambodia, Sen Sok",
    branch: "Phnom Penh",
    department: "Center for Banking Studies - CBS (វិទ្យាស្ថានបណ្តុះបណ្តាលធនាគារ)",
    floor: "Floor 2 - Training Suites & Seminar Rooms",
    capacity: 32,
    size: "110 sq m",
    category: "Seminar Room",
    description: "បន្ទប់បណ្តុះបណ្តាល និងសិក្ខាសាលាទំនើបនៅមជ្ឈមណ្ឌលសិក្សាធនាគារ (CBS) សែនសុខ សម្រាប់វគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈធនាគារ (State-of-the-art seminar suite at NBC Sen Sok Campus, ideal for banking training programs, financial workshops, and certification symposiums).",
    features: [
      "Dual Interactive Whiteboards",
      "HD Projector & Audio System",
      "Modular Training Desks",
      "Wireless Microphones",
      "High-Speed Wi-Fi"
    ],
    image: "assets/rooms/f96d8490-dcf1-468a-aea3-84ea8e62a4fb.png",
    images: [
      "assets/rooms/f96d8490-dcf1-468a-aea3-84ea8e62a4fb.png",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  }
];

// Expose globally on window for file:/// and classical script compatibility
if (typeof window !== 'undefined') {
  window.HIERARCHY_GROUPS = HIERARCHY_GROUPS;
  window.NBC_ROOMS = NBC_ROOMS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HIERARCHY_GROUPS, NBC_ROOMS };
}
