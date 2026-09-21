// Pitika Review Workspace View Component (view-pitika-review)
// Modern Executive Studio Deck (NBC Crimson Heritage & Cafe Design System)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class PitikaReviewView {
  constructor() {
    this.id = 'pitika-review';
    this.selectedRequestForReview = null;
    this.currentModalImageIndex = 0;
    this.showDrawer = false;
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
    if (params.requestId) this.selectedRequestForReview = params.requestId;
    if (params.initialIndex !== undefined) this.currentModalImageIndex = params.initialIndex;
    window.app = window.app || {};
    window.app.handlePitikaApproveAndForwardIT = (id) => this.handlePitikaApproveAndForwardIT(id);
    window.app.confirmPitikaDirectPrivateApproval = (id) => this.confirmPitikaDirectPrivateApproval(id);
    window.app.confirmPitikaInlineEndorsement = (id) => this.confirmPitikaInlineEndorsement(id);
    window.app.confirmPitikaInlineRejection = (id) => this.confirmPitikaInlineRejection(id);
    window.app.handlePitikaDirectApproval = (id) => this.handlePitikaDirectApproval(id);
    window.app.handlePitikaFinalizeRoomStatus = (id) => this.handlePitikaFinalizeRoomStatus(id);
    window.app.togglePitikaInlineReject = () => this.togglePitikaInlineReject();
  }

  openPitikaReviewWorkspace(requestId) {
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    this.selectedRequestForReview = req.id;
    this.navigateTo('pitika-review', { requestId: req.id });
  }

  toggleDrawer(show) {
    this.showDrawer = show;
    const drawerEl = document.getElementById('pitika-location-drawer');
    const backdropEl = document.getElementById('pitika-drawer-backdrop');
    const panelEl = document.getElementById('pitika-drawer-panel');
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

  navigateModalRoomImage(delta) {
    if (!this.selectedRequestForReview) return;
    const req = typeof this.selectedRequestForReview === 'object' ? this.selectedRequestForReview : bookingStore.getRequestById(this.selectedRequestForReview);
    if (!req || !req.room) return;
    const room = bookingStore.getRoomById(req.room.id) || req.room;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === room.id) : null;
    const images = initRoom?.images || room.images || [room.image];
    this.currentModalImageIndex = (this.currentModalImageIndex + delta + images.length) % images.length;
    this.updateImageGalleryUI(images);
  }

  setModalRoomImage(index) {
    if (!this.selectedRequestForReview) return;
    const req = typeof this.selectedRequestForReview === 'object' ? this.selectedRequestForReview : bookingStore.getRequestById(this.selectedRequestForReview);
    if (!req || !req.room) return;
    const room = bookingStore.getRoomById(req.room.id) || req.room;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === room.id) : null;
    const images = initRoom?.images || room.images || [room.image];
    this.currentModalImageIndex = index;
    this.updateImageGalleryUI(images);
  }

  updateImageGalleryUI(images) {
    const mainImgEl = document.getElementById('pitika-active-room-img');
    const counterEl = document.getElementById('pitika-photo-counter');
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);

    if (mainImgEl) {
      mainImgEl.src = images[currentIndex] || images[0];
    }
    if (counterEl) {
      counterEl.innerText = `${currentIndex + 1} / ${images.length}`;
    }

    const thumbs = document.querySelectorAll('.pitika-thumb-btn');
    thumbs.forEach((thumb, idx) => {
      if (idx === currentIndex) {
        thumb.className = 'pitika-thumb-btn relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border-2 border-[#991B1B] shadow-xs opacity-100 cursor-pointer transition';
      } else {
        thumb.className = 'pitika-thumb-btn relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border-2 border-[#E9E3DD] opacity-50 hover:opacity-90 cursor-pointer transition';
      }
    });
  }

  render(container, params = {}) {
    if (!container) return;
    const reqId = params.requestId || (typeof this.selectedRequestForReview === 'object' ? this.selectedRequestForReview?.id : this.selectedRequestForReview) || 'REQ-002';
    this.selectedRequestForReview = reqId;
    this.currentModalImageIndex = params.initialIndex !== undefined ? params.initialIndex : 0;
    
    container.innerHTML = `
      <div id="view-pitika-review" class="w-full"></div>
    `;
    this.renderPitikaReviewPage(reqId);
  }

  renderPitikaReviewPage(requestId) {
    const container = document.getElementById('view-pitika-review');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId);
    if (!req) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-2xs space-y-3.5 my-4 animate-empty-state">
          <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
            <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:clipboard-x" data-stroke-width="1.8"></span>
          </div>
          <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Review Request Not Found</h3>
          <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">The requested review booking could not be located or may have already been processed.</p>
          <div class="pt-2">
            <button onclick="app.navigateTo('pitika-queue')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] flex items-center gap-1.5 mx-auto transition cursor-pointer shadow-xs">
              <span class="iconify text-sm text-white" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
              <span>Back to Review Queue</span>
            </button>
          </div>
        </div>
      `;
      if (window.Iconify && window.Iconify.scan) {
        window.Iconify.scan(container);
      }
      return;
    }

    this.selectedRequestForReview = req;

    const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
    const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review';
    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isConfirmed = req.status === 'Approved - Confirmed';
    const isRejected = req.status === 'Rejected';
    const isCancelled = req.status === 'Cancelled';
    const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');
    const isPitikaRejected = isRejected && !isOwnerRejected;
    const stepperStepsClass = isPrivate ? 'steps-5' : 'steps-4';

    // Check if scheduled meeting date and time has passed
    let isPassed = false;
    if (req.date) {
      const now = new Date();
      const endTimeStr = req.endTime || '23:59';
      const meetingEnd = new Date(`${req.date}T${endTimeStr}:00`);
      if (!isNaN(meetingEnd.getTime())) {
        isPassed = meetingEnd < now;
      }
    }

    let statusLabel = 'Waiting for Pitika';
    let statusIcon = 'lucide:clock';
    if (isConfirmed) {
      statusLabel = 'Booking Confirmed';
      statusIcon = 'lucide:check-circle-2';
    } else if (isRejected) {
      statusLabel = isOwnerRejected ? 'Rejected by Owner' : 'Rejected by Pitika';
      statusIcon = 'lucide:alert-circle';
    } else if (isCancelled) {
      statusLabel = 'Cancelled by Booker';
      statusIcon = 'lucide:x-circle';
    } else if (isOwnerPending) {
      statusLabel = 'Sent to Room Owner';
      statusIcon = 'lucide:key';
    } else if (isSetup) {
      statusLabel = 'Setting Up';
      statusIcon = 'lucide:settings';
    }
    const statusToneClass = isConfirmed ? 'text-emerald-700' : (isRejected || isCancelled ? 'text-red-700' : (isSetup ? 'text-blue-700' : 'text-amber-700'));

    // Compute Stepper Progress
    let progressPercent = '0%';
    if (isPrivate) {
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '75%';
      else if (isOwnerPending || isOwnerRejected) progressPercent = '50%';
      else if (isPitikaRejected || isPending || isCancelled) progressPercent = '25%';
    } else {
      if (isConfirmed) progressPercent = '100%';
      else if (isSetup) progressPercent = '66.6%';
      else if (isPitikaRejected || isPending || isCancelled) progressPercent = '33.3%';
    }

    const room = (req.room?.id && bookingStore.getRoomById(req.room.id)) || bookingStore.getRooms()[0] || req.room || {};
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === room.id) : null;
    const images = initRoom?.images || room.images || [room.image || 'assets/rooms/boardroom.jpg'];
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);
    const currentImg = images[currentIndex] || images[0];

    const mapInfo = (typeof bookingStore !== 'undefined' && bookingStore.getRoomMapDetails) ? bookingStore.getRoomMapDetails(room) : {
      building: 'National Bank of Cambodia - Headquarters',
      address: 'No. 22-24, Preah Norodom Blvd, Phnom Penh, Cambodia',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770638148902!2d104.920556!3d11.573611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3107870560a6a445%3A0x6a0f7e4113e00b39!2sNational%20Bank%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1700000000000',
      directionsUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia',
      externalUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia'
    };

    const floorShort = (room.floor || 'Level 1').split('-')[0].trim();

    container.innerHTML = `
      <!-- Main Studio Viewport (Strictly No Full-Page Vertical Scroll on Desktop) -->
      <div class="flex flex-col gap-4 lg:h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)] lg:overflow-hidden select-none">
        
        <!-- Top Action Bar: Clean, Confident, Modern -->
        <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0">
          <div class="flex items-center gap-3">
            <button
              onclick="app.navigateTo('pitika-queue')"
              class="h-9 px-3 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              type="button"
            >
              <span class="iconify text-[#7D6857] text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
              <span>Review Queue</span>
            </button>
            <div class="h-4 w-px bg-[#E9E3DD]"></div>
            <div>
              <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] leading-tight flex items-center gap-2">
                <span>${req.meetingTitle}</span>
              </h2>
            </div>
          </div>

          <!-- Quick Action Controls -->
          <div class="flex items-center gap-2.5">
            <span class="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#3E2B1E]">
              #${req.referenceCode}
            </span>
            <span class="${statusToneClass} text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD]">
              <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
              <span>${statusLabel}</span>
            </span>
            <!-- Slide-Over Map Drawer Button -->
            <button
              onclick="window.NBC.views['pitika-review'].toggleDrawer(true)"
              class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              type="button"
            >
              <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:map-pin" data-stroke-width="2"></span>
              <span>Location</span>
            </button>
          </div>
        </div>

        <!-- MAIN STUDIO GRID: 5 Cols Showcase & Specs + 7 Cols Interactive Workspace -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
          
          <!-- =============================================================== -->
          <!-- LEFT COLUMN: SHOWCASE, SPECS & REQUESTER (5 Cols)               -->
          <!-- =============================================================== -->
          <div class="lg:col-span-5 flex flex-col gap-4 overflow-hidden">

            <!-- Visual Stage Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-3 space-y-2.5 shadow-xs shrink-0">
              <div class="relative h-44 sm:h-48 rounded-xl overflow-hidden bg-stone-900 group select-none">
                <img id="pitika-active-room-img" src="${currentImg}" alt="${room.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

                <!-- Top Floating Clean Pill Tags -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#260707]/90 text-white backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                    <span class="iconify text-xs" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:globe'}" data-stroke-width="2"></span>
                    <span>${isPrivate ? 'Private Room' : 'Shared Room'}</span>
                  </span>

                  ${images.length > 1 ? `
                    <span id="pitika-photo-counter" class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs border border-white/20">
                      ${currentIndex + 1} / ${images.length}
                    </span>
                  ` : `
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs border border-white/20">
                      ${room.category || 'Executive Meeting'}
                    </span>
                  `}
                </div>

                <!-- Left / Right Carousel Controls -->
                ${images.length > 1 ? `
                  <button
                    onclick="window.NBC.views['pitika-review'].navigateModalRoomImage(-1)"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition border border-white/20 cursor-pointer"
                    type="button"
                    title="Previous photo"
                  >
                    <span class="iconify text-sm" data-icon="lucide:chevron-left" data-stroke-width="2.5"></span>
                  </button>
                  <button
                    onclick="window.NBC.views['pitika-review'].navigateModalRoomImage(1)"
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
                    <span>${room.name} &bull; ${floorShort}</span>
                  </span>
                </div>
              </div>

              <!-- Thumbnail Strip Glider (if multiple photos) -->
              ${images.length > 1 ? `
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  ${images.map((img, idx) => `
                    <button
                      onclick="window.NBC.views['pitika-review'].setModalRoomImage(${idx})"
                      class="pitika-thumb-btn relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${idx === currentIndex ? 'border-[#991B1B] shadow-xs' : 'border-[#E9E3DD] opacity-50 hover:opacity-90'}"
                      type="button"
                      title="Photo ${idx + 1}"
                    >
                      <img src="${img}" alt="${room.name}" class="w-full h-full object-cover" />
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Room Specifications & Requester Profile Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 flex-1 flex flex-col justify-between shadow-xs overflow-y-auto no-scrollbar space-y-3">
              <div class="space-y-3">
                <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Meeting Specs & Requester</h3>

                <!-- 3-Stat Metric Row -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Room Size</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${req.attendees} / ${room.capacity} Seats</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Schedule</span>
                    <strong class="font-mono text-xs font-bold ${isPassed ? 'text-stone-500 line-through' : 'text-[#3E2B1E]'} mt-0.5 block truncate">${req.date}</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Time Window</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block truncate">${req.startTime}–${req.endTime}</strong>
                  </div>
                </div>

                <!-- Booker Profile Box -->
                <div class="p-3 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-[#7D6857] uppercase tracking-wider">Requested By</span>
                    <span class="text-[11px] font-semibold text-[#991B1B]">${req.requester?.department || 'Operations'}</span>
                  </div>
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#3E2B1E] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:user" data-stroke-width="2"></span>
                    </span>
                    <div class="min-w-0 flex-1">
                      <strong class="text-xs font-bold text-[#3E2B1E] block truncate">${req.requester?.name || 'NBC Staff'}</strong>
                      <span class="text-[11px] text-[#6F5849] block truncate">${req.requester?.phone || 'NBC Staff'}</span>
                    </div>
                  </div>
                  ${req.meetingPurpose ? `
                    <div class="pt-2 border-t border-[#E9E3DD]/80">
                      <span class="text-[10px] font-bold text-[#7D6857] uppercase tracking-wider block mb-0.5">Purpose:</span>
                      <p class="text-xs text-[#3E2B1E] leading-relaxed line-clamp-3">${req.meetingPurpose}</p>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Bottom Footer Details -->
              <div class="pt-2.5 border-t border-[#E9E3DD] flex items-center justify-between text-xs text-[#6F5849] shrink-0">
                <span class="flex items-center gap-1.5 truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:clock-4" data-stroke-width="2"></span>
                  <span class="truncate">Submitted: ${req.submissionTimestamp || 'Recent'}</span>
                </span>
                <span class="font-mono text-[11px] text-[#7D6857] font-semibold shrink-0 ml-2">ID: ${req.id}</span>
              </div>
            </div>

          </div>

          <!-- =============================================================== -->
          <!-- RIGHT COLUMN: INTERACTIVE WORKSPACE & LOGISTICS (7 Cols)        -->
          <!-- =============================================================== -->
          <div class="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
            
            <!-- Workflow Approval Station Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col shrink-0 space-y-3.5">
              
              <!-- Section Header -->
              <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-xs" data-icon="lucide:clipboard-check" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-sm sm:text-base text-[#3E2B1E] tracking-tight">
                    ${req.isPrivateRequest ? 'Step 1: Pitika Review & Endorsement' : 'Approval Decision & Stepper'}
                  </h3>
                </div>
                <span class="text-[11px] font-semibold text-[#6F5849] px-2.5 py-1 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] font-mono">
                  Pitika S. &bull; Manager
                </span>
              </div>

              <!-- Stepper Track -->
              <div class="pt-0.5 pb-0.5">
                <div class="stepper-container pt-0 pb-0">
                  <div class="stepper-track ${stepperStepsClass}">
                    <div class="stepper-line">
                      <div id="pitika-stepper-progress" class="stepper-line-progress ${isSetup ? 'in-progress' : ''}" style="width: ${progressPercent};" data-target-width="${progressPercent}"></div>
                    </div>

                    ${isPrivate ? `
                      <!-- Step 1: Sent -->
                      <div class="stepper-node completed">
                        <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span></div>
                        <span class="stepper-label">1. Sent</span>
                      </div>

                      <!-- Step 2: Pitika Review -->
                      <div class="stepper-node ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected ? 'completed' : (isPitikaRejected ? 'failed' : (isPending ? 'active' : ''))}">
                        <div class="stepper-circle">
                          ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isPitikaRejected ? `<span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>` : `<span>2</span>`)}
                        </div>
                        <span class="stepper-label">2. Pitika</span>
                      </div>

                      <!-- Step 3: Room Owner -->
                      <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isOwnerRejected ? 'failed' : (isOwnerPending ? 'active' : ''))}">
                        <div class="stepper-circle">
                          ${isConfirmed || isSetup ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isOwnerRejected ? `<span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>` : (isOwnerPending ? `<span class="iconify text-xs animate-spin" data-icon="lucide:key" data-stroke-width="2"></span>` : `<span>3</span>`))}
                        </div>
                        <span class="stepper-label">3. Owner</span>
                      </div>

                      <!-- Step 4: IT & Room Setup -->
                      <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                        <div class="stepper-circle">
                          ${isConfirmed ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isSetup ? `<span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>` : `<span>4</span>`)}
                        </div>
                        <span class="stepper-label">${req.needsIT ? '4. IT Setup' : '4. Setup'}</span>
                      </div>

                      <!-- Step 5: Door Pass / Ready -->
                      <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                        <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span></div>
                        <span class="stepper-label">5. Ready</span>
                      </div>
                    ` : `
                      <!-- Standard 4 Steps -->
                      <div class="stepper-node completed">
                        <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span></div>
                        <span class="stepper-label">1. Sent</span>
                      </div>

                      <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isRejected ? 'failed' : (isPending ? 'active' : ''))}">
                        <div class="stepper-circle">
                          ${isConfirmed || isSetup ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isRejected ? `<span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>` : `<span>2</span>`)}
                        </div>
                        <span class="stepper-label">2. Pitika</span>
                      </div>

                      <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                        <div class="stepper-circle">
                          ${isConfirmed ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isSetup ? `<span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>` : `<span>3</span>`)}
                        </div>
                        <span class="stepper-label">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
                      </div>

                      <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                        <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span></div>
                        <span class="stepper-label">4. Ready</span>
                      </div>
                    `}
                  </div>
                </div>
              </div>


              <!-- Action Buttons Area (Zero Modals, Inline UX) -->
              <div class="pt-1 space-y-2.5">
                ${isPassed && (isPending || isOwnerPending) ? `
                  <div class="p-3.5 bg-stone-100/80 rounded-xl border border-stone-200 text-center space-y-1.5">
                    <div class="flex items-center justify-center gap-1.5 text-stone-700 font-bold text-xs">
                      <span class="iconify text-stone-500 text-sm" data-icon="lucide:history"></span>
                      <span>Meeting Date Passed</span>
                    </div>
                    <p class="text-[11px] text-stone-500">This request cannot be approved because the meeting time has passed.</p>
                  </div>
                ` : (isPending ? `
                  ${req.isPrivateRequest ? (req.isMyRoom ? `
                    <!-- Clean One Card for Room Owner Cost Review -->
                    <div class="p-3.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] space-y-2.5">
                      <div class="flex items-center justify-between">
                        <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-1.5">
                          <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:pen-line" data-stroke-width="2"></span>
                          <span>Manager Review Note <span class="font-normal text-[#7D6857]">(${room.roomOwner?.name || 'Owner'})</span></span>
                        </label>
                        <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                      </div>
                      <textarea id="pitika-inline-notes" rows="2" placeholder="e.g. Food and IT service costs verified." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                      <button onclick="app.confirmPitikaDirectPrivateApproval('${req.id}')" aria-label="Approve Food and IT Costs" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                        <span class="iconify text-white text-sm" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                        <span>Approve Food & IT Costs</span>
                      </button>
                    </div>
                  ` : `
                    <!-- Clean One Card for Endorsement & Room Owner Note -->
                    <div class="p-3.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] space-y-2.5">
                      <div class="flex items-center justify-between">
                        <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-1.5">
                          <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:pen-line" data-stroke-width="2"></span>
                          <span>Note for Room Owner <span class="font-normal text-[#7D6857]">(${room.roomOwner?.name || 'Owner'})</span></span>
                        </label>
                        <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                      </div>
                      <textarea id="pitika-inline-notes" rows="2" placeholder="e.g. Step 1 endorsed. All standard rooms are occupied today. Forwarded for your executive approval..." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                      <button onclick="app.confirmPitikaInlineEndorsement('${req.id}')" aria-label="Approve and send to room owner" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                        <span class="iconify text-white text-sm" data-icon="lucide:send" data-stroke-width="2"></span>
                        <span>Approve & Send to Room Owner</span>
                      </button>
                    </div>
                  `) : (req.needsIT ? `
                    <button onclick="app.handlePitikaApproveAndForwardIT('${req.id}')" aria-label="Approve and dispatch to IT" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                      <span class="iconify text-white text-sm" data-icon="lucide:share-2" data-stroke-width="2"></span>
                      <span>Approve & Send to IT Team</span>
                    </button>
                  ` : `
                    <button onclick="app.handlePitikaDirectApproval('${req.id}')" aria-label="Approve meeting room" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                      <span class="iconify text-white text-sm" data-icon="lucide:check" data-stroke-width="2"></span>
                      <span>Approve Meeting Room</span>
                    </button>
                  `)}

                  <!-- Inline Decline Drawer Toggle -->
                  <div class="pt-1 border-t border-[#E9E3DD]">
                    <button type="button" onclick="app.togglePitikaInlineReject()" aria-label="Decline or reject request" class="w-full py-2 text-center text-xs font-semibold text-rose-700 hover:text-rose-900 transition flex items-center justify-center gap-1 cursor-pointer">
                      <span class="iconify text-xs" data-icon="lucide:chevron-down" id="pitika-reject-icon"></span>
                      <span>Reject This Request</span>
                    </button>
                    <div id="pitika-inline-reject-box" class="hidden mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                      <label class="block text-rose-950 font-bold text-xs">Reason for Rejecting <span class="text-rose-700">*</span></label>
                      <textarea id="pitika-inline-reject-reason" rows="2" placeholder="e.g. Room is already used or maintenance..." class="bank-input text-xs w-full"></textarea>
                      <button onclick="app.confirmPitikaInlineRejection('${req.id}')" aria-label="Confirm rejection" class="w-full min-h-[40px] py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition">
                        <span class="iconify text-xs text-white" data-icon="lucide:ban"></span>
                        <span>Reject Request</span>
                      </button>
                    </div>
                  </div>
                ` : (isSetup ? `
                  <button onclick="app.handlePitikaFinalizeRoomStatus('${req.id}')" aria-label="Confirm room and issue pass" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                    <span class="iconify text-white text-sm" data-icon="lucide:lock" data-stroke-width="2"></span>
                    <span>Confirm Room Booking</span>
                  </button>
                ` : (isConfirmed ? `
                  <button onclick="app.openReceiptPage('${req.id}', 'pitika-review')" aria-label="View official receipt voucher" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
                    <span class="iconify text-white text-sm" data-icon="lucide:receipt" data-stroke-width="2"></span>
                    <span>View Booking Receipt</span>
                  </button>
                ` : `
                  <div class="py-2 text-center text-xs text-stone-500 font-medium">
                    Review decision completed
                  </div>
                `)))}
              </div>

              <!-- Status Notice (Relocated below action buttons) -->
              ${(isPending && req.isPrivateRequest) ? '' : `
              <div class="p-2.5 rounded-xl border text-xs leading-relaxed ${
                isPassed && (isPending || isOwnerPending) ? 'bg-stone-100/90 border-stone-300 text-stone-800' :
                isPending ? 'bg-amber-50/70 border-amber-200 text-amber-950' :
                isOwnerPending ? 'bg-amber-50 border-amber-300 text-amber-950' :
                isSetup ? 'bg-orange-50/70 border-orange-200 text-orange-950' :
                isConfirmed ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' :
                isRejected ? 'bg-rose-50/70 border-rose-200 text-rose-950' :
                'bg-stone-50 border-stone-200 text-stone-700'
              }">
                ${isPassed && (isPending || isOwnerPending) ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-stone-500 text-sm mt-0.5 shrink-0" data-icon="lucide:history" data-stroke-width="1.8"></span>
                    <div>
                      <strong class="block text-stone-800 font-bold">Meeting Date Passed</strong>
                      <p class="mt-0.5 text-stone-600">Scheduled for ${req.date} (${req.startTime}–${req.endTime}). This request is now closed.</p>
                    </div>
                  </div>
                ` : (isPending ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-amber-600 text-sm mt-0.5 shrink-0" data-icon="lucide:clock" data-stroke-width="1.8"></span>
                    <p>
                      Review meeting details below. Click <strong>Reject</strong> or <strong>Approve</strong> to proceed.
                    </p>
                  </div>
                ` : (isOwnerPending ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-amber-700 text-sm mt-0.5 shrink-0" data-icon="lucide:key" data-stroke-width="1.8"></span>
                    <div>
                      <strong class="block text-amber-900 font-bold">Sent to Room Owner:</strong>
                      <p class="mt-0.5">Sent on ${req.managerReview?.reviewDate || req.submissionTimestamp || 'Today'}. Waiting for Room Owner (${room.roomOwner?.name || 'Owner'}) to approve.</p>
                    </div>
                  </div>
                ` : (isSetup ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-orange-600 text-sm mt-0.5 shrink-0" data-icon="lucide:settings" data-stroke-width="1.8"></span>
                    <p>Approved. Room setup in progress. Confirm booking below to issue access pass.</p>
                  </div>
                ` : (isConfirmed ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-emerald-600 text-sm mt-0.5 shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="1.8"></span>
                    <p><strong>Booking Confirmed:</strong> Room is booked and access pass is ready.</p>
                  </div>
                ` : (isRejected ? `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-rose-600 text-sm mt-0.5 shrink-0" data-icon="lucide:alert-circle" data-stroke-width="1.8"></span>
                    <p><strong>Rejected:</strong> ${isOwnerRejected ? (req.roomOwnerReview?.ownerNotes || 'Declined by Room Owner.') : (req.approver?.rejectionReason || 'Declined by Manager.')}</p>
                  </div>
                ` : `
                  <div class="flex items-start gap-2">
                    <span class="iconify text-stone-500 text-sm mt-0.5 shrink-0" data-icon="lucide:ban" data-stroke-width="1.8"></span>
                    <p>Cancelled by booker.</p>
                  </div>
                `)))))}
              </div>
              `}

            </div>

            <!-- Extra Services & Logistics Deck Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex-1 flex flex-col overflow-hidden">
              <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD] shrink-0">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-xs" data-icon="lucide:layers" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Extra Services & Logistics Deck</h3>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[11px] px-2 py-0.5 rounded-md ${req.needsCatering ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-stone-50 text-stone-500 border border-stone-200'}">
                    ${req.needsCatering ? 'Catering' : 'No Food'}
                  </span>
                  <span class="font-mono text-[11px] px-2 py-0.5 rounded-md ${req.needsIT ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-stone-50 text-stone-500 border border-stone-200'}">
                    ${req.needsIT ? 'IT Support' : 'No IT'}
                  </span>
                </div>
              </div>

              <!-- Internal Scrollable Logistics Grid -->
              <div class="flex-1 overflow-y-auto no-scrollbar pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                
                <!-- Catering Mini-Panel -->
                <div class="p-3.5 rounded-xl border ${req.needsCatering ? 'border-amber-300 bg-amber-50/40' : 'border-[#E9E3DD] bg-[#FAF7F4]'} space-y-2.5 text-xs flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between pb-2 border-b ${req.needsCatering ? 'border-amber-200' : 'border-[#E9E3DD]'}">
                      <div class="flex items-center gap-1.5">
                        <span class="iconify text-amber-700 text-xs" data-icon="lucide:utensils" data-stroke-width="2"></span>
                        <h4 class="font-bold text-[#3E2B1E] text-xs">Food Service</h4>
                      </div>
                      <span class="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${req.needsCatering ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white text-stone-500 border border-[#E9E3DD]'}">
                        ${req.needsCatering ? 'Requested' : 'None'}
                      </span>
                    </div>

                    ${req.needsCatering ? `
                      <div class="space-y-1.5 bg-white p-2.5 rounded-xl border border-[#E9E3DD] mt-2">
                        <div class="flex items-center justify-between text-[11px]">
                          <span class="text-[#7D6857]">Package:</span>
                          <strong class="text-[#3E2B1E]">${req.cateringDetails?.packageName?.split('(')[0]?.trim() || 'Executive Selection'}</strong>
                        </div>
                        <div class="flex items-center justify-between text-[11px]">
                          <span class="text-[#7D6857]">Portions:</span>
                          <strong class="text-[#3E2B1E]">${req.cateringDetails?.servings || req.attendees} Meals</strong>
                        </div>
                        <div class="flex items-center justify-between text-[11px]">
                          <span class="text-[#7D6857]">Delivery Time:</span>
                          <strong class="text-[#3E2B1E]">${req.cateringDetails?.deliveryTime || req.startTime}</strong>
                        </div>
                        <p class="text-[10px] text-[#7D6857] pt-1 border-t border-stone-100">Notes: ${req.cateringDetails?.dietaryRemarks || 'Standard corporate catering'}</p>
                      </div>
                    ` : `
                      <p class="text-[11px] text-[#7D6857] py-6 text-center">No catering requested for this session.</p>
                    `}
                  </div>

                  ${req.needsCatering && !isConfirmed && !isRejected && !isCancelled ? `
                    <div class="space-y-1 pt-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7D6857]">Kitchen Note:</label>
                      <input type="text" id="approver-page-catering-notes" value="${req.cateringDetails?.approverNotes || 'Food order approved.'}" class="bank-input text-xs w-full" />
                    </div>
                  ` : ''}
                </div>

                <!-- IT Mini-Panel -->
                <div class="p-3.5 rounded-xl border ${req.needsIT ? 'border-red-300 bg-red-50/40' : 'border-[#E9E3DD] bg-[#FAF7F4]'} space-y-2.5 text-xs flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between pb-2 border-b ${req.needsIT ? 'border-red-200' : 'border-[#E9E3DD]'}">
                      <div class="flex items-center gap-1.5">
                        <span class="iconify text-[#991B1B] text-xs" data-icon="lucide:headset" data-stroke-width="2"></span>
                        <h4 class="font-bold text-[#3E2B1E] text-xs">IT Support</h4>
                      </div>
                      <span class="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${req.needsIT ? 'bg-red-100 text-[#991B1B] border border-red-300' : 'bg-white text-stone-500 border border-[#E9E3DD]'}">
                        ${req.needsIT ? 'Requested' : 'None'}
                      </span>
                    </div>

                    ${req.needsIT ? `
                      <div class="space-y-2 bg-white p-2.5 rounded-xl border border-[#E9E3DD] mt-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[#7D6857] block">Required Equipment:</span>
                        <ul class="text-[11px] text-[#3E2B1E] space-y-1">
                          ${(req.itDetails?.requestedItems || ['Conference Video Polycom', 'Wireless Microphones']).map(item => `
                            <li class="flex items-center gap-1.5">
                              <span class="iconify text-emerald-600 text-xs shrink-0" data-icon="lucide:check" data-stroke-width="2.5"></span>
                              <span>${item}</span>
                            </li>
                          `).join('')}
                        </ul>
                        <div class="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <span class="text-[#7D6857]">Technician:</span>
                          ${req.itDetails?.assignedStaffList && req.itDetails.assignedStaffList.length > 0 ? `
                            <div class="flex items-center gap-1.5">
                              <div class="flex -space-x-1.5 overflow-hidden">
                                ${req.itDetails.assignedStaffList.map(s => `
                                  <img src="${s.avatar}" title="${s.name} (${s.title})" class="inline-block h-4 w-4 rounded-full ring-1 ring-white object-cover" />
                                `).join('')}
                              </div>
                              <strong class="text-emerald-700 font-semibold text-[10px]">${req.itDetails.assignedStaffList.map(s => s.name.split(' ')[0]).join(', ')}</strong>
                            </div>
                          ` : (req.itDetails?.assignedStaff ? `
                            <strong class="text-emerald-700">${req.itDetails.assignedStaff.name}</strong>
                          ` : `
                            <span class="text-amber-700 font-bold">Unassigned</span>
                          `)}
                        </div>
                      </div>
                    ` : `
                      <p class="text-[11px] text-[#7D6857] py-6 text-center">No IT support requested for this session.</p>
                    `}
                  </div>

                  ${req.needsIT ? `
                    <div class="p-2 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-900 flex items-center gap-1.5 mt-1">
                      <span class="iconify text-xs text-red-700 shrink-0" data-icon="lucide:workflow"></span>
                      <span><strong>IT Process:</strong> ${isOwnerPending ? 'Sent to IT queue once Room Owner approves' : (isSetup ? 'Dispatched to IT technician queue for setup' : (isConfirmed ? 'IT equipment verified & ready' : 'Forwarded to IT on approval'))}</span>
                    </div>
                  ` : ''}
                </div>

              </div>

              <!-- Location Quick Strip -->
              <div class="pt-3 border-t border-[#E9E3DD] flex items-center justify-between shrink-0 text-xs">
                <div class="flex items-center gap-2 text-[#6F5849] truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  <span class="truncate">${mapInfo.building} &bull; ${floorShort}</span>
                </div>
                <button
                  onclick="window.NBC.views['pitika-review'].toggleDrawer(true)"
                  class="text-xs font-semibold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1 shrink-0 cursor-pointer"
                  type="button"
                >
                  <span>Map & Directions</span>
                  <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- =============================================================== -->
      <!-- SLIDE-OVER DRAWER: FACILITY MAP & CAMPUS LOCATION               -->
      <!-- =============================================================== -->
      <div id="pitika-location-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="pitika-drawer-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['pitika-review'].toggleDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="pitika-drawer-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col justify-between shadow-2xl space-y-5 transition-transform duration-300 translate-x-full">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-base" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Facility Location & Access</h3>
                </div>
                <button
                  onclick="window.NBC.views['pitika-review'].toggleDrawer(false)"
                  class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
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
                <p class="text-[#6F5849] leading-relaxed">Present official NBC staff badge or visitor pass at the main security reception on Norodom Blvd. Elevators provide direct access to ${floorShort}.</p>
              </div>
            </div>

            <div class="pt-3 border-t border-[#E9E3DD] flex gap-2">
              <a
                href="${mapInfo.directionsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-11 rounded-xl bg-white hover:bg-stone-50 text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs text-center"
              >
                <span class="iconify text-stone-600 text-sm" data-icon="lucide:navigation" data-stroke-width="2"></span>
                <span>Get Directions</span>
              </a>
              <a
                href="${mapInfo.externalUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-11 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs text-center"
              >
                <span class="iconify text-white text-sm" data-icon="lucide:external-link" data-stroke-width="2"></span>
                <span>Google Maps</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    `;

    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(container);
    }

    requestAnimationFrame(() => {
      const progressBar = document.getElementById('pitika-stepper-progress');
      if (progressBar) {
        const target = progressBar.getAttribute('data-target-width') || progressPercent;
        progressBar.style.width = target;
      }
    });
  }

  togglePitikaInlineReject() {
    const box = document.getElementById('pitika-inline-reject-box');
    const icon = document.getElementById('pitika-reject-icon');
    if (box) {
      box.classList.toggle('hidden');
      if (icon) {
        icon.setAttribute('data-icon', box.classList.contains('hidden') ? 'lucide:chevron-down' : 'lucide:chevron-up');
      }
    }
  }

  confirmPitikaDirectPrivateApproval(requestId) {
    const notes = document.getElementById('pitika-inline-notes')?.value.trim() || 'Approved directly by Pitika.';

    const btn = document.querySelector(`button[onclick*="confirmPitikaDirectPrivateApproval"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      btn.innerHTML = `
        <span class="iconify text-xs text-white animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
        <span class="text-white">Approving Food & IT Costs...</span>
      `;
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(btn);
    }

    const progressBar = document.getElementById('pitika-stepper-progress');
    const nodes = document.querySelectorAll('.stepper-node');
    if (progressBar && nodes.length >= 5) {
      if (nodes[1]) {
        nodes[1].className = 'stepper-node completed';
        const circle = nodes[1].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>';
      }
      if (nodes[2]) {
        nodes[2].className = 'stepper-node completed';
        const circle = nodes[2].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>';
      }
      progressBar.classList.add('in-progress');
      progressBar.style.transition = 'width 0.75s cubic-bezier(0.34, 1.2, 0.64, 1)';
      progressBar.style.width = '75%';

      if (nodes[3]) {
        nodes[3].className = 'stepper-node active';
        const circle = nodes[3].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>';
      }
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(document.querySelector('.stepper-container'));
    }

    setTimeout(() => {
      bookingStore.approvePrivateRoomDirectly(requestId, { notes });
      this.showToast("Approved with IT", "Food & IT services approved. Setup dispatched.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 650);
  }

  confirmPitikaInlineEndorsement(requestId) {
    const notes = document.getElementById('pitika-inline-notes')?.value.trim() || 'Approved by Manager Pitika. Sent to Room Owner.';

    const btn = document.querySelector(`button[onclick*="confirmPitikaInlineEndorsement"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      btn.innerHTML = `
        <span class="iconify text-xs text-white animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
        <span class="text-white">Sending to Room Owner...</span>
      `;
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(btn);
    }

    const progressBar = document.getElementById('pitika-stepper-progress');
    const nodes = document.querySelectorAll('.stepper-node');
    if (progressBar && nodes.length >= 5) {
      if (nodes[1]) {
        nodes[1].className = 'stepper-node completed';
        const circle = nodes[1].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>';
      }
      progressBar.classList.add('in-progress');
      progressBar.style.transition = 'width 0.75s cubic-bezier(0.34, 1.2, 0.64, 1)';
      progressBar.style.width = '50%';

      if (nodes[2]) {
        nodes[2].className = 'stepper-node active';
        const circle = nodes[2].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs animate-spin" data-icon="lucide:key" data-stroke-width="2"></span>';
      }
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(document.querySelector('.stepper-container'));
    }

    setTimeout(() => {
      bookingStore.forwardToRoomOwner(requestId, { managerNotes: notes });
      this.showToast("Step 1 Approved", "Sent to Room Owner for final approval.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 650);
  }

  confirmPitikaInlineRejection(requestId) {
    const reason = document.getElementById('pitika-inline-reject-reason')?.value.trim();
    if (!reason) {
      this.showToast("Reason Required", "Please enter a reason for declining this request.", "warning");
      return;
    }
    bookingStore.rejectBookingRequest(requestId, reason);
    this.showToast("Request Declined", "Booking request has been declined.", "info");
    this.renderPitikaReviewPage(requestId);
  }

  // Backward compatibility alias methods for modals
  openPitikaEndorseModal(requestId) { this.renderPitikaReviewPage(requestId); }
  closePitikaEndorseModal() {}
  confirmPitikaEndorsement() {}
  openApproverRejectModal(requestId) { this.renderPitikaReviewPage(requestId); }
  closeApproverRejectModal() {}
  confirmRejectRequest() {}

  handlePitikaApproveAndForwardIT(requestId) {
    const cateringNotes = document.getElementById('approver-page-catering-notes')?.value || '';

    const btn = document.querySelector(`button[onclick*="handlePitikaApproveAndForwardIT"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      btn.innerHTML = `
        <span class="iconify text-xs text-white animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
        <span class="text-white">Approving & Dispatching to IT...</span>
      `;
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(btn);
    }

    const progressBar = document.getElementById('pitika-stepper-progress');
    const nodes = document.querySelectorAll('.stepper-node');
    if (progressBar && nodes.length >= 4) {
      if (nodes[1]) {
        nodes[1].className = 'stepper-node completed';
        const circle = nodes[1].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>';
      }

      progressBar.classList.add('in-progress');
      progressBar.style.transition = 'width 0.75s cubic-bezier(0.34, 1.2, 0.64, 1)';
      progressBar.style.width = '66.6%';

      if (nodes[2]) {
        nodes[2].className = 'stepper-node active';
        const circle = nodes[2].querySelector('.stepper-circle');
        if (circle) circle.innerHTML = '<span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>';
      }
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(document.querySelector('.stepper-container'));
    }

    setTimeout(() => {
      bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: true });
      this.showToast("Approved with IT", "Ticket dispatched to IT Specialists queue.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 650);
  }

  handlePitikaDirectApproval(requestId) {
    const cateringNotes = document.getElementById('approver-page-catering-notes')?.value || '';

    const btn = document.querySelector(`button[onclick*="handlePitikaDirectApproval"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      btn.innerHTML = `
        <span class="iconify text-xs text-white animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
        <span class="text-white">Approving Meeting Room...</span>
      `;
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(btn);
    }

    const progressBar = document.getElementById('pitika-stepper-progress');
    if (progressBar) {
      progressBar.style.transition = 'width 0.75s cubic-bezier(0.34, 1.2, 0.64, 1)';
      progressBar.style.width = '100%';
    }

    setTimeout(() => {
      bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: false });
      bookingStore.finalizeRoomStatus(requestId);
      this.showToast("Booking Approved", "Meeting room confirmed and pass generated.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 650);
  }

  handlePitikaFinalizeRoomStatus(requestId) {
    const btn = document.querySelector(`button[onclick*="handlePitikaFinalizeRoomStatus"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-wait');
      btn.innerHTML = `
        <span class="iconify text-xs text-white animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
        <span class="text-white">Issuing Door Pass...</span>
      `;
      if (window.Iconify && window.Iconify.scan) window.Iconify.scan(btn);
    }

    const progressBar = document.getElementById('pitika-stepper-progress');
    if (progressBar) {
      progressBar.style.transition = 'width 0.75s cubic-bezier(0.34, 1.2, 0.64, 1)';
      progressBar.style.width = '100%';
    }

    setTimeout(() => {
      bookingStore.finalizeRoomStatus(requestId);
      this.showToast("Pass Issued", "Room setup verified and door access pass issued.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 650);
  }
}

window.NBC.views['pitika-review'] = new PitikaReviewView();
