// Topbar Layout Component
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};

window.NBC.layouts.topbar = {
  render() {
    const header = document.getElementById('app-topbar');
    if (!header) return;

    header.className =
      'h-11 sm:h-14 bg-[#2A0808] border-b border-[#3D0C0C] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 text-white shadow-xs';

    header.innerHTML = `
      <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">

        <!-- Desktop Sidebar Toggle -->
        <button
          onclick="app.toggleSidebar()"
          class="sidebar-toggle p-1.5 rounded-md bg-[#1F0505] hover:bg-[#3D0C0C] text-stone-200 border border-[#3D0C0C] hidden lg:flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
          aria-label="Toggle Sidebar"
          title="Toggle sidebar"
        >
          <span
            class="iconify text-lg text-white"
            data-icon="lucide:panel-left"
            data-stroke-width="2"
          ></span>
        </button>

        <!-- Mobile Sidebar Toggle (Flowbite Offcanvas Trigger) -->
        <button
          type="button"
          data-drawer-target="app-sidebar"
          data-drawer-show="app-sidebar"
          aria-controls="app-sidebar"
          onclick="app.toggleMobileSidebar(true)"
          class="p-1.5 rounded-md bg-[#1F0505] hover:bg-[#3D0C0C] text-stone-200 border border-[#3D0C0C] lg:hidden flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <span
            class="iconify text-lg text-white"
            data-icon="lucide:menu"
            data-stroke-width="2"
          ></span>
        </button>

        <div class="min-w-0 flex-1">
          <h1
            id="topbar-page-title"
            class="font-heading font-bold text-xs sm:text-sm text-white truncate leading-tight"
          >
            Find a Meeting Room
          </h1>

          <p
            id="topbar-page-subtitle"
            class="text-[10px] sm:text-[11px] text-stone-300 truncate leading-tight mt-0.5"
          >
            Choose an available room to book for your team
          </p>
        </div>
      </div>

      <!-- System Status -->
      <div class="flex items-center space-x-2 text-xs shrink-0">
        <span
          class="inline-flex items-center space-x-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-[#1F0505] border border-[#3D0C0C] text-stone-300 text-[10px] sm:text-[11px]"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium hidden sm:inline">System Online</span>
        </span>
      </div>
    `;
  },

  setTitle(title, subtitle) {
    const titleEl = document.getElementById('topbar-page-title');
    const subtitleEl = document.getElementById('topbar-page-subtitle');

    if (titleEl) {
      titleEl.innerText = title || 'NBC Meeting Portal';
    }

    if (subtitleEl) {
      subtitleEl.innerText = subtitle || '';
    }
  }
};