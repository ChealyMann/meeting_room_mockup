// Mock Data for Meeting Room Booking System
// Written in clear, simple A2 English with official NBC Organizational Hierarchy

const NBC_ORGANIZATION = [
  {
    id: "DIR-BOD",
    name: "Board & Executive Office",
    departments: [
      { id: "DEPT-BOD", name: "Board of Directors & Cabinet", defaultRoomId: "ROOM-101" },
      { id: "DEPT-ADV", name: "Advisors & Expert Committees", defaultRoomId: "ROOM-101" }
    ]
  },
  {
    id: "DIR-GS",
    name: "General Secretariat",
    departments: [
      { id: "DEPT-HR", name: "Human Resources", defaultRoomId: "ROOM-106" },
      { id: "DEPT-ADM", name: "Administration & Logistics", defaultRoomId: "ROOM-106" },
      { id: "DEPT-FAC", name: "Asset & Facilities", defaultRoomId: "ROOM-106" },
      { id: "DEPT-CBS", name: "Banking Studies Institute (CBS)", defaultRoomId: "ROOM-102" },
      { id: "DEPT-COM", name: "Internal Communications", defaultRoomId: "ROOM-106" }
    ]
  },
  {
    id: "DIR-POLICY",
    name: "Policy & Cooperation",
    departments: [
      { id: "DEPT-STAT", name: "Statistics Department", defaultRoomId: "ROOM-102" },
      { id: "DEPT-MON", name: "Monetary Policy & Research", defaultRoomId: "ROOM-102" },
      { id: "DEPT-STAB", name: "Financial Stability", defaultRoomId: "ROOM-102" },
      { id: "DEPT-INTL", name: "International Cooperation", defaultRoomId: "ROOM-101" },
      { id: "DEPT-PR", name: "Public Relations Unit", defaultRoomId: "ROOM-106" }
    ]
  },
  {
    id: "DIR-OPS",
    name: "Banking Operations",
    departments: [
      { id: "DEPT-RES", name: "Exchange & Reserves", defaultRoomId: "ROOM-101" },
      { id: "DEPT-ACC", name: "Accounting & Settlements", defaultRoomId: "ROOM-102" },
      { id: "DEPT-PAY", name: "Payment Systems (Bakong)", defaultRoomId: "ROOM-105" },
      { id: "DEPT-BANK", name: "Banking Services", defaultRoomId: "ROOM-106" },
      { id: "DEPT-AUD", name: "Internal Audit", defaultRoomId: "ROOM-103" }
    ]
  },
  {
    id: "DIR-IT",
    name: "Information Technology (IT)",
    departments: [
      { id: "DEPT-INFRA", name: "IT Infrastructure & Networks", defaultRoomId: "ROOM-105" },
      { id: "DEPT-DEV", name: "Core Banking Development", defaultRoomId: "ROOM-105" },
      { id: "DEPT-SEC", name: "Cybersecurity & Info Safety", defaultRoomId: "ROOM-105" },
      { id: "DEPT-FINTECH", name: "FinTech & Innovation", defaultRoomId: "ROOM-105" }
    ]
  },
  {
    id: "DIR-SUP",
    name: "Banking Supervision",
    departments: [
      { id: "DEPT-SUP1", name: "Supervision Dept 1 & 2", defaultRoomId: "ROOM-102" },
      { id: "DEPT-OFFSITE", name: "Off-Site & Regulations", defaultRoomId: "ROOM-102" }
    ]
  },
  {
    id: "DIR-INSP",
    name: "General Inspectorate",
    departments: [
      { id: "DEPT-INSP-GEN", name: "General Inspection", defaultRoomId: "ROOM-103" },
      { id: "DEPT-INSP-TECH", name: "Technical Inspection", defaultRoomId: "ROOM-103" }
    ]
  },
  {
    id: "DIR-CASH",
    name: "Cash Management & Issue",
    departments: [
      { id: "DEPT-CASH", name: "Cash Management", defaultRoomId: "ROOM-106" },
      { id: "DEPT-PRINT", name: "Currency Issue & Quality", defaultRoomId: "ROOM-106" }
    ]
  },
  {
    id: "DIR-RISK",
    name: "Risk Management",
    departments: [
      { id: "DEPT-RISK", name: "Risk Analysis & Compliance", defaultRoomId: "ROOM-103" },
      { id: "DEPT-DATA", name: "Data Governance", defaultRoomId: "ROOM-103" }
    ]
  },
  {
    id: "DIR-CAFIU",
    name: "Financial Intelligence (CAFIU)",
    departments: [
      { id: "DEPT-AML", name: "AML/CFT & Investigation", defaultRoomId: "ROOM-103" },
      { id: "DEPT-INTL-AML", name: "International Policy", defaultRoomId: "ROOM-103" }
    ]
  }
];

