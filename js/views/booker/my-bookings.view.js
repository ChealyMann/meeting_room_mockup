// My Bookings View Component (view-my-bookings)
// TypeUI Cafe Design System with NBC Crimson Heritage
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class MyBookingsView {
  constructor() {
    this.id = 'my-bookings';
    this.myBookingsFilter = 'all'; // 'all', 'confirmed', 'pending', 'cancelled', 'rejected'
    this.myBookingsViewMode = 'cards'; // Cards view only
    this.myBookingsSearchTerm = '';
    this.myBookingsDateFilter = '';
    this.myBookingsRoomFilter = 'all';
    this.myBookingsSortColumn = 'id';
    this.myBookingsSortDirection = 'desc';
    this.myBookingsCurrentPage = 0;
    this.myBookingsLoadedBatches = 1;
    this.myBookingsBatchSize = 4;
    this.myBookingsIsLoadingMore = false;
    this.myBookingsAutoScrollEnabled = true;
    this._cardsIntersectionObserver = null;
    this._currentPaginatedItems = [];
    this._pendingCancelTarget = null; // null or requestId
    this._doorPasscodeRequestId = null;
    this._doorPasscodeRevealed = false;

    this.template = `
      <style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes myCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-fade-in {
          animation: myCardFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .my-bookings-cards-grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.875rem !important;
          width: 100% !important;
        }
        .my-bookings-cards-grid.hidden {
          display: none !important;
        }
        @media (min-width: 1400px) {
          .my-bookings-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      </style>

      <!-- Executive Header -->
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#E9E3DD]">
        <div>
          <h2 class="font-heading font-bold text-xl text-stone-900 leading-tight">My Bookings</h2>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <!-- Reset Filters Button -->
          <button id="my-reset-btn" onclick="app.resetMyBookingsFilters()" title="Reset all filters" class="btn-secondary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs shrink-0">
            <span class="iconify text-xs" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset Filters</span>
          </button>

          <!-- Primary Book Room Action -->
          <button onclick="app.navigateTo('book-room')" aria-label="Book a meeting room" class="btn-primary min-h-[34px] h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer transition active:scale-[0.98]">
            <span class="iconify text-xs text-white" data-icon="lucide:calendar-plus" data-stroke-width="2"></span>
            <span class="text-white">+ Book Room</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Overview Strip (Interactive Filter Shortcuts) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-[#E9E3DD]">
        <!-- Metric 1: Confirmed Bookings -->
        <div onclick="app.filterMyBookingsStatus('confirmed')" title="Filter by Confirmed" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-emerald-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-emerald-600" data-icon="lucide:calendar-check-2" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Confirmed</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="my-kpi-confirmed" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Ready</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Pending Review -->
        <div onclick="app.filterMyBookingsStatus('pending')" title="Filter by Pending Review" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-amber-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-amber-600" data-icon="lucide:clock" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">In Review</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="my-kpi-pending" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Pending</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Cancelled / Rejected -->
        <div onclick="app.filterMyBookingsStatus('cancelled')" title="Filter by Cancelled / Rejected" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-rose-400 hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-rose-600" data-icon="lucide:ban" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">Not Active</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="my-kpi-cancelled" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Cancelled</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: Total Bookings -->
        <div onclick="app.resetMyBookingsFilters()" title="Reset all filters to view all bookings" class="bg-white px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E9E3DD] hover:border-[#991B1B] hover:shadow-xs transition flex items-center space-x-3 shadow-2xs cursor-pointer select-none">
          <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <span class="iconify text-base text-[#991B1B]" data-icon="lucide:calendar" data-stroke-width="2"></span>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider block leading-none mb-1">All Bookings</span>
            <div class="flex items-baseline space-x-1.5">
              <span id="my-kpi-total" class="text-lg sm:text-xl font-bold font-mono text-stone-900 leading-none">0</span>
              <span class="text-xs text-stone-500 truncate">Total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Filter Bar (Single-Row Streamlined Layout) -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 w-full">
        <!-- Search Filter (Shortened to 4/12 columns) -->
        <div class="sm:col-span-4 relative">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:search" data-stroke-width="2"></span>
          <input type="text" id="my-search-input" oninput="app.handleMyBookingsFilterChange()" placeholder="Search by title, ID, purpose..." class="bank-input pl-8 pr-7 py-1.5 text-xs w-full bg-white transition border border-[#E9E3DD] rounded-lg shadow-2xs focus:border-[#991B1B]" />
          <button id="my-search-clear" onclick="app.clearMyBookingsSearch()" title="Clear search" class="hidden absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#991B1B] p-0.5 rounded transition cursor-pointer">
            <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>
        </div>

        <!-- Room Filter (3/12 columns) -->
        <div class="relative sm:col-span-3">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:map-pin" data-stroke-width="2"></span>
          <select id="my-room-filter" onchange="app.handleMyBookingsFilterChange()" aria-label="Filter by meeting room" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs truncate">
            <option value="all">All Meeting Rooms</option>
          </select>
        </div>

        <!-- Date Filter (Enlarged to 3/12 columns) -->
        <div class="relative sm:col-span-3">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:calendar" data-stroke-width="2"></span>
          <input type="date" id="my-date-filter" oninput="app.handleMyBookingsFilterChange()" onchange="app.handleMyBookingsFilterChange()" class="bank-input pl-8 pr-2.5 py-1.5 text-xs w-full bg-white transition cursor-pointer font-medium border border-[#E9E3DD] rounded-lg shadow-2xs text-stone-700" />
        </div>

        <!-- Status Filter (2/12 columns) -->
        <div class="relative sm:col-span-2">
          <span class="iconify absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none" data-icon="lucide:filter" data-stroke-width="2"></span>
          <select id="my-status-filter" onchange="app.handleMyBookingsFilterChange()" aria-label="Filter by status" class="bank-input pl-8 pr-6 py-1.5 text-xs w-full bg-white transition cursor-pointer border border-[#E9E3DD] rounded-lg shadow-2xs">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Review</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Bookings Content (Table or Cards rendered dynamically) -->
      <div id="requester-bookings-list" class="flex flex-col flex-1 min-h-0 mt-2.5">
        <!-- Populated dynamically -->
      </div>

      <!-- Custom In-App Modal for Cancelling Booking (No native prompt blocker) -->
      <div id="my-bookings-cancel-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-150" onclick="app.closeMyBookingsCancelModal()">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-scale-up" onclick="event.stopPropagation()">
          <div class="px-5 py-4 flex items-center justify-between border-b border-[#E9E3DD] bg-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#DC2626] shrink-0">
                <span class="iconify text-base" data-icon="lucide:ban" data-stroke-width="2"></span>
              </div>
              <h3 id="my-cancel-modal-title" class="font-heading font-bold text-sm text-[#3E2B1E] leading-tight">Cancel Reservation</h3>
            </div>
            <button type="button" onclick="app.closeMyBookingsCancelModal()" aria-label="Close cancellation dialog" class="w-8 h-8 rounded-xl border border-transparent hover:border-[#E9E3DD] hover:bg-[#FAF7F4] text-stone-400 hover:text-[#3E2B1E] flex items-center justify-center transition cursor-pointer active:scale-95">
              <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <p id="my-cancel-modal-desc" class="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to cancel this meeting room reservation? Any booked catering or IT equipment setup for this session will be released.
            </p>
            <div class="flex items-center justify-end gap-2 pt-1">
              <button type="button" onclick="app.closeMyBookingsCancelModal()" class="btn-secondary h-9 px-4 rounded-xl border border-[#E9E3DD] text-xs font-semibold text-stone-700 hover:bg-[#FAF7F4] transition cursor-pointer active:scale-[0.98] select-none">
                Keep Booking
              </button>
              <button type="button" id="my-confirm-cancel-btn" onclick="app.confirmMyBookingsCancellation()" class="btn-primary h-9 px-4 rounded-xl border border-[#991B1B] text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white flex items-center gap-1.5 shadow-xs transition active:scale-[0.98] cursor-pointer">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                <span class="text-white">Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progressive disclosure for sensitive door credentials -->
      <div id="my-door-pass-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-150" onclick="app.closeDoorPasscodeModal()">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col animate-scale-up" onclick="event.stopPropagation()">
          <!-- Clean Warm Cafe Header (Zero heavy dark bars) -->
          <div class="px-5 py-4 flex items-center justify-between border-b border-[#E9E3DD] bg-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center text-[#991B1B] shrink-0">
                <span class="iconify text-base text-[#991B1B]" data-icon="lucide:key-round" data-stroke-width="2"></span>
              </div>
              <h3 class="font-heading font-bold text-sm text-[#3E2B1E] leading-tight">Door Access</h3>
            </div>
            <button type="button" onclick="app.closeDoorPasscodeModal()" aria-label="Close door access dialog" class="w-8 h-8 rounded-xl border border-transparent hover:border-[#E9E3DD] hover:bg-[#FAF7F4] text-stone-400 hover:text-[#3E2B1E] flex items-center justify-center transition cursor-pointer active:scale-95">
              <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          </div>

          <!-- Body Content -->
          <div class="p-5 space-y-3.5">
            <!-- Room & Validity Info Box -->
            <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="iconify text-xs text-[#991B1B] shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                <span id="my-door-pass-room" class="font-heading font-bold text-xs text-[#3E2B1E] truncate">Meeting room</span>
              </div>
              <div class="flex items-center gap-2 text-stone-500 pl-0.5">
                <span class="iconify text-[11px] text-stone-400 shrink-0" data-icon="lucide:clock" data-stroke-width="2"></span>
                <span id="my-door-pass-expiry" class="text-xs text-stone-500 font-medium truncate">Use this passcode at the room door.</span>
              </div>
            </div>

            <!-- Passcode Display Box -->
            <div class="p-3.5 bg-[#F5F2EE] rounded-xl border border-[#E9E3DD] flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1 pl-1">
                <span class="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">Keypad Passcode</span>
                <strong id="my-door-passcode-value" class="font-mono text-lg sm:text-xl font-bold tracking-wider text-[#991B1B] block whitespace-nowrap select-all leading-tight">••••••••</strong>
              </div>
              <button type="button" id="my-door-pass-reveal" onclick="app.toggleDoorPasscode()" class="btn-secondary h-9 px-3.5 rounded-xl border border-[#E9E3DD] text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none shadow-2xs hover:bg-white hover:border-stone-300">
                <span class="iconify text-sm text-stone-600 shrink-0" data-icon="lucide:eye" data-stroke-width="2"></span>
                <span class="leading-none text-stone-800">Reveal</span>
              </button>
            </div>

            <!-- Action Buttons Row -->
            <div class="pt-1 flex items-center gap-2">
              <button type="button" onclick="app.closeDoorPasscodeModal()" class="btn-secondary h-9 px-4 rounded-xl border border-[#E9E3DD] text-xs font-semibold text-stone-700 hover:bg-[#FAF7F4] transition cursor-pointer active:scale-[0.98] select-none">
                Close
              </button>
              <button type="button" onclick="app.copyDoorPasscode()" class="flex-1 btn-primary h-9 px-4 rounded-xl border border-[#991B1B] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none shadow-xs text-white">
                <span class="iconify text-sm text-white shrink-0" data-icon="lucide:copy" data-stroke-width="2"></span>
                <span class="text-white leading-none">Copy Passcode</span>
              </button>
            </div>
          </div>
        </div>
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
      <div id="view-my-bookings-content" class="w-full h-[calc(100dvh-150px)] flex flex-col space-y-2.5 min-h-0">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this._bindAppHandlers();
    this._populateRoomDropdown();

    const searchInput = document.getElementById('my-search-input');
    const clearBtn = document.getElementById('my-search-clear');
    if (searchInput && this.myBookingsSearchTerm) {
      searchInput.value = this.myBookingsSearchTerm;
      if (clearBtn) clearBtn.classList.remove('hidden');
    }

    const dateInput = document.getElementById('my-date-filter');
    if (dateInput && this.myBookingsDateFilter) {
      dateInput.value = this.myBookingsDateFilter;
    }

    const roomSelect = document.getElementById('my-room-filter');
    if (roomSelect && this.myBookingsRoomFilter) {
      roomSelect.value = this.myBookingsRoomFilter;
    }

    const statusSelect = document.getElementById('my-status-filter');
    if (statusSelect && this.myBookingsFilter) {
      statusSelect.value = this.myBookingsFilter;
    }

    this.renderRequesterBookings();
  }

  update() {
    this.renderRequesterBookings();
  }

  _bindAppHandlers() {
    if (!window.app) return;
    // Bind all necessary methods for HTML onclick handler safety
    window.app.setMyBookingsViewMode = (mode) => this.setMyBookingsViewMode(mode);
    window.app.handleMyBookingsFilterChange = () => this.handleMyBookingsFilterChange();
    window.app.clearMyBookingsSearch = () => this.clearMyBookingsSearch();
    window.app.resetMyBookingsFilters = () => this.resetMyBookingsFilters();
    window.app.filterMyBookingsStatus = (status) => this.filterMyBookingsStatus(status);
    window.app.filterMyBookings = (status) => this.filterMyBookingsStatus(status); // Backward compatibility
    window.app.goToMyBookingsPage = (page) => this.goToMyBookingsPage(page);
    window.app.sortMyBookingsBy = (col) => this.sortMyBookingsBy(col);
    window.app.loadNextCardsBatch = () => this.loadNextCardsBatch();
    window.app.scrollMyBookingsToTop = () => this.scrollMyBookingsToTop();
    window.app.openMyBookingsCancelModal = (id) => this.openMyBookingsCancelModal(id);
    window.app.closeMyBookingsCancelModal = () => this.closeMyBookingsCancelModal();
    window.app.confirmMyBookingsCancellation = () => this.confirmMyBookingsCancellation();
    window.app.handleCancelBooking = (id) => this.openMyBookingsCancelModal(id);
    window.app.copyReferenceCode = (code) => this.copyReferenceCode(code);
    window.app.downloadCalendarInvite = (id) => this.downloadCalendarInvite(id);
    window.app.openBookingDetailsPage = (id) => this.openBookingDetailsPage(id);
    window.app.openReceiptPage = (id, from) => this.openReceiptPage(id, from);
    window.app.openDoorPasscodeModal = (id) => this.openDoorPasscodeModal(id);
    window.app.closeDoorPasscodeModal = () => this.closeDoorPasscodeModal();
    window.app.toggleDoorPasscode = () => this.toggleDoorPasscode();
    window.app.copyDoorPasscode = () => this.copyDoorPasscode();
  }

  _formatFloorShort(floorStr) {
    if (!floorStr) return 'Ground Floor';
    const match = String(floorStr).match(/(?:Level|Floor)\s*(\d+)/i);
    if (match) return `Floor ${match[1]}`;
    if (/ground/i.test(floorStr)) return 'Ground Floor';
    return String(floorStr).split('(')[0].split('-')[0].trim().replace(/level/i, 'Floor');
  }

  _populateRoomDropdown() {
    const roomSelect = document.getElementById('my-room-filter');
    if (!roomSelect || typeof bookingStore === 'undefined') return;

    const rooms = bookingStore.getRooms ? bookingStore.getRooms() : [];
    let optionsHtml = '<option value="all">All Meeting Rooms</option>';
    rooms.forEach(room => {
      const shortName = room.name.split(' - ')[0];
      const floorShort = this._formatFloorShort(room.floor);
      optionsHtml += `<option value="${room.id}">${shortName} (${floorShort})</option>`;
    });
    roomSelect.innerHTML = optionsHtml;
  }

  setMyBookingsViewMode(mode) {
    this.myBookingsViewMode = 'cards';
    this.myBookingsLoadedBatches = 1;
    this.renderRequesterBookings();
  }

  handleMyBookingsFilterChange() {
    const searchInput = document.getElementById('my-search-input');
    const clearBtn = document.getElementById('my-search-clear');
    const dateInput = document.getElementById('my-date-filter');
    const roomSelect = document.getElementById('my-room-filter');
    const statusSelect = document.getElementById('my-status-filter');

    this.myBookingsSearchTerm = (searchInput?.value || '').trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !this.myBookingsSearchTerm);
    }

    this.myBookingsDateFilter = dateInput?.value || '';
    this.myBookingsRoomFilter = roomSelect?.value || 'all';
    this.myBookingsFilter = statusSelect?.value || 'all';

    this.myBookingsCurrentPage = 0;
    this.myBookingsLoadedBatches = 1;
    this.renderRequesterBookings();
    this.scrollMyBookingsToTop();
  }

  clearMyBookingsSearch() {
    const searchInput = document.getElementById('my-search-input');
    if (searchInput) searchInput.value = '';
    this.handleMyBookingsFilterChange();
    searchInput?.focus();
  }

  filterMyBookingsStatus(status) {
    this.myBookingsFilter = status;
    const statusSelect = document.getElementById('my-status-filter');
    if (statusSelect) {
      statusSelect.value = status;
    }
    this.myBookingsCurrentPage = 0;
    this.myBookingsLoadedBatches = 1;
    this.renderRequesterBookings();
    this.scrollMyBookingsToTop();
  }

  resetMyBookingsFilters() {
    this.myBookingsFilter = 'all';
    this.myBookingsSearchTerm = '';
    this.myBookingsDateFilter = '';
    this.myBookingsRoomFilter = 'all';

    const searchInput = document.getElementById('my-search-input');
    if (searchInput) searchInput.value = '';
    const dateInput = document.getElementById('my-date-filter');
    if (dateInput) dateInput.value = '';
    const roomSelect = document.getElementById('my-room-filter');
    if (roomSelect) roomSelect.value = 'all';
    const statusSelect = document.getElementById('my-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    const clearBtn = document.getElementById('my-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.myBookingsCurrentPage = 0;
    this.myBookingsLoadedBatches = 1;
    this.renderRequesterBookings();
    this.scrollMyBookingsToTop();
  }

  goToMyBookingsPage(page) {
    // No-op (table pagination removed)
  }

  sortMyBookingsBy(column) {
    if (this.myBookingsSortColumn === column) {
      this.myBookingsSortDirection = this.myBookingsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.myBookingsSortColumn = column;
      this.myBookingsSortDirection = (column === 'id' || column === 'schedule') ? 'desc' : 'asc';
    }
    this.myBookingsCurrentPage = 0;
    this.myBookingsLoadedBatches = 1;
    this.renderRequesterBookings();
    this.scrollMyBookingsToTop();
  }

  openMyBookingsCancelModal(requestId) {
    this._pendingCancelTarget = requestId;
    const modal = document.getElementById('my-bookings-cancel-modal');
    const title = document.getElementById('my-cancel-modal-title');
    const desc = document.getElementById('my-cancel-modal-desc');

    if (!modal) return;
    if (title) title.innerText = `Cancel Reservation ${requestId}`;
    if (desc) desc.innerText = `Are you sure you want to cancel meeting room booking #${requestId}? Any booked catering or IT equipment setup for this session will be released.`;

    modal.classList.remove('hidden');
  }

  closeMyBookingsCancelModal() {
    const modal = document.getElementById('my-bookings-cancel-modal');
    if (modal) modal.classList.add('hidden');
    this._pendingCancelTarget = null;
  }

  openDoorPasscodeModal(requestId) {
    const req = bookingStore.getRequestById(requestId);
    const modal = document.getElementById('my-door-pass-modal');
    if (!req || !modal) return;

    const access = bookingStore.getDoorAccessState
      ? bookingStore.getDoorAccessState(req)
      : { code: req.doorPasscode || req.referenceCode, isExpired: false };
    const room = req.room?.name || 'Meeting room';
    const roomEl = document.getElementById('my-door-pass-room');
    const expiryEl = document.getElementById('my-door-pass-expiry');
    if (roomEl) roomEl.textContent = room;
    if (expiryEl) {
      expiryEl.textContent = access.isExpired
        ? 'This passcode expired after the scheduled meeting.'
        : `Valid until ${access.expiresAt ? new Date(access.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'the booking ends'}.`;
    }

    this._doorPasscodeRequestId = requestId;
    this._doorPasscodeRevealed = false;
    this._updateDoorPasscodeModal(access);
    modal.classList.remove('hidden');
  }

  _updateDoorPasscodeModal(access = null) {
    const req = bookingStore.getRequestById(this._doorPasscodeRequestId);
    const state = access || (bookingStore.getDoorAccessState
      ? bookingStore.getDoorAccessState(req)
      : { code: req?.doorPasscode || req?.referenceCode, isExpired: false });
    const valueEl = document.getElementById('my-door-passcode-value');
    const revealBtn = document.getElementById('my-door-pass-reveal');
    if (valueEl) valueEl.textContent = state.isExpired ? 'Expired' : (this._doorPasscodeRevealed ? state.code : '••••••••');
    if (revealBtn) {
      revealBtn.disabled = state.isExpired;
      revealBtn.classList.toggle('opacity-50', state.isExpired);
      revealBtn.innerHTML = `
        <span class="iconify text-sm text-stone-600 shrink-0" data-icon="lucide:${this._doorPasscodeRevealed ? 'eye-off' : 'eye'}" data-stroke-width="2"></span>
        <span class="leading-none text-stone-800">${this._doorPasscodeRevealed ? 'Hide' : 'Reveal'}</span>
      `;
    }
  }

  toggleDoorPasscode() {
    const req = bookingStore.getRequestById(this._doorPasscodeRequestId);
    if (!req) return;
    const access = bookingStore.getDoorAccessState(req);
    if (access.isExpired) return;
    this._doorPasscodeRevealed = !this._doorPasscodeRevealed;
    this._updateDoorPasscodeModal(access);
  }

  copyDoorPasscode() {
    const req = bookingStore.getRequestById(this._doorPasscodeRequestId);
    if (!req) return;
    const access = bookingStore.getDoorAccessState(req);
    if (access.isExpired || !access.code) {
      this.showToast('Door Access Expired', 'This booking no longer has an active door passcode.', 'info');
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(access.code).then(() => {
        this.showToast('Passcode Copied', 'The door passcode is ready to paste.', 'success');
      });
    }
  }

  closeDoorPasscodeModal() {
    const modal = document.getElementById('my-door-pass-modal');
    if (modal) modal.classList.add('hidden');
    this._doorPasscodeRequestId = null;
    this._doorPasscodeRevealed = false;
  }

  confirmMyBookingsCancellation() {
    const reqId = this._pendingCancelTarget;
    if (!reqId || typeof bookingStore === 'undefined') {
      this.closeMyBookingsCancelModal();
      return;
    }

    if (typeof bookingStore.cancelBookingRequest === 'function') {
      bookingStore.cancelBookingRequest(reqId);
    } else {
      const req = bookingStore.getRequestById(reqId);
      if (req) {
        req.status = 'Cancelled';
        req.statusDisplay = 'Cancelled';
        req.indicator = 'transparent';
        req.hasConflict = false;
        if (typeof bookingStore.saveState === 'function') {
          bookingStore.saveState();
        }
      }
    }

    this.showToast("Booking Cancelled", `Reservation ${reqId} has been cancelled.`, "info");
    this.closeMyBookingsCancelModal();
    this.renderRequesterBookings();
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

  copyReferenceCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.showToast("Security Code Copied", `Booking code ${code} copied to clipboard.`, "success");
    }).catch(() => {
      this.showToast("Code: " + code, "Security reference code.", "info");
    });
  }

  downloadCalendarInvite(requestId) {
    if (typeof bookingStore === 'undefined') return;
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    const cleanDate = (req.date || '').replace(/-/g, '');
    const startTimeClean = (req.startTime || '09:00').replace(/:/g, '') + '00';
    const endTimeClean = (req.endTime || '10:00').replace(/:/g, '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//National Bank of Cambodia//Meeting Rooms//EN',
      'BEGIN:VEVENT',
      `UID:${req.id}@nbc-bank.com`,
      `DTSTAMP:${cleanDate}T${startTimeClean}Z`,
      `DTSTART:${cleanDate}T${startTimeClean}`,
      `DTEND:${cleanDate}T${endTimeClean}`,
      `SUMMARY:${req.meetingTitle || 'NBC Meeting'}`,
      `DESCRIPTION:National Bank of Cambodia meeting room booking. Reference Code: ${req.referenceCode || req.id}. Notes: ${req.meetingPurpose || 'None'}`,
      `LOCATION:${req.room?.name || 'Meeting Room'}, ${req.room?.floor || 'Headquarters'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${req.referenceCode || req.id}-${req.room?.name || 'booking'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Calendar Invite Downloaded", `Added ${req.meetingTitle} to your calendar file.`, "success");
  }

  openBookingDetailsPage(requestId) {
    const detailsView = window.NBC.views['booking-details'];
    if (detailsView && typeof detailsView.openBookingDetailsPage === 'function') {
      detailsView.openBookingDetailsPage(requestId);
    } else {
      this.navigateTo('booking-details', { requestId });
    }
  }

  openReceiptPage(requestId, fromView = 'my-bookings') {
    const receiptView = window.NBC.views['receipt'];
    if (receiptView && typeof receiptView.openReceiptPage === 'function') {
      receiptView.openReceiptPage(requestId, fromView);
    } else {
      this.navigateTo('receipt', { requestId, fromView });
    }
  }

  _getFilteredBookings() {
    if (typeof bookingStore === 'undefined') return [];
    const allRequests = bookingStore.getRequests() || [];

    // Filter Bookings
    let filtered = allRequests.filter(req => {
      if (this.myBookingsFilter === 'confirmed') {
        return req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
      } else if (this.myBookingsFilter === 'pending' || this.myBookingsFilter === 'waiting') {
        return req.status === 'Pending Review' || 
               req.status === 'Pending Manager Review' || 
               req.status === 'Pending Room Owner Approval' || 
               req.status === 'Approved - Setup In Progress' ||
               req.statusDisplay === 'Pending Review';
      } else if (this.myBookingsFilter === 'cancelled') {
        return req.status === 'Cancelled' || req.status === 'Rejected' || req.statusDisplay === 'Rejected';
      } else if (this.myBookingsFilter === 'rejected') {
        return req.status === 'Rejected' || req.statusDisplay === 'Rejected';
      }
      return true;
    });

    // Search Query Filter
    if (this.myBookingsSearchTerm) {
      const q = this.myBookingsSearchTerm;
      filtered = filtered.filter(req => {
        return (req.id && req.id.toLowerCase().includes(q)) ||
               (req.referenceCode && req.referenceCode.toLowerCase().includes(q)) ||
               (req.meetingTitle && req.meetingTitle.toLowerCase().includes(q)) ||
               (req.meetingPurpose && req.meetingPurpose.toLowerCase().includes(q)) ||
               (req.room?.name && req.room.name.toLowerCase().includes(q)) ||
               (req.category && req.category.toLowerCase().includes(q)) ||
               (req.privateJustification && req.privateJustification.toLowerCase().includes(q));
      });
    }

    // Date Filter
    if (this.myBookingsDateFilter && this.myBookingsDateFilter !== 'all') {
      const selectedDate = this.myBookingsDateFilter.trim();
      filtered = filtered.filter(req => req.date === selectedDate);
    }

    // Room Filter
    if (this.myBookingsRoomFilter && this.myBookingsRoomFilter !== 'all') {
      filtered = filtered.filter(req => req.room?.id === this.myBookingsRoomFilter);
    }

    // Sorting
    const sortCol = this.myBookingsSortColumn || 'id';
    const sortDir = this.myBookingsSortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (sortCol === 'id') {
        return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true }) * sortDir;
      } else if (sortCol === 'title') {
        return (a.meetingTitle || '').localeCompare(b.meetingTitle || '') * sortDir;
      } else if (sortCol === 'room') {
        return (a.room?.name || '').localeCompare(b.room?.name || '') * sortDir;
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

  renderRequesterBookings() {
    const container = document.getElementById('requester-bookings-list');
    if (!container || typeof bookingStore === 'undefined') return;

    // 1. Fetch all requests
    const allRequests = bookingStore.getRequests() || [];

    // 2. Compute High-Level Metrics
    const totalCount = allRequests.length;
    const confirmedCount = allRequests.filter(r => r.status === 'Approved - Confirmed' || r.statusDisplay === 'Approved').length;
    const pendingCount = allRequests.filter(r => 
      r.status === 'Pending Review' || 
      r.status === 'Pending Manager Review' || 
      r.status === 'Pending Room Owner Approval' || 
      r.status === 'Approved - Setup In Progress' ||
      r.statusDisplay === 'Pending Review'
    ).length;
    const cancelledCount = allRequests.filter(r => 
      r.status === 'Rejected' || 
      r.status === 'Cancelled' || 
      r.statusDisplay === 'Rejected'
    ).length;

    const kpiConfirmed = document.getElementById('my-kpi-confirmed');
    const kpiPending = document.getElementById('my-kpi-pending');
    const kpiCancelled = document.getElementById('my-kpi-cancelled');
    const kpiTotal = document.getElementById('my-kpi-total');

    if (kpiConfirmed) kpiConfirmed.innerText = confirmedCount;
    if (kpiPending) kpiPending.innerText = pendingCount;
    if (kpiCancelled) kpiCancelled.innerText = cancelledCount;
    if (kpiTotal) kpiTotal.innerText = totalCount;

    // 3. Filter Bookings
    const filtered = this._getFilteredBookings();

    // 4. Empty State
    if (filtered.length === 0) {
      this._disconnectCardsObserver();
      this._currentPaginatedItems = [];
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-2xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl text-stone-400" data-icon="lucide:calendar-x-2" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">No Bookings Found</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">There are no meeting room reservations matching your active filters.</p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button onclick="app.resetMyBookingsFilters()" class="btn-secondary px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center space-x-1.5">
              <span class="iconify text-xs text-[#78716C]" data-icon="lucide:rotate-ccw" data-stroke-width="1.8"></span>
              <span>Reset Filters</span>
            </button>
            <button onclick="app.navigateTo('book-room')" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]">
              <span class="iconify text-xs text-white" data-icon="lucide:calendar-plus" data-stroke-width="1.8"></span>
              <span class="text-white">+ Find and Book Room</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 5. Card View (Infinite Scrolling Experience)
    const totalItems = filtered.length;
    const currentlyDisplayedCount = Math.min(totalItems, this.myBookingsLoadedBatches * this.myBookingsBatchSize);
    const displayedItems = filtered.slice(0, currentlyDisplayedCount);
    this._currentPaginatedItems = displayedItems;
    const hasMore = currentlyDisplayedCount < totalItems;
    const remaining = Math.max(0, totalItems - currentlyDisplayedCount);

    const cardsHtml = displayedItems.map(req => this._renderSingleBookingCard(req, false)).join('');

    let finalHtml = `
      <div class="flex flex-col flex-1 min-h-0">
        <div id="my-cards-scroll-container" class="flex-1 overflow-y-auto hide-scrollbar pt-1 pb-6 pr-1 relative">
          <!-- Card Grid: Single-column on all iPads & tablets (<1400px), 2-col on desktop (>=1400px) -->
          <div id="my-cards-grid" class="my-bookings-cards-grid">
            ${cardsHtml}
          </div>

          <!-- Skeleton Loading Slot for Zero-Shift Infinite Scroll -->
          <div id="my-cards-skeleton-slot" class="my-bookings-cards-grid mt-3.5 ${this.myBookingsIsLoadingMore && hasMore ? '' : 'hidden'}">
            ${this.myBookingsIsLoadingMore && hasMore ? this._renderCardSkeleton(Math.min(2, remaining)) : ''}
          </div>

          <!-- Sentinel trigger element for IntersectionObserver -->
          <div id="my-cards-infinite-sentinel" class="w-full h-2 pointer-events-none mt-2"></div>

          <!-- Footer Status / Fallback Controls -->
          <div id="my-cards-footer-controls" class="w-full">
            ${this._renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining)}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = finalHtml;
    this._setupCardsInfiniteScrollObserver();
  }

  _renderCardsFooterControls(totalItems, currentlyDisplayedCount, hasMore, remaining) {
    if (this.myBookingsIsLoadingMore) {
      return `
        <div class="py-5 flex items-center justify-center space-x-2 text-xs font-semibold text-stone-500 animate-pulse">
          <span class="iconify animate-spin text-sm text-[#991B1B]" data-icon="lucide:loader-2" data-stroke-width="2"></span>
          <span>Loading more reservations...</span>
        </div>
      `;
    }

    if (hasMore) {
      return `
        <div class="py-5 flex flex-col items-center justify-center space-y-2">
          <button type="button" onclick="app.loadNextCardsBatch()" class="h-9 px-5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-[#E9E3DD] text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center space-x-2 cursor-pointer active:scale-[0.98]">
            <span class="iconify text-xs text-[#991B1B]" data-icon="lucide:arrow-down-circle" data-stroke-width="2"></span>
            <span>Load More Bookings</span>
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
            <span>All ${totalItems} bookings loaded</span>
          </div>
          <div class="flex-1 h-[1px] bg-[#E9E3DD]"></div>
        </div>
        <button type="button" onclick="app.scrollMyBookingsToTop()" class="btn-secondary h-7 px-3 rounded-lg text-xs font-bold text-stone-700 flex items-center space-x-1.5 transition active:scale-[0.98] shadow-2xs hover:border-stone-300">
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

          <!-- Row 4: Buttons shimmer -->
          <div class="mt-3.5 flex items-center gap-2 sm:gap-2.5">
            <div class="flex-1 h-[36px] rounded-xl bg-stone-100 border border-stone-200"></div>
            <div class="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200"></div>
            <div class="w-20 h-[36px] rounded-xl bg-stone-50 border border-stone-200"></div>
          </div>
        </div>
      `;
    }
    return skeletons;
  }

  _renderSingleBookingCard(req, isNew = false) {
    const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isPending = !isConfirmed && !isRejected && !isCancelled && !isSetup;

    let statusLabel = 'In Review';
    let statusIcon = 'lucide:clock';
    let statusBadgeClass = 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';

    if (isConfirmed) {
      statusLabel = 'Confirmed';
      statusIcon = 'lucide:check-circle-2';
      statusBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (isSetup) {
      statusLabel = 'Setting Up';
      statusIcon = 'lucide:settings';
      statusBadgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
    } else if (isRejected) {
      statusLabel = 'Rejected';
      statusIcon = 'lucide:x-circle';
      statusBadgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
    } else if (isCancelled) {
      statusLabel = 'Cancelled';
      statusIcon = 'lucide:slash';
      statusBadgeClass = 'bg-stone-50 text-stone-700 border border-stone-200';
    }

    const roomObj = bookingStore.getRoomById(req.room?.id) || req.room || {};
    const roomImgUrl = roomObj.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
    const floorShort = this._formatFloorShort(roomObj.floor || 'Floor 18');
    const hasMultiSessions = req.sessions && req.sessions.length > 1;
    const doorAccess = bookingStore.getDoorAccessState
      ? bookingStore.getDoorAccessState(req)
      : { code: req.doorPasscode || req.referenceCode, isExpired: false };

    // Format clean room name, location, and department (Minimal & Modern)
    const rawRoomName = roomObj.name || req.room?.name || req.roomName || 'Meeting Room';
    const roomName = rawRoomName.includes(' - ') ? rawRoomName.split(' - ')[1].trim() : rawRoomName;

    const rawLocation = roomObj.location || req.room?.location || req.location || 'Headquarters';
    const locationName = rawLocation
      .replace(/^National Bank of Cambodia\s*[-–,]\s*/i, '')
      .replace(/\(Phnom Penh branch\)/i, 'Phnom Penh Branch')
      .replace(/Provincial Branch/i, 'Branch')
      .replace(/\(.*\)/, '')
      .trim() || 'Headquarters';

    return `
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-4.5 shadow-xs transition-all duration-150 hover:border-[#D8CFC7] hover:shadow-sm flex flex-col justify-between ${isNew ? 'animate-card-fade-in' : ''}">
        <div class="flex-1 min-w-0 flex flex-col justify-start">
          <!-- Row 1: ID + Reference Code + Status Pill -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <button type="button" onclick="app.openBookingDetailsPage('${req.id}')" class="font-mono font-bold text-xs text-[#991B1B] hover:underline cursor-pointer" title="Open Booking Details">
                ${req.id}
              </button>
              <span class="text-stone-300 font-light">•</span>
              <button type="button" onclick="app.copyReferenceCode('${req.referenceCode}')" title="Click to copy security code" class="font-mono text-xs font-normal text-stone-500 hover:text-stone-800 flex items-center space-x-1 cursor-pointer">
                <span>${req.referenceCode}</span>
                <span class="iconify text-xs text-stone-400 hover:text-stone-600" data-icon="lucide:copy" data-stroke-width="2"></span>
              </button>
            </div>
            <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}">
              <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
              <span>${statusLabel}</span>
            </div>
          </div>

          <!-- Row 2: Room Thumbnail + Meeting Specs + Services Tag -->
          <div class="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-3.5">
            <div class="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <img src="${roomImgUrl}" class="rounded-xl object-cover border border-[#E9E3DD] shrink-0 w-[116px] sm:w-[124px] h-[78px] sm:h-[82px] shadow-2xs" alt="${roomName}" />
              <div class="min-w-0 flex-1">
                <!-- Line 1: Meeting Title -->
                <h4 class="font-heading font-semibold text-sm text-stone-900 leading-snug truncate" title="${req.meetingTitle || 'Meeting'}">${req.meetingTitle || 'Meeting'}</h4>
                
                <!-- Line 2: Venue Hierarchy (Room Name • Floor • Location) -->
                <div class="flex items-center gap-1.5 text-xs text-stone-600 mt-1 font-normal truncate">
                  <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  <span class="font-medium text-stone-900 truncate" title="${rawRoomName}">${roomName}</span>
                  <span class="text-stone-300 font-light shrink-0">•</span>
                  <span class="shrink-0 text-stone-600">${floorShort}</span>
                  <span class="text-stone-300 font-light shrink-0">•</span>
                  <span class="text-stone-500 truncate" title="${rawLocation}">${locationName}</span>
                </div>

                <!-- Line 3: Schedule (Date • Time) -->
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
                  ${hasMultiSessions ? `<span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 shrink-0">+${req.sessions.length - 1}</span>` : ''}
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
        </div>

        <!-- Stepper: Visual Approval Progress -->
        ${this._renderBookingStepper(req)}

        <!-- Row 3: Action Buttons (Senior Design Polish: Strict h-9 & 1px border alignment) -->
        <div class="mt-3.5 flex items-center gap-2">
          <button type="button" onclick="app.openBookingDetailsPage('${req.id}')" class="flex-1 btn-secondary h-9 px-3.5 rounded-xl border border-[#E9E3DD] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none">
            <span class="iconify text-sm text-stone-500 shrink-0" data-icon="lucide:eye" data-stroke-width="2"></span>
            <span class="leading-none text-stone-800">View Details</span>
          </button>

          ${isConfirmed ? `
            <button type="button" onclick="app.openDoorPasscodeModal('${req.id}')" title="Door Access Passcode" aria-label="Door Access Passcode" class="btn-secondary w-9 h-9 shrink-0 rounded-xl border border-[#E9E3DD] inline-flex items-center justify-center text-stone-600 hover:text-[#991B1B] hover:border-[#991B1B]/40 transition cursor-pointer active:scale-[0.98] select-none">
              <span class="iconify text-sm shrink-0" data-icon="lucide:key-round" data-stroke-width="2"></span>
            </button>
            <button type="button" onclick="app.openReceiptPage('${req.id}', 'my-bookings')" class="btn-primary h-9 px-3.5 shrink-0 rounded-xl border border-[#991B1B] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] select-none shadow-xs">
              <span class="iconify text-sm text-white shrink-0" data-icon="lucide:file-text" data-stroke-width="2"></span>
              <span class="text-white leading-none">Receipt</span>
            </button>
          ` : ''}

          ${!isCancelled && !isRejected ? `
            <button type="button" onclick="app.openMyBookingsCancelModal('${req.id}')" title="Cancel Booking" aria-label="Cancel Booking" class="w-9 h-9 shrink-0 rounded-xl bg-white hover:bg-rose-50 text-[#991B1B] border border-rose-200 hover:border-rose-300 transition inline-flex items-center justify-center cursor-pointer active:scale-[0.98] select-none">
              <span class="iconify text-sm text-[#991B1B] shrink-0" data-icon="lucide:x" data-stroke-width="2"></span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  _setupCardsInfiniteScrollObserver() {
    this._disconnectCardsObserver();

    const sentinel = document.getElementById('my-cards-infinite-sentinel');
    const scrollContainer = document.getElementById('my-cards-scroll-container');
    if (!sentinel || !scrollContainer) return;

    if (typeof IntersectionObserver === 'undefined') return;

    this._cardsIntersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !this.myBookingsIsLoadingMore && this.myBookingsAutoScrollEnabled) {
        this.loadNextCardsBatch();
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

  loadNextCardsBatch() {
    if (this.myBookingsIsLoadingMore) return;

    const filtered = this._getFilteredBookings();
    const totalItems = filtered.length;
    const currentDisplayed = this.myBookingsLoadedBatches * this.myBookingsBatchSize;

    if (currentDisplayed >= totalItems) {
      return;
    }

    this.myBookingsIsLoadingMore = true;

    const skeletonSlot = document.getElementById('my-cards-skeleton-slot');
    const footerControls = document.getElementById('my-cards-footer-controls');
    const remainingAfter = totalItems - currentDisplayed;
    const nextBatchSize = Math.min(this.myBookingsBatchSize, remainingAfter);

    if (skeletonSlot) {
      skeletonSlot.innerHTML = this._renderCardSkeleton(Math.min(2, nextBatchSize));
      skeletonSlot.classList.remove('hidden');
    }
    if (footerControls) {
      footerControls.innerHTML = this._renderCardsFooterControls(totalItems, currentDisplayed, true, remainingAfter);
    }

    // 500ms simulated micro-latency for realistic smooth skeleton experience
    setTimeout(() => {
      const nextBatchItems = filtered.slice(currentDisplayed, currentDisplayed + nextBatchSize);
      this.myBookingsLoadedBatches++;

      const grid = document.getElementById('my-cards-grid');
      if (grid && nextBatchItems.length > 0) {
        const newCardsHtml = nextBatchItems.map(req => {
          return this._renderSingleBookingCard(req, true);
        }).join('');
        grid.insertAdjacentHTML('beforeend', newCardsHtml);
      }

      if (skeletonSlot) {
        skeletonSlot.innerHTML = '';
        skeletonSlot.classList.add('hidden');
      }

      const newDisplayed = this.myBookingsLoadedBatches * this.myBookingsBatchSize;
      const newHasMore = newDisplayed < totalItems;
      const newRemaining = Math.max(0, totalItems - newDisplayed);

      this.myBookingsIsLoadingMore = false;

      if (footerControls) {
        footerControls.innerHTML = this._renderCardsFooterControls(totalItems, Math.min(totalItems, newDisplayed), newHasMore, newRemaining);
      }

      if (newHasMore) {
        const sentinel = document.getElementById('my-cards-infinite-sentinel');
        if (sentinel && this._cardsIntersectionObserver) {
          this._cardsIntersectionObserver.unobserve(sentinel);
          this._cardsIntersectionObserver.observe(sentinel);
        }
      } else {
        this._disconnectCardsObserver();
      }
    }, 500);
  }

  scrollMyBookingsToTop() {
    const scrollContainer = document.getElementById('my-cards-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  _renderBookingStepper(req) {
    const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isPending = !isConfirmed && !isRejected && !isCancelled && !isSetup && !isOwnerPending;

    const isMyRoom = req.isMyRoom || (req.room?.roomOwner?.name === 'Jonathan Vance' || req.room?.roomOwner?.id === 'OWNER-VANCE') || (req.room?.id === 'ROOM-107' && req.room?.roomOwner?.name !== 'H.E. Chea Serey Cabinet');
    const isPrivate = req.isPrivateRequest || req.room?.requiresOwnerApproval;
    const isPitikaApproved = req.managerReview?.decision === 'Approved' || req.status === 'Pending Room Owner Approval' || isConfirmed || isSetup;
    const isCancelledAfterPitika = isCancelled && isPitikaApproved;
    const isCancelledBeforePitika = isCancelled && !isPitikaApproved;
    const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');
    const isPitikaRejected = isRejected && !isOwnerRejected;

    // Line percentage calculation
    let progressPercent = '0%';
    let lineBoundsClass = 'left-[8%] right-[8%] sm:left-[10%] sm:right-[10%]';

    if (isMyRoom && !req.needsIT && !req.needsCatering) {
      // 3 steps
      lineBoundsClass = 'left-[14%] right-[14%] sm:left-[16.67%] sm:right-[16.67%]';
      progressPercent = '100%';
    } else if (isMyRoom && (req.needsIT || req.needsCatering)) {
      // 4 steps
      lineBoundsClass = 'left-[10%] right-[10%] sm:left-[12.5%] sm:right-[12.5%]';
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '66.6%';
      else progressPercent = '33.3%';
    } else if (isPrivate) {
      // 5 steps (Matches User Reference Image)
      lineBoundsClass = 'left-[8%] right-[8%] sm:left-[10%] sm:right-[10%]';
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '75%';
      else if (isOwnerPending || isOwnerRejected || isCancelledAfterPitika) progressPercent = '50%';
      else if (isPitikaRejected || isPending || isCancelledBeforePitika) progressPercent = '25%';
      else progressPercent = '25%';
    } else {
      // Standard public room (4 steps)
      lineBoundsClass = 'left-[10%] right-[10%] sm:left-[12.5%] sm:right-[12.5%]';
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '66.6%';
      else progressPercent = '33.3%';
    }

    return `
      <div class="relative w-full my-3.5 pt-0.5 pb-1">
        <!-- Connecting Line Background & Progress -->
        <div class="absolute top-[11px] ${lineBoundsClass} h-[2px] bg-[#E7DFD7] rounded-full z-0 pointer-events-none">
          <div class="h-full bg-emerald-600 rounded-full transition-all duration-300" style="width: ${progressPercent};"></div>
        </div>

        <!-- Stepper Nodes Track -->
        <div class="relative z-10 flex items-start justify-between w-full">
          ${isMyRoom ? (req.needsIT || req.needsCatering ? `
            <!-- Own Room With Services: 4 Steps -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Booked</span>
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed || isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Cost Review</span>
              ` : ((isRejected || isCancelled) ? `
                <div class="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-rose-600" data-icon="lucide:x" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">2. Cost Review</span>
                <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">${isCancelled ? 'Cancelled' : 'Rejected'}</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">2. Cost Review</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">In Review</span>
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
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
              `)}
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">4. Door Pass</span>
                <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Active</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>4</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. Door Pass</span>
              `}
            </div>
          ` : `
            <!-- Own Room Instant: 3 Steps -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Booked</span>
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Setup</span>
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">3. Door Pass</span>
              <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Active</span>
            </div>
          `) : (isPrivate ? `
            <!-- Private Room: 5 Steps (Pixel-Perfect Match to Target Design) -->
            <!-- Step 1: 1. Submitted -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
              </div>
              <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">1. Submitted</span>
            </div>

            <!-- Step 2: 2. Approved (Pitika) -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">2. Approved</span>
              ` : (isPitikaRejected || isCancelledBeforePitika ? `
                <div class="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-rose-600" data-icon="lucide:x" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">${isCancelledBeforePitika ? 'Cancelled' : 'Rejected'}</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-emerald-600 ring-[4px] ring-emerald-100 flex items-center justify-center shadow-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">2. Pitika</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Reviewing</span>
              `)}
            </div>

            <!-- Step 3: 3. Room Owner -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed || isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">3. Room Owner</span>
              ` : (isOwnerRejected || isCancelledAfterPitika ? `
                <div class="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-rose-600" data-icon="lucide:x" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-rose-700 mt-2 whitespace-nowrap">3. Room Owner</span>
                <span class="text-[10px] sm:text-xs font-normal text-rose-600 mt-0.5 whitespace-nowrap">${isCancelledAfterPitika ? 'Cancelled' : 'Rejected'}</span>
              ` : (isOwnerPending ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white ring-[4px] ring-emerald-200/60 flex items-center justify-center shadow-xs"></div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">3. Room Owner</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Reviewing</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>3</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">3. Room Owner</span>
              `))}
            </div>

            <!-- Step 4: 4. IT Setup -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. IT Setup</span>
              ` : (isSetup ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white ring-[4px] ring-emerald-200/60 flex items-center justify-center shadow-xs"></div>
                <span class="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-2 whitespace-nowrap">4. IT Setup</span>
                <span class="text-[10px] sm:text-xs font-normal text-stone-500 mt-0.5 whitespace-nowrap">Setting Up</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>4</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. IT Setup</span>
              `)}
            </div>

            <!-- Step 5: 5. Door Pass -->
            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">5. Door Pass</span>
                <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Active</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>5</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">5. Door Pass</span>
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
                <div class="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-rose-600" data-icon="lucide:x" data-stroke-width="2"></span>
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
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
              `)}
            </div>

            <div class="flex flex-col items-center text-center flex-1 min-w-0">
              ${isConfirmed ? `
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-check" data-stroke-width="2"></span>
                </div>
                <span class="text-[11px] sm:text-xs font-semibold text-stone-900 mt-2 whitespace-nowrap">4. Door Pass</span>
                <span class="text-[10px] sm:text-xs font-medium text-emerald-700 mt-0.5 whitespace-nowrap">Active</span>
              ` : `
                <div class="w-6 h-6 rounded-full bg-white border border-stone-300 text-stone-500 text-xs font-semibold flex items-center justify-center shadow-2xs">
                  <span>4</span>
                </div>
                <span class="text-[11px] sm:text-xs font-medium text-stone-600 mt-2 whitespace-nowrap">4. Door Pass</span>
              `}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

window.NBC.views['my-bookings'] = new MyBookingsView();
