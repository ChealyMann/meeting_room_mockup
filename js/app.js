// National Bank of Cambodia - Meeting Room Booking System
// Modern Modular Application Orchestrator & Router

window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};
window.NBC.views = window.NBC.views || {};

class BankBookingApp {
  constructor() {
    this.currentView = 'book-room';

    // Auto-bind view methods to app instance for 100% backward compatibility
    this.bindViewAndLayoutMethods();

    // Subscribe to store updates
    if (typeof bookingStore !== 'undefined') {
      bookingStore.subscribe(() => this.renderAll());
    }

    this.init();
  }

  bindViewAndLayoutMethods() {
    // Bind view methods
    for (const [viewId, viewObj] of Object.entries(window.NBC.views || {})) {
      const proto = Object.getPrototypeOf(viewObj);
      const propNames = Object.getOwnPropertyNames(proto).concat(Object.keys(viewObj));
      for (const name of propNames) {
        if (typeof viewObj[name] === 'function' && name !== 'constructor' && !this[name]) {
          this[name] = (...args) => viewObj[name].apply(viewObj, args);
        }
      }
    }

    // Bind layout modal methods
      this.openBookingTimelineModal = (roomId, targetDate = null, startTime = null, endTime = null) => {
        if (this.selectRoomAndProceed) {
          this.selectRoomAndProceed(roomId, 'book-room', targetDate, startTime, endTime);
        } else {
          this.navigateTo('request-form', { roomId, date: targetDate, startTime, endTime });
        }
      };
      this.closeBookingTimelineModal = (...args) => window.NBC.layouts.modals.closeBookingTimelineModal(...args);
      this.confirmTimelineSlotAndProceed = (...args) => window.NBC.layouts.modals.confirmTimelineSlotAndProceed(...args);
      this.openSimplePrivateModal = (...args) => window.NBC.layouts.modals.open(...args);
      this.closeSimplePrivateModal = (...args) => window.NBC.layouts.modals.close(...args);
      this.handleSimplePrivateSubmit = (...args) => window.NBC.layouts.modals.handleSubmit(...args);
      this.requestOtherPrivateRoom = (roomId) => {
        if (this.selectRoomAndProceed) {
          this.selectRoomAndProceed(roomId, 'request-other-private');
        } else {
          this.navigateTo('request-form', { roomId, fromView: 'request-other-private' });
        }
      };
  }

  init() {
    // 1. Mount layout partials
    const sidebarRoot = document.getElementById('app-sidebar');
    const topbarRoot = document.getElementById('app-topbar');
    const mobileNavRoot = document.getElementById('app-mobile-nav');
    const modalsRoot = document.getElementById('app-modals');

    if (sidebarRoot && window.NBC.layouts.sidebar) {
      window.NBC.layouts.sidebar.render(sidebarRoot);
    }
    if (topbarRoot && window.NBC.layouts.topbar) {
      window.NBC.layouts.topbar.render(topbarRoot);
    }
    if (mobileNavRoot && window.NBC.layouts.mobileNav) {
      window.NBC.layouts.mobileNav.render(mobileNavRoot);
    }
    if (modalsRoot && window.NBC.layouts.modals) {
      window.NBC.layouts.modals.render(modalsRoot);
    }
    if (window.NBC.layouts.toast) {
      if (typeof window.NBC.layouts.toast.init === 'function') {
        window.NBC.layouts.toast.init();
      } else if (typeof window.NBC.layouts.toast.render === 'function') {
        window.NBC.layouts.toast.render();
      }
    }

    // 2. Navigate to default view
    this.navigateTo('book-room');
    this.updateSidebarBadges();
  }

