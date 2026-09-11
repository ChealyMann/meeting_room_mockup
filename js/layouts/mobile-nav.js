// Mobile Bottom Navigation Bar Component
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};

window.NBC.layouts.mobileNav = {
  activeView: 'book-room',

  render(container) {
    if (!container) return;

    container.className = 'fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#2A0808]/95 backdrop-blur-md border-t border-[#450A0A] select-none';

    container.innerHTML = `
      <div class="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        <!-- Rooms Button -->
        <button
          id="mobile-nav-book-room"
          onclick="app.navigateTo('book-room')"
          class="flex flex-col items-center justify-center flex-1 py-1 text-stone-400 hover:text-white transition cursor-pointer"
        >
          <span class="iconify text-lg mb-0.5" data-icon="lucide:door-open" data-stroke-width="2"></span>
          <span class="text-[10px] font-medium font-heading">Rooms</span>
        </button>

        <!-- My Bookings Button with Badge -->
        <button
          id="mobile-nav-my-bookings"
          onclick="app.navigateTo('my-bookings')"
          class="relative flex flex-col items-center justify-center flex-1 py-1 text-stone-400 hover:text-white transition cursor-pointer"
        >
          <span class="iconify text-lg mb-0.5" data-icon="lucide:calendar-check-2" data-stroke-width="2"></span>
          <span class="text-[10px] font-medium font-heading">Bookings</span>
          <span
            id="mobile-badge-my-bookings"
            class="hidden absolute top-1 right-3 px-1 py-0.2 rounded-full text-[9px] bg-red-900 text-amber-300 font-bold border border-red-700"
          >0</span>
        </button>

        <!-- Review Requests Button with Badge -->
        <button
          id="mobile-nav-pitika-queue"
          onclick="app.navigateTo('pitika-queue')"
          class="relative flex flex-col items-center justify-center flex-1 py-1 text-stone-400 hover:text-white transition cursor-pointer"
        >
          <span class="iconify text-lg mb-0.5" data-icon="lucide:clipboard-check" data-stroke-width="2"></span>
          <span class="text-[10px] font-medium font-heading">Reviews</span>
          <span
            id="mobile-badge-pitika"
            class="hidden absolute top-1 right-3 px-1 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-300 font-bold border border-amber-600"
          >0</span>
        </button>

        <!-- More Menu / Drawer Toggle -->
        <button
          onclick="app.toggleMobileSidebar()"
          class="flex flex-col items-center justify-center flex-1 py-1 text-stone-400 hover:text-white transition cursor-pointer"
          aria-label="Toggle Full Menu"
        >
          <span class="iconify text-lg mb-0.5 text-white" data-icon="lucide:menu" data-stroke-width="2"></span>
          <span class="text-[10px] font-medium font-heading text-white">Menu</span>
        </button>
      </div>
    `;
  },

  setActiveNav(viewId) {
    this.activeView = viewId;
    const btnRooms = document.getElementById('mobile-nav-book-room');
    const btnBookings = document.getElementById('mobile-nav-my-bookings');
    const btnReviews = document.getElementById('mobile-nav-pitika-queue');

    [btnRooms, btnBookings, btnReviews].forEach(b => {
      if (b) {
        b.classList.remove('text-white', 'font-bold');
        b.classList.add('text-stone-400');
      }
    });

    if (viewId === 'book-room' && btnRooms) {
      btnRooms.classList.add('text-white', 'font-bold');
      btnRooms.classList.remove('text-stone-400');
    } else if (viewId === 'my-bookings' && btnBookings) {
      btnBookings.classList.add('text-white', 'font-bold');
      btnBookings.classList.remove('text-stone-400');
    } else if (viewId === 'pitika-queue' && btnReviews) {
      btnReviews.classList.add('text-white', 'font-bold');
      btnReviews.classList.remove('text-stone-400');
    }
  },

  updateBadges() {
    if (typeof bookingStore === 'undefined') return;
    const myBookingsBadge = document.getElementById('mobile-badge-my-bookings');
    const pitikaBadge = document.getElementById('mobile-badge-pitika');

    const bookings = bookingStore.getRequests ? bookingStore.getRequests() : [];
    if (myBookingsBadge) {
      myBookingsBadge.innerText = bookings.length;
      myBookingsBadge.classList.toggle('hidden', bookings.length === 0);
    }
    if (pitikaBadge) {
      const pendingCount = bookings.filter(r => r.status === 'Pending Review' || r.status === 'Pending Manager Review').length;
      pitikaBadge.innerText = pendingCount;
      pitikaBadge.classList.toggle('hidden', pendingCount === 0);
    }
  }
};
