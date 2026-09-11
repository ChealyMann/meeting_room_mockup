// Booking Details View Component (view-booking-details)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class BookingDetailsView {
  constructor() {
    this.id = 'booking-details';
    this.currentBookingDetailsId = null;
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

  render(container, params = {}) {
    if (!container) return;
    const requestId = params.requestId || this.currentBookingDetailsId || 'REQ-001';
    this.currentBookingDetailsId = requestId;
    container.innerHTML = `
      <div id="view-booking-details" class="w-full space-y-5"></div>
    `;
    this.renderBookingDetailsPage(requestId);
  }

  init(params = {}) {
    if (params.requestId) {
      this.currentBookingDetailsId = params.requestId;
    }
  }

  openBookingDetailsPage(requestId) {
    this.currentBookingDetailsId = requestId;
    this.navigateTo('booking-details', { requestId });
  }

  // Backward compatibility alias

  renderBookingDetailsPage(requestId) {
    const container = document.getElementById('view-booking-details');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId);
    if (!req) {
      container.innerHTML = `
        <div class="py-12 text-center bg-white rounded-xl border border-[#E9E3DD]">
          <p class="text-xs font-semibold text-stone-800">Booking request not found.</p>
          <button onclick="app.navigateTo('my-bookings')" class="mt-3 px-4 py-2 btn-primary rounded-lg text-xs font-bold">Back to My Bookings</button>
        </div>
      `;
      return;
    }

    const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
    const isConfirmed = req.status === 'Approved - Confirmed';
    const isCancelled = req.status === 'Cancelled';
    const isRejected = req.status === 'Rejected';
    const isOwnerPending = isPrivate && req.status === 'Pending Room Owner Approval';
    const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isMyRoom = req.isMyRoom || (req.room?.id === 'ROOM-107' || req.room?.roomOwner?.name === 'Jonathan Vance' || req.room?.roomOwner?.id === 'OWNER-VANCE');
    const isPitikaApproved = req.managerReview?.decision === 'Approved';
    const isCancelledAfterPitika = isCancelled && isPitikaApproved;
    const isCancelledBeforePitika = isCancelled && !isPitikaApproved;
    const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');
    const isPitikaRejected = isRejected && !isOwnerRejected;
    const stepperStepsClass = isMyRoom ? (req.needsIT || req.needsCatering ? 'steps-4' : 'steps-3') : (isPrivate ? 'steps-5' : 'steps-4');

    // Calculate progress percentage
    let progressPercent = '20%';
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

    container.innerHTML = `
      <!-- Top Action Breadcrumb Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E9E3DD]">
        <div class="flex items-center space-x-3">
          <button onclick="app.navigateTo('my-bookings')" aria-label="Back to my bookings" class="min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs">
            <span class="iconify text-stone-500 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
            <span>My Bookings</span>
          </button>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                #${req.referenceCode}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                isConfirmed ? 'badge-approved' : 
                (isRejected ? 'badge-rejected' : 
                (isCancelled ? 'badge-cancelled' : 
                (isSetup ? 'badge-setup' : 'badge-pending')))
              }">
                ${req.status}
              </span>
            </div>
            <h2 class="font-heading font-bold text-base sm:text-lg text-stone-900 leading-tight mt-0.5">${req.meetingTitle}</h2>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          ${isConfirmed ? `
            <button onclick="app.openReceiptPage('${req.id}', 'booking-details')" aria-label="View booking receipt" class="btn-primary min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition">
              <span class="iconify text-xs text-white" data-icon="lucide:receipt" data-stroke-width="2"></span>
              <span>Booking Receipt</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Main Booking Presentation Card -->
      <div class="bg-white rounded-xl border border-[#E9E3DD] p-5 shadow-xs space-y-6">
        
        <!-- Stepper Container -->
        <div class="stepper-container">
          <div class="stepper-track ${stepperStepsClass}">
            <div class="stepper-line">
              <div class="stepper-line-progress" style="width: ${progressPercent};"></div>
            </div>

            ${isMyRoom ? (req.needsIT || req.needsCatering ? `
              <!-- Own Room With Services: 4 Steps (Pitika Cost Review) -->
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
                <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : 'Waiting')}</span>
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
              <!-- Vance Room: 3 Steps -->
              <div class="stepper-node completed">
                <div class="stepper-circle">
                  <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                </div>
                <span class="stepper-label">Booked</span>
                <span class="stepper-sub">Instant</span>
              </div>

              <div class="stepper-node completed">
                <div class="stepper-circle">
                  <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                </div>
                <span class="stepper-label">Setup</span>
                <span class="stepper-sub">Ready</span>
              </div>

              <div class="stepper-node completed">
                <div class="stepper-circle">
                  <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                </div>
                <span class="stepper-label">Door Pass</span>
                <span class="stepper-sub">Active</span>
              </div>
            `) : (isPrivate ? `
              <!-- Other Private Room: 5 Step Stepper -->
              <div class="stepper-node completed">
                <div class="stepper-circle">
                  <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                </div>
                <span class="stepper-label">1. Sent</span>
                <span class="stepper-sub">${req.submissionTimestamp}</span>
              </div>

              <div class="stepper-node ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'completed' : (isPitikaRejected || isCancelledBeforePitika ? 'failed' : (isPending ? 'active' : ''))}">
                <div class="stepper-circle">
                  ${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? `
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  ` : (isPitikaRejected || isCancelledBeforePitika ? `
                    <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                  ` : (isPending ? `
                    <span class="iconify text-xs animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
                  ` : `<span>2</span>`))}
                </div>
                <span class="stepper-label">2. Pitika</span>
                <span class="stepper-sub">${isOwnerPending || isConfirmed || isSetup || isOwnerRejected || isCancelledAfterPitika ? 'Approved' : (isPending ? 'In Review' : (isPitikaRejected ? 'Rejected' : (isCancelledBeforePitika ? 'Cancelled' : 'Waiting')))}</span>
              </div>

              <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isOwnerRejected ? 'failed' : (isCancelledAfterPitika ? 'failed' : (isOwnerPending ? 'active' : '')))}">
                <div class="stepper-circle">
                  ${isConfirmed || isSetup ? `
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  ` : (isOwnerRejected ? `
                    <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                  ` : (isCancelledAfterPitika ? `
                    <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                  ` : (isOwnerPending ? `
                    <span class="iconify text-xs animate-spin" data-icon="lucide:key" data-stroke-width="2"></span>
                  ` : `<span>3</span>`)))}
                </div>
                <span class="stepper-label">3. Room Owner</span>
                <span class="stepper-sub">${isConfirmed || isSetup ? 'Approved' : (isOwnerPending ? 'Reviewing' : (isOwnerRejected ? 'Rejected' : (isCancelledAfterPitika ? 'Cancelled' : 'Waiting')))}</span>
              </div>

              <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                <div class="stepper-circle">
                  ${isConfirmed ? `
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  ` : (isSetup ? `
                    <span class="iconify text-xs animate-spin" data-icon="${req.needsIT ? 'lucide:headset' : 'lucide:settings'}" data-stroke-width="2"></span>
                  ` : `<span>4</span>`)}
                </div>
                <span class="stepper-label">${req.needsIT ? '4. IT Setup' : '4. Setup'}</span>
                <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : (isPending || isOwnerPending ? 'Waiting for Both Approvals' : 'Queued'))}</span>
              </div>

              <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                <div class="stepper-circle">
                  ${isConfirmed ? `
                    <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                  ` : `<span>5</span>`}
                </div>
                <span class="stepper-label">5. Door Pass</span>
                <span class="stepper-sub">${isConfirmed ? 'Confirmed' : 'Pending'}</span>
              </div>
              ` : `
                <!-- Standard Public Room: 4 Step Stepper -->
                <div class="stepper-node completed">
                  <div class="stepper-circle">
                    <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="stepper-label">1. Sent</span>
                  <span class="stepper-sub">${req.submissionTimestamp}</span>
                </div>

                <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isRejected || isCancelled ? 'failed' : (isPending ? 'active' : ''))}">
                  <div class="stepper-circle">
                    ${isConfirmed || isSetup ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isRejected || isCancelled ? `
                      <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>
                    ` : (isPending ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:loader-2" data-stroke-width="2"></span>
                    ` : `<span>2</span>`))}
                  </div>
                  <span class="stepper-label">2. Pitika</span>
                  <span class="stepper-sub">${isConfirmed || isSetup ? 'Approved' : (isRejected ? 'Rejected' : (isCancelled ? 'Cancelled' : (isPending ? 'In Review' : 'Waiting')))}</span>
                </div>

                <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                    ` : (isSetup ? `
                      <span class="iconify text-xs animate-spin" data-icon="lucide:settings" data-stroke-width="2"></span>
                    ` : `<span>3</span>`)}
                  </div>
                  <span class="stepper-label">3. Setup</span>
                  <span class="stepper-sub">${isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : 'Waiting')}</span>
                </div>

                <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                  <div class="stepper-circle">
                    ${isConfirmed ? `
                      <span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span>
                    ` : `<span>4</span>`}
                  </div>
                  <span class="stepper-label">Door Pass</span>
                  <span class="stepper-sub">${isConfirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
              `)}

            </div>
          </div>
        </div>

        ${isConfirmed ? `
          <!-- Door Access Pass Callout -->
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                <span class="iconify" data-icon="lucide:key"></span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Meeting Room Door Pass</span>
                <p class="text-sm font-bold text-emerald-950">Passcode: <span class="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">${req.referenceCode}</span></p>
                <p class="text-xs text-emerald-700 mt-0.5">Use this code or scan your receipt at the door to enter.</p>
              </div>
            </div>
            <button onclick="app.openReceiptPage('${req.id}', 'booking-details')" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold shadow-xs shrink-0">
              Print Receipt
            </button>
          </div>
        ` : ''}

        <!-- 4-Card Overview Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Meeting Room</span>
            <strong class="text-stone-900 text-xs font-heading font-bold block mt-1">${req.room.name}</strong>
            <span class="text-[10px] text-stone-500 block truncate">${req.room.branch ? req.room.branch.split('(')[0].trim() + ' • ' : ''}${req.room.floor}</span>
          </div>

          <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Time</span>
            <strong class="text-stone-900 text-xs font-heading font-bold block mt-1">${req.startTime} - ${req.endTime}</strong>
            <span class="text-[10px] text-stone-500 block">${req.date}</span>
          </div>

          <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
            <span class="text-stone-500 text-[10px] uppercase font-bold block">People</span>
            <strong class="text-stone-900 text-xs font-heading font-bold block mt-1">${req.attendees} People</strong>
            <span class="text-[10px] text-stone-500 block">Seated</span>
          </div>

          <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Booking Code</span>
            <strong class="font-mono text-red-950 text-xs font-bold block mt-1">${req.referenceCode}</strong>
            <span class="text-[10px] text-stone-500 block">${req.id}</span>
          </div>
        </div>

        ${req.isPrivateRequest ? `
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs space-y-1">
            <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1">
              <span class="iconify text-amber-700" data-icon="lucide:shield-check"></span>
              <span>Reason for Private Room</span>
            </span>
            <p class="text-amber-950 font-medium">${req.privateJustification || req.meetingPurpose}</p>
            ${req.roomOwnerDecision?.timeAdjusted ? `
              <p class="text-xs font-bold text-emerald-800 mt-1 flex items-center space-x-1">
                <span class="iconify" data-icon="lucide:clock"></span>
                <span>Approved Time: ${req.startTime} - ${req.endTime}</span>
              </p>
            ` : ''}
          </div>
        ` : ''}

        <!-- Meeting Purpose -->
        <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] text-xs">
          <span class="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Meeting Notes</span>
          <p class="text-stone-700 leading-relaxed">${req.meetingPurpose || 'Department Meeting'}</p>
        </div>

        <!-- 2 Column Services Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-1.5 text-xs">
            <div class="flex items-center space-x-2 text-stone-800 font-bold">
              <span class="iconify text-amber-700 text-sm" data-icon="lucide:utensils"></span>
              <span>Food & Drinks</span>
            </div>
            ${req.needsCatering ? `
              <p class="font-bold text-stone-900 text-xs">${req.cateringDetails?.packageName}</p>
              <p class="text-stone-600">Quantity: ${req.cateringDetails?.servings} Servings</p>
              <p class="text-stone-500 text-[11px]">Instructions: ${req.cateringDetails?.dietaryRemarks || 'Standard'}</p>
            ` : `
              <p class="text-stone-400">No food or drinks requested.</p>
            `}
          </div>

          <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-1.5 text-xs">
            <div class="flex items-center space-x-2 text-stone-800 font-bold">
              <span class="iconify text-red-800 text-sm" data-icon="lucide:headset"></span>
              <span>Equipment & IT Support</span>
            </div>
            ${req.needsIT ? `
              <p class="font-bold text-stone-900 text-xs">${req.itDetails?.assignedStaff ? `IT Staff: ${req.itDetails.assignedStaff.name}` : 'Technician assignment in progress'}</p>
              <p class="text-stone-600">${req.itDetails?.requestedItems?.join(', ') || 'Video Call Setup'}</p>
              <p class="text-stone-500 text-[11px]">${req.itDetails?.isReady ? 'Equipment ready' : 'Scheduled for preparation'}</p>
              <div class="p-2 rounded bg-red-50 border border-red-200 text-[10px] text-red-900 flex items-start space-x-1.5 mt-1.5">
                <span class="iconify text-xs text-red-700 shrink-0 mt-0.5" data-icon="lucide:workflow"></span>
                <span><strong>IT Setup Process:</strong> ${req.isPrivateRequest && isPending ? 'Waiting for Manager Pitika and Room Owner approval before IT setup begins.' : (req.isPrivateRequest && isOwnerPending ? 'Step 1 approved. Waiting for Room Owner approval before IT setup begins.' : (isSetup ? 'Both approvals granted! Dispatched to IT technician queue for equipment preparation.' : (isConfirmed ? 'IT equipment verified and confirmed ready.' : 'Will dispatch to IT Support upon approval.')))}</span>
              </div>
            ` : `
              <p class="text-stone-400">Standard equipment only. No extra IT help requested.</p>
            `}
          </div>
        </div>

        <!-- Services & Logistics Summary -->
        <div class="p-4 bg-white rounded-xl border border-[#E9E3DD] shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2">
            <div class="flex items-center space-x-2">
              <span class="iconify text-red-900 text-sm" data-icon="lucide:layers"></span>
              <h4 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Services & Logistics Summary</h4>
            </div>
            <span class="text-[10px] text-stone-500 font-semibold">NBC Internal Hospitality & Facilities</span>
          </div>

          <div class="table-responsive">
            <table class="w-full text-xs text-left border border-[#E9E3DD] rounded-lg overflow-hidden">
              <thead class="bg-[#FAF7F4] text-stone-700 font-semibold border-b border-[#E9E3DD] text-[11px]">
                <tr>
                  <th class="p-2.5 w-1/3">Service</th>
                  <th class="p-2.5">Details & Specifications</th>
                  <th class="p-2.5 text-right w-28">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E9E3DD] text-stone-800 text-[11px]">
                <tr>
                  <td class="p-2.5 font-semibold text-stone-900">
                    <span class="block">${req.room.name}</span>
                    <span class="text-[10px] font-normal text-stone-500">${req.room.floor} &bull; ${req.attendees} Attendees</span>
                  </td>
                  <td class="p-2.5 text-stone-700">${req.date || ''} (${req.startTime} - ${req.endTime})</td>
                  <td class="p-2.5 text-right">
                    <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span class="iconify" data-icon="lucide:check-circle-2"></span>
                      <span>Reserved</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="p-2.5 font-semibold text-stone-900">
                    <span class="block">IT & Equipment Support</span>
                    <span class="text-[10px] font-normal text-stone-500">Audio/Visual Setup</span>
                  </td>
                  <td class="p-2.5 text-stone-700">
                    ${req.needsIT ? (req.itDetails?.requestedItems?.join(', ') || 'Video Call & Screen Setup') : 'Standard room setup without extra equipment'}
                  </td>
                  <td class="p-2.5 text-right">
                    ${req.needsIT ? `
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span class="iconify" data-icon="lucide:check-circle-2"></span>
                        <span>Requested</span>
                      </span>
                    ` : `
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                        <span>Standard</span>
                      </span>
                    `}
                  </td>
                </tr>
                <tr>
                  <td class="p-2.5 font-semibold text-stone-900">
                    <span class="block">Catering & Refreshments</span>
                    <span class="text-[10px] font-normal text-stone-500">Hospitality Service</span>
                  </td>
                  <td class="p-2.5 text-stone-700">
                    ${req.needsCatering ? `
                      <span class="font-medium text-stone-900">${req.cateringDetails?.packageName || 'Standard Catering'}</span> for ${req.attendees} attendees
                      ${req.cateringDetails?.dietaryRemarks ? `<span class="block text-[10px] text-stone-500 mt-0.5">Notes: ${req.cateringDetails.dietaryRemarks}</span>` : ''}
                    ` : 'No catering requested'}
                  </td>
                  <td class="p-2.5 text-right">
                    ${req.needsCatering ? `
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span class="iconify" data-icon="lucide:check-circle-2"></span>
                        <span>Requested</span>
                      </span>
                    ` : `
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                        <span>None</span>
                      </span>
                    `}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            ${!isCancelled && !isRejected ? `
              <button onclick="app.handleCancelBooking('${req.id}')" aria-label="Cancel this booking" class="min-h-[44px] px-4 py-2.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center">
                Cancel Booking
              </button>
            ` : ''}
          </div>

          <div class="flex items-center space-x-2">
            ${isConfirmed ? `
              <button onclick="app.downloadCalendarInvite('${req.id}')" aria-label="Save to calendar" class="min-h-[44px] px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition">
                <span class="iconify text-stone-600" data-icon="lucide:calendar-plus"></span>
                <span>Save to Calendar (.ics)</span>
              </button>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }


  handleCancelBooking(requestId) {
    if (confirm("Are you sure you want to cancel this meeting room booking?")) {
      bookingStore.cancelBookingRequest(requestId);
      this.renderRequesterBookings();
      if (this.currentView === 'booking-details') {
        this.renderBookingDetailsPage(requestId);
      }
    }
  }


  downloadCalendarInvite(requestId) {
    const req = bookingStore.getRequestById(requestId);
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
      `LOCATION:${req.room.name}, ${req.room.floor}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${req.referenceCode}-${req.room.name}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Calendar Invite Downloaded", `Added ${req.meetingTitle} to your calendar file.`, "success");
  }


  copyReferenceCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      this.showToast("Security Code Copied", `Booking code ${code} copied to clipboard.`, "success");
    }).catch(() => {
      this.showToast("Code: " + code, "Security reference code.", "info");
    });
  }

  // ==================== 4. PITIKA APPROVER QUEUE ====================

}

window.NBC.views['booking-details'] = new BookingDetailsView();
