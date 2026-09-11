// Sidebar Layout Component
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};

window.NBC.layouts.sidebar = {
  drawer: null,
  _resizeListenerBound: false,

  render() {
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
      // Flowbite dynamically handles the backdrop overlay
      backdrop.classList.add('hidden');
    }

    const container = document.getElementById('app-sidebar');
    if (!container) return;

    container.className =
      'fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw] bg-[#2A0808] border-r border-[#450A0A] flex flex-col justify-between overflow-y-auto -translate-x-full lg:translate-x-0 lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 shrink-0 select-none shadow-2xl lg:shadow-none';

    container.setAttribute('tabindex', '-1');
    container.setAttribute('aria-labelledby', 'drawer-sidebar-label');

    if (localStorage.getItem('nbc-sidebar-collapsed') === 'true') {
      container.classList.add('sidebar-collapsed');
    }

    container.innerHTML = `
      <div>
        <div class="h-16 flex items-center justify-between px-4 border-b border-[#3D0C0C]">
          <div
            class="flex items-center space-x-3 cursor-pointer"
            onclick="app.navigateTo('book-room')"
          >
            <div class="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src="assets/nbc-logo.png"
                alt="National Bank of Cambodia"
                class="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            <div class="min-w-0">
              <span id="drawer-sidebar-label" class="font-heading font-bold text-sm text-white tracking-tight truncate block">
                NBC Bank MRMS
              </span>

              <p class="text-[10px] text-stone-300 truncate">
                National Bank of Cambodia
              </p>
            </div>
          </div>

          <!-- Mobile Close (Flowbite Offcanvas Dismiss) -->
          <button
            type="button"
            data-drawer-hide="app-sidebar"
            aria-controls="app-sidebar"
            onclick="app.toggleMobileSidebar(false)"
            class="lg:hidden p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-[#3D0C0C] hover:transition-colors cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <span class="iconify text-base" data-icon="lucide:x"></span>
          </button>

          <!-- Desktop Collapse -->
          <button
            onclick="app.toggleSidebar()"
            class="hidden lg:flex p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-[#3D0C0C] hover:transition-colors cursor-pointer"
            aria-label="Collapse Sidebar"
            title="Collapse sidebar"
          >
            <span
              class="iconify text-base"
              data-icon="lucide:panel-left-close"
            ></span>
          </button>
        </div>

        <nav class="p-3 space-y-5 text-xs">
          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              Booker
            </p>

            <button
              id="nav-book-room"
              onclick="app.navigateTo('book-room')"
              class="nav-item active w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm" data-icon="lucide:door-open"></span>
                <span>Find a Room</span>
              </div>
            </button>

            <button
              id="nav-my-bookings"
              onclick="app.navigateTo('my-bookings')"
              class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm" data-icon="lucide:calendar-check-2"></span>
                <span>My Bookings</span>
              </div>

              <span
                id="badge-my-bookings"
                class="px-1.5 py-0.5 rounded text-[10px] bg-[#3D0C0C] text-amber-300 border border-[#5C1313] font-bold"
              >
                1
              </span>
            </button>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              Manager
            </p>

            <button
              id="nav-pitika-queue"
              onclick="app.navigateTo('pitika-queue')"
              class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm" data-icon="lucide:clipboard-check"></span>
                <span>Review Requests</span>
              </div>

              <span
                id="badge-pitika-pending"
                class="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-600 font-bold"
              >
                1
              </span>
            </button>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              Room Owner
            </p>

            <button
              id="nav-room-owner-queue"
              onclick="app.navigateTo('room-owner-queue')"
              class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm" data-icon="lucide:shield-check"></span>
                <span>Private Requests</span>
              </div>

              <span
                id="badge-room-owner-pending"
                class="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-600 font-bold"
              >
                1
              </span>
            </button>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              IT Support
            </p>

            <button
              id="nav-it-queue"
              onclick="app.navigateTo('it-queue')"
              class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm" data-icon="lucide:headset"></span>
                <span>IT Support Queue</span>
              </div>

              <span
                id="badge-it-pending"
                class="hidden px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-amber-200 border border-amber-600 font-bold"
              >
                0
              </span>
            </button>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              Admin
            </p>

            <button
              id="nav-create-room"
              onclick="app.navigateTo('create-room')"
              class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-md text-left"
            >
              <div class="flex items-center space-x-2.5">
                <span class="iconify text-sm text-white" data-icon="lucide:plus-circle"></span>
                <span>Add Room</span>
              </div>

              <span
                class="px-1.5 py-0.5 rounded text-[9px] bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold"
              >
                Admin
              </span>
            </button>
          </div>
        </nav>
      </div>

      <div class="p-3 border-t border-[#3D0C0C] space-y-2 text-xs">
        <div class="p-2 rounded-md bg-[#1F0505] border border-[#3D0C0C] flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full bg-amber-400"></div>
            <span class="text-[11px] text-stone-300 font-medium">
              NBC Official Portal
            </span>
          </div>

          <button
            onclick="app.confirmResetDemo()"
            class="text-[10px] text-amber-300 hover:text-white font-semibold underline cursor-pointer"
          >
            Reset Data
          </button>
        </div>
      </div>
    `;

    this.updateBadges();
    this.initDrawer();
  },

  initDrawer() {
    const container = document.getElementById('app-sidebar');
    if (!container) return;

    // Initialize Flowbite Drawer instance if library is loaded
    if (typeof Drawer !== 'undefined') {
      try {
        const options = {
          placement: 'left',
          backdrop: true,
          bodyScrolling: false,
          edge: false,
          edgeOffset: '',
          backdropClasses:
            'bg-black/60 backdrop-blur-xs fixed inset-0 z-40 transition-opacity duration-300',
          onShow: () => {},
          onHide: () => {}
        };

        const instanceOptions = {
          id: 'app-sidebar',
          override: true
        };

        this.drawer = new Drawer(container, options, instanceOptions);
      } catch (err) {
        console.warn('Flowbite Drawer initialization notice:', err);
      }
    }

    // Auto-close mobile offcanvas when viewport expands to desktop (>= 1024px)
    if (!this._resizeListenerBound) {
      window.addEventListener('resize', () => {
        if (
          window.innerWidth >= 1024 &&
          this.drawer &&
          typeof this.drawer.isVisible === 'function' &&
          this.drawer.isVisible()
        ) {
          this.drawer.hide();
        }
      });
      this._resizeListenerBound = true;
    }
  },

  updateBadges() {
    if (typeof bookingStore === 'undefined') return;

    const myBookingsBadge = document.getElementById('badge-my-bookings');
    const myBookingsCount = bookingStore.getRequests().length;

    if (myBookingsBadge) {
      myBookingsBadge.innerText = myBookingsCount;
      myBookingsBadge.classList.toggle('hidden', myBookingsCount === 0);
    }

    const pitikaBadge = document.getElementById('badge-pitika-pending');
    const pendingPitika = bookingStore.getPendingPitikaRequests().length;

    if (pitikaBadge) {
      pitikaBadge.innerText = pendingPitika;
      pitikaBadge.classList.toggle('hidden', pendingPitika === 0);
    }

    const ownerBadge = document.getElementById('badge-room-owner-pending');
    const pendingOwner = bookingStore.getPendingRoomOwnerRequests().length;

    if (ownerBadge) {
      ownerBadge.innerText = pendingOwner;
      ownerBadge.classList.toggle('hidden', pendingOwner === 0);
    }

    const itBadge = document.getElementById('badge-it-pending');
    const itTickets = bookingStore
      .getRequests()
      .filter(
        request =>
          request.needsIT &&
          (!request.itDetails || !request.itDetails.isReady)
      );

    if (itBadge) {
      itBadge.innerText = itTickets.length;
      itBadge.classList.toggle('hidden', itTickets.length === 0);
    }
  },

  setActiveNav(viewId) {
    const navItems = {
      'book-room': 'nav-book-room',
      'request-other-private': 'nav-book-room',
      'room-details': 'nav-book-room',
      'request-form': 'nav-book-room',
      'private-request-form': 'nav-book-room',
      'my-bookings': 'nav-my-bookings',
      'booking-details': 'nav-my-bookings',
      receipt: 'nav-my-bookings',
      'pitika-queue': 'nav-pitika-queue',
      'pitika-review': 'nav-pitika-queue',
      'room-owner-queue': 'nav-room-owner-queue',
      'room-owner-review': 'nav-room-owner-queue',
      'it-queue': 'nav-it-queue',
      'it-assign': 'nav-it-queue',
      'create-room': 'nav-create-room'
    };

    [
      'nav-book-room',
      'nav-my-bookings',
      'nav-pitika-queue',
      'nav-room-owner-queue',
      'nav-it-queue',
      'nav-create-room'
    ].forEach(navId => {
      const button = document.getElementById(navId);

      if (button) {
        button.classList.toggle('active', navItems[viewId] === navId);
      }
    });
  },

  toggleMobile(open) {
    if (this.drawer) {
      if (open === true) {
        this.drawer.show();
      } else if (open === false) {
        this.drawer.hide();
      } else {
        this.drawer.toggle();
      }
      return;
    }

    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    const shouldOpen =
      open !== null && open !== undefined
        ? open
        : sidebar.classList.contains('-translate-x-full');

    if (shouldOpen) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('transform-none');
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('transform-none');
    }
  }
};