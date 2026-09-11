// My Bookings View Component (view-my-bookings)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class MyBookingsView {
  constructor() {
    this.id = 'my-bookings';
    this.myBookingsFilter = 'all';
    this.template = "<!-- Summary Stats Banner -->\n        <div id=\"my-bookings-summary-banner\" class=\"grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3\">\n          <!-- Populated dynamically: Total, Confirmed, Waiting -->\n        </div>\n\n        <!-- Filter Bar & Quick Action (Clean Single-Row Layout) -->\n        <div class=\"flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E9E3DD] pb-3 gap-3\">\n          <!-- Outer Shell: Pill Container that NEVER changes shape -->\n          <div class=\"segmented-control w-full sm:w-auto\">\n            <div class=\"segmented-scroll-track\">\n              <button id=\"my-filter-all\" onclick=\"app.filterMyBookings('all')\" class=\"segmented-btn active\">\n                <span>All</span>\n                <span id=\"my-count-all\" class=\"segmented-badge\">0</span>\n              </button>\n              <button id=\"my-filter-confirmed\" onclick=\"app.filterMyBookings('confirmed')\" class=\"segmented-btn\">\n                <span>Confirmed</span>\n                <span id=\"my-count-confirmed\" class=\"segmented-badge\">0</span>\n              </button>\n              <button id=\"my-filter-waiting\" onclick=\"app.filterMyBookings('waiting')\" class=\"segmented-btn\">\n                <span>Waiting</span>\n                <span id=\"my-count-waiting\" class=\"segmented-badge\">0</span>\n              </button>\n              <button id=\"my-filter-cancelled\" onclick=\"app.filterMyBookings('cancelled')\" class=\"segmented-btn\">\n                <span>Cancelled</span>\n                <span id=\"my-count-cancelled\" class=\"segmented-badge\">0</span>\n              </button>\n            </div>\n          </div>\n\n          <button onclick=\"app.navigateTo('book-room')\" aria-label=\"Book a meeting room\" class=\"btn-primary min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold shrink-0 shadow-xs flex items-center justify-center space-x-1.5\">\n            <span class=\"iconify text-sm\" data-icon=\"lucide:calendar-plus\" data-stroke-width=\"1.8\"></span>\n            <span>+ Book Room</span>\n          </button>\n        </div>\n\n        <!-- Bookings Cards Container -->\n        <div id=\"requester-bookings-list\" class=\"space-y-3.5\">\n          <!-- Populated dynamically -->\n        </div>";
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

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div id="view-my-bookings-content" class="w-full space-y-4">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this.renderRequesterBookings();
  }

  update() {
    this.renderRequesterBookings();
  }

  filterMyBookings(filter) {
    this.myBookingsFilter = filter;
    const filterBtns = ['all', 'confirmed', 'waiting', 'cancelled'];
    filterBtns.forEach(f => {
      const btn = document.getElementById(`my-filter-${f}`);
      if (btn) {
        btn.classList.toggle('active', f === filter);
      }
    });
    this.renderRequesterBookings();
  }


  renderRequesterBookings() {
    const container = document.getElementById('requester-bookings-list');
    const summaryBanner = document.getElementById('my-bookings-summary-banner');
    if (!container) return;

    const allRequests = bookingStore.getRequests();

    // Compute Summary Numbers
    const totalCount = allRequests.length;
    const confirmedCount = allRequests.filter(r => r.status === 'Approved - Confirmed').length;
    const waitingCount = allRequests.filter(r => r.status === 'Pending Review' || r.status === 'Pending Manager Review' || r.status === 'Pending Room Owner Approval' || r.status === 'Approved - Setup In Progress').length;
    const cancelledCount = allRequests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length;

    // Update Counts on Filter Pills
    const cAll = document.getElementById('my-count-all');
    const cConf = document.getElementById('my-count-confirmed');
    const cWait = document.getElementById('my-count-waiting');
    const cCanc = document.getElementById('my-count-cancelled');
    if (cAll) cAll.innerText = totalCount;
    if (cConf) cConf.innerText = confirmedCount;
    if (cWait) cWait.innerText = waitingCount;
    if (cCanc) cCanc.innerText = cancelledCount;

    // Render Summary Stats Banner
    if (summaryBanner) {
      const nextMeeting = allRequests.find(r => r.status === 'Approved - Confirmed');
      summaryBanner.innerHTML = `
        <div class="bg-white p-3 sm:p-4 rounded-xl border border-[#E9E3DD] flex items-center justify-between shadow-2xs">
          <div class="min-w-0 pr-1">
            <span class="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-500 truncate block">Confirmed</span>
            <h3 class="text-xl sm:text-2xl font-heading font-extrabold text-stone-900 mt-0.5">${confirmedCount}</h3>
            <p class="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">Ready for team</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
            <span class="iconify text-base sm:text-lg" data-icon="lucide:calendar-check-2" data-stroke-width="1.8"></span>
          </div>
        </div>

        <div class="bg-white p-3 sm:p-4 rounded-xl border border-[#E9E3DD] flex items-center justify-between shadow-2xs">
          <div class="min-w-0 pr-1">
            <span class="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-500 truncate block">Pending</span>
            <h3 class="text-xl sm:text-2xl font-heading font-extrabold text-amber-700 mt-0.5">${waitingCount}</h3>
            <p class="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">In Review</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold shrink-0">
            <span class="iconify text-base sm:text-lg" data-icon="lucide:clock" data-stroke-width="1.8"></span>
          </div>
        </div>

        <div class="col-span-2 sm:col-span-1 bg-white p-3 sm:p-4 rounded-xl border border-[#E9E3DD] flex items-center justify-between shadow-2xs">
          <div class="min-w-0 pr-2">
            <span class="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-500 truncate block">Next Upcoming Meeting</span>
            ${nextMeeting ? `
              <h3 class="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 truncate">${nextMeeting.room.name}</h3>
              <p class="text-[10px] sm:text-[11px] text-red-900 font-semibold mt-0.5 truncate">${nextMeeting.date} &bull; ${nextMeeting.startTime}</p>
            ` : `
              <p class="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">No upcoming meetings</p>
            `}
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 text-red-900 border border-red-200 flex items-center justify-center font-bold shrink-0">
            <span class="iconify text-base sm:text-lg" data-icon="lucide:door-open" data-stroke-width="1.8"></span>
          </div>
        </div>
      `;
    }

    // Filter list
    let filtered = allRequests;
    if (this.myBookingsFilter === 'confirmed') {
      filtered = allRequests.filter(r => r.status === 'Approved - Confirmed');
    } else if (this.myBookingsFilter === 'waiting') {
      filtered = allRequests.filter(r => r.status === 'Pending Review' || r.status === 'Pending Manager Review' || r.status === 'Pending Room Owner Approval' || r.status === 'Approved - Setup In Progress');
    } else if (this.myBookingsFilter === 'cancelled') {
      filtered = allRequests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center bg-white rounded-xl border border-[#E9E3DD] space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
            <span class="iconify text-xl" data-icon="lucide:calendar-x-2" data-stroke-width="1.8"></span>
          </div>
          <p class="text-xs font-bold text-stone-800">No Bookings Found</p>
          <p class="text-[11px] text-stone-500">There are no meeting rooms in this category right now.</p>
          <button onclick="app.navigateTo('book-room')" class="btn-primary px-3.5 py-1.5 rounded-md text-xs font-bold mt-2 shadow-xs">
            + Find and Book a Room
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(req => {
      const room = bookingStore.getRoomById(req.room.id) || bookingStore.getRooms()[0];
      const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
      const isConfirmed = req.status === 'Approved - Confirmed';
      const isRejected = req.status === 'Rejected';
      const isCancelled = req.status === 'Cancelled';
      const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review';
      const isOwnerPending = req.status === 'Pending Room Owner Approval';
      const isSetup = req.status === 'Approved - Setup In Progress';
      const isMyRoom = req.isMyRoom || (req.room?.id === 'ROOM-107' || req.room?.roomOwner?.name === 'Jonathan Vance' || req.room?.roomOwner?.id === 'OWNER-VANCE');
      const isPitikaApproved = req.managerReview?.decision === 'Approved';
      const isCancelledAfterPitika = isCancelled && isPitikaApproved;
      const isCancelledBeforePitika = isCancelled && !isPitikaApproved;
      const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');
      const isPitikaRejected = isRejected && !isOwnerRejected;
      const stepperStepsClass = isMyRoom ? (req.needsIT || req.needsCatering ? 'steps-4' : 'steps-3') : (isPrivate ? 'steps-5' : 'steps-4');

      let statusBadgeClass = 'badge-pending';
      let statusLabel = 'Waiting for Pitika';
      let statusIcon = 'lucide:clock';
      if (isConfirmed) {
        statusBadgeClass = 'badge-approved';
        statusLabel = isMyRoom ? 'Confirmed (Your Room)' : 'Confirmed';
        statusIcon = 'lucide:check-circle-2';
      } else if (isRejected) {
        statusBadgeClass = 'badge-rejected';
        statusLabel = isOwnerRejected ? 'Rejected by Owner' : 'Rejected by Pitika';
        statusIcon = 'lucide:alert-circle';
      } else if (isCancelled) {
        statusBadgeClass = 'badge-cancelled';
        statusLabel = 'Cancelled';
        statusIcon = 'lucide:x-circle';
      } else if (isOwnerPending) {
        statusBadgeClass = 'badge-owner-pending';
        statusLabel = 'Waiting for Owner';
        statusIcon = 'lucide:key';
      } else if (isSetup) {
        statusBadgeClass = 'badge-setup';
        statusLabel = 'Setting Up';
        statusIcon = 'lucide:settings';
      }

      // Compute Timeline Stepper Progress width
      let progressPercent = '0%';
      if (isMyRoom && !req.needsIT && !req.needsCatering) {
        progressPercent = '100%';
      } else if (isMyRoom && (req.needsIT || req.needsCatering)) {
        if (isConfirmed) progressPercent = '100%';
        else if (isSetup) progressPercent = '66.6%';
        else progressPercent = '33.3%';
      } else if (isPrivate) {
        if (isConfirmed) progressPercent = '100%';
        else if (isSetup) progressPercent = '75%';
        else if (isOwnerPending || isOwnerRejected || isCancelledAfterPitika) progressPercent = '50%';
        else if (isPitikaRejected || isPending || isCancelledBeforePitika) progressPercent = '25%';
      } else {
        if (isConfirmed) progressPercent = '100%';
        else if (isSetup) progressPercent = '66.6%';
        else if (isPitikaRejected || isPending || isCancelled) progressPercent = '33.3%';
      }

      return `
        <div class="slate-card p-4 space-y-3.5">
          
          <!-- TOP CARD ROW: Room Thumbnail + Title + Status Badge & Price -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-stone-100 pb-3">
            <div class="flex items-start space-x-3">
              <!-- Room Thumbnail with Floor Badge -->
              <div class="relative w-14 h-14 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-[#E9E3DD] shadow-2xs">
                <img src="${room.image}" alt="${room.name}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-stone-900/10"></div>
              </div>

              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-[10px] font-bold text-red-950 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">${req.id}</span>
                  ${req.isPrivateRequest ? `
                    <span class="badge-private-room text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-1">
                      <span class="iconify" data-icon="lucide:key"></span>
                      <span>${isMyRoom ? 'Your Room' : 'Private Room'}</span>
                    </span>
                  ` : ''}
                  <button onclick="app.copyReferenceCode('${req.referenceCode}')" title="Click to copy security code" class="text-[11px] text-stone-500 hover:text-stone-800 font-medium flex items-center space-x-1 cursor-pointer">
                    <span>Code: <strong class="font-mono text-stone-900">${req.referenceCode}</strong></span>
                    <span class="iconify text-[10px] text-stone-400" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                  </button>
                </div>
                <h3 class="font-heading font-bold text-sm text-stone-900 mt-0.5 leading-tight">${req.meetingTitle}</h3>
                <p class="text-[11px] text-stone-600 font-medium mt-0.5">${room.name} &bull; ${room.floor}</p>
              </div>
            </div>

            <!-- Status Pill -->
            <div class="flex items-center space-x-2 self-start sm:self-auto">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 ${statusBadgeClass}">
                <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="1.8"></span>
                <span>${statusLabel}</span>
              </span>
            </div>
          </div>

          <!-- Private Room Reason Banner -->
          ${req.isPrivateRequest ? `
            <div class="p-2.5 bg-amber-50/60 rounded-lg border-l-4 border-amber-500 text-xs text-amber-950 flex items-start space-x-2">
              <span class="iconify text-amber-700 text-sm mt-0.5 shrink-0" data-icon="lucide:shield-alert"></span>
              <div>
                <span class="font-bold text-[11px] text-amber-900">Reason for Private Room:</span>
                <p class="text-[11px] text-amber-950 mt-0.5">${req.privateJustification || 'Special executive request.'}</p>
                ${req.roomOwnerDecision?.timeAdjusted ? `
                  <p class="text-[10px] font-bold text-emerald-800 mt-1 flex items-center space-x-1">
                    <span class="iconify" data-icon="lucide:clock"></span>
                    <span>Approved Time: ${req.startTime} - ${req.endTime}</span>
                  </p>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- MIDDLE SPECS: When & Add-ons Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2.5 border-y border-stone-200 text-xs">
            <div>
              ${(req.sessions && req.sessions.length > 1) ? `
                <div class="flex items-center space-x-1.5">
                  <span class="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
                  <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">${req.sessions.length} Sessions</span>
                </div>
                <strong class="text-stone-900 text-xs font-semibold">${req.sessions.length} Sessions Scheduled</strong>
                <p class="text-[11px] text-stone-600 font-medium">${req.sessions[0].date} (${req.sessions[0].startTime}) + ${req.sessions.length - 1} more (${req.attendees} People)</p>
                
                <details class="mt-1.5 group cursor-pointer">
                  <summary class="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 select-none">
                    <span class="iconify text-xs" data-icon="lucide:calendar-range"></span>
                    <span>View All ${req.sessions.length} Sessions</span>
                    <span class="iconify group-open:rotate-180 transition-transform text-[11px]" data-icon="lucide:chevron-down"></span>
                  </summary>
                  <div class="mt-1.5 space-y-1 p-2 bg-stone-50 rounded-lg border border-stone-200">
                    ${req.sessions.map((s, sIdx) => `
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="font-medium text-stone-700">#${sIdx + 1} ${s.date}</span>
                        <span class="font-mono text-stone-900 font-bold">${s.startTime} – ${s.endTime}</span>
                      </div>
                    `).join('')}
                  </div>
                </details>
              ` : `
                <span class="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
                <strong class="text-stone-900 text-xs font-semibold">${req.date}</strong>
                <p class="text-[11px] text-stone-600 font-medium">${req.startTime} - ${req.endTime} (${req.attendees} People)</p>
              `}
            </div>

            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">Food & Drinks</span>
              ${req.needsCatering ? `
                <div class="flex items-center space-x-1 mt-0.5">
                  <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center space-x-1">
                    <span class="iconify text-amber-700 text-[11px]" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
                    <span>${req.cateringDetails?.packageName?.split('(')[0]?.trim() || 'Food Order'}</span>
                  </span>
                </div>
                <p class="text-[10px] text-stone-500 font-medium mt-0.5">${req.cateringDetails?.isConfirmedByApprover ? 'Food Confirmed' : 'Waiting for Pitika'}</p>
              ` : `
                <span class="text-stone-400 text-[11px]">No food requested</span>
              `}
            </div>

            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">IT Support</span>
              ${req.needsIT ? `
                <div class="flex items-center space-x-1 mt-0.5">
                  <span class="px-2 py-0.5 rounded bg-red-100 text-red-950 border border-red-300 font-bold text-[10px] flex items-center space-x-1">
                    <span class="iconify text-red-700 text-[11px]" data-icon="lucide:headset" data-stroke-width="1.8"></span>
                    <span>${req.itDetails?.assignedStaff ? req.itDetails.assignedStaff.name : 'Help Requested'}</span>
                  </span>
                </div>
                <p class="text-[10px] text-stone-500 font-medium mt-0.5">${req.isPrivateRequest && isOwnerPending ? 'Dispatches after Owner approval' : (req.itDetails?.isReady ? 'Equipment Ready' : (isSetup ? 'Technicians setting up' : 'Setup in progress'))}</p>
              ` : `
                <span class="text-stone-400 text-[11px]">No IT requested</span>
              `}
            </div>
          </div>

          <!-- Rejection / Cancellation Callout -->
          ${isRejected ? `
            <div class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start space-x-2">
              <span class="iconify text-rose-600 text-sm mt-0.5 shrink-0" data-icon="lucide:alert-triangle" data-stroke-width="1.8"></span>
              <div>
                <strong class="font-bold">Reason:</strong>
                <p class="text-rose-700 mt-0.5">${req.roomOwnerDecision?.notes || req.approver?.rejectionReason || 'Request rejected.'}</p>
              </div>
            </div>
          ` : ''}

          ${isCancelled ? `
            <div class="p-2 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-700 flex items-center space-x-2">
              <span class="iconify text-stone-500 text-sm shrink-0" data-icon="lucide:ban" data-stroke-width="1.8"></span>
              <span>This booking was cancelled.</span>
            </div>
          ` : ''}

          <!-- Stepper -->
          <div class="stepper-container pt-1 pb-1">
            <div class="stepper-track ${stepperStepsClass}">
              <!-- Connecting Line -->
              <div class="stepper-line">
                <div class="stepper-line-progress" style="width: ${progressPercent};"></div>
              </div>

              ${isMyRoom ? (req.needsIT || req.needsCatering ? `
                <!-- Own Room With Add-ons: 4 Steps (Pitika Cost Review) -->
                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">1. Booked</span>
                  <span class="stepper-sub">Instant</span>
                </div>

                <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isRejected ? 'failed' : (isPending ? 'active' : ''))}">
                  <div class="stepper-circle">
                    ${isConfirmed || isSetup ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isRejected ? `
                      <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                    ` : (isPending ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
                    ` : `<span>2</span>`))}
                  </div>
                  <span class="stepper-label">2. Cost Review</span>
                  <span class="stepper-sub">${isConfirmed || isSetup ? 'Approved' : (isPending ? 'In Review' : 'Rejected')}</span>
                </div>

                <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isSetup ? `
                      <span class="iconify text-xs animate-spin" data-icon="${req.needsIT ? 'lucide:headset' : 'lucide:settings'}" data-stroke-width="2"></span>
                    ` : `<span>3</span>`)}
                  </div>
                  <span class="stepper-label">${req.needsIT ? '3. IT Setup' : '3. Setup'}</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'Setting Up' : 'Waiting')}</span>
                </div>

                <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                    ` : `<span>4</span>`}
                  </div>
                  <span class="stepper-label">4. Door Pass</span>
                  <span class="stepper-sub">${isConfirmed ? 'Active' : 'Pending'}</span>
                </div>
              ` : `
                <!-- Own Room Without Add-ons: 3 Steps Instant -->
                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">1. Booked</span>
                  <span class="stepper-sub">Instant</span>
                </div>

                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">2. Setup</span>
                  <span class="stepper-sub">Ready</span>
                </div>

                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">3. Door Pass</span>
                  <span class="stepper-sub">Active</span>
                </div>
              `) : isPrivate ? `
                <!-- Step 1: Sent -->
                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">1. Sent</span>
                  <span class="stepper-sub">${req.submissionTimestamp}</span>
                </div>

                <!-- Step 2: Pitika Review -->
                <div class="stepper-node ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'completed' : (isPitikaRejected || isCancelledBeforePitika ? 'failed' : (isPending ? 'active' : ''))}">
                  <div class="stepper-circle">
                    ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isPitikaRejected || isCancelledBeforePitika ? `
                      <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                    ` : (isPending ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
                    ` : `
                      <span>2</span>
                    `))}
                  </div>
                  <span class="stepper-label">2. Pitika</span>
                  <span class="stepper-sub">${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'Approved' : (isPending ? 'In Review' : (isPitikaRejected ? 'Rejected' : (isCancelledBeforePitika ? 'Cancelled' : 'Waiting')))}</span>
                </div>

                <!-- Step 3: Room Owner -->
                <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isOwnerRejected || isCancelledAfterPitika ? 'failed' : (isOwnerPending ? 'active' : ''))}">
                  <div class="stepper-circle">
                    ${isConfirmed || isSetup ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isOwnerRejected || isCancelledAfterPitika ? `
                      <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                    ` : (isOwnerPending ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:key" data-stroke-width="2"></span>
                    ` : `
                      <span>3</span>
                    `))}
                  </div>
                  <span class="stepper-label">3. Room Owner</span>
                  <span class="stepper-sub">${isConfirmed || isSetup ? 'Approved' : (isOwnerPending ? 'Reviewing' : (isOwnerRejected ? 'Rejected' : (isCancelledAfterPitika ? 'Cancelled' : 'Waiting')))}</span>
                </div>

                <!-- Step 4: IT & Room Setup -->
                <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isSetup ? `
                      <span class="iconify text-xs animate-spin" data-icon="${req.needsIT ? 'lucide:headset' : 'lucide:settings'}" data-stroke-width="2"></span>
                    ` : `
                      <span>4</span>
                    `)}
                  </div>
                  <span class="stepper-label">${req.needsIT ? '4. IT Setup' : '4. Setup'}</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'Setting Up' : (isPending || isOwnerPending ? 'Waiting for Both Approvals' : 'Queued'))}</span>
                </div>

                <!-- Step 5: Door Pass -->
                <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                    ` : `
                      <span>5</span>
                    `}
                  </div>
                  <span class="stepper-label">5. Door Pass</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : 'Pending'}</span>
                </div>
              ` : `
                <!-- Step 1: Sent -->
                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">1. Sent</span>
                  <span class="stepper-sub">${req.submissionTimestamp}</span>
                </div>

                <!-- Standard Step 2: Pitika Review -->
                <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isRejected || isCancelled ? 'failed' : (isPending ? 'active' : ''))}">
                  <div class="stepper-circle">
                    ${isConfirmed || isSetup ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isRejected || isCancelled ? `
                      <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                    ` : (isPending ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
                    ` : `
                      <span>2</span>
                    `))}
                  </div>
                  <span class="stepper-label">2. Pitika</span>
                  <span class="stepper-sub">${isConfirmed || isSetup ? 'Approved' : (isRejected ? 'Rejected' : (isCancelled ? 'Cancelled' : (isPending ? 'In Review' : 'Waiting')))}</span>
                </div>

                <!-- Standard Step 3: Setup -->
                <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isSetup ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>
                    ` : `
                      <span>3</span>
                    `)}
                  </div>
                  <span class="stepper-label">3. Setup</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'Preparing' : 'Waiting')}</span>
                </div>

                <!-- Standard Step 4: Door Pass -->
                <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                    ` : `
                      <span>4</span>
                    `}
                  </div>
                  <span class="stepper-label">4. Door Pass</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : 'Pending'}</span>
                </div>
              `}

            </div>
          </div>

          <!-- Door Access Passcode Ready Banner (if confirmed) -->
          ${isConfirmed && !isCancelled ? `
            <div class="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span class="iconify text-emerald-800 text-xs" data-icon="lucide:key" data-stroke-width="2"></span>
                </span>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Door Passcode Active</span>
                  <p class="text-xs text-stone-700">Digital Key: <strong class="font-mono font-bold text-emerald-950">${req.referenceCode}</strong></p>
                </div>
              </div>
              <button onclick="app.copyReferenceCode('${req.referenceCode}')" class="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition">
                <span class="iconify text-xs" data-icon="lucide:copy"></span>
                <span>Copy Code</span>
              </button>
            </div>
          ` : ''}

          <!-- BOTTOM ACTION FOOTER -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2.5 border-t border-stone-200 text-xs">
            <div class="flex items-center space-x-2">
              <button onclick="app.openBookingDetailsPage('${req.id}')" class="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-md border border-[#E9E3DD] text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
                <span class="iconify text-xs text-red-800" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                <span class="sm:hidden">Details</span>
                <span class="hidden sm:inline">View Details</span>
              </button>

              ${isConfirmed ? `
                <button onclick="app.downloadCalendarInvite('${req.id}')" title="Download Calendar invite (.ics)" class="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-md border border-[#E9E3DD] text-xs font-medium flex items-center space-x-1 shadow-2xs transition">
                  <span class="iconify text-xs text-stone-500" data-icon="lucide:calendar-plus" data-stroke-width="1.8"></span>
                  <span class="sm:hidden">Calendar</span>
                  <span class="hidden sm:inline">Save to Calendar</span>
                </button>
              ` : ''}
            </div>

            <div class="flex items-center space-x-2 self-end sm:self-auto">
              ${!isCancelled && !isRejected ? `
                <button onclick="app.handleCancelBooking('${req.id}')" class="px-2.5 py-1 text-stone-500 hover:text-rose-700 text-xs font-semibold transition">
                  Cancel
                </button>
              ` : ''}

              ${isConfirmed ? `
                <button onclick="app.openReceiptPage('${req.id}', 'my-bookings')" class="btn-primary px-3.5 py-1.5 rounded-md text-xs font-bold shadow-xs flex items-center space-x-1.5">
                  <span class="iconify text-xs text-white" data-icon="lucide:receipt" data-stroke-width="1.8"></span>
                  <span class="sm:hidden">Receipt</span>
                  <span class="hidden sm:inline">Receipt</span>
                </button>
              ` : ''}
            </div>
          </div>

        </div>
      `;
    }).join('');
  }

  // ==================== STANDALONE BOOKING DETAILS PAGE ====================

}

window.NBC.views['my-bookings'] = new MyBookingsView();
