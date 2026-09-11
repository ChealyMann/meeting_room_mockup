// Pitika Review Workspace View Component (view-pitika-review)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class PitikaReviewView {
  constructor() {
    this.id = 'pitika-review';
    this.selectedRequestForReview = null;
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
    const reqId = params.requestId || (typeof this.selectedRequestForReview === 'object' ? this.selectedRequestForReview?.id : this.selectedRequestForReview) || 'REQ-002';
    this.selectedRequestForReview = reqId;
    container.innerHTML = `
      <div id="view-pitika-review" class="w-full space-y-4"></div>
    `;
    this.renderPitikaReviewPage(reqId);
  }

  init(params = {}) {
    if (params.requestId) this.selectedRequestForReview = params.requestId;
  }

  openPitikaReviewWorkspace(requestId) {
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    this.selectedRequestForReview = req.id;
    this.navigateTo('pitika-review', { requestId: req.id });
  }

  renderPitikaReviewPage(requestId) {
    const container = document.getElementById('view-pitika-review');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId);
    if (!req) {
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-xl border border-[#E9E3DD] shadow-xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl" data-icon="lucide:inbox" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">No Request Selected</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto">There is no pending booking request to review.</p>
          </div>
          <div class="pt-2">
            <button onclick="app.navigateTo('pitika-queue')" class="px-4 py-2 btn-primary rounded-lg text-xs font-bold shadow-xs">
              Back to Review Queue
            </button>
          </div>
        </div>
      `;
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

    let statusBadgeClass = 'badge-pending';
    let statusLabel = 'Waiting for Pitika';
    let statusIcon = 'lucide:clock';
    if (isConfirmed) {
      statusBadgeClass = 'badge-approved';
      statusLabel = 'Booking Confirmed';
      statusIcon = 'lucide:check-circle-2';
    } else if (isRejected) {
      statusBadgeClass = 'badge-rejected';
      statusLabel = isOwnerRejected ? 'Rejected by Owner' : 'Rejected by Pitika';
      statusIcon = 'lucide:alert-circle';
    } else if (isCancelled) {
      statusBadgeClass = 'badge-cancelled';
      statusLabel = 'Cancelled by Booker';
      statusIcon = 'lucide:x-circle';
    } else if (isOwnerPending) {
      statusBadgeClass = 'badge-owner-pending';
      statusLabel = 'Sent to Room Owner';
      statusIcon = 'lucide:key';
    } else if (isSetup) {
      statusBadgeClass = 'badge-setup';
      statusLabel = 'Setting Up';
      statusIcon = 'lucide:settings';
    }

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

    const room = bookingStore.getRoomById(req.room.id) || bookingStore.getRooms()[0];

    container.innerHTML = `
      <!-- Top Navigation & Breadcrumb Bar -->
      <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] gap-3">
        <div class="flex items-center space-x-2.5">
          <button onclick="app.navigateTo('pitika-queue')" class="px-2.5 py-1.5 rounded-md bg-white border border-[#E9E3DD] text-stone-800 hover:bg-stone-100 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <span class="iconify text-xs" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
            <span>Back to Queue</span>
          </button>
          <div class="h-4 w-px bg-stone-300"></div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-[11px] font-bold text-red-950 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">${req.id}</span>
              ${req.isPrivateRequest ? `<span class="badge-private-room text-[9px] font-bold px-1.5 py-0.2 rounded">Private Room Request</span>` : ''}
              <span class="text-[11px] text-stone-500 font-medium">Code: <strong class="font-mono text-stone-900">${req.referenceCode}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 ${statusBadgeClass}">
            <span class="iconify text-xs" data-icon="${statusIcon}" data-stroke-width="1.8"></span>
            <span>${statusLabel}</span>
          </span>
          <span class="text-[11px] text-stone-500 hidden sm:inline">Sent ${req.submissionTimestamp}</span>
        </div>
      </div>

      <!-- BALANCED 2-COLUMN SPLIT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- LEFT COLUMN (7 COLS): Meeting Specifications & Logistics -->
        <div class="lg:col-span-7 space-y-4">
          
          ${req.isPrivateRequest ? `
            <!-- Special Banner for Private Room Request -->
            <div class="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-2 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                  <span class="iconify text-amber-700 text-sm" data-icon="lucide:shield-alert"></span>
                  <span>Reason for Private Room</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded border border-amber-300">Needs 2 Approvals</span>
              </div>
              <p class="text-xs text-amber-950 font-medium leading-relaxed bg-white/70 p-2.5 rounded border border-amber-200">
                "${req.privateJustification || 'All normal rooms are full. Confidential meeting needed.'}"
              </p>
              <div class="flex items-center justify-between text-[11px] text-amber-900 pt-1">
                <span>Room Owner: <strong>${req.room.roomOwner?.name || 'Executive Cabinet'}</strong></span>
                <span>Department: <strong>${req.room.roomOwner?.department || 'Executive'}</strong></span>
              </div>
            </div>
          ` : ''}

          <!-- Card 1: Meeting & Booker Profile -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2">
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center">1</span>
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Meeting & Booker Details</h3>
              </div>
              <span class="text-[10px] text-stone-400 font-medium">Core Specs</span>
            </div>

            <!-- Title & Room Pill -->
            <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] flex items-start justify-between gap-3">
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-stone-500">Meeting Title</span>
                <h3 class="font-heading font-bold text-sm text-stone-900 mt-0.5">${req.meetingTitle}</h3>
                <p class="text-[11px] text-stone-600 font-medium mt-0.5">${req.room.name} &bull; ${req.room.floor}</p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[10px] uppercase font-bold tracking-wider text-stone-500">Room Size</span>
                <p class="text-xs font-bold text-stone-900 mt-0.5">${req.attendees} People</p>
                <p class="text-[10px] text-stone-500">Max: ${req.room.capacity} seats</p>
              </div>
            </div>

            <!-- 2-Col Grid: Date/Time + Booker Profile -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] space-y-1">
                <span class="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Meeting Schedule</span>
                ${isPassed ? `
                  <div class="flex items-center space-x-1.5 text-stone-500 text-xs">
                    <span class="iconify text-xs text-stone-400 shrink-0" data-icon="lucide:history"></span>
                    <strong class="text-stone-700">${req.date}</strong>
                  </div>
                  <p class="text-[11px] text-stone-400 font-normal">${req.startTime} to ${req.endTime} (Date Passed)</p>
                ` : `
                  <strong class="text-stone-900 block text-xs">${req.date}</strong>
                  <p class="text-[11px] text-stone-600 font-medium">${req.startTime} to ${req.endTime} (${req.duration || '2 hours'})</p>
                `}
              </div>

              <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] space-y-1">
                <span class="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Booked By</span>
                <strong class="text-stone-900 block text-xs">${req.requester.name}</strong>
                <p class="text-[11px] text-red-900 font-semibold">${req.requester.department} &bull; ${req.requester.phone}</p>
              </div>
            </div>

            <!-- Meeting Purpose -->
            <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
              <span class="text-stone-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Meeting Note:</span>
              <p class="text-stone-700 text-xs leading-relaxed">${req.meetingPurpose || 'No extra notes provided.'}</p>
            </div>
          </div>

          <!-- Card 2: Food & IT Logistics Review -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2">
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center">2</span>
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Food & IT Support</h3>
              </div>
              <span class="text-[10px] text-stone-400 font-medium">Extra Services</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <!-- Catering Mini-Panel -->
              <div class="p-3 rounded-lg border ${req.needsCatering ? 'border-amber-300 bg-amber-50/40' : 'border-stone-200 bg-stone-50/40'} space-y-2 text-xs">
                <div class="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <div class="flex items-center space-x-1.5">
                    <span class="iconify text-amber-700 text-xs" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
                    <h4 class="font-bold text-stone-900 text-xs">Food Service</h4>
                  </div>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${req.needsCatering ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-600'}">
                    ${req.needsCatering ? 'Requested' : 'None'}
                  </span>
                </div>

                ${req.needsCatering ? `
                  <div class="space-y-1 bg-white p-2 rounded border border-[#E9E3DD]">
                    <div class="flex items-center justify-between">
                      <span class="text-stone-500 text-[11px]">Item:</span>
                      <strong class="text-stone-900 text-[11px]">${req.cateringDetails?.packageName?.split('(')[0]?.trim()}</strong>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-stone-500 text-[11px]">Portions:</span>
                      <strong class="text-stone-900 text-[11px]">${req.cateringDetails?.servings} Meals</strong>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-stone-500 text-[11px]">Time:</span>
                      <strong class="text-stone-900 text-[11px]">${req.cateringDetails?.deliveryTime || req.startTime}</strong>
                    </div>
                    <p class="text-[10px] text-stone-500 pt-1 border-t border-stone-100">Notes: ${req.cateringDetails?.dietaryRemarks || 'Standard'}</p>
                  </div>

                  ${!isConfirmed && !isRejected && !isCancelled ? `
                    <div class="space-y-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Kitchen Note:</label>
                      <input type="text" id="approver-page-catering-notes" value="${req.cateringDetails?.approverNotes || 'Food order approved.'}" class="bank-input text-xs" />
                    </div>
                  ` : ''}
                ` : `
                  <p class="text-[11px] text-stone-400 py-3 text-center">No food requested.</p>
                `}
              </div>

              <!-- IT Mini-Panel -->
              <div class="p-3 rounded-lg border ${req.needsIT ? 'border-red-300 bg-red-50/40' : 'border-stone-200 bg-stone-50/40'} space-y-2 text-xs">
                <div class="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <div class="flex items-center space-x-1.5">
                    <span class="iconify text-red-800 text-xs" data-icon="lucide:headset" data-stroke-width="1.8"></span>
                    <h4 class="font-bold text-stone-900 text-xs">IT Support</h4>
                  </div>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${req.needsIT ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-stone-200 text-stone-600'}">
                    ${req.needsIT ? 'Requested' : 'None'}
                  </span>
                </div>

                ${req.needsIT ? `
                  <div class="space-y-1 bg-white p-2 rounded border border-[#E9E3DD]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Equipment:</span>
                    <ul class="text-[11px] text-stone-800 space-y-0.5">
                      ${(req.itDetails?.requestedItems || []).map(item => `
                        <li class="flex items-center space-x-1">
                          <span class="iconify text-emerald-600 text-[10px]" data-icon="lucide:check" data-stroke-width="2"></span>
                          <span>${item}</span>
                        </li>
                      `).join('')}
                    </ul>
                    <div class="pt-1 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span class="text-stone-500">Staff:</span>
                      ${req.itDetails?.assignedStaffList && req.itDetails.assignedStaffList.length > 0 ? `
                        <div class="flex items-center space-x-1.5">
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
                    <div class="p-1.5 rounded bg-red-50 border border-red-200 text-[10px] text-red-900 flex items-center space-x-1.5 mt-1.5">
                      <span class="iconify text-xs text-red-700 shrink-0" data-icon="lucide:workflow"></span>
                      <span><strong>IT Process:</strong> ${isOwnerPending ? 'Sent to IT queue once Room Owner approves' : (isSetup ? 'Dispatched to IT technician queue for setup' : (isConfirmed ? 'IT equipment verified & ready' : 'Forwarded to IT on approval'))}</span>
                    </div>
                  </div>
                ` : `
                  <p class="text-[11px] text-stone-400 py-3 text-center">No IT requested.</p>
                `}
              </div>

            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN (5 COLS): Approval Station -->
        <div class="lg:col-span-5 space-y-4">
          
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3.5">
            
            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-stone-100 pb-2">
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center">
                  <span class="iconify text-xs" data-icon="lucide:clipboard-check" data-stroke-width="2"></span>
                </span>
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">
                  ${req.isPrivateRequest ? 'Step 1: Pitika Review' : 'Approve or Reject'}
                </h3>
              </div>
              <span class="text-[10px] font-semibold text-stone-600 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                Pitika S. &bull; Manager
              </span>
            </div>

            <!-- Room Photo Strip -->
            <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] flex items-center space-x-3">
              <div class="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-[#E9E3DD]">
                <img src="${room.image}" alt="${room.name}" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-[9px] font-bold text-red-900 uppercase tracking-wider block truncate">${room.category}</span>
                <h4 class="font-heading font-bold text-xs text-stone-900 truncate leading-tight">${room.name}</h4>
                <p class="text-[10px] text-stone-500 mt-0.2">${room.floor}</p>
              </div>
            </div>

            <!-- Progress Stepper -->
            <div class="pt-1 pb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Workflow Progress:</span>
              <div class="stepper-container pt-0 pb-0">
                <div class="stepper-track ${stepperStepsClass}">
                  <div class="stepper-line">
                    <div class="stepper-line-progress" style="width: ${progressPercent};"></div>
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

            <!-- Status Notice Message -->
            <div class="p-3 rounded-lg border text-xs leading-relaxed ${
              isPassed && (isPending || isOwnerPending) ? 'bg-stone-100/90 border-stone-300 text-stone-800' :
              isPending ? 'bg-amber-50/70 border-amber-200 text-amber-950' :
              isOwnerPending ? 'bg-amber-50 border-amber-300 text-amber-950' :
              isSetup ? 'bg-orange-50/70 border-orange-200 text-orange-950' :
              isConfirmed ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' :
              isRejected ? 'bg-rose-50/70 border-rose-200 text-rose-950' :
              'bg-stone-50 border-stone-200 text-stone-700'
            }">
              ${isPassed && (isPending || isOwnerPending) ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-stone-500 text-sm mt-0.5 shrink-0" data-icon="lucide:history" data-stroke-width="1.8"></span>
                  <div>
                    <strong class="block text-stone-800 font-bold">Meeting Date Passed:</strong>
                    <p class="mt-0.5 text-stone-600">This meeting was scheduled for ${req.date} (${req.startTime}–${req.endTime}). The time has passed, so this request is closed.</p>
                  </div>
                </div>
              ` : (isPending ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-amber-600 text-sm mt-0.5 shrink-0" data-icon="lucide:clock" data-stroke-width="1.8"></span>
                  <p>
                    ${req.isPrivateRequest ? 
                      (req.isMyRoom ?
                        'This is a private room booking by owner <strong>' + (room.roomOwner?.name || 'Jonathan Vance') + '</strong> with extra services. Please check Food and IT costs, then click Approve.' :
                        'This private room requires 2 approvals. When you approve, it goes to Room Owner <strong>(' + (room.roomOwner?.name || 'Owner') + ')</strong>. Food and IT setup will start only after both of you approve.'
                      ) : 
                      'Please check meeting details. Click <strong>Reject</strong> or <strong>Approve</strong>.'
                    }
                  </p>
                </div>
              ` : (isOwnerPending ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-amber-700 text-sm mt-0.5 shrink-0" data-icon="lucide:key" data-stroke-width="1.8"></span>
                  <div>
                    <strong class="block text-amber-900 font-bold">Sent to Room Owner:</strong>
                    <p class="mt-0.5">Sent on ${req.managerReview?.reviewDate || req.submissionTimestamp}. Waiting for Room Owner (${req.room.roomOwner?.name}) to approve.</p>
                  </div>
                </div>
              ` : (isSetup ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-orange-600 text-sm mt-0.5 shrink-0" data-icon="lucide:settings" data-stroke-width="1.8"></span>
                  <p>Approved. Click below to confirm booking.</p>
                </div>
              ` : (isConfirmed ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-emerald-600 text-sm mt-0.5 shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="1.8"></span>
                  <p><strong>Booking Confirmed:</strong> Room is booked for this meeting.</p>
                </div>
              ` : (isRejected ? `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-rose-600 text-sm mt-0.5 shrink-0" data-icon="lucide:alert-circle" data-stroke-width="1.8"></span>
                  <p><strong>Rejected:</strong> ${isOwnerRejected ? (req.roomOwnerReview?.ownerNotes || 'Declined by Room Owner.') : (req.approver?.rejectionReason || 'Declined by Manager.')}</p>
                </div>
              ` : `
                <div class="flex items-start space-x-2">
                  <span class="iconify text-stone-500 text-sm mt-0.5 shrink-0" data-icon="lucide:ban" data-stroke-width="1.8"></span>
                  <p>Cancelled by booker.</p>
                </div>
              `)))))}
            </div>

            <!-- Action Buttons Area (Zero Modals, Inline UX) -->
            <div class="pt-1 space-y-3">
              ${isPassed && (isPending || isOwnerPending) ? `
                <div class="p-3.5 bg-stone-100/80 rounded-xl border border-stone-200 text-center space-y-1.5">
                  <div class="flex items-center justify-center space-x-1.5 text-stone-700 font-bold text-xs">
                    <span class="iconify text-stone-500 text-sm" data-icon="lucide:history"></span>
                    <span>Meeting Date Passed</span>
                  </div>
                  <p class="text-[11px] text-stone-500">This request cannot be approved because the meeting time has passed.</p>
                </div>
              ` : (isPending ? `
                ${req.isPrivateRequest ? (req.isMyRoom ? `
                  <!-- Room Owner Booking with Food/IT: Pitika Cost Approval -->
                  <div class="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-2.5">
                    <div class="p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start space-x-2">
                      <span class="iconify text-amber-700 text-sm mt-0.5 shrink-0" data-icon="lucide:user-check"></span>
                      <div>
                        <strong class="font-bold block">Room Owner Booking:</strong>
                        <span>The room owner requested Food or IT setup. Please verify the service costs.</span>
                      </div>
                    </div>
                    <div class="form-field-group">
                      <label class="form-label text-[11px] font-bold text-amber-900"><span>Manager Review Note <span class="text-stone-500 font-normal">(Optional)</span></span></label>
                      <input type="text" id="pitika-inline-notes" placeholder="e.g. Food and IT costs verified." class="bank-input text-xs" />
                    </div>
                    <button onclick="app.confirmPitikaDirectPrivateApproval('${req.id}')" aria-label="Approve Food and IT Costs" class="w-full min-h-[44px] py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                      <span class="iconify text-xs text-white" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                      <span>Approve Food & IT Costs</span>
                    </button>
                  </div>
                ` : `
                  <!-- Other User Booking: Step 1 of 2 Strict Approval (Cannot Skip Room Owner) -->
                  <div class="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-2.5">
                    <div class="p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start space-x-2">
                      <span class="iconify text-amber-700 text-sm mt-0.5 shrink-0" data-icon="lucide:shield-alert"></span>
                      <div>
                        <strong class="font-bold block">2 Approvals Required:</strong>
                        <span>When you approve, this request goes to Room Owner (<strong>${room.roomOwner?.name || 'Owner'}</strong>). Food and IT setup will start only after both of you approve.</span>
                      </div>
                    </div>
                    <div class="form-field-group">
                      <label class="form-label text-[11px] font-bold text-amber-900"><span>Manager Review Note <span class="text-stone-500 font-normal">(Optional)</span></span></label>
                      <input type="text" id="pitika-inline-notes" placeholder="e.g. Step 1 endorsed. Standard rooms are full." class="bank-input text-xs" />
                    </div>
                    <button onclick="app.confirmPitikaInlineEndorsement('${req.id}')" aria-label="Approve and send to room owner" class="w-full min-h-[44px] py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                      <span class="iconify text-xs text-white" data-icon="lucide:send" data-stroke-width="2"></span>
                      <span>Approve & Send to Room Owner</span>
                    </button>
                  </div>
                `) : (req.needsIT ? `
                  <button onclick="app.handlePitikaApproveAndForwardIT('${req.id}')" aria-label="Approve and dispatch to IT" class="w-full btn-primary min-h-[44px] py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                    <span class="iconify text-xs text-white" data-icon="lucide:share-2" data-stroke-width="1.8"></span>
                    <span>Approve & Send to IT Team</span>
                  </button>
                ` : `
                  <button onclick="app.handlePitikaDirectApproval('${req.id}')" aria-label="Approve meeting room" class="w-full btn-primary min-h-[44px] py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                    <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="1.8"></span>
                    <span>Approve Meeting Room</span>
                  </button>
                `)}

                <!-- Inline Decline Drawer Toggle -->
                <div class="pt-1 border-t border-stone-200">
                  <button type="button" onclick="app.togglePitikaInlineReject()" aria-label="Decline or reject request" class="w-full min-h-[44px] py-2 text-center text-xs font-semibold text-rose-700 hover:text-rose-900 transition flex items-center justify-center space-x-1">
                    <span class="iconify text-xs" data-icon="lucide:chevron-down" id="pitika-reject-icon"></span>
                    <span>Reject This Request</span>
                  </button>
                  <div id="pitika-inline-reject-box" class="hidden mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label class="form-label text-rose-950 font-bold text-xs"><span>Reason for Rejecting <span class="text-rose-700">*</span></span></label>
                    <textarea id="pitika-inline-reject-reason" rows="2" placeholder="e.g. Room is already used or maintenance..." class="bank-input text-xs"></textarea>
                    <button onclick="app.confirmPitikaInlineRejection('${req.id}')" aria-label="Confirm rejection" class="w-full min-h-[44px] py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1">
                      <span class="iconify text-xs" data-icon="lucide:ban"></span>
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              ` : (isSetup ? `
                <button onclick="app.handlePitikaFinalizeRoomStatus('${req.id}')" aria-label="Confirm room and issue pass" class="w-full btn-primary min-h-[44px] py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                  <span class="iconify text-xs text-white" data-icon="lucide:lock" data-stroke-width="1.8"></span>
                  <span>Confirm Room Booking</span>
                </button>
              ` : (isConfirmed ? `
                <button onclick="app.openReceiptPage('${req.id}', 'pitika-review')" aria-label="View official receipt voucher" class="w-full min-h-[44px] py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition">
                  <span class="iconify text-xs text-white" data-icon="lucide:receipt" data-stroke-width="1.8"></span>
                  <span>View Booking Receipt</span>
                </button>
              ` : `
                <div class="py-2 text-center text-xs text-stone-500 font-medium">
                  Review decision completed
                </div>
              `)))}
            </div>

          </div>

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
    bookingStore.approvePrivateRoomDirectly(requestId, { notes });
    this.renderApproverRequests();
    this.renderPitikaReviewPage(requestId);
  }


  confirmPitikaInlineEndorsement(requestId) {
    const notes = document.getElementById('pitika-inline-notes')?.value.trim() || 'Approved by Manager Pitika. Sent to Room Owner.';
    bookingStore.forwardToRoomOwner(requestId, { managerNotes: notes });
    this.showToast("Step 1 Approved", "Sent to Room Owner for final approval.", "success");
    this.renderApproverRequests();
    this.renderPitikaReviewPage(requestId);
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
    bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: true });
    this.showToast("Approved with IT", "Ticket dispatched to IT Specialists queue.", "success");
    this.renderPitikaReviewPage(requestId);
  }


  handlePitikaDirectApproval(requestId) {
    const cateringNotes = document.getElementById('approver-page-catering-notes')?.value || '';
    bookingStore.approveAndSetupRequest(requestId, { cateringNotes, forwardToIT: false });
    bookingStore.finalizeRoomStatus(requestId);
    this.showToast("Booking Approved", "Meeting room confirmed and pass generated.", "success");
    this.renderPitikaReviewPage(requestId);
  }


  handlePitikaFinalizeRoomStatus(requestId) {
    bookingStore.finalizeRoomStatus(requestId);
    this.showToast("Pass Issued", "Room setup verified and door access pass issued.", "success");
    this.renderPitikaReviewPage(requestId);
  }

  // ==================== 6. PRIVATE ROOM OWNER QUEUE & REVIEW ====================

}

window.NBC.views['pitika-review'] = new PitikaReviewView();
