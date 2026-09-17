// Other Person's Private Room View Component (view-request-other-private)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

window.NBC.views['request-other-private'] = {
  render(container) {
    if (!container) return;

    container.innerHTML = `
      <!-- Top Action Breadcrumb Bar -->
      <div class="flex items-center justify-between gap-3 pb-2 border-b border-[#E9E3DD]">
        <button type="button" onclick="app.navigateTo('book-room')" class="page-back-button px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs cursor-pointer">
          <span class="iconify text-stone-500 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
          <span>All Meeting Rooms</span>
        </button>
        <div class="page-breadcrumb flex items-center space-x-1.5">
          <span>Directory</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Other Private Rooms</span>
        </div>
      </div>

      <!-- Hero Banner with Simple 2-Step Explanation -->
      <div class="bg-gradient-to-r from-[#2A0808] via-[#3B0E0E] to-[#200505] rounded-2xl p-5 sm:p-6 text-white border border-[#450A0A] shadow-md relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <span class="iconify text-sm" data-icon="lucide:key-round"></span>
              <span>Private Rooms</span>
            </div>
            <span class="text-xs text-stone-300 font-medium">Bank Guidelines</span>
          </div>

          <div class="space-y-1.5 max-w-2xl">
            <h2 class="font-heading font-bold text-lg sm:text-2xl text-white tracking-tight">Other Private Rooms</h2>
            <p class="text-xs sm:text-sm text-stone-300 leading-relaxed">
              These rooms are reserved for department heads. You can request to use a room with meeting details, food, and IT support.
            </p>
          </div>

          <!-- 2-Step Workflow Indicator Strip -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div class="flex items-center space-x-2.5 bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span class="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <div class="font-bold text-white text-[11px]">Enter Details</div>
                <div class="text-[10px] text-stone-300">Date, time, food, & reason</div>
              </div>
            </div>
            <div class="flex items-center space-x-2.5 bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span class="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <div class="font-bold text-white text-[11px]">Owner Approval</div>
                <div class="text-[10px] text-stone-300">Room owner approves request</div>
              </div>
            </div>
            <div class="flex items-center space-x-2.5 bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span class="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">3</span>
              <div>
                <div class="font-bold text-white text-[11px]">Pitika Review</div>
                <div class="text-[10px] text-stone-300">Pitika confirms booking</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Row for Other Private Rooms -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E9E3DD] shadow-xs">
        <div class="form-field-group flex-1">
          <div class="relative">
            <span class="iconify input-icon-wrapper text-stone-400 text-xs" data-icon="lucide:search" data-stroke-width="1.8"></span>
            <input type="text" id="other-private-search-input" oninput="NBC.views['request-other-private'].filterRooms()" placeholder="Search by room name, owner, department, or floor..." class="bank-input bank-input-with-icon" />
          </div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select id="other-private-floor-filter" onchange="NBC.views['request-other-private'].filterRooms()" class="bank-input w-full sm:w-36 text-stone-800 text-xs">
            <option value="all">All Floors</option>
            <option value="18">Floor 18 (Level 18)</option>
            <option value="5">Floor 5 (Level 5)</option>
          </select>

          <select id="other-private-capacity-filter" onchange="NBC.views['request-other-private'].filterRooms()" class="bank-input w-full sm:w-36 text-stone-800 text-xs">
            <option value="all">All Capacities</option>
            <option value="small">Small (1-8)</option>
            <option value="large">Large (17+)</option>
          </select>

          <span id="other-private-count-badge" class="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold whitespace-nowrap">
            Rooms
          </span>
        </div>
      </div>

      <!-- Cards Grid for Other Private Rooms -->
      <div id="other-private-rooms-grid" class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <!-- Dynamically populated -->
      </div>

      <!-- Information & FAQ Footer Card -->
      <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-3">
        <div class="flex items-center space-x-2 text-stone-900 font-heading font-bold text-xs uppercase tracking-wide border-b border-stone-100 pb-2">
          <span class="iconify text-amber-600 text-sm" data-icon="lucide:help-circle"></span>
          <span>Help & Guidelines</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
          <div class="space-y-1">
            <h5 class="font-bold text-stone-900 text-xs">What info can I enter?</h5>
            <p class="text-[11px] leading-relaxed">
              You can enter meeting name, date, time, number of people, food, and IT equipment.
            </p>
          </div>
          <div class="space-y-1">
            <h5 class="font-bold text-stone-900 text-xs">How do the 2 approvals work?</h5>
            <p class="text-[11px] leading-relaxed">
              First, the Room Owner checks your reason and approves it. Then, Pitika confirms your room and door pass.
            </p>
          </div>
          <div class="space-y-1">
            <h5 class="font-bold text-stone-900 text-xs">Need help urgently?</h5>
            <p class="text-[11px] leading-relaxed">
              For urgent meetings, please call the Admin team at <strong>Ext. 8400</strong>.
            </p>
          </div>
        </div>
      </div>
    `;

    this.filterRooms();
  },

  init() {
    this.filterRooms();
  },

  update() {
    this.filterRooms();
  },

  filterRooms() {
    const container = document.getElementById('other-private-rooms-grid');
    if (!container || typeof bookingStore === 'undefined') return;

    const searchTerm = (document.getElementById('other-private-search-input')?.value || '').toLowerCase().trim();
    const floorFilter = document.getElementById('other-private-floor-filter')?.value || 'all';
    const capacityFilter = document.getElementById('other-private-capacity-filter')?.value || 'all';

    let rooms = bookingStore.getOtherPrivateRooms ? bookingStore.getOtherPrivateRooms() : bookingStore.getRooms().filter(room =>
      room.isPrivate && !(room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE')
    );

    if (searchTerm) {
      rooms = rooms.filter(r => 
        r.name.toLowerCase().includes(searchTerm) ||
        (r.roomOwner?.name || '').toLowerCase().includes(searchTerm) ||
        (r.roomOwner?.title || '').toLowerCase().includes(searchTerm) ||
        (r.department || '').toLowerCase().includes(searchTerm) ||
        (r.floor || '').toLowerCase().includes(searchTerm)
      );
    }

    if (floorFilter !== 'all') {
      rooms = rooms.filter(r => r.floor.includes(floorFilter));
    }

    if (capacityFilter === 'small') {
      rooms = rooms.filter(r => r.capacity <= 8);
    } else if (capacityFilter === 'large') {
      rooms = rooms.filter(r => r.capacity >= 17);
    }

    const countBadge = document.getElementById('other-private-count-badge');
    if (countBadge) {
      countBadge.innerText = `${rooms.length} ${rooms.length === 1 ? 'Room' : 'Rooms'}`;
    }

    if (rooms.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-[#E9E3DD] p-6 space-y-3">
          <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
            <span class="iconify" data-icon="lucide:search-x"></span>
          </div>
          <h4 class="font-heading font-bold text-sm text-stone-900">No Private Rooms Found</h4>
          <p class="text-xs text-stone-500 max-w-sm mx-auto">No private rooms matched your search or filters.</p>
          <button onclick="NBC.views['request-other-private'].resetFilters()" class="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(room => `
      <div class="bg-white rounded-2xl border border-[#E9E3DD] hover:border-amber-400 overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md flex flex-col group">
        <div class="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
          <img src="${room.image}" alt="${room.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
          
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-md">
              <span class="iconify text-xs" data-icon="lucide:lock"></span>
              <span>Private</span>
            </span>
            <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-amber-300 backdrop-blur-xs border border-amber-500/30">
              <span class="iconify text-xs" data-icon="lucide:shield-alert"></span>
              <span>Needs 2 Approvals</span>
            </span>
          </div>

          <div class="absolute bottom-3 left-3 right-3 text-white">
            <div class="flex items-center space-x-2 text-[11px] text-amber-300 font-semibold mb-0.5">
              <span>${room.floor.split('(')[0].trim()}</span>
              <span>•</span>
              <span>${room.size || 'Private Room'}</span>
            </div>
            <h3 class="font-heading font-bold text-lg text-white leading-tight drop-shadow-sm">${room.name}</h3>
          </div>
        </div>

        <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2">
            <div class="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <span class="iconify text-amber-700 text-xs" data-icon="lucide:crown"></span>
              <span>Room Owner</span>
            </div>
            <div class="flex items-center space-x-3">
              <img src="${room.roomOwner?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}" alt="${room.roomOwner?.name || 'Owner'}" class="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shrink-0" />
              <div class="min-w-0 flex-1">
                <h4 class="font-bold text-xs sm:text-sm text-stone-900 truncate leading-tight">${room.roomOwner?.name || 'Executive Office'}</h4>
                <p class="text-[11px] text-stone-600 truncate">${room.roomOwner?.title || room.department.split('(')[0].trim()}</p>
                <div class="flex items-center space-x-2 text-[10px] text-amber-900 font-semibold mt-0.5">
                  <span>${room.roomOwner?.department || 'Executive Office'}</span>
                  <span>•</span>
                  <span>${room.roomOwner?.phone || 'Ext. 8800'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between text-stone-600 pb-2 border-b border-stone-100">
              <span class="flex items-center space-x-1.5">
                <span class="iconify text-stone-400" data-icon="lucide:users"></span>
                <span>Seats</span>
              </span>
              <span class="font-bold text-stone-900">${room.capacity} Seats</span>
            </div>

            <div class="flex flex-wrap gap-1.5 pt-1">
              ${(room.features || []).slice(0, 4).map(f => `
                <span class="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium flex items-center space-x-1">
                  <span class="iconify text-amber-700 text-xs" data-icon="lucide:check-circle-2"></span>
                  <span>${f}</span>
                </span>
              `).join('')}
            </div>
          </div>

          <div class="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
            <div class="font-semibold text-stone-800 text-[10px] uppercase tracking-wider">Approvals needed:</div>
            <div class="flex items-center space-x-2 text-[11px]">
              <span class="font-bold text-amber-800">1. Room Owner</span>
              <span class="text-stone-400 font-bold">&rarr;</span>
              <span class="font-bold text-stone-700">2. Pitika</span>
            </div>
          </div>

          <div class="pt-1">
            <button type="button" onclick="app.requestOtherPrivateRoom('${room.id}')" class="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs hover:shadow-sm border border-amber-500 cursor-pointer">
              <span class="iconify text-white text-base" data-icon="lucide:calendar-plus"></span>
              <span>Request This Room &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  resetFilters() {
    const searchInput = document.getElementById('other-private-search-input');
    const floorFilter = document.getElementById('other-private-floor-filter');
    const capFilter = document.getElementById('other-private-capacity-filter');
    if (searchInput) searchInput.value = '';
    if (floorFilter) floorFilter.value = 'all';
    if (capFilter) capFilter.value = 'all';
    this.filterRooms();
  },

  resetOtherPrivateFilters() {
    this.resetFilters();
  },

  filterOtherPrivateRooms() {
    this.filterRooms();
  },

  renderOtherPrivateRoomsPage() {
    this.filterRooms();
  },

  renderOtherPrivateRoomsList() {
    this.filterRooms();
  },

  requestOtherPrivateRoom(roomId) {
    if (window.app && window.app.selectRoomAndProceed) {
      window.app.selectRoomAndProceed(roomId, 'request-other-private');
    } else if (window.NBC.views['request-form']) {
      window.NBC.views['request-form'].selectRoomAndProceed(roomId, 'request-other-private');
    }
  }
};
