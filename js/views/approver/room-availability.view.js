// Room Availability View Component (view-room-availability)
// NBC Bank MRMS - Executive Meeting Room Availability & Timeline

window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomAvailabilityView {
  constructor() {
    this.id = 'room-availability';
    this.selectedDate = '2026-09-11';
    this.searchTerm = '';
    this.roomTypeFilter = 'all';
    this.floorFilter = 'all';
    this.statusFilter = 'all';
    this.selectedModalSlot = null;

    // Room Details Modal state
    this.activeDetailsRoomId = null;
    this.activeDetailsTab = 'overview';
    this.activeDetailsImageIndex = 0;
    this._handleDetailsModalKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.closeRoomDetailsModal();
      }
    };

    // Timeline configuration (07:00 to 18:00 = 11 hours = 660 mins)
    this.timelineStartHour = 7;
    this.timelineEndHour = 18;
    this.timelineTotalMinutes = (this.timelineEndHour - this.timelineStartHour) * 60;
  }

  render(container) {
    if (!container) return;
    this._bindAppHandlers();
    container.innerHTML = `
      <div id="view-room-availability-content" class="w-full h-[calc(100dvh-160px)] flex flex-col space-y-2.5 min-h-0">
        <div class="shrink-0 space-y-2.5">
          ${this._renderHeader()}
          ${this._renderSummaryCards()}
          ${this._renderFilterBar()}
        </div>
        <div class="flex-1 min-h-0 flex flex-col">
          ${this._renderTimelineTable()}
        </div>
        <div class="shrink-0 pt-0.5">
          ${this._renderLegend()}
        </div>
      </div>
      <div id="avail-slot-modal-container"></div>
      <div id="avail-room-details-modal-container"></div>
    `;
    this.init();
  }

  _bindAppHandlers() {
    if (!window.app) return;
    window.app.setAvailabilityDate = (val) => this.setAvailabilityDate(val);
    window.app.handleAvailabilityFilterChange = () => this.handleAvailabilityFilterChange();
    window.app.resetAvailabilityFilters = () => this.resetAvailabilityFilters();
    window.app.filterAvailabilityStatus = (status) => this.filterAvailabilityStatus(status);
    window.app.clearAvailabilitySearch = () => this.clearAvailabilitySearch();
    window.app.openAvailabilitySlotModal = (slotId, roomId) => this.openAvailabilitySlotModal(slotId, roomId);
    window.app.closeAvailabilitySlotModal = () => this.closeAvailabilitySlotModal();
    window.app.openRoomDetailsModal = (roomId) => this.openRoomDetailsModal(roomId);
    window.app.closeRoomDetailsModal = () => this.closeRoomDetailsModal();
    window.app.switchRoomDetailsTab = (tab) => this.switchRoomDetailsTab(tab);
    window.app.setRoomDetailsImageIndex = (idx) => this.setRoomDetailsImageIndex(idx);
    window.app.navigateRoomDetailsImage = (dir) => this.navigateRoomDetailsImage(dir);
  }

  init() {
    // Populate dynamic floors in dropdown
    const floorSelect = document.getElementById('avail-floor-filter');
    if (floorSelect && typeof bookingStore !== 'undefined') {
      const rooms = bookingStore.getRooms() || [];
      const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))];
      let optionsHtml = '<option value="all">All Floors</option>';
      floors.forEach(f => {
        const shortName = f.split('(')[0].trim();
        optionsHtml += `<option value="${f}">${shortName}</option>`;
      });
      floorSelect.innerHTML = optionsHtml;
      floorSelect.value = this.floorFilter;
    }

    // Set filter control values if restored
    const searchInput = document.getElementById('avail-search-input');
    if (searchInput) searchInput.value = this.searchTerm;
    const typeSelect = document.getElementById('avail-type-filter');
    if (typeSelect) typeSelect.value = this.roomTypeFilter;
    const statusSelect = document.getElementById('avail-status-filter');
    if (statusSelect) statusSelect.value = this.statusFilter;
    const datePicker = document.getElementById('avail-date-picker');
    if (datePicker) datePicker.value = this.selectedDate;

    this.update();
  }

  update() {
    this._refreshViewData();
  }

  setAvailabilityDate(dateVal) {
    if (dateVal === 'today') {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      // If current real year is 2025/2026, align with demo date
      this.selectedDate = '2026-09-11';
    } else if (dateVal) {
      this.selectedDate = dateVal;
    }
    const datePicker = document.getElementById('avail-date-picker');
    if (datePicker) datePicker.value = this.selectedDate;

    this.update();
  }

  handleAvailabilityFilterChange() {
    const searchInput = document.getElementById('avail-search-input');
    const typeSelect = document.getElementById('avail-type-filter');
    const floorSelect = document.getElementById('avail-floor-filter');
    const statusSelect = document.getElementById('avail-status-filter');
    const searchClear = document.getElementById('avail-search-clear');

    this.searchTerm = (searchInput?.value || '').trim().toLowerCase();
    this.roomTypeFilter = typeSelect?.value || 'all';
    this.floorFilter = floorSelect?.value || 'all';
    this.statusFilter = statusSelect?.value || 'all';

    if (searchClear) {
      if (this.searchTerm) {
        searchClear.classList.remove('hidden');
      } else {
        searchClear.classList.add('hidden');
      }
    }

    this._refreshViewData();
  }

  clearAvailabilitySearch() {
    this.searchTerm = '';
    const searchInput = document.getElementById('avail-search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    const searchClear = document.getElementById('avail-search-clear');
    if (searchClear) searchClear.classList.add('hidden');
    this._refreshViewData();
  }

  filterAvailabilityStatus(status) {
    this.statusFilter = status;
    const statusSelect = document.getElementById('avail-status-filter');
    if (statusSelect) statusSelect.value = status;
    this._refreshViewData();
  }

  resetAvailabilityFilters() {
    this.searchTerm = '';
    this.roomTypeFilter = 'all';
    this.floorFilter = 'all';
    this.statusFilter = 'all';

    const searchInput = document.getElementById('avail-search-input');
    if (searchInput) searchInput.value = '';
    const searchClear = document.getElementById('avail-search-clear');
    if (searchClear) searchClear.classList.add('hidden');
    const typeSelect = document.getElementById('avail-type-filter');
    if (typeSelect) typeSelect.value = 'all';
    const floorSelect = document.getElementById('avail-floor-filter');
    if (floorSelect) floorSelect.value = 'all';
    const statusSelect = document.getElementById('avail-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    this._refreshViewData();
  }

  _renderHeader() {
    return `
      <!-- Executive Header -->
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#E9E3DD]">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">Today's Room Availability</h2>
        </div>

        <!-- Date Controls & Action Buttons -->
        <div class="flex items-center space-x-2 shrink-0">
          <div class="relative">
            <input 
              type="date" 
              id="avail-date-picker" 
              value="${this.selectedDate}" 
              onchange="app.setAvailabilityDate(this.value)" 
              class="bank-input min-h-[34px] h-[34px] bg-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E9E3DD] shadow-2xs text-stone-800 cursor-pointer focus:border-[#991B1B]" 
              aria-label="Select Date"
            />
          </div>

          <!-- Reset Filters Button -->
          <button 
            id="avail-reset-btn" 
            type="button" 
            onclick="app.resetAvailabilityFilters()" 
            title="Reset all filters" 
            class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset Filters</span>
          </button>

          <!-- Primary Jump to Today Action -->
          <button 
            type="button" 
            onclick="app.setAvailabilityDate('today')" 
            class="btn-primary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs flex items-center space-x-1.5 cursor-pointer active:scale-[0.98] transition-all"
            title="Jump to Today"
          >
            <span class="iconify text-xs text-white" data-icon="lucide:calendar" data-stroke-width="2"></span>
            <span class="text-white">Today</span>
          </button>
        </div>
      </div>
    `;
  }

  _renderSummaryCards() {
    return `
      <!-- Executive KPI Overview Strip (Interactive Filter Shortcuts) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-[#E9E3DD] shrink-0">
        <!-- Metric 1: Total Rooms -->
        <div onclick="app.filterAvailabilityStatus('all')" title="View All Rooms" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-[#991B1B] hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-[#991B1B]" data-icon="lucide:door-closed" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Total Rooms</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="avail-kpi-total" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">10</span>
              <span class="text-xs text-stone-500 truncate">In Facility</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Available Rooms -->
        <div onclick="app.filterAvailabilityStatus('available')" title="Filter by Available Rooms" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-emerald-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-emerald-600" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Available</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="avail-kpi-available" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">6</span>
              <span class="text-xs text-stone-500 truncate">Ready</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Occupied Rooms -->
        <div onclick="app.filterAvailabilityStatus('occupied')" title="Filter by Occupied Rooms" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-rose-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-rose-600" data-icon="lucide:user-x" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Occupied</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="avail-kpi-occupied" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">3</span>
              <span class="text-xs text-stone-500 truncate">In Session</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: Pending Approval -->
        <div onclick="app.filterAvailabilityStatus('pending')" title="Filter by Pending Approval" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-amber-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-amber-600" data-icon="lucide:clock" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Pending</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="avail-kpi-pending" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">1</span>
              <span class="text-xs text-stone-500 truncate">In Review</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderFilterBar() {
    return `
      <!-- Productivity Filter Bar (Single-Row Streamlined Layout) -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 w-full items-center">
        <!-- Search Input (4 cols) -->
        <div class="sm:col-span-4 relative w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:search" data-stroke-width="2"></span>
          <input 
            type="text" 
            id="avail-search-input" 
            oninput="app.handleAvailabilityFilterChange()" 
            placeholder="Search room name, floor..." 
            class="bank-input pl-8 pr-7 py-1.5 text-xs w-full bg-white transition border border-[#E9E3DD] rounded-lg shadow-2xs focus:border-[#991B1B]" 
          />
          <button 
            id="avail-search-clear" 
            onclick="app.clearAvailabilitySearch()" 
            title="Clear search" 
            class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#991B1B] p-0.5 rounded transition cursor-pointer"
          >
            <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>
        </div>

        <!-- Room Type (2 cols) -->
        <div class="relative sm:col-span-2 w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:building-2" data-stroke-width="2"></span>
          <select 
            id="avail-type-filter" 
            onchange="app.handleAvailabilityFilterChange()" 
            aria-label="Filter by Room Type" 
            class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs truncate focus:border-[#991B1B]"
          >
            <option value="all">All Room Types</option>
            <option value="shared">Shared Room</option>
            <option value="private">Private Room</option>
          </select>
        </div>

        <!-- Floors (3 cols) -->
        <div class="relative sm:col-span-3 w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:layers" data-stroke-width="2"></span>
          <select 
            id="avail-floor-filter" 
            onchange="app.handleAvailabilityFilterChange()" 
            aria-label="Filter by Floor" 
            class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs truncate focus:border-[#991B1B]"
          >
            <option value="all">All Floors</option>
          </select>
        </div>

        <!-- Status (2 cols) -->
        <div class="relative sm:col-span-2 w-full">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:filter" data-stroke-width="2"></span>
          <select 
            id="avail-status-filter" 
            onchange="app.handleAvailabilityFilterChange()" 
            aria-label="Filter by Status" 
            class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs truncate focus:border-[#991B1B]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        <!-- Reset Button (1 col) -->
        <div class="sm:col-span-1 w-full">
          <button 
            type="button" 
            onclick="app.resetAvailabilityFilters()" 
            title="Reset Filters" 
            class="btn-secondary w-full min-h-[34px] h-[34px] px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span class="sm:hidden xl:inline">Reset</span>
          </button>
        </div>
      </div>
    `;
  }

  _renderTimelineTable() {
    return `
      <!-- Timeline Table Container (Internal scroll only, sticky header) -->
      <div class="bg-white rounded-xl border border-[#E9E3DD] shadow-2xs overflow-hidden flex-1 min-h-0 flex flex-col">
        <div class="overflow-x-auto overflow-y-auto flex-1 min-h-0 no-scrollbar relative">
          <table class="w-full text-left border-collapse min-w-[960px]">
            <thead class="sticky top-0 z-20 bg-stone-50 shadow-2xs">
              <tr class="border-b border-[#E9E3DD] text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th class="py-3 px-3 w-10 text-center bg-stone-50">#</th>
                <th class="py-3 px-3 w-64 min-w-[240px] bg-stone-50">Room Name</th>
                <th class="py-3 px-3 w-36 min-w-[130px] bg-stone-50">Type</th>
                <th class="py-3 px-2 w-[calc(100%-414px)] min-w-[600px] bg-stone-50">
                  <div class="flex justify-between font-mono text-[11px] text-stone-500 font-semibold px-2 select-none">
                    <span>07:00</span>
                    <span>08:00</span>
                    <span>09:00</span>
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                    <span>13:00</span>
                    <span>14:00</span>
                    <span>15:00</span>
                    <span>16:00</span>
                    <span>17:00</span>
                    <span>18:00</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody id="avail-timeline-tbody" class="divide-y divide-[#E9E3DD] text-xs">
              <!-- Rendered dynamically by _refreshViewData() -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  _renderLegend() {
    return `
      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs text-stone-600 font-medium select-none">
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400 inline-block"></span>
          <span>Available</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded bg-[#EF4444] border border-red-600 inline-block"></span>
          <span>Occupied</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded bg-[#FBBF24] border border-amber-500 inline-block"></span>
          <span>Pending Approval</span>
        </div>
      </div>
    `;
  }

  _refreshViewData() {
    if (typeof bookingStore === 'undefined') return;

    const data = bookingStore.getRoomAvailability(this.selectedDate);
    if (!data) return;

    // Update KPI card numbers
    const kpiTotal = document.getElementById('avail-kpi-total');
    const kpiAvail = document.getElementById('avail-kpi-available');
    const kpiOcc = document.getElementById('avail-kpi-occupied');
    const kpiPending = document.getElementById('avail-kpi-pending');

    const pendingCount = data.rooms.filter(item => (item.blocks || []).some(b => b.type === 'pending')).length;

    if (kpiTotal) kpiTotal.innerText = data.summary.totalRooms;
    if (kpiAvail) kpiAvail.innerText = data.summary.available;
    if (kpiOcc) kpiOcc.innerText = data.summary.occupied;
    if (kpiPending) kpiPending.innerText = pendingCount;

    // Filter rooms based on active criteria
    let filteredRooms = data.rooms.filter(item => {
      const room = item.room;
      // 1. Search Query (English & Khmer)
      if (this.searchTerm) {
        const q = this.searchTerm;
        const nameMatch = (room.name || '').toLowerCase().includes(q);
        const descMatch = (room.description || '').toLowerCase().includes(q);
        const floorMatch = (room.floor || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !floorMatch) return false;
      }

      // 2. Room Type Filter
      if (this.roomTypeFilter === 'shared' && room.isPrivate) return false;
      if (this.roomTypeFilter === 'private' && !room.isPrivate) return false;

      // 3. Floor Filter
      if (this.floorFilter !== 'all' && room.floor !== this.floorFilter) return false;

      // 4. Status Filter
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'available' && item.overallStatus !== 'available') return false;
        if (this.statusFilter === 'occupied' && item.overallStatus !== 'occupied') return false;
        if (this.statusFilter === 'pending') {
          const hasPending = item.blocks.some(b => b.type === 'pending');
          if (!hasPending) return false;
        }
      }

      return true;
    });

    const tbody = document.getElementById('avail-timeline-tbody');
    if (!tbody) return;

    if (filteredRooms.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-12 px-4 text-center">
            <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center mb-2">
              <span class="iconify text-xl text-stone-400" data-icon="lucide:door-closed" data-stroke-width="1.8"></span>
            </div>
            <h4 class="text-sm font-heading font-bold text-stone-900">No Rooms Found</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed mt-1">No meeting rooms match your active filters or selected date.</p>
            <div class="flex items-center justify-center gap-2 pt-3">
              <button type="button" onclick="app.resetAvailabilityFilters()" class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center space-x-1.5">
                <span class="iconify text-xs text-[#78716C]" data-icon="lucide:rotate-ccw" data-stroke-width="1.8"></span>
                <span>Reset Filters</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filteredRooms.forEach((item, idx) => {
      const room = item.room;
      const isPrivate = !!room.isPrivate;
      const blocks = item.blocks || [];

      // Render room type column with exact Lucide stroke icons
      const typeHtml = isPrivate
        ? `<span class="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-800">
             <span class="iconify text-sm text-[#991B1B] shrink-0" data-icon="lucide:lock" data-stroke-width="2"></span>
             <span>Private Room</span>
           </span>`
        : `<span class="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-800">
             <span class="iconify text-sm text-emerald-600 shrink-0" data-icon="lucide:globe" data-stroke-width="2"></span>
             <span>Shared Room</span>
           </span>`;

      // Render Timeline cells & blocks
      let timelineContentHtml = '';

      if (blocks.length === 0) {
        // 100% Available All Day
        timelineContentHtml = `
          <div class="absolute inset-x-2 top-2 bottom-2 bg-[#D1FAE5]/85 text-emerald-950 border border-emerald-300/80 rounded-md flex items-center justify-center text-xs font-medium tracking-wide shadow-2xs select-none">
            Available all day
          </div>
        `;
      } else {
        // One or more scheduled bookings
        blocks.forEach(b => {
          const startMins = this._timeToMinutes(b.startTime);
          const endMins = this._timeToMinutes(b.endTime);

          const leftPercent = Math.max(0, Math.min(100, ((startMins - (this.timelineStartHour * 60)) / this.timelineTotalMinutes) * 100));
          const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((endMins - startMins) / this.timelineTotalMinutes) * 100));

          let bgClass = 'bg-[#EF4444] text-white hover:bg-red-600 border border-red-600';
          if (b.type === 'pending') {
            bgClass = 'bg-[#FBBF24] text-amber-950 hover:bg-amber-400 border border-amber-500';
          }

          timelineContentHtml += `
            <div 
              onclick="app.openAvailabilitySlotModal('${b.id}', '${room.id}')"
              style="left: ${leftPercent.toFixed(2)}%; width: ${widthPercent.toFixed(2)}%;"
              class="absolute top-2 bottom-2 ${bgClass} rounded-md flex items-center justify-center text-[11px] font-bold shadow-2xs cursor-pointer transition-all duration-150 active:scale-[0.98] z-10 px-1 truncate"
              title="${b.title} (${b.startTime} - ${b.endTime})"
            >
              <span class="truncate">${b.startTime} - ${b.endTime}</span>
            </div>
          `;
        });
      }

      rowsHtml += `
        <tr class="hover:bg-stone-50/50 transition-colors">
          <!-- # -->
          <td class="py-4 px-3 text-center text-stone-400 font-mono font-medium">${item.index}</td>
          
          <!-- Room Name -->
          <td class="py-4 px-3">
            <div 
              onclick="app.openRoomDetailsModal('${room.id}')" 
              class="group cursor-pointer inline-block text-left select-none"
              title="Click to view details for ${room.name}"
            >
              <div class="font-heading font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#991B1B] transition-colors duration-150 leading-snug">
                <span class="group-hover:underline underline-offset-2">${room.name}</span>
              </div>
              <div class="text-[11px] text-stone-400 font-medium group-hover:text-stone-600 transition-colors">
                ${room.floor ? room.floor.split('(')[0].trim() : ''}
              </div>
            </div>
          </td>

          <!-- Room Type -->
          <td class="py-4 px-3 whitespace-nowrap">
            ${typeHtml}
          </td>

          <!-- Timeline Track -->
          <td class="py-3.5 px-2">
            <div class="relative w-full h-11 bg-stone-50/40 rounded-lg border border-stone-100 overflow-hidden flex items-center">
              <!-- 11 Column Hour Grid Guide Lines (07:00 - 18:00) -->
              <div class="absolute inset-0 grid grid-cols-11 pointer-events-none">
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div class="border-r border-stone-200/60"></div>
                <div></div>
              </div>

              <!-- Content Blocks -->
              ${timelineContentHtml}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }

  _timeToMinutes(timeStr) {
    if (!timeStr) return 420;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10) || 7;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  openAvailabilitySlotModal(slotId, roomId) {
    if (typeof bookingStore === 'undefined') return;

    const room = bookingStore.getRoomById(roomId);
    if (!room) return;

    // Check if slotId matches a request
    const req = bookingStore.getRequestById(slotId);
    if (!req) return;

    const container = document.getElementById('avail-slot-modal-container');
    if (!container) return;

    // Booking Request Detail
    const isConfirmed = req.status.includes('Approved') || req.status === 'Confirmed' || req.statusDisplay === 'Approved';
    const statusBadgeClass = isConfirmed
      ? 'bg-red-100 text-red-900 border border-red-300'
      : 'bg-amber-100 text-amber-900 border border-amber-300';
    const statusText = isConfirmed ? 'Occupied (Approved)' : 'Pending Review';

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E9E3DD] overflow-hidden">
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-[#E9E3DD] flex items-center justify-between bg-stone-50/50">
            <div class="flex items-center space-x-2.5">
              <span class="font-mono font-bold text-xs text-[#991B1B] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                ${req.id}
              </span>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${statusBadgeClass}">
                ${statusText}
              </span>
            </div>
            <button onclick="app.closeAvailabilitySlotModal()" class="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer">
              <span class="iconify text-lg" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-4 sm:p-5 space-y-4 text-xs">
            <div>
              <h3 class="font-heading font-bold text-stone-900 text-base leading-snug">${req.meetingTitle || 'Meeting Session'}</h3>
              <p class="text-xs text-stone-500 mt-0.5">${room.name} • ${room.floor ? room.floor.split('(')[0].trim() : ''}</p>
            </div>

            <!-- Schedule Card -->
            <div class="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="iconify text-base text-[#D97706]" data-icon="lucide:calendar" data-stroke-width="2"></span>
                <span class="font-medium text-stone-700">${req.date || this.selectedDate}</span>
              </div>
              <div class="flex items-center space-x-2 font-mono font-semibold text-stone-900">
                <span class="iconify text-base text-[#D97706]" data-icon="lucide:clock" data-stroke-width="2"></span>
                <span>${req.startTime} – ${req.endTime}</span>
              </div>
            </div>

            <!-- Requester Details -->
            <div class="flex items-center space-x-3 p-3 rounded-xl border border-stone-100">
              <img src="${req.requester?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="w-10 h-10 rounded-full object-cover border border-[#E9E3DD]" alt="Requester" />
              <div>
                <div class="font-semibold text-stone-900 text-xs">${req.requester?.name || 'NBC Staff'}</div>
                <div class="text-[11px] text-stone-500">${req.requester?.department || 'National Bank of Cambodia'}</div>
                <div class="text-[10px] text-stone-400 mt-0.5">Expected Attendees: <strong>${req.attendees || 8}</strong></div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="p-3.5 sm:p-4 bg-stone-50 border-t border-[#E9E3DD] flex items-center justify-between gap-2">
            <button onclick="app.closeAvailabilitySlotModal()" class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
              Close
            </button>
            <button 
              onclick="app.closeAvailabilitySlotModal(); app.openPitikaReviewWorkspace('${req.id}');" 
              class="btn-primary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span class="iconify text-xs text-white" data-icon="lucide:eye" data-stroke-width="2"></span>
              <span class="text-white">View in Review Workspace</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  closeAvailabilitySlotModal() {
    const container = document.getElementById('avail-slot-modal-container');
    if (container) container.innerHTML = '';
  }

  openRoomDetailsModal(roomId) {
    if (typeof bookingStore === 'undefined') return;
    const room = bookingStore.getRoomById(roomId);
    if (!room) return;

    this.activeDetailsRoomId = roomId;
    this.activeDetailsTab = 'overview';
    this.activeDetailsImageIndex = 0;

    window.removeEventListener('keydown', this._handleDetailsModalKeyDown);
    window.addEventListener('keydown', this._handleDetailsModalKeyDown);

    this._renderRoomDetailsModal();
  }

  closeRoomDetailsModal() {
    window.removeEventListener('keydown', this._handleDetailsModalKeyDown);
    this.activeDetailsRoomId = null;
    const container = document.getElementById('avail-room-details-modal-container');
    if (container) container.innerHTML = '';
  }

  switchRoomDetailsTab(tab) {
    if (!this.activeDetailsRoomId || typeof bookingStore === 'undefined') return;
    const room = bookingStore.getRoomById(this.activeDetailsRoomId);
    if (!room) return;

    this.activeDetailsTab = tab;

    const tabs = ['overview', 'schedule', 'amenities', 'more'];
    tabs.forEach(t => {
      const btn = document.getElementById(`room-tab-btn-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = 'pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap text-[#991B1B] border-b-2 border-[#991B1B]';
        } else {
          btn.className = 'pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap text-stone-500 hover:text-stone-800 border-b-2 border-transparent';
        }
      }
    });

    const contentPanel = document.getElementById('room-details-tab-content');
    if (contentPanel) {
      contentPanel.innerHTML = this._getTabContentHtml(tab, room);
      if (window.Iconify && window.Iconify.scan) {
        window.Iconify.scan(contentPanel);
      }
    }
  }

  setRoomDetailsImageIndex(idx) {
    if (!this.activeDetailsRoomId || typeof bookingStore === 'undefined') return;
    const room = bookingStore.getRoomById(this.activeDetailsRoomId);
    if (!room) return;
    const rawImages = (room.images && room.images.length > 0) ? room.images : (room.image ? [room.image] : ['assets/rooms/boardroom-alpha.jpg']);
    const images = rawImages.slice(0, 5);

    this.activeDetailsImageIndex = idx;
    this._updateRoomDetailsImage(images);
  }

  navigateRoomDetailsImage(dir) {
    if (!this.activeDetailsRoomId || typeof bookingStore === 'undefined') return;
    const room = bookingStore.getRoomById(this.activeDetailsRoomId);
    if (!room) return;
    const rawImages = (room.images && room.images.length > 0) ? room.images : (room.image ? [room.image] : ['assets/rooms/boardroom-alpha.jpg']);
    const images = rawImages.slice(0, 5);
    const total = images.length;
    let nextIdx = (this.activeDetailsImageIndex + dir) % total;
    if (nextIdx < 0) nextIdx = total - 1;

    this.activeDetailsImageIndex = nextIdx;
    this._updateRoomDetailsImage(images);
  }

  _updateRoomDetailsImage(images) {
    const currentImgIdx = Math.max(0, Math.min(images.length - 1, this.activeDetailsImageIndex || 0));
    const mainImg = document.getElementById('room-details-main-img');
    if (mainImg) {
      mainImg.src = images[currentImgIdx];
    }

    const thumbContainer = document.getElementById('room-details-thumbnails');
    if (thumbContainer) {
      const thumbBtns = thumbContainer.querySelectorAll('button');
      thumbBtns.forEach((btn, idx) => {
        if (idx === currentImgIdx) {
          btn.className = 'w-14 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer border-[#991B1B] shadow-xs opacity-100';
        } else {
          btn.className = 'w-14 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer border-transparent opacity-65 hover:opacity-100';
        }
      });
    }

    const dotsContainer = document.getElementById('room-details-dots');
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('span');
      dots.forEach((dot, idx) => {
        if (idx === currentImgIdx) {
          dot.className = 'w-3 h-1.5 rounded-full transition-all bg-white shadow-xs';
        } else {
          dot.className = 'w-1.5 h-1.5 rounded-full transition-all bg-white/60';
        }
      });
    }
  }

  _getTabContentHtml(tab, room) {
    const nameParts = (room.name || '').split(' - ');
    const khmerName = nameParts[0] ? nameParts[0].trim() : room.name;
    const englishName = nameParts[1] ? nameParts[1].trim() : (room.subtitle || room.name);
    const floorShort = room.floor ? room.floor.split('(')[0].trim() : 'Floor 18';
    const buildingName = (room.location && room.location.includes('Headquarters')) 
      ? 'Main Building' 
      : (room.location ? room.location.replace('National Bank of Cambodia - ', '') : 'Main Building');
    const fullLocation = `${buildingName}, ${floorShort}`;
    const isPrivate = !!room.isPrivate;

    // Schedule blocks for today
    const availabilityData = (typeof bookingStore !== 'undefined') ? bookingStore.getRoomAvailability(this.selectedDate) : null;
    const roomScheduleItem = availabilityData?.rooms?.find(item => item.room.id === room.id);
    const todayBlocks = roomScheduleItem?.blocks || [];

    if (tab === 'schedule') {
      if (todayBlocks.length === 0) {
        return `
          <div class="p-6 text-center bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <span class="iconify text-3xl text-emerald-600 mx-auto mb-2" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
            <p class="font-heading font-bold text-sm text-emerald-950">Available All Day</p>
            <p class="text-xs text-emerald-700 mt-1">No meetings are scheduled for ${this.selectedDate}.</p>
          </div>
        `;
      }
      return `
        <div class="space-y-2">
          <div class="text-[11px] text-stone-400 font-medium mb-1">Scheduled sessions for ${this.selectedDate}:</div>
          ${todayBlocks.map(b => `
            <div class="p-3 bg-stone-50/80 rounded-xl border border-[#E9E3DD] flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="font-mono text-xs font-bold text-stone-800 bg-white px-2 py-1 rounded border border-[#E9E3DD]">
                  ${b.startTime} – ${b.endTime}
                </div>
                <div>
                  <div class="font-heading font-bold text-xs text-stone-900">${b.title}</div>
                  <div class="text-[11px] text-stone-500 mt-0.5">${b.requester || 'NBC Staff'} • ${b.department || 'National Bank of Cambodia'}</div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${b.type === 'occupied' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                ${b.statusDisplay || (b.type === 'occupied' ? 'Occupied' : 'Pending Approval')}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'amenities') {
      const features = (room.features && room.features.length > 0) ? room.features : [
        'Dual 4K Ultra HD Display Screens',
        'Wireless Screen Sharing & Presentation',
        'High-Definition Video Conferencing Array',
        'Dedicated High-Speed Wi-Fi',
        'Executive Ergonomic Seating',
        'Dedicated Refreshment Service'
      ];
      return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${features.map(feat => `
            <div class="flex items-center space-x-2.5 p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
              <span class="iconify text-sm text-emerald-600 shrink-0" data-icon="lucide:check-circle" data-stroke-width="2"></span>
              <span class="text-xs font-semibold text-stone-800">${feat}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'more') {
      return `
        <div class="space-y-3.5 text-xs">
          <div class="flex items-start">
            <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
              <span class="iconify text-sm text-stone-400" data-icon="lucide:building-2" data-stroke-width="2"></span>
              <span>Department</span>
            </div>
            <div class="font-semibold text-stone-800">${room.department || 'Board of Directors & Cabinet'}</div>
          </div>
          <div class="flex items-start">
            <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
              <span class="iconify text-sm text-stone-400" data-icon="lucide:map" data-stroke-width="2"></span>
              <span>Branch / Province</span>
            </div>
            <div class="font-semibold text-stone-800">${room.province || 'Phnom Penh'} (${room.location || 'Headquarters'})</div>
          </div>
          <div class="flex items-start">
            <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
              <span class="iconify text-sm text-stone-400" data-icon="lucide:maximize-2" data-stroke-width="2"></span>
              <span>Room Dimensions</span>
            </div>
            <div class="font-semibold text-stone-800">${room.size || '95 sq m'}</div>
          </div>
          <div class="flex items-start">
            <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
              <span class="iconify text-sm text-stone-400" data-icon="lucide:user-check" data-stroke-width="2"></span>
              <span>Room Ownership</span>
            </div>
            <div class="font-semibold text-stone-800">${room.roomOwner ? `${room.roomOwner.name} (${room.roomOwner.title})` : 'General Banking Staff / Shared Access'}</div>
          </div>
        </div>
      `;
    }

    // Default: 'overview'
    return `
      <div class="space-y-3.5 text-xs">
        <div class="flex items-start">
          <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
            <span class="iconify text-sm text-stone-400" data-icon="lucide:landmark" data-stroke-width="2"></span>
            <span>Room Name (Khmer)</span>
          </div>
          <div class="font-bold text-stone-900">${khmerName}</div>
        </div>
        <div class="flex items-start">
          <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
            <span class="iconify text-sm text-stone-400" data-icon="lucide:type" data-stroke-width="2"></span>
            <span>Room Name (English)</span>
          </div>
          <div class="font-semibold text-stone-800">${englishName}</div>
        </div>
        <div class="flex items-start">
          <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
            <span class="iconify text-sm text-stone-400" data-icon="lucide:map-pin" data-stroke-width="2"></span>
            <span>Building Location</span>
          </div>
          <div class="font-semibold text-stone-800">${fullLocation}</div>
        </div>
        <div class="flex items-start">
          <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
            <span class="iconify text-sm text-stone-400" data-icon="lucide:shield-check" data-stroke-width="2"></span>
            <span>Room Type</span>
          </div>
          <div class="font-semibold text-stone-800">${isPrivate ? 'Private Room' : 'Shared Room'}</div>
        </div>
        <div class="flex items-start">
          <div class="w-40 sm:w-44 flex items-center space-x-2 text-stone-500 font-medium shrink-0">
            <span class="iconify text-sm text-stone-400" data-icon="lucide:file-text" data-stroke-width="2"></span>
            <span>Description</span>
          </div>
          <div class="text-stone-600 leading-relaxed max-w-xl">${room.description || 'Executive meeting room with premium facilities. Suitable for management meetings and confidential discussions.'}</div>
        </div>
      </div>
    `;
  }

  _renderRoomDetailsModal() {
    const container = document.getElementById('avail-room-details-modal-container');
    if (!container || !this.activeDetailsRoomId || typeof bookingStore === 'undefined') return;

    const room = bookingStore.getRoomById(this.activeDetailsRoomId);
    if (!room) return;

    // Parse Names & Location
    const nameParts = (room.name || '').split(' - ');
    const khmerName = nameParts[0] ? nameParts[0].trim() : room.name;
    const englishName = nameParts[1] ? nameParts[1].trim() : (room.subtitle || room.name);
    const floorShort = room.floor ? room.floor.split('(')[0].trim() : 'Floor 18';

    // Images
    const rawImages = (room.images && room.images.length > 0) ? room.images : (room.image ? [room.image] : ['assets/rooms/boardroom-alpha.jpg']);
    const images = rawImages.slice(0, 5);
    const currentImgIdx = Math.max(0, Math.min(images.length - 1, this.activeDetailsImageIndex || 0));
    const currentImgSrc = images[currentImgIdx];

    // Room Type badge styling
    const isPrivate = !!room.isPrivate;
    const typeBadgeHtml = isPrivate
      ? `<span class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#991B1B] border border-red-200">
           <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:lock" data-stroke-width="2"></span>
           <span>Private Room</span>
         </span>`
      : `<span class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
           <span class="iconify text-xs text-emerald-600" data-icon="lucide:globe" data-stroke-width="2"></span>
           <span>Shared Room</span>
         </span>`;

    container.innerHTML = `
      <div 
        onclick="app.closeRoomDetailsModal()" 
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      >
        <div 
          onclick="event.stopPropagation()" 
          class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E9E3DD] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        >
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-[#E9E3DD] flex items-center justify-between shrink-0">
            <h3 class="font-heading font-bold text-base sm:text-lg text-stone-900">Room Details</h3>
            <button 
              type="button" 
              onclick="app.closeRoomDetailsModal()" 
              class="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <span class="iconify text-lg" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="overflow-y-auto flex-1">
            <!-- Top Section: Image Carousel + Room Key Info -->
            <div class="p-4 sm:p-5 border-b border-[#E9E3DD]">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                
                <!-- Left: Image Carousel & Thumbnails -->
                <div>
                  <div class="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100 group">
                    <img 
                      id="room-details-main-img"
                      src="${currentImgSrc}" 
                      alt="${room.name}" 
                      class="w-full h-full object-cover transition-all duration-200" 
                    />
                    
                    ${images.length > 1 ? `
                      <!-- Nav Chevrons -->
                      <button 
                        type="button" 
                        onclick="app.navigateRoomDetailsImage(-1)" 
                        class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-stone-700 shadow-sm flex items-center justify-center cursor-pointer transition active:scale-95"
                        title="Previous image"
                      >
                        <span class="iconify text-sm" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
                      </button>
                      <button 
                        type="button" 
                        onclick="app.navigateRoomDetailsImage(1)" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-stone-700 shadow-sm flex items-center justify-center cursor-pointer transition active:scale-95"
                        title="Next image"
                      >
                        <span class="iconify text-sm" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
                      </button>
                      <!-- Dots Indicator -->
                      <div id="room-details-dots" class="absolute bottom-2 inset-x-0 flex items-center justify-center space-x-1.5 pointer-events-none">
                        ${images.map((_, idx) => `
                          <span class="${idx === currentImgIdx ? 'w-3 h-1.5 rounded-full transition-all bg-white shadow-xs' : 'w-1.5 h-1.5 rounded-full transition-all bg-white/60'}"></span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Thumbnails row -->
                  ${images.length > 1 ? `
                    <div id="room-details-thumbnails" class="flex items-center space-x-2 mt-2.5">
                      ${images.slice(0, 3).map((imgUrl, idx) => `
                        <button 
                          type="button" 
                          onclick="app.setRoomDetailsImageIndex(${idx})"
                          class="w-14 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${idx === currentImgIdx ? 'border-[#991B1B] shadow-xs opacity-100' : 'border-transparent opacity-65 hover:opacity-100'}"
                        >
                          <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" />
                        </button>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>

                <!-- Right: Room Header & Capacity Stat Card -->
                <div>
                  ${typeBadgeHtml}
                  <h2 class="font-heading font-bold text-xl sm:text-2xl text-stone-900 mt-2 leading-tight">${khmerName}</h2>
                  <p class="font-medium text-sm sm:text-base text-stone-600 mt-0.5">${englishName}</p>
                  
                  <div class="inline-flex items-center space-x-1.5 text-xs text-stone-500 font-medium mt-1.5">
                    <span class="iconify text-sm text-stone-400" data-icon="lucide:landmark" data-stroke-width="2"></span>
                    <span>${floorShort}</span>
                  </div>

                  <!-- Capacity Stat Card -->
                  <div class="mt-4">
                    <div class="bg-[#FAF7F4] px-4 py-3 rounded-2xl border border-[#E9E3DD]">
                      <div class="flex items-center space-x-1.5 text-xs text-stone-500 font-medium">
                        <span class="iconify text-sm text-stone-400" data-icon="lucide:users" data-stroke-width="2"></span>
                        <span>Capacity</span>
                      </div>
                      <div class="font-heading font-bold text-base text-stone-900 mt-1">${room.capacity} people</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Tabs Nav -->
            <div class="px-4 sm:px-5 border-b border-[#E9E3DD] flex items-center space-x-6 text-xs font-semibold overflow-x-auto">
              <button 
                type="button" 
                id="room-tab-btn-overview"
                onclick="app.switchRoomDetailsTab('overview')" 
                class="pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap ${this.activeDetailsTab === 'overview' ? 'text-[#991B1B] border-b-2 border-[#991B1B]' : 'text-stone-500 hover:text-stone-800 border-b-2 border-transparent'}"
              >
                Overview
              </button>
              <button 
                type="button" 
                id="room-tab-btn-schedule"
                onclick="app.switchRoomDetailsTab('schedule')" 
                class="pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap ${this.activeDetailsTab === 'schedule' ? 'text-[#991B1B] border-b-2 border-[#991B1B]' : 'text-stone-500 hover:text-stone-800 border-b-2 border-transparent'}"
              >
                Today's Schedule
              </button>
              <button 
                type="button" 
                id="room-tab-btn-amenities"
                onclick="app.switchRoomDetailsTab('amenities')" 
                class="pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap ${this.activeDetailsTab === 'amenities' ? 'text-[#991B1B] border-b-2 border-[#991B1B]' : 'text-stone-500 hover:text-stone-800 border-b-2 border-transparent'}"
              >
                Amenities
              </button>
              <button 
                type="button" 
                id="room-tab-btn-more"
                onclick="app.switchRoomDetailsTab('more')" 
                class="pb-2.5 pt-3 transition-colors cursor-pointer whitespace-nowrap ${this.activeDetailsTab === 'more' ? 'text-[#991B1B] border-b-2 border-[#991B1B]' : 'text-stone-500 hover:text-stone-800 border-b-2 border-transparent'}"
              >
                More Info
              </button>
            </div>

            <!-- Tab Content Panel (Static Fixed Height to prevent modal frame jumping) -->
            <div id="room-details-tab-content" class="p-4 sm:p-5 h-[230px] overflow-y-auto" style="scrollbar-width: none;">
              ${this._getTabContentHtml(this.activeDetailsTab, room)}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-3 sm:p-4 bg-[#FAF7F4] border-t border-[#E9E3DD] flex items-center justify-end space-x-2 shrink-0">
            <button 
              type="button" 
              onclick="app.closeRoomDetailsModal()" 
              class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
            >
              Close
            </button>
            <button 
              type="button" 
              onclick="app.switchRoomDetailsTab('schedule')" 
              class="btn-primary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs flex items-center space-x-1.5 cursor-pointer active:scale-[0.98] transition"
            >
              <span class="iconify text-xs text-white" data-icon="lucide:calendar" data-stroke-width="2"></span>
              <span class="text-white">View Today's Schedule</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.Iconify && window.Iconify.scan) {
      window.Iconify.scan(container);
    }
  }
}

window.NBC.views['room-availability'] = new RoomAvailabilityView();
