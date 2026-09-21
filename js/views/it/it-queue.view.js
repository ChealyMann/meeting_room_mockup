// IT Dispatch Queue View Component (view-it-queue)
// TypeUI Cafe Design System with NBC Crimson Heritage - Pixel-Perfect to Reference Design
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class ITQueueView {
  constructor() {
    this.id = 'it-queue';
    this.itFilter = 'all'; // 'all', 'waiting', 'setting-up', 'confirmed'
    this.itSearchTerm = '';
    this.itDateFilter = '';
    this.itRoomFilter = 'all';
    this.itSortColumn = 'id';
    this.itSortDirection = 'desc';
    this.itLoadedBatches = 1;
    this.itBatchSize = 4;
    this.itIsLoadingMore = false;
    this.itAutoScrollEnabled = true;
    this._cardsIntersectionObserver = null;
    this._currentPaginatedItems = [];
    this.cardTabState = {}; // { [ticketId]: 'meeting-info' | 'other-details' }
    this.cardAccordionState = {}; // { [`${ticketId}_${section}`]: boolean }

    this.template = `
      <style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes itCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-fade-in {
          animation: itCardFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .it-queue-cards-grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.875rem !important;
          width: 100% !important;
        }
        .it-queue-cards-grid.hidden {
          display: none !important;
        }
        @media (min-width: 1400px) {
          .it-queue-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      </style>

      <!-- Executive Header (Strict No-Sub-Detail Rule: No subtitle under heading) -->
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#E9E3DD]">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">IT Support Queue</h2>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <!-- Reset Filters Button -->
          <button id="it-reset-btn" onclick="app.resetITQueueFilters()" title="Reset all filters" class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs shrink-0">
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Overview Strip (Interactive Filter Shortcuts) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-[#E9E3DD]">
        <!-- Metric 1: Waiting for Staff -->
        <div onclick="app.filterITQueueStatus('waiting')" title="Filter by Waiting for Staff" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-amber-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-amber-600" data-icon="lucide:clock" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Waiting Staff</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="it-kpi-waiting" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Needs Assign</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Setting Up (Staff Assigned) -->
        <div onclick="app.filterITQueueStatus('setting-up')" title="Filter by Setting Up (Staff Assigned)" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-blue-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-blue-600" data-icon="lucide:wrench" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Setting Up</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="it-kpi-setting-up" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Assigned</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Ready & Done (Setup Complete) -->
        <div onclick="app.filterITQueueStatus('confirmed')" title="Filter by Ready & Done" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-emerald-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Ready & Done</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="it-kpi-confirmed" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Completed</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: All IT Tickets -->
        <div onclick="app.resetITQueueFilters()" title="Reset all filters to view all IT tickets" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-[#991B1B] hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-[#991B1B]" data-icon="lucide:server" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">All Tickets</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="it-kpi-total" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Filter Bar (Single-Row Streamlined Layout) -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 w-full">
        <!-- Search Filter -->
        <div class="sm:col-span-4 relative">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:search" data-stroke-width="2"></span>
          <input type="text" id="it-search-input" oninput="app.handleITQueueFilterChange()" placeholder="Search by title, ID, room, staff, gear..." class="bank-input pl-8 pr-7 py-1.5 text-xs w-full bg-white transition border border-[#E9E3DD] rounded-lg shadow-2xs focus:border-[#991B1B]" />
          <button id="it-search-clear" onclick="app.clearITQueueSearch()" title="Clear search" class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#991B1B] p-0.5 rounded transition cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>
        </div>

        <!-- Room Filter -->
        <div class="relative sm:col-span-3">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:map-pin" data-stroke-width="2"></span>
          <select id="it-room-filter" onchange="app.handleITQueueFilterChange()" aria-label="Filter by meeting room" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs truncate">
            <option value="all">All Meeting Rooms</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div class="relative sm:col-span-3">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:calendar" data-stroke-width="2"></span>
          <input type="date" id="it-date-filter" oninput="app.handleITQueueFilterChange()" onchange="app.handleITQueueFilterChange()" class="bank-input pl-8 pr-2.5 py-1.5 text-xs w-full bg-white transition cursor-pointer font-medium border border-[#E9E3DD] rounded-lg shadow-2xs text-stone-700" />
        </div>

        <!-- Status Filter -->
        <div class="relative sm:col-span-2">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:filter" data-stroke-width="2"></span>
          <select id="it-status-filter" onchange="app.handleITQueueFilterChange()" aria-label="Filter by status" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Status</option>
            <option value="waiting">Waiting for Staff</option>
            <option value="setting-up">Setting Up (Assigned)</option>
            <option value="confirmed">Ready & Done</option>
          </select>
        </div>
      </div>

      <!-- Tickets Content Area -->
      <div id="it-tickets-list" class="flex flex-col flex-1 min-h-0 mt-2.5">
        <!-- Populated dynamically -->
      </div>
    `;
  }

  showToast(title, message, type = 'info') {
    if (window.NBC && window.NBC.layouts && window.NBC.layouts.toast && typeof window.NBC.layouts.toast.showToast === 'function') {
      window.NBC.layouts.toast.showToast(title, message, type);
    } else if (window.app && typeof window.app.showToast === 'function') {
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
      <div id="view-it-queue-content" class="w-full h-auto sm:h-[calc(100dvh-150px)] flex flex-col space-y-2.5 min-h-0">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this._bindAppHandlers();
    this._populateRoomDropdown();

    const searchInput = document.getElementById('it-search-input');
    const clearBtn = document.getElementById('it-search-clear');
    if (searchInput && this.itSearchTerm) {
      searchInput.value = this.itSearchTerm;
      if (clearBtn) clearBtn.classList.remove('hidden');
    }

    const dateInput = document.getElementById('it-date-filter');
    if (dateInput && this.itDateFilter) {
      dateInput.value = this.itDateFilter;
    }

    const roomSelect = document.getElementById('it-room-filter');
    if (roomSelect && this.itRoomFilter) {
      roomSelect.value = this.itRoomFilter;
    }

    const statusSelect = document.getElementById('it-status-filter');
    if (statusSelect && this.itFilter) {
      statusSelect.value = this.itFilter;
    }

    this.renderITQueue();
  }

  update() {
    this.renderITQueue();
  }

  renderITTickets() {
    this.renderITQueue();
  }

  toggleCardMainTab(ticketId, tabName) {
    this.cardTabState[ticketId] = tabName;

    const tabMeeting = document.getElementById(`it-tab-meeting-${ticketId}`);
    const tabDetails = document.getElementById(`it-tab-details-${ticketId}`);
    const panelMeeting = document.getElementById(`it-panel-meeting-${ticketId}`);
    const panelDetails = document.getElementById(`it-panel-details-${ticketId}`);

    const activeClasses = ['bg-white', 'text-[#991B1B]', 'border', 'border-[#E9E3DD]', 'shadow-2xs', 'font-bold'];
    const inactiveClasses = ['text-stone-600', 'hover:text-stone-900', 'font-medium', 'border-transparent'];

    if (tabName === 'meeting-info') {
      if (tabMeeting) {
        tabMeeting.classList.remove(...inactiveClasses);
        tabMeeting.classList.add(...activeClasses);
      }
      if (tabDetails) {
        tabDetails.classList.remove(...activeClasses);
        tabDetails.classList.add(...inactiveClasses);
      }
      if (panelMeeting) panelMeeting.classList.remove('hidden');
      if (panelDetails) panelDetails.classList.add('hidden');
    } else {
      if (tabDetails) {
        tabDetails.classList.remove(...inactiveClasses);
        tabDetails.classList.add(...activeClasses);
      }
      if (tabMeeting) {
        tabMeeting.classList.remove(...activeClasses);
        tabMeeting.classList.add(...inactiveClasses);
      }
      if (panelDetails) panelDetails.classList.remove('hidden');
      if (panelMeeting) panelMeeting.classList.add('hidden');
    }
  }

  toggleCardAccordion(ticketId, section) {
    const key = `${ticketId}_${section}`;
    const isCurrentlyExpanded = this.cardAccordionState[key] !== false; // defaults to true
    const nextState = !isCurrentlyExpanded;
    this.cardAccordionState[key] = nextState;

    const body = document.getElementById(`it-accordion-body-${section}-${ticketId}`);
    const chevron = document.getElementById(`it-accordion-chevron-${section}-${ticketId}`);

    if (body) {
      if (nextState) {
        body.classList.remove('hidden');
      } else {
        body.classList.add('hidden');
      }
    }
    if (chevron) {
      chevron.style.transform = nextState ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }

  _bindAppHandlers() {
    if (!window.app) return;
    window.app.toggleITCardMainTab = (ticketId, tabName) => this.toggleCardMainTab(ticketId, tabName);
    window.app.toggleITCardAccordion = (ticketId, section) => this.toggleCardAccordion(ticketId, section);
    window.app.handleITQueueFilterChange = () => this.handleITQueueFilterChange();
    window.app.clearITQueueSearch = () => this.clearITQueueSearch();
    window.app.resetITQueueFilters = () => this.resetITQueueFilters();
    window.app.filterITQueueStatus = (status) => this.filterITQueueStatus(status);
    window.app.loadNextITCardsBatch = () => this.loadNextITCardsBatch();
    window.app.scrollITQueueToTop = () => this.scrollITQueueToTop();
    window.app.copyReferenceCode = (code) => this.copyReferenceCode(code);
    window.app.openBookingDetailsPage = (id) => this.openBookingDetailsPage(id);
    window.app.openITAssignPage = (ticketId) => {
      const assignView = window.NBC.views['it-assign'];
      if (assignView && typeof assignView.openITAssignPage === 'function') {
        assignView.openITAssignPage(ticketId);
      } else {
        this.navigateTo('it-assign', { ticketId });
      }
    };
  }

  _populateRoomDropdown() {
    const roomSelect = document.getElementById('it-room-filter');
    if (!roomSelect || typeof bookingStore === 'undefined') return;

    const rooms = bookingStore.getRooms ? bookingStore.getRooms() : [];
    let optionsHtml = '<option value="all">All Meeting Rooms</option>';
    rooms.forEach(room => {
      const shortName = room.name.split(' - ')[0];
      const floorShort = room.floor ? room.floor.split('(')[0].trim() : '';
      optionsHtml += `<option value="${room.id}">${shortName} (${floorShort})</option>`;
    });
    roomSelect.innerHTML = optionsHtml;
  }

  handleITQueueFilterChange() {
    const searchInput = document.getElementById('it-search-input');
    const clearBtn = document.getElementById('it-search-clear');
    const dateInput = document.getElementById('it-date-filter');
    const roomSelect = document.getElementById('it-room-filter');
    const statusSelect = document.getElementById('it-status-filter');

    this.itSearchTerm = (searchInput?.value || '').trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !this.itSearchTerm);
    }

    this.itDateFilter = dateInput?.value || '';
    this.itRoomFilter = roomSelect?.value || 'all';
    this.itFilter = statusSelect?.value || 'all';

    this.itLoadedBatches = 1;
    this.renderITQueue();
    this.scrollITQueueToTop();
  }

  clearITQueueSearch() {
    const searchInput = document.getElementById('it-search-input');
    if (searchInput) searchInput.value = '';
    this.handleITQueueFilterChange();
    searchInput?.focus();
  }

  filterITQueueStatus(status) {
    this.itFilter = status;
    const statusSelect = document.getElementById('it-status-filter');
    if (statusSelect) {
      statusSelect.value = status;
    }
    this.itLoadedBatches = 1;
    this.renderITQueue();
    this.scrollITQueueToTop();
  }

  resetITQueueFilters() {
    this.itFilter = 'all';
    this.itSearchTerm = '';
    this.itDateFilter = '';
    this.itRoomFilter = 'all';

    const searchInput = document.getElementById('it-search-input');
    if (searchInput) searchInput.value = '';
    const dateInput = document.getElementById('it-date-filter');
    if (dateInput) dateInput.value = '';
    const roomSelect = document.getElementById('it-room-filter');
    if (roomSelect) roomSelect.value = 'all';
    const statusSelect = document.getElementById('it-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    const clearBtn = document.getElementById('it-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.itLoadedBatches = 1;
    this.renderITQueue();
    this.scrollITQueueToTop();
  }

  copyReferenceCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.showToast("Security Code Copied", `Booking code ${code} copied to clipboard.`, "success");
    }).catch(() => {
      this.showToast("Code: " + code, "Security reference code.", "info");
    });
  }

  openBookingDetailsPage(requestId) {
    const detailsView = window.NBC.views['booking-details'];
    if (detailsView && typeof detailsView.openBookingDetailsPage === 'function') {
      detailsView.openBookingDetailsPage(requestId);
    } else {
      this.navigateTo('booking-details', { requestId });
    }
  }

  markSetupComplete(ticketId) {
    bookingStore.finalizeRoomStatus(ticketId);
    this.showToast("Setup Ready", `Equipment setup verified and pass activated for #${ticketId}.`, "success");
    this.renderITQueue();
  }

  _getFilteredITTickets() {
    if (typeof bookingStore === 'undefined') return [];
    const allRequests = bookingStore.getRequests() || [];

    // 1. Filter only requests that require IT support AND have been forwarded after full approval
    let itTickets = (typeof bookingStore.getApprovedITTickets === 'function'
      ? bookingStore.getApprovedITTickets()
      : (bookingStore.getRequests() || []).filter(
          r => r.needsIT && r.itDetails?.ticketForwardedToIT === true && !r.status?.includes('Reject') && !r.status?.includes('Cancel')
        )
    );

    // 2. Filter by status
    itTickets = itTickets.filter(ticket => {
      const staffList = ticket.itDetails?.assignedStaffList || (ticket.itDetails?.assignedStaff ? [ticket.itDetails.assignedStaff] : []);
      const isAssigned = staffList.length > 0;
      const isConfirmed = ticket.status === 'Approved - Confirmed';

      if (this.itFilter === 'waiting') {
        return !isAssigned && !isConfirmed;
      } else if (this.itFilter === 'setting-up') {
        return isAssigned && !isConfirmed;
      } else if (this.itFilter === 'confirmed') {
        return isConfirmed;
      }
      return true;
    });

    // 3. Filter by search term
    if (this.itSearchTerm) {
      const q = this.itSearchTerm;
      itTickets = itTickets.filter(ticket => {
        const staffList = ticket.itDetails?.assignedStaffList || (ticket.itDetails?.assignedStaff ? [ticket.itDetails.assignedStaff] : []);
        const staffNames = staffList.map(s => (s.name || '').toLowerCase()).join(' ');
        const reqItems = (ticket.itDetails?.requestedItems || []).map(i => i.toLowerCase()).join(' ');

        return (ticket.id && ticket.id.toLowerCase().includes(q)) ||
               (ticket.referenceCode && ticket.referenceCode.toLowerCase().includes(q)) ||
               (ticket.meetingTitle && ticket.meetingTitle.toLowerCase().includes(q)) ||
               (ticket.room?.name && ticket.room.name.toLowerCase().includes(q)) ||
               (ticket.room?.floor && ticket.room.floor.toLowerCase().includes(q)) ||
               (ticket.requester?.name && ticket.requester.name.toLowerCase().includes(q)) ||
               (ticket.requester?.phone && ticket.requester.phone.toLowerCase().includes(q)) ||
               (ticket.itDetails?.specialRequirements && ticket.itDetails.specialRequirements.toLowerCase().includes(q)) ||
               reqItems.includes(q) ||
               staffNames.includes(q);
      });
    }

    // 4. Filter by date
    if (this.itDateFilter && this.itDateFilter !== 'all') {
      const selectedDate = this.itDateFilter.trim();
      itTickets = itTickets.filter(ticket => ticket.date === selectedDate);
    }

    // 5. Filter by room
    if (this.itRoomFilter && this.itRoomFilter !== 'all') {
      itTickets = itTickets.filter(ticket => ticket.room?.id === this.itRoomFilter);
    }

    // 6. Sorting
    itTickets.sort((a, b) => {
      const dtA = `${a.date || ''} ${a.startTime || ''}`;
      const dtB = `${b.date || ''} ${b.startTime || ''}`;
      return dtB.localeCompare(dtA);
    });

    return itTickets;
  }

  renderITQueue() {
    const container = document.getElementById('it-tickets-list');
    if (!container || typeof bookingStore === 'undefined') return;

    // 1. Fetch all approved IT tickets for KPI calculation
    const allITTickets = (typeof bookingStore.getApprovedITTickets === 'function'
      ? bookingStore.getApprovedITTickets()
      : (bookingStore.getRequests() || []).filter(
          r => r.needsIT && r.itDetails?.ticketForwardedToIT === true && !r.status?.includes('Reject') && !r.status?.includes('Cancel')
        )
    );

    // 2. Compute KPI counters
    const totalCount = allITTickets.length;
    let waitingCount = 0;
    let settingUpCount = 0;
    let confirmedCount = 0;

    allITTickets.forEach(ticket => {
      const staffList = ticket.itDetails?.assignedStaffList || (ticket.itDetails?.assignedStaff ? [ticket.itDetails.assignedStaff] : []);
      const isAssigned = staffList.length > 0;
      const isConfirmed = ticket.status === 'Approved - Confirmed';

      if (isConfirmed) {
        confirmedCount++;
      } else if (isAssigned) {
        settingUpCount++;
      } else {
        waitingCount++;
      }
    });

    const kpiWaiting = document.getElementById('it-kpi-waiting');
    const kpiSettingUp = document.getElementById('it-kpi-setting-up');
    const kpiConfirmed = document.getElementById('it-kpi-confirmed');
    const kpiTotal = document.getElementById('it-kpi-total');

    if (kpiWaiting) kpiWaiting.innerText = waitingCount;
    if (kpiSettingUp) kpiSettingUp.innerText = settingUpCount;
    if (kpiConfirmed) kpiConfirmed.innerText = confirmedCount;
    if (kpiTotal) kpiTotal.innerText = totalCount;

    // 3. Filter tickets
    const filtered = this._getFilteredITTickets();

    // 4. Empty State
    if (filtered.length === 0) {
      this._disconnectCardsObserver();
      this._currentPaginatedItems = [];
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-2xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl text-stone-400" data-icon="lucide:server" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">No IT Tickets Found</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">There are no IT dispatch tickets matching your active search or filters.</p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button onclick="app.resetITQueueFilters()" class="btn-secondary px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center space-x-1.5">
              <span class="iconify text-xs text-[#78716C]" data-icon="lucide:rotate-ccw" data-stroke-width="1.8"></span>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 5. Card View (Infinite Scrolling Experience)
    const totalItems = filtered.length;
    const currentlyDisplayedCount = Math.min(totalItems, this.itLoadedBatches * this.itBatchSize);
    const displayedItems = filtered.slice(0, currentlyDisplayedCount);
    this._currentPaginatedItems = displayedItems;
    const hasMore = currentlyDisplayedCount < totalItems;
    const remaining = Math.max(0, totalItems - currentlyDisplayedCount);

    const cardsHtml = displayedItems.map(ticket => this._renderSingleTicketCard(ticket, false)).join('');

    let finalHtml = `
      <div class="flex flex-col flex-1 min-h-0">
        <div id="it-cards-scroll-container" class="flex-1 overflow-visible sm:overflow-y-auto hide-scrollbar pt-1 pb-6 pr-1 relative">
          <!-- Card Grid: Single-column on tablets & standard laptops, 2-col on ultra-wide screens (>=1536px) -->
          <div id="it-cards-grid" class="it-queue-cards-grid">
            ${cardsHtml}
          </div>

          <!-- Skeleton Loading Slot for Zero-Shift Infinite Scroll -->
          <div id="it-cards-skeleton-slot" class="it-queue-cards-grid mt-4 ${this.itIsLoadingMore && hasMore ? '' : 'hidden'}">
            ${this.itIsLoadingMore && hasMore ? this._renderCardSkeleton(Math.min(2, remaining)) : ''}
          </div>

          <!-- Sentinel trigger element for IntersectionObserver -->
          <div id="it-cards-infinite-sentinel" class="w-full h-2 pointer-events-none mt-2"></div>

          <!-- Footer Status / Fallback Controls -->
          <div id="it-cards-footer-controls" class="w-full">
            ${this._renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining)}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = finalHtml;
    this._setupCardsInfiniteScrollObserver();
  }

  _renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining) {
    if (this.itIsLoadingMore) {
      return `
        <div class="py-5 flex items-center justify-center space-x-2 text-xs font-semibold text-stone-500 animate-pulse">
          <span class="iconify animate-spin text-sm text-[#991B1B]" data-icon="lucide:loader-2" data-stroke-width="2"></span>
          <span>Loading more IT tickets...</span>
        </div>
      `;
    }

    if (hasMore) {
      return `
        <div class="py-5 flex flex-col items-center justify-center space-y-2">
          <button type="button" onclick="app.loadNextITCardsBatch()" class="h-9 px-5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-[#E9E3DD] text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center space-x-2 cursor-pointer active:scale-[0.98]">
            <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:arrow-down-circle" data-stroke-width="2"></span>
            <span>Load More Tickets</span>
            <span class="text-xs text-stone-500 font-normal">(${remaining} remaining)</span>
          </button>
          <span class="text-xs text-stone-400">Scroll down to auto-load</span>
        </div>
      `;
    }

    return `
      <div class="py-7 flex flex-col items-center justify-center space-y-2.5">
        <div class="flex items-center space-x-3 w-full max-w-md px-4">
          <div class="flex-1 h-[1px] bg-[#E9E3DD]"></div>
          <div class="flex items-center space-x-1.5 text-xs font-semibold text-[#7D6857] shrink-0">
            <span class="iconify text-sm text-emerald-600" data-icon="lucide:check-circle" data-stroke-width="2"></span>
            <span>All ${totalItems} IT tickets loaded</span>
          </div>
          <div class="flex-1 h-[1px] bg-[#E9E3DD]"></div>
        </div>
        <button type="button" onclick="app.scrollITQueueToTop()" class="btn-secondary h-7 px-3 rounded-lg text-xs font-bold text-stone-700 flex items-center space-x-1.5 transition active:scale-[0.98] shadow-2xs hover:border-stone-300">
          <span class="iconify text-xs text-stone-500" data-icon="lucide:arrow-up" data-stroke-width="2"></span>
          <span>Back to Top</span>
        </button>
      </div>
    `;
  }

  _renderCardSkeleton(count = 2) {
    let skeletons = '';
    for (let i = 0; i < count; i++) {
      skeletons += `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-3.5 sm:p-4.5 shadow-xs space-y-3 animate-pulse">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5 rounded-md bg-stone-200"></div>
              <div class="w-24 h-3.5 rounded-md bg-stone-200"></div>
              <div class="w-14 h-3.5 rounded-md bg-stone-100"></div>
            </div>
            <div class="w-24 h-5 rounded-full bg-stone-100 border border-stone-200"></div>
          </div>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-[98px] sm:w-[110px] h-[66px] sm:h-[72px] rounded-lg bg-stone-200 shrink-0"></div>
              <div class="space-y-1.5 flex-1 min-w-0">
                <div class="w-3/4 h-4 rounded-md bg-stone-200"></div>
                <div class="w-1/2 h-3 rounded-md bg-stone-100"></div>
                <div class="w-2/3 h-3 rounded-md bg-stone-100"></div>
              </div>
            </div>
            <div class="w-28 h-10 rounded-xl bg-stone-100 hidden md:block"></div>
          </div>
          <div class="w-full h-16 rounded-xl bg-stone-100"></div>
          <div class="w-full h-12 rounded-xl bg-stone-100"></div>
          <div class="w-full h-10 rounded-xl bg-stone-100"></div>
          <div class="flex items-center justify-between pt-0.5">
            <div class="w-24 h-8 rounded-lg bg-stone-100"></div>
            <div class="w-28 h-8 rounded-lg bg-stone-200"></div>
          </div>
        </div>
      `;
    }
    return skeletons;
  }

  _renderSingleTicketCard(ticket, isNew = false) {
    const staffList = ticket.itDetails?.assignedStaffList || (ticket.itDetails?.assignedStaff ? [ticket.itDetails.assignedStaff] : []);
    const isAssigned = staffList.length > 0;
    const isConfirmed = ticket.status === 'Approved - Confirmed';

    let statusLabel = 'Waiting for Staff';
    let statusIcon = 'lucide:clock';
    let statusBadgeClass = 'text-[#D97706]';

    if (isConfirmed) {
      statusLabel = 'Setup Complete';
      statusIcon = 'lucide:check-circle-2';
      statusBadgeClass = 'text-emerald-700';
    } else if (isAssigned) {
      statusLabel = staffList.length > 1 ? `${staffList.length} Staff Assigned` : 'Staff Assigned';
      statusIcon = 'lucide:wrench';
      statusBadgeClass = 'text-blue-700';
    }

    const roomObj = bookingStore.getRoomById(ticket.room?.id) || ticket.room || {};
    const roomImgUrl = roomObj.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
    const floorShort = (roomObj.floor || 'Level 18').split('(')[0].trim();
    const requestedItems = ticket.itDetails?.requestedItems || [];
    const bookerNote = ticket.itDetails?.specialRequirements || '';
    const userSelectedTab = this.cardTabState[ticket.id];
    // Default to 'meeting-info' as shown in reference design
    const activeTab = userSelectedTab || 'meeting-info';

    return `
      <div class="w-full max-w-full bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-4.5 shadow-xs transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-sm flex flex-col justify-between overflow-hidden ${isNew ? 'animate-card-fade-in' : ''}">
        
        <!-- Row 1: ID + Reference Code + Status Pill (Matches My Bookings line 827) -->
        <div class="flex items-center justify-between mb-3 sm:mb-3.5 flex-wrap gap-2">
          <div class="flex items-center space-x-2 flex-1 min-w-0 flex-wrap gap-y-1">
            <button type="button" onclick="app.openBookingDetailsPage('${ticket.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline cursor-pointer" title="Open Booking Details">
              ${ticket.id}
            </button>
            <span class="text-stone-300 font-light">•</span>
            <button type="button" onclick="app.copyReferenceCode('${ticket.referenceCode || ticket.id}')" title="Click to copy security code" class="font-mono text-xs font-normal text-stone-500 hover:text-stone-800 flex items-center space-x-1 min-w-0 max-w-[45%] cursor-pointer">
              <span class="truncate">${ticket.referenceCode || ticket.id}</span>
              <span class="iconify text-xs text-stone-400 hover:text-stone-600" data-icon="lucide:copy" data-stroke-width="2"></span>
            </button>
            ${ticket.isPrivateRequest ? `
              <span class="inline-flex items-center space-x-1 text-[#B45309] text-[11px] font-semibold">
                <span class="iconify text-[11px] text-[#B45309]" data-icon="lucide:lock" data-stroke-width="2"></span>
                <span>Private Room</span>
              </span>
            ` : ''}
          </div>
          <div class="inline-flex items-center space-x-1.5 text-xs font-medium ${statusBadgeClass}">
            <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
            <span>${statusLabel}</span>
          </div>
        </div>

        <!-- Row 2: Sleek Low-Profile Tab Pill Bar (Matches My Bookings clean rhythm) -->
        <div class="mb-3.5 sm:mb-4 p-0.5 bg-[#F5F0EB] rounded-full border border-[#E9E3DD] grid grid-cols-2 gap-1 w-full">
          <!-- Meeting Info Tab -->
          <button 
            type="button" 
            id="it-tab-meeting-${ticket.id}" 
            onclick="app.toggleITCardMainTab('${ticket.id}', 'meeting-info')" 
            class="h-7 px-3 rounded-full border border-transparent text-xs transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer ${activeTab === 'meeting-info' ? 'bg-white text-[#991B1B] border-[#E9E3DD] shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900 font-medium'}"
          >
            <span class="iconify text-xs" data-icon="lucide:calendar" data-stroke-width="2"></span>
            <span>Meeting Info</span>
          </button>

          <!-- Other Details Tab -->
          <button 
            type="button" 
            id="it-tab-details-${ticket.id}" 
            onclick="app.toggleITCardMainTab('${ticket.id}', 'other-details')" 
            class="h-7 px-3 rounded-full border border-transparent text-xs transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer ${activeTab === 'other-details' ? 'bg-white text-[#991B1B] border-[#E9E3DD] shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900 font-medium'}"
          >
            <span class="iconify text-xs" data-icon="lucide:file-text" data-stroke-width="2"></span>
            <span>Other Details</span>
          </button>
        </div>

        <!-- Row 3: Card Body (Shared stable height container matching My Bookings) -->
        <div class="flex-1 flex flex-col justify-between">
          
          <!-- TAB 1: Meeting Info (Room, Specs, Booker, Stepper) -->
          <div id="it-panel-meeting-${ticket.id}" class="flex-1 flex flex-col justify-between transition-opacity duration-150 ${activeTab === 'meeting-info' ? '' : 'hidden'}">
            <div class="flex-1 min-w-0 flex flex-col justify-start">
              <!-- Room Thumbnail + Meeting Specs + Contact Booker (Matches My Bookings lines 845-867) -->
              <div class="flex items-center justify-between gap-3 sm:gap-4 mb-1">
                <div class="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <img src="${roomImgUrl}" class="rounded-xl object-cover border border-[#E9E3DD] shrink-0 w-[116px] sm:w-[124px] h-[74px] sm:h-[78px] shadow-2xs" alt="Room" />
                  <div class="min-w-0 flex-1">
                    <h4 class="font-heading font-semibold text-sm text-stone-900 leading-snug truncate" title="${ticket.meetingTitle || ''}">
                    ${ticket.meetingTitle || 'Meeting'}
                  </h4>
                  <div class="flex items-center space-x-1.5 text-xs text-stone-500 mt-1 font-normal">
                    <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                    <span class="font-medium text-stone-800 min-w-0 max-w-[150px] sm:max-w-[190px] truncate" title="${ticket.room?.name || 'Mekong River'}">${ticket.room?.name || 'Mekong River'}</span>
                    <span class="text-stone-300 font-light">•</span>
                    <span class="text-stone-500">${floorShort}</span>
                  </div>
                  <div class="flex items-center flex-wrap sm:flex-nowrap gap-x-2 gap-y-0.5 text-xs font-mono font-medium text-stone-600 mt-1.5">
                    <span class="inline-flex items-center space-x-1 text-stone-600 shrink-0">
                      <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:calendar" data-stroke-width="2"></span>
                      <span>${ticket.date}</span>
                    </span>
                    <span class="text-stone-300 font-light hidden sm:inline">•</span>
                    <span class="inline-flex items-center space-x-1 font-semibold text-stone-800 shrink-0">
                      <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:clock" data-stroke-width="2"></span>
                      <span>${ticket.startTime} – ${ticket.endTime}</span>
                    </span>
                  </div>
                  
                  <!-- Mobile Contact Booker sub-row (< md) -->
                  <div class="md:hidden flex items-center space-x-2 pt-1.5 mt-1.5 border-t border-stone-100 text-xs text-stone-600">
                    <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:user" data-stroke-width="2"></span>
                    <span class="font-medium text-stone-800 truncate">${ticket.requester?.name || 'Staff'}</span>
                    <span class="text-stone-300">•</span>
                    <a href="tel:${ticket.requester?.phone || ''}" class="text-stone-500 hover:text-stone-800 flex items-center space-x-1">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:phone" data-stroke-width="2"></span>
                      <span>${ticket.requester?.phone || '0964246058'}</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Desktop Contact Booker (>= md) -->
              <div class="shrink-0 hidden md:flex md:w-[166px] md:max-w-[42%] min-w-0 items-center space-x-2.5 pl-3.5 border-l border-stone-200">
                <div class="w-8 h-8 min-w-[32px] max-w-[32px] h-[32px] rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 border border-stone-200" style="width: 32px; height: 32px;">
                  <span class="iconify text-base" data-icon="lucide:user" data-stroke-width="2"></span>
                </div>
                <div class="min-w-0">
                  <span class="text-[11px] text-stone-400 font-normal block leading-tight">Contact Booker</span>
                  <strong class="text-xs font-bold text-stone-900 block leading-snug max-w-[120px] truncate" title="${ticket.requester?.name || 'Staff'}">${ticket.requester?.name || 'Staff'}</strong>
                  <div class="flex items-center space-x-1 min-w-0 text-[11px] text-stone-500 font-normal mt-0.5">
                    <span class="iconify text-stone-400 text-xs" data-icon="lucide:phone" data-stroke-width="2"></span>
                    <span class="truncate" title="${ticket.requester?.phone || '0964246058'}">${ticket.requester?.phone || '0964246058'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stepper: Visual Progress (Matches My Bookings line 1085: sits directly on card canvas) -->
          ${this._renderITStepper(ticket)}
        </div>

          <!-- TAB 2: Other Details (Flat, Airy, Uncluttered - Matches My Bookings) -->
          <div id="it-panel-details-${ticket.id}" class="flex-1 flex flex-col justify-center space-y-3 sm:space-y-3.5 transition-opacity duration-150 ${activeTab === 'other-details' ? '' : 'hidden'}">
            
            <!-- Section 1: Equipment Needed (Flat Clean Chips) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-stone-800 flex items-center space-x-1.5">
                  <span class="iconify text-stone-500 text-xs" data-icon="lucide:box" data-stroke-width="2"></span>
                  <span>Equipment Needed</span>
                  <span class="text-stone-400 font-normal">(${requestedItems.length})</span>
                </span>
                ${requestedItems.length > 0 ? `
                  <span class="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                    <span class="iconify text-xs text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                    <span>Requested</span>
                  </span>
                ` : ''}
              </div>

              <div class="flex flex-wrap gap-2">
                ${requestedItems.length > 0 ? requestedItems.map(item => `
                  <span class="px-2.5 py-1 rounded-full bg-emerald-50/60 text-stone-800 border border-emerald-200/70 font-medium text-[11px] flex items-center space-x-1.5">
                    <span class="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span class="iconify text-emerald-700 text-[9px]" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    </span>
                    <span class="min-w-0 max-w-[180px] truncate" title="${item}">${item}</span>
                  </span>
                `).join('') : `
                  <span class="text-stone-400 italic text-xs py-0.5">Standard room equipment only</span>
                `}
              </div>

              ${bookerNote ? `
                <div class="flex items-start space-x-1.5 pt-1.5 text-[11px] text-stone-500 mt-1.5">
                  <span class="iconify text-stone-400 text-xs shrink-0 mt-0.5" data-icon="lucide:message-square" data-stroke-width="2"></span>
                  <p class="leading-tight min-w-0 max-w-full truncate" title="${bookerNote}"><strong class="text-stone-700 font-medium">Note:</strong> ${bookerNote}</p>
                </div>
              ` : ''}
            </div>

            <!-- Subtle Hairline Divider -->
            <div class="h-[1px] bg-[#E9E3DD]/70 w-full my-1"></div>

            <!-- Section 2: IT Staff Assignment (Flat Clean Row) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-stone-800 flex items-center space-x-1.5">
                  <span class="iconify text-stone-500 text-xs" data-icon="lucide:users" data-stroke-width="2"></span>
                  <span>Assigned IT Staff</span>
                </span>
                ${isAssigned ? `
                  <span class="flex items-center space-x-1 text-[#991B1B] text-[11px] font-medium">
                    <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:clock-4" data-stroke-width="2"></span>
                    <span>Prep: ${ticket.itDetails.scheduledPrepTime || '30 mins before'}</span>
                  </span>
                ` : ''}
              </div>

              ${isAssigned ? `
                <div class="grid grid-cols-1 ${staffList.length > 1 ? 'sm:grid-cols-2' : ''} gap-2">
                  ${staffList.map(staff => `
                    <div class="flex items-center space-x-2 bg-[#FAF7F4] px-3 py-2 rounded-xl border border-[#E9E3DD]/80">
                      <img 
                        src="${staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" 
                        class="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0" 
                        style="width: 28px; height: 28px;"
                        alt="${staff.name}" 
                      />
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 text-xs font-semibold block leading-tight truncate">${staff.name}</strong>
                        <span class="text-stone-500 text-[11px] block truncate font-mono">${staff.title?.split(' ')[0] || 'IT Tech'} • ${staff.phone || ''}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <!-- Clean, Calm Unassigned Prompt (Zero bulky alerts) -->
                <div class="flex items-center py-2.5 px-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]/80">
                  <div class="flex items-center space-x-2 min-w-0">
                    <span class="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                      <span class="iconify text-xs text-stone-500" data-icon="lucide:user-x" data-stroke-width="2"></span>
                    </span>
                    <span class="text-xs text-stone-600 truncate">No staff assigned yet</span>
                  </div>
                </div>
              `}
            </div>

          </div>
        </div>

        <!-- Row 4: Action Buttons Row (Matches My Bookings: strict h-9 rounded-xl, 1px border) -->
        <div class="mt-3.5 flex items-center gap-2">
          <!-- View Details Button -->
          <button type="button" onclick="app.openBookingDetailsPage('${ticket.id}')" class="flex-1 btn-secondary h-9 px-3.5 rounded-xl border border-[#E9E3DD] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none">
            <span class="iconify text-sm text-stone-500 shrink-0" data-icon="lucide:eye" data-stroke-width="2"></span>
            <span class="leading-none text-stone-800">View Details</span>
          </button>

          ${isAssigned && !isConfirmed ? `
            <button type="button" onclick="window.NBC.views['it-queue'].markSetupComplete('${ticket.id}')" class="h-9 px-3.5 shrink-0 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none shadow-xs">
              <span class="iconify text-sm text-white shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
              <span class="text-white leading-none">Confirm Ready</span>
            </button>
          ` : ''}

          <button type="button" onclick="app.openITAssignPage('${ticket.id}')" class="btn-primary h-9 px-3.5 shrink-0 rounded-xl border border-[#991B1B] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none shadow-xs">
            <span class="iconify text-sm text-white shrink-0" data-icon="${isAssigned ? 'lucide:user-cog' : 'lucide:user-plus'}" data-stroke-width="2"></span>
            <span class="text-white leading-none">${isAssigned ? 'Change Staff' : 'Assign Staff'}</span>
          </button>
        </div>

      </div>
    `;
  }

  _renderITStepper(ticket) {
    const staffList = ticket.itDetails?.assignedStaffList || (ticket.itDetails?.assignedStaff ? [ticket.itDetails.assignedStaff] : []);
    const isAssigned = staffList.length > 0;
    const isConfirmed = ticket.status === 'Approved - Confirmed';

    let progressPercent = '33.3%';
    if (isConfirmed) {
      progressPercent = '100%';
    } else if (isAssigned) {
      progressPercent = '66.6%';
    }

    const lineBoundsClass = 'left-[10%] right-[10%] sm:left-[12.5%] sm:right-[12.5%]';

    return `
      <div class="relative w-full my-3.5 pt-0.5 pb-1">
        <!-- Connecting Line Background & Progress (Center at 11px, matches center of 24px nodes) -->
        <div class="absolute top-[11px] ${lineBoundsClass} h-[2px] bg-[#E7DFD7] rounded-full z-0 pointer-events-none">
          <div class="h-full bg-emerald-600 rounded-full transition-all duration-300" style="width: ${progressPercent};"></div>
        </div>

        <!-- Stepper Nodes Track (Matches My Bookings line 1092) -->
        <div class="relative z-10 flex items-start justify-between w-full">
          <!-- Step 1: Received -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
            </div>
            <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Received</span>
          </div>

          <!-- Step 2: Staff Assigned -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isAssigned || isConfirmed ? `
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Staff Assigned</span>
            ` : `
              <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">2. Staff Assigned</span>
            `}
          </div>

          <!-- Step 3: Setting Up -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isConfirmed ? `
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">3. Setting Up</span>
            ` : (isAssigned ? `
              <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">3. Setting Up</span>
              <span class="text-[10px] sm:text-xs font-normal text-emerald-700 mt-0.5 whitespace-nowrap">Setting Up</span>
            ` : `
              <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs shrink-0">
                <span>3</span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-500 mt-2 whitespace-nowrap">3. Setting Up</span>
            `)}
          </div>

          <!-- Step 4: Ready -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isConfirmed ? `
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">4. Ready</span>
              <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Ready</span>
            ` : `
              <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs shrink-0">
                <span>4</span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">4. Ready</span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  _setupCardsInfiniteScrollObserver() {
    this._disconnectCardsObserver();

    const sentinel = document.getElementById('it-cards-infinite-sentinel');
    const scrollContainer = document.getElementById('it-cards-scroll-container');
    if (!sentinel || !scrollContainer) return;

    if (typeof IntersectionObserver === 'undefined') return;

    this._cardsIntersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !this.itIsLoadingMore && this.itAutoScrollEnabled) {
        this.loadNextITCardsBatch();
      }
    }, {
      root: scrollContainer,
      rootMargin: '120px',
      threshold: 0.1
    });

    this._cardsIntersectionObserver.observe(sentinel);
  }

  _disconnectCardsObserver() {
    if (this._cardsIntersectionObserver) {
      this._cardsIntersectionObserver.disconnect();
      this._cardsIntersectionObserver = null;
    }
  }

  loadNextITCardsBatch() {
    if (this.itIsLoadingMore) return;

    const filtered = this._getFilteredITTickets();
    const totalItems = filtered.length;
    const currentDisplayed = this.itLoadedBatches * this.itBatchSize;

    if (currentDisplayed >= totalItems) {
      return;
    }

    this.itIsLoadingMore = true;

    const skeletonSlot = document.getElementById('it-cards-skeleton-slot');
    const footerControls = document.getElementById('it-cards-footer-controls');
    const remainingAfter = totalItems - currentDisplayed;
    const nextBatchSize = Math.min(this.itBatchSize, remainingAfter);

    if (skeletonSlot) {
      skeletonSlot.innerHTML = this._renderCardSkeleton(Math.min(2, nextBatchSize));
      skeletonSlot.classList.remove('hidden');
    }
    if (footerControls) {
      footerControls.innerHTML = this._renderCardsFooterControls(totalItems, currentDisplayed, true, remainingAfter);
    }

    // 400ms simulated micro-latency for smooth skeleton experience
    setTimeout(() => {
      const nextBatchItems = filtered.slice(currentDisplayed, currentDisplayed + nextBatchSize);
      this.itLoadedBatches++;

      const grid = document.getElementById('it-cards-grid');
      if (grid && nextBatchItems.length > 0) {
        const newCardsHtml = nextBatchItems.map(ticket => {
          return this._renderSingleTicketCard(ticket, true);
        }).join('');
        grid.insertAdjacentHTML('beforeend', newCardsHtml);
      }

      if (skeletonSlot) {
        skeletonSlot.innerHTML = '';
        skeletonSlot.classList.add('hidden');
      }

      const newDisplayed = this.itLoadedBatches * this.itBatchSize;
      const newHasMore = newDisplayed < totalItems;
      const newRemaining = Math.max(0, totalItems - newDisplayed);

      this.itIsLoadingMore = false;

      if (footerControls) {
        footerControls.innerHTML = this._renderCardsFooterControls(totalItems, Math.min(totalItems, newDisplayed), newHasMore, newRemaining);
      }

      if (newHasMore) {
        const sentinel = document.getElementById('it-cards-infinite-sentinel');
        if (sentinel && this._cardsIntersectionObserver) {
          this._cardsIntersectionObserver.unobserve(sentinel);
          this._cardsIntersectionObserver.observe(sentinel);
        }
      } else {
        this._disconnectCardsObserver();
      }
    }, 400);
  }

  scrollITQueueToTop() {
    const scrollContainer = document.getElementById('it-cards-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

window.NBC.views['it-queue'] = new ITQueueView();
