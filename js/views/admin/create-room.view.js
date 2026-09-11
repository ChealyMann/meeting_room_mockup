// Admin Create Room Facility View Component (view-create-room)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

// Standard IT Equipment & Technical Services Catalog (reused from Booking Step 3)
const IT_EQUIPMENT_ITEMS = [
  {
    id: 'it-video',
    name: 'Video Conference Setup',
    icon: 'lucide:video',
    desc: 'Zoom or Microsoft Teams room test & camera',
    defaultSelected: true,
    aliases: ['Video Call Rig (Zoom / Teams)', 'Video Call Camera', 'Fast Video Call Rig']
  },
  {
    id: 'it-tv',
    name: 'Presentation Screen & TV',
    icon: 'lucide:tv',
    desc: 'Laptop to TV display, HDMI & wireless stream',
    defaultSelected: true,
    aliases: ['Large Video Screen (4K TV)', 'Large 4K Presentation Screen', '4K Dual Display Screens', 'Smart TV Screen', '2 Big Display Screens']
  },
  {
    id: 'it-mic',
    name: 'Microphones & Audio Setup',
    icon: 'lucide:mic',
    desc: 'Executive table mics & clear room loudspeakers',
    defaultSelected: true,
    aliases: ['Table Microphones & Speakers', 'Wireless Table Microphones', 'Wireless Microphones', 'Speakerphone Unit']
  },
  {
    id: 'it-whiteboard',
    name: 'Smart Digital Whiteboard',
    icon: 'lucide:monitor-play',
    desc: 'Interactive touch display & live notes export',
    defaultSelected: false,
    aliases: ['Touchscreen TV', 'Dual Interactive Whiteboards', 'Whiteboard & Markers', 'Glass Whiteboard']
  },
  {
    id: 'it-stream',
    name: 'Session Recording & Stream',
    icon: 'lucide:disc',
    desc: 'HD meeting archive & private video stream link',
    defaultSelected: false,
    aliases: ['Live Streaming Camera']
  },
  {
    id: 'it-standby',
    name: 'Dedicated IT Standby Staff',
    icon: 'lucide:user-check',
    desc: 'On-site technical specialist throughout session',
    defaultSelected: false,
    aliases: []
  },
  {
    id: 'it-laptop',
    name: 'Presenter Laptop & Clicker',
    icon: 'lucide:laptop',
    desc: 'Pre-loaded slides & wireless laser clicker',
    defaultSelected: false,
    aliases: []
  },
  {
    id: 'it-headsets',
    name: 'Translation Audio Headsets',
    icon: 'lucide:headphones',
    desc: 'Multi-language audio receivers for foreign guests',
    defaultSelected: false,
    aliases: []
  },
  {
    id: 'it-wifi',
    name: 'High-Density Wi-Fi Access',
    icon: 'lucide:wifi',
    desc: 'Dedicated high-bandwidth router for large groups',
    defaultSelected: true,
    aliases: ['High-Speed Wi-Fi', 'High-Speed Encrypted Wi-Fi', 'Guest Wi-Fi', 'Ethernet Cable Ports']
  }
];

