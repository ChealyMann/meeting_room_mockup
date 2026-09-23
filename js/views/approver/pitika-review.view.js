// Pitika Review Workspace View Component (view-pitika-review)
// Executive Approver Triage Cockpit (TypeUI Cafe Design System with NBC Crimson Heritage)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class PitikaReviewView {
  constructor() {
    this.id = 'pitika-review';
    this.selectedRequestForReview = null;
    this.showLocationDrawer = false;
    this.showServicesDrawer = false;
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
    if (params.requestId) this.selectedRequestForReview = params.requestId;

    window.app = window.app || {};
    window.app.handlePitikaApproveAndForwardIT = (id) => this.handlePitikaApproveAndForwardIT(id);
    window.app.confirmPitikaDirectPrivateApproval = (id) => this.confirmPitikaDirectPrivateApproval(id);
    window.app.confirmPitikaInlineEndorsement = (id) => this.confirmPitikaInlineEndorsement(id);
    window.app.confirmPitikaInlineRejection = (id) => this.confirmPitikaInlineRejection(id);
    window.app.handlePitikaDirectApproval = (id) => this.handlePitikaDirectApproval(id);
    window.app.handlePitikaFinalizeRoomStatus = (id) => this.handlePitikaFinalizeRoomStatus(id);
    window.app.togglePitikaInlineReject = () => this.togglePitikaInlineReject();
    window.app.openPitikaReviewWorkspace = (id) => this.openPitikaReviewWorkspace(id);
    window.app.copyReferenceCode = (code, label) => this.copyReferenceCode(code, label);
    window.app.downloadCalendarInvite = (id) => this.downloadCalendarInvite(id);
    window.app.togglePitikaServicesDrawer = (show) => this.toggleServicesDrawer(show);
    window.app.togglePitikaLocationDrawer = (show) => this.toggleLocationDrawer(show);
  }

  toggleServicesDrawer(show) {
    this.showServicesDrawer = show;
    const drawerEl = document.getElementById('pitika-services-drawer');
    const backdropEl = document.getElementById('pitika-services-backdrop');
    const panelEl = document.getElementById('pitika-services-panel');
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

  handleContactSupport(requestId) {
    this.showToast("Support Contacted", "IT & Facility support desk notified (Ext. 2305).", "info");
  }

  openPitikaReviewWorkspace(requestId) {
    const req = (typeof bookingStore !== 'undefined') ? bookingStore.getRequestById(requestId) : null;
    if (!req) return;

    this.selectedRequestForReview = req.id;
    this.navigateTo('pitika-review', { requestId: req.id });
  }

  toggleLocationDrawer(show) {
    this.showLocationDrawer = show;
    const drawerEl = document.getElementById('pitika-location-drawer');
    const backdropEl = document.getElementById('pitika-location-backdrop');
    const panelEl = document.getElementById('pitika-location-panel');
    if (!drawerEl || !backdropEl || !panelEl) {
      if (show) {
        const req = this.currentReq || (typeof bookingStore !== 'undefined' ? bookingStore.getRequestById(this.selectedRequestForReview) : null);
        const room = this.currentRoom || (req ? ((req.room?.id && bookingStore.getRoomById(req.room.id)) || req.room) : null);
        const mapInfo = (typeof bookingStore !== 'undefined' && bookingStore.getRoomMapDetails) ? bookingStore.getRoomMapDetails(room) : { externalUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia' };
        window.open(mapInfo.directionsUrl || mapInfo.externalUrl, '_blank');
      }
      return;
    }

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

  toggleDrawer(show) {
    this.toggleLocationDrawer(show);
  }

  // Smart Room Schedule Conflict & Turnaround Check for Pitika
  _computeRoomConflictInfo(req, room) {
    if (typeof bookingStore === 'undefined' || !req || !room) {
      return { status: 'Clear', text: 'Schedule Clear (No Conflicts)', isConflict: false, count: 0 };
    }

    const allReqs = bookingStore.getRequests() || [];
    const sameRoomReqs = allReqs.filter(r =>
      r.id !== req.id &&
      (r.room?.id === room.id || r.roomId === room.id) &&
      r.date === req.date &&
      r.status !== 'Rejected' &&
      r.status !== 'Cancelled'
    );

    if (sameRoomReqs.length === 0) {
      return { status: 'Clear', text: 'Schedule Clear &bull; 0 other sessions today', isConflict: false, count: 0 };
    }

    const parseTime = (tStr) => {
      if (!tStr) return 0;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const currentStart = parseTime(req.startTime);
    const currentEnd = parseTime(req.endTime);

    let hasOverlap = false;
    let closestNext = null;

    sameRoomReqs.forEach(other => {
      const oStart = parseTime(other.startTime);
      const oEnd = parseTime(other.endTime);

      if (currentStart < oEnd && currentEnd > oStart) {
        hasOverlap = true;
      }

      if (oStart >= currentEnd) {
        const gap = oStart - currentEnd;
        if (closestNext === null || gap < closestNext.gap) {
          closestNext = { req: other, gap };
        }
      }
    });

    if (hasOverlap) {
      return { status: 'Conflict', text: 'Overlap with another reservation', isConflict: true, count: sameRoomReqs.length };
    }

    if (closestNext) {
      const hours = Math.floor(closestNext.gap / 60);
      const mins = closestNext.gap % 60;
      const bufferText = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''} buffer` : `${mins}m buffer`;
      return { status: 'Clear', text: `Next session at ${closestNext.req.startTime} (${bufferText})`, isConflict: false, count: sameRoomReqs.length };
    }

    return { status: 'Clear', text: `Schedule Clear &bull; ${sameRoomReqs.length} other session${sameRoomReqs.length > 1 ? 's' : ''} today`, isConflict: false, count: sameRoomReqs.length };
  }

  render(container, params = {}) {
    if (!container) return;
    let reqId = params.requestId || (typeof this.selectedRequestForReview === 'object' ? this.selectedRequestForReview?.id : this.selectedRequestForReview);
    if (!reqId && typeof bookingStore !== 'undefined') {
      const pending = bookingStore.getPendingPitikaRequests ? bookingStore.getPendingPitikaRequests() : [];
      if (pending && pending.length > 0) {
        reqId = pending[0].id;
      } else {
        const all = bookingStore.getRequests ? bookingStore.getRequests() : [];
        if (all && all.length > 0) reqId = all[0].id;
      }
    }
    if (!reqId) reqId = 'REQ-002';
    this.selectedRequestForReview = reqId;

    container.innerHTML = `
      <div id="view-pitika-review" class="w-full"></div>
    `;
    this.renderPitikaReviewPage(reqId);
  }

  renderPitikaReviewPage(requestId) {
    const container = document.getElementById('view-pitika-review');
    if (!container) return;

    try {
      const req = (typeof bookingStore !== 'undefined') ? bookingStore.getRequestById(requestId) : null;
      if (!req) {
        container.innerHTML = `
          <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-2xs space-y-3.5 my-4 animate-empty-state">
            <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
              <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:clipboard-x" data-stroke-width="1.8"></span>
            </div>
            <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Review Request Not Found</h3>
            <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">
              The requested review booking could not be located or may have already been resolved.
            </p>
            <div class="pt-2">
              <button onclick="app.navigateTo('pitika-queue')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] flex items-center gap-1.5 mx-auto transition cursor-pointer shadow-xs active:scale-[0.98]">
                <span class="iconify text-sm text-white" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
                <span class="text-white">Back to Review Queue</span>
              </button>
            </div>
          </div>
        `;
        if (window.Iconify && typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(container);
        }
        return;
      }

      this.selectedRequestForReview = req.id;
      this.currentReq = req;

      const roomObj = (req.room?.id && bookingStore.getRoomById(req.room.id)) || (typeof bookingStore !== 'undefined' && bookingStore.getRooms ? bookingStore.getRooms()[0] : null) || req.room || {};
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

      let statusLabel = 'Waiting for Review';
      let statusIcon = 'lucide:clock';
      let statusToneClass = 'text-[#B45309]';
      if (isConfirmed) {
        statusLabel = 'Confirmed';
        statusIcon = 'lucide:check-circle-2';
        statusToneClass = 'text-emerald-700';
      } else if (isOwnerPending) {
        statusLabel = 'Sent to Room Owner';
        statusIcon = 'lucide:key';
        statusToneClass = 'text-amber-700';
      } else if (isSetup) {
        statusLabel = 'In Progress';
        statusIcon = 'lucide:settings';
        statusToneClass = 'text-blue-700';
      } else if (isRejected) {
        statusLabel = isOwnerRejected ? 'Rejected by Owner' : 'Rejected';
        statusIcon = 'lucide:x-circle';
        statusToneClass = 'text-rose-700';
      } else if (isCancelled) {
        statusLabel = 'Cancelled';
        statusIcon = 'lucide:slash';
        statusToneClass = 'text-stone-600';
      }

      const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === roomObj.id) : null;
      const roomImg = initRoom?.image || roomObj.image || 'assets/rooms/boardroom.jpg';

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

      const conflictInfo = this._computeRoomConflictInfo(req, roomObj);

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
              onclick="app.navigateTo('pitika-queue')"
              class="h-9 px-3 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              type="button"
            >
              <span class="iconify text-[#7D6857] text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
              <span>Review Queue</span>
            </button>
            <div class="h-4 w-px bg-[#E9E3DD]"></div>
            <div class="flex items-center gap-2.5">
              <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] leading-tight flex items-center gap-2">
                <span>${roomObj.name || req.meetingTitle || 'Pitika Review'}</span>
              </h2>
              <span class="${statusToneClass} text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] shadow-2xs">
                <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="2"></span>
                <span>${statusLabel}</span>
              </span>
            </div>
          </div>

          <!-- Quick Action Controls & Slide-Over Drawer Triggers -->
          <div class="flex items-center gap-2">
            <!-- Smart Conflict Pill Indicator -->
            <span class="${conflictInfo.isConflict ? 'text-rose-700 bg-rose-50/70 border-rose-200' : 'text-emerald-700 bg-emerald-50/70 border-emerald-200'} text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-2xs">
              <span class="iconify text-xs" data-icon="${conflictInfo.isConflict ? 'lucide:alert-triangle' : 'lucide:check-circle-2'}" data-stroke-width="2"></span>
              <span>${conflictInfo.isConflict ? 'Overlap Warning' : 'Schedule Clear'}</span>
            </span>

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

            <!-- Slide-Over Services Drawer Button -->
            <button
              onclick="window.NBC.views['pitika-review'].toggleServicesDrawer(true)"
              class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              type="button"
              title="Open Operational Logistics & Services Drawer"
            >
              <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:concierge-bell" data-stroke-width="2"></span>
              <span>Services${activeServicesCount > 0 ? ` (${activeServicesCount})` : ''}</span>
            </button>

            <!-- Slide-Over Map Drawer Button -->
            <button
              onclick="window.NBC.views['pitika-review'].toggleLocationDrawer(true)"
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
                onclick="app.openReceiptPage('${req.id}', 'pitika-review')"
                class="h-9 px-3.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-[0.98]"
                title="View Booking Receipt"
              >
                <span class="iconify text-white text-sm" data-icon="lucide:file-text" data-stroke-width="2"></span>
                <span class="text-white">Receipt</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- MAIN STUDIO GRID: 5 Cols Booking Information + 7 Cols Stepper & Agreement Station -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

          <!-- =============================================================== -->
          <!-- LEFT COLUMN: ROOM CARD & BOOKING INFORMATION (5 Cols)           -->
          <!-- =============================================================== -->
          <div class="lg:col-span-5 flex flex-col gap-4 overflow-hidden">

            <!-- Compact Room & Conflict Intelligence Card (shrink-0) -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-3 shadow-xs shrink-0 space-y-2.5">
              <div class="relative h-36 sm:h-40 rounded-xl overflow-hidden bg-stone-900 group select-none">
                <img src="${roomImg}" alt="${roomObj.name || 'Meeting Room'}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>

                <!-- Top Floating Clean Pill Tags -->
                <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#260707]/90 text-white backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                    <span class="iconify text-xs" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:globe'}" data-stroke-width="2"></span>
                    <span>${isPrivate ? 'Private Room' : 'Shared Room'}</span>
                  </span>

                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs border border-white/20">
                    ${roomObj.capacity || 16} Seats
                  </span>
                </div>

                <!-- Bottom Room & Floor Overlay -->
                <div class="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                  <span class="text-xs font-semibold text-stone-200 drop-shadow-xs flex items-center gap-1.5">
                    <span class="iconify text-sm text-[#FACC15]" data-icon="lucide:landmark" data-stroke-width="2"></span>
                    <span>${roomObj.name} &bull; ${floorShort}</span>
                  </span>
                </div>
              </div>

              <!-- Quick Operational Inspection Strip (Matching booking-details.view.js) -->
              <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
                <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:users" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Occupancy</span>
                    <strong class="font-heading font-bold text-[11px] sm:text-xs text-[#3E2B1E] block mt-1 truncate leading-none">${req.attendees || 8} / ${roomObj.capacity || 16} Seats</strong>
                  </div>
                </div>

                <div class="p-2 sm:p-2.5 ${conflictInfo.isConflict ? 'bg-rose-50/70 border-rose-200' : 'bg-[#FAF7F4] border-[#E9E3DD]'} rounded-xl border flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] ${conflictInfo.isConflict ? 'text-rose-700' : 'text-emerald-700'} flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-sm ${conflictInfo.isConflict ? 'text-rose-700' : 'text-emerald-700'}" data-icon="${conflictInfo.isConflict ? 'lucide:alert-triangle' : 'lucide:check-circle-2'}" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Turnaround</span>
                    <strong class="font-heading font-bold text-[11px] sm:text-xs ${conflictInfo.isConflict ? 'text-rose-700' : 'text-[#3E2B1E]'} block mt-1 truncate" title="${conflictInfo.text}">${conflictInfo.text}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Information & Specs Deck (Exact Style from booking-details.view.js) -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
              <div class="space-y-3 sm:space-y-3.5 overflow-y-auto no-scrollbar pr-0.5">

                <!-- Meeting Room Booking Header -->
                <div class="flex items-center gap-3 sm:gap-3.5 pb-3 sm:pb-3.5 border-b border-[#E9E3DD]">
                  <div class="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-lg sm:text-xl text-[#991B1B]" data-icon="lucide:calendar-check-2" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold text-[#7D6857] block leading-none">Meeting Room Booking</span>
                    <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight mt-1 leading-snug truncate">
                      ${req.meetingTitle || 'Executive Session'}
                    </h3>
                    <div class="flex items-center gap-2 mt-1 text-[11px] sm:text-xs text-[#6F5849] font-medium flex-wrap">
                      <span class="flex items-center gap-1.5 text-[#6F5849]">
                        <span class="iconify text-xs text-[#7D6857]" data-icon="lucide:calendar" data-stroke-width="1.8"></span>
                        <span class="font-mono text-[#3E2B1E]">${req.date || '2026-09-23'}</span>
                      </span>
                      <span class="text-stone-300" aria-hidden="true">&bull;</span>
                      <span class="flex items-center gap-1.5 text-[#6F5849]">
                        <span class="iconify text-xs text-[#7D6857]" data-icon="lucide:clock" data-stroke-width="1.8"></span>
                        <span class="font-mono text-[#3E2B1E]">${req.startTime || '08:30'} – ${req.endTime || '09:30'}</span>
                      </span>
                      <span class="text-[#7D6857] text-[10.5px] sm:text-[11px] font-normal">(${durationText})</span>
                    </div>
                  </div>
                </div>

                <!-- 2-Metric Booking Specs Grid (Harmonized Icon Boxes) -->
                <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <!-- Attendees -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                      <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:users" data-stroke-width="1.8"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="text-[9px] sm:text-[10px] uppercase font-bold text-[#7D6857] block truncate leading-none">Attendees</span>
                      <strong class="font-heading font-bold text-[11px] sm:text-xs text-[#3E2B1E] block mt-1 truncate leading-none">${req.attendees || 8} People</strong>
                    </div>
                  </div>

                  <!-- Booking Code -->
                  <div class="p-2 sm:p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                      <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:ticket" data-stroke-width="1.8"></span>
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
                </div>

                <!-- Booked By Card (Harmonized Icon Box) -->
                <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:user" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] uppercase tracking-wider font-semibold text-[#7D6857] block truncate">Booked By</span>
                    <strong class="font-heading font-bold text-xs text-[#3E2B1E] block mt-0.5 truncate">${req.requester?.name || 'Jonathan Vance'}</strong>
                    <span class="text-[11px] text-[#7D6857] block mt-0.5 truncate">${req.requester?.department || 'Board of Directors & Cabinet'} &bull; ${req.requester?.phone || req.requester?.office || 'Executive Office'}</span>
                  </div>
                </div>

              </div>

              <!-- Bottom Footer Details (Exact Style from booking-details.view.js) -->
              <div class="pt-2.5 border-t border-[#E9E3DD] flex items-center justify-between text-xs text-[#6F5849]">
                <span class="flex items-center gap-1.5 truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:shield-check"></span>
                  <span class="truncate">${roomObj.department || 'National Bank of Cambodia'}</span>
                </span>
                <span class="font-mono text-[11px] text-[#7D6857] shrink-0 ml-2">Ext. 2305</span>
              </div>
            </div>

          </div>

          <!-- =============================================================== -->
          <!-- RIGHT COLUMN: STEPPER & AGREEMENT / APPROVAL STATION (7 Cols)   -->
          <!-- =============================================================== -->
          <div class="lg:col-span-7 flex flex-col gap-4 overflow-hidden">

            <!-- Approval Progress Stepper Card (shrink-0) -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col shrink-0 space-y-3.5">
              <div class="flex items-center justify-between gap-3 pb-2.5 border-b border-[#E9E3DD]">
                <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Approval Progress</h3>
                <span class="font-mono text-[11px] text-[#7D6857]">${req.submissionTimestamp || req.submittedText || 'Submitted'}</span>
              </div>
              ${this._renderStepper(req, isPrivate, isMyRoom, isConfirmed, isSetup, isOwnerPending, isPending, isRejected, isCancelled, isCancelledAfterPitika, isCancelledBeforePitika, isOwnerRejected)}
            </div>

            <!-- Agreement & Approval Station (Matching booking-details.view.js Deck) -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
              <div class="space-y-3.5 sm:space-y-4 overflow-y-auto no-scrollbar pr-0.5">

                <!-- Header (Exact Style from booking-details.view.js) -->
                <div class="flex items-center gap-3 sm:gap-3.5 pb-3 sm:pb-3.5 border-b border-[#E9E3DD]">
                  <div class="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                    <span class="iconify text-lg sm:text-xl text-[#991B1B]" data-icon="lucide:file-check-2" data-stroke-width="1.8"></span>
                  </div>
                  <div>
                    <span class="text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold text-[#7D6857] block leading-none">Review & Endorsement</span>
                    <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight mt-1 leading-snug">
                      Review & Agreement
                    </h3>
                  </div>
                </div>

                <!-- Meeting Purpose Card (Exact Style from booking-details.view.js line 588) -->
                <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] flex items-start gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 mt-0.5">
                    <span class="iconify text-sm" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] uppercase tracking-wider font-semibold text-[#7D6857] block truncate">Meeting Purpose</span>
                    <p class="text-xs text-[#3E2B1E] font-medium mt-0.5 leading-relaxed">${req.meetingPurpose || req.notes || req.privateJustification || 'Routine executive session and business consultation.'}</p>
                  </div>
                </div>

                <!-- Dedicated Approver Decision Station -->
                ${isPassed && isPending ? `
                  <div class="p-3.5 bg-stone-100/80 rounded-xl border border-stone-200 text-center space-y-1">
                    <div class="flex items-center justify-center gap-1.5 text-stone-700 font-bold text-xs">
                      <span class="iconify text-stone-500 text-sm" data-icon="lucide:history"></span>
                      <span>Meeting Date Passed</span>
                    </div>
                    <p class="text-xs text-stone-500">This request cannot be approved because the scheduled meeting time has passed.</p>
                  </div>
                ` : (isPending ? `
                  <div class="space-y-3">
                    ${req.isPrivateRequest ? (req.isMyRoom ? `
                      <!-- Clean Note Card for Room Owner Cost Review -->
                      <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-2">
                        <div class="flex items-center justify-between">
                          <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:pen-line" data-stroke-width="1.8"></span>
                            </div>
                            <span>Manager Review Note <span class="font-normal text-[#7D6857]">(${roomObj.roomOwner?.name || 'Owner'})</span></span>
                          </label>
                          <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                        </div>
                        <textarea id="pitika-inline-notes" rows="2" placeholder="e.g. Food and IT service costs verified." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                        <button onclick="app.confirmPitikaDirectPrivateApproval('${req.id}')" aria-label="Approve Food and IT Costs" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-[0.98]">
                          <span class="iconify text-white text-sm" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                          <span class="text-white">Approve Food & IT Costs</span>
                        </button>
                      </div>
                    ` : `
                      <!-- Clean Note Card for Endorsement & Room Owner Note -->
                      <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-2">
                        <div class="flex items-center justify-between">
                          <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:pen-line" data-stroke-width="1.8"></span>
                            </div>
                            <span>Note for Room Owner <span class="font-normal text-[#7D6857]">(${roomObj.roomOwner?.name || 'Dr. Sokhom Phan'})</span></span>
                          </label>
                          <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                        </div>
                        <textarea id="pitika-inline-notes" rows="2" placeholder="e.g. Step 1 endorsed. Forwarded for your executive approval..." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                        <button onclick="app.confirmPitikaInlineEndorsement('${req.id}')" aria-label="Approve and send to room owner" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-[0.98]">
                          <span class="iconify text-white text-sm" data-icon="lucide:send" data-stroke-width="2"></span>
                          <span class="text-white">Approve & Send to Room Owner</span>
                        </button>
                      </div>
                    `) : (req.needsIT ? `
                      <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-2">
                        <div class="flex items-center justify-between">
                          <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:pen-line" data-stroke-width="1.8"></span>
                            </div>
                            <span>Note for IT Team</span>
                          </label>
                          <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                        </div>
                        <textarea id="pitika-inline-notes" rows="2" placeholder="e.g. Equipment verified. Please prepare video conference..." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                        <button onclick="app.handlePitikaApproveAndForwardIT('${req.id}')" aria-label="Approve and dispatch to IT" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-[0.98]">
                          <span class="iconify text-white text-sm" data-icon="lucide:share-2" data-stroke-width="2"></span>
                          <span class="text-white">Approve & Send to IT Team</span>
                        </button>
                      </div>
                    ` : `
                      <div class="p-2.5 sm:p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-2">
                        <div class="flex items-center justify-between">
                          <label for="pitika-inline-notes" class="text-xs font-semibold text-[#3E2B1E] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                              <span class="iconify text-sm text-[#991B1B]" data-icon="lucide:pen-line" data-stroke-width="1.8"></span>
                            </div>
                            <span>Approval Note</span>
                          </label>
                          <span class="text-[10px] font-mono text-[#7D6857]">Optional</span>
                        </div>
                        <textarea id="pitika-inline-notes" rows="2" placeholder="Add optional approval instructions..." class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                        <button onclick="app.handlePitikaDirectApproval('${req.id}')" aria-label="Approve meeting room" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-[0.98]">
                          <span class="iconify text-white text-sm" data-icon="lucide:check" data-stroke-width="2"></span>
                          <span class="text-white">Approve Meeting Room</span>
                        </button>
                      </div>
                    `)}

                    <!-- Inline Decline Toggle -->
                    <div class="pt-1.5 border-t border-[#E9E3DD]">
                      <button type="button" onclick="app.togglePitikaInlineReject()" aria-label="Decline or reject request" class="w-full py-1.5 text-center text-xs font-medium text-rose-700 hover:text-rose-900 transition flex items-center justify-center gap-1 cursor-pointer">
                        <span class="iconify text-xs" data-icon="lucide:chevron-down" id="pitika-reject-icon"></span>
                        <span>Reject this request</span>
                      </button>
                      <div id="pitika-inline-reject-box" class="hidden mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <label for="pitika-inline-reject-reason" class="block text-rose-950 font-bold text-xs">Reason for Rejection <span class="text-rose-700">*</span></label>
                        <textarea id="pitika-inline-reject-reason" rows="2" placeholder="e.g. Room is already reserved or maintenance scheduled..." class="w-full p-2.5 rounded-xl bg-white border border-rose-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 text-xs text-[#3E2B1E] placeholder:text-stone-400 outline-none transition leading-relaxed resize-none"></textarea>
                        <button onclick="app.confirmPitikaInlineRejection('${req.id}')" aria-label="Confirm rejection" class="w-full min-h-[40px] py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-[0.98]">
                          <span class="iconify text-xs text-white" data-icon="lucide:ban"></span>
                          <span class="text-white">Reject Request</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ` : (isSetup ? `
                  <div class="pt-2">
                    <button onclick="app.handlePitikaFinalizeRoomStatus('${req.id}')" aria-label="Confirm room and issue pass" class="w-full min-h-[44px] px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-[0.98]">
                      <span class="iconify text-white text-sm" data-icon="lucide:lock" data-stroke-width="2"></span>
                      <span class="text-white">Confirm Room Booking</span>
                    </button>
                  </div>
                ` : (isRejected ? `
                  <div class="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                    <span class="iconify text-rose-700 text-base shrink-0 mt-0.5" data-icon="lucide:alert-circle" data-stroke-width="2"></span>
                    <div>
                      <strong class="text-xs font-bold text-rose-900 block">Rejected by ${isOwnerRejected ? 'Room Owner' : 'Pitika S.'}</strong>
                      <p class="text-xs text-rose-800 mt-0.5 leading-relaxed">${req.rejectionReason || req.roomOwnerReview?.ownerNotes || 'Schedule conflict or requirements unmet.'}</p>
                    </div>
                  </div>
                ` : (isCancelled ? `
                  <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                    <span class="iconify text-stone-600 text-base shrink-0 mt-0.5" data-icon="lucide:slash" data-stroke-width="2"></span>
                    <div>
                      <strong class="text-xs font-bold text-stone-900 block">Reservation Cancelled</strong>
                      <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">${req.cancellationReason || 'The reservation was cancelled by the requester.'}</p>
                    </div>
                  </div>
                ` : (isConfirmed ? `
                  <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
                    <span class="iconify text-emerald-700 text-base shrink-0 mt-0.5" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                    <div>
                      <strong class="text-xs font-bold text-emerald-900 block">Agreement Signed & Confirmed</strong>
                      <p class="text-xs text-emerald-800 mt-0.5 leading-relaxed">Door passcode <span class="font-mono font-bold">${doorAccess.code || '849201'}</span> issued. Security protocol registered for entrance barrier.</p>
                    </div>
                  </div>
                ` : '')))))}

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

                ${isConfirmed ? `
                  <button
                    type="button"
                    onclick="app.openReceiptPage('${req.id}', 'pitika-review')"
                    class="h-9 px-3.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-[0.98]"
                    title="View Booking Receipt"
                  >
                    <span class="iconify text-white text-sm" data-icon="lucide:receipt" data-stroke-width="2"></span>
                    <span class="text-white">View Booking Receipt</span>
                  </button>
                ` : `
                  <button
                    type="button"
                    onclick="app.navigateTo('pitika-queue')"
                    class="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#7D6857] hover:text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
                  >
                    <span class="iconify text-xs text-[#7D6857]" data-icon="lucide:list-filter" data-stroke-width="2"></span>
                    <span>Review Queue</span>
                  </button>
                `}
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- =============================================================== -->
      <!-- SLIDE-OVER DRAWER: OPERATIONAL LOGISTICS & SERVICES             -->
      <!-- =============================================================== -->
      <div id="pitika-services-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="pitika-services-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['pitika-review'].toggleServicesDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="pitika-services-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col h-full shadow-2xl transition-transform duration-300 translate-x-full">
            
            <!-- Drawer Header (shrink-0) -->
            <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shadow-2xs">
                  <span class="iconify text-base" data-icon="lucide:concierge-bell" data-stroke-width="2"></span>
                </span>
                <div class="flex items-center gap-2">
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Operational Logistics</h3>
                  ${activeServicesCount > 0 ? `
                    <span class="font-mono text-xs font-bold text-[#991B1B]">(${activeServicesCount})</span>
                  ` : ''}
                </div>
              </div>
              <button
                onclick="window.NBC.views['pitika-review'].toggleServicesDrawer(false)"
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
                ${this._renderITModule(req)}
                ${this._renderCateringModule(req, isConfirmed, isRejected, isCancelled, floorShort)}
              ` : `
                ${this._renderCateringModule(req, isConfirmed, isRejected, isCancelled, floorShort)}
                ${this._renderITModule(req)}
              `}

            </div>

            <!-- Drawer Footer (shrink-0) -->
            <div class="pt-3 border-t border-[#E9E3DD] flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onclick="window.NBC.views['pitika-review'].handleContactSupport('${req.id}')"
                class="flex-1 h-10 rounded-xl bg-[#FAF7F4] hover:bg-white text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:phone-call" data-stroke-width="2"></span>
                <span>Contact Support</span>
              </button>
              <button
                type="button"
                onclick="window.NBC.views['pitika-review'].toggleServicesDrawer(false)"
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
      <div id="pitika-location-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="pitika-location-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['pitika-review'].toggleLocationDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="pitika-location-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col justify-between shadow-2xl space-y-5 transition-transform duration-300 translate-x-full">

            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-base" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Facility Location & Access</h3>
                </div>
                <button
                  onclick="window.NBC.views['pitika-review'].toggleLocationDrawer(false)"
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

            <div class="pt-3 border-t border-[#E9E3DD] flex gap-2">
              <a
                href="${mapInfo.directionsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-11 rounded-xl bg-white hover:bg-stone-50 text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs text-center cursor-pointer"
              >
                <span class="iconify text-stone-600 text-sm" data-icon="lucide:navigation" data-stroke-width="2"></span>
                <span>Get Directions</span>
              </a>
              <a
                href="${mapInfo.externalUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-11 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs text-center cursor-pointer"
              >
                <span class="iconify text-white text-sm" data-icon="lucide:external-link" data-stroke-width="2"></span>
                <span class="text-white">Google Maps</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    `;

    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(container);
    }
  } catch (err) {
    console.error('Error rendering Pitika Review page:', err);
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-6 space-y-3">
        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
          <span class="iconify text-xl" data-icon="lucide:alert-circle"></span>
        </div>
        <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Review Render Error</h3>
        <p class="text-xs text-[#6F5849]">${err.message || 'An error occurred while loading this request.'}</p>
        <button onclick="app.navigateTo('pitika-queue')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] mx-auto mt-2 flex items-center gap-1.5 cursor-pointer">
          <span class="iconify text-sm text-white" data-icon="lucide:arrow-left"></span>
          <span class="text-white">Back to Review Queue</span>
        </button>
      </div>
    `;
    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(container);
    }
  }
}

  _renderCateringModule(req, isConfirmed, isRejected, isCancelled, floorShort) {
    if (req.needsCatering) {
      return `
        <!-- Food & Catering Module (Requested / Active) -->
        <div class="p-4 rounded-xl bg-white border border-[#E9E3DD] shadow-2xs space-y-3">
          <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
            <div class="flex items-center gap-2">
              <span class="iconify text-amber-700 text-sm" data-icon="lucide:utensils" data-stroke-width="2"></span>
              <h4 class="font-bold text-xs text-[#3E2B1E]">Food & Catering</h4>
            </div>
            <span class="font-mono text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <span class="iconify text-xs" data-icon="lucide:check-circle-2"></span>
              <span>Requested</span>
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[#7D6857]">Package:</span>
              <strong class="text-[#3E2B1E]">${req.cateringDetails?.packageName?.split('(')[0]?.trim() || 'Executive Selection'}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#7D6857]">Portions:</span>
              <strong class="font-mono text-[#3E2B1E]">${req.cateringDetails?.servings || req.attendees || 8} Servings</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#7D6857]">Delivery Time:</span>
              <strong class="font-mono text-[#3E2B1E]">${req.cateringDetails?.deliveryTime || req.startTime || '08:30'}</strong>
            </div>
            <div class="pt-1.5 border-t border-[#E9E3DD]">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#7D6857] block mb-0.5">Dietary / Remarks:</span>
              <p class="text-xs text-[#6F5849] leading-relaxed">${req.cateringDetails?.dietaryRemarks || req.cateringDetails?.dietary || 'Standard corporate catering'}</p>
            </div>
          </div>

          ${!isConfirmed && !isRejected && !isCancelled ? `
            <div class="pt-2 border-t border-[#E9E3DD]">
              <label for="approver-page-catering-notes" class="block text-[10px] font-bold uppercase tracking-wider text-[#7D6857] mb-1">Kitchen Note (Approver):</label>
              <input type="text" id="approver-page-catering-notes" value="${req.cateringDetails?.approverNotes || 'Food order approved.'}" class="w-full p-2.5 rounded-xl bg-white border border-[#E9E3DD] focus:border-[#991B1B] text-xs text-[#3E2B1E] outline-none transition" />
            </div>
          ` : ''}
        </div>
      `;
    }

    // Grayed out when not requested
    return `
      <!-- Food & Catering Module (Not Requested / Grayed Out) -->
      <div class="p-3.5 rounded-xl bg-stone-50/80 border border-dashed border-stone-200/90 opacity-55 hover:opacity-90 transition-opacity space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="iconify text-stone-400 text-sm" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
            <h4 class="font-semibold text-xs text-stone-400">Food & Catering</h4>
          </div>
          <span class="font-mono text-[10.5px] text-stone-400">None</span>
        </div>
        <p class="text-[11px] text-stone-400 leading-relaxed">
          No catering requested for this reservation. Self-service beverage station available on ${floorShort}.
        </p>
      </div>
    `;
  }

  _renderITModule(req) {
    if (req.needsIT) {
      return `
        <!-- IT & AV Support Module (Requested / Active) -->
        <div class="p-4 rounded-xl bg-white border border-[#E9E3DD] shadow-2xs space-y-3">
          <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
            <div class="flex items-center gap-2">
              <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:headset" data-stroke-width="2"></span>
              <h4 class="font-bold text-xs text-[#3E2B1E]">IT & AV Support</h4>
            </div>
            <span class="font-mono text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <span class="iconify text-xs" data-icon="lucide:check-circle-2"></span>
              <span>Requested</span>
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#7D6857] block mb-1">Requested Equipment:</span>
              <div class="space-y-1.5">
                ${(req.itDetails?.requestedItems || ['Video Conference Setup (Zoom / Teams)', 'Microphones & Audio Setup']).map(item => `
                  <div class="flex items-center gap-2 text-[#3E2B1E] p-1.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD]">
                    <span class="iconify text-emerald-600 text-xs shrink-0" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    <span class="text-xs font-medium">${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-2 border-t border-[#E9E3DD] flex items-center justify-between">
              <span class="text-[#7D6857]">Technician:</span>
              ${req.itDetails?.assignedStaffList && req.itDetails.assignedStaffList.length > 0 ? `
                <strong class="text-emerald-700 font-semibold text-xs">${req.itDetails.assignedStaffList.map(s => s.name.split(' ')[0]).join(', ')}</strong>
              ` : (req.itDetails?.assignedStaff ? `
                <strong class="text-emerald-700 font-semibold text-xs">${req.itDetails.assignedStaff.name}</strong>
              ` : `
                <span class="text-amber-700 font-medium text-[11px]">Auto-assigned on approval</span>
              `)}
            </div>
          </div>
        </div>
      `;
    }

    // Grayed out when not requested
    return `
      <!-- IT & AV Support Module (Not Requested / Grayed Out) -->
      <div class="p-3.5 rounded-xl bg-stone-50/80 border border-dashed border-stone-200/90 opacity-55 hover:opacity-90 transition-opacity space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="iconify text-stone-400 text-sm" data-icon="lucide:headset" data-stroke-width="1.8"></span>
            <h4 class="font-semibold text-xs text-stone-400">IT & AV Support</h4>
          </div>
          <span class="font-mono text-[10.5px] text-stone-400">None</span>
        </div>
        <p class="text-[11px] text-stone-400 leading-relaxed">
          Standard room setup ready: presentation screen, power hubs, and high-speed Wi-Fi.
        </p>
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
        { label: '1. Sent', sub: 'Submitted', state: step1State },
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

    setTimeout(() => {
      bookingStore.approvePrivateRoomDirectly(requestId, { notes });
      this.showToast("Approved with IT", "Food & IT services approved. Setup dispatched.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 600);
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

    setTimeout(() => {
      bookingStore.forwardToRoomOwner(requestId, { managerNotes: notes });
      this.showToast("Step 1 Approved", "Sent to Room Owner for final approval.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 600);
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

  handlePitikaApproveAndForwardIT(requestId) {
    const cateringNotes = document.getElementById('pitika-inline-notes')?.value.trim() || document.getElementById('approver-page-catering-notes')?.value || '';

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

    setTimeout(() => {
      bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: true });
      this.showToast("Approved with IT", "Ticket dispatched to IT Specialists queue.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 600);
  }

  handlePitikaDirectApproval(requestId) {
    const cateringNotes = document.getElementById('pitika-inline-notes')?.value.trim() || document.getElementById('approver-page-catering-notes')?.value || '';

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

    setTimeout(() => {
      bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: false });
      bookingStore.finalizeRoomStatus(requestId);
      this.showToast("Booking Approved", "Meeting room confirmed and pass generated.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 600);
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

    setTimeout(() => {
      bookingStore.finalizeRoomStatus(requestId);
      this.showToast("Pass Issued", "Room setup verified and door access pass issued.", "success");
      this.renderPitikaReviewPage(requestId);
    }, 600);
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

  // Backward compatibility alias methods for modals
  openPitikaEndorseModal(requestId) { this.renderPitikaReviewPage(requestId); }
  closePitikaEndorseModal() {}
  confirmPitikaEndorsement() {}
  openApproverRejectModal(requestId) { this.renderPitikaReviewPage(requestId); }
  closeApproverRejectModal() {}
  confirmRejectRequest() {}
}

window.NBC.views['pitika-review'] = new PitikaReviewView();