const NBC_PROVINCES = [
  {
    id: "PROV-PP",
    name: "Phnom Penh",
    locations: [
      {
        id: "LOC-PP-HQ",
        name: "National Bank of Cambodia - Headquarters",
        shortName: "NBC Headquarters",
        address: "#88 Street 102, corner Street 19, Wat Phnom, Daun Penh",
        mapQuery: "National Bank of Cambodia Headquarters, Wat Phnom, Phnom Penh",
        departments: [
          "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
          "Advisors & Expert Committees (ទីប្រឹក្សា & គណៈកម្មាធិការ)",
          "General Secretariat (អគ្គលេខាធិការដ្ឋាន)",
          "Human Resources (ធនធានមនុស្ស)",
          "Administration & Logistics (រដ្ឋបាល & ភស្តុភារ)",
          "Asset & Facilities (ទ្រព្យសកម្ម & អាគារ)",
          "Monetary Policy & Research (គោលនយោបាយរូបិយវត្ថុ & ស្រាវជ្រាវ)",
          "Financial Stability (ស្ថិរភាពហិរញ្ញវត្ថុ)",
          "Statistics Department (ស្ថិតិ)",
          "International Cooperation (កិច្ចសហប្រតិបត្តិការអន្តរជាតិ)",
          "Banking Supervision (ត្រួតពិនិត្យធនាគារ)",
          "Off-Site & Regulations (បទប្បញ្ញត្តិ & ត្រួតពិនិត្យ)",
          "Exchange & Reserves (រូបិយប័ណ្ណ & ទុនបម្រុង)",
          "Accounting & Settlements (គណនេយ្យ & ទូទាត់)",
          "Internal Audit (សវនកម្មផ្ទៃក្នុង)",
          "Risk Analysis & Compliance (វិភាគហានិភ័យ & អនុលោមភាព)",
          "Financial Intelligence Unit - CAFIU (អង្គភាពស៊ើបការណ៍ហិរញ្ញវត្ថុ)"
        ],
        floors: [
          "Floor 18 - Executive Suite",
          "Floor 12 - Banking Studies & Policy",
          "Floor 5 - Finance & Audit",
          "Floor 3 - Board & Cabinet",
          "Ground Floor - Visitors & Public"
        ]
      },
      {
        id: "LOC-PP-BRANCH",
        name: "National Bank of Cambodia (Phnom Penh branch)",
        shortName: "Phnom Penh Branch",
        address: "#273, Street 110-67, Wat Phnom, Daun Penh",
        mapQuery: "National Bank of Cambodia Phnom Penh Branch, Street 110, Phnom Penh",
        departments: [
          "Branch Management & Administration",
          "Cash Operations & Vault (គ្រប់គ្រងសាច់ប្រាក់)",
          "Public Banking & Teller Services (សេវាធនាគារសាធារណៈ)",
          "Domestic Settlement & Clearing (ការទូទាត់ក្នុងស្រុក)",
          "Currency Issue & Quality (គុណភាពក្រដាសប្រាក់)"
        ],
        floors: [
          "Floor 2 - Branch Management & Operations",
          "Floor 1 - Vault & Cash Operations",
          "Ground Floor - Banking Hall & Tellers"
        ]
      },
      {
        id: "LOC-PP-IT",
        name: "National Bank of Cambodia, IT Department",
        shortName: "IT Department",
        address: "Building #32, Preah Ang Phanavong St. (240)",
        mapQuery: "National Bank of Cambodia, Preah Ang Phanavong St 240, Phnom Penh",
        departments: [
          "IT Infrastructure & Networks (ហេដ្ឋារចនាសម្ព័ន្ធ IT)",
          "Core Banking Development (អភិវឌ្ឍន៍ប្រព័ន្ធធនាគារ)",
          "Cybersecurity & Information Safety (សន្តិសុខបច្ចេកវិទ្យា)",
          "FinTech & Innovation - Bakong (បច្ចេកវិទ្យាហិរញ្ញវត្ថុ)",
          "IT Helpdesk & System Support (សេវាគាំទ្រ IT)",
          "Data Center & Network Operations (មជ្ឈមណ្ឌលទិន្នន័យ)"
        ],
        floors: [
          "Floor 4 - IT Management & Conference",
          "Floor 3 - Core Banking & Networks",
          "Floor 2 - Cybersecurity & FinTech",
          "Floor 1 - Helpdesk & Hardware Labs",
          "Ground Floor - Staging & Infrastructure"
        ]
      },
      {
        id: "LOC-PP-SENSOK",
        name: "National Bank of Cambodia, Sen Sok",
        shortName: "NBC Sen Sok Building",
        address: "Sen Sok, Phnom Penh",
        mapQuery: "Center for Banking Studies, Sen Sok, Phnom Penh",
        departments: [
          "Center for Banking Studies - CBS (វិទ្យាស្ថានបណ្តុះបណ្តាលធនាគារ)",
          "Training & Human Resource Development (បណ្តុះបណ្តាល)",
          "Disaster Recovery & Backup IT (មជ្ឈមណ្ឌលទិន្នន័យបម្រុង)",
          "Currency Processing & Quality Assurance (ត្រួតពិនិត្យក្រដាសប្រាក់)",
          "Archives, Logistics & Asset Depot (ប័ណ្ណសារដ្ឋាន & ភស្តុភារ)"
        ],
        floors: [
          "Floor 3 - Backup Data Center & Operations",
          "Floor 2 - Training Suites & Seminar Rooms",
          "Floor 1 - Center for Banking Studies (CBS)",
          "Ground Floor - Auditorium & Examination Hall"
        ]
      }
    ]
  },
  {
    id: "PROV-SR",
    name: "Siem Reap",
    locations: [
      {
        id: "LOC-SR-MAIN",
        name: "Siem Reap Provincial Branch",
        shortName: "Siem Reap Branch",
        address: "National Road 6, Svay Dangkum, Siem Reap",
        mapQuery: "National Bank of Cambodia Siem Reap Branch, National Road 6, Siem Reap",
        departments: [
          "Branch Management & Executive Office",
          "Cash Operations & Regional Vault",
          "Customer Banking & Counter Services",
          "Administration, Logistics & Facilities",
          "Branch IT & Network Support",
          "Regional Compliance & Internal Audit"
        ],
        floors: [
          "Floor 2 - Executive & Meeting Suites",
          "Floor 1 - Operations & Administration",
          "Ground Floor - Banking Hall & Vault"
        ]
      }
    ]
  },
  {
    id: "PROV-BB",
    name: "Battambang",
    locations: [
      {
        id: "LOC-BB-MAIN",
        name: "Battambang Provincial Branch",
        shortName: "Battambang Branch",
        address: "Street 1, Romchek 4, Battambang",
        mapQuery: "National Bank of Cambodia Battambang Branch, Street 1, Battambang",
        departments: [
          "Branch Management",
          "Regional Cash Vault & Distribution",
          "Banking Operations & Settlements",
          "Branch IT Support Unit",
          "General Administration & Logistics"
        ],
        floors: [
          "Floor 2 - Branch Management & Boardroom",
          "Floor 1 - Operations & Records",
          "Ground Floor - Customer Service & Vault"
        ]
      }
    ]
  },
  {
    id: "PROV-SHV",
    name: "Sihanoukville",
    locations: [
      {
        id: "LOC-SHV-MAIN",
        name: "Sihanoukville Provincial Branch",
        shortName: "Sihanoukville Branch",
        address: "Ekareach Street, Mittapheap, Sihanoukville",
        mapQuery: "National Bank of Cambodia Sihanoukville Branch, Ekareach Street, Sihanoukville",
        departments: [
          "Branch Management",
          "Coastal Cash Settlement & Treasury",
          "Corporate Banking & Port Finance",
          "Maritime Trade Financial Operations",
          "Branch IT & Cybersecurity Unit"
        ],
        floors: [
          "Floor 3 - Regional Conference Room",
          "Floor 2 - Management & Meeting Suites",
          "Floor 1 - Maritime & Settlements",
          "Ground Floor - Cash & Teller Services"
        ]
      }
    ]
  },
  {
    id: "PROV-KPC",
    name: "Kampong Cham",
    locations: [
      {
        id: "LOC-KPC-MAIN",
        name: "Kampong Cham Provincial Branch",
        shortName: "Kampong Cham Branch",
        address: "Preah Monivong Boulevard, Kampong Cham",
        mapQuery: "National Bank of Cambodia Kampong Cham Branch, Preah Monivong Boulevard, Kampong Cham",
        departments: [
          "Branch Management",
          "Agricultural Banking Services",
          "Cash Management & Vault",
          "General Administration & Logistics",
          "Local IT Support"
        ],
        floors: [
          "Floor 2 - Meeting Room & Management",
          "Floor 1 - Branch Administration",
          "Ground Floor - Main Banking Hall & Vault"
        ]
      }
    ]
  }
];

