// Room Owner Review Workspace View Component (view-room-owner-review)
// TypeUI Cafe Design System with NBC Crimson Heritage - Signature Executive Modernist Style
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
    const reqId = params.requestId || (typeof this.selectedRequestForOwnerReview === 'object' ? this.selectedRequestForOwnerReview?.id : this.selectedRequestForOwnerReview) || 'REQ-2026-008';
    this.selectedRequestForOwnerReview = reqId;
    container.innerHTML = `
      <div id="view-room-owner-review" class="w-full h-full lg:h-[calc(100vh-140px)] flex flex-col justify-start"></div>
    `;
    this.renderRoomOwnerReviewPage(reqId);
  }

  init(params = {}) {
    if (params.requestId) this.selectedRequestForOwnerReview = params.requestId;
    window.app = window.app || {};
    window.app.openRoomOwnerReviewWorkspace = (id) => this.openRoomOwnerReviewWorkspace(id);
    window.app.handleRoomOwnerDirectApprove = (id) => this.handleRoomOwnerDirectApprove(id);
    window.app.toggleOwnerInlineReject = () => this.toggleOwnerInlineReject();
    window.app.confirmRoomOwnerInlineRejection = (id) => this.confirmRoomOwnerInlineRejection(id);
    window.app.setOwnerPresetTime = (start, end) => this.setOwnerPresetTime(start, end);
    window.app.recalculateOwnerDuration = () => this.recalculateOwnerDuration();
    window.app.copyOwnerDoorCode = (code) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      this.showToast("Door Passcode Copied", code, "success");
    };
  }

  openRoomOwnerReviewWorkspace(requestId) {
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;
    this.selectedRequestForOwnerReview = req.id;
    this.navigateTo('room-owner-review', { requestId: req.id });
  }

  setOwnerPresetTime(startTime, endTime) {
    const startInput = document.getElementById('owner-page-start-time');
    const endInput = document.getElementById('owner-page-end-time');
    if (startInput && endInput) {
      startInput.value = startTime;
      endInput.value = endTime;
      this.recalculateOwnerDuration();
    }
  }

  recalculateOwnerDuration() {
    const startVal = document.getElementById('owner-page-start-time')?.value;
    const endVal = document.getElementById('owner-page-end-time')?.value;
    const durationDisplay = document.getElementById('owner-calculated-duration');
    if (!startVal || !endVal || !durationDisplay) return;

    const s = startVal.split(':').map(Number);
    const e = endVal.split(':').map(Number);
    if (s.length === 2 && e.length === 2) {
      const diff = (e[0] * 60 + e[1]) - (s[0] * 60 + s[1]);
      if (diff > 0) {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        durationDisplay.textContent = `${h}h ${m < 10 ? '0' : ''}${m}m`;
      } else {
        durationDisplay.textContent = 'Invalid Range';
      }
    }
  }

  renderRoomOwnerReviewPage(requestId) {
    const container = document.getElementById('view-room-owner-review');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId) || bookingStore.getRequests().find(r => r.isPrivateRequest || r.room?.isPrivate) || bookingStore.getRequests()[0];
    if (!req) {
      container.innerHTML = `
        <div class="py-12 px-4 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-xs space-y-3">
          <div class="w-12 h-12 rounded-full bg-[#FAF7F4] text-stone-500 mx-auto flex items-center justify-center">
            <span class="iconify text-xl" data-icon="lucide:key" data-stroke-width="1.8"></span>
          </div>
          <h2 class="text-sm font-heading font-bold text-stone-900">No Private Request Selected</h2>
          <div class="pt-2">
            <button onclick="app.navigateTo('room-owner-queue')" class="px-4 py-2 btn-primary rounded-lg text-xs font-bold shadow-xs">
              Back to Private Requests
            </button>
          </div>
        </div>
      `;
      return;
    }

    this.selectedRequestForOwnerReview = req.id;

    const isOwnerPending = req.status === 'Pending Room Owner Approval';
    const isConfirmed = req.status === 'Approved - Confirmed';
    const isSetup = req.status === 'Approved - Setup In Progress';
    const isRejected = req.status === 'Rejected';
    const isPassed = this._checkMeetingPassed(req);

    // Compute progress stage
    let activeStage = 3;
    if (isConfirmed) activeStage = 5;
    else if (isSetup) activeStage = 4;
    else if (isRejected) activeStage = 3;

    const room = bookingStore.getRoomById(req.room?.id) || req.room || bookingStore.getRooms()[0] || {};
    const roomImage = room.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    const floorClean = (room.floor || 'Level 18').split('(')[0].trim();

    const doorAccess = bookingStore.getDoorAccessState
      ? bookingStore.getDoorAccessState(req)
      : { code: req.doorPasscode || req.referenceCode || '7729-EXEC' };

    // Duration computation
    let durationString = '2h 00m';
    if (req.startTime && req.endTime) {
      const s = req.startTime.split(':').map(Number);
      const e = req.endTime.split(':').map(Number);
      if (s.length === 2 && e.length === 2) {
        const diff = (e[0] * 60 + e[1]) - (s[0] * 60 + s[1]);
        if (diff > 0) {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          durationString = `${h}h ${m < 10 ? '0' : ''}${m}m`;
        }
      }
    }

    // Status label & dot (strictly zero badges)
    let statusText = 'Waiting for Decision';
    let statusTone = 'text-amber-800';
    let statusDot = 'bg-amber-500 animate-pulse';
    if (isConfirmed) {
      statusText = 'Booking Confirmed & Cleared';
      statusTone = 'text-emerald-700';
      statusDot = 'bg-emerald-600';
    } else if (isSetup) {
      statusText = 'Approved - Setup In Progress';
      statusTone = 'text-blue-700';
      statusDot = 'bg-blue-600';
    } else if (isRejected) {
      statusText = 'Rejected by Room Owner';
      statusTone = 'text-rose-700';
      statusDot = 'bg-rose-600';
    }

    container.innerHTML = `
      <!-- Top Context Bar (Clean, Zero Badges) -->
      <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0 gap-3">
        <div class="flex items-center gap-3">
          <button type="button" onclick="app.navigateTo('room-owner-queue')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DD] text-xs font-semibold text-stone-700 hover:bg-[#FAF7F4] transition shadow-2xs cursor-pointer">
            <span class="iconify text-sm text-stone-600" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
            <span>Private Requests</span>
          </button>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-stone-300">/</span>
            <span class="font-mono font-medium text-stone-500">${req.id}</span>
            <span class="text-stone-300">/</span>
            <span class="font-semibold text-stone-900">Review Request</span>
          </div>
        </div>

        <!-- Clean Status Indicator (Strictly Zero Badges) -->
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${statusDot}"></span>
          <span class="text-xs font-semibold ${statusTone}">${statusText}</span>
        </div>
      </div>

      <!-- Main Executive Layout (Internal Scroll Only, No Full-Page Vertical Scroll) -->
      <div class="flex-1 overflow-y-auto hide-scrollbar pt-4 pb-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <!-- LEFT CARD: Room Showcase & Dossier with Decorative Image (7 Cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-xs flex flex-col">
            
            <div>
              <!-- Decorative Architectural Image Banner -->
              <div class="relative h-44 w-full overflow-hidden bg-stone-900">
                <img 
                  src="${roomImage}" 
                  alt="${room.name || 'Malis Executive Suite'}" 
                  class="w-full h-full object-cover opacity-90 transition duration-500 hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/25 to-transparent"></div>
                
                <!-- Floating Decorative Room Tags on Image -->
                <div class="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <div class="flex items-center gap-2 text-[11px] text-amber-400 font-mono">
                      <span>${room.id || 'EXEC-ROOM-01'}</span>
                      <span class="text-stone-400">&bull;</span>
                      <span class="text-stone-300 font-sans">${floorClean}</span>
                    </div>
                    <h1 class="text-xl font-bold font-heading text-white tracking-tight mt-0.5">${room.name || req.room?.name || 'Malis Executive Suite'}</h1>
                  </div>

                  <div class="flex items-center gap-2 bg-stone-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/50 text-xs">
                    <span class="iconify text-stone-300" data-icon="lucide:users" data-stroke-width="1.8"></span>
                    <span>${room.capacity || 16} Seats</span>
                  </div>
                </div>
              </div>

              <!-- Content Padding Area -->
              <div class="p-5 sm:p-6 space-y-4">
                
                <!-- Booker Identity Row -->
                <div class="flex items-center justify-between pb-4 border-b border-[#E9E3DD]">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] flex items-center justify-center font-bold text-sm text-stone-800 font-heading shrink-0">
                      ${(req.requester?.name || 'JV').split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <span class="text-sm font-bold text-stone-900 block leading-tight">${req.requester?.name || 'Jonathan Vance'}</span>
                      <span class="text-xs text-stone-500 block leading-tight mt-0.5">${req.requester?.department || 'Board & Executive Office'} &bull; Ext. ${req.requester?.extension || req.requester?.phone || '4410'}</span>
                    </div>
                  </div>

                  <div class="text-right">
                    <span class="text-[11px] text-stone-400 block font-medium">Submitted</span>
                    <span class="text-xs font-mono text-stone-700 font-medium block mt-0.5">${req.submittedText || req.submissionTimestamp || '16 Sep 2026, 14:22'}</span>
                  </div>
                </div>

                <!-- Key Metrics Strip -->
                <div class="grid grid-cols-3 gap-3 py-1">
                  <div class="p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Date</span>
                    <span class="text-xs font-semibold text-stone-900 block mt-0.5">${req.date || 'Thu, 18 Sep 2026'}</span>
                  </div>
                  <div class="p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Time Window</span>
                    <span class="text-xs font-mono font-semibold text-stone-900 block mt-0.5">${req.startTime || '11:00'} – ${req.endTime || '13:00'}</span>
                  </div>
                  <div class="p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Attendees</span>
                    <span class="text-xs font-semibold text-stone-900 block mt-0.5">${req.attendees || 10} Participants</span>
                  </div>
                </div>

                <!-- Meeting Purpose & Statement -->
                <div class="space-y-2">
                  <h2 class="text-sm font-bold font-heading text-stone-900 tracking-tight">${req.meetingTitle || 'Confidential Board Monetary Policy Briefing'}</h2>
                  <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] text-xs text-stone-700 leading-relaxed italic">
                    "${req.privateJustification || req.meetingPurpose || 'Quarterly macroeconomic forecasting models and interbank interest rate projections. Requires an isolated chamber without pedestrian visibility and secure Polycom video link.'}"
                  </div>
                </div>

              </div>
            </div>

            <!-- Manager Pitika Clearance + Requested Amenities Strip -->
            <div class="px-5 sm:px-6 pb-5 pt-3 border-t border-[#E9E3DD] space-y-3 bg-[#FAF7F4]/50">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 text-emerald-800 font-medium">
                  <span class="iconify text-emerald-700 text-sm" data-icon="lucide:shield-check" data-stroke-width="2"></span>
                  <span>Pitika Cleared &bull; Public rooms fully booked today</span>
                </div>
                <span class="font-mono text-[11px] text-stone-400">${req.managerReview?.timestamp || '16 Sep 2026, 16:45'}</span>
              </div>

              <!-- Amenities Strip -->
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] text-stone-700">
                  <span class="iconify text-[#991B1B] text-xs" data-icon="lucide:tv" data-stroke-width="1.8"></span>
                  <span>${req.needsIT ? 'Polycom 4K' : 'Display'}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] text-stone-700">
                  <span class="iconify text-[#991B1B] text-xs" data-icon="lucide:lock" data-stroke-width="1.8"></span>
                  <span>Encrypted Line</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] text-stone-700">
                  <span class="iconify text-[#991B1B] text-xs" data-icon="lucide:coffee" data-stroke-width="1.8"></span>
                  <span>${req.needsCatering ? 'Executive Tea' : 'No Catering'}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9E3DD] text-stone-700">
                  <span class="iconify text-[#991B1B] text-xs" data-icon="lucide:wrench" data-stroke-width="1.8"></span>
                  <span>30m IT Setup</span>
                </span>
              </div>
            </div>

          </div>

          <!-- RIGHT CARD: Approval Decision Terminal (5 Cols) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-[#E9E3DD] p-5 sm:p-6 shadow-xs flex flex-col space-y-4">
            
            <!-- Governance Clearance Stepper -->
            <div class="pb-4 border-b border-[#E9E3DD]">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-sm font-bold font-heading text-stone-900 tracking-tight">Approval Progress</h2>
                <span class="font-mono text-[11px] text-stone-500">Step ${activeStage} of 5</span>
              </div>

              <div class="relative flex items-center justify-between text-center">
                <div class="absolute left-3 right-3 top-3.5 h-0.5 bg-[#E9E3DD] -z-0">
                  <div class="h-full bg-[#991B1B]" style="width: ${activeStage === 5 ? '100%' : (activeStage === 4 ? '75%' : (activeStage === 3 ? '50%' : '25%'))}"></div>
                </div>

                <!-- 1. Sent -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-xs shadow-2xs">
                    <span class="iconify text-white text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-700 mt-1">Sent</span>
                </div>

                <!-- 2. Pitika -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-xs shadow-2xs">
                    <span class="iconify text-white text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-700 mt-1">Pitika</span>
                </div>

                <!-- 3. Owner -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full ${isConfirmed || isSetup ? 'bg-[#991B1B] text-white' : (isRejected ? 'bg-rose-600 text-white' : 'bg-white border-2 border-[#991B1B] text-[#991B1B] ring-4 ring-[#991B1B]/10')} flex items-center justify-center text-xs shadow-2xs">
                    <span class="iconify ${isConfirmed || isSetup ? 'text-white' : ''} text-xs" data-icon="${isConfirmed || isSetup ? 'lucide:check' : (isRejected ? 'lucide:x' : 'lucide:key')}" data-stroke-width="2"></span>
                  </div>
                  <span class="text-[10px] font-bold ${isConfirmed || isSetup ? 'text-stone-700' : 'text-[#991B1B]'} mt-1">Owner</span>
                </div>

                <!-- 4. Setup -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full ${isConfirmed ? 'bg-[#991B1B] text-white' : (isSetup ? 'bg-white border-2 border-blue-600 text-blue-600 ring-4 ring-blue-600/10' : 'bg-[#FAF7F4] border border-[#E9E3DD] text-stone-400')} flex items-center justify-center text-[10px] font-mono">
                    ${isConfirmed ? '<span class="iconify text-white text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>' : '4'}
                  </div>
                  <span class="text-[10px] font-medium ${isSetup ? 'text-blue-700 font-bold' : 'text-stone-400'} mt-1">Setup</span>
                </div>

                <!-- 5. Ready -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full ${isConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#FAF7F4] border border-[#E9E3DD] text-stone-400'} flex items-center justify-center text-[10px] font-mono">
                    ${isConfirmed ? '<span class="iconify text-white text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>' : '5'}
                  </div>
                  <span class="text-[10px] font-medium ${isConfirmed ? 'text-emerald-700 font-bold' : 'text-stone-400'} mt-1">Ready</span>
                </div>
              </div>
            </div>

            <!-- Mini Schedule Bar (Decorative & Useful) -->
            <div class="py-2.5 border-b border-[#E9E3DD] space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-stone-500 font-medium">Room Timeline</span>
                <span class="text-emerald-700 font-medium flex items-center gap-1">
                  <span class="iconify text-xs" data-icon="lucide:check" data-stroke-width="2"></span>
                  <span>No Schedule Conflicts</span>
                </span>
              </div>
              <div class="relative w-full h-7 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] flex items-center px-2.5 overflow-hidden text-xs">
                <div class="flex justify-between w-full text-[10px] font-mono text-stone-400 select-none">
                  <span>08:00</span>
                  <span>11:00</span>
                  <span>13:00</span>
                  <span>17:00</span>
                </div>
                <div 
                  class="absolute top-1 bottom-1 left-[27%] right-[43%] bg-[#FEF2F2] border border-[#FCA5A5] rounded-md flex items-center justify-center font-mono text-[10px] font-semibold text-[#991B1B] shadow-2xs z-10"
                >
                  ${req.startTime || '11:00'} - ${req.endTime || '13:00'} (${durationString})
                </div>
              </div>
            </div>

            <!-- STATE A: Pending Decision Controls -->
            ${isOwnerPending && !isPassed ? `
              <div class="space-y-4">
                <!-- Meeting Hours Authorization -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-stone-900">Approve Meeting Hours</span>
                    <span id="owner-calculated-duration" class="font-mono text-[#991B1B] font-bold">${durationString}</span>
                  </div>

                  <!-- Fast Time Chips -->
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      type="button" 
                      onclick="app.setOwnerPresetTime('${req.startTime || '11:00'}', '${req.endTime || '13:00'}')" 
                      class="py-1.5 px-2 rounded-lg border border-[#991B1B] bg-[#991B1B]/5 text-[#991B1B] text-[11px] font-semibold text-center transition cursor-pointer"
                    >
                      ${req.startTime || '11:00'} - ${req.endTime || '13:00'}
                    </button>
                    <button 
                      type="button" 
                      onclick="app.setOwnerPresetTime('${req.startTime || '11:00'}', '12:30')" 
                      class="py-1.5 px-2 rounded-lg border border-[#E9E3DD] bg-white hover:bg-[#FAF7F4] text-stone-700 text-[11px] font-medium text-center transition cursor-pointer"
                    >
                      1.5 Hours
                    </button>
                    <button 
                      type="button" 
                      onclick="app.setOwnerPresetTime('11:30', '${req.endTime || '13:00'}')" 
                      class="py-1.5 px-2 rounded-lg border border-[#E9E3DD] bg-white hover:bg-[#FAF7F4] text-stone-700 text-[11px] font-medium text-center transition cursor-pointer"
                    >
                      Start 11:30
                    </button>
                  </div>

                  <!-- Start & End Time Inputs -->
                  <div class="grid grid-cols-2 gap-2.5">
                    <div>
                      <label class="text-[10px] font-medium text-stone-500 block mb-1">Start Time</label>
                      <input 
                        type="time" 
                        id="owner-page-start-time" 
                        value="${req.startTime || '11:00'}" 
                        onchange="app.recalculateOwnerDuration()"
                        class="w-full bg-[#FAF7F4] border border-[#E9E3DD] rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#991B1B]"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] font-medium text-stone-500 block mb-1">End Time</label>
                      <input 
                        type="time" 
                        id="owner-page-end-time" 
                        value="${req.endTime || '13:00'}" 
                        onchange="app.recalculateOwnerDuration()"
                        class="w-full bg-[#FAF7F4] border border-[#E9E3DD] rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#991B1B]"
                      />
                    </div>
                  </div>

                  <!-- Directives Input -->
                  <div>
                    <label class="text-[10px] font-medium text-stone-500 block mb-1">Directives for IT & Room Setup</label>
                    <input 
                      type="text" 
                      id="owner-page-notes" 
                      value="${req.roomOwnerDecision?.notes || 'Approved. Ensure secure room protocols.'}" 
                      class="w-full bg-[#FAF7F4] border border-[#E9E3DD] rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#991B1B]"
                    />
                  </div>
                </div>

                <!-- Actions -->
                <div class="pt-2 space-y-2 border-t border-[#E9E3DD]">
                  <button 
                    type="button" 
                    onclick="app.handleRoomOwnerDirectApprove('${req.id}')" 
                    class="w-full btn-primary min-h-[46px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span class="iconify text-white text-sm" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                    <span class="text-white">Approve & Dispatch to IT Setup</span>
                  </button>

                  <div class="text-center">
                    <button 
                      type="button" 
                      onclick="app.toggleOwnerInlineReject()" 
                      class="text-xs text-stone-500 hover:text-rose-700 inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <span class="iconify text-stone-400" data-icon="lucide:x-circle" data-stroke-width="1.8"></span>
                      <span>Decline Request</span>
                    </button>
                  </div>

                  <!-- Inline Decline Drawer -->
                  <div id="owner-inline-reject-box" class="hidden pt-2 space-y-2">
                    <select id="owner-inline-reject-reason" class="w-full bg-[#FAF7F4] border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800">
                      <option value="Executive Schedule Conflict">Executive Schedule Conflict</option>
                      <option value="Utilize public conference room">Utilize public conference room</option>
                      <option value="Security clearance incomplete">Security clearance incomplete</option>
                    </select>
                    <button 
                      type="button" 
                      onclick="app.confirmRoomOwnerInlineRejection('${req.id}')" 
                      class="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span class="iconify text-white text-xs" data-icon="lucide:slash" data-stroke-width="2"></span>
                      <span class="text-white">Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              </div>
            ` : (isConfirmed ? `
              <!-- STATE B: Confirmed Clearance Dossier (Fills space with useful data!) -->
              <div class="space-y-3.5 pt-1">
                <!-- Approved Access Window -->
                <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                  <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Approved Access Window</span>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-xs font-mono font-bold text-stone-900">${req.startTime || '11:00'} – ${req.endTime || '13:00'}</span>
                    <span class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span class="iconify text-xs" data-icon="lucide:check-circle-2"></span>
                      <span>Confirmed (${durationString})</span>
                    </span>
                  </div>
                </div>

                <!-- Issued Door Access Passcode Card -->
                <div class="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5">
                      <span class="iconify text-sm text-emerald-700" data-icon="lucide:key-round" data-stroke-width="2"></span>
                      <span>Door Access Passcode</span>
                    </span>
                    <button type="button" onclick="app.copyOwnerDoorCode('${doorAccess.code}')" class="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer">
                      <span class="iconify text-xs" data-icon="lucide:copy"></span>
                      <span>Copy</span>
                    </button>
                  </div>
                  <div class="font-mono text-base font-bold text-emerald-950 tracking-wider">
                    ${doorAccess.code}
                  </div>
                </div>

                <!-- Owner Clearance Directive -->
                <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] space-y-1.5">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">Owner Clearance Directive</span>
                  <p class="text-xs text-stone-800 italic">
                    "${req.roomOwnerDecision?.notes || req.roomOwnerReview?.notes || 'Approved. Ensure secure room protocols and clean audio link.'}"
                  </p>
                  <div class="text-[11px] text-stone-500 pt-1 border-t border-[#E9E3DD] flex items-center justify-between">
                    <span>Authority: <strong class="text-stone-700">H.E. Chea Serey Cabinet</strong></span>
                    <span class="text-emerald-700 font-mono font-medium">Cleared</span>
                  </div>
                </div>

                <!-- Receipt Action CTA -->
                <div class="pt-1">
                  <button type="button" onclick="app.openReceiptPage('${req.id}', 'room-owner-review')" class="w-full btn-primary min-h-[46px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                    <span class="iconify text-white text-sm" data-icon="lucide:receipt" data-stroke-width="2"></span>
                    <span class="text-white">View Official Booking Receipt</span>
                  </button>
                </div>
              </div>
            ` : (isSetup ? `
              <!-- STATE C: IT Setup In Progress -->
              <div class="space-y-3.5 pt-1">
                <div class="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <span class="iconify text-blue-700 text-sm animate-spin" data-icon="lucide:settings"></span>
                      <span>IT Setup In Progress</span>
                    </span>
                    <span class="font-mono text-[11px] text-blue-700 font-semibold">Stage 4</span>
                  </div>
                  <p class="text-xs text-blue-900 leading-relaxed">
                    Ticket dispatched to IT Support. Technicians are configuring equipment and verifying door security.
                  </p>
                </div>

                <div class="p-3 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                  <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Approved Access Window</span>
                  <div class="text-xs font-mono font-bold text-stone-900 mt-1">${req.startTime || '11:00'} – ${req.endTime || '13:00'} (${durationString})</div>
                </div>

                <button type="button" onclick="app.navigateTo('it-queue')" class="w-full min-h-[44px] py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:server" data-stroke-width="1.8"></span>
                  <span class="text-white">Open IT Support Queue</span>
                </button>
              </div>
            ` : `
              <div class="p-4 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-500 font-medium">
                Decision Completed
              </div>
            `))}

          </div>

        </div>
      </div>
    `;
  }

  _checkMeetingPassed(req) {
    if (!req.date) return false;
    const now = new Date();
    const endTimeStr = req.endTime || '23:59';
    const meetingEnd = new Date(`${req.date}T${endTimeStr}:00`);
    return !isNaN(meetingEnd.getTime()) && meetingEnd < now;
  }

  toggleOwnerInlineReject() {
    const box = document.getElementById('owner-inline-reject-box');
    if (box) {
      box.classList.toggle('hidden');
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
      this.showToast("Reason Required", "Please select or write a reason for rejecting.", "warning");
      return;
    }

    bookingStore.rejectByRoomOwner(requestId, reason);
    this.showToast("Request Rejected", "Room request has been rejected.", "info");
    this.renderRoomOwnerReviewPage(requestId);
  }

  // Backward compatibility alias methods
  openRoomOwnerTimeModal(requestId) { this.renderRoomOwnerReviewPage(requestId); }
  closeRoomOwnerTimeModal() {}
  confirmRoomOwnerApproval() {}
  openRoomOwnerRejectModal(requestId) { this.renderRoomOwnerReviewPage(requestId); }
  closeRoomOwnerRejectModal() {}
  confirmRoomOwnerRejection() {}
}

window.NBC.views['room-owner-review'] = new RoomOwnerReviewView();
