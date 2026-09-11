// Room Owner Review Workspace View Component (view-room-owner-review)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomOwnerReviewView {
  constructor() {
    this.id = 'room-owner-review';
    this.selectedRequestForOwnerReview = null;
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
    const reqId = params.requestId || (typeof this.selectedRequestForOwnerReview === 'object' ? this.selectedRequestForOwnerReview?.id : this.selectedRequestForOwnerReview) || 'REQ-002';
    this.selectedRequestForOwnerReview = reqId;
    container.innerHTML = `
      <div id="view-room-owner-review" class="w-full space-y-4"></div>
    `;
    this.renderRoomOwnerReviewPage(reqId);
  }

  init(params = {}) {
    if (params.requestId) this.selectedRequestForOwnerReview = params.requestId;
  }

  openRoomOwnerReviewWorkspace(requestId) {
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;

    this.selectedRequestForOwnerReview = req.id;
    this.navigateTo('room-owner-review', { requestId: req.id });
  }

  renderRoomOwnerReviewPage(requestId) {
    const container = document.getElementById('view-room-owner-review');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId);
    if (!req) {
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-xl border border-[#E9E3DD] shadow-xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl" data-icon="lucide:key" data-stroke-width="1.8"></span>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-heading font-bold text-stone-900">No Request Selected</h4>
            <p class="text-xs text-stone-500 max-w-md mx-auto">There is no private room booking request to review.</p>
          </div>
          <div class="pt-2">
            <button onclick="app.navigateTo('room-owner-queue')" class="px-4 py-2 btn-primary rounded-lg text-xs font-bold shadow-xs">
              Back to Private Requests
            </button>
          </div>
        </div>
      `;
      return;
    }

    this.selectedRequestForOwnerReview = req;

    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isConfirmed = req.status === 'Approved - Confirmed';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected';

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

    const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');
    const isPitikaRejected = isRejected && !isOwnerRejected;

    // Compute progress percentage for 5-stage workflow
    let progressPercent = '0%';
    if (isConfirmed) progressPercent = '100%';
    else if (isSetup) progressPercent = '75%';
    else if (isOwnerPending || isOwnerRejected) progressPercent = '50%';
    else if (isPitikaRejected) progressPercent = '25%';
    else if (isRejected) progressPercent = '50%';

    const room = bookingStore.getRoomById(req.room.id) || bookingStore.getRooms()[0];

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] gap-3">
        <div class="flex items-center space-x-2.5">
          <button onclick="app.navigateTo('room-owner-queue')" class="px-2.5 py-1.5 rounded-md bg-white border border-[#E9E3DD] text-stone-800 hover:bg-stone-100 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <span class="iconify text-xs" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
            <span>Back to Review Requests</span>
          </button>
          <div class="h-4 w-px bg-stone-300"></div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-[11px] font-bold text-stone-900">${req.id}</span>
              <span class="text-stone-300">|</span>
              <span class="text-stone-600 text-[11px] font-bold flex items-center space-x-1">
                <span class="iconify text-xs" data-icon="lucide:shield-check" data-stroke-width="2"></span>
                <span>Step 3: Room Owner</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 ${isConfirmed ? 'text-emerald-600' : (isRejected ? 'text-red-600' : (isSetup ? 'text-blue-600' : 'text-amber-600'))}">
          <span class="iconify text-sm" data-icon="${isConfirmed ? 'lucide:check-circle-2' : (isRejected ? 'lucide:x-circle' : (isSetup ? 'lucide:settings' : 'lucide:clock'))}" data-stroke-width="2"></span>
          <span class="text-[12px] font-bold">
            ${isConfirmed ? 'Approved' : (isRejected ? 'Rejected' : (isSetup ? 'Approved (Setting Up)' : 'Waiting for Decision'))}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- Left Column: Request Details -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Reason & Pitika Review Card -->
          <div class="bg-amber-50 rounded-xl border border-amber-300 p-4 space-y-2.5 text-xs text-amber-950 shadow-xs">
            <div class="flex items-center justify-between">
              <h4 class="font-heading font-bold text-amber-900 text-xs flex items-center space-x-1.5">
                <span class="iconify text-amber-700 text-sm" data-icon="lucide:shield-check" data-stroke-width="2"></span>
                <span>Reason for Private Room</span>
              </h4>
              <span class="text-[11px] font-bold text-amber-800 flex items-center space-x-1">
                <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2"></span>
                <span>Pitika Approved</span>
              </span>
            </div>
            <p class="bg-white/80 p-2.5 rounded border border-amber-200 leading-relaxed font-medium">
              "${req.privateJustification}"
            </p>
            <div class="pt-1 text-[11px] text-amber-900">
              Pitika Note: <em>"${req.managerReview?.notes || 'Approved. Public rooms are full today.'}"</em>
            </div>
          </div>

          <!-- Meeting Info Card -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3">
            <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2">
              Meeting & Booker Details
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[10px] block">Meeting Name</span>
                <strong class="text-stone-900 text-xs font-heading">${req.meetingTitle}</strong>
                <p class="text-[11px] text-stone-600 mt-0.5">${req.attendees} People</p>
              </div>
              <div class="p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[10px] block">Booked By</span>
                <strong class="text-stone-900 text-xs font-heading">${req.requester.name}</strong>
                <p class="text-[11px] text-stone-600 mt-0.5">${req.requester.department} &bull; ${req.requester.phone}</p>
              </div>
            </div>
          </div>

          <!-- Food & IT Support Request Card (Explicit Workflow Section) -->
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-stone-100 pb-2">
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center">
                  <span class="iconify text-xs" data-icon="lucide:headset" data-stroke-width="2"></span>
                </span>
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Food & IT Support Requested</h3>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <!-- IT Support Panel -->
              <div class="p-3 rounded-lg border ${req.needsIT ? 'border-red-300 bg-red-50/40' : 'border-stone-200 bg-stone-50/40'} space-y-2">
                <div class="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <div class="flex items-center space-x-1.5">
                    <span class="iconify text-red-800 text-xs" data-icon="lucide:headset" data-stroke-width="1.8"></span>
                    <h4 class="font-bold text-stone-900 text-xs">IT Equipment & Setup</h4>
                  </div>
                  <span class="text-[11px] font-bold ${req.needsIT ? 'text-red-700 flex items-center space-x-1' : 'text-stone-500'}">
                    ${req.needsIT ? '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2"></span><span>Requested</span>' : 'None'}
                  </span>
                </div>

                ${req.needsIT ? `
                  <div class="space-y-1.5 bg-white p-2.5 rounded border border-[#E9E3DD]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Requested Equipment:</span>
                    <ul class="text-[11px] text-stone-800 space-y-1">
                      ${(req.itDetails?.requestedItems || ['Video Call Setup', 'Display Screen']).map(item => `
                        <li class="flex items-center space-x-1.5">
                          <span class="iconify text-emerald-600 text-xs" data-icon="lucide:check" data-stroke-width="2"></span>
                          <span class="font-medium">${item}</span>
                        </li>
                      `).join('')}
                    </ul>
                    
                    <div class="pt-1.5 border-t border-stone-100 text-[11px] flex items-center justify-between">
                      <span class="text-stone-500">Prep Window:</span>
                      <strong class="text-stone-800 font-semibold">${req.itDetails?.scheduledPrepTime || '30 mins before meeting'}</strong>
                    </div>


                  </div>
                ` : `
                  <p class="text-[11px] text-stone-400 py-3 text-center">No IT support or equipment requested.</p>
                `}
              </div>

              <!-- Food / Catering Panel -->
              <div class="p-3 rounded-lg border ${req.needsCatering ? 'border-amber-300 bg-amber-50/40' : 'border-stone-200 bg-stone-50/40'} space-y-2">
                <div class="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <div class="flex items-center space-x-1.5">
                    <span class="iconify text-amber-700 text-xs" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
                    <h4 class="font-bold text-stone-900 text-xs">Food & Beverage</h4>
                  </div>
                  <span class="text-[11px] font-bold ${req.needsCatering ? 'text-amber-700 flex items-center space-x-1' : 'text-stone-500'}">
                    ${req.needsCatering ? '<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2"></span><span>Requested</span>' : 'None'}
                  </span>
                </div>

                ${req.needsCatering ? `
                  <div class="space-y-1.5 bg-white p-2.5 rounded border border-[#E9E3DD]">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-stone-500">Package:</span>
                      <strong class="text-stone-900 font-semibold">${req.cateringDetails?.packageName?.split('(')[0]?.trim() || 'Refreshments'}</strong>
                    </div>
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-stone-500">Portions:</span>
                      <strong class="text-stone-900 font-semibold">${req.cateringDetails?.servings || req.attendees} Servings</strong>
                    </div>
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-stone-500">Delivery:</span>
                      <strong class="text-stone-900 font-semibold">${req.cateringDetails?.deliveryTime || req.startTime}</strong>
                    </div>
                    <p class="text-[10px] text-stone-500 pt-1 border-t border-stone-100">Dietary: ${req.cateringDetails?.dietaryRemarks || 'Standard'}</p>
                  </div>
                ` : `
                  <p class="text-[11px] text-stone-400 py-3 text-center">No food or beverages requested.</p>
                `}
              </div>

            </div>
          </div>



        </div>

        <!-- Right Column: Room Owner Time Limit & Decision Box -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 shadow-xs space-y-3.5">
            
            <div class="flex items-center justify-between border-b border-stone-100 pb-2">
              <div class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                  <span class="iconify" data-icon="lucide:key" data-stroke-width="2"></span>
                </span>
                <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Room Owner Approval</h3>
              </div>
              <span class="text-[11px] font-bold text-stone-700">
                ${req.room.roomOwner?.name || 'Owner'}
              </span>
            </div>

            <!-- Workflow Progress Stepper (Explicit 5-Stage Section) -->
            <div class="pt-1 pb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Workflow Progress:</span>
              <div class="stepper-container pt-0 pb-0">
                <div class="stepper-track steps-5">
                  <div class="stepper-line">
                    <div class="stepper-line-progress" style="width: ${progressPercent};"></div>
                  </div>

                  <!-- Step 1: Sent -->
                  <div class="stepper-node completed">
                    <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span></div>
                    <span class="stepper-label">1. Sent</span>
                  </div>

                  <!-- Step 2: Pitika Review -->
                  <div class="stepper-node completed">
                    <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span></div>
                    <span class="stepper-label">2. Pitika</span>
                  </div>

                  <!-- Step 3: Room Owner -->
                  <div class="stepper-node ${isConfirmed || isSetup ? 'completed' : (isRejected ? 'failed' : 'active')}">
                    <div class="stepper-circle">
                      ${isConfirmed || isSetup ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isRejected ? `<span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2.5"></span>` : `<span class="iconify text-xs animate-spin" data-icon="lucide:key" data-stroke-width="2"></span>`)}
                    </div>
                    <span class="stepper-label">3. Owner</span>
                  </div>

                  <!-- Step 4: IT & Room Setup -->
                  <div class="stepper-node ${isConfirmed ? 'completed' : (isSetup ? 'active' : '')}">
                    <div class="stepper-circle">
                      ${isConfirmed ? `<span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>` : (isSetup ? `<span class="iconify text-xs animate-spin" data-icon="${req.needsIT ? 'lucide:headset' : 'lucide:settings'}" data-stroke-width="2"></span>` : `<span>4</span>`)}
                    </div>
                    <span class="stepper-label">${req.needsIT ? '4. IT Setup' : '4. Setup'}</span>
                  </div>

                  <!-- Step 5: Door Pass / Ready -->
                  <div class="stepper-node ${isConfirmed ? 'completed' : ''}">
                    <div class="stepper-circle"><span class="iconify text-xs" data-icon="lucide:check-check" data-stroke-width="2.5"></span></div>
                    <span class="stepper-label">5. Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Limit Controls -->
            <div class="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-2 text-xs text-emerald-950">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-900 text-xs">Approve Meeting Time</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2 pt-2">
                <div class="form-field-group">
                  <label class="form-label text-[10px]"><span>Start Time</span></label>
                  <input type="time" id="owner-page-start-time" value="${req.startTime}" ${!isOwnerPending ? 'disabled' : ''} class="bank-input text-xs font-semibold" />
                </div>
                <div class="form-field-group">
                  <label class="form-label text-[10px]"><span>End Time</span></label>
                  <input type="time" id="owner-page-end-time" value="${req.endTime}" ${!isOwnerPending ? 'disabled' : ''} class="bank-input text-xs font-semibold" />
                </div>
              </div>

              <div class="form-field-group pt-1">
                <label class="form-label text-[10px]"><span>Notes or Rules</span></label>
                <input type="text" id="owner-page-notes" value="${req.roomOwnerDecision?.notes || ''}" placeholder="e.g. Approved. Please leave room clean and tidy." ${!isOwnerPending ? 'disabled' : ''} class="bank-input text-xs" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-1 space-y-3">
              ${isPassed && isOwnerPending ? `
                <div class="p-3.5 bg-stone-100/80 rounded-xl border border-stone-200 text-center space-y-1.5">
                  <div class="flex items-center justify-center space-x-1.5 text-stone-700 font-bold text-xs">
                    <span class="iconify text-stone-500 text-sm" data-icon="lucide:history"></span>
                    <span>Meeting Date Passed</span>
                  </div>
                  <p class="text-[11px] text-stone-500">This request is closed because the scheduled meeting date has already passed.</p>
                </div>
              ` : (isOwnerPending ? `
                <button onclick="app.handleRoomOwnerDirectApprove('${req.id}')" aria-label="Approve request" class="w-full min-h-[44px] py-2.5 btn-success text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                  <span>${req.needsIT ? 'Approve & Dispatch to IT Team' : 'Approve & Confirm Time'}</span>
                </button>

                <!-- Inline Decline Drawer Toggle -->
                <div class="pt-1 border-t border-stone-200">
                  <button type="button" onclick="app.toggleOwnerInlineReject()" aria-label="Decline or reject request" class="w-full min-h-[44px] py-2 text-center text-xs font-semibold text-rose-700 hover:text-rose-900 transition flex items-center justify-center space-x-1 cursor-pointer">
                    <span class="iconify text-xs" data-icon="lucide:chevron-down" id="owner-reject-icon"></span>
                    <span>Reject This Request</span>
                  </button>
                  <div id="owner-inline-reject-box" class="hidden mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label class="form-label text-rose-950 font-bold text-xs"><span>Reason for Rejecting <span class="text-rose-700">*</span></span></label>
                    <textarea id="owner-inline-reject-reason" rows="2" placeholder="e.g. Room is needed for an executive meeting..." class="bank-input text-xs"></textarea>
                    <button onclick="app.confirmRoomOwnerInlineRejection('${req.id}')" aria-label="Confirm rejection" class="w-full min-h-[44px] py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
                      <span class="iconify text-xs text-white" data-icon="lucide:ban" data-stroke-width="2"></span>
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              ` : (isSetup ? `
                <div class="p-3 bg-red-50/80 rounded-lg border border-red-200 text-center space-y-2">
                  <div class="flex items-center justify-center space-x-1.5 text-red-900 font-bold text-xs">
                    <span class="iconify text-red-700 text-sm animate-spin" data-icon="lucide:settings"></span>
                    <span>Approved &bull; IT Setup In Progress</span>
                  </div>
                  <p class="text-[11px] text-stone-600">Ticket dispatched to IT Support. Technicians are setting up equipment.</p>
                  <button onclick="app.navigateTo('it-queue')" class="w-full min-h-[38px] py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
                    <span class="iconify text-xs text-white" data-icon="lucide:server"></span>
                    <span>View IT Support Queue</span>
                  </button>
                </div>
              ` : (isConfirmed ? `
                <button onclick="app.openReceiptPage('${req.id}', 'room-owner-review')" aria-label="View booking receipt" class="w-full min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
                  <span class="iconify text-xs" data-icon="lucide:receipt" data-stroke-width="1.8"></span>
                  <span>View Booking Receipt</span>
                </button>
              ` : `
                <div class="py-2 text-center text-xs text-stone-500 font-medium">
                  Decision completed
                </div>
              `)))}
            </div>

          </div>
        </div>

      </div>
    `;
  }


  toggleOwnerInlineReject() {
    const box = document.getElementById('owner-inline-reject-box');
    const icon = document.getElementById('owner-reject-icon');
    if (box) {
      box.classList.toggle('hidden');
      if (icon) {
        icon.setAttribute('data-icon', box.classList.contains('hidden') ? 'lucide:chevron-down' : 'lucide:chevron-up');
      }
    }
  }


  handleRoomOwnerDirectApprove(requestId) {
    const startTime = document.getElementById('owner-page-start-time')?.value;
    const endTime = document.getElementById('owner-page-end-time')?.value;
    const ownerNotes = document.getElementById('owner-page-notes')?.value || 'Approved by Private Room Owner.';

    bookingStore.approveByRoomOwner(requestId, {
      approvedStartTime: startTime,
      approvedEndTime: endTime,
      ownerNotes
    });

    this.showToast("Room Approved", "Private room hours confirmed.", "success");
    this.renderRoomOwnerReviewPage(requestId);
  }


  confirmRoomOwnerInlineRejection(requestId) {
    const reason = document.getElementById('owner-inline-reject-reason')?.value.trim();
    if (!reason) {
      this.showToast("Reason Required", "Please write a reason for rejecting.", "warning");
      return;
    }

    bookingStore.rejectByRoomOwner(requestId, reason);
    this.showToast("Request Rejected", "Room request has been rejected.", "info");
    this.renderRoomOwnerReviewPage(requestId);
  }

  // Backward compatibility alias methods for modals
  openRoomOwnerTimeModal(requestId) { this.renderRoomOwnerReviewPage(requestId); }
  closeRoomOwnerTimeModal() {}
  confirmRoomOwnerApproval() {}
  openRoomOwnerRejectModal(requestId) { this.renderRoomOwnerReviewPage(requestId); }
  closeRoomOwnerRejectModal() {}
  confirmRoomOwnerRejection() {}

  // ==================== 6. IT SUPPORT QUEUE ====================

}

window.NBC.views['room-owner-review'] = new RoomOwnerReviewView();