const NBC_LOCATIONS = NBC_PROVINCES; // Compatibility alias
const NBC_BRANCHES = NBC_PROVINCES;  // Compatibility alias

const INITIAL_ROOMS_DATA = [
  {
    id: "ROOM-101",
    name: "ទន្លេមេគង្គ - Mekong River",
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
    image: "assets/rooms/boardroom-alpha.jpg",
    images: [
      "assets/rooms/boardroom-alpha.jpg",
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
    name: "ទន្លេសាប - Tonle Sap River",
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
    image: "assets/rooms/innovation-hub.jpg",
    images: [
      "assets/rooms/innovation-hub.jpg",
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
    name: "ទន្លេបាសាក់ - Bassac River",
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
    image: "assets/rooms/focus-room.jpg",
    images: [
      "assets/rooms/focus-room.jpg",
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
    name: "ទន្លេសេកុង - Sekong River",
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
    image: "assets/rooms/summit-suite.jpg",
    images: [
      "assets/rooms/summit-suite.jpg",
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
    name: "ទន្លេសេសាន - Sesan River",
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
    image: "assets/rooms/tech-studio.jpg",
    images: [
      "assets/rooms/tech-studio.jpg",
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
    name: "ទន្លេស្រែពក - Srepok River",
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
    image: "assets/rooms/ground-briefing.jpg",
    images: [
      "assets/rooms/ground-briefing.jpg",
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
    name: "ស្ទឹងសែន - Stung Sen River",
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
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
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
    name: "ស្ទឹងសង្កែ - Stung Sangker River",
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
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
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
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  },
  {
    id: "ROOM-110",
    name: "ស្ទឹងពោធិ៍សាត់ - Stung Pursat River",
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
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "Available",
    isPrivate: false
  }
];

const INITIAL_REQUESTS_DATA = [];

const INITIAL_IT_STAFF = [
  {
    id: "STAFF-01",
    name: "Alex Chen",
    title: "Audio & Video Technician",
    phone: "Ext. 4401",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "STAFF-02",
    name: "Marcus Vance",
    title: "Senior IT Support Specialist",
    phone: "Ext. 4410",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "STAFF-03",
    name: "Elena Rostova",
    title: "Network & Hardware Engineer",
    phone: "Ext. 4422",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  }
];

const INITIAL_NOTIFICATIONS = [];
