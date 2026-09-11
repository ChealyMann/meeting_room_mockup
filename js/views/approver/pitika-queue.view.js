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
    this.approverSearchTerm = '';
    this.approverCurrentPage = 0;
    this.approverPageSize = 10;
    this.template = `<!-- Queue Header with View Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E9E3DD]">
          <div>
            <h2 class="font-heading font-bold text-lg text-stone-900 leading-tight">Review Requests</h2>
            <p class="text-xs text-stone-500 mt-0.5">Review and approve meeting room requests.</p>
          </div>

          <!-- View Mode Switcher (Table vs Cards) -->
          <div class="flex items-center space-x-2 shrink-0">
            <span class="text-xs text-stone-500 font-medium hidden sm:inline">View:</span>
            <div class="inline-flex p-1 bg-stone-100 rounded-lg border border-[#E9E3DD]">
              <button id="approver-view-table-btn" onclick="app.setApproverViewMode('table')" aria-label="Switch to table view" class="px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 bg-white text-stone-900 shadow-2xs">
                <span class="iconify text-xs text-red-800" data-icon="lucide:table"></span>
                <span>Table</span>
              </button>
              <button id="approver-view-cards-btn" onclick="app.setApproverViewMode('cards')" aria-label="Switch to card view" class="px-3 py-1 rounded-md text-xs font-medium text-stone-500 hover:text-stone-800 transition flex items-center space-x-1.5">
                <span class="iconify text-xs text-stone-500" data-icon="lucide:layout-grid"></span>
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Daily Productivity Filter Bar -->
        <div class="space-y-3 bg-white p-3.5 rounded-xl border border-[#E9E3DD] shadow-2xs">
          
          <!-- Row 1: Status Tabs -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-stone-200/80">
            <div class="segmented-control w-full sm:w-auto">
              <div class="segmented-scroll-track">
                <button id="approver-filter-all" onclick="app.filterApproverRequests('all')" class="segmented-btn active">
                  <span>All Status</span>
                  <span id="approver-count-all" class="segmented-badge">3</span>
                </button>
                <button id="approver-filter-pending" onclick="app.filterApproverRequests('pending')" class="segmented-btn">
                  <span>Waiting</span>
                  <span id="approver-count-pending" class="segmented-badge">1</span>
                </button>
                <button id="approver-filter-approved" onclick="app.filterApproverRequests('approved')" class="segmented-btn">
                  <span>Approved</span>
                  <span id="approver-count-approved" class="segmented-badge">1</span>
                </button>
                <button id="approver-filter-rejected" onclick="app.filterApproverRequests('rejected')" class="segmented-btn">
                  <span>Rejected</span>
                  <span id="approver-count-rejected" class="segmented-badge">1</span>
                </button>
              </div>
            </div>

            <!-- Total Results Count -->
            <div id="approver-results-summary" class="text-[11px] text-stone-500 font-medium">
              Showing <strong id="approver-filtered-count" class="text-stone-800">3</strong> requests
            </div>
          </div>

          <!-- Row 2: Search, Date Time Filter, Room Type Filter, Reset Button -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            <!-- Search Bar (Span 5) -->
            <div class="sm:col-span-5 relative">
              <span class="iconify absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" data-icon="lucide:search"></span>
              <input type="text" id="approver-search-input" oninput="app.handleApproverFilterChange()" placeholder="Search requester, room, ID, or title..." class="bank-input pl-9 pr-7 py-2 text-xs w-full bg-stone-50/50 focus:bg-white transition" />
              <button id="approver-search-clear" onclick="app.clearApproverSearch()" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <span class="iconify text-xs" data-icon="lucide:x"></span>
              </button>
            </div>

            <!-- Date Filter (Span 3) -->
            <div class="sm:col-span-3 relative">
              <span class="iconify absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" data-icon="lucide:calendar"></span>
              <input type="date" id="approver-date-filter" oninput="app.handleApproverFilterChange()" onchange="app.handleApproverFilterChange()" aria-label="Filter by date" title="Select date to filter requests" class="bank-input pl-9 pr-8 py-2 text-xs w-full bg-stone-50/50 focus:bg-white transition cursor-pointer font-medium" />
              <button id="approver-date-clear" onclick="app.clearApproverDateFilter()" title="Clear date filter" class="hidden absolute right-8 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 transition cursor-pointer">
                <span class="iconify text-xs" data-icon="lucide:x"></span>
              </button>
            </div>

            <!-- Room Type Filter (Span 3) -->
            <div class="sm:col-span-3 relative">
              <span class="iconify absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" data-icon="lucide:building-2"></span>
              <select id="approver-room-type-filter" onchange="app.handleApproverFilterChange()" aria-label="Filter by room type" class="bank-input pl-9 pr-7 py-2 text-xs w-full bg-stone-50/50 focus:bg-white transition cursor-pointer">
                <option value="all">All Room Types</option>
                <option value="public">Public Rooms</option>
                <option value="private">Private Rooms</option>
              </select>
            </div>

            <!-- Reset Button (Span 1) -->
            <div class="sm:col-span-1 flex justify-end">
              <button id="approver-reset-btn" onclick="app.resetApproverFilters()" title="Reset all filters" class="w-full min-h-[38px] px-2.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center space-x-1 transition border border-stone-200 shadow-2xs">
                <span class="iconify text-xs" data-icon="lucide:rotate-ccw"></span>
                <span class="sm:hidden text-xs">Reset</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Requests Content (Table or Cards rendered dynamically) -->
        <div id="view-approver-requests-list" class="space-y-3.5">
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
      <div id="view-pitika-queue-content" class="w-full space-y-4">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    const searchInput = document.getElementById('approver-search-input');
    const clearBtn = document.getElementById('approver-search-clear');
    if (searchInput && this.approverSearchTerm) {
      searchInput.value = this.approverSearchTerm;
      if (clearBtn) clearBtn.classList.remove('hidden');
    }
    const dateInput = document.getElementById('approver-date-filter');
    const dateClearBtn = document.getElementById('approver-date-clear');
    if (dateInput) {
      // Default to today if no filter is set
      if (!this.approverDateFilter) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        dateInput.value = `${y}-${m}-${d}`;
        this.approverDateFilter = dateInput.value;
        if (dateClearBtn) dateClearBtn.classList.remove('hidden');
      } else {
        dateInput.value = this.approverDateFilter;
        if (dateClearBtn) dateClearBtn.classList.toggle('hidden', !this.approverDateFilter);
      }
    }
    const typeSelect = document.getElementById('approver-room-type-filter');
    if (typeSelect && this.approverRoomTypeFilter) {
      typeSelect.value = this.approverRoomTypeFilter;
    }
    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  update() {
    this.renderApproverRequests();
  }

  setApproverViewMode(mode) {
    this.approverViewMode = mode;
    const tableBtn = document.getElementById('approver-view-table-btn');
    const cardsBtn = document.getElementById('approver-view-cards-btn');
    if (tableBtn && cardsBtn) {
      if (mode === 'table') {
        tableBtn.className = 'px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 bg-white text-stone-900 shadow-2xs';
        cardsBtn.className = 'px-3 py-1 rounded-md text-xs font-medium text-stone-500 hover:text-stone-800 transition flex items-center space-x-1.5';
      } else {
        cardsBtn.className = 'px-3 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 bg-white text-stone-900 shadow-2xs';
        tableBtn.className = 'px-3 py-1 rounded-md text-xs font-medium text-stone-500 hover:text-stone-800 transition flex items-center space-x-1.5';
      }
    }
    this.renderApproverRequests();
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
    const dateClearBtn = document.getElementById('approver-date-clear');
    const typeSelect = document.getElementById('approver-room-type-filter');

    this.approverSearchTerm = (searchInput?.value || '').trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !this.approverSearchTerm);
    }
    this.approverDateFilter = dateInput?.value || '';
    if (dateClearBtn) {
      dateClearBtn.classList.toggle('hidden', !this.approverDateFilter);
    }
    this.approverRoomTypeFilter = typeSelect?.value || 'all';

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


  resetApproverFilters() {
    this.approverFilter = 'all';
    this.approverRoomTypeFilter = 'all';
    this.approverSearchTerm = '';

    const searchInput = document.getElementById('approver-search-input');
    if (searchInput) searchInput.value = '';
    const dateInput = document.getElementById('approver-date-filter');
    if (dateInput) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      dateInput.value = `${y}-${m}-${d}`;
      this.approverDateFilter = dateInput.value;
    }
    const typeSelect = document.getElementById('approver-room-type-filter');
    if (typeSelect) typeSelect.value = 'all';
    const clearBtn = document.getElementById('approver-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    const dateClearBtn = document.getElementById('approver-date-clear');
    if (dateClearBtn) dateClearBtn.classList.remove('hidden');

    const filterBtns = ['all', 'pending', 'approved', 'rejected'];
    filterBtns.forEach(f => {
      const btn = document.getElementById(`approver-filter-${f}`);
      if (btn) btn.classList.toggle('active', f === 'all');
    });

    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }


  filterApproverRequests(status) {
    this.approverFilter = status;
    const filterBtns = ['all', 'pending', 'approved', 'rejected'];
    filterBtns.forEach(f => {
      const btn = document.getElementById(`approver-filter-${f}`);
      if (btn) {
        btn.classList.toggle('active', f === status);
      }
    });
    this.approverCurrentPage = 0;
    this.renderApproverRequests();
  }

  goToApproverPage(page) {
    this.approverCurrentPage = page;
    this.renderApproverRequests();
    const listEl = document.getElementById('view-approver-requests-list');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  renderApproverRequests() {
    const container = document.getElementById('view-approver-requests-list');
    if (!container) return;

    const allRequests = bookingStore.getRequests();

    // 1. Calculate Date References (Today, Tomorrow, 7 Days)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // 2. Status counts for pill badges (reflecting currently selected date, or all if cleared)
    const baseRequestsForCounts = allRequests.filter(req => {
      if (!this.approverDateFilter || this.approverDateFilter === 'all') return true;
      return req.date === this.approverDateFilter;
    });

    const allCount = baseRequestsForCounts.length;
    const pendingCount = baseRequestsForCounts.filter(r => r.status === 'Pending Review' || r.status === 'Pending Manager Review').length;
    const approvedCount = baseRequestsForCounts.filter(r => r.status.includes('Approved') || r.status === 'Pending Room Owner Approval').length;
    const rejectedCount = baseRequestsForCounts.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length;

    const countAllEl = document.getElementById('approver-count-all');
    const countPendingEl = document.getElementById('approver-count-pending');
    const countApprovedEl = document.getElementById('approver-count-approved');
    const countRejectedEl = document.getElementById('approver-count-rejected');

    if (countAllEl) countAllEl.innerText = allCount;
    if (countPendingEl) countPendingEl.innerText = pendingCount;
    if (countApprovedEl) countApprovedEl.innerText = approvedCount;
    if (countRejectedEl) countRejectedEl.innerText = rejectedCount;

    // 3. Filter by Status
    let filtered = allRequests.filter(req => {
      if (this.approverFilter === 'pending') {
        return req.status === 'Pending Review' || req.status === 'Pending Manager Review';
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

    // Update Result Summary Counter
    const filteredCountEl = document.getElementById('approver-filtered-count');
    if (filteredCountEl) filteredCountEl.innerText = filtered.length;

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.approverPageSize));
    if (this.approverCurrentPage >= totalPages) this.approverCurrentPage = totalPages - 1;
    if (this.approverCurrentPage < 0) this.approverCurrentPage = 0;
    const startIdx = this.approverCurrentPage * this.approverPageSize;
    const endIdx = startIdx + this.approverPageSize;
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
      let tableHtml = `
        <div class="approver-table-wrapper">
          <table class="approver-table">
            <thead>
              <tr>
                <th class="min-w-[130px]">Meeting ID</th>
                <th class="min-w-[140px]">Requester</th>
                <th class="min-w-[140px]">Room</th>
                <th class="min-w-[180px]">Schedule</th>
                <th class="min-w-[110px]">Status</th>
                <th class="min-w-[110px] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
      `;

      tableHtml += paginatedItems.map(req => {
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
          <tr class="${rowClass}">
            
            <!-- 1. Meeting ID (Clean & Clickable to Review Workspace) -->
            <td>
              <div class="flex items-center space-x-2">
                ${isPrivate ? `
                  <span class="${isPassed ? 'text-stone-400' : 'text-amber-600'} shrink-0" title="Private Executive Room">
                    <span class="iconify text-sm" data-icon="lucide:lock"></span>
                  </span>
                ` : ''}
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="font-mono font-bold text-xs ${isPassed ? 'text-stone-600' : 'text-stone-900'} hover:text-red-900 transition underline-offset-2 hover:underline inline-flex items-center" title="Click to view details in Review Workspace">
                  ${req.id}
                </button>
              </div>
            </td>

            <!-- 2. Requester (Name only) -->
            <td>
              <span class="${isPassed ? 'text-stone-600 font-medium' : 'text-stone-800 font-semibold'} text-xs">${req.requester.name}</span>
            </td>

            <!-- 3. Room (Room name only) -->
            <td>
              <span class="${isPassed ? 'text-stone-600 font-medium' : 'text-stone-800 font-semibold'} text-xs">${req.room.name}</span>
            </td>

            <!-- 4. Schedule (Date & Time on 1 clean line) -->
            <td>
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
            <td>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${statusBadgeClass} inline-flex items-center shadow-2xs whitespace-nowrap">
                <span>${statusLabel}</span>
              </span>
            </td>

            <!-- 6. Action (Review button - click to view details and approve/reject) -->
            <td class="text-right">
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

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;

      // Pagination Controls
      if (totalPages > 1) {
        tableHtml += this._renderPaginationControls(totalPages, totalItems, startIdx, endIdx);
      }

      container.innerHTML = tableHtml;
      return;
    }

    // =========================================================================
    // RENDER MODE B: CARD VIEW (Fallback when user clicks Cards)
    // =========================================================================
    let cardsHtml = paginatedItems.map(req => {
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

      let statusLabel = 'Waiting for Review';
      if (isConfirmed) statusLabel = 'Confirmed';
      else if (isRejected) statusLabel = 'Rejected';
      else if (isCancelled) statusLabel = 'Cancelled';
      else if (isOwnerPending) statusLabel = 'Sent to Owner';
      else if (isSetup) statusLabel = 'Setting Up';

      return `
        <div class="slate-card p-4 space-y-3 ${isPassed ? 'opacity-60 hover:opacity-100 transition-opacity bg-stone-50/60' : ''}">
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 pb-2.5">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg ${isPending ? 'bg-amber-600 text-white' : 'bg-[#2A0808] text-white border border-amber-500/30'} flex items-center justify-center font-bold text-xs shadow-xs">
                <span class="iconify text-xs" data-icon="${isPrivate ? 'lucide:key' : 'lucide:file-text'}" data-stroke-width="1.8"></span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-[11px] font-bold text-red-950 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">${req.id}</span>
                  ${isPrivate ? `
                    <span class="badge-private-room-tag text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-1">
                      <span class="iconify" data-icon="lucide:shield-check"></span>
                      <span>Private Room (Step 1)</span>
                    </span>
                  ` : `
                    <span class="badge-public-room text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Public Room</span>
                    </span>
                  `}
                  <span class="text-[11px] text-stone-500">From: <strong class="text-stone-800">${req.requester.name}</strong> (${req.requester.department})</span>
                </div>
                <h3 class="font-heading font-bold text-xs sm:text-sm text-stone-900 mt-0.5">${req.meetingTitle}</h3>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isConfirmed ? 'badge-approved' : (isRejected ? 'badge-rejected' : (isCancelled ? 'badge-cancelled' : (isOwnerPending ? 'badge-owner-pending' : (isSetup ? 'badge-setup' : 'badge-pending'))))}">
                ${statusLabel}
              </span>
            </div>
          </div>

          ${isPrivate ? `
            <div class="px-3 py-1.5 bg-amber-50/60 rounded-lg border-l-4 border-amber-500 text-xs text-amber-950 flex items-center justify-between">
              <span class="font-semibold text-[11px]">Reason: ${req.privateJustification || req.meetingPurpose}</span>
              <span class="text-[10px] text-amber-800 font-bold">Owner: ${req.room.roomOwner?.name || 'Executive'}</span>
            </div>
          ` : ''}

          <!-- SPECS: Clean divider -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2.5 border-y border-stone-200 text-xs">
            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-semibold">Room</span>
              <strong class="text-stone-900 font-heading">${req.room.name}</strong>
              <p class="text-[11px] text-stone-500">${req.room.floor}</p>
            </div>
            <div>
              <span class="${isPassed ? 'text-stone-400' : 'text-stone-500'} block text-[10px] uppercase font-semibold">Date & Time</span>
              <div class="flex items-center space-x-1 ${isPassed ? 'text-stone-500' : 'text-stone-900 font-bold'}">
                ${isPassed ? '<span class="iconify text-xs text-stone-400 shrink-0" data-icon="lucide:history"></span>' : ''}
                <span>${req.date}</span>
              </div>
              <p class="text-[11px] ${isPassed ? 'text-stone-400' : 'text-stone-500'}">${req.startTime} - ${req.endTime} (${req.attendees} People)</p>
            </div>
            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-semibold">Extra Help</span>
              <div class="flex items-center space-x-1 mt-0.5">
                ${req.needsCatering ? `<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px] border border-amber-300 flex items-center space-x-1"><span class="iconify text-[10px]" data-icon="lucide:utensils" data-stroke-width="1.8"></span><span>Food</span></span>` : ''}
                ${req.needsIT ? `<span class="px-1.5 py-0.5 rounded bg-red-100 text-red-900 font-semibold text-[10px] border border-red-300 flex items-center space-x-1"><span class="iconify text-[10px]" data-icon="lucide:headset" data-stroke-width="1.8"></span><span>IT Help</span></span>` : ''}
                ${!req.needsCatering && !req.needsIT ? `<span class="text-stone-400">None</span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-0.5">
            <span class="text-[11px] text-stone-500">Sent on ${req.submissionTimestamp}</span>
            <div class="flex items-center space-x-2">
              ${isPassed ? `
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="min-h-[30px] px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-stone-100 text-stone-600 border border-[#E9E3DD] shadow-2xs transition inline-flex items-center space-x-1.5 cursor-pointer">
                  <span class="iconify text-xs text-stone-400" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              ` : `
                <button type="button" onclick="app.openPitikaReviewWorkspace('${req.id}')" class="btn-primary min-h-[30px] px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                  <span>View</span>
                </button>
              `}
            </div>
          </div>

        </div>
      `;
    }).join('');

    // Pagination Controls for Card View
    if (totalPages > 1) {
      cardsHtml += this._renderPaginationControls(totalPages, totalItems, startIdx, endIdx);
    }

    container.innerHTML = cardsHtml;
  }

  _renderPaginationControls(totalPages, totalItems, startIdx, endIdx) {
    const currentPage = this.approverCurrentPage;
    const showingEnd = Math.min(endIdx, totalItems);

    let pageButtons = '';
    for (let i = 0; i < totalPages; i++) {
      const isActive = i === currentPage;
      pageButtons += `<button type="button" onclick="app.goToApproverPage(${i})" class="min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition ${isActive ? 'border border-red-800 text-red-900 bg-transparent font-bold' : 'border border-stone-200 bg-transparent text-stone-600 hover:border-stone-400'}">${i + 1}</button>`;
    }

    return `
      <div class="flex items-center justify-between pt-3 mt-1">
        <span class="text-[11px] text-stone-500 font-medium">Showing <strong class="text-stone-800">${startIdx + 1}–${showingEnd}</strong> of <strong class="text-stone-800">${totalItems}</strong> requests</span>
        <div class="flex items-center space-x-1.5">
          <button type="button" onclick="app.goToApproverPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} class="h-8 px-2.5 rounded-lg border border-stone-200 bg-transparent text-stone-600 text-[12px] font-medium transition ${currentPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-stone-400 cursor-pointer'}">
            <span class="iconify text-[13px]" data-icon="lucide:chevron-left"></span>
          </button>
          ${pageButtons}
          <button type="button" onclick="app.goToApproverPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} class="h-8 px-2.5 rounded-lg border border-stone-200 bg-transparent text-stone-600 text-[12px] font-medium transition ${currentPage >= totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-stone-400 cursor-pointer'}">
            <span class="iconify text-[13px]" data-icon="lucide:chevron-right"></span>
          </button>
        </div>
      </div>
    `;
  }

  // ==================== 5. PITIKA SINGLE-PAGE REVIEW WORKSPACE ====================

}

window.NBC.views['pitika-queue'] = new PitikaQueueView();
