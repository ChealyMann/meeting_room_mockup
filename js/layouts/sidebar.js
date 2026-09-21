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
      'fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw] bg-[#260707] border-r border-[#450A0A] flex flex-col overflow-hidden -translate-x-full lg:translate-x-0 lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 shrink-0 select-none shadow-2xl lg:shadow-none';

    container.setAttribute('tabindex', '-1');
    container.setAttribute('aria-labelledby', 'drawer-sidebar-label');

    if (localStorage.getItem('nbc-sidebar-collapsed-v2') === 'true') {
      container.classList.add('sidebar-collapsed');
    }

    container.innerHTML = `
      <div class="sidebar-shell">
        <header class="sidebar-header">
          <button
            type="button"
            class="sidebar-brand"
            onclick="app.navigateTo('book-room')"
            aria-label="Open Find a Room"
          >
            <span class="sidebar-brand-mark">
              <img src="assets/nbc-logo.png" alt="National Bank of Cambodia" />
            </span>
            <span class="sidebar-brand-copy">
              <span id="drawer-sidebar-label" class="sidebar-brand-name">NBC Bank MRMS</span>
              <span class="sidebar-brand-office">National Bank of Cambodia</span>
            </span>
          </button>

          <button
            type="button"
            data-drawer-hide="app-sidebar"
            aria-controls="app-sidebar"
            onclick="app.toggleMobileSidebar(false)"
            class="sidebar-control sidebar-mobile-close lg:hidden"
            aria-label="Close navigation menu"
          >
            <span class="iconify" data-icon="lucide:x" data-stroke-width="2"></span>
          </button>

          <button
            type="button"
            onclick="app.toggleSidebar()"
            class="sidebar-control sidebar-desktop-collapse hidden lg:flex"
            aria-label="Collapse sidebar"
            aria-expanded="true"
            aria-controls="app-sidebar"
            title="Collapse sidebar"
          >
            <span class="iconify" data-icon="lucide:panel-left-close" data-stroke-width="2"></span>
          </button>
        </header>

        <nav class="sidebar-nav no-scrollbar" aria-label="Primary navigation">
          <section class="sidebar-nav-group" aria-labelledby="sidebar-group-booker">
            <h2 id="sidebar-group-booker" class="sidebar-nav-label">Booker</h2>
            <button id="nav-book-room" type="button" onclick="app.navigateTo('book-room')" class="nav-item active" aria-current="page">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:door-open" data-stroke-width="2"></span><span>Find a Room</span></span>
            </button>
            <button id="nav-my-bookings" type="button" onclick="app.navigateTo('my-bookings')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:calendar-check-2" data-stroke-width="2"></span><span>My Bookings</span></span>
              <span id="nav-count-my-bookings" class="nav-count" aria-label="0 bookings">0</span>
            </button>
          </section>

          <section class="sidebar-nav-group" aria-labelledby="sidebar-group-manager">
            <h2 id="sidebar-group-manager" class="sidebar-nav-label">Manager</h2>
            <button id="nav-pitika-queue" type="button" onclick="app.navigateTo('pitika-queue')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:clipboard-check" data-stroke-width="2"></span><span>Review Requests</span></span>
              <span id="nav-count-pitika-pending" class="nav-count nav-count-attention" aria-label="0 requests">0</span>
            </button>
            <button id="nav-room-availability" type="button" onclick="app.navigateTo('room-availability')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:calendar-range" data-stroke-width="2"></span><span>Room Availability</span></span>
            </button>
          </section>

          <section class="sidebar-nav-group" aria-labelledby="sidebar-group-owner">
            <h2 id="sidebar-group-owner" class="sidebar-nav-label">Room Owner</h2>
            <button id="nav-room-owner-queue" type="button" onclick="app.navigateTo('room-owner-queue')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:shield-check" data-stroke-width="2"></span><span>Private Requests</span></span>
              <span id="nav-count-room-owner-pending" class="nav-count nav-count-attention" aria-label="0 requests">0</span>
            </button>
          </section>

          <section class="sidebar-nav-group" aria-labelledby="sidebar-group-it">
            <h2 id="sidebar-group-it" class="sidebar-nav-label">IT Support</h2>
            <button id="nav-it-queue" type="button" onclick="app.navigateTo('it-queue')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:headset" data-stroke-width="2"></span><span>IT Support Queue</span></span>
              <span id="nav-count-it-pending" class="nav-count nav-count-attention hidden" aria-label="0 tickets">0</span>
            </button>
          </section>

          <section class="sidebar-nav-group" aria-labelledby="sidebar-group-admin">
            <h2 id="sidebar-group-admin" class="sidebar-nav-label">Admin</h2>
            <button id="nav-create-room" type="button" onclick="app.navigateTo('create-room')" class="nav-item">
              <span class="nav-item-main"><span class="iconify" data-icon="lucide:circle-plus" data-stroke-width="2"></span><span>Add Room</span></span>
            </button>
          </section>
        </nav>
      </div>

      <footer class="sidebar-footer">
        <div class="sidebar-portal-row">
          <span class="sidebar-portal-status" aria-hidden="true"></span>
          <span class="sidebar-portal-label">NBC Official Portal</span>
          <button type="button" onclick="app.confirmResetDemo()" class="sidebar-reset-button">Reset data</button>
        </div>
      </footer>
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

    const myBookingsCountEl = document.getElementById('nav-count-my-bookings');
    const myBookingsCount = bookingStore.getRequests().length;

    if (myBookingsCountEl) {
      myBookingsCountEl.innerText = myBookingsCount;
      myBookingsCountEl.setAttribute('aria-label', `${myBookingsCount} bookings`);
      myBookingsCountEl.classList.toggle('hidden', myBookingsCount === 0);
    }

    const pitikaCountEl = document.getElementById('nav-count-pitika-pending');
    const pendingPitika = bookingStore.getPendingPitikaRequests().length;

    if (pitikaCountEl) {
      pitikaCountEl.innerText = pendingPitika;
      pitikaCountEl.setAttribute('aria-label', `${pendingPitika} requests`);
      pitikaCountEl.classList.toggle('hidden', pendingPitika === 0);
    }

    const ownerCountEl = document.getElementById('nav-count-room-owner-pending');
    const pendingOwner = bookingStore.getPendingRoomOwnerRequests().length;

    if (ownerCountEl) {
      ownerCountEl.innerText = pendingOwner;
      ownerCountEl.setAttribute('aria-label', `${pendingOwner} requests`);
      ownerCountEl.classList.toggle('hidden', pendingOwner === 0);
    }

    const itCountEl = document.getElementById('nav-count-it-pending');
    const itTickets = (typeof bookingStore.getApprovedITTickets === 'function'
      ? bookingStore.getApprovedITTickets()
      : (bookingStore.getRequests() || []).filter(
          request => request.needsIT && request.itDetails?.ticketForwardedToIT === true && !request.status?.includes('Reject') && !request.status?.includes('Cancel')
        )
    ).filter(request => !request.itDetails || !request.itDetails.isReady);

    if (itCountEl) {
      itCountEl.innerText = itTickets.length;
      itCountEl.setAttribute('aria-label', `${itTickets.length} tickets`);
      itCountEl.classList.toggle('hidden', itTickets.length === 0);
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
      'room-availability': 'nav-room-availability',
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
      'nav-room-availability',
      'nav-room-owner-queue',
      'nav-it-queue',
      'nav-create-room'
    ].forEach(navId => {
      const button = document.getElementById(navId);

      if (button) {
        const isActive = navItems[viewId] === navId;
        button.classList.toggle('active', isActive);
        if (isActive) {
          button.setAttribute('aria-current', 'page');
        } else {
          button.removeAttribute('aria-current');
        }
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
