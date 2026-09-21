// Topbar Layout Component
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};

window.NBC.layouts.topbar = {
  _dropdownOpen: false,
  _boundClickOutside: null,

  render() {
    const header = document.getElementById('app-topbar');
    if (!header) return;

    header.className =
      'h-11 sm:h-14 bg-[#2A0808] border-b border-[#3D0C0C] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 text-white shadow-xs';
    header.style.cssText = 'position: sticky; top: 0; z-index: 50;';

    header.innerHTML = `
      <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">

        <!-- Unified Sidebar Toggle -->
        <button
          type="button"
          id="global-sidebar-toggle-btn"
          onclick="window.innerWidth < 1024 ? app.toggleMobileSidebar(true) : app.toggleSidebar()"
          class="sidebar-toggle h-9 w-9 rounded-lg bg-[#1F0505] hover:bg-[#380B0B] active:scale-95 text-stone-200 border border-[#3D0C0C] flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D4A71B]"
          aria-label="Toggle Navigation"
          aria-expanded="${localStorage.getItem('nbc-sidebar-collapsed-v2') === 'true' ? 'false' : 'true'}"
          aria-controls="app-sidebar"
          title="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white shrink-0">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>

        <div class="min-w-0 flex-1">
          <h1
            id="topbar-page-title"
            class="font-heading font-bold text-sm sm:text-base text-white truncate leading-normal"
          >
            Find a Meeting Room
          </h1>
        </div>
      </div>

      <!-- User Profile Action & Dropdown -->
      <div class="relative flex items-center space-x-2 shrink-0">
        <!-- Real Human Profile Trigger Button -->
        <button
          type="button"
          id="topbar-user-profile-btn"
          onclick="window.NBC.layouts.topbar.toggleProfileDropdown()"
          class="h-9 w-9 rounded-full bg-[#1F0505] hover:bg-[#380B0B] active:scale-95 p-0 overflow-hidden border-2 border-[#450A0A] hover:border-[#991B1B] flex items-center justify-center transition shadow-xs shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D4A71B]"
          title="Jonathan Vance (NBC Staff Booker)"
          aria-label="User Profile: Jonathan Vance"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <img
            src="assets/user-avatar.jpg"
            alt="Jonathan Vance"
            class="w-full h-full object-cover rounded-full select-none"
            loading="eager"
          />
        </button>

        <!-- Profile Dropdown Menu (Organized Hierarchy) -->
        <div
          id="topbar-profile-dropdown"
          class="hidden absolute right-0 top-full mt-2.5 w-72 rounded-2xl bg-[#1F0505] border border-[#3D0C0C] shadow-2xl p-3 text-stone-200 z-50 select-none backdrop-blur-md"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="topbar-user-profile-btn"
        >
          <!-- 1. User Identity Header (Hierarchical Card) -->
          <div class="p-2.5 rounded-xl bg-[#260707] border border-[#3D0C0C] flex items-center gap-3">
            <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-[#450A0A] shrink-0 shadow-xs ring-1 ring-white/10">
              <img
                src="assets/user-avatar.jpg"
                alt="Jonathan Vance"
                class="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-heading font-bold text-sm text-white truncate leading-tight tracking-tight">
                Jonathan Vance
              </div>
              <div class="text-[11px] text-stone-400 font-medium truncate leading-tight mt-0.5">
                Senior Officer · Banking Ops
              </div>
            </div>
          </div>

          <!-- 2. Workspace Navigation Group -->
          <div class="mt-2.5 pt-1">
            <div class="px-2.5 pb-1 text-[10px] font-mono font-semibold tracking-wider text-stone-400 uppercase">
              Quick Navigation
            </div>
            <div class="space-y-0.5">
              <button
                type="button"
                onclick="window.NBC.layouts.topbar.navigateFromProfile('book-room')"
                class="w-full h-9 px-2.5 rounded-lg hover:bg-[#2A0808] active:bg-[#380B0B] text-xs font-medium text-stone-200 hover:text-white flex items-center justify-between transition cursor-pointer text-left group"
                role="menuitem"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-md bg-[#260707] border border-[#3D0C0C] flex items-center justify-center text-stone-400 group-hover:text-white group-hover:border-[#5A1212] transition shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h20"/><path d="M20 20v-4"/><path d="M9 10h.01"/><path d="M4 20V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/>
                    </svg>
                  </span>
                  <span>Find a Room</span>
                </div>
                <span class="text-[11px] font-mono text-stone-400 group-hover:text-stone-300">Catalog</span>
              </button>

              <button
                type="button"
                onclick="window.NBC.layouts.topbar.navigateFromProfile('my-bookings')"
                class="w-full h-9 px-2.5 rounded-lg hover:bg-[#2A0808] active:bg-[#380B0B] text-xs font-medium text-stone-200 hover:text-white flex items-center justify-between transition cursor-pointer text-left group"
                role="menuitem"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-md bg-[#260707] border border-[#3D0C0C] flex items-center justify-center text-stone-400 group-hover:text-white group-hover:border-[#5A1212] transition shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>
                    </svg>
                  </span>
                  <span>My Bookings</span>
                </div>
                <span id="topbar-dropdown-bookings-count" class="text-[11px] font-mono text-stone-400 group-hover:text-stone-300">Schedule</span>
              </button>
            </div>
          </div>

          <!-- 3. System Divider & Administration Group -->
          <div class="mt-2 pt-2 border-t border-[#3D0C0C]">
            <div class="px-2.5 pb-1 text-[10px] font-mono font-semibold tracking-wider text-stone-400 uppercase">
              System Operations
            </div>
            <button
              type="button"
              onclick="window.NBC.layouts.topbar.resetDemoFromProfile()"
              class="w-full h-9 px-2.5 rounded-lg hover:bg-[#2A0808] active:bg-[#380B0B] text-xs font-medium text-amber-300/90 hover:text-amber-200 flex items-center justify-between transition cursor-pointer text-left group"
              role="menuitem"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-md bg-[#260707] border border-[#3D0C0C] flex items-center justify-center text-amber-400/80 group-hover:text-amber-300 group-hover:border-amber-900/40 transition shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                  </svg>
                </span>
                <span>Reset Mock Data</span>
              </div>
              <span class="text-[10px] font-mono text-amber-400/70">Restore</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindClickOutside();

    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(header);
    }
  },

  toggleProfileDropdown() {
    const dropdown = document.getElementById('topbar-profile-dropdown');
    const btn = document.getElementById('topbar-user-profile-btn');
    if (!dropdown || !btn) return;

    this._dropdownOpen = !this._dropdownOpen;
    dropdown.classList.toggle('hidden', !this._dropdownOpen);
    btn.setAttribute('aria-expanded', this._dropdownOpen ? 'true' : 'false');

    if (this._dropdownOpen) {
      dropdown.classList.add('topbar-profile-dropdown');
      const countEl = document.getElementById('topbar-dropdown-bookings-count');
      if (countEl && typeof bookingStore !== 'undefined') {
        const count = bookingStore.getRequests().length;
        countEl.innerText = count === 1 ? '1 Booking' : `${count} Bookings`;
      }
    }
  },

  closeProfileDropdown() {
    const dropdown = document.getElementById('topbar-profile-dropdown');
    const btn = document.getElementById('topbar-user-profile-btn');
    if (dropdown) dropdown.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    this._dropdownOpen = false;
  },

  bindClickOutside() {
    if (this._boundClickOutside) return;
    this._boundClickOutside = (e) => {
      const dropdown = document.getElementById('topbar-profile-dropdown');
      const btn = document.getElementById('topbar-user-profile-btn');
      if (!dropdown || !btn || !this._dropdownOpen) return;

      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        this.closeProfileDropdown();
      }
    };
    document.addEventListener('click', this._boundClickOutside);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._dropdownOpen) {
        this.closeProfileDropdown();
      }
    });
  },

  navigateFromProfile(viewId) {
    this.closeProfileDropdown();
    if (window.app && window.app.navigateTo) {
      window.app.navigateTo(viewId);
    }
  },

  resetDemoFromProfile() {
    this.closeProfileDropdown();
    if (window.app && window.app.confirmResetDemo) {
      window.app.confirmResetDemo();
    }
  },

  setTitle(title, subtitle = '') {
    const titleEl = document.getElementById('topbar-page-title');
    if (titleEl) {
      titleEl.innerText = title || 'NBC Meeting Portal';
    }
  }
};
