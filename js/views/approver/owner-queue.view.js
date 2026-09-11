// Room Owner Queue View Component (view-room-owner-queue)
// Cafe Design System with NBC Crimson Heritage
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomOwnerQueueView {
  constructor() {
    this.id = 'room-owner-queue';
    this.ownerFilter = 'all'; // 'all', 'pending', 'conflict', 'approved', 'rejected'
    this.ownerViewMode = 'table'; // 'table' or 'cards'
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
    this._currentPaginatedItems = [];
    this._pendingRejectTarget = null; // null, 'batch', or requestId

    this.template = `<style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      </style>
      <!-- Executive Queue Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E9E3DD]">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">Private Room Approvals</h2>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center space-x-1 shrink-0 bg-stone-100 p-0.5 rounded-lg border border-[#E9E3DD]">
          <button id="owner-view-table-btn" onclick="app.setOwnerViewMode('table')" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-white" data-icon="lucide:table" data-stroke-width="2"></span>
            <span>Table</span>
          </button>
          <button id="owner-view-cards-btn" onclick="app.setOwnerViewMode('cards')" class="px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:layout-grid" data-stroke-width="2"></span>
            <span>Cards</span>
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
      <div id="view-room-owner-queue-content" class="w-full h-[calc(100dvh-104px)] flex flex-col space-y-2.5 min-h-0">
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
    this._updateViewModeButtons();
    this.renderRoomOwnerRequests();
  }

  _updateViewModeButtons() {
    const tableBtn = document.getElementById('owner-view-table-btn');
    const cardsBtn = document.getElementById('owner-view-cards-btn');

    if (tableBtn && cardsBtn) {
      const isTable = this.ownerViewMode === 'table';
      tableBtn.className = isTable
        ? 'px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer'
        : 'px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer';
      cardsBtn.className = !isTable
        ? 'px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer'
        : 'px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer';

      const tIcon = tableBtn.querySelector('.iconify');
      const cIcon = cardsBtn.querySelector('.iconify');
      if (tIcon) tIcon.setAttribute('class', `iconify text-xs ${isTable ? 'text-white' : 'text-stone-500'}`);
      if (cIcon) cIcon.setAttribute('class', `iconify text-xs ${!isTable ? 'text-white' : 'text-stone-500'}`);
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
    this.renderRoomOwnerRequests();
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
    this.renderRoomOwnerRequests();
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
    this.renderRoomOwnerRequests();
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
    const listEl = document.getElementById('view-owner-requests-list');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        r.status = 'Approved - Confirmed';
        r.statusDisplay = 'Approved';
        r.indicator = 'transparent';
        r.hasConflict = false;
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
    req.status = "Approved - Confirmed";
    req.statusDisplay = "Approved";
    req.indicator = "transparent";
    req.hasConflict = false;

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

  renderRoomOwnerRequests() {
    const container = document.getElementById('view-owner-requests-list');
    if (!container || typeof bookingStore === 'undefined') return;

    // 1. Fetch all private room requests
    const allRequests = bookingStore.getRequests().filter(r => !!r.isPrivateRequest || !!r.room?.isPrivate);

    // 2. Calculate Date References
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    // 3. Update High-Level KPI Summary Cards
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

    // 4. Apply Status Filter
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

    // 5. Apply Search Query Filter
    if (this.ownerSearchTerm) {
      const q = this.ownerSearchTerm;
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

    // 6. Apply Date Filter
    if (this.ownerDateFilter && this.ownerDateFilter !== 'all') {
      const selectedDate = this.ownerDateFilter.trim();
      filtered = filtered.filter(req => req.date === selectedDate);
    }

    // 7. Apply Room Filter
    if (this.ownerRoomFilter && this.ownerRoomFilter !== 'all') {
      filtered = filtered.filter(req => req.room?.id === this.ownerRoomFilter);
    }

    // 8. Apply Department Filter
    if (this.ownerDeptFilter && this.ownerDeptFilter !== 'all') {
      filtered = filtered.filter(req => req.requester?.department === this.ownerDeptFilter);
    }

    // 9. Empty State Handling
    if (filtered.length === 0) {
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
              <span>Load Reference Data</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 10. Column Sorting
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

    // 11. Pagination Calculations (6 rows per page for Table, 4 cards per page for Cards)
    const pageSize = this.ownerViewMode === 'table' ? (this.ownerTablePageSize || 6) : (this.ownerCardsPageSize || 4);
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (this.ownerCurrentPage >= totalPages) this.ownerCurrentPage = totalPages - 1;
    if (this.ownerCurrentPage < 0) this.ownerCurrentPage = 0;
    const startIdx = this.ownerCurrentPage * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    this._currentPaginatedItems = paginatedItems;

    // =========================================================================
    // RENDER MODE A: REDESIGNED TABLE (Clean, Spacious, No Sub-Detail under Name, No Purpose)
    // =========================================================================
    if (this.ownerViewMode === 'table') {
      const allVisibleSelected = paginatedItems.length > 0 && paginatedItems.every(r => this.selectedOwnerRequestIds.has(r.id));
      const selectedCount = this.selectedOwnerRequestIds.size;

      let tableRowsHtml = paginatedItems.map((req, idx) => {
        const isSelected = this.selectedOwnerRequestIds.has(req.id);
        const reqId = req.id || `REQ-2026-${String(idx + 1).padStart(3, '0')}`;
        const submittedText = req.submittedText || (idx === 0 ? 'Submitted 10 mins ago' : (idx === 1 ? 'Submitted 1 hour ago' : `Submitted ${idx} hours ago`));

        // Row indicator strip on left border
        let indicatorBorder = 'border-l-4 border-transparent';
        let checkboxBorder = 'border-stone-300';
        if (req.indicator === 'amber') {
          indicatorBorder = 'border-l-4 border-amber-500';
          checkboxBorder = 'border-amber-500';
        } else if (req.indicator === 'red' || req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict') {
          indicatorBorder = 'border-l-4 border-red-500';
          checkboxBorder = 'border-red-500';
        } else if (req.indicator === 'sky') {
          indicatorBorder = 'border-l-4 border-sky-400';
          checkboxBorder = 'border-stone-300';
        }

        // Requester details: Clean name only, NO department or subtitle underneath
        const requesterName = req.requester?.name || 'Jonathan Vance';
        const initials = this.getInitials(requesterName);

        // Room details
        const rawRoomName = req.room?.name || 'Executive Room A';
        const roomShort = rawRoomName.split(' - ')[0];
        const roomFloor = req.room?.floor ? req.room.floor.split('(')[0].trim() : (idx === 0 ? 'Level 5' : 'Level 18');

        // Schedule details
        const formattedDate = this.formatScheduleDate(req.date || '2026-09-11');
        const timeRange = `${req.startTime || '11:00'} - ${req.endTime || '13:00'}`;

        // Status pill badge
        let statusHtml = '';
        const isApproved = req.status && (req.status.includes('Approved') || req.statusDisplay === 'Approved');
        const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
        const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict';

        if (isConflict) {
          statusHtml = `
            <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <span class="iconify text-xs text-red-600 shrink-0" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
              <span>Time Conflict</span>
            </div>
          `;
        } else if (isApproved) {
          statusHtml = `
            <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="iconify text-xs text-emerald-600 shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
              <span>Approved</span>
            </div>
          `;
        } else if (isRejected) {
          statusHtml = `
            <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
              <span class="iconify text-xs text-stone-500 shrink-0" data-icon="lucide:x-circle" data-stroke-width="2"></span>
              <span>Rejected</span>
            </div>
          `;
        } else {
          statusHtml = `
            <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span class="iconify text-xs text-amber-600 shrink-0" data-icon="lucide:clock" data-stroke-width="2"></span>
              <span>Pending Review</span>
            </div>
          `;
        }

        return `
          <tr class="hover:bg-stone-50/70 transition-colors ${isSelected ? 'bg-amber-50/20' : ''}">
            <!-- 1. Checkbox + Left Border Indicator -->
            <td class="w-10 py-3.5 pl-4 pr-2 ${indicatorBorder}">
              <input type="checkbox" onchange="app.toggleOwnerRequestSelect('${reqId}', this.checked)" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded ${checkboxBorder} text-[#991B1B] focus:ring-[#991B1B] cursor-pointer" />
            </td>

            <!-- 2. REQUEST -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="font-bold text-xs text-stone-900 hover:text-[#991B1B] transition hover:underline cursor-pointer block leading-tight text-left">
                ${reqId}
              </button>
              <span class="text-[11px] text-stone-400 block mt-1 leading-tight">${submittedText}</span>
            </td>

            <!-- 3. REQUESTER (Name only, clean & bold without department sub-detail) -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                  ${initials}
                </div>
                <span class="font-bold text-xs text-stone-900 truncate leading-tight">${requesterName}</span>
              </div>
            </td>

            <!-- 4. PRIVATE ROOM -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span class="iconify text-base text-blue-600" data-icon="lucide:door-closed" data-stroke-width="2"></span>
                </div>
                <div class="min-w-0">
                  <span class="font-bold text-xs text-stone-900 block truncate leading-tight">${roomShort}</span>
                  <span class="text-[11px] text-stone-400 block truncate mt-1 leading-tight">${roomFloor}</span>
                </div>
              </div>
            </td>

            <!-- 5. SCHEDULE -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                  <span class="iconify text-base text-[#991B1B]" data-icon="lucide:calendar" data-stroke-width="2"></span>
                </div>
                <div class="min-w-0">
                  <span class="font-bold text-xs text-stone-900 block truncate leading-tight">${formattedDate}</span>
                  <span class="text-[11px] text-stone-500 font-mono block mt-1 leading-tight">${timeRange}</span>
                </div>
              </div>
            </td>

            <!-- 6. STATUS -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              ${statusHtml}
            </td>

            <!-- 7. ACTIONS -->
            <td class="px-4 py-3.5 whitespace-nowrap text-right pr-6">
              <div class="flex items-center justify-end space-x-2">
                ${isApproved ? `
                  <span class="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span class="iconify text-xs text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                    <span>Approved</span>
                  </span>
                ` : (isRejected ? `
                  <span class="inline-flex items-center space-x-1 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                    <span class="iconify text-xs text-stone-500" data-icon="lucide:x-circle" data-stroke-width="2"></span>
                    <span>Rejected</span>
                  </span>
                ` : `
                  <button type="button" onclick="app.quickOwnerApprove('${reqId}')" title="Approve reservation" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center space-x-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                    <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    <span>Approve</span>
                  </button>
                  <button type="button" onclick="app.quickOwnerReject('${reqId}')" title="Reject reservation" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                    <span class="iconify text-xs text-stone-600" data-icon="lucide:x" data-stroke-width="2"></span>
                    <span>Reject</span>
                  </button>
                `)}
                <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${reqId}')" title="Open Review Workspace" class="w-8 h-8 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-base text-stone-600" data-icon="lucide:more-horizontal" data-stroke-width="2"></span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      let tableHtml = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
          <div class="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
            <table class="w-full text-left border-collapse relative">
              <thead class="bg-[#FAF7F5] border-b border-[#E9E3DD] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th class="w-10 py-3.5 pl-4 pr-2">
                    <input type="checkbox" id="owner-table-select-all" onchange="app.toggleSelectAllOwnerRequests(this.checked)" ${allVisibleSelected ? 'checked' : ''} class="w-4 h-4 rounded border-stone-300 text-[#991B1B] focus:ring-[#991B1B] cursor-pointer" />
                  </th>
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

          <!-- Table Bottom Action & Pagination Bar (Exact Reference Match) -->
          <div class="shrink-0 bg-white relative z-20">
            ${this._renderTableActionFooter(totalPages, totalItems, startIdx, Math.min(endIdx, totalItems), paginatedItems)}
          </div>
        </div>
      `;

      container.innerHTML = tableHtml;
      return;
    }

    // =========================================================================
    // RENDER MODE B: CARD VIEW (Compact Executive 4-Slot Grid - No Scroll)
    // =========================================================================
    let cardsHtml = paginatedItems.map(req => {
      const isOwnerPending = req.status === 'Pending Room Owner Approval' || req.statusDisplay === 'Pending Review' || req.status === 'Pending Review';
      const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
      const isSetup = req.status === 'Approved - Setup In Progress';
      const isRejected = req.status === 'Rejected';
      const isCancelled = req.status === 'Cancelled';
      const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;

      let isPassed = false;
      if (req.date) {
        const endTimeStr = req.endTime || '23:59';
        const meetingEnd = new Date(`${req.date}T${endTimeStr}:00`);
        if (!isNaN(meetingEnd.getTime())) {
          isPassed = meetingEnd < now;
        }
      }

      let statusLabel = 'Waiting Owner';
      let statusIcon = 'lucide:clock';
      let statusColor = 'text-amber-600';

      if (isConflict) {
        statusLabel = 'Time Conflict';
        statusIcon = 'lucide:alert-circle';
        statusColor = 'text-red-600';
      } else if (isConfirmed) {
        statusLabel = 'Approved & Ready';
        statusIcon = 'lucide:check-circle-2';
        statusColor = 'text-emerald-600';
      } else if (isSetup) {
        statusLabel = 'Setting Up';
        statusIcon = 'lucide:settings';
        statusColor = 'text-blue-600';
      } else if (isRejected) {
        statusLabel = 'Rejected';
        statusIcon = 'lucide:x-circle';
        statusColor = 'text-red-600';
      } else if (isCancelled) {
        statusLabel = 'Cancelled';
        statusIcon = 'lucide:slash';
        statusColor = 'text-stone-500';
      }

      const avatarUrl = req.requester?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(req.requester?.name || 'Jonathan Vance') + '&background=f3e8ff&color=7e22ce';
      const roomImgUrl = req.room?.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
      const roomShortName = (req.room?.name || 'Private Room').split(' - ')[0];
      const floorShort = (req.room?.floor || 'Level 18').split('(')[0].trim();

      return `
        <div class="bg-white rounded-xl border border-[#E9E3DD] p-3.5 sm:p-4 transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-2xs flex flex-col justify-between ${isPassed ? 'opacity-60 hover:opacity-100' : ''}">
          <!-- Row 1: Meeting ID + Requester + Clean Status -->
          <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
            <div class="flex items-center space-x-2 min-w-0">
              <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline shrink-0 cursor-pointer" title="Open in Review Workspace">
                ${req.id}
              </button>
              <span class="text-stone-300 shrink-0">•</span>
              <div class="flex items-center space-x-2 min-w-0 truncate">
                <img src="${avatarUrl}" class="w-6 h-6 rounded-full object-cover border border-[#E9E3DD] shrink-0" style="width: 24px; height: 24px; min-width: 24px;" alt="Avatar" />
                <span class="text-xs text-stone-800 font-semibold truncate">${req.requester?.name || 'Jonathan Vance'}</span>
              </div>
            </div>
            <div class="shrink-0 flex items-center space-x-1 text-xs font-bold ${statusColor}">
              <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
              <span class="whitespace-nowrap text-[11px]">${statusLabel}</span>
            </div>
          </div>

          <!-- Row 2: Room Thumbnail + Schedule + Services -->
          <div class="flex items-center gap-3 py-3">
            <img src="${roomImgUrl}" class="rounded-lg object-cover border border-[#E9E3DD] shrink-0" style="width: 88px; height: 68px; min-width: 88px; max-width: 88px;" alt="Room" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-heading font-bold text-xs sm:text-sm text-stone-900 truncate leading-tight" title="${req.room?.name || ''}">${roomShortName}</h4>
                <div class="flex items-center space-x-1.5 shrink-0 text-[10px] font-bold">
                  ${req.needsCatering ? `<span class="text-amber-600 flex items-center space-x-0.5" title="Food / Catering"><span class="iconify text-[11px]" data-icon="lucide:utensils" data-stroke-width="1.8"></span><span>Food</span></span>` : ''}
                  ${req.needsIT ? `<span class="text-red-600 flex items-center space-x-0.5" title="IT Technician Setup"><span class="iconify text-[11px]" data-icon="lucide:headset" data-stroke-width="1.8"></span><span>IT</span></span>` : ''}
                </div>
              </div>
              <div class="text-[11px] text-stone-500 truncate mt-0.5">${floorShort}</div>
              <div class="flex items-center space-x-1.5 text-xs font-mono font-medium text-stone-700 pt-1">
                <span class="inline-flex items-center space-x-1">
                  <span class="iconify text-xs text-[#D97706]" data-icon="lucide:calendar" data-stroke-width="2"></span>
                  <span>${req.date}</span>
                </span>
                <span class="text-stone-300">•</span>
                <span class="inline-flex items-center space-x-1 font-semibold text-stone-900">
                  <span class="iconify text-xs text-[#D97706]" data-icon="lucide:clock" data-stroke-width="2"></span>
                  <span>${req.startTime}–${req.endTime}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Row 3: Action Buttons -->
          <div class="pt-2.5 border-t border-stone-100 flex items-center gap-2">
            ${isOwnerPending && !isPassed ? `
              <button type="button" onclick="app.quickOwnerApprove('${req.id}')" class="flex-1 min-h-[34px] h-[34px] px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-[0.98]">
                <span class="iconify text-xs text-emerald-700" data-icon="lucide:check" data-stroke-width="2"></span>
                <span>Approve</span>
              </button>
              <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" class="flex-1 btn-primary min-h-[34px] h-[34px] px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-[0.98]">
                <span class="iconify text-xs text-white" data-icon="lucide:shield-check" data-stroke-width="2"></span>
                <span class="text-white">Review</span>
              </button>
            ` : `
              <button type="button" onclick="app.openRoomOwnerReviewWorkspace('${req.id}')" class="w-full ${isPassed ? 'btn-secondary text-stone-600' : 'btn-primary text-white'} min-h-[34px] h-[34px] px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-[0.98]">
                <span class="iconify ${isPassed ? 'text-stone-500' : 'text-white'} text-xs" data-icon="lucide:eye" data-stroke-width="2"></span>
                <span>${isPassed ? 'View Details' : 'View Decision'}</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Wrap 4 cards in a 2x2 grid (no vertical scroll)
    let finalHtml = `
      <div class="flex flex-col flex-1 min-h-0">
        <div class="flex-1 overflow-y-auto hide-scrollbar pb-4 pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${cardsHtml}
          </div>
        </div>
    `;

    // Pagination Controls for Card View
    if (totalItems > 0) {
      finalHtml += `
        <div class="shrink-0 mt-auto pt-2 relative z-20">
          ${this._renderPaginationControls(totalPages, totalItems, startIdx, endIdx)}
        </div>
      `;
    }

    finalHtml += `</div>`;
    container.innerHTML = finalHtml;
  }

  _renderTableActionFooter(totalPages, totalItems, startIdx, showingEnd, paginatedItems) {
    const currentPage = this.ownerCurrentPage;
    const selectedCount = this.selectedOwnerRequestIds.size;
    const allVisibleSelected = paginatedItems.length > 0 && paginatedItems.every(r => this.selectedOwnerRequestIds.has(r.id));

    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pageButtons += `
        <button type="button" onclick="app.goToOwnerPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold ${isActive ? 'bg-[#991B1B] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'} flex items-center justify-center transition">
          ${i + 1}
        </button>
      `;
    }

    return `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E9E3DD]">
        <!-- Left: Batch Selection Actions -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="owner-batch-select-all" onchange="app.toggleSelectAllOwnerRequests(this.checked)" ${allVisibleSelected ? 'checked' : ''} class="w-4 h-4 rounded border-stone-300 text-[#991B1B] focus:ring-[#991B1B] cursor-pointer" />
            <span class="text-xs font-semibold text-stone-700">${selectedCount} selected</span>
          </div>
          <button type="button" onclick="app.batchApproveOwnerSelected()" ${selectedCount === 0 ? 'disabled' : ''} class="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${selectedCount > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs active:scale-[0.98]' : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'}">
            <span class="iconify text-xs ${selectedCount > 0 ? 'text-white' : 'text-stone-400'}" data-icon="lucide:check" data-stroke-width="2.2"></span>
            <span>Approve Selected</span>
          </button>
          <button type="button" onclick="app.batchRejectOwnerSelected()" ${selectedCount === 0 ? 'disabled' : ''} class="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${selectedCount > 0 ? 'bg-stone-700 hover:bg-stone-800 text-white cursor-pointer shadow-2xs active:scale-[0.98]' : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'}">
            <span class="iconify text-xs ${selectedCount > 0 ? 'text-white' : 'text-stone-400'}" data-icon="lucide:x" data-stroke-width="2.2"></span>
            <span>Reject Selected</span>
          </button>
        </div>

        <!-- Right: Counter & Pagination -->
     <div class="sticky bottom-0 flex items-center justify-center space-x-4 bg-white p-4">
          <span class="text-xs text-stone-500 font-medium">
            Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${showingEnd}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests
          </span>
          <div class="flex items-center space-x-1.5">
            <button type="button" onclick="app.goToOwnerPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} class="px-2 py-1 text-xs font-medium flex items-center space-x-1 ${currentPage === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:text-stone-900 cursor-pointer'}">
              <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
              <span>Prev</span>
            </button>
            ${pageButtons}
            <button type="button" onclick="app.goToOwnerPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} class="px-2 py-1 text-xs font-semibold flex items-center space-x-1 ${currentPage >= totalPages - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-800 hover:text-black cursor-pointer'}">
              <span>Next</span>
              <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPaginationControls(totalPages, totalItems, startIdx, endIdx) {
    const currentPage = this.ownerCurrentPage;
    const showingEnd = Math.min(endIdx, totalItems);

    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pageButtons += `<button type="button" onclick="app.goToOwnerPage(${i})" class="min-w-[28px] h-7 px-2 rounded-md text-xs font-bold transition-all duration-150 flex items-center justify-center ${isActive ? 'btn-primary shadow-2xs text-white' : 'btn-secondary text-stone-700 shadow-2xs cursor-pointer active:scale-[0.98]'}">${i + 1}</button>`;
    }

    return `
      <div class="flex items-center justify-between pt-2 mt-0.5">
        <span class="text-[11px] text-stone-500 font-medium">Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${showingEnd}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> private requests</span>
        <div class="flex items-center space-x-1.5">
          <button type="button" onclick="app.goToOwnerPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} aria-label="Previous page" class="btn-secondary h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-150 shadow-2xs flex items-center space-x-1 ${currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}">
            <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
            <span>Prev</span>
          </button>
          ${pageButtons}
          <button type="button" onclick="app.goToOwnerPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} aria-label="Next page" class="btn-secondary h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-150 shadow-2xs flex items-center space-x-1 ${currentPage >= totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}">
            <span>Next</span>
            <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
          </button>
        </div>
      </div>
    `;
  }
}

window.NBC.views['room-owner-queue'] = new RoomOwnerQueueView();