class CreateRoomView {
  constructor() {
    this.id = 'create-room';
    this.currentStep = 1;
    this.selectedITFeatures = new Set([
      'Presentation Screen & TV',
      'Video Conference Setup',
      'Microphones & Audio Setup',
      'High-Density Wi-Fi Access'
    ]);
    this.template = `
      <style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      </style>
      <!-- Top Action Breadcrumb Bar with 3-Step Wizard Tracker -->
      <div class="pb-2 mb-4 border-b border-stone-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button type="button" onclick="app.navigateTo('book-room')" class="h-8 px-3 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition shadow-2xs shrink-0 cursor-pointer">
              <span class="iconify text-stone-400 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
              <span>All Rooms</span>
            </button>
            <div class="flex items-center space-x-1.5 text-xs text-stone-500 font-medium truncate">
              <span>Directory</span>
              <span>/</span>
              <span>Facilities</span>
              <span>/</span>
              <span class="text-amber-800 font-bold">Add Meeting Room</span>
            </div>
          </div>

          <!-- Wizard Step Navigation Indicator (3 Steps) -->
          <div class="flex items-center space-x-1 sm:space-x-1 text-xs">
            <button type="button" onclick="app.goToCreateStep(1)" id="create-wizard-tab-1" class="wizard-step-tab active h-8 px-2.5 rounded-md bg-[#FEF2F2] border border-red-200 text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0">
              <span class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Room Profile</span>
            </button>
            <span class="iconify text-stone-300 text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
            <button type="button" onclick="app.goToCreateStep(2)" id="create-wizard-tab-2" class="wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
              <span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Location Details</span>
            </button>
            <span class="iconify text-stone-300 text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
            <button type="button" onclick="app.goToCreateStep(3)" id="create-wizard-tab-3" class="wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
              <span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Amenities & Media</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Form Container -->
      <form id="create-room-form" class="flex-1 flex flex-col min-h-0" action="javascript:void(0);" onsubmit="event.preventDefault(); app.handleCreateRoomSubmit(event); return false;">
        
        <!-- ==================== STEP 1: ROOM PROFILE ==================== -->
        <div id="create-step-1" class="flex flex-col flex-1 min-h-0 animate-fade-in">
          <div class="flex-1 overflow-y-auto space-y-5 pb-6 pr-1 hide-scrollbar">
          <!-- Privacy & Access Settings -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div class="flex items-center space-x-2">
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Private Room Settings</h3>
              </div>
              <span class="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Access</span>
            </div>

            <div class="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
              <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-xs text-stone-900">Private Room</span>
                  <span id="cr-pvt-badge" class="px-2 py-0.2 rounded text-[9px] font-bold bg-stone-200 text-stone-700 uppercase">Public Room</span>
                </div>
                <p class="text-[11px] text-stone-500 leading-snug">
                  Private rooms need 2 approvals: Room Owner first, then Pitika.
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" id="cr-is-private" onchange="app.toggleCreateRoomPrivateOwner(this.checked)" class="sr-only peer" />
                <div class="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <!-- Conditional Owner Details -->
            <div id="cr-owner-fields-container" class="hidden p-4 bg-amber-50/70 rounded-xl border border-amber-300/80 space-y-3.5 animate-fade-in">
              <div class="flex items-center justify-between pb-1 border-b border-amber-200/60">
                <div class="flex items-center space-x-2">
                  <span class="iconify text-amber-800 text-sm" data-icon="lucide:shield-check"></span>
                  <h4 class="font-bold text-xs text-amber-950">Room Owner (Approver)</h4>
                </div>
                <span class="text-[10px] text-amber-900 font-medium">First Approver</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="form-field-group">
                  <label class="form-label" for="cr-owner-name"><span class="text-amber-950">Owner Name <span class="text-red-700">*</span></span></label>
                  <input type="text" id="cr-owner-name" placeholder="e.g. Dr. Chea Serey Cabinet" class="bank-input text-xs bg-white" />
                </div>
                <div class="form-field-group">
                  <label class="form-label" for="cr-owner-title"><span class="text-amber-950">Job Title</span></label>
                  <input type="text" id="cr-owner-title" placeholder="e.g. Executive Board Secretary" class="bank-input text-xs bg-white" />
                </div>
                <div class="form-field-group">
                  <label class="form-label" for="cr-owner-dept"><span class="text-amber-950">Department</span></label>
                  <input type="text" id="cr-owner-dept" placeholder="e.g. Board & Executive Office" class="bank-input text-xs bg-white" />
                </div>
                <div class="form-field-group">
                  <label class="form-label" for="cr-owner-phone"><span class="text-amber-950">Phone / Extension</span></label>
                  <input type="text" id="cr-owner-phone" placeholder="e.g. Ext. 8801" class="bank-input text-xs bg-white" />
                </div>
              </div>
              <div class="form-field-group">
                <label class="form-label" for="cr-owner-avatar">
                  <span class="text-amber-950">Owner Photo URL</span>
                  <span class="helper">Optional photo link</span>
                </label>
                <input type="url" id="cr-owner-avatar" placeholder="https://images.unsplash.com/photo-..." class="bank-input text-xs bg-white" />
              </div>
            </div>
          </div>

          <!-- Room Specifications -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div class="flex items-center space-x-2">
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Room Specifications & Capacity</h3>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="form-field-group">
                <label class="form-label" for="cr-category"><span>Room Type <span class="text-red-700">*</span></span></label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:tag" data-stroke-width="1.8"></span>
                  <select id="cr-category" required class="bank-input bank-input-with-icon">
                    <option value="Executive Room">Executive Room</option>
                    <option value="Team Room" selected>Team Room</option>
                    <option value="Small Room">Small Room</option>
                    <option value="Grand Hall">Grand Hall</option>
                    <option value="Tech Room">Tech Room</option>
                    <option value="Visitor Room">Visitor Room</option>
                    <option value="Private Office">Private Office</option>
                  </select>
                </div>
              </div>
              <div class="form-field-group">
                <label class="form-label" for="cr-status"><span>Status</span></label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:activity" data-stroke-width="1.8"></span>
                  <select id="cr-status" class="bank-input bank-input-with-icon">
                    <option value="Available" selected>Available for Booking</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="form-field-group">
                <label class="form-label" for="cr-capacity">
                  <span>Capacity <span class="text-red-700">*</span></span>
                  <span class="helper">Max seats</span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:users" data-stroke-width="1.8"></span>
                  <input type="number" id="cr-capacity" required min="1" max="150" value="16" class="bank-input bank-input-with-icon font-semibold" />
                </div>
              </div>
              <div class="form-field-group">
                <label class="form-label" for="cr-size">
                  <span>Room Size <span class="text-red-700">*</span></span>
                  <span class="helper">e.g. 55 sq m</span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:maximize-2" data-stroke-width="1.8"></span>
                  <input type="text" id="cr-size" required value="55 sq m" placeholder="e.g. 55 sq m" class="bank-input bank-input-with-icon" />
                </div>
              </div>
            </div>
          </div>

          </div>
          <div class="shrink-0 pt-4 pb-2 flex justify-end border-t border-stone-200 mt-auto">
            <button type="button" onclick="app.goToCreateStep(2)" class="btn-primary py-2.5 px-6 rounded-lg text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition hover:scale-101 cursor-pointer">
              <span>Next: Location Details</span>
              <span class="iconify text-base text-white" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>

        <!-- ==================== STEP 2: LOCATION DETAILS ==================== -->
        <div id="create-step-2" class="hidden flex flex-col flex-1 min-h-0 animate-fade-in">
          <div class="flex-1 overflow-y-auto space-y-5 pb-6 pr-1 hide-scrollbar">
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div class="flex items-center space-x-2">
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Room Location</h3>
              </div>
            </div>

            <div class="form-field-group">
              <label class="form-label" for="cr-province">
                <span>Province <span class="text-red-700">*</span></span>
                <span class="helper" id="cr-province-helper">Select province or city</span>
              </label>
              <div class="relative" id="cr-province-container">
                <span class="iconify input-icon-wrapper text-stone-400" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                <input type="text" id="cr-province" required autocomplete="off" placeholder="Select province or city (e.g. Phnom Penh, Siem Reap)..." value="Phnom Penh" class="bank-input bank-input-with-icon pr-8" />
                <button type="button" id="cr-province-toggle" tabindex="-1" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer" title="Show provinces">
                  <span class="iconify text-xs" data-icon="lucide:chevron-down"></span>
                </button>
                <div id="cr-province-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#E9E3DD] rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto py-1 animate-scale-in"></div>
              </div>
            </div>

            <div class="form-field-group">
              <label class="form-label" for="cr-location">
                <span>Location <span class="text-red-700">*</span></span>
                <span class="helper" id="cr-location-helper">Filtered by Phnom Penh</span>
              </label>
              <div class="relative" id="cr-location-container">
                <span class="iconify input-icon-wrapper text-stone-400" data-icon="lucide:building-2" data-stroke-width="1.8"></span>
                <input type="text" id="cr-location" required autocomplete="off" placeholder="Select location" value="National Bank of Cambodia - Headquarters" class="bank-input bank-input-with-icon pr-8" />
                <button type="button" id="cr-location-toggle" tabindex="-1" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer" title="Show locations">
                  <span class="iconify text-xs" data-icon="lucide:chevron-down"></span>
                </button>
                <div id="cr-location-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#E9E3DD] rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto py-1 animate-scale-in"></div>
              </div>
            </div>

            <div class="form-field-group hidden" id="cr-dept-field-group">
              <label class="form-label" for="cr-department">
                <span>Department <span class="text-red-700">*</span></span>
                <span class="helper" id="cr-dept-helper">Filtered by NBC Headquarters</span>
              </label>
              <div class="relative" id="cr-dept-container">
                <span class="iconify input-icon-wrapper text-stone-400" data-icon="lucide:building" data-stroke-width="1.8"></span>
                <input type="text" id="cr-department" autocomplete="off" placeholder="Select department" value="Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)" class="bank-input bank-input-with-icon pr-8" />
                <button type="button" id="cr-dept-toggle" tabindex="-1" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer" title="Show departments">
                  <span class="iconify text-xs" data-icon="lucide:chevron-down"></span>
                </button>
                <div id="cr-dept-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#E9E3DD] rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto py-1 animate-scale-in"></div>
              </div>
            </div>

            <div class="form-field-group">
              <label class="form-label" for="cr-floor">
                <span>Floor <span class="text-red-700">*</span></span>
                <span class="helper" id="cr-floor-helper">Filtered by NBC Headquarters</span>
              </label>
              <div class="relative" id="cr-floor-container">
                <span class="iconify input-icon-wrapper text-stone-400" data-icon="lucide:layers" data-stroke-width="1.8"></span>
                <input type="text" id="cr-floor" required autocomplete="off" placeholder="Select floor" value="Level 18 (Floor 18) - Executive Suite" class="bank-input bank-input-with-icon pr-8" />
                <button type="button" id="cr-floor-toggle" tabindex="-1" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer" title="Show floors">
                  <span class="iconify text-xs" data-icon="lucide:chevron-down"></span>
                </button>
                <div id="cr-floor-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#E9E3DD] rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto py-1 animate-scale-in"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="form-field-group">
                <label class="form-label" for="cr-name">
                  <span>Meeting Room Name <span class="text-red-700">*</span></span>
                  <span class="helper">Name on the door</span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper text-stone-400" data-icon="lucide:door-open" data-stroke-width="1.8"></span>
                  <input type="text" id="cr-name" required placeholder="Enter room name..." value="Sihanouk Executive Boardroom" class="bank-input bank-input-with-icon" />
                </div>
              </div>
              <div class="form-field-group">
                <label class="form-label" for="cr-door-code">
                  <span>Door Code</span>
                  <span class="helper">Optional</span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:hash" data-stroke-width="1.8"></span>
                  <input type="text" id="cr-door-code" placeholder="e.g. B-1804" class="bank-input bank-input-with-icon" />
                </div>
              </div>
            </div>

            <div class="form-field-group">
              <label class="form-label" for="cr-description">
                <span>Room Description</span>
                <span class="helper">Visible to all staff</span>
              </label>
              <textarea id="cr-description" rows="2" placeholder="Write a short description or helpful notes for people booking this room..." class="bank-input text-xs leading-relaxed resize-none"></textarea>
            </div>

            <!-- Interactive Google Map Location Preview -->
            <div class="pt-3 border-t border-stone-100 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5">
                  <span class="iconify text-red-900 text-sm" data-icon="lucide:map-pin"></span>
                  <span class="text-xs font-bold text-stone-900">Google Map Location</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/80">Live</span>
                </div>
                <a id="cr-map-preview-link" href="https://www.google.com/maps/search/?api=1&query=National+Bank+of+Cambodia+Headquarters" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-red-900 hover:text-red-700 flex items-center space-x-1 transition cursor-pointer">
                  <span>Open in Maps</span>
                  <span class="iconify text-xs" data-icon="lucide:external-link"></span>
                </a>
              </div>
              <div class="text-[11px] text-stone-500 truncate" id="cr-map-preview-address">
                NBC Headquarters &bull; #88 Street 102, corner Street 19, Wat Phnom, Daun Penh
              </div>
              <div class="relative w-full h-44 rounded-lg overflow-hidden border border-[#E9E3DD] bg-stone-100 shadow-inner">
                <iframe
                  id="cr-map-preview-iframe"
                  title="Google Map Location Preview"
                  width="100%"
                  height="100%"
                  style="border:0;"
                  loading="lazy"
                  src="https://maps.google.com/maps?q=National%20Bank%20of%20Cambodia%20Headquarters%2C%20Wat%20Phnom%2C%20Phnom%20Penh&t=&z=16&ie=UTF8&iwloc=&output=embed">
                </iframe>
              </div>
            </div>
          </div>

          </div>
          <div class="shrink-0 pt-4 pb-2 flex items-center justify-between border-t border-stone-200 mt-auto">
            <button type="button" onclick="app.goToCreateStep(1)" class="h-9 px-4 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition cursor-pointer">
              <span class="iconify text-sm" data-icon="lucide:arrow-left"></span>
              <span>Back</span>
            </button>
            <button type="button" onclick="app.goToCreateStep(3)" class="btn-primary py-2.5 px-6 rounded-lg text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition hover:scale-101 cursor-pointer">
              <span>Next: Amenities & Media</span>
              <span class="iconify text-base text-white" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>

        <!-- ==================== STEP 3: AMENITIES & MEDIA ==================== -->
        <div id="create-step-3" class="hidden flex flex-col flex-1 min-h-0 animate-fade-in">
          <div class="flex-1 min-h-0 pb-3 flex flex-col overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 flex-1 min-h-0 items-stretch">
              
              <!-- LEFT PART: ROOM PHOTOS (UPLOAD-BASED) -->
              <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col min-h-0 overflow-hidden">
                <div class="flex items-center justify-between border-b border-stone-100 pb-2.5 shrink-0">
                  <div class="flex items-center space-x-2">
                    <div class="w-7 h-7 rounded-lg bg-red-100 text-[#991B1B] flex items-center justify-center text-xs font-bold shrink-0">
                      <span class="iconify" data-icon="lucide:image" data-stroke-width="1.8"></span>
                    </div>
                    <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Room Photos</h3>
                  </div>
                  <span id="cr-photos-counter-text" class="text-[11px] font-bold text-stone-600">1 photo ready</span>
                </div>

                <!-- Internally Scrollable Photos Body -->
                <div class="flex-1 min-h-0 flex flex-col space-y-3 pt-2.5 overflow-y-auto hide-scrollbar">

                  <!-- COVER PHOTO SECTION (BIGGER PREVIEW BANNER) -->
                  <div class="space-y-1.5 shrink-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold text-stone-800">Primary Cover Photo</span>
                      <button type="button" onclick="document.getElementById('cr-cover-upload').click()" class="text-[11px] font-semibold text-[#991B1B] hover:underline flex items-center space-x-1 cursor-pointer">
                        <span class="iconify text-xs" data-icon="lucide:upload" data-stroke-width="2"></span>
                        <span>Upload Cover</span>
                      </button>
                    </div>

                    <!-- Live Card Preview Banner with Drag & Drop Cover Support -->
                    <div id="cr-cover-dropzone"
                         ondragover="app.handleCoverDragOver(event)"
                         ondragleave="app.handleCoverDragLeave(event)"
                         ondrop="app.handleCoverDrop(event)"
                         class="relative h-48 sm:h-52 md:h-56 rounded-xl overflow-hidden bg-stone-900 border border-[#E9E3DD] shadow-2xs group shrink-0 transition">
                      <img id="cr-image-preview" src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" alt="Preview" class="w-full h-full object-cover transition duration-300" />
                      <div class="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-black/25 pointer-events-none"></div>

                      <!-- Top Controls -->
                      <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                        <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10.5px] font-semibold text-white tracking-wide border border-white/20">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live Preview</span>
                        </div>
                        <button type="button" onclick="document.getElementById('cr-cover-upload').click()" class="h-7 px-3 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium border border-white/25 flex items-center space-x-1.5 transition cursor-pointer shadow-xs">
                          <span class="iconify text-xs" data-icon="lucide:camera" data-stroke-width="1.8"></span>
                          <span>Change Photo</span>
                        </button>
                      </div>

                      <!-- Drag Drop Indicator Overlay -->
                      <div id="cr-cover-drag-overlay" class="hidden absolute inset-0 bg-[#991B1B]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none transition">
                        <span class="iconify text-3xl mb-1.5 text-white" data-icon="lucide:upload-cloud" data-stroke-width="1.8"></span>
                        <span class="text-xs font-semibold">Drop photo here to set cover</span>
                      </div>

                      <!-- Room Details Overlay on Preview Banner -->
                      <div class="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between pointer-events-none">
                        <div class="min-w-0 mr-2">
                          <p id="cr-preview-dept" class="text-[11px] text-stone-300 truncate font-medium">Phnom Penh • Public Facilities</p>
                          <h4 id="cr-preview-title" class="font-bold text-sm text-white truncate drop-shadow-xs">New Meeting Room</h4>
                        </div>
                        <span id="cr-preview-capacity" class="text-[11px] font-mono font-bold text-amber-300 shrink-0">16 Seats</span>
                      </div>
                    </div>

                    <!-- Hidden Cover File Input & Hidden Value Store -->
                    <input type="file" id="cr-cover-upload" accept="image/png,image/jpeg,image/webp,image/jpg" class="hidden" onchange="app.handleCreateRoomCoverUpload(event)" />
                    <input type="hidden" id="cr-image-url" value="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" />
                  </div>

                  <!-- GALLERY PHOTOS SECTION (UPLOAD SECTION FILLS TO BOTTOM) -->
                  <div class="space-y-1.5 flex-1 min-h-0 flex flex-col pt-1">
                    <div class="flex items-center justify-between shrink-0">
                      <span class="text-xs font-semibold text-stone-800">Additional Gallery Photos</span>
                      <span id="cr-gallery-count" class="text-[11px] font-medium text-stone-500">0 photos</span>
                    </div>

                    <!-- Gallery Photos Thumbnails Single Row (Horizontal Scroll, Hidden Scrollbar) -->
                    <div id="cr-gallery-thumbnails-container" class="w-full min-w-0 hidden shrink-0">
                      <div id="cr-gallery-thumbnails" class="flex items-center space-x-2.5 overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 w-full min-w-0">
                        <!-- Populated dynamically with horizontal thumbnail cards -->
                      </div>
                    </div>

                    <!-- Drag and Drop / Click Upload Box (Fills remaining height) -->
                    <div id="cr-gallery-dropzone"
                         ondragover="app.handleGalleryDragOver(event)"
                         ondragleave="app.handleGalleryDragLeave(event)"
                         ondrop="app.handleGalleryDrop(event)"
                         onclick="document.getElementById('cr-gallery-upload').click()"
                         class="flex-1 min-h-[120px] border-2 border-dashed border-[#E9E3DD] hover:border-[#991B1B]/60 hover:bg-[#FAF7F4] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-stone-50/50 group">
                      <div class="flex flex-col items-center justify-center space-y-2">
                        <div class="w-10 h-10 rounded-xl bg-red-50 text-[#991B1B] flex items-center justify-center group-hover:scale-105 transition shrink-0 border border-red-100/80 shadow-2xs">
                          <span class="iconify text-xl" data-icon="lucide:upload-cloud" data-stroke-width="1.8"></span>
                        </div>
                        <div class="space-y-0.5">
                          <p class="text-xs font-semibold text-stone-800">Click to upload or drag gallery photos</p>
                          <p class="text-[11px] text-stone-500">PNG, JPG or WEBP (multiple allowed)</p>
                        </div>
                      </div>
                    </div>

                    <!-- Hidden Gallery File Input & Hidden Value Store -->
                    <input type="file" id="cr-gallery-upload" accept="image/png,image/jpeg,image/webp,image/jpg" multiple class="hidden" onchange="app.handleCreateRoomGalleryUpload(event)" />
                    <input type="hidden" id="cr-gallery-urls" value="" />
                  </div>

                </div>
              </div>

              <!-- RIGHT PART: EQUIPMENT & FACILITIES (IT Support & Services from Booking Step 3) -->
              <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col min-h-0 overflow-hidden">
                <div class="flex items-center justify-between border-b border-stone-100 pb-2.5 shrink-0">
                  <div class="flex items-center space-x-2">
                    <div class="w-7 h-7 rounded-lg bg-red-100 text-[#991B1B] flex items-center justify-center text-xs font-bold shrink-0">
                      <span class="iconify" data-icon="lucide:headset" data-stroke-width="1.8"></span>
                    </div>
                    <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Equipment & Facilities</h3>
                  </div>
                  <span id="cr-it-counter-text" class="text-[11px] font-bold text-stone-600">4 items selected</span>
                </div>

                <!-- Guidance & Action Strip -->
                <div class="py-2 shrink-0 flex items-center justify-between">
                  <span class="text-[11px] text-stone-500 font-medium">Choose IT equipment available in this room:</span>
                  <div class="flex items-center space-x-2">
                    <button type="button" onclick="app.selectAllCreateRoomIT(true)" class="text-[11px] font-semibold text-[#991B1B] hover:underline cursor-pointer">All</button>
                    <span class="text-stone-300 text-xs">•</span>
                    <button type="button" onclick="app.selectAllCreateRoomIT(false)" class="text-[11px] font-semibold text-stone-500 hover:underline cursor-pointer">Clear</button>
                  </div>
                </div>

                <!-- Internally Scrollable Option Cards List -->
                <div id="cr-it-options-list" class="flex-1 p-3 min-h-0 overflow-y-auto space-y-2 hide-scrollbar">
                  <!-- Populated dynamically with rich option cards matching booking step 3 -->
                </div>
              </div>

            </div>
          </div>
          <div class="shrink-0 pt-3 pb-1 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 mt-auto">
            <button type="button" onclick="app.goToCreateStep(2)" class="h-9 px-4 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition cursor-pointer">
              <span class="iconify text-sm" data-icon="lucide:arrow-left"></span>
              <span>Back</span>
            </button>
            <div class="flex items-center space-x-2">
              <button type="button" onclick="app.resetCreateRoomForm()" class="px-4 py-2.5 rounded-lg border border-[#E9E3DD] bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition cursor-pointer">
                Reset Form
              </button>
              <button type="submit" class="btn-primary py-2.5 px-6 rounded-lg text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition hover:scale-101 cursor-pointer">
                <span class="iconify text-base text-white" data-icon="lucide:check-circle" data-stroke-width="2"></span>
                <span>Save & Create Room</span>
              </button>
            </div>
          </div>
        </div>

      </form>
    `;
  }

