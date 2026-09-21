// ===================================================================
// National Bank of Cambodia - Meeting Room Directory Dataset
// Cloned and adapted for TypeUI Enterprise Design System
// ===================================================================

const HIERARCHY_GROUPS = [
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
    id: "ROOM-101",
    name: "ទន្លេមេគង្គ - Mekong River",
    subtitle: "Executive boardroom for leadership & international delegations",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
    floor: "Level 18 (Floor 18) - Executive Suite",
    floorShort: "Floor 18",
    capacity: 28,
    size: "95 m²",
    category: "Executive Room",
    description: "Grand executive boardroom for high-level central banking discussions, international monetary delegations, and high-security encrypted video conferences.",
    descriptionKh: "បន្ទប់ប្រជុំធំទូលាយបំពាក់ដោយប្រព័ន្ធបច្ចេកវិទ្យាទំនើប សម្រាប់កិច្ចប្រជុំថ្នាក់ដឹកនាំ និងគណៈប្រតិភូអន្តរជាតិ។",
    features: [
      "Large Video Screen (4K Ultra HD)",
      "Wireless Barco ClickShare",
      "Table Microphones & Bose Audio",
      "High-Speed Encrypted Wi-Fi 6E",
      "VIP Catering Service Area"
    ],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: true,
    upcomingSlot: "02:00 PM - 04:30 PM",
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
    name: "ទន្លេសាប - Tonle Sap River",
    subtitle: "Modern collaboration suite for policy research & economics",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Monetary Policy & Research (គោលនយោបាយរូបិយវត្ថុ & ស្រាវជ្រាវ)",
    floor: "Level 12 (Floor 12) - Banking Studies & Policy",
    floorShort: "Floor 12",
    capacity: 18,
    size: "60 m²",
    category: "Team Room",
    description: "Collaborative research and econometric strategy suite equipped with interactive 85-inch digital whiteboards and smart acoustic baffles.",
    descriptionKh: "បន្ទប់ប្រជុំកិច្ចសហការ និងស្រាវជ្រាវគោលនយោបាយ បំពាក់អេក្រង់ Touchscreen និងបរិក្ខារពិភាក្សាឆ្លាតវៃ។",
    features: [
      "85-inch Touchscreen Display",
      "Poly Studio 4K Camera Rig",
      "Modular Collaborative Seating",
      "Nespresso Refreshment Bar",
      "Gigabit LAN & Fast Wi-Fi"
    ],
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-103",
    name: "ទន្លេបាសាក់ - Bassac River",
    subtitle: "Acoustic-isolated private suite for audit & confidential interviews",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Internal Audit (សវនកម្មផ្ទៃក្នុង)",
    floor: "Level 5 (Floor 5) - Finance & Audit",
    floorShort: "Floor 5",
    capacity: 6,
    size: "24 m²",
    category: "Small Room",
    description: "Confidential soundproof suite designed for 2 to 6 participants. Optimal for sensitive financial oversight hearings and executive consultations.",
    descriptionKh: "បន្ទប់ស្ងប់ស្ងាត់សម្រាប់កិច្ចប្រជុំតូច ពិភាក្សាការងារសម្ងាត់ ឬការសម្ភាសន៍បុគ្គលិក។",
    features: [
      "High-Density Acoustic Panels",
      "Dual 4K Workstation Monitors",
      "Encrypted VoIP Phone",
      "Dedicated Power & Data Pods"
    ],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Reserved",
    isPrivate: true,
    upcomingSlot: "Reserved 11:00 AM - 01:00 PM",
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
    name: "ទន្លេសេកុង - Sekong River",
    subtitle: "Grand central auditorium for symposiums & town halls",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "General Secretariat (អគ្គលេខាធិការដ្ឋាន)",
    floor: "Level 18 (Floor 18) - Executive Suite",
    floorShort: "Floor 18",
    capacity: 60,
    size: "180 m²",
    category: "Grand Hall",
    description: "Prestigious central banking amphitheater auditorium featuring dual laser projection systems, automated broadcast PTZ cameras, and simultaneous translation booths.",
    descriptionKh: "សាលសន្និសីទធំសម្រាប់សិក្ខាសាលាទូទៅ បទបង្ហាញថ្នាក់ជាតិ និងកិច្ចប្រជុំពេញអង្គ។",
    features: [
      "Dual Laser 4K Projectors",
      "Wireless Shure Lapel System",
      "Executive Stage & Smart Lectern",
      "Multi-Angle Broadcast Rig",
      "Simultaneous Translation Booths"
    ],
    image: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-105",
    name: "ទន្លេសេសាន - Sesan River",
    subtitle: "Engineering innovation hub & Bakong fintech lab",
    province: "Phnom Penh",
    location: "National Bank of Cambodia, IT Department",
    branch: "Phnom Penh",
    department: "Core Banking Development (អភិវឌ្ឍន៍ប្រព័ន្ធធនាគារ)",
    floor: "Floor 3 - Core Banking & Networks",
    floorShort: "Floor 3",
    capacity: 14,
    size: "48 m²",
    category: "Tech Room",
    description: "Cutting-edge engineering sprint studio with multi-screen staging pipelines, direct gigabit switches, and low-latency testing environments for Bakong blockchain.",
    descriptionKh: "បន្ទប់បច្ចេកវិទ្យាទំនើបបំពាក់អេក្រង់ភ្លោះ និងបណ្តាញល្បឿនលឿនសម្រាប់ក្រុមវិស្វករ IT និង Bakong។",
    features: [
      "Triple 65-inch Dev Dashboards",
      "Direct Fiber Switch Access",
      "Full-Room Video Call Soundbar",
      "Magnetic Glass Architecture Board"
    ],
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-106",
    name: "ទន្លេស្រែពក - Srepok River",
    subtitle: "Ground-floor reception briefing suite for delegations",
    province: "Phnom Penh",
    location: "National Bank of Cambodia (Phnom Penh branch)",
    branch: "Phnom Penh",
    department: "Public Banking & Teller Services (សេវាធនាគារសាធារណៈ)",
    floor: "Ground Floor - Banking Hall & Tellers",
    floorShort: "Ground Floor",
    capacity: 10,
    size: "35 m²",
    category: "Visitor Room",
    description: "Barrier-free ground level briefing chamber specifically designed to welcome external commercial bank delegations and inter-agency representatives.",
    descriptionKh: "បន្ទប់ងាយស្រួលចេញចូលនៅជាន់ផ្ទាល់ដី ស័ក្តិសមសម្រាប់ទទួលភ្ញៀវជាតិ និងអន្តរជាតិ។",
    features: [
      "Commercial Smart Screen",
      "Jabra Conference Speakerphone",
      "Ergonomic Lounge Chairs",
      "Guest Portal Access"
    ],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-107",
    name: "ស្ទឹងសែន - Stung Sen River",
    subtitle: "High-security executive suite for financial oversight",
    province: "Phnom Penh",
    location: "National Bank of Cambodia - Headquarters",
    branch: "Phnom Penh",
    department: "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
    floor: "Level 5 (Floor 5) - Finance & Audit",
    floorShort: "Floor 5",
    capacity: 8,
    size: "32 m²",
    category: "Private Office",
    description: "Exclusive leadership consultation suite featuring cryptographic teleconference facilities and private biometric access controls.",
    descriptionKh: "ការិយាល័យប្រជុំថ្នាក់ដឹកនាំសម្ងាត់ បំពាក់ដោយតុប្រតិបត្តិ និងប្រព័ន្ធទំនាក់ទំនងសុវត្ថិភាព។",
    features: [
      "Executive Hardwood Board Table",
      "Encrypted Telepresence Rig",
      "Secure Wireless Display",
      "Biometric Access Verified"
    ],
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: true,
    upcomingSlot: "Available All Day",
    roomOwner: {
      id: "OWNER-VANCE",
      name: "Jonathan Vance",
      title: "Senior Finance Officer",
      department: "Finance & Accounting",
      phone: "Ext. 8421",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    }
  },
  {
    id: "ROOM-108",
    name: "ស្ទឹងសង្កែ - Stung Sangker River",
    subtitle: "Provincial leadership boardroom with direct HQ fiber link",
    province: "Battambang",
    location: "Battambang Provincial Branch",
    branch: "Battambang",
    department: "Branch Management",
    floor: "Floor 2 - Branch Management & Boardroom",
    floorShort: "Floor 2",
    capacity: 16,
    size: "55 m²",
    category: "Regional Boardroom",
    description: "Regional executive boardroom located at Battambang Provincial Branch, equipped with high-speed video link to Phnom Penh HQ.",
    descriptionKh: "បន្ទប់ប្រជុំថ្នាក់ដឹកនាំប្រចាំខេត្តបាត់ដំបង ជាប់ដងស្ទឹងសង្កែ បំពាក់ដោយប្រព័ន្ធវីដេអូតភ្ជាប់ជាមួយទីស្នាក់ការកណ្តាល។",
    features: [
      "Video Conference Rig (HQ Direct Link)",
      "Large 4K Presentation Screen",
      "Wireless Table Microphones",
      "Interactive Whiteboard & Markers",
      "High-Speed Branch Wi-Fi"
    ],
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-109",
    name: "ស្ទឹងសៀមរាប - Stung Siem Reap River",
    subtitle: "Inter-bank summit suite & provincial center",
    province: "Siem Reap",
    location: "Siem Reap Provincial Branch",
    branch: "Siem Reap",
    department: "Branch Management & Executive Office",
    floor: "Floor 2 - Executive & Meeting Suites",
    floorShort: "Floor 2",
    capacity: 20,
    size: "70 m²",
    category: "Executive Suite",
    description: "Prestigious meeting suite at Siem Reap Provincial Branch, designed for inter-bank summits and provincial leadership discussions.",
    descriptionKh: "បន្ទប់ប្រជុំកម្រិតខ្ពស់ប្រចាំសាខាខេត្តសៀមរាប សម្រាប់កិច្ចប្រជុំធនាគារ កិច្ចសហប្រតិបត្តិការបេតិកភណ្ឌ និងគណៈប្រតិភូជាតិ-អន្តរជាតិ។",
    features: [
      "4K Dual Display Screens",
      "HD Video Conferencing (HQ Link)",
      "Wireless Presentation Pods",
      "Executive Leather Seating",
      "Dedicated Refreshment Lounge"
    ],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
  },
  {
    id: "ROOM-110",
    name: "ស្ទឹងពោធិ៍សាត់ - Stung Pursat River",
    subtitle: "Interactive seminar amphitheater for banking symposiums",
    province: "Phnom Penh",
    location: "National Bank of Cambodia, Sen Sok",
    branch: "Phnom Penh",
    department: "Center for Banking Studies - CBS",
    floor: "Floor 2 - Training Suites & Seminar Rooms",
    floorShort: "Floor 2",
    capacity: 32,
    size: "110 m²",
    category: "Seminar Room",
    description: "State-of-the-art seminar suite at NBC Sen Sok Campus, ideal for banking training programs, financial workshops, and certification symposiums.",
    descriptionKh: "បន្ទប់បណ្តុះបណ្តាល និងសិក្ខាសាលាទំនើបនៅមជ្ឈមណ្ឌលសិក្សាធនាគារ (CBS) សែនសុខ សម្រាប់វគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈធនាគារ។",
    features: [
      "Dual Interactive Whiteboards",
      "HD Laser Projection Array",
      "Modular Training Desks",
      "Wireless Microphone System",
      "High-Density Wi-Fi Access"
    ],
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false,
    upcomingSlot: "Available All Day",
    roomOwner: null
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
