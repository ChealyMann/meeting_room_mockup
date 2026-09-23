// Booking Details View Component (view-booking-details)
// Executive Studio 5/7 Layout mirroring room-details.view.js
// TypeUI Cafe Design System with NBC Crimson Heritage
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class BookingDetailsView {
  constructor() {
    this.id = 'booking-details';
    this.currentBookingDetailsId = null;
    this.currentModalImageIndex = 0;
    this.showServicesDrawer = false;
    this.showLocationDrawer = false;
    this.currentReq = null;
    this.currentRoom = null;
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

  init(params = {}) {
    if (params.requestId) this.currentBookingDetailsId = params.requestId;
    if (params.initialIndex !== undefined) this.currentModalImageIndex = params.initialIndex;
    
    window.app = window.app || {};
    window.app.openBookingDetailsPage = (id) => this.openBookingDetailsPage(id);
    window.app.handleCancelBooking = (id) => this.handleCancelBooking(id);
    window.app.downloadCalendarInvite = (id) => this.downloadCalendarInvite(id);
    window.app.copyReferenceCode = (code, label) => this.copyReferenceCode(code, label);
    window.app.handleAddFoodDrinks = (id) => this.handleAddFoodDrinks(id);
    window.app.handleViewRequestDetails = (id) => this.handleViewRequestDetails(id);
    window.app.handleContactSupport = (id) => this.handleContactSupport(id);
  }

  render(container, params = {}) {
    if (!container) return;
    const requestId = params.requestId || this.currentBookingDetailsId || 'REQ-001';
    this.currentBookingDetailsId = requestId;
    this.currentModalImageIndex = params.initialIndex !== undefined ? params.initialIndex : 0;
    
    container.innerHTML = `
      <div id="view-booking-details" class="w-full"></div>
    `;
    this.renderBookingDetailsPage(requestId);
  }

  openBookingDetailsPage(requestId, initialIndex = 0) {
    this.currentBookingDetailsId = requestId;
    this.currentModalImageIndex = initialIndex;
    this.navigateTo('booking-details', { requestId });
  }

  navigateBookingRoomImage(delta) {
    if (!this.currentRoom) return;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === this.currentRoom.id) : null;
    const images = initRoom?.images || this.currentRoom.images || [this.currentRoom.image];
    this.currentModalImageIndex = (this.currentModalImageIndex + delta + images.length) % images.length;
    this.updateImageGalleryUI(images);
  }

  setBookingRoomImage(index) {
    if (!this.currentRoom) return;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === this.currentRoom.id) : null;
    const images = initRoom?.images || this.currentRoom.images || [this.currentRoom.image];
    this.currentModalImageIndex = index;
    this.updateImageGalleryUI(images);
  }

  updateImageGalleryUI(images) {
    const mainImgEl = document.getElementById('booking-active-room-img');
    const counterEl = document.getElementById('booking-photo-counter');
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);

    if (mainImgEl) {
      mainImgEl.src = images[currentIndex] || images[0];
    }
    if (counterEl) {
      counterEl.innerText = `${currentIndex + 1} / ${images.length}`;
    }

    const thumbs = document.querySelectorAll('.booking-thumb-btn');
    thumbs.forEach((thumb, idx) => {
      if (idx === currentIndex) {
        thumb.className = 'booking-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-[#991B1B] shadow-xs opacity-100 cursor-pointer transition';
      } else {
        thumb.className = 'booking-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-[#E9E3DD] opacity-50 hover:opacity-90 cursor-pointer transition';
      }
    });
  }

  toggleServicesDrawer(show) {
    this.showServicesDrawer = show;
    const drawerEl = document.getElementById('booking-services-drawer');
    const backdropEl = document.getElementById('booking-services-backdrop');
    const panelEl = document.getElementById('booking-services-panel');
    if (!drawerEl || !backdropEl || !panelEl) return;

    if (show) {
      drawerEl.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdropEl.classList.remove('opacity-0');
        backdropEl.classList.add('opacity-100');
        panelEl.classList.remove('translate-x-full');
        panelEl.classList.add('translate-x-0');
      });
    } else {
      backdropEl.classList.remove('opacity-100');
      backdropEl.classList.add('opacity-0');
      panelEl.classList.remove('translate-x-0');
      panelEl.classList.add('translate-x-full');
      setTimeout(() => {
        drawerEl.classList.add('hidden');
      }, 250);
    }
  }

  toggleLocationDrawer(show) {
    this.showLocationDrawer = show;
    const drawerEl = document.getElementById('booking-location-drawer');
    const backdropEl = document.getElementById('booking-location-backdrop');
    const panelEl = document.getElementById('booking-location-panel');
    if (!drawerEl || !backdropEl || !panelEl) return;

    if (show) {
      drawerEl.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdropEl.classList.remove('opacity-0');
        backdropEl.classList.add('opacity-100');
        panelEl.classList.remove('translate-x-full');
        panelEl.classList.add('translate-x-0');
      });
    } else {
      backdropEl.classList.remove('opacity-100');
      backdropEl.classList.add('opacity-0');
      panelEl.classList.remove('translate-x-0');
      panelEl.classList.add('translate-x-full');
      setTimeout(() => {
        drawerEl.classList.add('hidden');
      }, 250);
    }
  }

  renderBookingDetailsPage(requestId) {
    const container = document.getElementById('view-booking-details');
    if (!container) return;

    const req = (typeof bookingStore !== 'undefined') ? bookingStore.getRequestById(requestId) : null;
    if (!req) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-2xs space-y-3.5 my-4 animate-empty-state">
          <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
            <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:calendar-x-2" data-stroke-width="1.8"></span>
          </div>
          <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Booking Request Not Found</h3>
          <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">
            The requested reservation record does not exist or may have been removed.
          </p>
          <button type="button" onclick="app.navigateTo('my-bookings')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 bg-[#991B1B] hover:bg-[#7F1D1D] transition shadow-xs cursor-pointer active:scale-[0.98]">
            <span class="iconify text-xs text-white" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
            <span class="text-white">Back to My Bookings</span>
          </button>
        </div>
      `;
      if (window.Iconify && typeof window.Iconify.scan === 'function') {
        window.Iconify.scan(container);
      }
      return;
    }

    this.currentReq = req;
    const roomObj = (req.room?.id && bookingStore.getRoomById(req.room.id)) || bookingStore.getRooms()[0] || req.room || {};
    this.currentRoom = roomObj;

    const isPrivate = !!req.isPrivateRequest || !!roomObj.isPrivate;
    const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
    const isCancelled = req.status === 'Cancelled';
    const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
    const isOwnerPending = isPrivate && req.status === 'Pending Room Owner Approval';
    const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isMyRoom = req.isMyRoom || (roomObj.id === 'ROOM-107' || roomObj.roomOwner?.name === 'Jonathan Vance' || roomObj.roomOwner?.id === 'OWNER-VANCE');
    const isPitikaApproved = req.managerReview?.decision === 'Approved';
    const isCancelledAfterPitika = isCancelled && isPitikaApproved;
    const isCancelledBeforePitika = isCancelled && !isPitikaApproved;
    const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');

    let statusLabel = 'In Review';
    let statusIcon = 'lucide:clock';
    let statusToneClass = 'text-[#B45309]';
    if (isConfirmed) {
      statusLabel = 'Confirmed';
      statusIcon = 'lucide:check-circle-2';
      statusToneClass = 'text-emerald-700';
    } else if (isSetup) {
      statusLabel = 'In Progress';
      statusIcon = 'lucide:settings';
      statusToneClass = 'text-blue-700';
    } else if (isRejected) {
      statusLabel = 'Rejected';
      statusIcon = 'lucide:x-circle';
      statusToneClass = 'text-rose-700';
    } else if (isCancelled) {
      statusLabel = 'Cancelled';
      statusIcon = 'lucide:slash';
      statusToneClass = 'text-stone-600';
    }

    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === roomObj.id) : null;
    const images = initRoom?.images || roomObj.images || [roomObj.image || 'assets/rooms/boardroom.jpg'];
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);
    const currentImg = images[currentIndex] || images[0];

    const formatFloorShort = (floorStr) => {
      if (!floorStr) return 'Ground Floor';
      const match = String(floorStr).match(/(?:Level|Floor)\s*(\d+)/i);
      if (match) return `Floor ${match[1]}`;
      if (/ground/i.test(floorStr)) return 'Ground Floor';
      return String(floorStr).split('(')[0].split('-')[0].trim().replace(/level/i, 'Floor');
    };
    const floorShort = formatFloorShort(roomObj.floor || 'Floor 18');
    
    const doorAccess = (typeof bookingStore !== 'undefined' && bookingStore.getDoorAccessState)
      ? bookingStore.getDoorAccessState(req)
      : { code: req.doorPasscode || req.referenceCode, expiresAt: null, isExpired: false };

    let durationText = '1 hour';
    if (req.startTime && req.endTime) {
      const startParts = req.startTime.split(':').map(Number);
      const endParts = req.endTime.split(':').map(Number);
      if (startParts.length === 2 && endParts.length === 2) {
        const diffMinutes = (endParts[0] * 60 + endParts[1]) - (startParts[0] * 60 + startParts[1]);
        if (diffMinutes > 0) {
          const hours = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          if (hours > 0 && mins > 0) durationText = `${hours}h ${mins}m`;
          else if (hours > 0) durationText = `${hours} hour${hours > 1 ? 's' : ''}`;
          else durationText = `${mins} mins`;
        }
      }
    }

    const mapInfo = (typeof bookingStore !== 'undefined' && bookingStore.getRoomMapDetails) ? bookingStore.getRoomMapDetails(roomObj) : {
      building: 'National Bank of Cambodia - Headquarters',
      address: 'No. 22-24, Preah Norodom Blvd, Phnom Penh, Cambodia',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770638148902!2d104.920556!3d11.573611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3107870560a6a445%3A0x6a0f7e4113e00b39!2sNational%20Bank%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1700000000000',
      directionsUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia',
      externalUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia'
    };

    const activeServicesCount = (req.needsIT ? 1 : 0) + (req.needsCatering ? 1 : 0);

    container.innerHTML = `
      <!-- Main Studio Viewport (Strictly No Full-Page Vertical Scroll on Desktop) -->
      <div class="flex flex-col gap-4 lg:h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)] lg:overflow-hidden select-none">
        
        <!-- Top Action Bar: Clean, Confident, Modern -->
        <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0">
          <div class="flex items-center gap-3">
            <button
              onclick="app.navigateTo('my-bookings')"
              class="h-9 px-3 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              type="button"
            >
              <span class="iconify text-[#7D6857] text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
              <span>My Bookings</span>
            </button>
            <div class="h-4 w-px bg-[#E9E3DD]"></div>
            <div class="flex items-center gap-2.5">
              <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] leading-tight flex items-center gap-2">
                <span>${roomObj.name || req.meetingTitle || 'Booking Details'}</span>
              </h2>
              <span class="${statusToneClass} text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] shadow-2xs">
                <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
                <span>${statusLabel}</span>
              </span>
            </div>
          </div>

          <!-- Quick Action Controls & Slide-Over Drawer Triggers -->
          <div class="flex items-center gap-2">
            <!-- Booking Reference Code Button -->
            <button
              type="button"
              onclick="app.copyReferenceCode('${req.referenceCode || req.id}', 'Booking Code')"
              class="h-9 px-3 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] font-mono text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Click to copy booking code"
            >
              <span class="iconify text-[#7D6857] text-xs" data-icon="lucide:copy" data-stroke-width="1.8"></span>
              <span>#${req.referenceCode || req.id}</span>
            </button>

            <!-- Slide-Over Services & Support Drawer Button -->
            <button
              onclick="window.NBC.views['booking-details'].toggleServicesDrawer(true)"
              class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              type="button"
              title="Open Services & Support Drawer"
            >
              <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:concierge-bell" data-stroke-width="2"></span>
              <span>Services & Support</span>
              ${activeServicesCount > 0 ? `
                <span class="font-mono text-xs font-bold text-[#991B1B]">(${activeServicesCount})</span>
              ` : ''}
            </button>

            <!-- Slide-Over Map Drawer Button -->
            <button
              onclick="window.NBC.views['booking-details'].toggleLocationDrawer(true)"
              class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              type="button"
              title="Open Location & Map Drawer"
            >
              <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:map-pin" data-stroke-width="2"></span>
              <span>Location</span>
            </button>

            ${isConfirmed ? `
              <button
                type="button"
                onclick="app.openReceiptPage('${req.id}', 'booking-details')"
                class="h-9 px-3.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-[0.98]"
                title="View Booking Receipt"
              >
                <span class="iconify text-white text-sm" data-icon="lucide:file-text" data-stroke-width="2"></span>
                <span class="text-white">Receipt</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- MAIN STUDIO GRID: 5 Cols Showcase & Specs + 7 Cols Interactive Workspace -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
          
          <!-- =============================================================== -->
          <!-- LEFT COLUMN: CINEMATIC SHOWCASE & SPECS (5 Cols)                -->
          <!-- =============================================================== -->
          <div class="lg:col-span-5 flex flex-col gap-4 overflow-hidden">

            <!-- Visual Stage Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-3 space-y-2.5 shadow-xs shrink-0">
              <div class="relative h-60 sm:h-64 rounded-xl overflow-hidden bg-stone-900 group select-none">
                <img id="booking-active-room-img" src="${currentImg}" alt="${roomObj.name || 'Meeting Room'}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

                <!-- Top Floating Clean Pill Tags (Strictly No Badges) -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#260707]/90 text-white backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                    <span class="iconify text-xs" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:globe'}" data-stroke-width="2"></span>
                    <span>${isPrivate ? 'Private Room' : 'Shared Room'}</span>
                  </span>

                  <span id="booking-photo-counter" class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs border border-white/20">
                    ${currentIndex + 1} / ${images.length}
                  </span>
                </div>

                <!-- Left / Right Carousel Controls -->
                ${images.length > 1 ? `
                  <button
                    onclick="window.NBC.views['booking-details'].navigateBookingRoomImage(-1)"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition border border-white/20 cursor-pointer"
                    type="button"
                    title="Previous photo"
                  >
                    <span class="iconify text-sm" data-icon="lucide:chevron-left" data-stroke-width="2.5"></span>
                  </button>
                  <button
                    onclick="window.NBC.views['booking-details'].navigateBookingRoomImage(1)"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition border border-white/20 cursor-pointer"
                    type="button"
                    title="Next photo"
                  >
                    <span class="iconify text-sm" data-icon="lucide:chevron-right" data-stroke-width="2.5"></span>
                  </button>
                ` : ''}

                <!-- Bottom Location Path Overlay -->
                <div class="absolute bottom-3 left-3.5 right-3.5 text-white pointer-events-none">
                  <span class="text-xs font-medium text-stone-300 drop-shadow-xs flex items-center gap-1.5">
                    <span class="iconify text-sm text-[#FACC15]" data-icon="lucide:landmark" data-stroke-width="2"></span>
                    <span>${roomObj.name || req.room?.name || 'Meeting Room'} &bull; ${floorShort}</span>
                  </span>
                </div>
              </div>

              <!-- Thumbnail Strip Glider -->
              <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                ${images.map((img, idx) => `
                  <button
                    onclick="window.NBC.views['booking-details'].setBookingRoomImage(${idx})"
                    class="booking-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${idx === currentIndex ? 'border-[#991B1B] shadow-xs' : 'border-[#E9E3DD] opacity-50 hover:opacity-90'}"
                    type="button"
                    title="Photo ${idx + 1}"
                  >
                    <img src="${img}" alt="${roomObj.name || 'Room photo'}" class="w-full h-full object-cover" />
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Room Specifications & 3-Metric Grid -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 flex-1 flex flex-col justify-between shadow-xs overflow-hidden">
              <div class="space-y-3">
                <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Room Specifications</h3>

                <!-- 3-Stat Metric Row -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Capacity</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${roomObj.capacity || req.attendees || 8} Seats</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Room Area</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${roomObj.size || '45 sq m'}</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Floor</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${floorShort}</strong>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-xs text-[#6F5849] leading-relaxed line-clamp-3">
                  ${roomObj.description || 'Modern conference room equipped for high-level delegations, executive board assemblies, and hybrid remote collaboration.'}
                </p>
              </div>

              <!-- Bottom Footer Details -->
              <div class="pt-2.5 border-t border-[#E9E3DD] flex items-center justify-between text-xs text-[#6F5849]">
                <span class="flex items-center gap-1.5 truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:shield-check"></span>
                  <span class="truncate">${roomObj.department || 'National Bank of Cambodia'}</span>
                </span>
                <span class="font-mono text-[11px] text-emerald-700 font-semibold shrink-0 ml-2">${statusLabel}</span>
              </div>
            </div>

          </div>

          <!-- =============================================================== -->
          <!-- RIGHT COLUMN: INTERACTIVE WORKSPACE (7 Cols)                    -->
          <!-- =============================================================== -->
          <div class="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
            
            <!-- Approval Progress Stepper Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col shrink-0 space-y-3.5">
              <div class="flex items-center justify-between gap-3 pb-2.5 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Approval Progress</h3>
                  <span class="${statusToneClass} text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD]">
                    <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
                    <span>${statusLabel}</span>
                  </span>
                </div>
                <span class="font-mono text-[11px] text-[#7D6857]">${req.submissionTimestamp || req.submittedText || 'Submitted'}</span>
              </div>
              ${this._renderStepper(req, isPrivate, isMyRoom, isConfirmed, isSetup, isOwnerPending, isPending, isRejected, isCancelled, isCancelledAfterPitika, isCancelledBeforePitika, isOwnerRejected)}
            </div>

            <!-- Meeting Overview & Booking Specs Deck (Harmonized Cafe Design System) -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
              <div class="space-y-3.5 sm:space-y-4 overflow-y-auto no-scrollbar pr-0.5">
                
                <!-- Meeting Room Booking Header -->
                <div class="flex items-center gap-3 sm:gap-3.5 pb-3 sm:pb-3.5 border-b border-[#E9E3DD]">
                  <div class="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-lg sm:text-xl text-[#991B1B]" data-icon="lucide:calendar-days" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold text-[#7D6857] block leading-none">Meeting Room Booking</span>
                    <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight mt-1 leading-snug truncate">
                      ${req.meetingTitle || 'Talking about business'}
                    </h3>
                    <div class="flex items-center gap-1.5 sm:gap-2 mt-1 text-[11px] sm:text-xs text-[#6F5849] font-medium flex-wrap">
                      <span class="flex items-center gap-1 text-[#991B1B]">
                        <span class="iconify text-xs" data-icon="lucide:calendar" data-stroke-width="2"></span>
                        <span class="font-mono text-[#3E2B1E]">${req.date || '2026-09-23'}</span>
                      </span>
                      <span class="text-stone-300" aria-hidden="true">&bull;</span>
                      <span class="flex items-center gap-1 text-[#991B1B]">
                        <span class="iconify text-xs" data-icon="lucide:clock" data-stroke-width="2"></span>
                        <span class="font-mono text-[#3E2B1E]">${req.startTime || '08:30'} – ${req.endTime || '09:30'}</span>
                      </span>
                      <span class="text-[#7D6857] text-[10.5px] sm:text-[11px] font-normal">(${durationText})</span>
                    </div>
                  </div>
                </div>

                <!-- 4-Metric Booking Specs Grid (Tuned to fit without wrapping or truncation) -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                  <!-- Attendees -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#3E2B1E] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:users" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Attendees</span>
                      <strong class="font-heading font-bold text-[11px] sm:text-xs text-[#3E2B1E] block mt-1 truncate leading-none">${req.attendees || 8} People</strong>
                    </div>
                  </div>

                  <!-- Booking Code -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Booking Code</span>
                      <div class="flex items-center justify-between gap-1 mt-1">
                        <strong class="font-mono font-bold text-[11px] sm:text-xs text-[#991B1B] truncate leading-none">${req.referenceCode || req.id}</strong>
                        <button
                          type="button"
                          onclick="app.copyReferenceCode('${req.referenceCode || req.id}', 'Booking Code')"
                          class="text-[#7D6857] hover:text-[#991B1B] transition cursor-pointer p-0.5 shrink-0"
                          title="Copy booking code"
                        >
                          <span class="iconify text-xs" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Door Access -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:key-round" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Door Access</span>
                      <div class="flex items-center justify-between gap-1 mt-1">
                        <strong class="font-mono font-bold text-[11px] sm:text-xs ${doorAccess.isExpired ? 'text-[#7D6857]' : 'text-emerald-700'} truncate leading-none">
                          ${doorAccess.isExpired ? 'Expired' : (doorAccess.code || 'Active')}
                        </strong>
                        ${doorAccess.code && !doorAccess.isExpired ? `
                          <button
                            type="button"
                            onclick="app.copyReferenceCode('${doorAccess.code}', 'Door Access Code')"
                            class="text-[#7D6857] hover:text-emerald-700 transition cursor-pointer p-0.5 shrink-0"
                            title="Copy door code"
                          >
                            <span class="iconify text-xs" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>

                  <!-- Session Type -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:tag" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Session Type</span>
                      <strong class="font-heading font-bold text-[11px] sm:text-xs text-[#3E2B1E] block mt-1 truncate leading-none" title="${isPrivate ? 'Private Session' : 'Standard Session'}">
                        ${isPrivate ? 'Private Session' : 'Standard Session'}
                      </strong>
                    </div>
                  </div>
                </div>

                <!-- 2-Column Row: Booked By & Purpose -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                  <!-- Booked By -->
                  <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:user" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[10px] uppercase tracking-wider font-semibold text-[#7D6857] block truncate">Booked By</span>
                      <strong class="font-heading font-bold text-xs text-[#3E2B1E] block mt-0.5 truncate">${req.requester?.name || 'Marn Chedly'}</strong>
                      <span class="text-[11px] text-[#7D6857] block mt-0.5 truncate">${req.requester?.department || 'Board of Directors & Cabinet'} &bull; ${req.requester?.office || 'Board & Executive Office'}</span>
                    </div>
                  </div>

                  <!-- Meeting Purpose & Notes -->
                  <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[10px] uppercase tracking-wider font-semibold text-[#7D6857] block truncate">Meeting Purpose & Notes</span>
                      <p class="text-xs text-[#3E2B1E] font-medium mt-0.5 leading-relaxed truncate">${req.meetingPurpose || req.notes || 'Kindly and review the room.'}</p>
                    </div>
                  </div>
                </div>

                <!-- Private Room Justification Banner -->
                ${(isPrivate || req.privateJustification) ? `
                  <div class="p-3 sm:p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-start gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-amber-100/80 border border-amber-300/60 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span class="iconify text-sm" data-icon="lucide:shield-alert" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">Private Room Justification</span>
                      <p class="text-xs text-[#78350F] leading-relaxed mt-0.5">${req.privateJustification || 'All standard meeting rooms are occupied today. Confidential executive session required.'}</p>
                    </div>
                  </div>
                ` : ''}

              </div>

              <!-- Bottom Action Buttons Row -->
              <div class="pt-3 border-t border-[#E9E3DD] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onclick="app.downloadCalendarInvite('${req.id}')"
                  class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  <span class="iconify text-sm text-[#3E2B1E]" data-icon="lucide:calendar-plus" data-stroke-width="2"></span>
                  <span>Add to Calendar</span>
                </button>

                ${!isCancelled && !isRejected ? `
                  <button
                    type="button"
                    onclick="app.handleCancelBooking('${req.id}')"
                    class="h-9 px-3.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
                  >
                    <span class="iconify text-sm text-rose-600" data-icon="lucide:x-circle" data-stroke-width="2"></span>
                    <span>Cancel Booking</span>
                  </button>
                ` : ''}
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- =============================================================== -->
      <!-- SLIDE-OVER DRAWER: SERVICES & SUPPORT LOGISTICS                 -->
      <!-- =============================================================== -->
      <div id="booking-services-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="booking-services-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['booking-details'].toggleServicesDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="booking-services-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col h-full shadow-2xl transition-transform duration-300 translate-x-full">
            
            <!-- Drawer Header (shrink-0) -->
            <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shadow-2xs">
                  <span class="iconify text-base" data-icon="lucide:concierge-bell" data-stroke-width="2"></span>
                </span>
                <div class="flex items-center gap-2">
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Services & Support</h3>
                  ${activeServicesCount > 0 ? `
                    <span class="font-mono text-xs font-bold text-[#991B1B]">(${activeServicesCount})</span>
                  ` : ''}
                </div>
              </div>
              <button
                onclick="window.NBC.views['booking-details'].toggleServicesDrawer(false)"
                class="w-8 h-8 rounded-xl bg-[#FAF7F4] hover:bg-white border border-[#E9E3DD] flex items-center justify-center text-[#7D6857] hover:text-[#3E2B1E] cursor-pointer transition shadow-2xs active:scale-[0.96]"
                type="button"
                title="Close drawer"
              >
                <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
              </button>
            </div>

            <!-- Drawer Body (flex-1 overflow-y-auto) -->
            <div class="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 pr-0.5">
              ${(req.needsIT && !req.needsCatering) ? `
                ${this._renderITCard(req, isConfirmed)}
                ${this._renderFoodCard(req)}
              ` : `
                ${this._renderFoodCard(req)}
                ${this._renderITCard(req, isConfirmed)}
              `}
            </div>

            <!-- Drawer Footer (shrink-0) -->
            <div class="pt-3 border-t border-[#E9E3DD] flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onclick="app.handleContactSupport('${req.id}')"
                class="flex-1 h-10 rounded-xl bg-[#FAF7F4] hover:bg-white text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:phone-call" data-stroke-width="2"></span>
                <span>Contact Support</span>
              </button>
              <button
                type="button"
                onclick="window.NBC.views['booking-details'].toggleServicesDrawer(false)"
                class="h-10 px-4 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#7D6857] hover:text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center transition cursor-pointer active:scale-[0.98]"
              >
                <span>Close</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- =============================================================== -->
      <!-- SLIDE-OVER DRAWER: FACILITY MAP & CAMPUS LOCATION               -->
      <!-- =============================================================== -->
      <div id="booking-location-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="booking-location-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['booking-details'].toggleLocationDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="booking-location-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col justify-between shadow-2xl space-y-5 transition-transform duration-300 translate-x-full">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-base" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Facility Location & Access</h3>
                </div>
                <button
                  onclick="window.NBC.views['booking-details'].toggleLocationDrawer(false)"
                  class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer transition"
                  type="button"
                >
                  <span class="iconify text-base" data-icon="lucide:x" data-stroke-width="2"></span>
                </button>
              </div>

              <div>
                <strong class="font-heading font-bold text-sm text-[#3E2B1E] block">${mapInfo.building}</strong>
                <span class="text-xs text-[#6F5849] mt-1 block leading-relaxed">${mapInfo.address}</span>
              </div>

              <!-- Interactive Google Map Embed -->
              <div class="h-64 rounded-xl overflow-hidden border border-[#E9E3DD] bg-stone-100 shadow-inner">
                <iframe
                  title="Google Map Drawer"
                  width="100%"
                  height="100%"
                  style="border:0;"
                  loading="lazy"
                  src="${mapInfo.embedUrl}"
                ></iframe>
              </div>

              <div class="p-3.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-xs space-y-1.5">
                <span class="font-semibold text-[#3E2B1E] flex items-center gap-1.5">
                  <span class="iconify text-amber-700 text-sm" data-icon="lucide:info" data-stroke-width="2"></span>
                  <span>Arrival & Security Protocol:</span>
                </span>
                <p class="text-[#6F5849] leading-relaxed">Present official NBC staff badge or booking reference <strong class="font-mono text-[#3E2B1E]">${req.referenceCode || req.id}</strong> at the security barrier. Elevators provide verified access to ${floorShort}.</p>
              </div>
            </div>

            <div class="pt-3 border-t border-[#E9E3DD]">
              <a
                href="${mapInfo.externalUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full h-11 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs text-center cursor-pointer"
              >
                <span class="iconify text-white text-sm" data-icon="lucide:external-link" data-stroke-width="2"></span>
                <span>Open in Google Maps</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    `;

    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(container);
    }
  }

  _renderFoodCard(req) {
    return `
      <!-- Card: Food & Catering -->
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 shadow-2xs space-y-3">
        <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-amber-700 flex items-center justify-center shrink-0">
              <span class="iconify text-base" data-icon="lucide:utensils" data-stroke-width="2"></span>
            </span>
            <h4 class="font-heading font-bold text-sm text-[#3E2B1E]">Food & Catering</h4>
          </div>
          ${req.needsCatering ? `
            <span class="font-mono text-xs font-semibold text-amber-800 flex items-center gap-1">
              <span class="iconify text-xs" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
              <span>Requested</span>
            </span>
          ` : `
            <span class="font-mono text-xs font-medium text-[#7D6857]">None</span>
          `}
        </div>

        ${req.needsCatering ? `
          <div class="space-y-2.5 bg-[#FAF7F4] p-3 rounded-xl border border-[#E9E3DD]">
            <div class="flex items-center justify-between text-xs pb-1.5 border-b border-[#E9E3DD]">
              <span class="text-[#7D6857] font-medium">Selected Package</span>
              <strong class="text-[#3E2B1E] font-semibold">${req.cateringDetails?.packageName?.split('(')[0]?.trim() || 'Executive Hospitality Selection'}</strong>
            </div>
            <div class="flex items-center justify-between text-xs pb-1.5 border-b border-[#E9E3DD]">
              <span class="text-[#7D6857] font-medium">Portions</span>
              <strong class="text-[#3E2B1E] font-mono font-semibold">${req.cateringDetails?.servings || req.attendees || 8} Servings</strong>
            </div>
            <div class="flex items-center justify-between text-xs pb-1.5 border-b border-[#E9E3DD]">
              <span class="text-[#7D6857] font-medium">Delivery Time</span>
              <strong class="text-[#3E2B1E] font-mono font-semibold">${req.cateringDetails?.deliveryTime || req.startTime || '08:00'}</strong>
            </div>
            <div class="text-xs pt-0.5">
              <span class="text-[10px] uppercase font-bold tracking-wider text-[#7D6857] block">Dietary & Remarks</span>
              <p class="text-xs text-[#3E2B1E] mt-0.5 leading-relaxed">${req.cateringDetails?.dietaryRemarks || req.cateringDetails?.dietary || 'Standard hospitality service.'}</p>
            </div>
          </div>
        ` : `
          <div class="p-3 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] flex items-start gap-2.5">
            <span class="iconify text-[#7D6857] text-base shrink-0 mt-0.5" data-icon="lucide:coffee" data-stroke-width="1.8"></span>
            <p class="text-xs text-[#6F5849] leading-relaxed">
              No catering requested for this reservation. Coffee, tea, and refreshments can be coordinated via the hospitality desk on the floor.
            </p>
          </div>
        `}
      </div>
    `;
  }

  _renderITCard(req, isConfirmed) {
    return `
      <!-- Card: IT & AV Support -->
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 shadow-2xs space-y-3">
        <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0">
              <span class="iconify text-base" data-icon="lucide:headset" data-stroke-width="2"></span>
            </span>
            <h4 class="font-heading font-bold text-sm text-[#3E2B1E]">IT & AV Support</h4>
          </div>
          ${req.needsIT ? `
            <span class="font-mono text-xs font-semibold ${isConfirmed ? 'text-emerald-700' : 'text-[#991B1B]'} flex items-center gap-1">
              <span class="iconify text-xs" data-icon="${isConfirmed ? 'lucide:check-circle-2' : 'lucide:clock'}" data-stroke-width="2"></span>
              <span>${isConfirmed ? 'Ready' : 'Requested'}</span>
            </span>
          ` : `
            <span class="font-mono text-xs font-medium text-[#7D6857]">Standard</span>
          `}
        </div>

        ${req.needsIT ? `
          <div class="space-y-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#7D6857] block mb-2">Required Equipment</span>
              <div class="space-y-1.5">
                ${(req.itDetails?.requestedItems || ['Conference Video Polycom', 'Wireless Microphones']).map(item => `
                  <div class="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-xs text-[#3E2B1E] font-medium">
                    <span class="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    </span>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Assigned Technicians -->
            <div class="pt-3 border-t border-[#E9E3DD]">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#7D6857] block mb-2">Assigned IT Technician</span>
              ${(req.itDetails?.assignedStaffList && req.itDetails.assignedStaffList.length > 0) ? `
                <div class="space-y-2">
                  ${req.itDetails.assignedStaffList.map(s => `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <img src="${s.avatar || 'assets/photo_2026-09-22_14-16-49.jpg'}" alt="${s.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-white border border-[#E9E3DD] shrink-0" />
                        <div class="min-w-0">
                          <strong class="font-heading font-bold text-xs text-[#3E2B1E] block truncate">${s.name}</strong>
                          <span class="text-[10.5px] text-[#7D6857] block truncate">${s.title || s.role || 'IT Support Specialist'}</span>
                        </div>
                      </div>
                      <span class="text-[11px] font-mono font-semibold text-emerald-700 flex items-center gap-1 shrink-0 ml-2">
                        <span class="iconify text-xs" data-icon="lucide:check-circle-2"></span>
                        <span>Ready</span>
                      </span>
                    </div>
                  `).join('')}
                </div>
              ` : (req.itDetails?.assignedStaff ? `
                <div class="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img src="${req.itDetails.assignedStaff.avatar || 'assets/photo_2026-09-22_14-16-49.jpg'}" alt="${req.itDetails.assignedStaff.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-white border border-[#E9E3DD] shrink-0" />
                    <div class="min-w-0">
                      <strong class="font-heading font-bold text-xs text-[#3E2B1E] block truncate">${req.itDetails.assignedStaff.name}</strong>
                      <span class="text-[10.5px] text-[#7D6857] block truncate">${req.itDetails.assignedStaff.title || req.itDetails.assignedStaff.role || 'IT Support Specialist'}</span>
                    </div>
                  </div>
                  <span class="text-[11px] font-mono font-semibold text-emerald-700 flex items-center gap-1 shrink-0 ml-2">
                    <span class="iconify text-xs" data-icon="lucide:check-circle-2"></span>
                    <span>Ready</span>
                  </span>
                </div>
              ` : `
                <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
                  <span class="iconify text-amber-700 text-sm shrink-0" data-icon="lucide:clock-4"></span>
                  <span>Technicians assigned 30 minutes prior to session.</span>
                </div>
              `)}
            </div>
          </div>
        ` : `
          <div class="p-3 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] flex items-start gap-2.5">
            <span class="iconify text-[#7D6857] text-base shrink-0 mt-0.5" data-icon="lucide:monitor-check" data-stroke-width="1.8"></span>
            <p class="text-xs text-[#6F5849] leading-relaxed">
              Standard room setup ready: presentation screen, power hubs, and high-speed Wi-Fi access.
            </p>
          </div>
        `}
      </div>
    `;
  }

  // Dynamic Stepper Generator
  _renderStepper(req, isPrivate, isMyRoom, isConfirmed, isSetup, isOwnerPending, isPending, isRejected, isCancelled, isCancelledAfterPitika, isCancelledBeforePitika, isOwnerRejected) {
    let steps = [];

    if (isMyRoom && !req.needsIT && !req.needsCatering) {
      steps = [
        { label: '1. Booked', sub: 'Instant', state: 'completed' },
        { label: '2. Setup', sub: 'Ready', state: 'completed' },
        { label: '3. Door Pass', sub: 'Active', state: 'completed' }
      ];
    } else if (isMyRoom && (req.needsIT || req.needsCatering)) {
      steps = [
        { label: '1. Booked', sub: 'Instant', state: 'completed' },
        { label: '2. Cost Review', sub: isConfirmed || isSetup ? 'Approved' : (isPending ? 'In Review' : 'Rejected'), state: isConfirmed || isSetup ? 'completed' : (isPending ? 'active' : 'pending') },
        { label: '3. IT Setup', sub: isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : 'Waiting'), state: isConfirmed ? 'completed' : (isSetup ? 'active' : 'pending') },
        { label: '4. Door Pass', sub: isConfirmed ? 'Active' : 'Pending', state: isConfirmed ? 'completed' : 'pending' }
      ];
    } else if (isPrivate) {
      const step1State = 'completed';
      const step2State = isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'completed' : (isPending ? 'active' : (isRejected ? 'failed' : 'pending'));
      const step3State = isConfirmed || isSetup ? 'completed' : (isOwnerPending ? 'active' : (isOwnerRejected || isCancelledAfterPitika ? 'failed' : 'pending'));
      const step4State = isConfirmed ? 'completed' : (isSetup ? 'active' : 'pending');
      const step5State = isConfirmed ? 'completed' : 'pending';

      const step2Sub = isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'Approved' : (isPending ? 'In Review' : (isRejected ? 'Rejected' : 'Waiting'));
      const step3Sub = isConfirmed || isSetup ? 'Approved' : (isOwnerPending ? 'In Review' : (isOwnerRejected ? 'Rejected' : 'Waiting'));
      const step4Sub = isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : (isPending || isOwnerPending ? 'Waiting' : 'Pending'));
      const step5Sub = isConfirmed ? 'Confirmed' : 'Pending';

      steps = [
        { label: '1. Sent', sub: 'Just now', state: step1State },
        { label: '2. Pitika', sub: step2Sub, state: step2State },
        { label: '3. Room Owner', sub: step3Sub, state: step3State },
        { label: '4. IT Setup', sub: step4Sub, state: step4State },
        { label: '5. Door Pass', sub: step5Sub, state: step5State }
      ];
    } else {
      const step1State = 'completed';
      const step2State = isConfirmed || isSetup ? 'completed' : (isPending ? 'active' : 'pending');
      const step3State = isConfirmed ? 'completed' : (isSetup ? 'active' : 'pending');
      const step4State = isConfirmed ? 'completed' : 'pending';

      steps = [
        { label: '1. Sent', sub: 'Submitted', state: step1State },
        { label: '2. Pitika', sub: isConfirmed || isSetup ? 'Approved' : (isPending ? 'In Review' : 'Waiting'), state: step2State },
        { label: '3. Setup', sub: isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : 'Waiting'), state: step3State },
        { label: '4. Door Pass', sub: isConfirmed ? 'Active' : 'Pending', state: step4State }
      ];
    }

    return `
      <div class="w-full">
        <div class="flex items-start justify-between w-full">
          ${steps.map((st, i) => {
            let circleHtml = '';
            let labelClass = 'text-stone-600';
            let subClass = 'text-stone-400';

            const nextStep = steps[i + 1];
            const isLineActive = st.state === 'completed' && nextStep && (nextStep.state === 'completed' || nextStep.state === 'active');
            const lineColor = isLineActive ? 'bg-emerald-600' : 'bg-[#E9E3DD]';

            if (st.state === 'completed') {
              circleHtml = `
                <div class="relative z-10 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>
                </div>
              `;
              labelClass = 'text-stone-900 font-bold';
              subClass = 'text-stone-500';
            } else if (st.state === 'active') {
              circleHtml = `
                <div class="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 flex items-center justify-center shadow-xs ring-[4px] ring-emerald-100">
                  <div class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                </div>
              `;
              labelClass = 'text-emerald-700 font-bold';
              subClass = 'text-emerald-700 font-semibold';
            } else if (st.state === 'failed') {
              circleHtml = `
                <div class="relative z-10 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                  <span class="iconify text-xs text-white" data-icon="lucide:x" data-stroke-width="2.5"></span>
                </div>
              `;
              labelClass = 'text-rose-700 font-bold';
              subClass = 'text-rose-600 font-medium';
            } else {
              circleHtml = `
                <div class="relative z-10 w-6 h-6 rounded-full bg-white border border-[#E9E3DD] text-stone-400 flex items-center justify-center text-xs font-mono font-medium">
                  <span>${i + 1}</span>
                </div>
              `;
              labelClass = 'text-stone-500 font-medium';
              subClass = 'text-stone-400';
            }

            return `
              <div class="flex-1 flex flex-col items-center text-center relative px-1">
                ${i < steps.length - 1 ? `
                  <div class="absolute top-3 -translate-y-1/2 left-1/2 w-full h-[2px] z-0 pointer-events-none ${lineColor}"></div>
                ` : ''}

                ${circleHtml}

                <span class="mt-2 text-xs font-semibold leading-tight truncate w-full ${labelClass}">${st.label}</span>
                <span class="mt-0.5 text-[10px] sm:text-[11px] leading-tight truncate w-full ${subClass}">${st.sub}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  handleAddFoodDrinks(requestId) {
    this.showToast("Catering Service", "Food & Drinks service is coordinated via internal hospitality hotline (ext 2305).", "info");
  }

  handleViewRequestDetails(requestId) {
    const req = (typeof bookingStore !== 'undefined') ? bookingStore.getRequestById(requestId) : null;
    const items = req?.itDetails?.requestedItems?.join(', ') || 'Video Conference & Audio Setup';
    this.showToast("Equipment Details", `IT Equipment requested: ${items}`, "info");
  }

  handleContactSupport(requestId) {
    this.showToast("NBC Support", "NBC Facilities & IT Support Hotline: +855 23 722 563 (ext 2305).", "info");
  }

  handleCancelBooking(requestId) {
    if (confirm("Are you sure you want to cancel this meeting room booking?")) {
      if (typeof bookingStore !== 'undefined') {
        bookingStore.cancelBookingRequest(requestId);
      }
      this.showToast("Booking Cancelled", "Your booking reservation has been cancelled.", "info");
      this.renderBookingDetailsPage(requestId);
    }
  }

  downloadCalendarInvite(requestId) {
    const req = (typeof bookingStore !== 'undefined') ? bookingStore.getRequestById(requestId) : null;
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
      `SUMMARY:${req.meetingTitle}`,
      `DESCRIPTION:National Bank of Cambodia meeting room booking. Reference Code: ${req.referenceCode}. Notes: ${req.meetingPurpose || 'None'}`,
      `LOCATION:${req.room?.name || 'Meeting Room'}, ${req.room?.floor || 'Floor 18'}`,
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

  copyReferenceCode(code, label = "Security Code") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        this.showToast(`${label} Copied`, `${label} ${code} copied to clipboard.`, "success");
      }).catch(() => {
        this.showToast(`${label}: ${code}`, `${label} for your booking.`, "info");
      });
    } else {
      this.showToast(`${label}: ${code}`, `${label} for your booking.`, "info");
    }
  }
}

window.NBC.views['booking-details'] = new BookingDetailsView();
