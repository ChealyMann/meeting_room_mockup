// Room Owner Queue View Component (view-room-owner-queue)
// Cafe Design System with NBC Crimson Heritage
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomOwnerQueueView {
  constructor() {
    this.id = 'room-owner-queue';
    this.ownerFilter = 'all'; // 'all', 'pending', 'conflict', 'approved', 'rejected'
    this.ownerViewMode = 'cards'; // Cards view by default matching my-bookings & it-queue
    this.ownerSearchTerm = '';
    this.ownerDateFilter = '';
    this.ownerRoomFilter = 'all';
    this.ownerDeptFilter = 'all';
    this.ownerSortColumn = 'id';
    this.ownerSortDirection = 'desc';
    this.selectedOwnerRequestIds = new Set();
    this.ownerExpandedRows = new Set();
    this.ownerCurrentPage = 0;
    this.ownerTablePageSize = 6;
    this.ownerCardsPageSize = 4;
    this.ownerPageSize = 6;
    this.ownerLoadedBatches = 1;
    this.ownerBatchSize = 4;
    this.ownerIsLoadingMore = false;
    this.ownerAutoScrollEnabled = true;
    this._cardsIntersectionObserver = null;
    this._currentPaginatedItems = [];
    this._pendingRejectTarget = null; // null, 'batch', or requestId

    this.template = `<style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes ownerCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-fade-in {
          animation: ownerCardFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .owner-queue-cards-grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.875rem !important;
          width: 100% !important;
        }
        .owner-queue-cards-grid.hidden {
          display: none !important;
        }
        @media (min-width: 1400px) {
          .owner-queue-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      </style>
      <!-- Executive Queue Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E9E3DD]">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">Private Room Approvals</h2>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center space-x-1 shrink-0 bg-stone-100 p-0.5 rounded-lg border border-[#E9E3DD]">
          <button id="owner-view-cards-btn" onclick="app.setOwnerViewMode('cards')" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-white" data-icon="lucide:layout-grid" data-stroke-width="2"></span>
            <span>Cards</span>
          </button>
          <button id="owner-view-table-btn" onclick="app.setOwnerViewMode('table')" class="px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:table" data-stroke-width="2"></span>
            <span>Table</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Overview Strip (Interactive Filter Shortcuts) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-[#E9E3DD]">
        <!-- Metric 1: Pending Owner Review -->
        <div onclick="app.filterOwnerRequests('pending')" title="Filter by Pending Review" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-amber-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-amber-600" data-icon="lucide:clock" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Action Required</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="owner-kpi-pending" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">Pending</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Today's Sessions -->
        <div onclick="app.setOwnerQuickDate('today')" title="Filter to Today's Requests" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-sky-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-sky-600" data-icon="lucide:calendar" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Today's Requests</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="owner-kpi-today" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">Scheduled</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Confirmed / Approved -->
        <div onclick="app.filterOwnerRequests('approved')" title="Filter by Approved" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-emerald-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Approved</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="owner-kpi-approved" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">This week</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: Executive Rooms Under Management -->
        <div onclick="app.resetOwnerFilters()" title="Reset all filters to view all private rooms" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-[#991B1B] hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-[#991B1B]" data-icon="lucide:door-closed" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Private Rooms</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="owner-kpi-rooms" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">3</span>
              <span class="text-xs text-stone-500">In Facility</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Filter Bar (Organized 12-Column Responsive Grid) -->
      <div class="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 w-full items-center">
        <!-- Search (Col span 3) -->
        <div class="col-span-2 sm:col-span-6 lg:col-span-3 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:search" data-stroke-width="2"></span>
          <input type="text" id="owner-search-input" oninput="app.handleOwnerFilterChange()" placeholder="Search by meeting ID, requester..." class="bank-input pl-8 pr-7 py-1.5 text-xs w-full bg-white transition border border-[#E9E3DD] rounded-lg shadow-2xs focus:border-[#991B1B]" />
          <button id="owner-search-clear" onclick="app.clearOwnerSearch()" title="Clear search" class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#991B1B] p-0.5 rounded transition cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>
        </div>

        <!-- Room Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:map-pin" data-stroke-width="2"></span>
          <select id="owner-room-filter" onchange="app.handleOwnerFilterChange()" aria-label="Filter by private room" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Private Rooms</option>
          </select>
        </div>

        <!-- Department Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:building-2" data-stroke-width="2"></span>
          <select id="owner-dept-filter" onchange="app.handleOwnerFilterChange()" aria-label="Filter by department" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Departments</option>
            <option value="Board & Executive Office">Board & Executive Office</option>
            <option value="General Secretariat">General Secretariat</option>
            <option value="Policy & Cooperation">Policy & Cooperation</option>
            <option value="Banking Operations">Banking Operations</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Banking Supervision">Banking Supervision</option>
            <option value="Internal Audit">Internal Audit</option>
          </select>
        </div>

        <!-- Date Filter (Col span 2) - Ample width for mm/dd/yyyy with icon -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:calendar" data-stroke-width="2"></span>
          <input type="date" id="owner-date-filter" oninput="app.handleOwnerFilterChange()" onchange="app.handleOwnerFilterChange()" class="bank-input pl-8 pr-3 py-1.5 text-xs w-full bg-white transition cursor-pointer font-medium border border-[#E9E3DD] rounded-lg shadow-2xs text-stone-700" />
        </div>

        <!-- Status Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:filter" data-stroke-width="2"></span>
          <select id="owner-status-filter" onchange="app.handleOwnerFilterChange()" aria-label="Filter by status" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="conflict">Time Conflict</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Reset Button (Col span 1) -->
        <div class="col-span-2 sm:col-span-2 lg:col-span-1 w-full">
          <button id="owner-reset-btn" onclick="app.resetOwnerFilters()" title="Reset all filters" class="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 h-[31px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer border border-[#E9E3DD] shadow-2xs">
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Requests Content (Table or Cards rendered dynamically) -->
      <div id="view-owner-requests-list" class="flex flex-col flex-1 min-h-0 mt-2.5">
        <!-- Populated dynamically -->
      </div>

      <!-- Custom In-App Modal for Declinining Reservations (No native prompt blocker) -->
      <div id="owner-reject-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-scale-in" onclick="event.stopPropagation()">
          <div class="bg-[#2A0808] px-5 py-3.5 border-b border-[#450A0A] flex items-center justify-between text-white">
            <div class="flex items-center space-x-2">
              <span class="iconify text-base text-white" data-icon="lucide:ban" data-stroke-width="2"></span>
              <h3 id="owner-reject-modal-title" class="font-heading font-bold text-sm text-white">Decline Reservation</h3>
            </div>
            <button type="button" onclick="app.closeOwnerRejectModal()" class="text-stone-400 hover:text-white p-1 rounded transition cursor-pointer">
              <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>
          <div class="p-5 space-y-3">
            <p id="owner-reject-modal-desc" class="text-xs text-stone-600 leading-relaxed">
              Please enter the reason for declining this private boardroom reservation:
            </p>
            <div>
              <label class="form-label text-stone-700 font-bold text-xs mb-1 block">Reason for Rejection <span class="text-[#991B1B]">*</span></label>
              <textarea id="owner-reject-reason-input" rows="3" class="bank-input text-xs w-full p-2.5 border border-[#E9E3DD] rounded-lg focus:border-[#991B1B]" placeholder="e.g. Room unavailable due to scheduled VIP maintenance or executive session.">Room unavailable due to scheduled VIP maintenance.</textarea>
            </div>
            <div class="flex items-center justify-end space-x-2 pt-2">
              <button type="button" onclick="app.closeOwnerRejectModal()" class="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer">
                Cancel
              </button>
              <button type="button" id="owner-confirm-reject-btn" onclick="app.confirmOwnerModalRejection()" class="px-4 py-2 rounded-lg text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center space-x-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
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
      <div id="view-room-owner-queue-content" class="w-full h-[calc(100dvh-140px)] flex flex-col space-y-2.5 min-h-0">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this._bindAppHandlers();
    this._populateRoomDropdown();

    const searchInput = document.getElementById('owner-search-input');
    const clearBtn = document.getElementById('owner-search-clear');
    if (searchInput && this.ownerSearchTerm) {
      searchInput.value = this.ownerSearchTerm;
      if (clearBtn) clearBtn.classList.remove('hidden');
    }

    const dateInput = document.getElementById('owner-date-filter');
    if (dateInput && this.ownerDateFilter) {
      dateInput.value = this.ownerDateFilter;
    }

    const roomSelect = document.getElementById('owner-room-filter');
    if (roomSelect && this.ownerRoomFilter) {
      roomSelect.value = this.ownerRoomFilter;
    }

    const deptSelect = document.getElementById('owner-dept-filter');
    if (deptSelect && this.ownerDeptFilter) {
      deptSelect.value = this.ownerDeptFilter;
    }

    const statusSelect = document.getElementById('owner-status-filter');
    if (statusSelect && this.ownerFilter) {
      statusSelect.value = this.ownerFilter;
    }

    this._updateViewModeButtons();
    this.renderRoomOwnerRequests();
  }

  update() {
    this.renderRoomOwnerRequests();
  }

  _bindAppHandlers() {
    if (!window.app) return;
    // Bind all necessary methods for HTML onclick handler safety
    window.app.setOwnerViewMode = (mode) => this.setOwnerViewMode(mode);
    window.app.handleOwnerFilterChange = () => this.handleOwnerFilterChange();
    window.app.clearOwnerSearch = () => this.clearOwnerSearch();
    window.app.clearOwnerDateFilter = () => this.clearOwnerDateFilter();
    window.app.setOwnerQuickDate = (type) => this.setOwnerQuickDate(type);
    window.app.resetOwnerFilters = () => this.resetOwnerFilters();
    window.app.filterOwnerRequests = (status) => this.filterOwnerRequests(status);
    window.app.goToOwnerPage = (page) => this.goToOwnerPage(page);
    window.app.toggleOwnerRowExpansion = (reqId) => this.toggleOwnerRowExpansion(reqId);
    window.app.quickOwnerApprove = (reqId) => this.quickOwnerApprove(reqId);
    window.app.quickOwnerReject = (reqId) => this.quickOwnerReject(reqId);
    window.app.openOwnerRejectModal = (reqId) => this.openOwnerRejectModal(reqId);
    window.app.closeOwnerRejectModal = () => this.closeOwnerRejectModal();
    window.app.confirmOwnerModalRejection = () => this.confirmOwnerModalRejection();
    window.app.seedSampleOwnerRequests = () => this.seedSampleOwnerRequests();
    window.app.sortOwnerBy = (col) => this.sortOwnerBy(col);
    window.app.toggleOwnerRequestSelect = (id, checked) => this.toggleOwnerRequestSelect(id, checked);
    window.app.toggleSelectAllOwnerRequests = (checked) => this.toggleSelectAllOwnerRequests(checked);
    window.app.batchApproveOwnerSelected = () => this.batchApproveOwnerSelected();
    window.app.batchRejectOwnerSelected = () => this.batchRejectOwnerSelected();
    window.app.openRoomOwnerReviewWorkspace = (reqId) => this.openRoomOwnerReviewWorkspace(reqId);
    window.app.loadNextOwnerCardsBatch = () => this.loadNextOwnerCardsBatch();
    window.app.scrollOwnerQueueToTop = () => this.scrollOwnerQueueToTop();
    window.app.copyOwnerReferenceCode = (code) => this.copyOwnerReferenceCode(code);
  }

  _populateRoomDropdown() {
    const roomSelect = document.getElementById('owner-room-filter');
    if (!roomSelect || typeof bookingStore === 'undefined') return;

    const privateRooms = bookingStore.getPrivateRooms ? bookingStore.getPrivateRooms() : [];
    let optionsHtml = '<option value="all">All Private Rooms</option>';
    privateRooms.forEach(room => {
      const shortName = room.name.split(' - ')[0];
      const floorShort = room.floor ? room.floor.split('(')[0].trim() : '';
      optionsHtml += `<option value="${room.id}">${shortName} (${floorShort})</option>`;
    });
    roomSelect.innerHTML = optionsHtml;
  }

  setOwnerViewMode(mode) {
    this.ownerViewMode = mode;
    this.ownerCurrentPage = 0;
    this.ownerLoadedBatches = 1;
    this._updateViewModeButtons();
    this.renderRoomOwnerRequests();
    if (mode === 'cards') {
      this.scrollOwnerQueueToTop();
    }
  }

  _updateViewModeButtons() {
    const tableBtn = document.getElementById('owner-view-table-btn');
    const cardsBtn = document.getElementById('owner-view-cards-btn');

    if (tableBtn && cardsBtn) {
      const isCards = this.ownerViewMode === 'cards';
      cardsBtn.className = isCards
        ? 'px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer'
        : 'px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer';
      tableBtn.className = !isCards
        ? 'px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer'
        : 'px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer';

      const tIcon = tableBtn.querySelector('.iconify');
      const cIcon = cardsBtn.querySelector('.iconify');
      if (cIcon) cIcon.setAttribute('class', `iconify text-xs ${isCards ? 'text-white' : 'text-stone-500'}`);
      if (tIcon) tIcon.setAttribute('class', `iconify text-xs ${!isCards ? 'text-white' : 'text-stone-500'}`);
    }
  }

  handleOwnerFilterChange() {
    const searchInput = document.getElementById('owner-search-input');
    const clearBtn = document.getElementById('owner-search-clear');
    const dateInput = document.getElementById('owner-date-filter');
    const roomSelect = document.getElementById('owner-room-filter');
    const deptSelect = document.getElementById('owner-dept-filter');
    const statusSelect = document.getElementById('owner-status-filter');

    this.ownerSearchTerm = (searchInput?.value || '').trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !this.ownerSearchTerm);
    }

    this.ownerDateFilter = dateInput?.value || '';
    this.ownerRoomFilter = roomSelect?.value || 'all';
    this.ownerDeptFilter = deptSelect?.value || 'all';
    this.ownerFilter = statusSelect?.value || 'all';

    this.ownerCurrentPage = 0;
    this.ownerLoadedBatches = 1;
    this.renderRoomOwnerRequests();
    if (this.ownerViewMode === 'cards') {
      this.scrollOwnerQueueToTop();
    }
  }

  clearOwnerSearch() {
    const searchInput = document.getElementById('owner-search-input');
    if (searchInput) searchInput.value = '';
    this.handleOwnerFilterChange();
    searchInput?.focus();
  }

  clearOwnerDateFilter() {
    const dateInput = document.getElementById('owner-date-filter');
    if (dateInput) dateInput.value = '';
    this.handleOwnerFilterChange();
    dateInput?.focus();
  }

  setOwnerQuickDate(type) {
    const dateInput = document.getElementById('owner-date-filter');
    const now = new Date();
    if (type === 'today') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const realToday = `${y}-${m}-${d}`;

      const allRequests = (typeof bookingStore !== 'undefined' ? bookingStore.getRequests() : []).filter(r => !!r.isPrivateRequest || !!r.room?.isPrivate);
      const hasReal = allRequests.some(r => r.date === realToday);
      const targetDate = hasReal ? realToday : '2026-09-10';

      if (dateInput) dateInput.value = targetDate;
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    } else {
      if (dateInput) dateInput.value = '';
    }
    this.handleOwnerFilterChange();
  }

  filterOwnerRequests(status) {
    this.ownerFilter = status;
    const statusSelect = document.getElementById('owner-status-filter');
    if (statusSelect) {
      statusSelect.value = status;
    }
    this.ownerCurrentPage = 0;
    this.ownerLoadedBatches = 1;
    this.renderRoomOwnerRequests();
    if (this.ownerViewMode === 'cards') {
      this.scrollOwnerQueueToTop();
    }
  }

  resetOwnerFilters() {
    this.ownerFilter = 'all';
    this.ownerSearchTerm = '';
    this.ownerDateFilter = '';
    this.ownerRoomFilter = 'all';
    this.ownerDeptFilter = 'all';

    const searchInput = document.getElementById('owner-search-input');
    if (searchInput) searchInput.value = '';
    const dateInput = document.getElementById('owner-date-filter');
    if (dateInput) dateInput.value = '';
    const roomSelect = document.getElementById('owner-room-filter');
    if (roomSelect) roomSelect.value = 'all';
    const deptSelect = document.getElementById('owner-dept-filter');
    if (deptSelect) deptSelect.value = 'all';
    const statusSelect = document.getElementById('owner-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    const clearBtn = document.getElementById('owner-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.ownerCurrentPage = 0;
    this.ownerLoadedBatches = 1;
    this.renderRoomOwnerRequests();
    if (this.ownerViewMode === 'cards') {
      this.scrollOwnerQueueToTop();
    }
  }

  toggleOwnerRowExpansion(reqId) {
    if (this.ownerExpandedRows.has(reqId)) {
      this.ownerExpandedRows.delete(reqId);
    } else {
      this.ownerExpandedRows.add(reqId);
    }
    this.renderRoomOwnerRequests();
  }

  goToOwnerPage(page) {
    if (page < 0) return;
    this.ownerCurrentPage = page;
    this.renderRoomOwnerRequests();
    const scrollableEl = document.querySelector('#view-owner-requests-list .overflow-y-auto');
    if (scrollableEl) {
      scrollableEl.scrollTop = 0;
    }
  }

  openRoomOwnerReviewWorkspace(requestId) {
    const reviewView = window.NBC.views['room-owner-review'];
    if (reviewView && typeof reviewView.openRoomOwnerReviewWorkspace === 'function') {
      reviewView.openRoomOwnerReviewWorkspace(requestId);
    } else {
      this.navigateTo('room-owner-review', { requestId });
    }
  }

  sortOwnerBy(column) {
    if (this.ownerSortColumn === column) {
      this.ownerSortDirection = this.ownerSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.ownerSortColumn = column;
      this.ownerSortDirection = (column === 'id' || column === 'schedule') ? 'desc' : 'asc';
    }
    this.renderRoomOwnerRequests();
  }

  _getSortIcon(column) {
    if (this.ownerSortColumn === column) {
      return this.ownerSortDirection === 'asc'
        ? '<span class="iconify text-[#991B1B] text-xs" data-icon="lucide:arrow-up" data-stroke-width="2"></span>'
        : '<span class="iconify text-[#991B1B] text-xs" data-icon="lucide:arrow-down" data-stroke-width="2"></span>';
    }
    return '<span class="iconify text-stone-400 text-xs" data-icon="lucide:chevrons-up-down" data-stroke-width="2"></span>';
  }

  toggleOwnerRequestSelect(reqId, isChecked) {
    if (isChecked) {
      this.selectedOwnerRequestIds.add(reqId);
    } else {
      this.selectedOwnerRequestIds.delete(reqId);
    }
    this.renderRoomOwnerRequests();
  }

  toggleSelectAllOwnerRequests(isChecked) {
    const items = this._currentPaginatedItems || [];
    if (isChecked) {
      items.forEach(item => this.selectedOwnerRequestIds.add(item.id));
    } else {
      items.forEach(item => this.selectedOwnerRequestIds.delete(item.id));
    }
    this.renderRoomOwnerRequests();
  }

  batchApproveOwnerSelected() {
    if (!this.selectedOwnerRequestIds || this.selectedOwnerRequestIds.size === 0) return;
    if (typeof bookingStore === 'undefined') return;

    let count = 0;
    this.selectedOwnerRequestIds.forEach(id => {
      const r = bookingStore.getRequestById(id);
      if (r) {
        if (typeof bookingStore.approveByRoomOwner === 'function') {
          bookingStore.approveByRoomOwner(id, { ownerNotes: "Batch authorized by Room Owner." });
        }
        r.indicator = 'transparent';
        r.hasConflict = false;
        if (r.needsIT || r.needsCatering) {
          r.status = 'Approved - Setup In Progress';
          r.statusDisplay = 'Setting Up';
        } else {
          r.status = 'Approved - Confirmed';
          r.statusDisplay = 'Approved';
        }
        count++;
      }
    });

    this.selectedOwnerRequestIds.clear();
    if (typeof bookingStore.saveState === 'function') {
      bookingStore.saveState();
    }
    this.showToast("Batch Approved", `${count} private room reservation(s) authorized.`, "success");
    this.renderRoomOwnerRequests();
  }

  batchRejectOwnerSelected() {
    if (!this.selectedOwnerRequestIds || this.selectedOwnerRequestIds.size === 0) return;
    this.openOwnerRejectModal('batch');
  }

  quickOwnerApprove(requestId) {
    if (typeof bookingStore === 'undefined') return;
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    if (typeof bookingStore.approveByRoomOwner === 'function') {
      bookingStore.approveByRoomOwner(requestId, {
        ownerNotes: "Authorized by Room Owner with requested standard session hours."
      });
    }
    req.indicator = "transparent";
    req.hasConflict = false;
    if (req.needsIT || req.needsCatering) {
      req.status = "Approved - Setup In Progress";
      req.statusDisplay = "Setting Up";
    } else {
      req.status = "Approved - Confirmed";
      req.statusDisplay = "Approved";
    }

    if (typeof bookingStore.saveState === 'function') {
      bookingStore.saveState();
    }

    this.showToast("Request Approved", `Reservation ${requestId} authorized.`, "success");
    this.renderRoomOwnerRequests();
  }

  quickOwnerReject(requestId) {
    this.openOwnerRejectModal(requestId);
  }

  openOwnerRejectModal(target) {
    this._pendingRejectTarget = target;
    const modal = document.getElementById('owner-reject-modal');
    const title = document.getElementById('owner-reject-modal-title');
    const desc = document.getElementById('owner-reject-modal-desc');
    const input = document.getElementById('owner-reject-reason-input');

    if (!modal) return;
    if (target === 'batch') {
      const count = this.selectedOwnerRequestIds.size;
      if (title) title.innerText = `Decline ${count} Reservation(s)`;
      if (desc) desc.innerText = `Please enter the reason for declining the ${count} selected private room reservations:`;
    } else {
      if (title) title.innerText = `Decline Reservation ${target}`;
      if (desc) desc.innerText = `Please enter the reason for declining private room reservation #${target}:`;
    }

    if (input) {
      input.value = "Room unavailable due to scheduled VIP maintenance.";
    }
    modal.classList.remove('hidden');
  }

  closeOwnerRejectModal() {
    const modal = document.getElementById('owner-reject-modal');
    if (modal) modal.classList.add('hidden');
    this._pendingRejectTarget = null;
  }

  confirmOwnerModalRejection() {
    const input = document.getElementById('owner-reject-reason-input');
    const reason = (input?.value || '').trim() || "Room unavailable due to scheduled executive session.";

    if (this._pendingRejectTarget === 'batch') {
      let count = 0;
      this.selectedOwnerRequestIds.forEach(id => {
        const r = bookingStore.getRequestById(id);
        if (r) {
          if (typeof bookingStore.rejectByRoomOwner === 'function') {
            bookingStore.rejectByRoomOwner(id, reason);
          }
          r.status = 'Rejected';
          r.statusDisplay = 'Rejected';
          r.indicator = 'transparent';
          r.hasConflict = false;
          count++;
        }
      });
      this.selectedOwnerRequestIds.clear();
      this.showToast("Batch Rejected", `${count} reservation(s) rejected.`, "info");
    } else if (this._pendingRejectTarget) {
      const reqId = this._pendingRejectTarget;
      const req = bookingStore.getRequestById(reqId);
      if (req) {
        if (typeof bookingStore.rejectByRoomOwner === 'function') {
          bookingStore.rejectByRoomOwner(reqId, reason);
        }
        req.status = 'Rejected';
        req.statusDisplay = 'Rejected';
        req.indicator = 'transparent';
        req.hasConflict = false;
        this.showToast("Request Rejected", `Reservation ${reqId} declined.`, "info");
      }
    }

    if (typeof bookingStore.saveState === 'function') {
      bookingStore.saveState();
    }

    this.closeOwnerRejectModal();
    this.renderRoomOwnerRequests();
  }

  formatScheduleDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      return `${m} ${d.getDate()}, ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  }

  getInitials(name) {
    if (!name) return 'JV';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  _ensureReferenceSeedData(force = false) {
    if (typeof bookingStore === 'undefined') return;

    if (!force) {
      const hasRef = bookingStore.requests && bookingStore.requests.some(r => r.id === 'REQ-2026-008' && r.privateJustification);
      if (hasRef && bookingStore.requests.length >= 8) return;
    }

    // 8 sample requests strictly mirroring reference screenshot with complete review data
    const refRequests = [
      {
        id: 'REQ-2026-008',
        referenceCode: 'NBC-2026-008',
        meetingTitle: 'Board Meeting',
        meetingPurpose: 'Board Meeting',
        category: 'Executive',
        submittedText: 'Submitted 10 mins ago',
        indicator: 'amber',
        date: '2026-09-11',
        startTime: '11:00',
        endTime: '13:00',
        attendees: 10,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'Confidential Board of Directors quarterly monetary policy briefing requiring secure executive boardroom.',
        managerReview: {
          decision: 'Approved',
          notes: 'Public conference rooms are occupied. Executive private room endorsed by Manager Pitika.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-101',
          name: 'Executive Room A',
          floor: 'Level 5',
          isPrivate: true,
          capacity: 12,
          image: 'assets/rooms/boardroom-alpha.jpg',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: true,
        itDetails: {
          requestedItems: ['Video Call Setup', 'Encrypted Line', 'Display Screen'],
          scheduledPrepTime: '30 mins before meeting',
          technicianNotes: 'Direct link to Board Office secure hub.'
        },
        needsCatering: true,
        cateringDetails: {
          packageName: 'Executive Tea & Pastries',
          servings: 10,
          deliveryTime: '10:45',
          dietaryRemarks: 'Khmer herbal teas & fresh fruit'
        },
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '10 mins ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '5 mins ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'IT Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-007',
        referenceCode: 'NBC-2026-007',
        meetingTitle: 'Strategy Discussion',
        meetingPurpose: 'Strategy Discussion',
        category: 'Strategy',
        submittedText: 'Submitted 1 hour ago',
        indicator: 'red',
        date: '2026-09-11',
        startTime: '13:00',
        endTime: '14:30',
        attendees: 14,
        isPrivateRequest: true,
        status: 'Time Conflict',
        statusDisplay: 'Time Conflict',
        hasConflict: true,
        privateJustification: 'Strategic foreign exchange reserves allocation review with international financial advisors.',
        managerReview: {
          decision: 'Approved',
          notes: 'Endorsed by Pitika pending schedule resolution by Room Owner.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-107',
          name: 'Board Room',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 16,
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: true,
        itDetails: {
          requestedItems: ['Dual Screen Presentation', 'Audio Recording System'],
          scheduledPrepTime: '20 mins before meeting'
        },
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '1 hour ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '30 mins ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Time Conflict' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-006',
        referenceCode: 'NBC-2026-006',
        meetingTitle: 'Leadership Meeting',
        meetingPurpose: 'Leadership Meeting',
        category: 'Internal',
        submittedText: 'Submitted 2 hours ago',
        indicator: 'sky',
        date: '2026-09-10',
        startTime: '13:00',
        endTime: '14:00',
        attendees: 8,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'Inter-departmental leadership alignment on Bakong next-generation settlement protocols.',
        managerReview: {
          decision: 'Approved',
          notes: 'High priority internal leadership session. Approved for today.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-108',
          name: 'Executive Room B',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 10,
          image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: false,
        needsCatering: true,
        cateringDetails: {
          packageName: 'Coffee & Refreshments',
          servings: 8,
          deliveryTime: '12:45',
          dietaryRemarks: 'Standard executive service'
        },
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '2 hours ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '1 hour ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-005',
        referenceCode: 'NBC-2026-005',
        meetingTitle: 'Project Review',
        meetingPurpose: 'Project Review',
        category: 'Project',
        submittedText: 'Submitted 3 hours ago',
        indicator: 'transparent',
        date: '2026-09-12',
        startTime: '11:30',
        endTime: '12:30',
        attendees: 6,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'Core banking migration phase 3 status presentation for executive steering committee.',
        managerReview: {
          decision: 'Approved',
          notes: 'Approved. Private facilities authorized.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-102',
          name: 'Meeting Room 1',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 8,
          image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: true,
        itDetails: {
          requestedItems: ['Video Screen', 'Laptop Connector Cables'],
          scheduledPrepTime: '15 mins before meeting'
        },
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '3 hours ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '2 hours ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-004',
        referenceCode: 'NBC-2026-004',
        meetingTitle: 'Budget Discussion',
        meetingPurpose: 'Budget Discussion',
        category: 'Finance',
        submittedText: 'Submitted 4 hours ago',
        indicator: 'transparent',
        date: '2026-09-12',
        startTime: '08:00',
        endTime: '10:00',
        attendees: 12,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'National Bank fiscal year 2027 departmental budget allocation deliberation.',
        managerReview: {
          decision: 'Approved',
          notes: 'Fiscal budget deliberation requires secure private setting. Endorsed.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-101',
          name: 'Executive Room A',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 12,
          image: 'assets/rooms/boardroom-alpha.jpg',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: false,
        needsCatering: true,
        cateringDetails: {
          packageName: 'Morning Breakfast & Coffee',
          servings: 12,
          deliveryTime: '07:45',
          dietaryRemarks: 'Fruit plates and hot tea'
        },
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '4 hours ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '3 hours ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-003',
        referenceCode: 'NBC-2026-003',
        meetingTitle: 'Team Briefing',
        meetingPurpose: 'Team Briefing',
        category: 'Internal',
        submittedText: 'Submitted 5 hours ago',
        indicator: 'transparent',
        date: '2026-09-11',
        startTime: '11:00',
        endTime: '12:30',
        attendees: 8,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'Executive team synchronization and confidential quarterly audit findings preview.',
        managerReview: {
          decision: 'Approved',
          notes: 'Approved by Pitika.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-107',
          name: 'Board Room',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 16,
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: true,
        itDetails: {
          requestedItems: ['Microphone Bar', 'Screen Share Setup'],
          scheduledPrepTime: '15 mins before meeting'
        },
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '5 hours ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '4 hours ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-002',
        referenceCode: 'NBC-2026-002',
        meetingTitle: 'Client Meeting',
        meetingPurpose: 'Client Meeting',
        category: 'External',
        submittedText: 'Submitted 6 hours ago',
        indicator: 'transparent',
        date: '2026-09-11',
        startTime: '09:30',
        endTime: '11:00',
        attendees: 5,
        isPrivateRequest: true,
        status: 'Pending Room Owner Approval',
        statusDisplay: 'Pending Review',
        privateJustification: 'High-level bilateral financial dialogue with visiting correspondent banking executives.',
        managerReview: {
          decision: 'Approved',
          notes: 'Approved. Private facilities justified for bilateral dialogue.',
          reviewDate: 'Sep 10, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-108',
          name: 'Executive Room B',
          floor: 'Level 18',
          isPrivate: true,
          capacity: 10,
          image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: false,
        needsCatering: true,
        cateringDetails: {
          packageName: 'Warm Tea & Refreshments',
          servings: 5,
          deliveryTime: '09:15',
          dietaryRemarks: 'Vegetarian snacks included'
        },
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '6 hours ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '5 hours ago' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Waiting' },
          { step: 4, title: 'Setup', completed: false, time: 'Pending' },
          { step: 5, title: 'Ready', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-001',
        referenceCode: 'NBC-2026-001',
        meetingTitle: 'Quarterly Review',
        meetingPurpose: 'Quarterly Review',
        category: 'Executive',
        submittedText: 'Submitted 1 day ago',
        indicator: 'transparent',
        date: '2026-09-10',
        startTime: '09:00',
        endTime: '10:30',
        attendees: 15,
        isPrivateRequest: true,
        status: 'Approved - Confirmed',
        statusDisplay: 'Approved',
        privateJustification: 'Executive quarterly performance audit and monetary stability reporting session.',
        managerReview: {
          decision: 'Approved',
          notes: 'Full approval granted by Pitika and Room Owner.',
          reviewDate: 'Sep 9, 2026'
        },
        roomOwnerReview: {
          decision: 'Approved',
          ownerNotes: 'Authorized by Governor Cabinet.',
          reviewDate: 'Sep 9, 2026'
        },
        requester: {
          name: 'Jonathan Vance',
          department: 'Board & Executive Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          staffId: 'NBC-4102',
          phone: '+855 23 722 563'
        },
        room: {
          id: 'ROOM-101',
          name: 'Executive Room A',
          floor: 'Level 5',
          isPrivate: true,
          capacity: 12,
          image: 'assets/rooms/boardroom-alpha.jpg',
          roomOwner: {
            name: 'H.E. Chea Serey Cabinet',
            title: 'Governor Office'
          }
        },
        needsIT: true,
        itDetails: {
          requestedItems: ['Video Screen', 'Conference Audio'],
          scheduledPrepTime: '30 mins before meeting',
          isReady: true
        },
        needsCatering: true,
        cateringDetails: {
          packageName: 'Executive Refreshment Set',
          servings: 15,
          deliveryTime: '08:45',
          dietaryRemarks: 'Standard service'
        },
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '1 day ago' },
          { step: 2, title: 'Pitika Review', completed: true, time: '1 day ago' },
          { step: 3, title: 'Room Owner', completed: true, time: '1 day ago' },
          { step: 4, title: 'IT Setup', completed: true, time: '1 day ago' },
          { step: 5, title: 'Ready', completed: true, time: 'Confirmed' }
        ]
      }
    ];

    bookingStore.requests = refRequests;
    if (typeof bookingStore.saveState === 'function') {
      bookingStore.saveState();
    }
  }

  seedSampleOwnerRequests() {
    this._ensureReferenceSeedData(true);
    this.renderRoomOwnerRequests();
  }

  _getFilteredOwnerRequests() {
    if (typeof bookingStore === 'undefined') return [];

    // 1. Fetch all private room requests
    const allRequests = bookingStore.getRequests().filter(r => !!r.isPrivateRequest || !!r.room?.isPrivate);

    // 2. Apply Status Filter
    let filtered = allRequests.filter(req => {
      if (this.ownerFilter === 'pending') {
        return req.status === 'Pending Room Owner Approval' || req.status === 'Pending Review' || req.statusDisplay === 'Pending Review';
      } else if (this.ownerFilter === 'conflict') {
        return req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;
      } else if (this.ownerFilter === 'approved') {
        return req.status.includes('Approved') || req.statusDisplay === 'Approved';
      } else if (this.ownerFilter === 'rejected') {
        return req.status === 'Rejected' || req.status === 'Cancelled' || req.statusDisplay === 'Rejected';
      }
      return true;
    });

    // 3. Apply Search Query Filter
    if (this.ownerSearchTerm) {
      const q = this.ownerSearchTerm.toLowerCase();
      filtered = filtered.filter(req => {
        return (req.id && req.id.toLowerCase().includes(q)) ||
               (req.referenceCode && req.referenceCode.toLowerCase().includes(q)) ||
               (req.meetingTitle && req.meetingTitle.toLowerCase().includes(q)) ||
               (req.room?.name && req.room.name.toLowerCase().includes(q)) ||
               (req.requester?.name && req.requester.name.toLowerCase().includes(q)) ||
               (req.requester?.department && req.requester.department.toLowerCase().includes(q)) ||
               (req.meetingPurpose && req.meetingPurpose.toLowerCase().includes(q)) ||
               (req.category && req.category.toLowerCase().includes(q)) ||
               (req.privateJustification && req.privateJustification.toLowerCase().includes(q));
      });
    }

    // 4. Apply Date Filter
    if (this.ownerDateFilter && this.ownerDateFilter !== 'all') {
      const selectedDate = this.ownerDateFilter.trim();
      filtered = filtered.filter(req => req.date === selectedDate);
    }

    // 5. Apply Room Filter
    if (this.ownerRoomFilter && this.ownerRoomFilter !== 'all') {
      filtered = filtered.filter(req => req.room?.id === this.ownerRoomFilter);
    }

    // 6. Apply Department Filter
    if (this.ownerDeptFilter && this.ownerDeptFilter !== 'all') {
      filtered = filtered.filter(req => req.requester?.department === this.ownerDeptFilter);
    }

    // 7. Column Sorting
    const sortCol = this.ownerSortColumn || 'id';
    const sortDir = this.ownerSortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortCol === 'id') {
        return a.id.localeCompare(b.id, undefined, { numeric: true }) * sortDir;
      } else if (sortCol === 'requester') {
        const nameA = a.requester?.name || '';
        const nameB = b.requester?.name || '';
        return nameA.localeCompare(nameB) * sortDir;
      } else if (sortCol === 'room') {
        const rA = a.room?.name || '';
        const rB = b.room?.name || '';
        return rA.localeCompare(rB) * sortDir;
      } else if (sortCol === 'schedule') {
        const dtA = `${a.date || ''} ${a.startTime || ''}`;
        const dtB = `${b.date || ''} ${b.startTime || ''}`;
        return dtA.localeCompare(dtB) * sortDir;
      } else if (sortCol === 'status') {
        const sA = a.statusDisplay || a.status || '';
        const sB = b.statusDisplay || b.status || '';
        return sA.localeCompare(sB) * sortDir;
      }
      return 0;
    });

    return filtered;
  }

  renderRoomOwnerRequests() {
    const container = document.getElementById('view-owner-requests-list');
    if (!container || typeof bookingStore === 'undefined') return;

    // 1. Calculate Date & KPI References
    const allRequests = bookingStore.getRequests().filter(r => !!r.isPrivateRequest || !!r.room?.isPrivate);
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    const pendingOwnerRequests = allRequests.filter(r => r.status === 'Pending Room Owner Approval' || r.statusDisplay === 'Pending Review' || r.status === 'Pending Review');
    const todayRequests = allRequests.filter(r => r.date === todayStr || r.date === '2026-09-10' || r.indicator === 'sky');
    const approvedRequests = allRequests.filter(r => r.status.includes('Approved') || r.statusDisplay === 'Approved');
    const privateRooms = bookingStore.getPrivateRooms ? bookingStore.getPrivateRooms() : [];

    const kpiPending = document.getElementById('owner-kpi-pending');
    const kpiToday = document.getElementById('owner-kpi-today');
    const kpiApproved = document.getElementById('owner-kpi-approved');
    const kpiRooms = document.getElementById('owner-kpi-rooms');

    if (kpiPending) kpiPending.innerText = pendingOwnerRequests.length;
    if (kpiToday) kpiToday.innerText = todayRequests.length;
    if (kpiApproved) kpiApproved.innerText = approvedRequests.length;
    if (kpiRooms) kpiRooms.innerText = privateRooms.length || 3;

    // 2. Get Filtered & Sorted Requests
    const filtered = this._getFilteredOwnerRequests();

    // 3. Empty State Handling
    if (filtered.length === 0) {
      this._disconnectCardsObserver();
      this._currentPaginatedItems = [];
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-2xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl text-stone-400" data-icon="lucide:shield-alert" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">No Private Room Requests Found</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">There are no private room approval requests matching your current filters.</p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button onclick="app.resetOwnerFilters()" class="btn-secondary px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center space-x-1.5">
              <span class="iconify text-xs text-[#78716C]" data-icon="lucide:rotate-ccw" data-stroke-width="1.8"></span>
              <span>Reset Filters</span>
            </button>
            <button onclick="app.seedSampleOwnerRequests()" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-white" data-icon="lucide:sparkles" data-stroke-width="1.8"></span>
              <span class="text-white">Load Reference Data</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 4. Card View (Unified with My-Bookings & IT-Queue, Infinite Scroll)
    if (this.ownerViewMode === 'cards') {
      const totalItems = filtered.length;
      const currentlyDisplayedCount = Math.min(totalItems, this.ownerLoadedBatches * this.ownerBatchSize);
      const displayedItems = filtered.slice(0, currentlyDisplayedCount);
      this._currentPaginatedItems = displayedItems;
      const hasMore = currentlyDisplayedCount < totalItems;
      const remaining = Math.max(0, totalItems - currentlyDisplayedCount);

      const cardsHtml = displayedItems.map(req => this._renderSingleOwnerCard(req, false)).join('');

      let finalHtml = `
        <div class="flex flex-col flex-1 min-h-0">
          <div id="owner-cards-scroll-container" class="flex-1 overflow-y-auto hide-scrollbar pt-1 pb-6 pr-1 relative">
            <!-- Card Grid: Single-column on tablets & standard laptops, 2-col on ultra-wide screens (>=1400px) -->
            <div id="owner-cards-grid" class="owner-queue-cards-grid">
              ${cardsHtml}
            </div>

            <!-- Skeleton Loading Slot for Zero-Shift Infinite Scroll -->
            <div id="owner-cards-skeleton-slot" class="owner-queue-cards-grid mt-3.5 ${this.ownerIsLoadingMore && hasMore ? '' : 'hidden'}">
              ${this.ownerIsLoadingMore && hasMore ? this._renderCardSkeleton(Math.min(2, remaining)) : ''}
            </div>

            <!-- Sentinel trigger element for IntersectionObserver -->
            <div id="owner-cards-infinite-sentinel" class="w-full h-2 pointer-events-none mt-2"></div>

            <!-- Footer Status / Fallback Controls -->
            <div id="owner-cards-footer-controls" class="w-full">
              ${this._renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining)}
            </div>
          </div>
        </div>
      `;

      container.innerHTML = finalHtml;
      this._setupCardsInfiniteScrollObserver();
      return;
    }

    // 5. Table View (Option 4 Refined Minimal Ledger)
    this._disconnectCardsObserver();
    this._renderOption4Table(container, filtered);
  }

  _renderSingleOwnerCard(req, isNew = false) {
    const isOwnerPending = req.status === 'Pending Room Owner Approval' || req.statusDisplay === 'Pending Review' || req.status === 'Pending Review';
    const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;

    let statusLabel = 'Waiting Owner';
    let statusIcon = 'lucide:clock';
    let statusBadgeClass = 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';

    if (isConflict) {
      statusLabel = 'Time Conflict';
      statusIcon = 'lucide:alert-circle';
      statusBadgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
    } else if (isConfirmed) {
      statusLabel = 'Approved';
      statusIcon = 'lucide:check-circle-2';
      statusBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (isSetup) {
      statusLabel = 'Setting Up';
      statusIcon = 'lucide:settings';
      statusBadgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
    } else if (isRejected) {
      statusLabel = 'Rejected';
      statusIcon = 'lucide:x-circle';
      statusBadgeClass = 'bg-stone-50 text-stone-700 border border-stone-200';
    } else if (isCancelled) {
      statusLabel = 'Cancelled';
      statusIcon = 'lucide:slash';
      statusBadgeClass = 'bg-stone-50 text-stone-700 border border-stone-200';
    }

    const roomObj = (typeof bookingStore !== 'undefined' && bookingStore.getRoomById) ? (bookingStore.getRoomById(req.room?.id) || req.room || {}) : (req.room || {});
    const roomImgUrl = roomObj.image || req.room?.image || 'assets/rooms/boardroom-alpha.jpg';
    const roomShortName = (roomObj.name || req.room?.name || 'Private Room').split(' - ')[0];
    const floorShort = (roomObj.floor || req.room?.floor || 'Level 18').split('(')[0].trim();
    const refCode = req.referenceCode || req.id || 'NBC-PR-8821';
    const requesterName = req.requester?.name || 'Jonathan Vance';
    const avatarUrl = req.requester?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(requesterName) + '&background=f3e8ff&color=7e22ce';

    return `
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-4.5 shadow-xs transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-sm flex flex-col justify-between ${isNew ? 'animate-card-fade-in' : ''}">
        <!-- Row 1: ID + Reference Code + Status Pill -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2 min-w-0">
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline cursor-pointer" title="Open Review Workspace">
              ${req.id}
            </button>
            <span class="text-stone-300 font-light">•</span>
            <button type="button" onclick="app.copyOwnerReferenceCode('${refCode}')" title="Click to copy reference code" class="font-mono text-xs font-normal text-stone-500 hover:text-stone-800 flex items-center space-x-1 cursor-pointer">
              <span>${refCode}</span>
              <span class="iconify text-xs text-stone-400 hover:text-stone-600" data-icon="lucide:copy" data-stroke-width="2"></span>
            </button>
          </div>
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass} shrink-0">
            <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
            <span>${statusLabel}</span>
          </div>
        </div>

        <!-- Row 2: Room Thumbnail + Meeting Specs + Services Tag -->
        <div class="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-3.5">
          <div class="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <img src="${roomImgUrl}" class="rounded-xl object-cover border border-[#E9E3DD] shrink-0 w-[116px] sm:w-[124px] h-[74px] sm:h-[78px] shadow-2xs" alt="Room" />
            <div class="min-w-0">
              <h4 class="font-heading font-semibold text-sm text-stone-900 leading-snug truncate" title="${req.meetingTitle || ''}">${req.meetingTitle || 'Private Board Meeting'}</h4>
              <div class="flex items-center space-x-1.5 text-xs text-stone-500 mt-1 font-normal">
                <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                <span>${floorShort} • ${roomShortName}</span>
              </div>
              <div class="flex items-center flex-wrap sm:flex-nowrap gap-x-2 gap-y-0.5 text-xs font-mono font-medium text-stone-600 mt-1.5">
                <span class="inline-flex items-center space-x-1 text-stone-600 shrink-0">
                  <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:calendar" data-stroke-width="2"></span>
                  <span>${req.date}</span>
                </span>
                <span class="text-stone-300 font-light hidden sm:inline">•</span>
                <span class="inline-flex items-center space-x-1 font-semibold text-stone-800 shrink-0">
                  <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:clock" data-stroke-width="2"></span>
                  <span>${req.startTime} – ${req.endTime}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Services Tag (Right Side) -->
          <div class="shrink-0 flex items-center space-x-2 text-xs font-medium">
            ${req.needsCatering ? `
              <span class="flex items-center space-x-1 text-[#D97706]" title="Catering / Food">
                <span class="iconify text-sm text-[#D97706]" data-icon="lucide:utensils" data-stroke-width="2"></span>
                <span>Food</span>
              </span>
            ` : ''}
            ${req.needsIT ? `
              <span class="flex items-center space-x-1 text-[#991B1B]" title="IT Setup">
                <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:headset" data-stroke-width="2"></span>
                <span>IT</span>
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Row 3: Requester Metadata Strip (Approver View) -->
        <div class="flex items-center justify-between gap-2 py-2 px-3 mb-2 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
          <div class="flex items-center space-x-2 min-w-0">
            <img src="${avatarUrl}" class="w-5 h-5 rounded-full object-cover border border-[#E9E3DD] shrink-0" alt="Requester" />
            <span class="font-semibold text-stone-800 truncate">${requesterName}</span>
            <span class="text-stone-400 hidden sm:inline">•</span>
            <span class="text-stone-500 truncate hidden sm:inline">${req.requester?.department || 'Executive Office'}</span>
          </div>
          <div class="flex items-center space-x-1.5 shrink-0">
            <span class="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span class="iconify text-xs text-emerald-600" data-icon="lucide:shield-check" data-stroke-width="2"></span>
              <span>Pitika Endorsed</span>
            </span>
            ${isConflict ? `
              <span class="inline-flex items-center space-x-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <span class="iconify text-xs text-rose-600" data-icon="lucide:alert-triangle" data-stroke-width="2"></span>
                <span>Conflict</span>
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Stepper: Visual Approval Progress (5 Steps) -->
        ${this._renderOwnerBookingStepper(req)}

        <!-- Row 5: Action Buttons (Consistently h-[36px] rounded-xl) -->
        <div class="mt-3.5 flex items-center gap-2 sm:gap-2.5">
          ${isOwnerPending ? `
            <button type="button" onclick="app.quickOwnerApprove('${req.id}')" title="Approve reservation" class="btn-primary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-2xs transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
              <span class="text-white">Approve</span>
            </button>
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" title="Open Review Workspace" class="flex-1 btn-secondary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
              <span>Review</span>
            </button>
            <button type="button" onclick="app.quickOwnerReject('${req.id}')" title="Decline reservation" class="w-9 h-9 shrink-0 rounded-xl bg-white hover:bg-rose-50 text-[#991B1B] border border-rose-200 transition flex items-center justify-center cursor-pointer active:scale-[0.98]">
              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          ` : (isConflict ? `
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" title="Resolve Schedule Conflict" class="min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98] shadow-2xs">
              <span class="iconify text-xs text-amber-700" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
              <span>Resolve Conflict</span>
            </button>
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" title="Open Review Workspace" class="flex-1 btn-secondary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
              <span>Review</span>
            </button>
            <button type="button" onclick="app.quickOwnerReject('${req.id}')" title="Decline reservation" class="w-9 h-9 shrink-0 rounded-xl bg-white hover:bg-rose-50 text-[#991B1B] border border-rose-200 transition flex items-center justify-center cursor-pointer active:scale-[0.98]">
              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          ` : `
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" class="w-full btn-secondary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-stone-600" data-icon="lucide:eye" data-stroke-width="2"></span>
              <span>View Workspace & Decision</span>
            </button>
          `)}
        </div>
      </div>
    `;
  }

  _renderOwnerBookingStepper(req) {
    const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;
    const isOwnerPending = req.status === 'Pending Room Owner Approval' || (!isConfirmed && !isRejected && !isCancelled && !isSetup && !isConflict);

    let progressPercent = '50%';
    if (isConfirmed) progressPercent = '100%';
    else if (isSetup) progressPercent = '75%';
    else if (isOwnerPending || isConflict || isRejected) progressPercent = '50%';

    return `
      <div class="relative w-full my-3.5 pt-0.5 pb-1">
        <!-- Connecting Line Background & Progress -->
        <div class="absolute top-[10px] left-[8%] right-[8%] sm:left-[10%] sm:right-[10%] h-[2px] bg-[#E7DFD7] rounded-full z-0 pointer-events-none">
          <div class="h-full bg-[#991B1B] rounded-full transition-all duration-300" style="width: ${progressPercent};"></div>
        </div>

        <!-- Stepper Nodes Track: 5 Steps -->
        <div class="relative z-10 flex items-start justify-between w-full">
          <!-- Step 1: 1. Submitted -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            <div class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-2xs">
              <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
            </div>
            <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Submitted</span>
          </div>

          <!-- Step 2: 2. Pitika (Approved) -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            <div class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-2xs">
              <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
            </div>
            <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Pitika</span>
          </div>

          <!-- Step 3: 3. Room Owner -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isConfirmed || isSetup ? `
              <div class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">3. Room Owner</span>
            ` : (isRejected || isCancelled ? `
              <div class="w-5 h-5 rounded-full bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-rose-600" data-icon="lucide:x" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">3. Room Owner</span>
              <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">${isCancelled ? 'Cancelled' : 'Rejected'}</span>
            ` : (isConflict ? `
              <div class="w-5 h-5 rounded-full bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-amber-600" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-amber-700 mt-2 whitespace-nowrap">3. Room Owner</span>
              <span class="text-[10px] sm:text-xs font-normal text-amber-600 mt-0.5 whitespace-nowrap">Conflict</span>
            ` : `
              <div class="w-5 h-5 rounded-full bg-[#991B1B] border-2 border-white ring-[5px] ring-rose-200/60 flex items-center justify-center shadow-xs"></div>
              <span class="text-[11px] sm:text-xs font-semibold text-[#991B1B] mt-2 whitespace-nowrap">3. Room Owner</span>
              <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Reviewing</span>
            `))}
          </div>

          <!-- Step 4: 4. IT Setup -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isConfirmed ? `
              <div class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. IT Setup</span>
            ` : (isSetup ? `
              <div class="w-5 h-5 rounded-full bg-[#991B1B] ring-[5px] ring-rose-100 flex items-center justify-center shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-[#991B1B] mt-2 whitespace-nowrap">4. IT Setup</span>
              <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Setting Up</span>
            ` : `
              <div class="w-5 h-5 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                <span>4</span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. IT Setup</span>
            `)}
          </div>

          <!-- Step 5: 5. Door Pass -->
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            ${isConfirmed ? `
              <div class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">5. Door Pass</span>
              <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Active</span>
            ` : `
              <div class="w-5 h-5 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                <span>5</span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">5. Door Pass</span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  _renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining) {
    if (this.ownerIsLoadingMore) {
      return `
        <div class="py-5 flex items-center justify-center space-x-2 text-xs font-semibold text-stone-500 animate-pulse">
          <span class="iconify animate-spin text-sm text-[#991B1B]" data-icon="lucide:loader-2" data-stroke-width="2"></span>
          <span>Loading more private room requests...</span>
        </div>
      `;
    }

    if (hasMore) {
      return `
        <div class="py-5 flex flex-col items-center justify-center space-y-2">
          <button type="button" onclick="app.loadNextOwnerCardsBatch()" class="h-9 px-5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-[#E9E3DD] text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center space-x-2 cursor-pointer active:scale-[0.98]">
            <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:arrow-down-circle" data-stroke-width="2"></span>
            <span>Load More Requests</span>
            <span class="text-xs text-stone-500 font-normal">(${remaining} remaining)</span>
          </button>
          <span class="text-xs text-stone-400">Scroll down to auto-load</span>
        </div>
      `;
    }

    // End of data: subtle warm divider + Back to Top
    return `
      <div class="py-7 flex flex-col items-center justify-center space-y-2.5">
        <div class="flex items-center space-x-3 w-full max-w-md px-4">
          <div class="flex-1 h-[1px] bg-[#E9E3DD]"></div>
          <div class="flex items-center space-x-1.5 text-xs font-semibold text-[#7D6857] shrink-0">
            <span class="iconify text-sm text-emerald-600" data-icon="lucide:check-circle" data-stroke-width="2"></span>
            <span>All ${totalItems} private requests loaded</span>
          </div>
          <div class="flex-1 h-[1px] bg-[#E9E3DD]"></div>
        </div>
        <button type="button" onclick="app.scrollOwnerQueueToTop()" class="btn-secondary h-7 px-3 rounded-lg text-xs font-bold text-stone-700 flex items-center space-x-1.5 transition active:scale-[0.98] shadow-2xs hover:border-stone-300 cursor-pointer">
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
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-4.5 shadow-xs flex flex-col justify-between animate-pulse">
          <!-- Row 1: Header shimmer -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <div class="w-24 h-4 rounded-md bg-stone-200"></div>
              <div class="w-2 h-2 rounded-full bg-stone-200"></div>
              <div class="w-20 h-4 rounded-md bg-stone-100"></div>
            </div>
            <div class="w-20 h-6 rounded-full bg-stone-100 border border-stone-200"></div>
          </div>

          <!-- Row 2: Room Info shimmer -->
          <div class="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-3.5">
            <div class="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div class="w-[116px] sm:w-[124px] h-[74px] sm:h-[78px] rounded-xl bg-stone-200 shrink-0"></div>
              <div class="min-w-0 flex-1 space-y-2">
                <div class="w-3/4 h-4 rounded-md bg-stone-200"></div>
                <div class="w-1/3 h-3 rounded-md bg-stone-100"></div>
                <div class="w-1/2 h-3 rounded-md bg-stone-100"></div>
              </div>
            </div>
            <div class="w-12 h-5 rounded-md bg-stone-100"></div>
          </div>

          <!-- Row 3: Requester Strip shimmer -->
          <div class="w-full h-8 rounded-xl bg-stone-100 mb-2"></div>

          <!-- Stepper shimmer -->
          <div class="relative w-full my-3.5 pt-0.5 pb-1">
            <div class="absolute top-[10px] left-[8%] right-[8%] sm:left-[10%] sm:right-[10%] h-[2px] bg-stone-200 rounded-full"></div>
            <div class="relative z-10 flex items-center justify-between w-full">
              <div class="flex flex-col items-center space-y-2 flex-1">
                <div class="w-5 h-5 rounded-full bg-stone-200"></div>
                <div class="w-12 h-2.5 rounded bg-stone-100"></div>
              </div>
              <div class="flex flex-col items-center space-y-2 flex-1">
                <div class="w-5 h-5 rounded-full bg-stone-200"></div>
                <div class="w-12 h-2.5 rounded bg-stone-100"></div>
              </div>
              <div class="flex flex-col items-center space-y-2 flex-1">
                <div class="w-5 h-5 rounded-full bg-stone-200"></div>
                <div class="w-14 h-2.5 rounded bg-stone-100"></div>
              </div>
              <div class="flex flex-col items-center space-y-2 flex-1">
                <div class="w-5 h-5 rounded-full bg-stone-200"></div>
                <div class="w-12 h-2.5 rounded bg-stone-100"></div>
              </div>
              <div class="flex flex-col items-center space-y-2 flex-1">
                <div class="w-5 h-5 rounded-full bg-stone-200"></div>
                <div class="w-12 h-2.5 rounded bg-stone-100"></div>
              </div>
            </div>
          </div>

          <!-- Row 5: Buttons shimmer -->
          <div class="mt-3.5 flex items-center gap-2 sm:gap-2.5">
            <div class="w-24 h-[36px] rounded-xl bg-stone-200"></div>
            <div class="flex-1 h-[36px] rounded-xl bg-stone-100 border border-stone-200"></div>
            <div class="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200"></div>
          </div>
        </div>
      `;
    }
    return skeletons;
  }

  _setupCardsInfiniteScrollObserver() {
    this._disconnectCardsObserver();

    const sentinel = document.getElementById('owner-cards-infinite-sentinel');
    const scrollContainer = document.getElementById('owner-cards-scroll-container');
    if (!sentinel || !scrollContainer) return;

    if (typeof IntersectionObserver === 'undefined') return;

    this._cardsIntersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !this.ownerIsLoadingMore && this.ownerAutoScrollEnabled) {
        this.loadNextOwnerCardsBatch();
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

  loadNextOwnerCardsBatch() {
    if (this.ownerIsLoadingMore) return;

    const filtered = this._getFilteredOwnerRequests();
    const totalItems = filtered.length;
    const currentDisplayed = this.ownerLoadedBatches * this.ownerBatchSize;

    if (currentDisplayed >= totalItems) {
      return;
    }

    this.ownerIsLoadingMore = true;

    const skeletonSlot = document.getElementById('owner-cards-skeleton-slot');
    const footerControls = document.getElementById('owner-cards-footer-controls');
    const remainingAfter = totalItems - currentDisplayed;
    const nextBatchSize = Math.min(this.ownerBatchSize, remainingAfter);

    if (skeletonSlot) {
      skeletonSlot.innerHTML = this._renderCardSkeleton(Math.min(2, nextBatchSize));
      skeletonSlot.classList.remove('hidden');
    }
    if (footerControls) {
      footerControls.innerHTML = this._renderCardsFooterControls(totalItems, currentDisplayed, true, remainingAfter);
    }

    // 400ms micro-latency for smooth skeleton experience
    setTimeout(() => {
      const nextBatchItems = filtered.slice(currentDisplayed, currentDisplayed + nextBatchSize);
      this.ownerLoadedBatches++;

      const grid = document.getElementById('owner-cards-grid');
      if (grid && nextBatchItems.length > 0) {
        const newCardsHtml = nextBatchItems.map(req => {
          return this._renderSingleOwnerCard(req, true);
        }).join('');
        grid.insertAdjacentHTML('beforeend', newCardsHtml);
      }

      if (skeletonSlot) {
        skeletonSlot.innerHTML = '';
        skeletonSlot.classList.add('hidden');
      }

      const newDisplayed = this.ownerLoadedBatches * this.ownerBatchSize;
      const newHasMore = newDisplayed < totalItems;
      const newRemaining = Math.max(0, totalItems - newDisplayed);

      this.ownerIsLoadingMore = false;

      if (footerControls) {
        footerControls.innerHTML = this._renderCardsFooterControls(totalItems, Math.min(totalItems, newDisplayed), newHasMore, newRemaining);
      }

      if (newHasMore) {
        const sentinel = document.getElementById('owner-cards-infinite-sentinel');
        if (sentinel && this._cardsIntersectionObserver) {
          this._cardsIntersectionObserver.unobserve(sentinel);
          this._cardsIntersectionObserver.observe(sentinel);
        }
      } else {
        this._disconnectCardsObserver();
      }
    }, 400);
  }

  scrollOwnerQueueToTop() {
    const scrollContainer = document.getElementById('owner-cards-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  copyOwnerReferenceCode(code) {
    if (!code) return;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  }

  cleanup() {
    this._disconnectCardsObserver();
  }

  _renderOption4Table(container, filtered) {
    const pageSize = this.ownerTablePageSize || 6;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (this.ownerCurrentPage >= totalPages) this.ownerCurrentPage = totalPages - 1;
    if (this.ownerCurrentPage < 0) this.ownerCurrentPage = 0;
    const startIdx = this.ownerCurrentPage * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    this._currentPaginatedItems = paginatedItems;

    let tableRowsHtml = paginatedItems.map((req, idx) => {
      const reqId = req.id || `REQ-2026-${String(idx + 1).padStart(3, '0')}`;
      const submittedText = req.submittedText || (idx === 0 ? 'Submitted 10 mins ago' : (idx === 1 ? 'Submitted 1 hour ago' : `Submitted ${idx} hours ago`));

      const requesterName = req.requester?.name || 'Jonathan Vance';
      const initials = this.getInitials(requesterName);

      const rawRoomName = req.room?.name || 'Executive Room A';
      const roomShort = rawRoomName.split(' - ')[0];
      const roomFloor = req.room?.floor ? req.room.floor.split('(')[0].trim() : (idx === 0 ? 'Level 5' : 'Level 18');

      const formattedDate = this.formatScheduleDate(req.date || '2026-09-11');
      const timeRange = `${req.startTime || '11:00'} - ${req.endTime || '13:00'}`;

      const isApproved = req.status && (req.status.includes('Approved') || req.statusDisplay === 'Approved');
      const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
      const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;

      let statusHtml = '';
      if (isConflict) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span class="iconify text-xs text-rose-600 shrink-0" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
            <span>Time Conflict</span>
          </div>
        `;
      } else if (req.status === 'Approved - Setup In Progress' || req.statusDisplay === 'Setting Up') {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span class="iconify text-xs text-blue-600 shrink-0" data-icon="lucide:settings" data-stroke-width="2"></span>
            <span>Setting Up</span>
          </div>
        `;
      } else if (isApproved) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="iconify text-xs text-emerald-600 shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
            <span>Approved</span>
          </div>
        `;
      } else if (isRejected) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <span class="iconify text-xs text-stone-500 shrink-0" data-icon="lucide:x-circle" data-stroke-width="2"></span>
            <span>Rejected</span>
          </div>
        `;
      } else {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span class="iconify text-xs text-amber-600 shrink-0" data-icon="lucide:clock" data-stroke-width="2"></span>
            <span>Pending Review</span>
          </div>
        `;
      }

      const isPending = !isApproved && !isRejected && !isConflict;

      return `
        <tr class="hover:bg-stone-50/70 transition-colors">
          <!-- 1. REQUEST ID -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="font-bold text-xs text-stone-900 hover:text-[#991B1B] transition hover:underline cursor-pointer block leading-tight text-left">
              ${reqId}
            </button>
            <span class="text-[11px] text-stone-400 block mt-1 leading-tight">${submittedText}</span>
          </td>

          <!-- 2. REQUESTER (Clean, No Sub-detail, max-w with ellipsis) -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="flex items-center space-x-2.5 max-w-[200px]">
              <div class="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                ${initials}
              </div>
              <span class="font-semibold text-xs text-stone-900 truncate leading-tight" title="${requesterName}">${requesterName}</span>
            </div>
          </td>

          <!-- 3. PRIVATE ROOM -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="min-w-0">
              <span class="font-semibold text-xs text-stone-900 block truncate leading-tight">${roomShort}</span>
              <span class="text-[11px] text-stone-400 block truncate mt-0.5 leading-tight">${roomFloor}</span>
            </div>
          </td>

          <!-- 4. SCHEDULE -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="min-w-0">
              <span class="font-semibold text-xs text-stone-900 block truncate leading-tight">${formattedDate}</span>
              <span class="text-[11px] text-stone-500 font-mono block mt-0.5 leading-tight">${timeRange}</span>
            </div>
          </td>

          <!-- 5. SERVICES -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="flex items-center space-x-2 text-xs">
              ${req.needsCatering ? `<span class="text-amber-600 flex items-center space-x-1" title="Catering / Food"><span class="iconify text-xs" data-icon="lucide:utensils" data-stroke-width="1.8"></span><span>Food</span></span>` : ''}
              ${req.needsIT ? `<span class="text-[#991B1B] flex items-center space-x-1" title="IT Setup"><span class="iconify text-xs" data-icon="lucide:headset" data-stroke-width="1.8"></span><span>IT</span></span>` : ''}
              ${!req.needsCatering && !req.needsIT ? `<span class="text-stone-400 text-[11px]">None</span>` : ''}
            </div>
          </td>

          <!-- 6. STATUS -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            ${statusHtml}
          </td>

          <!-- 7. ACTIONS -->
          <td class="px-4 py-3.5 whitespace-nowrap text-right pr-6">
            <div class="flex items-center justify-end space-x-1.5">
              ${isPending ? `
                <button type="button" onclick="app.quickOwnerApprove('${reqId}')" title="Approve reservation" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  <span class="text-white">Approve</span>
                </button>
                <button type="button" onclick="app.quickOwnerReject('${reqId}')" title="Decline reservation" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-stone-600" data-icon="lucide:x" data-stroke-width="2"></span>
                  <span>Decline</span>
                </button>
                <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-sm text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
                </button>
              ` : (isConflict ? `
                <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Resolve Conflict" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-amber-700" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
                  <span>Resolve</span>
                </button>
                <button type="button" onclick="app.quickOwnerReject('${reqId}')" title="Decline reservation" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-stone-600" data-icon="lucide:x" data-stroke-width="2"></span>
                  <span>Decline</span>
                </button>
                <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-sm text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
                </button>
              ` : `
                <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="h-7 px-2.5 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-stone-500" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              `)}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    let tableHtml = `
      <div class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
        <div class="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
          <table class="w-full text-left border-collapse relative">
            <thead class="bg-[#FAF7F5] border-b border-[#E9E3DD] sticky top-0 z-10 shadow-xs">
              <tr>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortOwnerBy('id')">
                  <div class="flex items-center space-x-1">
                    <span>REQUEST</span>
                    ${this._getSortIcon('id')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortOwnerBy('requester')">
                  <div class="flex items-center space-x-1">
                    <span>REQUESTER</span>
                    ${this._getSortIcon('requester')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortOwnerBy('room')">
                  <div class="flex items-center space-x-1">
                    <span>PRIVATE ROOM</span>
                    ${this._getSortIcon('room')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortOwnerBy('schedule')">
                  <div class="flex items-center space-x-1">
                    <span>SCHEDULE</span>
                    ${this._getSortIcon('schedule')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <span>SERVICES</span>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortOwnerBy('status')">
                  <div class="flex items-center space-x-1">
                    <span>STATUS</span>
                    ${this._getSortIcon('status')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 text-right pr-6">
                  <span>ACTIONS</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Table Pagination Footer -->
        <div class="shrink-0 bg-white border-t border-[#E9E3DD] px-4 py-3 flex items-center justify-between">
          <span class="text-xs text-stone-500 font-medium">
            Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${Math.min(endIdx, totalItems)}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests
          </span>
          <div class="flex items-center space-x-1.5">
            <button type="button" onclick="app.goToOwnerPage(${this.ownerCurrentPage - 1})" ${this.ownerCurrentPage === 0 ? 'disabled' : ''} class="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E9E3DD] flex items-center space-x-1 ${this.ownerCurrentPage === 0 ? 'text-stone-300 border-stone-200 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-50 cursor-pointer'}">
              <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
              <span>Prev</span>
            </button>
            ${this._renderTablePageButtons(totalPages)}
            <button type="button" onclick="app.goToOwnerPage(${this.ownerCurrentPage + 1})" ${this.ownerCurrentPage >= totalPages - 1 ? 'disabled' : ''} class="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E9E3DD] flex items-center space-x-1 ${this.ownerCurrentPage >= totalPages - 1 ? 'text-stone-300 border-stone-200 cursor-not-allowed' : 'text-stone-800 hover:bg-stone-50 cursor-pointer'}">
              <span>Next</span>
              <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = tableHtml;
  }

  _renderTablePageButtons(totalPages) {
    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === this.ownerCurrentPage;
      pageButtons += `
        <button type="button" onclick="app.goToOwnerPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold ${isActive ? 'bg-[#991B1B] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'} flex items-center justify-center transition">
          ${i + 1}
        </button>
      `;
    }
    return pageButtons;
  }
}

window.NBC.views['room-owner-queue'] = new RoomOwnerQueueView();
