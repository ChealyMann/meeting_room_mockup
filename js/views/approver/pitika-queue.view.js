// Pitika Approver Queue View Component (view-pitika-queue)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class PitikaQueueView {
  constructor() {
    this.id = 'pitika-queue';
    this.approverFilter = 'all';
    this.approverViewMode = 'table';
    this.approverExpandedRows = new Set();
    this.approverDateFilter = '';
    this.approverRoomTypeFilter = 'all';
    this.approverDeptFilter = 'all';
    this.approverSearchTerm = '';
    this.approverCurrentPage = 0;
    this.approverTablePageSize = 6;
    this.approverCardsPageSize = 4;
    this.approverPageSize = 6;
    this.template = `<style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      </style>
      <!-- Executive Queue Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E9E3DD] shrink-0">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">Manager Review Requests</h2>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center space-x-1 shrink-0 bg-stone-100 p-0.5 rounded-lg border border-[#E9E3DD]">
          <button id="approver-view-table-btn" onclick="app.setApproverViewMode('table')" aria-label="Switch to table view" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-white" data-icon="lucide:table" data-stroke-width="2"></span>
            <span>Table</span>
          </button>
          <button id="approver-view-cards-btn" onclick="app.setApproverViewMode('cards')" aria-label="Switch to card view" class="px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:layout-grid" data-stroke-width="2"></span>
            <span>Cards</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Overview Strip (Interactive Filter Shortcuts) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-[#E9E3DD] shrink-0">
        <!-- Metric 1: Pending Review -->
        <div onclick="app.filterApproverRequests('pending')" title="Filter by Pending Review" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-amber-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-amber-600" data-icon="lucide:clock" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Action Required</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="approver-kpi-pending" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">Pending</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Today's Requests -->
        <div onclick="app.setApproverQuickDate('today')" title="Filter to Today's Requests" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-sky-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-sky-600" data-icon="lucide:calendar" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Today's Requests</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="approver-kpi-today" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">Scheduled</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Approved -->
        <div onclick="app.filterApproverRequests('approved')" title="Filter by Approved" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-emerald-400 hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Approved</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="approver-kpi-approved" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500">This week</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: All Rooms In Facility -->
        <div onclick="app.resetApproverFilters()" title="Reset all filters" class="bg-white px-4 py-3.5 rounded-xl border border-[#E9E3DD] hover:border-[#991B1B] hover:shadow-xs transition flex items-center space-x-3.5 shadow-2xs cursor-pointer select-none">
          <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <span class="iconify text-lg text-[#991B1B]" data-icon="lucide:door-closed" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Total Rooms</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="approver-kpi-rooms" class="text-xl sm:text-2xl font-bold font-mono text-stone-900 leading-none">8</span>
              <span class="text-xs text-stone-500">In Facility</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Filter Bar (Organized 12-Column Responsive Grid) -->
      <div class="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 w-full items-center shrink-0">
        <!-- Search (Col span 3) -->
        <div class="col-span-2 sm:col-span-6 lg:col-span-3 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:search" data-stroke-width="2"></span>
          <input type="text" id="approver-search-input" oninput="app.handleApproverFilterChange()" placeholder="Search by meeting ID, requester..." class="bank-input pl-8 pr-7 py-1.5 text-xs w-full bg-white transition border border-[#E9E3DD] rounded-lg shadow-2xs focus:border-[#991B1B]" />
          <button id="approver-search-clear" onclick="app.clearApproverSearch()" title="Clear search" class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#991B1B] p-0.5 rounded transition cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>
        </div>

        <!-- Room Type Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:building-2" data-stroke-width="2"></span>
          <select id="approver-room-type-filter" onchange="app.handleApproverFilterChange()" aria-label="Filter by room type" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Room Types</option>
            <option value="public">Public Rooms</option>
            <option value="private">Private Rooms</option>
          </select>
        </div>

        <!-- Department Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:users" data-stroke-width="2"></span>
          <select id="approver-dept-filter" onchange="app.handleApproverFilterChange()" aria-label="Filter by department" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
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

        <!-- Date Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:calendar" data-stroke-width="2"></span>
          <input type="date" id="approver-date-filter" oninput="app.handleApproverFilterChange()" onchange="app.handleApproverFilterChange()" class="bank-input pl-8 pr-3 py-1.5 text-xs w-full bg-white transition cursor-pointer font-medium border border-[#E9E3DD] rounded-lg shadow-2xs text-stone-700" />
        </div>

        <!-- Status Filter (Col span 2) -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-2 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:filter" data-stroke-width="2"></span>
          <select id="approver-status-filter" onchange="app.handleApproverFilterChange()" aria-label="Filter by status" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Status</option>
            <option value="pending">Waiting Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Reset Button (Col span 1) -->
        <div class="col-span-2 sm:col-span-2 lg:col-span-1 w-full">
          <button id="approver-reset-btn" onclick="app.resetApproverFilters()" title="Reset all filters" class="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 h-[31px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer border border-[#E9E3DD] shadow-2xs">
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Requests Content (Table or Cards rendered dynamically) -->
      <div id="view-approver-requests-list" class="flex flex-col flex-1 min-h-0 mt-2.5">
        <!-- Populated dynamically by app.renderApproverRequests() -->
      </div>`;
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
      <div id="view-pitika-queue-content" class="w-full h-[calc(100dvh-112px)] flex flex-col space-y-2.5 min-h-0">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this._bindAppHandlers();

    const searchInput = document.getElementById('approver-search-input');
    const clearBtn = document.getElementById('approver-search-clear');
    if (searchInput && this.approverSearchTerm) {
      searchInput.value = this.approverSearchTerm;
      if (clearBtn) clearBtn.classList.remove('hidden');
    }

    const dateInput = document.getElementById('approver-date-filter');
    if (dateInput && this.approverDateFilter) {
      dateInput.value = this.approverDateFilter;
    }

    const typeSelect = document.getElementById('approver-room-type-filter');
    if (typeSelect && this.approverRoomTypeFilter) {
      typeSelect.value = this.approverRoomTypeFilter;
    }

    const deptSelect = document.getElementById('approver-dept-filter');
    if (deptSelect && this.approverDeptFilter) {
      deptSelect.value = this.approverDeptFilter;
    }

    const statusSelect = document.getElementById('approver-status-filter');
    if (statusSelect && this.approverFilter) {
      statusSelect.value = this.approverFilter;
    }

    this._updateViewModeButtons();
    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  _bindAppHandlers() {
    if (!window.app) return;
    window.app.setApproverViewMode = (mode) => this.setApproverViewMode(mode);
    window.app.handleApproverFilterChange = () => this.handleApproverFilterChange();
    window.app.clearApproverSearch = () => this.clearApproverSearch();
    window.app.clearApproverDateFilter = () => this.clearApproverDateFilter();
    window.app.setApproverQuickDate = (type) => this.setApproverQuickDate(type);
    window.app.resetApproverFilters = () => this.resetApproverFilters();
    window.app.filterApproverRequests = (status) => this.filterApproverRequests(status);
    window.app.goToApproverPage = (page) => this.goToApproverPage(page);
    window.app.toggleApproverRowExpand = (id) => this.toggleApproverRowExpand(id);
  }

  update() {
    this.renderApproverRequests();
  }

  setApproverViewMode(mode) {
    this.approverViewMode = mode;
    this.approverCurrentPage = 0;
    this._updateViewModeButtons();
    this.renderApproverRequests();
  }

  _updateViewModeButtons() {
    const tableBtn = document.getElementById('approver-view-table-btn');
    const cardsBtn = document.getElementById('approver-view-cards-btn');
    if (tableBtn && cardsBtn) {
      const isTable = this.approverViewMode === 'table';
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

  toggleApproverRowExpand(requestId) {
    if (this.approverExpandedRows.has(requestId)) {
      this.approverExpandedRows.delete(requestId);
    } else {
      this.approverExpandedRows.add(requestId);
    }
    this.renderApproverRequests();
  }

  handleApproverFilterChange() {
    const searchInput = document.getElementById('approver-search-input');
    const clearBtn = document.getElementById('approver-search-clear');
    const dateInput = document.getElementById('approver-date-filter');
    const typeSelect = document.getElementById('approver-room-type-filter');
    const deptSelect = document.getElementById('approver-dept-filter');
    const statusSelect = document.getElementById('approver-status-filter');

    this.approverSearchTerm = (searchInput?.value || '').trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !this.approverSearchTerm);
    }
    this.approverDateFilter = dateInput?.value || '';
    this.approverRoomTypeFilter = typeSelect?.value || 'all';
    this.approverDeptFilter = deptSelect?.value || 'all';
    this.approverFilter = statusSelect?.value || 'all';

    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  clearApproverSearch() {
    const searchInput = document.getElementById('approver-search-input');
    if (searchInput) searchInput.value = '';
    this.handleApproverFilterChange();
    searchInput?.focus();
  }

  clearApproverDateFilter() {
    const dateInput = document.getElementById('approver-date-filter');
    if (dateInput) dateInput.value = '';
    this.handleApproverFilterChange();
    dateInput?.focus();
  }

  setApproverQuickDate(type) {
    if (type === 'today') {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      this.approverDateFilter = `${y}-${m}-${d}`;
      const dateInput = document.getElementById('approver-date-filter');
      if (dateInput) dateInput.value = this.approverDateFilter;
    }
    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  resetApproverFilters() {
    this.approverFilter = 'all';
    this.approverRoomTypeFilter = 'all';
    this.approverDeptFilter = 'all';
    this.approverSearchTerm = '';
    this.approverDateFilter = '';

    const searchInput = document.getElementById('approver-search-input');
    if (searchInput) searchInput.value = '';
    const dateInput = document.getElementById('approver-date-filter');
    if (dateInput) dateInput.value = '';
    const typeSelect = document.getElementById('approver-room-type-filter');
    if (typeSelect) typeSelect.value = 'all';
    const deptSelect = document.getElementById('approver-dept-filter');
    if (deptSelect) deptSelect.value = 'all';
    const statusSelect = document.getElementById('approver-status-filter');
    if (statusSelect) statusSelect.value = 'all';
    const clearBtn = document.getElementById('approver-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  filterApproverRequests(status) {
    this.approverFilter = status;
    const statusSelect = document.getElementById('approver-status-filter');
    if (statusSelect) {
      statusSelect.value = status;
    }
    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  goToApproverPage(page) {
    if (page < 0) return;
    this.approverCurrentPage = page;
    this.renderApproverRequests();
    const scrollableEl = document.querySelector('#view-approver-requests-list .overflow-y-auto');
    if (scrollableEl) {
      scrollableEl.scrollTop = 0;
    }
  }

  renderApproverRequests() {
    const container = document.getElementById('view-approver-requests-list');
    if (!container) return;

    const allRequests = bookingStore.getRequests();

    // 1. Calculate Date References
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 2. Status counts for KPI overview
    const totalRooms = bookingStore.getRooms ? bookingStore.getRooms().length : (bookingStore.rooms ? bookingStore.rooms.length : 8);
    const overallPending = allRequests.filter(r => r.status === 'Pending Review' || r.status === 'Pending Manager Review' || r.statusDisplay === 'Pending Review').length;
    const todayScheduled = allRequests.filter(r => r.date === todayStr).length;
    const weekApproved = allRequests.filter(r => r.status.includes('Approved') || r.status === 'Pending Room Owner Approval').length;

    const kpiPendingEl = document.getElementById('approver-kpi-pending');
    const kpiTodayEl = document.getElementById('approver-kpi-today');
    const kpiApprovedEl = document.getElementById('approver-kpi-approved');
    const kpiRoomsEl = document.getElementById('approver-kpi-rooms');

    if (kpiPendingEl) kpiPendingEl.innerText = overallPending;
    if (kpiTodayEl) kpiTodayEl.innerText = todayScheduled;
    if (kpiApprovedEl) kpiApprovedEl.innerText = weekApproved;
    if (kpiRoomsEl) kpiRoomsEl.innerText = totalRooms;

    // 3. Filter by Status
    let filtered = allRequests.filter(req => {
      if (this.approverFilter === 'pending') {
        return req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
      } else if (this.approverFilter === 'approved') {
        return req.status.includes('Approved') || req.status === 'Pending Room Owner Approval';
      } else if (this.approverFilter === 'rejected') {
        return req.status === 'Rejected' || req.status === 'Cancelled';
      }
      return true;
    });

    // 4. Filter by Search Query
    if (this.approverSearchTerm) {
      const q = this.approverSearchTerm;
      filtered = filtered.filter(req => {
        return (req.id && req.id.toLowerCase().includes(q)) ||
               (req.referenceCode && req.referenceCode.toLowerCase().includes(q)) ||
               (req.meetingTitle && req.meetingTitle.toLowerCase().includes(q)) ||
               (req.room?.name && req.room.name.toLowerCase().includes(q)) ||
               (req.requester?.name && req.requester.name.toLowerCase().includes(q)) ||
               (req.requester?.department && req.requester.department.toLowerCase().includes(q)) ||
               (req.meetingPurpose && req.meetingPurpose.toLowerCase().includes(q)) ||
               (req.privateJustification && req.privateJustification.toLowerCase().includes(q));
      });
    }

    // 5. Filter by Date Picker (Date-only YYYY-MM-DD)
    if (this.approverDateFilter && this.approverDateFilter !== 'all') {
      const selectedDate = this.approverDateFilter.trim();
      filtered = filtered.filter(req => req.date === selectedDate);
    }

    // 6. Filter by Room Type
    if (this.approverRoomTypeFilter === 'public') {
      filtered = filtered.filter(req => !req.isPrivateRequest && !req.room?.isPrivate);
    } else if (this.approverRoomTypeFilter === 'private') {
      filtered = filtered.filter(req => req.isPrivateRequest || req.room?.isPrivate);
    }

    // 7. Filter by Department
    if (this.approverDeptFilter && this.approverDeptFilter !== 'all') {
      filtered = filtered.filter(req => req.requester?.department === this.approverDeptFilter);
    }

    // Pagination
    const pageSize = this.approverViewMode === 'cards' ? (this.approverCardsPageSize || 4) : (this.approverTablePageSize || 6);
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (this.approverCurrentPage >= totalPages) this.approverCurrentPage = totalPages - 1;
    if (this.approverCurrentPage < 0) this.approverCurrentPage = 0;
    const startIdx = this.approverCurrentPage * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);

    // Empty State
    if (filtered.length === 0) {
      const isDateFiltered = !!this.approverDateFilter && this.approverDateFilter !== 'all';
      const otherDatesPending = isDateFiltered
        ? allRequests.filter(r => (r.status === 'Pending Review' || r.status === 'Pending Manager Review') && r.date !== this.approverDateFilter).length
        : 0;
      const totalOtherRequests = isDateFiltered
        ? allRequests.filter(r => r.date !== this.approverDateFilter).length
        : 0;

      let emptyTitle = "No Review Requests Match";
      let emptySubtitle = "Try clearing your search term, changing the date filter, or selecting a different status tab.";
      let emptyActions = `
        <button onclick="app.resetApproverFilters()" class="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg transition border border-stone-200 shadow-2xs cursor-pointer">
          Clear All Filters
        </button>
      `;

      if (isDateFiltered && totalOtherRequests > 0) {
        emptyTitle = "No Review Requests For Selected Date";
        emptySubtitle = otherDatesPending > 0
          ? `There are no requests for this date, but <strong>${otherDatesPending} pending request${otherDatesPending > 1 ? 's are' : ' is'} waiting on other dates</strong>.`
          : `There are no requests for this date, but ${totalOtherRequests} request${totalOtherRequests > 1 ? 's exist' : ' exists'} on other dates.`;
        emptyActions = `
          <button onclick="app.clearApproverDateFilter()" class="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center space-x-1.5 cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:calendar-range"></span>
            <span>View All Dates</span>
          </button>
          <button onclick="app.resetApproverFilters()" class="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-lg transition border border-stone-200 shadow-2xs cursor-pointer">
            Reset Filters
          </button>
        `;
      }

      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-xl border border-[#E9E3DD] shadow-xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl" data-icon="lucide:inbox" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">${emptyTitle}</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">${emptySubtitle}</p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            ${emptyActions}
          </div>
        </div>
      `;
      return;
    }

    // =========================================================================
    // =========================================================================
    // RENDER MODE A: EXECUTIVE DATA TABLE (Clean & Minimal - No Clutter)
    // =========================================================================
    if (this.approverViewMode === 'table') {
      let tableRowsHtml = paginatedItems.map(req => {
        const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review';
        const isOwnerPending = req.status === 'Pending Room Owner Approval';
        const isSetup = req.status === 'Approved - Setup In Progress';
        const isConfirmed = req.status === 'Approved - Confirmed';
        const isRejected = req.status === 'Rejected';
        const isCancelled = req.status === 'Cancelled';
        const isPrivate = req.isPrivateRequest || req.room?.isPrivate;

        // Check if the scheduled meeting date and time has passed
        let isPassed = false;
        if (req.date) {
          const now = new Date();
          const endTimeStr = req.endTime || '23:59';
          const meetingEnd = new Date(`${req.date}T${endTimeStr}:00`);
          if (!isNaN(meetingEnd.getTime())) {
            isPassed = meetingEnd < now;
          }
        }

        let statusLabel = 'Waiting Review';
        let statusBadgeClass = 'badge-pending';
        if (isConfirmed) {
          statusLabel = 'Confirmed';
          statusBadgeClass = 'badge-approved';
        } else if (isRejected) {
          statusLabel = 'Rejected';
          statusBadgeClass = 'badge-rejected';
        } else if (isCancelled) {
          statusLabel = 'Cancelled';
          statusBadgeClass = 'badge-cancelled';
        } else if (isOwnerPending) {
          statusLabel = 'Sent to Owner';
          statusBadgeClass = 'badge-owner-pending';
        } else if (isSetup) {
          statusLabel = 'Setting Up';
          statusBadgeClass = 'badge-setup';
        }

        const rowClass = isPassed
          ? 'approver-row-item opacity-60 hover:opacity-100 transition-opacity bg-stone-50/60'
          : 'approver-row-item hover:bg-stone-50/80 transition-colors';

        return `
          <!-- Main Clean Table Row -->
          <tr class="${rowClass} h-[52px]">
            
            <!-- 1. Meeting ID (Clean & Clickable to Review Workspace) -->
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                ${isPrivate ? `
                  <span class="${isPassed ? 'text-stone-400' : 'text-amber-600'} shrink-0" title="Private Executive Room">
                    <span class="iconify text-sm" data-icon="lucide:lock"></span>
                  </span>
                ` : ''}
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs ${isPassed ? 'text-stone-600' : 'text-stone-900'} hover:text-red-900 transition underline-offset-2 hover:underline inline-flex items-center cursor-pointer" title="Click to view details in Review Workspace">
                  ${req.id}
                </button>
              </div>
            </td>

            <!-- 2. Requester (Name only) -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="${isPassed ? 'text-stone-600 font-medium' : 'text-stone-800 font-semibold'} text-xs">${req.requester.name}</span>
            </td>

            <!-- 3. Room (Room name only) -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="${isPassed ? 'text-stone-600 font-medium' : 'text-stone-800 font-semibold'} text-xs">${req.room.name}</span>
            </td>

            <!-- 4. Schedule (Date & Time on 1 clean line) -->
            <td class="px-4 py-3 whitespace-nowrap">
              ${isPassed ? `
                <div class="flex items-center space-x-1.5 text-xs whitespace-nowrap text-stone-400">
                  <span class="iconify text-xs text-stone-400 shrink-0" data-icon="lucide:history"></span>
                  <span class="text-stone-500 font-normal">${req.date}</span>
                  <span class="text-stone-400 text-[11px]">(${req.startTime}–${req.endTime})</span>
                </div>
              ` : `
                <div class="flex items-center space-x-1.5 text-xs whitespace-nowrap">
                  <strong class="text-stone-900 font-semibold">${req.date}</strong>
                  <span class="text-stone-500 text-[11px]">(${req.startTime}–${req.endTime})</span>
                </div>
              `}
            </td>

            <!-- 5. Status -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${statusBadgeClass} inline-flex items-center shadow-2xs whitespace-nowrap">
                <span>${statusLabel}</span>
              </span>
            </td>

            <!-- 6. Action (Review button - click to view details and approve/reject) -->
            <td class="px-4 py-3 whitespace-nowrap text-right pr-6">
              ${isPassed ? `
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" aria-label="View request ${req.id}" class="min-h-[30px] w-[76px] py-1 rounded-md text-xs font-semibold bg-white hover:bg-stone-100 text-stone-600 border border-[#E9E3DD] shadow-2xs transition inline-flex items-center justify-center space-x-1.5 cursor-pointer">
                  <span class="iconify text-xs text-stone-400" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              ` : `
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" aria-label="View request ${req.id}" class="btn-primary min-h-[30px] w-[76px] py-1 rounded-md text-xs font-bold transition inline-flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');

      let tableHtml = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
          <div class="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
            <table class="w-full min-w-[760px] text-left border-collapse relative">
              <thead class="bg-[#FAF7F5] border-b border-[#E9E3DD] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 w-[140px]">MEETING ID</th>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 w-[170px]">REQUESTER</th>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 w-[190px]">ROOM</th>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 w-[210px]">SCHEDULE</th>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 w-[140px]">STATUS</th>
                  <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 text-right pr-6 w-[100px]">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100">
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Table Bottom Action & Pagination Bar (Fixed at bottom, matching Private Requests) -->
          <div class="shrink-0 bg-white relative z-20">
            ${this._renderTableActionFooter(totalPages, totalItems, startIdx, Math.min(endIdx, totalItems))}
          </div>
        </div>
      `;

      container.innerHTML = tableHtml;
      return;
    }

    // =========================================================================
    // RENDER MODE B: CARD VIEW (Exact match to Private Room Owner Review Request card)
    // =========================================================================
    let cardsHtml = paginatedItems.map(req => {
      const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
      const isOwnerPending = req.status === 'Pending Room Owner Approval';
      const isConfirmed = req.status === 'Approved - Confirmed' || req.status === 'Approved' || req.statusDisplay === 'Approved';
      const isSetup = req.status === 'Approved - Setup In Progress';
      const isRejected = req.status === 'Rejected';
      const isCancelled = req.status === 'Cancelled';
      const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;

      // Check if the scheduled meeting date and time has passed
      let isPassed = false;
      if (req.date) {
        const endTimeStr = req.endTime || '23:59';
        const meetingEnd = new Date(`${req.date}T${endTimeStr}:00`);
        if (!isNaN(meetingEnd.getTime())) {
          isPassed = meetingEnd < now;
        }
      }

      let statusLabel = 'Waiting Review';
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
      } else if (isOwnerPending) {
        statusLabel = 'Waiting Owner';
        statusIcon = 'lucide:clock';
        statusColor = 'text-amber-600';
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
      const roomShortName = (req.room?.name || 'Meeting Room').split(' - ')[0];
      const floorShort = (req.room?.floor || 'Level 18').split('(')[0].trim();

      return `
        <div class="bg-white rounded-xl border border-[#E9E3DD] p-3.5 sm:p-4 transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-2xs flex flex-col justify-between ${isPassed ? 'opacity-60 hover:opacity-100' : ''}">
          <!-- Row 1: Meeting ID + Requester + Clean Status -->
          <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
            <div class="flex items-center space-x-2 min-w-0">
              <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline shrink-0 cursor-pointer" title="Open in Review Workspace">
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
                  ${req.isPrivateRequest || req.room?.isPrivate ? `<span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Private Room">Private</span>` : ''}
                  ${req.needsCatering ? `<span class="text-amber-600 flex items-center space-x-0.5" title="Food / Catering"><span class="iconify text-[11px]" data-icon="lucide:utensils" data-stroke-width="1.8"></span><span>Food</span></span>` : ''}
                  ${req.needsIT ? `<span class="text-red-600 flex items-center space-x-0.5" title="IT Technician Setup"><span class="iconify text-[11px]" data-icon="lucide:headset" data-stroke-width="1.8"></span><span>IT</span></span>` : ''}
                  ${req.attendees ? `<span class="text-stone-500 flex items-center space-x-0.5" title="${req.attendees} Attendees"><span class="iconify text-[11px]" data-icon="lucide:users" data-stroke-width="1.8"></span><span>${req.attendees}</span></span>` : ''}
                </div>
              </div>
              <div class="text-[11px] text-stone-500 truncate mt-0.5">${floorShort}${req.meetingTitle ? ` • <span class="text-stone-700 font-medium">${req.meetingTitle}</span>` : ''}</div>
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
            <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="w-full ${isPassed ? 'btn-secondary text-stone-600' : 'btn-primary text-white'} min-h-[34px] h-[34px] px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-[0.98]">
              <span class="iconify ${isPassed ? 'text-stone-500' : 'text-white'} text-xs" data-icon="lucide:eye" data-stroke-width="2"></span>
              <span>${isPassed ? 'View Details' : 'View Decision'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wrap cards in a 2-column grid matching Private Room Owner cards
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

  _renderTableActionFooter(totalPages, totalItems, startIdx, showingEnd) {
    const currentPage = this.approverCurrentPage;

    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pageButtons += `
        <button type="button" onclick="app.goToApproverPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold ${isActive ? 'bg-[#991B1B] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'} flex items-center justify-center transition">
          ${i + 1}
        </button>
      `;
    }

    return `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-2.5 bg-white border-t border-[#E9E3DD] h-[52px] shrink-0">
        <div>
          <span class="text-xs text-stone-500 font-medium">
            Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${showingEnd}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests
          </span>
        </div>

        <div class="flex items-center space-x-1.5">
          <button type="button" onclick="app.goToApproverPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} class="px-2 py-1 text-xs font-medium flex items-center space-x-1 ${currentPage === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:text-stone-900 cursor-pointer'}">
            <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
            <span>Prev</span>
          </button>
          ${pageButtons}
          <button type="button" onclick="app.goToApproverPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} class="px-2 py-1 text-xs font-semibold flex items-center space-x-1 ${currentPage >= totalPages - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-800 hover:text-black cursor-pointer'}">
            <span>Next</span>
            <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
          </button>
        </div>
      </div>
    `;
  }

  _renderPaginationControls(totalPages, totalItems, startIdx, endIdx) {
    const currentPage = this.approverCurrentPage;
    const showingEnd = Math.min(endIdx, totalItems);

    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pageButtons += `
        <button type="button" onclick="app.goToApproverPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold ${isActive ? 'bg-[#991B1B] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'} flex items-center justify-center transition">
          ${i + 1}
        </button>
      `;
    }

    return `
      <div class="flex items-center justify-between pt-2 mt-0.5 h-[40px] shrink-0">
        <span class="text-xs text-stone-500 font-medium">Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${showingEnd}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests</span>
        <div class="flex items-center space-x-1.5">
          <button type="button" onclick="app.goToApproverPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} aria-label="Previous page" class="px-2 py-1 text-xs font-medium flex items-center space-x-1 ${currentPage === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:text-stone-900 cursor-pointer'}">
            <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
            <span>Prev</span>
          </button>
          ${pageButtons}
          <button type="button" onclick="app.goToApproverPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} aria-label="Next page" class="px-2 py-1 text-xs font-semibold flex items-center space-x-1 ${currentPage >= totalPages - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-800 hover:text-black cursor-pointer'}">
            <span>Next</span>
            <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
          </button>
        </div>
      </div>
    `;
  }

  // ==================== 5. PITIKA SINGLE-PAGE REVIEW WORKSPACE ====================

}

window.NBC.views['pitika-queue'] = new PitikaQueueView();