  showToast(title, message, type = 'info') {
    if (window.NBC && window.NBC.layouts && window.NBC.layouts.toast) {
      window.NBC.layouts.toast.showToast(title, message, type);
    } else if (window.app && window.app.showToast) {
      window.app.showToast(title, message, type);
    }
  }

  navigateTo(viewId, params = {}) {
    if (window.app && window.app.navigateTo) {
      window.app.navigateTo(viewId, params);
    }
  }

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div id="view-create-room-content" class="w-full h-[calc(100vh-150px)] flex flex-col">
        ${this.template}
      </div>
    `;
    this.init();
    this.goToCreateStep(1);
  }

  init() {
    this.initCreateRoomForm();
  }
  
  goToCreateStep(step) {
    this.currentStep = step;
    
    // Hide all steps
    const steps = [1, 2, 3];
    steps.forEach(s => {
      const el = document.getElementById('create-step-' + s);
      if (el) el.classList.add('hidden');
      
      const tab = document.getElementById('create-wizard-tab-' + s);
      if (tab) {
        if (s === step) {
          tab.className = 'wizard-step-tab active h-8 px-2.5 rounded-md bg-[#FEF2F2] border border-red-200 text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0';
          const badge = tab.querySelector('span:first-child');
          if (badge) badge.className = 'w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold';
        } else if (s < step) {
          tab.className = 'wizard-step-tab h-8 px-2.5 rounded-md bg-white border border-stone-200 text-stone-600 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0';
          const badge = tab.querySelector('span:first-child');
          if (badge) {
            badge.className = 'w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold';
            badge.innerHTML = '<span class="iconify" data-icon="lucide:check" data-stroke-width="3"></span>';
          }
        } else {
          tab.className = 'wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0';
          const badge = tab.querySelector('span:first-child');
          if (badge) {
            badge.className = 'w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold';
            badge.innerText = s;
          }
        }
      }
    });

    // Show current step
    const currentEl = document.getElementById('create-step-' + step);
    if (currentEl) currentEl.classList.remove('hidden');
    
    // Refresh map and image preview if on the right steps
    if (step === 2 || step === 3) {
      this.updateCreateRoomImagePreview();
    }
    if (step === 3) {
      this.renderITOptionsList();
    }
  }

  // Set up an accessible, interactive typeahead / suggestion combobox
  setupCombobox({ inputId, dropdownId, toggleId, containerId, getItems, onSelect, onInput }) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const toggleBtn = document.getElementById(toggleId);
    const container = document.getElementById(containerId);

    if (!input || !dropdown || !container) return;

    let activeIndex = -1;

    const getItemLabel = (item) => {
      if (!item) return '';
      if (typeof item === 'object') return item.name || '';
      return String(item);
    };

    const getItemSearchStr = (item) => {
      if (!item) return '';
      if (typeof item === 'object') {
        return `${item.name || ''} ${item.shortName || ''} ${item.address || ''}`;
      }
      return String(item);
    };

    const renderItems = (items, filterText = '') => {
      if (!items || items.length === 0) {
        dropdown.innerHTML = `
          <div class="px-3 py-2.5 text-xs text-stone-400 italic flex items-center space-x-1.5">
            <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:info"></span>
            <span>No preset found for "${filterText || '...'}" (custom entry allowed)</span>
          </div>
        `;
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = items.map((item, idx) => {
        const fullLabel = getItemLabel(item);
        let labelHtml = fullLabel;
        if (filterText && filterText.trim()) {
          const q = filterText.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${q})`, 'gi');
          labelHtml = fullLabel.replace(regex, '<span class="font-bold text-amber-900 bg-amber-100/80 rounded px-0.5">$1</span>');
        }

        const isObj = typeof item === 'object';
        const badge = isObj && item.shortName ? item.shortName : '';
        const address = isObj && item.address ? item.address : '';

        return `
          <div data-index="${idx}" class="suggestion-item px-3 py-2 text-xs hover:bg-amber-50/80 hover:text-amber-950 cursor-pointer border-b border-stone-100 last:border-0 transition-colors ${idx === activeIndex ? 'bg-amber-50 text-amber-950 font-semibold' : 'text-stone-700'}">
            <div class="flex items-center justify-between">
              <span class="font-medium truncate mr-2">${labelHtml}</span>
              ${badge ? `<span class="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200/70 shrink-0">${badge}</span>` : '<span class="iconify text-stone-300 text-xs shrink-0" data-icon="lucide:corner-down-left"></span>'}
            </div>
            ${address ? `
              <div class="text-[11px] text-stone-400 flex items-center space-x-1 mt-0.5 truncate">
                <span class="iconify text-[10px] shrink-0 text-stone-400" data-icon="lucide:map-pin"></span>
                <span class="truncate">${address}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.suggestion-item').forEach(el => {
        el.onmousedown = (e) => {
          e.preventDefault();
          const idx = parseInt(el.getAttribute('data-index'), 10);
          const selectedItem = items[idx];
          if (selectedItem) {
            const selectedVal = getItemLabel(selectedItem);
            input.value = selectedVal;
            dropdown.classList.add('hidden');
            activeIndex = -1;
            if (typeof onSelect === 'function') onSelect(selectedVal, selectedItem);
            this.updateCreateRoomImagePreview();
          }
        };
      });
    };

    const filterAndRender = () => {
      const all = getItems();
      const val = input.value.trim().toLowerCase();
      const filtered = val ? all.filter(item => getItemSearchStr(item).toLowerCase().includes(val)) : all;
      activeIndex = -1;
      renderItems(filtered, input.value.trim());
    };

    input.addEventListener('focus', () => {
      filterAndRender();
    });

    input.addEventListener('input', () => {
      filterAndRender();
      if (typeof onInput === 'function') onInput(input.value);
      this.updateCreateRoomImagePreview();
    });

    input.addEventListener('keydown', (e) => {
      if (dropdown.classList.contains('hidden')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          filterAndRender();
          return;
        }
      }

      const items = Array.from(dropdown.querySelectorAll('.suggestion-item'));
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('bg-amber-100', i === activeIndex));
        items[activeIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('bg-amber-100', i === activeIndex));
        items[activeIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
        } else {
          dropdown.classList.add('hidden');
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.add('hidden');
        activeIndex = -1;
      }
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropdown.classList.contains('hidden')) {
          input.focus();
          const all = getItems();
          renderItems(all, '');
        } else {
          dropdown.classList.add('hidden');
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.add('hidden');
        activeIndex = -1;
      }
    });
  }

  onProvinceSelected(selectedProvince, shouldClearCascade = true) {
    const locInput = document.getElementById('cr-location');
    const deptInput = document.getElementById('cr-department');
    const floorInput = document.getElementById('cr-floor');
    const locHelper = document.getElementById('cr-location-helper');
    const deptHelper = document.getElementById('cr-dept-helper');
    const floorHelper = document.getElementById('cr-floor-helper');

    if (shouldClearCascade) {
      if (locInput) locInput.value = '';
      if (deptInput) deptInput.value = '';
      if (floorInput) floorInput.value = '';
      if (deptHelper) deptHelper.innerText = "Filtered by Location";
      if (floorHelper) floorHelper.innerText = "Filtered by Location";
    }

    if (locHelper) {
      locHelper.innerText = selectedProvince ? `Filtered by ${selectedProvince}` : "Select location";
    }

    this.updateCreateRoomImagePreview();
  }

  onLocationSelected(selectedLocation, locObj, shouldClearCascade = true) {
    const deptInput = document.getElementById('cr-department');
    const floorInput = document.getElementById('cr-floor');
    const deptHelper = document.getElementById('cr-dept-helper');
    const floorHelper = document.getElementById('cr-floor-helper');

    if (shouldClearCascade) {
      if (deptInput) deptInput.value = '';
      if (floorInput) floorInput.value = '';
    }

    const shortLoc = (locObj && locObj.shortName) ? locObj.shortName : (selectedLocation ? selectedLocation.split('(')[0].trim() : "Location");
    if (deptHelper) {
      deptHelper.innerText = selectedLocation ? `Filtered by ${shortLoc}` : "Filtered by Location";
    }
    if (floorHelper) {
      floorHelper.innerText = selectedLocation ? `Filtered by ${shortLoc}` : "Filtered by Location";
    }

    this.updateCreateRoomImagePreview();
  }

  onDepartmentSelected(selectedDept, deptObj) {
    this.updateCreateRoomImagePreview();
  }

  initCreateRoomForm() {
    this.setupCombobox({
      inputId: 'cr-province',
      dropdownId: 'cr-province-dropdown',
      toggleId: 'cr-province-toggle',
      containerId: 'cr-province-container',
      getItems: () => {
        if (typeof bookingStore !== 'undefined' && bookingStore.getProvinces) {
          return bookingStore.getProvinces().map(p => p.name);
        }
        return ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampong Cham"];
      },
      onSelect: (val) => {
        this.onProvinceSelected(val, true);
      },
      onInput: (val) => {
        this.onProvinceSelected(val, false);
      }
    });

    this.setupCombobox({
      inputId: 'cr-location',
      dropdownId: 'cr-location-dropdown',
      toggleId: 'cr-location-toggle',
      containerId: 'cr-location-container',
      getItems: () => {
        const prov = document.getElementById('cr-province')?.value.trim() || "Phnom Penh";
        if (typeof bookingStore !== 'undefined' && bookingStore.getLocationsByProvince) {
          return bookingStore.getLocationsByProvince(prov);
        }
        return [];
      },
      onSelect: (val, obj) => {
        this.onLocationSelected(val, obj, true);
      },
      onInput: (val) => {
        this.onLocationSelected(val, null, false);
      }
    });

    this.setupCombobox({
      inputId: 'cr-department',
      dropdownId: 'cr-dept-dropdown',
      toggleId: 'cr-dept-toggle',
      containerId: 'cr-dept-container',
      getItems: () => {
        const prov = document.getElementById('cr-province')?.value.trim() || "Phnom Penh";
        const loc = document.getElementById('cr-location')?.value.trim() || "";
        if (typeof bookingStore !== 'undefined' && bookingStore.getDepartmentsByProvinceAndLocation) {
          return bookingStore.getDepartmentsByProvinceAndLocation(prov, loc);
        }
        return [];
      },
      onSelect: (val, obj) => {
        this.onDepartmentSelected(val, obj);
      },
      onInput: (val) => {
        this.onDepartmentSelected(val, null);
      }
    });

    this.setupCombobox({
      inputId: 'cr-floor',
      dropdownId: 'cr-floor-dropdown',
      toggleId: 'cr-floor-toggle',
      containerId: 'cr-floor-container',
      getItems: () => {
        const prov = document.getElementById('cr-province')?.value.trim() || "Phnom Penh";
        const loc = document.getElementById('cr-location')?.value.trim() || "";
        if (typeof bookingStore !== 'undefined' && bookingStore.getFloorsByProvinceAndLocation) {
          return bookingStore.getFloorsByProvinceAndLocation(prov, loc);
        }
        return [];
      },
      onSelect: (val) => {
        this.updateCreateRoomImagePreview();
      },
      onInput: (val) => {
        this.updateCreateRoomImagePreview();
      }
    });

    const nameInput = document.getElementById('cr-name');
    if (nameInput && !nameInput.dataset.boundPreview) {
      nameInput.dataset.boundPreview = 'true';
      nameInput.addEventListener('input', () => this.updateCreateRoomImagePreview());
    }
    const capInput = document.getElementById('cr-capacity');
    if (capInput && !capInput.dataset.boundPreview) {
      capInput.dataset.boundPreview = 'true';
      capInput.addEventListener('input', () => this.updateCreateRoomImagePreview());
    }

    if (window.app) {
      window.app.handleCreateRoomSubmit = (e) => this.handleCreateRoomSubmit(e);
      window.app.resetCreateRoomForm = () => this.resetCreateRoomForm();
      window.app.applyCreateRoomTemplate = (t) => this.applyCreateRoomTemplate(t);
      window.app.updateCreateRoomImagePreview = () => this.updateCreateRoomImagePreview();
      window.app.toggleCreateRoomPrivateOwner = (p) => this.toggleCreateRoomPrivateOwner(p);
      window.app.goToCreateStep = (s) => this.goToCreateStep(s);
      window.app.toggleCreateRoomIT = (name) => this.toggleCreateRoomIT(name);
      window.app.selectAllCreateRoomIT = (selectAll) => this.selectAllCreateRoomIT(selectAll);
      window.app.handleCreateRoomCoverUpload = (e) => this.handleCreateRoomCoverUpload(e);
      window.app.handleCoverDragOver = (e) => this.handleCoverDragOver(e);
      window.app.handleCoverDragLeave = (e) => this.handleCoverDragLeave(e);
      window.app.handleCoverDrop = (e) => this.handleCoverDrop(e);
      window.app.handleCreateRoomGalleryUpload = (e) => this.handleCreateRoomGalleryUpload(e);
      window.app.handleGalleryDragOver = (e) => this.handleGalleryDragOver(e);
      window.app.handleGalleryDragLeave = (e) => this.handleGalleryDragLeave(e);
      window.app.handleGalleryDrop = (e) => this.handleGalleryDrop(e);
      window.app.removeCreateRoomGalleryPhoto = (i) => this.removeCreateRoomGalleryPhoto(i);
    }

    const isPrivate = !!document.getElementById('cr-is-private')?.checked;
    this.toggleCreateRoomPrivateOwner(isPrivate);
    this.initITOptions();
    this.updateCreateRoomImagePreview();
  }

  handleCreateRoomCoverUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (typeof bookingStore !== 'undefined' && bookingStore.emitToast) {
        bookingStore.emitToast('Invalid File', 'Please select an image file (PNG, JPG, WEBP).', 'warning');
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const previewImg = document.getElementById('cr-image-preview');
      if (previewImg) previewImg.src = dataUrl;
      const urlInput = document.getElementById('cr-image-url');
      if (urlInput) urlInput.value = dataUrl;
      this.updatePhotosCount();
      if (typeof bookingStore !== 'undefined' && bookingStore.emitToast) {
        bookingStore.emitToast('Cover Photo Set', 'New room cover photo uploaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  handleCoverDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const overlay = document.getElementById('cr-cover-drag-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  handleCoverDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const overlay = document.getElementById('cr-cover-drag-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  handleCoverDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const overlay = document.getElementById('cr-cover-drag-overlay');
    if (overlay) overlay.classList.add('hidden');
    const files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        if (typeof bookingStore !== 'undefined' && bookingStore.emitToast) {
          bookingStore.emitToast('Invalid File', 'Please drop an image file.', 'warning');
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const previewImg = document.getElementById('cr-image-preview');
        if (previewImg) previewImg.src = dataUrl;
        const urlInput = document.getElementById('cr-image-url');
        if (urlInput) urlInput.value = dataUrl;
        this.updatePhotosCount();
        if (typeof bookingStore !== 'undefined' && bookingStore.emitToast) {
          bookingStore.emitToast('Cover Photo Set', 'Dropped photo set as room cover.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handleCreateRoomGalleryUpload(event) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    this.processGalleryFiles(files);
    event.target.value = '';
  }

  handleGalleryDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('cr-gallery-dropzone');
    if (dropzone) dropzone.classList.add('border-[#991B1B]', 'bg-[#FEF2F2]/30');
  }

  handleGalleryDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('cr-gallery-dropzone');
    if (dropzone) dropzone.classList.remove('border-[#991B1B]', 'bg-[#FEF2F2]/30');
  }

  handleGalleryDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('cr-gallery-dropzone');
    if (dropzone) dropzone.classList.remove('border-[#991B1B]', 'bg-[#FEF2F2]/30');
    const files = event.dataTransfer && event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      this.processGalleryFiles(imageFiles);
    }
  }

  processGalleryFiles(files) {
    if (!this.galleryPhotos) this.galleryPhotos = [];
    let completed = 0;
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.galleryPhotos.push(e.target.result);
        completed++;
        if (completed === validFiles.length) {
          this.syncGalleryToHiddenInput();
          this.renderGalleryThumbnails();
          this.updatePhotosCount();
          if (typeof bookingStore !== 'undefined' && bookingStore.emitToast) {
            bookingStore.emitToast('Gallery Photos Added', `Added ${validFiles.length} ${validFiles.length === 1 ? 'photo' : 'photos'} to gallery.`, 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeCreateRoomGalleryPhoto(index) {
    if (!this.galleryPhotos) return;
    this.galleryPhotos.splice(index, 1);
    this.syncGalleryToHiddenInput();
    this.renderGalleryThumbnails();
    this.updatePhotosCount();
  }

  syncGalleryToHiddenInput() {
    const hidden = document.getElementById('cr-gallery-urls');
    if (hidden) {
      hidden.value = (this.galleryPhotos || []).join('\n');
    }
  }

  renderGalleryThumbnails() {
    const container = document.getElementById('cr-gallery-thumbnails');
    const wrapper = document.getElementById('cr-gallery-thumbnails-container');
    const countEl = document.getElementById('cr-gallery-count');
    const photos = this.galleryPhotos || [];

    if (countEl) {
      countEl.innerText = `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`;
    }

    if (!container || !wrapper) return;

    if (photos.length === 0) {
      wrapper.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    wrapper.classList.remove('hidden');
    const itemsHtml = photos.map((photo, idx) => `
      <div class="relative w-28 sm:w-32 shrink-0 aspect-video rounded-lg overflow-hidden border border-[#E9E3DD] bg-stone-100 group shadow-2xs">
        <img src="${photo}" alt="Gallery ${idx + 1}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition pointer-events-none"></div>
        <button type="button" onclick="event.stopPropagation(); app.removeCreateRoomGalleryPhoto(${idx})"
                class="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/70 hover:bg-[#991B1B] text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Remove photo">
          <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
        </button>
      </div>
    `).join('');

    const addMoreBtn = `
      <div onclick="document.getElementById('cr-gallery-upload').click()"
           class="w-28 sm:w-32 shrink-0 aspect-video border-2 border-dashed border-[#E9E3DD] hover:border-[#991B1B] hover:bg-[#FAF7F4] rounded-lg flex flex-col items-center justify-center cursor-pointer transition text-stone-400 hover:text-[#991B1B] group">
        <span class="iconify text-sm group-hover:scale-110 transition" data-icon="lucide:plus" data-stroke-width="2"></span>
        <span class="text-[10px] font-semibold mt-0.5">Add</span>
      </div>
    `;

    container.innerHTML = itemsHtml + addMoreBtn;
  }

  updatePhotosCount() {
    const totalEl = document.getElementById('cr-photos-counter-text');
    if (!totalEl) return;
    const hasCover = !!document.getElementById('cr-image-url')?.value;
    const galleryCount = (this.galleryPhotos || []).length;
    const total = (hasCover ? 1 : 0) + galleryCount;
    totalEl.innerText = `${total} ${total === 1 ? 'photo' : 'photos'} ready`;
  }

  updateCreateRoomImagePreview() {
    const urlInput = document.getElementById('cr-image-url');
    const previewImg = document.getElementById('cr-image-preview');
    const titleEl = document.getElementById('cr-preview-title');
    const deptEl = document.getElementById('cr-preview-dept');
    const capEl = document.getElementById('cr-preview-capacity');
    const nameInput = document.getElementById('cr-name');
    const provInput = document.getElementById('cr-province');
    const locInput = document.getElementById('cr-location');
    const deptInput = document.getElementById('cr-department');
    const capInput = document.getElementById('cr-capacity');

    if (previewImg && urlInput) {
      const url = urlInput.value.trim();
      if (url) {
        previewImg.src = url;
      }
    }
    if (titleEl) {
      titleEl.innerText = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "New Meeting Room";
    }
    if (deptEl) {
      const provVal = provInput ? provInput.value.trim() : "Phnom Penh";
      const locVal = locInput ? locInput.value.trim() : "";
      const isPrivate = !!document.getElementById('cr-is-private')?.checked;
      const deptVal = (isPrivate && deptInput) ? deptInput.value.trim() : "";
      const shortLoc = locVal ? locVal.split('(')[0].trim() : provVal;
      const shortDept = deptVal ? deptVal.split('(')[0].trim() : (isPrivate ? "Executive Office" : "Public Facilities");
      deptEl.innerText = `${shortLoc} • ${shortDept}`;
    }
    if (capEl) {
      const capVal = capInput ? capInput.value : "16";
      capEl.innerText = `${capVal || 16} Seats`;
    }

    // Sync gallery photos if uninitialized and cr-gallery-urls has value
    const galleryInput = document.getElementById('cr-gallery-urls');
    if (galleryInput && galleryInput.value && (!this.galleryPhotos || this.galleryPhotos.length === 0)) {
      this.galleryPhotos = galleryInput.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    this.renderGalleryThumbnails();
    this.updatePhotosCount();

    const mapIframe = document.getElementById('cr-map-preview-iframe');
    const mapAddress = document.getElementById('cr-map-preview-address');
    const mapLink = document.getElementById('cr-map-preview-link');
    if (mapIframe || mapAddress || mapLink) {
      const pVal = (provInput && provInput.value.trim()) || 'Phnom Penh';
      const lVal = (locInput && locInput.value.trim()) || '';
      const dummyRoom = { province: pVal, location: lVal, branch: pVal };
      const mapInfo = (typeof bookingStore !== 'undefined' && bookingStore.getRoomMapDetails)
        ? bookingStore.getRoomMapDetails(dummyRoom)
        : {
            building: lVal || 'National Bank of Cambodia',
            address: pVal + ', Cambodia',
            query: (lVal || pVal) + ' National Bank of Cambodia',
            embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent((lVal || pVal) + ' National Bank of Cambodia')}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
            externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lVal || pVal) + ' National Bank of Cambodia')}`
          };

      if (mapAddress) {
        mapAddress.innerHTML = `<strong class="text-stone-800 font-semibold">${mapInfo.building}</strong> &bull; <span class="text-stone-500">${mapInfo.address}</span>`;
      }
      if (mapLink) {
        mapLink.href = mapInfo.externalUrl;
      }
      if (mapIframe && mapIframe.dataset && mapIframe.dataset.lastQuery !== mapInfo.query) {
        mapIframe.dataset.lastQuery = mapInfo.query;
        mapIframe.src = mapInfo.embedUrl;
      }
    }
  }

  initITOptions() {
    if (!this.selectedITFeatures || this.selectedITFeatures.size === 0) {
      this.selectedITFeatures = new Set([
        'Presentation Screen & TV',
        'Video Conference Setup',
        'Microphones & Audio Setup',
        'High-Density Wi-Fi Access'
      ]);
    }
    this.renderITOptionsList();
  }

  toggleCreateRoomIT(name) {
    if (!this.selectedITFeatures) {
      this.selectedITFeatures = new Set();
    }
    if (this.selectedITFeatures.has(name)) {
      this.selectedITFeatures.delete(name);
    } else {
      this.selectedITFeatures.add(name);
    }
    this.renderITOptionsList();
  }

  selectAllCreateRoomIT(selectAll) {
    if (!this.selectedITFeatures) {
      this.selectedITFeatures = new Set();
    }
    this.selectedITFeatures.clear();
    if (selectAll) {
      IT_EQUIPMENT_ITEMS.forEach(item => this.selectedITFeatures.add(item.name));
    }
    this.renderITOptionsList();
  }

  renderITOptionsList() {
    const container = document.getElementById('cr-it-options-list');
    const counterEl = document.getElementById('cr-it-counter-text');
    if (counterEl) {
      const count = this.selectedITFeatures ? this.selectedITFeatures.size : 0;
      counterEl.innerText = `${count} ${count === 1 ? 'item' : 'items'} selected`;
    }
    if (!container) return;

    container.innerHTML = IT_EQUIPMENT_ITEMS.map(item => {
      const isSelected = this.selectedITFeatures ? this.selectedITFeatures.has(item.name) : false;
      return `
        <div onclick="app.toggleCreateRoomIT('${item.name.replace(/'/g, "\\'")}')" id="cr-it-card-${item.id}"
             class="option-card ${isSelected ? 'selected border-[#991B1B] bg-[#FEF2F2]/40 shadow-2xs' : 'border-[#E9E3DD] bg-white'} text-xs py-2 px-2.5 rounded-lg border cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
          <div class="flex items-center space-x-2.5 min-w-0 flex-1">
            <div class="w-7 h-7 rounded-md ${isSelected ? 'bg-red-50 text-[#991B1B] border border-red-200/80' : 'bg-stone-50 text-stone-600 border border-stone-200'} flex items-center justify-center shrink-0">
              <span class="iconify text-sm" data-icon="${item.icon}" data-stroke-width="1.8"></span>
            </div>
            <div class="min-w-0 flex-1">
              <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">${item.name}</strong>
              <span class="text-stone-500 text-[10.5px] block leading-tight truncate">${item.desc}</span>
            </div>
          </div>
          <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 ${isSelected ? 'border-[#991B1B] bg-[#991B1B] text-white' : 'border-stone-300 bg-white'} flex items-center justify-center shrink-0 shadow-2xs transition">
            ${isSelected ? '<svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
          <input type="checkbox" name="cr-feature" value="${item.name}" ${isSelected ? 'checked' : ''} class="hidden" />
        </div>
      `;
    }).join('');
  }

  toggleCreateRoomPrivateOwner(isPrivate) {
    const container = document.getElementById('cr-owner-fields-container');
    const badge = document.getElementById('cr-pvt-badge');
    const ownerNameInput = document.getElementById('cr-owner-name');
    const deptFieldGroup = document.getElementById('cr-dept-field-group');
    const deptInput = document.getElementById('cr-department');

    if (container) {
      container.classList.toggle('hidden', !isPrivate);
    }
    if (badge) {
      if (isPrivate) {
        badge.innerText = 'Executive Private';
        badge.className = 'px-2 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-950 border border-amber-300 uppercase';
      } else {
        badge.innerText = 'Standard Public';
        badge.className = 'px-2 py-0.2 rounded text-[9px] font-bold bg-stone-200 text-stone-700 uppercase';
      }
    }
    if (ownerNameInput) {
      ownerNameInput.required = !!isPrivate;
    }
    if (deptFieldGroup) {
      deptFieldGroup.classList.toggle('hidden', !isPrivate);
    }
    if (deptInput) {
      deptInput.required = !!isPrivate;
    }
    this.updateCreateRoomImagePreview();
  }

  applyCreateRoomTemplate(type) {
    this.initCreateRoomForm();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setChecked = (id, checked) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    };
    const setFeatures = (featuresList) => {
      if (!this.selectedITFeatures) {
        this.selectedITFeatures = new Set();
      }
      this.selectedITFeatures.clear();
      IT_EQUIPMENT_ITEMS.forEach(item => {
        const matches = featuresList.some(f => 
          f === item.name || 
          (item.aliases && item.aliases.includes(f)) ||
          item.name.toLowerCase().includes(f.toLowerCase()) ||
          f.toLowerCase().includes(item.name.toLowerCase())
        );
        if (matches) {
          this.selectedITFeatures.add(item.name);
        }
      });
      this.renderITOptionsList();
    };

    if (type === 'boardroom') {
      setVal('cr-name', 'Sihanouk Executive Boardroom');
      setVal('cr-province', 'Phnom Penh');
      setVal('cr-location', 'National Bank of Cambodia - Headquarters');
      setVal('cr-department', 'Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)');
      setVal('cr-category', 'Executive Room');
      setVal('cr-floor', 'Level 18 (Floor 18) - Executive Suite');
      setVal('cr-door-code', 'B-1801');
      setVal('cr-capacity', 24);
      setVal('cr-size', '85 sq m');
      setVal('cr-description', 'High-level executive boardroom tailored for Governor cabinet, monetary policy decisions, and VIP ministerial delegations.');
      setVal('cr-image-url', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
      setVal('cr-gallery-urls', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80');
      setChecked('cr-is-private', true);
      this.toggleCreateRoomPrivateOwner(true);
      setVal('cr-owner-name', 'Dr. Chea Serey Cabinet');
      setVal('cr-owner-title', 'Executive Board Secretary');
      setVal('cr-owner-dept', 'Board & Executive Office');
      setVal('cr-owner-phone', 'Ext. 8801');
      setVal('cr-owner-avatar', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80');
      setFeatures([
        'Large Video Screen (4K TV)',
        'Wireless Screen Sharing',
        'Table Microphones & Speakers',
        'Video Call Rig (Zoom / Teams)',
        'Whiteboard & Markers',
        'High-Speed Wi-Speed Wi-Fi',
        'Direct Elevator Access'
      ]);
    } else if (type === 'tech') {
      setVal('cr-name', 'Bakong FinTech Studio');
      setVal('cr-province', 'Phnom Penh');
      setVal('cr-location', 'National Bank of Cambodia, IT Department');
      setVal('cr-department', 'FinTech & Innovation - Bakong (បច្ចេកវិទ្យាហិរញ្ញវត្ថុ)');
      setVal('cr-category', 'Tech Room');
      setVal('cr-floor', 'Floor 2 - Cybersecurity & FinTech');
      setVal('cr-door-code', 'IT-204');
      setVal('cr-capacity', 14);
      setVal('cr-size', '52 sq m');
      setVal('cr-description', 'High-tech collaboration workspace for Core Banking, Bakong developers, and API integration teams with high-density data ports.');
      setVal('cr-image-url', 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80');
      setVal('cr-gallery-urls', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80');
      setChecked('cr-is-private', false);
      this.toggleCreateRoomPrivateOwner(false);
      setFeatures([
        'Large Video Screen (4K TV)',
        'Touchscreen TV',
        'Wireless Screen Sharing',
        'Video Call Rig (Zoom / Teams)',
        'Whiteboard & Markers',
        'High-Speed Wi-Fi',
        'Ethernet Cable Ports',
        'Movable Chairs'
      ]);
    } else if (type === 'focus') {
      setVal('cr-name', 'CAFIU Confidential Pod 5');
      setVal('cr-province', 'Phnom Penh');
      setVal('cr-location', 'National Bank of Cambodia - Headquarters');
      setVal('cr-department', 'Financial Intelligence Unit - CAFIU (អង្គភាពស៊ើបការណ៍ហិរញ្ញវត្ថុ)');
      setVal('cr-category', 'Small Room');
      setVal('cr-floor', 'Level 5 (Floor 5) - Finance & Audit');
      setVal('cr-door-code', 'F-508');
      setVal('cr-capacity', 4);
      setVal('cr-size', '18 sq m');
      setVal('cr-description', 'Acoustically isolated focus pod for private one-on-one reviews, internal audit interviews, and secure compliance discussions.');
      setVal('cr-image-url', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80');
      setVal('cr-gallery-urls', '');
      setChecked('cr-is-private', true);
      this.toggleCreateRoomPrivateOwner(true);
      setVal('cr-owner-name', 'Internal Audit Bureau');
      setVal('cr-owner-title', 'Chief of Compliance');
      setVal('cr-owner-dept', 'Internal Audit Directorate');
      setVal('cr-owner-phone', 'Ext. 8502');
      setVal('cr-owner-avatar', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80');
      setFeatures([
        'Large Video Screen (4K TV)',
        'Wireless Screen Sharing',
        'Table Microphones & Speakers',
        'High-Speed Wi-Fi'
      ]);
    } else if (type === 'hall') {
      setVal('cr-name', 'National Grand Auditorium');
      setVal('cr-province', 'Phnom Penh');
      setVal('cr-location', 'National Bank of Cambodia - Headquarters');
      setVal('cr-department', 'General Secretariat (អគ្គលេខាធិការដ្ឋាន)');
      setVal('cr-category', 'Grand Hall');
      setVal('cr-floor', 'Level 18 (Floor 18) - Executive Suite');
      setVal('cr-door-code', 'HALL-18');
      setVal('cr-capacity', 60);
      setVal('cr-size', '180 sq m');
      setVal('cr-description', 'State-of-the-art auditorium for annual banking symposiums, international central bank assemblies, and press briefings.');
      setVal('cr-image-url', 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=1200&q=80');
      setVal('cr-gallery-urls', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80, https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80');
      setChecked('cr-is-private', false);
      this.toggleCreateRoomPrivateOwner(false);
      setFeatures([
        'Dual Projector Screens',
        'Table Microphones & Speakers',
        'Video Call Rig (Zoom / Teams)',
        'High-Speed Wi-Fi',
        'Direct Elevator Access',
        'Coffee Machine Nearby'
      ]);
    }

    this.onProvinceSelected(document.getElementById('cr-province')?.value || 'Phnom Penh', false);
    this.onLocationSelected(document.getElementById('cr-location')?.value || 'National Bank of Cambodia - Headquarters', null, false);
    const rawGallery = document.getElementById('cr-gallery-urls')?.value || '';
    if (rawGallery) {
      this.galleryPhotos = rawGallery.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    } else {
      this.galleryPhotos = [];
    }
    this.updateCreateRoomImagePreview();
    bookingStore.emitToast('Template Loaded', `Applied "${type.toUpperCase()}" template attributes to form.`, 'info');
  }

  resetCreateRoomForm() {
    const form = document.getElementById('create-room-form');
    if (form) form.reset();
    const provInput = document.getElementById('cr-province');
    if (provInput) provInput.value = 'Phnom Penh';
    const locInput = document.getElementById('cr-location');
    if (locInput) locInput.value = 'National Bank of Cambodia - Headquarters';
    const deptInput = document.getElementById('cr-department');
    if (deptInput) deptInput.value = 'Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)';
    const floorInput = document.getElementById('cr-floor');
    if (floorInput) floorInput.value = 'Level 18 (Floor 18) - Executive Suite';
    const nameInput = document.getElementById('cr-name');
    if (nameInput) nameInput.value = '';

    this.onProvinceSelected('Phnom Penh', false);
    this.onLocationSelected('National Bank of Cambodia - Headquarters', null, false);
    this.toggleCreateRoomPrivateOwner(false);
    this.selectedITFeatures = new Set([
      'Presentation Screen & TV',
      'Video Conference Setup',
      'Microphones & Audio Setup',
      'High-Density Wi-Fi Access'
    ]);
    this.renderITOptionsList();

    this.galleryPhotos = [];
    const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    const coverInput = document.getElementById('cr-image-url');
    if (coverInput) coverInput.value = defaultCover;
    const galleryInput = document.getElementById('cr-gallery-urls');
    if (galleryInput) galleryInput.value = '';
    const previewImg = document.getElementById('cr-image-preview');
    if (previewImg) previewImg.src = defaultCover;
    this.renderGalleryThumbnails();
    this.updatePhotosCount();

    this.updateCreateRoomImagePreview();
    this.goToCreateStep(1);
  }

  handleCreateRoomSubmit(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('cr-name')?.value.trim();
    if (!name) {
      alert("Please enter a room name.");
      return;
    }

    const isPrivate = !!document.getElementById('cr-is-private')?.checked;
    const province = document.getElementById('cr-province')?.value.trim() || "Phnom Penh";
    const location = document.getElementById('cr-location')?.value.trim() || "National Bank of Cambodia - Headquarters";
    const dept = isPrivate
      ? (document.getElementById('cr-department')?.value.trim() || "Board of Directors & Cabinet")
      : "Public Shared Facilities";
    const category = document.getElementById('cr-category')?.value || "Team Room";
    const status = document.getElementById('cr-status')?.value || 'Available';
    const description = document.getElementById('cr-description')?.value.trim();
    const floor = document.getElementById('cr-floor')?.value.trim() || "Level 18 (Floor 18) - Executive Suite";
    const doorNumber = document.getElementById('cr-door-code')?.value.trim() || "";
    const capacity = parseInt(document.getElementById('cr-capacity')?.value, 10) || 10;
    const size = document.getElementById('cr-size')?.value.trim() || '50 sq m';
    const layoutType = document.getElementById('cr-layout')?.value || "Boardroom";

    let roomOwner = null;
    if (isPrivate) {
      const ownerName = document.getElementById('cr-owner-name')?.value.trim();
      if (!ownerName) {
        alert("Please enter the designated Room Owner's name for this Executive Private Room.");
        document.getElementById('cr-owner-name')?.focus();
        return;
      }
      roomOwner = {
        name: ownerName,
        title: document.getElementById('cr-owner-title')?.value.trim() || 'Room Custodian',
        department: document.getElementById('cr-owner-dept')?.value.trim() || dept,
        phone: document.getElementById('cr-owner-phone')?.value.trim() || 'Ext. 8800',
        avatar: document.getElementById('cr-owner-avatar')?.value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
    }

    const features = [];
    document.querySelectorAll('input[name="cr-feature"]:checked').forEach(cb => {
      features.push(cb.value);
    });

    const coverUrl = document.getElementById('cr-image-url')?.value.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    let galleryList = [coverUrl];
    if (this.galleryPhotos && this.galleryPhotos.length > 0) {
      galleryList = [coverUrl, ...this.galleryPhotos.filter(p => p !== coverUrl)];
    } else {
      const galleryRaw = document.getElementById('cr-gallery-urls')?.value.trim();
      if (galleryRaw) {
        const parsed = galleryRaw.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith('http') && s !== coverUrl);
        galleryList = [coverUrl, ...parsed];
      }
    }

    // Since we removed booking rules inputs, provide sensible defaults
    const bufferMinutes = 15;
    const allowCatering = true;

    const payload = {
      name,
      province,
      location,
      branch: province,
      department: dept,
      category,
      status,
      description,
      floor,
      doorNumber,
      capacity,
      size,
      layoutType,
      isPrivate,
      roomOwner,
      features,
      image: coverUrl,
      images: galleryList,
      bufferMinutes,
      allowCatering
    };

    const newRoom = bookingStore.createRoom(payload);

    this.resetCreateRoomForm();
    if (typeof this.renderRoomsGrid === 'function') {
      this.renderRoomsGrid();
    }
    if (window.app && typeof window.app.renderAll === 'function') {
      window.app.renderAll();
    }
    
    this.navigateTo('room-details', { roomId: newRoom.id });
  }
}

window.NBC.views['create-room'] = new CreateRoomView();

if (typeof window.app !== 'undefined') {
  window.app.handleCreateRoomSubmit = (e) => window.NBC.views['create-room'].handleCreateRoomSubmit(e);
  window.app.resetCreateRoomForm = () => window.NBC.views['create-room'].resetCreateRoomForm();
  window.app.applyCreateRoomTemplate = (t) => window.NBC.views['create-room'].applyCreateRoomTemplate(t);
  window.app.updateCreateRoomImagePreview = () => window.NBC.views['create-room'].updateCreateRoomImagePreview();
  window.app.toggleCreateRoomPrivateOwner = (p) => window.NBC.views['create-room'].toggleCreateRoomPrivateOwner(p);
  window.app.goToCreateStep = (s) => window.NBC.views['create-room'].goToCreateStep(s);
  window.app.toggleCreateRoomIT = (name) => window.NBC.views['create-room'].toggleCreateRoomIT(name);
  window.app.selectAllCreateRoomIT = (selectAll) => window.NBC.views['create-room'].selectAllCreateRoomIT(selectAll);
  window.app.handleCreateRoomCoverUpload = (e) => window.NBC.views['create-room'].handleCreateRoomCoverUpload(e);
  window.app.handleCoverDragOver = (e) => window.NBC.views['create-room'].handleCoverDragOver(e);
  window.app.handleCoverDragLeave = (e) => window.NBC.views['create-room'].handleCoverDragLeave(e);
  window.app.handleCoverDrop = (e) => window.NBC.views['create-room'].handleCoverDrop(e);
  window.app.handleCreateRoomGalleryUpload = (e) => window.NBC.views['create-room'].handleCreateRoomGalleryUpload(e);
  window.app.handleGalleryDragOver = (e) => window.NBC.views['create-room'].handleGalleryDragOver(e);
  window.app.handleGalleryDragLeave = (e) => window.NBC.views['create-room'].handleGalleryDragLeave(e);
  window.app.handleGalleryDrop = (e) => window.NBC.views['create-room'].handleGalleryDrop(e);
  window.app.removeCreateRoomGalleryPhoto = (i) => window.NBC.views['create-room'].removeCreateRoomGalleryPhoto(i);
}
