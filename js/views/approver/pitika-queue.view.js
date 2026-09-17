// Pitika Approver Queue View Component (view-pitika-queue)
// Cafe Design System with NBC Crimson Heritage
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class PitikaQueueView {
  constructor() {
    this.id = 'pitika-queue';
    this.approverFilter = 'all'; // 'all', 'pending', 'approved', 'rejected'
    this.approverViewMode = 'table'; // Default table view
    this.approverSearchTerm = '';
    this.approverDateFilter = '';
    this.approverRoomTypeFilter = 'all'; // 'all', 'public', 'private'
    this.approverDeptFilter = 'all';
    this.approverSortColumn = 'id';
    this.approverSortDirection = 'desc';
    this.selectedApproverRequestIds = new Set();
    this.approverExpandedRows = new Set();
    this.approverCurrentPage = 0;
    this.approverTablePageSize = 6;
    this.approverCardsPageSize = 4;
    this.approverPageSize = 6;
    this._currentPaginatedItems = [];
    this._pendingRejectTarget = null; // null or requestId

    this.template = `<style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes pitikaCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-fade-in {
          animation: pitikaCardFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pitika-queue-cards-grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.875rem !important;
          width: 100% !important;
        }
        @media (min-width: 1400px) {
          .pitika-queue-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      </style>
      <!-- Executive Queue Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E9E3DD] shrink-0">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">Manager Review Requests</h2>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center space-x-1 shrink-0 bg-stone-100 p-0.5 rounded-lg border border-[#E9E3DD]">
          <button id="approver-view-cards-btn" onclick="app.setApproverViewMode('cards')" aria-label="Switch to card view" class="px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:layout-grid" data-stroke-width="2"></span>
            <span>Cards</span>
          </button>
          <button id="approver-view-table-btn" onclick="app.setApproverViewMode('table')" aria-label="Switch to table view" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 bg-[#991B1B] text-white shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-white" data-icon="lucide:table" data-stroke-width="2"></span>
            <span>Table</span>
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
      </div>

      <!-- Custom In-App Modal for Declining Requests -->
      <div id="approver-reject-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-scale-in" onclick="event.stopPropagation()">
          <div class="bg-[#2A0808] px-5 py-3.5 border-b border-[#450A0A] flex items-center justify-between text-white">
            <div class="flex items-center space-x-2">
              <span class="iconify text-base text-white" data-icon="lucide:ban" data-stroke-width="2"></span>
              <h3 id="approver-reject-modal-title" class="font-heading font-bold text-sm text-white">Decline Request</h3>
            </div>
            <button type="button" onclick="app.closeApproverRejectModal()" class="text-stone-400 hover:text-white p-1 rounded transition cursor-pointer">
              <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>
          <div class="p-5 space-y-3">
            <p id="approver-reject-modal-desc" class="text-xs text-stone-600 leading-relaxed">
              Please enter the reason for declining this meeting room reservation:
            </p>
            <div>
              <label class="form-label text-stone-700 font-bold text-xs mb-1 block">Reason for Rejection <span class="text-[#991B1B]">*</span></label>
              <textarea id="approver-reject-reason-input" rows="3" class="bank-input text-xs w-full p-2.5 border border-[#E9E3DD] rounded-lg focus:border-[#991B1B]" placeholder="e.g. Room unavailable due to high priority official delegation session.">Room unavailable due to scheduled maintenance or conflict.</textarea>
            </div>
            <div class="flex items-center justify-end space-x-2 pt-2">
              <button type="button" onclick="app.closeApproverRejectModal()" class="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer">
                Cancel
              </button>
              <button type="button" id="approver-confirm-reject-btn" onclick="app.confirmApproverModalRejection()" class="px-4 py-2 rounded-lg text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center space-x-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
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

  getInitials(name) {
    if (!name) return 'NB';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatScheduleDate(dateStr) {
    if (!dateStr) return 'Sep 11, 2026';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[monthIndex] || 'Sep'} ${day}, ${year}`;
    }
    return dateStr;
  }

  copyApproverReferenceCode(code) {
    if (!code) return;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.showToast("Copied", `Reference code ${code} copied to clipboard.`, "info");
  }

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div id="view-pitika-queue-content" class="w-full h-[calc(100dvh-150px)] flex flex-col space-y-2.5 min-h-0">
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
    window.app.sortApproverBy = (column) => this.sortApproverBy(column);
    window.app.quickApproverApprove = (requestId) => this.quickApproverApprove(requestId);
    window.app.quickApproverReject = (requestId) => this.quickApproverReject(requestId);
    window.app.openApproverRejectModal = (requestId) => this.openApproverRejectModal(requestId);
    window.app.closeApproverRejectModal = () => this.closeApproverRejectModal();
    window.app.confirmApproverModalRejection = () => this.confirmApproverModalRejection();
    window.app.copyApproverReferenceCode = (code) => this.copyApproverReferenceCode(code);
    window.app.openPitikaReviewWorkspace = (requestId) => this.openPitikaReviewWorkspace(requestId);
  }

  update() {
    this.renderApproverRequests();
  }

  openPitikaReviewWorkspace(requestId) {
    const reviewView = window.NBC.views['pitika-review'];
    if (reviewView && typeof reviewView.openPitikaReviewWorkspace === 'function') {
      reviewView.openPitikaReviewWorkspace(requestId);
    } else {
      this.navigateTo('pitika-review', { requestId });
    }
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

  sortApproverBy(column) {
    if (this.approverSortColumn === column) {
      this.approverSortDirection = this.approverSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.approverSortColumn = column;
      this.approverSortDirection = (column === 'id' || column === 'schedule') ? 'desc' : 'asc';
    }
    this.renderApproverRequests();
  }

  _getSortIcon(column) {
    if (this.approverSortColumn === column) {
      return this.approverSortDirection === 'asc'
        ? '<span class="iconify text-[#991B1B] text-xs" data-icon="lucide:arrow-up" data-stroke-width="2"></span>'
        : '<span class="iconify text-[#991B1B] text-xs" data-icon="lucide:arrow-down" data-stroke-width="2"></span>';
    }
    return '<span class="iconify text-stone-400 text-xs" data-icon="lucide:chevrons-up-down" data-stroke-width="2"></span>';
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

  _getFilteredApproverRequests() {
    if (typeof bookingStore === 'undefined' || !bookingStore.getRequests) return [];
    const allRequests = bookingStore.getRequests();

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

    if (this.approverDateFilter && this.approverDateFilter !== 'all') {
      const selectedDate = this.approverDateFilter.trim();
      filtered = filtered.filter(req => req.date === selectedDate);
    }

    if (this.approverRoomTypeFilter === 'public') {
      filtered = filtered.filter(req => !req.isPrivateRequest && !req.room?.isPrivate);
    } else if (this.approverRoomTypeFilter === 'private') {
      filtered = filtered.filter(req => req.isPrivateRequest || req.room?.isPrivate);
    }

    if (this.approverDeptFilter && this.approverDeptFilter !== 'all') {
      filtered = filtered.filter(req => req.requester?.department === this.approverDeptFilter);
    }

    // Interactive Sorting
    filtered.sort((a, b) => {
      let valA, valB;
      switch (this.approverSortColumn) {
        case 'id':
          valA = a.id || '';
          valB = b.id || '';
          break;
        case 'requester':
          valA = a.requester?.name || '';
          valB = b.requester?.name || '';
          break;
        case 'room':
          valA = a.room?.name || '';
          valB = b.room?.name || '';
          break;
        case 'schedule':
          valA = (a.date || '') + ' ' + (a.startTime || '');
          valB = (b.date || '') + ' ' + (b.startTime || '');
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        default:
          valA = a.id || '';
          valB = b.id || '';
      }
      if (valA < valB) return this.approverSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.approverSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  quickApproverApprove(requestId) {
    if (typeof bookingStore === 'undefined') return;
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    const isPrivate = req.isPrivateRequest || req.room?.isPrivate;

    if (isPrivate) {
      if (typeof bookingStore.forwardToRoomOwner === 'function') {
        bookingStore.forwardToRoomOwner(requestId, { managerNotes: "Endorsed by Manager Pitika." });
      } else {
        req.status = 'Pending Room Owner Approval';
        req.statusDisplay = 'Waiting Owner';
        if (typeof bookingStore.saveState === 'function') bookingStore.saveState();
      }
      this.showToast("Step 1 Endorsed", `Request ${requestId} forwarded to Room Owner for final sign-off.`, "success");
    } else if (req.needsIT) {
      if (typeof bookingStore.approveAndSetupRequest === 'function') {
        bookingStore.approveAndSetupRequest(requestId, { cateringNotes: "", forwardToIT: true });
      } else {
        req.status = 'Approved - Setup In Progress';
        req.statusDisplay = 'Setting Up';
        if (typeof bookingStore.saveState === 'function') bookingStore.saveState();
      }
      this.showToast("Approved with IT", `Request ${requestId} approved and dispatched to IT Specialist.`, "success");
    } else {
      if (typeof bookingStore.approveAndSetupRequest === 'function') {
        bookingStore.approveAndSetupRequest(requestId, { cateringNotes: "", forwardToIT: false });
        if (typeof bookingStore.finalizeRoomStatus === 'function') {
          bookingStore.finalizeRoomStatus(requestId);
        }
      } else {
        req.status = 'Approved - Confirmed';
        req.statusDisplay = 'Approved';
        if (typeof bookingStore.saveState === 'function') bookingStore.saveState();
      }
      this.showToast("Request Approved", `Meeting room reservation ${requestId} confirmed.`, "success");
    }

    this.renderApproverRequests();
  }

  quickApproverReject(requestId) {
    this.openApproverRejectModal(requestId);
  }

  openApproverRejectModal(target) {
    this._pendingRejectTarget = target;
    const modal = document.getElementById('approver-reject-modal');
    const title = document.getElementById('approver-reject-modal-title');
    const desc = document.getElementById('approver-reject-modal-desc');
    const input = document.getElementById('approver-reject-reason-input');

    if (!modal) return;
    if (title) title.innerText = `Decline Request ${target}`;
    if (desc) desc.innerText = `Please enter the reason for declining meeting reservation #${target}:`;
    if (input) {
      input.value = "Room unavailable due to scheduled maintenance or official conflict.";
    }
    modal.classList.remove('hidden');
  }

  closeApproverRejectModal() {
    const modal = document.getElementById('approver-reject-modal');
    if (modal) modal.classList.add('hidden');
    this._pendingRejectTarget = null;
  }

  confirmApproverModalRejection() {
    const input = document.getElementById('approver-reject-reason-input');
    const reason = (input?.value || '').trim() || "Room unavailable due to official scheduling conflict.";
    const target = this._pendingRejectTarget;

    if (target && typeof bookingStore !== 'undefined') {
      if (typeof bookingStore.rejectBookingRequest === 'function') {
        bookingStore.rejectBookingRequest(target, reason);
      } else {
        const req = bookingStore.getRequestById(target);
        if (req) {
          req.status = 'Rejected';
          req.statusDisplay = 'Rejected';
          req.rejectionReason = reason;
          if (typeof bookingStore.saveState === 'function') bookingStore.saveState();
        }
      }
      this.showToast("Request Declined", `Reservation ${target} has been declined.`, "info");
    }

    this.closeApproverRejectModal();
    this.renderApproverRequests();
  }

  renderApproverRequests() {
    const container = document.getElementById('view-approver-requests-list');
    if (!container) return;

    if (typeof bookingStore === 'undefined' || !bookingStore.getRequests) {
      container.innerHTML = `<div class="p-8 text-center text-xs text-stone-500">Booking store is initializing...</div>`;
      return;
    }

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

    // 3. Filtered Requests
    const filtered = this._getFilteredApproverRequests();

    // 4. Empty State
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs flex-1">
          <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <span class="iconify text-xl" data-icon="lucide:inbox" data-stroke-width="2"></span>
          </div>
          <h3 class="font-heading font-bold text-sm text-stone-900">No Review Requests Found</h3>
          <p class="text-xs text-stone-500 max-w-sm leading-relaxed">
            No meeting reservations matched your filter criteria. Reset filters to view all pending and approved bookings.
          </p>
          <button type="button" onclick="app.resetApproverFilters()" class="btn-secondary h-8 px-4 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset Filters</span>
          </button>
        </div>
      `;
      return;
    }

    // 5. Route between Table and Card modes
    if (this.approverViewMode === 'table') {
      this._renderTableView(container, filtered);
    } else {
      this._renderCardsView(container, filtered);
    }
  }

  // =========================================================================
  // RENDER MODE A: EXECUTIVE DATA TABLE (Matching owner-queue theme & layout)
  // =========================================================================
  _renderTableView(container, filtered) {
    const pageSize = this.approverTablePageSize || 6;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (this.approverCurrentPage >= totalPages) this.approverCurrentPage = totalPages - 1;
    if (this.approverCurrentPage < 0) this.approverCurrentPage = 0;
    const startIdx = this.approverCurrentPage * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);
    this._currentPaginatedItems = paginatedItems;

    let tableRowsHtml = paginatedItems.map((req, idx) => {
      const reqId = req.id || `REQ-2026-${String(idx + 1).padStart(3, '0')}`;
      const submittedText = req.submittedText || (idx === 0 ? 'Submitted 10 mins ago' : (idx === 1 ? 'Submitted 1 hour ago' : `Submitted ${idx} hours ago`));

      const requesterName = req.requester?.name || 'Jonathan Vance';
      const initials = this.getInitials(requesterName);

      const rawRoomName = req.room?.name || 'Executive Room';
      const roomShort = rawRoomName.split(' - ')[0];
      const roomFloor = req.room?.floor ? req.room.floor.split('(')[0].trim() : (req.isPrivateRequest ? 'Level 18' : 'Level 5');

      const formattedDate = this.formatScheduleDate(req.date || '2026-09-11');
      const timeRange = `${req.startTime || '09:00'} - ${req.endTime || '11:00'}`;

      const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
      const isOwnerPending = req.status === 'Pending Room Owner Approval';
      const isSetup = req.status === 'Approved - Setup In Progress' || req.statusDisplay === 'Setting Up';
      const isConfirmed = req.status === 'Approved - Confirmed' || req.status === 'Approved' || req.statusDisplay === 'Approved';
      const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
      const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;
      const isPrivate = req.isPrivateRequest || req.room?.isPrivate;

      let statusHtml = '';
      if (isConflict) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span class="iconify text-xs text-rose-600 shrink-0" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
            <span>Time Conflict</span>
          </div>
        `;
      } else if (isOwnerPending) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span class="iconify text-xs text-purple-600 shrink-0" data-icon="lucide:shield-check" data-stroke-width="2"></span>
            <span>Sent to Owner</span>
          </div>
        `;
      } else if (isSetup) {
        statusHtml = `
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span class="iconify text-xs text-blue-600 shrink-0" data-icon="lucide:settings" data-stroke-width="2"></span>
            <span>Setting Up</span>
          </div>
        `;
      } else if (isConfirmed) {
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

      return `
        <tr class="hover:bg-stone-50/70 transition-colors">
          <!-- 1. REQUEST ID -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="flex items-center space-x-1.5">
              ${isPrivate ? `
                <span class="text-amber-600 shrink-0" title="Private Room">
                  <span class="iconify text-xs" data-icon="lucide:lock" data-stroke-width="2"></span>
                </span>
              ` : ''}
              <button type="button" onclick="app.openPitikaReviewWorkspace('${reqId}')" title="Open Review Workspace" class="font-bold text-xs text-stone-900 hover:text-[#991B1B] transition hover:underline cursor-pointer block leading-tight text-left">
                ${reqId}
              </button>
            </div>
            <span class="text-[11px] text-stone-400 block mt-1 leading-tight">${submittedText}</span>
          </td>

          <!-- 2. REQUESTER -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="flex items-center space-x-2.5 max-w-[200px]">
              <div class="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                ${initials}
              </div>
              <span class="font-semibold text-xs text-stone-900 truncate leading-tight" title="${requesterName}">${requesterName}</span>
            </div>
          </td>

          <!-- 3. ROOM (Clean Typography - Zero Icon) -->
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="min-w-0">
              <span class="font-semibold text-xs text-stone-900 block truncate leading-tight">${roomShort}</span>
              <span class="text-[11px] text-stone-400 block truncate mt-0.5 leading-tight">${roomFloor}</span>
            </div>
          </td>

          <!-- 4. SCHEDULE (Clean Typography - Zero Icon) -->
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
                <button type="button" onclick="app.quickApproverApprove('${reqId}')" title="Approve request" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  <span class="text-white">Approve</span>
                </button>
                <button type="button" onclick="app.quickApproverReject('${reqId}')" title="Decline reservation" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-stone-600" data-icon="lucide:x" data-stroke-width="2"></span>
                  <span>Decline</span>
                </button>
                <button type="button" onclick="app.openPitikaReviewWorkspace('${reqId}')" title="Open Review Workspace" class="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-sm text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
                </button>
              ` : `
                <button type="button" onclick="app.openPitikaReviewWorkspace('${reqId}')" title="Open Review Workspace" class="h-7 px-2.5 rounded-lg bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center space-x-1 shadow-2xs transition active:scale-[0.98] cursor-pointer">
                  <span class="iconify text-xs text-stone-500" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              `}
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
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortApproverBy('id')">
                  <div class="flex items-center space-x-1">
                    <span>REQUEST</span>
                    ${this._getSortIcon('id')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortApproverBy('requester')">
                  <div class="flex items-center space-x-1">
                    <span>REQUESTER</span>
                    ${this._getSortIcon('requester')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortApproverBy('room')">
                  <div class="flex items-center space-x-1">
                    <span>ROOM</span>
                    ${this._getSortIcon('room')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortApproverBy('schedule')">
                  <div class="flex items-center space-x-1">
                    <span>SCHEDULE</span>
                    ${this._getSortIcon('schedule')}
                  </div>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <span>SERVICES</span>
                </th>
                <th class="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 cursor-pointer select-none" onclick="app.sortApproverBy('status')">
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
          <div>
            <span class="text-xs text-stone-500 font-medium">
              Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${Math.min(endIdx, totalItems)}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests
            </span>
          </div>

          <div class="flex items-center space-x-1.5">
            <button type="button" onclick="app.goToApproverPage(${this.approverCurrentPage - 1})" ${this.approverCurrentPage === 0 ? 'disabled' : ''} class="px-2 py-1 text-xs font-medium flex items-center space-x-1 ${this.approverCurrentPage === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:text-stone-900 cursor-pointer'}">
              <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
              <span>Prev</span>
            </button>
            ${this._renderPagePills(totalPages)}
            <button type="button" onclick="app.goToApproverPage(${this.approverCurrentPage + 1})" ${this.approverCurrentPage >= totalPages - 1 ? 'disabled' : ''} class="px-2 py-1 text-xs font-semibold flex items-center space-x-1 ${this.approverCurrentPage >= totalPages - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-800 hover:text-black cursor-pointer'}">
              <span>Next</span>
              <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = tableHtml;
  }

  // =========================================================================
  // RENDER MODE B: CARD VIEW (Matching owner-queue cards grid & typography)
  // =========================================================================
  _renderCardsView(container, filtered) {
    const pageSize = this.approverCardsPageSize || 4;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (this.approverCurrentPage >= totalPages) this.approverCurrentPage = totalPages - 1;
    if (this.approverCurrentPage < 0) this.approverCurrentPage = 0;
    const startIdx = this.approverCurrentPage * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);

    const cardsHtml = paginatedItems.map(req => {
      return this._renderSinglePitikaCard(req);
    }).join('');

    let finalHtml = `
      <div class="flex flex-col flex-1 min-h-0">
        <div class="flex-1 overflow-y-auto hide-scrollbar pb-4 pr-1">
          <div class="pitika-queue-cards-grid">
            ${cardsHtml}
          </div>
        </div>

        <!-- Pagination Controls for Card View -->
        <div class="shrink-0 mt-auto pt-2 bg-[#F9F7F5] border-t border-[#E9E3DD]/60 flex items-center justify-between">
          <span class="text-xs text-stone-500 font-medium">Showing <strong class="text-stone-800 font-semibold">${startIdx + 1}–${Math.min(endIdx, totalItems)}</strong> of <strong class="text-stone-800 font-semibold">${totalItems}</strong> requests</span>
          <div class="flex items-center space-x-1.5">
            <button type="button" onclick="app.goToApproverPage(${this.approverCurrentPage - 1})" ${this.approverCurrentPage === 0 ? 'disabled' : ''} aria-label="Previous page" class="px-2 py-1 text-xs font-medium flex items-center space-x-1 ${this.approverCurrentPage === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:text-stone-900 cursor-pointer'}">
              <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
              <span>Prev</span>
            </button>
            ${this._renderPagePills(totalPages)}
            <button type="button" onclick="app.goToApproverPage(${this.approverCurrentPage + 1})" ${this.approverCurrentPage >= totalPages - 1 ? 'disabled' : ''} aria-label="Next page" class="px-2 py-1 text-xs font-semibold flex items-center space-x-1 ${this.approverCurrentPage >= totalPages - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-800 hover:text-black cursor-pointer'}">
              <span>Next</span>
              <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = finalHtml;
  }

  _renderSinglePitikaCard(req) {
    const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isSetup = req.status === 'Approved - Setup In Progress' || req.statusDisplay === 'Setting Up';
    const isConfirmed = req.status === 'Approved - Confirmed' || req.status === 'Approved' || req.statusDisplay === 'Approved';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;
    const isPrivate = req.isPrivateRequest || req.room?.isPrivate;

    let statusLabel = 'Waiting Review';
    let statusIcon = 'lucide:clock';
    let statusBadgeClass = 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';

    if (isConflict) {
      statusLabel = 'Time Conflict';
      statusIcon = 'lucide:alert-circle';
      statusBadgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
    } else if (isOwnerPending) {
      statusLabel = 'Sent to Owner';
      statusIcon = 'lucide:shield-check';
      statusBadgeClass = 'bg-purple-50 text-purple-700 border border-purple-200';
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
    }

    const roomObj = (typeof bookingStore !== 'undefined' && bookingStore.getRoomById) ? (bookingStore.getRoomById(req.room?.id) || req.room || {}) : (req.room || {});
    const roomImgUrl = roomObj.image || req.room?.image || 'assets/rooms/boardroom-alpha.jpg';
    const roomShortName = (roomObj.name || req.room?.name || 'Meeting Room').split(' - ')[0];
    const floorShort = (roomObj.floor || req.room?.floor || 'Level 18').split('(')[0].trim();
    const refCode = req.referenceCode || req.id || 'NBC-MR-2026';
    const requesterName = req.requester?.name || 'Jonathan Vance';
    const avatarUrl = req.requester?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(requesterName) + '&background=f3e8ff&color=7e22ce';

    return `
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-4.5 shadow-xs transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-sm flex flex-col justify-between animate-card-fade-in">
        <!-- Row 1: ID + Reference Code + Status Pill -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2 min-w-0">
            ${isPrivate ? `
              <span class="text-amber-600 shrink-0" title="Private Executive Room">
                <span class="iconify text-xs" data-icon="lucide:lock" data-stroke-width="2"></span>
              </span>
            ` : ''}
            <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline cursor-pointer" title="Open Review Workspace">
              ${req.id}
            </button>
            <span class="text-stone-300 font-light">•</span>
            <button type="button" onclick="app.copyApproverReferenceCode('${refCode}')" title="Click to copy reference code" class="font-mono text-xs font-normal text-stone-500 hover:text-stone-800 flex items-center space-x-1 cursor-pointer">
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
              <h4 class="font-heading font-semibold text-sm text-stone-900 leading-snug truncate" title="${req.meetingTitle || ''}">${req.meetingTitle || req.meetingPurpose || 'Department Meeting'}</h4>
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

        <!-- Row 3: Requester Metadata Strip -->
        <div class="flex items-center justify-between gap-2 py-2 px-3 mb-2 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
          <div class="flex items-center space-x-2 min-w-0">
            <img src="${avatarUrl}" class="w-5 h-5 rounded-full object-cover border border-[#E9E3DD] shrink-0" alt="Requester" />
            <span class="font-semibold text-stone-800 truncate">${requesterName}</span>
            <span class="text-stone-400 hidden sm:inline">•</span>
            <span class="text-stone-500 truncate hidden sm:inline">${req.requester?.department || 'NBC Operations'}</span>
          </div>
          <div class="flex items-center space-x-1.5 shrink-0">
            ${isPrivate ? `
              <span class="inline-flex items-center space-x-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <span class="iconify text-xs text-amber-700" data-icon="lucide:lock" data-stroke-width="2"></span>
                <span>Private Room</span>
              </span>
            ` : `
              <span class="inline-flex items-center space-x-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                <span class="iconify text-xs text-stone-500" data-icon="lucide:users" data-stroke-width="2"></span>
                <span>${req.attendees || 8} Attendees</span>
              </span>
            `}
          </div>
        </div>

        <!-- Stepper: Visual Approval Progress -->
        ${this._renderApproverBookingStepper(req)}

        <!-- Row 5: Action Buttons (Consistently h-[36px] rounded-xl) -->
        <div class="mt-3.5 flex items-center gap-2 sm:gap-2.5">
          ${isPending ? `
            <button type="button" onclick="app.quickApproverApprove('${req.id}')" title="Approve request" class="btn-primary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-2xs transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
              <span class="text-white">Approve</span>
            </button>
            <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" title="Open Review Workspace" class="flex-1 btn-secondary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-stone-600" data-icon="lucide:file-text" data-stroke-width="2"></span>
              <span>Review</span>
            </button>
            <button type="button" onclick="app.quickApproverReject('${req.id}')" title="Decline reservation" class="w-9 h-9 shrink-0 rounded-xl bg-white hover:bg-rose-50 text-[#991B1B] border border-rose-200 transition flex items-center justify-center cursor-pointer active:scale-[0.98]">
              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          ` : `
            <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="w-full btn-secondary min-h-[36px] h-[36px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-stone-600" data-icon="lucide:eye" data-stroke-width="2"></span>
              <span>View Workspace & Decision</span>
            </button>
          `}
        </div>
      </div>
    `;
  }

  _renderApproverBookingStepper(req) {
    const isConfirmed = req.status === 'Approved - Confirmed' || req.status === 'Approved' || req.statusDisplay === 'Approved';
    const isSetup = req.status === 'Approved - Setup In Progress' || req.statusDisplay === 'Setting Up';
    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isConflict = req.status === 'Time Conflict' || req.statusDisplay === 'Time Conflict' || req.hasConflict;
    const isPrivate = req.isPrivateRequest || req.room?.isPrivate;

    // Compute progress percentage
    let progressPercent = '0%';
    if (isPrivate) {
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '75%';
      else if (isOwnerPending) progressPercent = '50%';
      else if (!isRejected && !isCancelled && !isConflict) progressPercent = '25%';
    } else {
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '66.6%';
      else if (!isRejected && !isCancelled && !isConflict) progressPercent = '33.3%';
    }

    return `
      <div class="relative w-full my-3.5 pt-0.5 pb-1">
        <!-- Connecting Line Background & Progress -->
        <div class="absolute top-[11px] left-[8%] right-[8%] sm:left-[10%] sm:right-[10%] h-[2px] bg-[#E7DFD7] rounded-full z-0 pointer-events-none">
          <div class="h-full bg-emerald-600 rounded-full transition-all duration-300" style="width: ${progressPercent};"></div>
        </div>

        <!-- Stepper Nodes Track -->
        <div class="relative z-10 flex items-start justify-between w-full">
          ${isPrivate ? `
            <!-- Step 1: 1. Submitted -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Submitted</span>
            </div>

            <!-- Step 2: 2. Pitika -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isOwnerPending || isConfirmed || isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Pitika</span>
              ` : (isConflict ? `
                <div class="w-6 h-6 rounded-full bg-amber-600 ring-[4px] ring-amber-100 flex items-center justify-center shadow-xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-amber-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-amber-600 mt-0.5 whitespace-nowrap">Conflict</span>
              ` : (isRejected ? `
                <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:x" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">Rejected</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white ring-[4px] ring-emerald-200/60 flex items-center justify-center shadow-xs"></div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Reviewing</span>
              `))}
            </div>

            <!-- Step 3: 3. Room Owner -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed || isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">3. Room Owner</span>
              ` : (isOwnerPending ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white ring-[4px] ring-emerald-200/60 flex items-center justify-center shadow-xs"></div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">3. Room Owner</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Waiting</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>3</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">3. Room Owner</span>
              `)}
            </div>

            <!-- Step 4: 4. IT Setup -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. IT Setup</span>
              ` : (isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">4. IT Setup</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Setting Up</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>4</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">4. IT Setup</span>
              `)}
            </div>

            <!-- Step 5: 5. Door Pass -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">5. Door Pass</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>5</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">5. Door Pass</span>
              `}
            </div>
          ` : `
            <!-- Standard Public Room: 4 Steps -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Submitted</span>
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed || isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Approved</span>
              ` : (isRejected || isCancelled ? `
                <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:x" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">${isCancelled ? 'Cancelled' : 'Rejected'}</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Reviewing</span>
              `)}
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
              ` : (isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Setting Up</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>3</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
              `)}
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">4. Door Pass</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>4</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-400 mt-2 whitespace-nowrap">4. Door Pass</span>
              `}
            </div>
          `}
        </div>
      </div>
    `;
  }

  _renderPagePills(totalPages) {
    const currentPage = this.approverCurrentPage;
    let pills = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pills += `
        <button type="button" onclick="app.goToApproverPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold ${isActive ? 'bg-[#991B1B] text-white shadow-2xs' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'} flex items-center justify-center transition">
          ${i + 1}
        </button>
      `;
    }
    return pills;
  }
}

window.NBC.views['pitika-queue'] = new PitikaQueueView();