  navigateTo(viewId, params = {}) {
    const prevViewId = this.currentView;
    this.currentView = viewId;

    // Cleanup previous view if registered
    if (prevViewId && prevViewId !== viewId && window.NBC.views[prevViewId]) {
      const prevView = window.NBC.views[prevViewId];
      if (typeof prevView.cleanup === 'function') {
        try {
          prevView.cleanup();
        } catch (e) {
          console.warn(`Error in cleanup for view '${prevViewId}':`, e);
        }
      }
    }

    // Auto-close mobile drawer when switching views
    this.toggleMobileSidebar(false);

    if (viewId === 'private-request-form') {
      const formView = window.NBC.views['request-form'];
      if (formView && formView.selectRoomAndProceed) {
        formView.selectRoomAndProceed(params.roomId || 'ROOM-101');
      }
      return;
    }

    // View Titles & Subtitles for Topbar
    const viewMeta = {
      'book-room': {
        title: 'Find a Meeting Room',
        sub: 'Choose an available room to book for your team'
      },
      'request-other-private': {
        title: "Other Private Rooms",
        sub: 'Private rooms that need 2 approvals'
      },
      'room-details': {
        title: 'Room Details',
        sub: 'Information and photos'
      },
      'request-form': {
        title: 'Book a Meeting Room',
        sub: 'Enter details, time, food, and IT support'
      },
      'my-bookings': {
        title: 'My Bookings',
        sub: 'Track your room requests, approvals, and passes'
      },
      'booking-details': {
        title: 'Booking Details',
        sub: 'Booking information and door pass'
      },
      'receipt': {
        title: 'Booking Receipt',
        sub: 'National Bank of Cambodia • Official Receipt'
      },
      'pitika-queue': {
        title: 'Review Requests',
        sub: 'Pitika S. • Review and approve requests'
      },
      'pitika-review': {
        title: 'Review Booking Request',
        sub: 'Step 1: Pitika Review'
      },
      'room-availability': {
        title: 'Room Availability',
        sub: 'View the status of all meeting rooms for today.'
      },
      'room-owner-queue': {
        title: 'Private Room Requests',
        sub: 'Step 2: Room Owner Review'
      },
      'room-owner-review': {
        title: 'Room Owner Review',
        sub: 'Approve hours and booking'
      },
      'it-queue': {
        title: 'IT Support Queue',
        sub: 'Assign IT staff and prepare equipment'
      },
      'it-assign': {
        title: 'Assign IT Staff',
        sub: 'Choose technicians and set preparation time'
      },
      'create-room': {
        title: 'Add Meeting Room',
        sub: 'Create a new room in the system'
      }
    };

    // Refine dynamic title/subtitle for specific views
    let title = viewMeta[viewId]?.title || 'Meeting Room Portal';
    let sub = viewMeta[viewId]?.sub || 'National Bank of Cambodia';

    if (viewId === 'room-details' && typeof bookingStore !== 'undefined') {
      const roomId = params.roomId || (window.NBC.views['room-details']?.currentRoomDetailsId) || 'ROOM-101';
      const room = bookingStore.getRoomById(roomId);
      if (room) {
        title = room.name;
        sub = `${room.floor.split('(')[0].trim()} • Details & Photos`;
      }
    } else if (viewId === 'booking-details' && typeof bookingStore !== 'undefined') {
      const reqId = params.requestId || (window.NBC.views['booking-details']?.currentBookingDetailsId);
      const req = bookingStore.getRequestById(reqId);
      if (req) {
        title = req.meetingTitle;
        sub = `Booking Code #${req.referenceCode} • ${req.status}`;
      }
    } else if (viewId === 'request-form' && typeof bookingStore !== 'undefined') {
      const roomId = params.roomId || (window.NBC.views['request-form']?.selectedRoomForBooking?.id) || 'ROOM-102';
      const room = bookingStore.getRoomById(roomId);
      if (room) {
        title = `Book ${room.name}`;
        sub = room.isPrivate 
          ? `${room.floor.split('(')[0].trim()} • Needs 2 Approvals` 
          : `${room.floor.split('(')[0].trim()} • Enter details & time`;
      }
    }

    // Update Topbar
    if (window.NBC.layouts.topbar) {
      window.NBC.layouts.topbar.setTitle(title, sub);
    }

    // Update Sidebar Active Nav
    if (window.NBC.layouts.sidebar) {
      window.NBC.layouts.sidebar.setActiveNav(viewId);
    }

    // Update Mobile Nav Active Nav
    if (window.NBC.layouts.mobileNav) {
      if (typeof window.NBC.layouts.mobileNav.setActiveNav === 'function') {
        window.NBC.layouts.mobileNav.setActiveNav(viewId);
      } else if (typeof window.NBC.layouts.mobileNav.setActive === 'function') {
        window.NBC.layouts.mobileNav.setActive(viewId);
      }
    }

    // Mount View Component into #app-main
    const mainContainer = document.getElementById('app-main');
    const viewObj = window.NBC.views[viewId];
    if (mainContainer && viewObj && typeof viewObj.render === 'function') {
      viewObj.render(mainContainer, params);
    } else if (mainContainer && !viewObj) {
      console.warn(`View '${viewId}' not registered in window.NBC.views`);
    }

    const contentWrapper = document.getElementById('app-content-wrapper');
    if (contentWrapper) {
      contentWrapper.scrollTop = 0;
    }
    if (typeof window.scrollTo === 'function') {
      try { window.scrollTo(0, 0); } catch (_) {}
    }
  }

  renderAll() {
    this.updateSidebarBadges();
    
    // Update active view if it has an update method
    const activeView = window.NBC.views[this.currentView];
    if (activeView && typeof activeView.update === 'function') {
      activeView.update();
    }
  }

  updateSidebarBadges() {
    if (window.NBC.layouts.sidebar) {
      window.NBC.layouts.sidebar.updateBadges();
    }
    if (window.NBC.layouts.mobileNav) {
      window.NBC.layouts.mobileNav.updateBadges();
    }
  }

  toggleMobileSidebar(forceState = null) {
    if (window.NBC.layouts.sidebar) {
      window.NBC.layouts.sidebar.toggleMobile(forceState);
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    const collapsed = sidebar.classList.toggle('sidebar-collapsed');
    localStorage.setItem('nbc-sidebar-collapsed', String(collapsed));
  }

  showToast(title, message, type = 'info') {
    // Toasts permanently removed
    const container = document.getElementById('toast-container');
    if (container) container.remove();
    document.querySelectorAll('[id^="toast-"]').forEach(el => el.remove());
  }

  confirmResetDemo() {
    if (confirm("Do you want to reset all mock data and bookings back to start?")) {
      if (typeof bookingStore !== 'undefined') {
        bookingStore.resetToDefaults(true);
      }
      this.navigateTo('book-room');
    }
  }
}

// Global bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new BankBookingApp();
  });
} else {
  window.app = new BankBookingApp();
}
