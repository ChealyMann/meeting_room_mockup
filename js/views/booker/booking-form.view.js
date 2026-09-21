// Booking Form View Component (view-booking-form)
// 3-Step Wizard Flow: 1. Schedule -> 2. Food & IT Support -> 3. Price Review & Confirm
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class BookingFormView {
  constructor() {
    this.id = 'request-form';
    this.selectedRoomForBooking = null;
    this.selectedCateringPackageId = 'cat-1';
    this.selectedCateringPackageIds = new Set(['cat-1']);
    this.currentCateringPage = 0;
    this.selectedITItemIndexes = new Set([0, 2]);
    this.currentITPage = 0;
    this.bookingFormFromView = 'book-room';
    this.currentStep = 1;
    this.step1Calendar = null;
    this.selectedTimelineSlot = null;
    this.slotSelectionMode = 'multi'; // 'single' | 'multi' (default multi for seamless direct slot selection)
    this.selectedSessions = []; // Array of { roomId, date, startTime, endTime }
    this.justDeselected = 0;

    this.template = `<!-- Top Action Breadcrumb Bar with 4-Step Wizard Tracker -->
      <div class="pb-2 mb-1 border-b border-stone-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button type="button" onclick="app.navigateBackFromBookingForm()" class="page-back-button h-8 px-3 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition shadow-2xs shrink-0">
              <span class="iconify text-stone-400 text-sm" data-icon="lucide:arrow-left"></span>
              <span id="btn-request-form-back-label">All Rooms</span>
            </button>

            <!-- Clean Room Owner Info for Booking Form -->
            <div id="form-header-owner-badge" class="hidden items-center space-x-1.5 shrink-0 pl-1">
              <img id="form-header-owner-avatar" src="" alt="Room Owner" class="w-5 h-5 rounded-full object-cover shrink-0" />
              <span class="text-[12px] text-stone-500 font-medium">Owner: <strong id="form-header-owner-name" class="text-stone-900 font-semibold"></strong><span id="form-header-owner-you" class="text-[11px] font-semibold text-stone-500"> (You)</span></span>
            </div>
          </div>

          <!-- Wizard Step Navigation Indicator (4 Steps) -->
          <div class="flex items-center space-x-1 sm:space-x-1 text-xs">
            <button type="button" onclick="app.bookingFormGoToStep(1)" id="wizard-tab-1" class="wizard-step-tab active h-8 px-2.5 rounded-md bg-[#FEF2F2] border border-red-200 text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0">
              <span class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Schedule</span>
            </button>
            <span class="iconify text-stone-300 text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
            <button type="button" onclick="app.bookingFormGoToStep(2)" id="wizard-tab-2" class="wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
              <span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Meeting Details</span>
            </button>
            <span class="iconify text-stone-300 text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
            <button type="button" onclick="app.bookingFormGoToStep(3)" id="wizard-tab-3" class="wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
              <span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Food & IT</span>
            </button>
            <span class="iconify text-stone-300 text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
            <button type="button" onclick="app.bookingFormGoToStep(4)" id="wizard-tab-4" class="wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
              <span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">4</span>
              <span>Review & Confirm</span>
            </button>
          </div>
        </div>
      </div>

      <form id="room-booking-form" action="javascript:void(0);" onsubmit="event.preventDefault(); return false;" onkeydown="if(event.key==='Enter' && event.target.tagName !== 'TEXTAREA'){event.preventDefault(); return false;}">
        <input type="hidden" id="form-room-id" value="ROOM-101" />
        <select id="form-room-select" class="hidden"></select>
        <!-- Compatibility elements for updateSelectedRoomPreview -->
        <div class="hidden">
          <span id="form-room-dept-tag"></span>
          <img id="form-room-preview-img" src="" alt="Room" />
          <strong id="form-selected-room-name"></strong>
          <span id="form-selected-room-meta"></span>
          <span id="form-room-capacity-badge"></span>
        </div>

        <!-- ==================== STEP 1: SCHEDULE & BOOKING BASKET (INSPIRATION FROM REFERENCE) ==================== -->
        <div id="booking-step-1" class="space-y-3 animate-fade-in">
          <div class="step1-cards-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch lg:h-[650px] lg:max-h-[650px]">
            
            <!-- LEFT COLUMN: Room Hero Card + Weekly Schedule Calendar (lg:col-span-8 xl:col-span-9) -->
            <div class="lg:col-span-8 xl:col-span-9 flex flex-col space-y-3 h-full lg:h-[650px] lg:max-h-[650px] min-h-0">
              
              <!-- ROOM DETAILS HERO CARD (Top of Left Column) -->
              <div class="bg-white rounded-xl border border-[#E9E3DD] p-3 sm:p-3.5 shadow-xs flex items-center space-x-4 shrink-0">
                <img id="form-room-hero-img" src="assets/rooms/summit-suite.jpg" alt="Room" class="w-24 h-20 sm:w-28 sm:h-20 rounded-xl object-cover border border-[#E9E3DD] shadow-2xs shrink-0" />
                <div class="min-w-0 flex-1">
                  <h3 id="form-room-hero-title" class="text-base sm:text-lg font-bold text-[#3E2B1E] font-heading leading-tight truncate">ទន្លេសេកុង - Sekong River</h3>
                  <p id="form-room-hero-meta" class="text-xs text-stone-500 font-medium mt-0.5 truncate">Floor 18 &bull; Executive Suite &bull; 60 seats</p>
                  <div id="form-room-hero-amenities" class="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                    <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F5F2EE] text-[#3E2B1E] border border-[#E9E3DD]">Standard</span>
                    <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:projector" data-stroke-width="2"></span>
                      <span>Projector</span>
                    </span>
                    <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:video" data-stroke-width="2"></span>
                      <span>Video Conference</span>
                    </span>
                    <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:presentation" data-stroke-width="2"></span>
                      <span>Whiteboard</span>
                    </span>
                    <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:wifi" data-stroke-width="2"></span>
                      <span>Wi-Fi</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- CALENDAR CARD (Bottom of Left Column) -->
              <div class="step1-schedule-card bg-white rounded-xl border border-[#E9E3DD] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
                <!-- Clean Light Cafe Toolbar -->
                <div class="px-4 py-3 bg-white border-b border-[#E9E3DD] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div class="flex items-center space-x-3 min-w-0">
                    <h4 class="font-bold text-sm sm:text-base text-[#3E2B1E] font-heading shrink-0">Choose Schedule</h4>
                    <span id="step1-calendar-title" class="text-xs sm:text-[13px] font-medium text-stone-500 font-mono truncate">07 – 13 Sep 2026</span>

                    <!-- Integrated Status Legend (Inline beside date range) -->
                    <div class="hidden md:flex items-center space-x-3 pl-3 border-l border-[#E9E3DD]">
                      <span class="inline-flex items-center space-x-1.5 text-[11px] font-medium text-stone-500 select-none">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Available</span>
                      </span>
                      <span class="inline-flex items-center space-x-1.5 text-[11px] font-medium text-stone-500 select-none">
                        <span class="w-2 h-2 rounded-full bg-[#991B1B]"></span>
                        <span>Reserved</span>
                      </span>
                      <span class="inline-flex items-center space-x-1.5 text-[11px] font-medium text-stone-400 select-none">
                        <span class="w-2 h-2 rounded-full bg-stone-300"></span>
                        <span>Past</span>
                      </span>
                    </div>
                  </div>

                  <!-- Right Controls: [ Week | Day ], Date Picker, Today -->
                  <div class="flex items-center space-x-2 shrink-0">
                    <!-- Segmented View Toggle: [ Week | Day ] -->
                    <div class="flex items-center bg-stone-100 p-0.5 rounded-lg border border-[#E9E3DD] shadow-2xs">
                      <button type="button" id="step1-btn-view-week" onclick="app.switchStep1CalendarView('timeGridWeek')" class="px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#991B1B] shadow-xs transition cursor-pointer flex items-center space-x-1" title="7-Day Week View">
                        <span>Week</span>
                      </button>
                      <button type="button" id="step1-btn-view-day" onclick="app.switchStep1CalendarView('timeGridDay')" class="px-3 py-1 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer flex items-center space-x-1" title="Single Day View">
                        <span>Day</span>
                      </button>
                    </div>

                    <!-- Date Navigation Controls -->
                    <div class="flex items-center bg-white border border-[#E9E3DD] rounded-lg px-2 py-1 space-x-1.5 shadow-2xs">
                      <span class="iconify text-stone-400 text-xs" data-icon="lucide:calendar" data-stroke-width="2"></span>
                      <input type="date" id="form-date" required onchange="app.handleStep1DateChange(this.value)" class="bg-transparent text-stone-700 text-xs font-medium outline-none cursor-pointer" title="Jump to date" />
                      <button type="button" onclick="app.changeStep1TimelineCalendar(-1)" class="w-5 h-5 rounded hover:bg-stone-100 text-stone-500 flex items-center justify-center transition cursor-pointer" title="Previous">
                        <span class="iconify text-xs" data-icon="lucide:chevron-left" data-stroke-width="2"></span>
                      </button>
                      <button type="button" onclick="app.changeStep1TimelineCalendar(1)" class="w-5 h-5 rounded hover:bg-stone-100 text-stone-500 flex items-center justify-center transition cursor-pointer" title="Next">
                        <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
                      </button>
                    </div>

                    <button type="button" onclick="app.setStep1TimelineDateToToday()" class="bg-white border border-[#E9E3DD] hover:bg-stone-50 text-stone-700 text-xs font-medium px-3 py-1 rounded-lg transition shadow-2xs cursor-pointer">
                      Today
                    </button>
                  </div>
                </div>

                <!-- FullCalendar Mount Container -->
                <div class="p-2 overflow-y-auto bg-white flex-1 min-h-0 flex flex-col custom-scrollbar">
                  <div id="booking-step-timeline-calendar" class="nbc-calendar-container min-h-[380px] flex-1"></div>
                </div>

                <!-- Inline Validation Error Alert -->
                <div id="time-validation-error" class="hidden m-3 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-center space-x-2 animate-fade-in shadow-2xs shrink-0">
                  <span class="iconify text-red-700 text-base shrink-0" data-icon="lucide:alert-triangle" data-stroke-width="2"></span>
                  <span id="time-validation-error-msg" class="text-[11px] font-semibold text-red-800 leading-tight"></span>
                </div>

                <!-- Hidden Compatibility and Form Inputs -->
                <div id="step1-bottom-schedule-strip" class="hidden">
                  <input type="time" id="form-start-time" value="" min="07:00" max="18:00" class="hidden" />
                  <input type="time" id="form-end-time" value="" min="07:00" max="18:00" class="hidden" />
                  <div id="step1-single-slot-panel" class="hidden">
                    <div id="step1-slot-display-container">
                      <div id="step1-slot-icon-box"></div>
                      <span id="step1-selected-slot-text"></span>
                      <span id="calculated-duration-badge"><span id="calculated-duration-label"></span></span>
                      <button type="button" id="step1-deselect-slot-btn"></button>
                    </div>
                  </div>
                  <div id="form-schedule-timeline-container" class="hidden"></div>
                  <input type="checkbox" id="step1-toggle-multi-slot" checked class="hidden" />
                  <span id="step1-multi-badge" class="hidden">0</span>
                </div>
              </div>

            </div>

            <!-- RIGHT COLUMN: Selected Sessions Cart & Checkout (lg:col-span-4 xl:col-span-3) -->
            <div class="lg:col-span-4 xl:col-span-3 flex flex-col space-y-3 h-full min-h-0">
              
              <!-- Selected Sessions Cart Card -->
              <div id="step1-sessions-cart-sidebar" class="bg-white rounded-xl border border-[#E9E3DD] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
                <!-- Cart Header -->
                <div class="px-4 py-3 bg-white flex items-center justify-between gap-2 shrink-0 border-b border-[#E9E3DD]">
                  <div class="flex items-center space-x-2">
                    <h4 id="step1-tray-title" class="font-bold text-sm text-[#3E2B1E] font-heading">Selected Sessions</h4>
                    <span id="step1-cart-count-badge" class="font-mono text-xs font-bold text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 rounded-full leading-none" style="font-family: 'JetBrains Mono', monospace;">0</span>
                  </div>
                  <button type="button" id="step1-clear-all-btn" onclick="app.clearAllSessions()" class="invisible text-xs font-medium text-[#7D6857] hover:text-[#991B1B] flex items-center space-x-1 transition cursor-pointer">
                    <span class="iconify text-xs" data-icon="lucide:trash-2" data-stroke-width="2"></span>
                    <span id="step1-clear-btn-label">Clear All</span>
                  </button>
                </div>

                <!-- Hidden room preview fields for compatibility -->
                <div class="hidden">
                  <h5 id="cart-room-name"></h5>
                  <span id="cart-room-badge"></span>
                  <p id="cart-room-meta"></p>
                  <img id="cart-room-img" src="" alt="" />
                </div>

                <!-- Cart Items Container (Scrollable Session Cards) -->
                <div id="step1-multi-slot-panel" class="p-3 bg-[#FAF8F5]/40 flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div id="step1-tray-content-area" class="flex-1 min-h-0 flex flex-col overflow-hidden">
                    <!-- Empty Cart State -->
                    <div id="step1-multi-empty-hint" class="m-auto w-full py-6 px-4 bg-white border border-dashed border-[#E9E3DD] rounded-xl flex flex-col items-center justify-center text-center space-y-2 select-none">
                      <div class="w-9 h-9 rounded-full bg-[#F5F2EE] text-stone-400 flex items-center justify-center">
                        <span class="iconify text-base" data-icon="lucide:calendar-plus" data-stroke-width="2"></span>
                      </div>
                      <div class="space-y-0.5">
                        <div class="text-xs font-bold text-[#3E2B1E]">No session selected</div>
                        <p id="step1-empty-hint-text" class="text-[11px] text-stone-500 max-w-[200px] leading-snug">Click open time slots on the schedule to add sessions.</p>
                      </div>
                    </div>

                    <!-- Vertical Session Cards List (Scrollable, hidden scrollbars) -->
                    <div id="step1-multi-chips-list" class="hidden w-full flex flex-col space-y-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar pr-0.5"></div>
                  </div>
                </div>

                <!-- Cart Order Summary Totals (Anchored strictly to bottom of the card) -->
                <div class="mt-auto px-4 py-3 bg-white border-t border-[#E9E3DD] space-y-2 text-xs shrink-0">
                  <div class="flex items-center justify-between text-stone-600">
                    <span class="text-xs font-medium text-stone-500">Total Sessions</span>
                    <span id="cart-summary-session-count" class="font-bold text-[#3E2B1E] text-xs font-mono">0 Sessions</span>
                  </div>
                  <div class="flex items-center justify-between text-stone-600">
                    <span class="text-xs font-medium text-stone-500">Total Duration</span>
                    <span id="cart-summary-total-duration" class="font-bold text-[#3E2B1E] text-xs font-mono">0 mins</span>
                  </div>
                  <span id="step1-multi-total-summary" class="hidden">0 Sessions • 0 mins</span>
                </div>
              </div>

              <!-- Primary Action Button directly under Selected Sessions Cart -->
              <button type="button" id="btn-cart-checkout" onclick="app.bookingFormGoToStep(2)" class="w-full h-11 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer shrink-0 group">
                <span>Next: Meeting Details</span>
                <span class="iconify text-sm text-white group-hover:translate-x-0.5 transition-transform" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
              </button>

            </div>

          </div>

          <!-- Bottom Left: Cancel and Return Link -->
          <div class="pt-1">
            <button type="button" onclick="app.navigateBackFromBookingForm()" class="text-stone-500 hover:text-stone-800 font-medium text-[13px] underline cursor-pointer transition">
              Cancel and Return
            </button>
          </div>
        </div>

        <!-- ==================== STEP 2: MEETING & ORGANIZER DETAILS ==================== -->
        <div id="booking-step-2" class="hidden space-y-3 animate-fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            <!-- Meeting Information Card -->
            <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-3.5">
              <div class="flex items-center justify-between border-b border-stone-100 pb-2">
                <div class="flex items-center space-x-2">
                  <span class="w-5 h-5 rounded bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center">2</span>
                  <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">
                    Meeting Details
                  </h3>
                </div>
                <span class="text-[10px] text-stone-400 font-medium">Required *</span>
              </div>

              <!-- Meeting Title -->
              <div class="form-field-group">
                <label class="form-label" for="form-meeting-title">
                  <span>Meeting Title <span class="text-red-700">*</span></span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:heading-1" data-stroke-width="1.8"></span>
                  <input type="text" id="form-meeting-title" required placeholder="e.g. Budget Review Meeting" class="bank-input bank-input-with-icon" oninput="app.handleMeetingTitleInput(this.value)" />
                </div>
              </div>

              <!-- Mandatory Business Justification for Private Room -->
              <div id="form-private-justification-group" class="hidden p-3 bg-amber-50/80 rounded-xl border border-amber-300/90 space-y-2 animate-fade-in">
                <div class="flex items-center justify-between gap-2">
                  <label class="form-label mb-0 text-amber-950 font-bold text-xs leading-tight" for="form-private-justification">
                    <span>Reason for Private Room <span class="text-red-700">*</span></span>
                  </label>
                  <span class="shrink-0 whitespace-nowrap text-[9px] text-amber-900 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 border border-amber-300">
                    Required for Approval
                  </span>
                </div>
                <p class="text-[11px] text-stone-600 leading-snug">
                  Please explain why this meeting requires a private executive room (e.g. confidential banking session, or standard rooms fully occupied).
                </p>
                <textarea id="form-private-justification" rows="2" placeholder="e.g. All standard meeting rooms are occupied today. Executive confidentiality required." class="bank-input text-xs bg-white leading-relaxed resize-none"></textarea>
              </div>

              <!-- Expected Attendees -->
              <div class="form-field-group">
                <label class="form-label" for="form-attendees">
                  <span>Expected Attendees <span class="text-red-700">*</span></span>
                  <span class="helper">People</span>
                </label>
                <div class="relative">
                  <span class="iconify input-icon-wrapper" data-icon="lucide:users" data-stroke-width="1.8"></span>
                  <input type="number" id="form-attendees" min="1" max="100" value="8" required oninput="app.updatePricingSummary()" class="bank-input bank-input-with-icon text-xs font-semibold" />
                </div>
              </div>

              <!-- Meeting Note / Agenda -->
              <div class="form-field-group">
                <label class="form-label" for="form-purpose">
                  <span>Meeting Note / Agenda</span>
                  <span class="helper">Optional</span>
                </label>
                <textarea id="form-purpose" rows="2" placeholder="Agenda or special room arrangement notes..." class="bank-input text-xs resize-none"></textarea>
              </div>
            </div>

            <!-- Organizer Details -->
            <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs space-y-3.5">
              <div class="flex items-center justify-between border-b border-stone-100 pb-2">
                <div class="flex items-center space-x-2">
                  <span class="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center">2</span>
                  <h3 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">
                    Organizer Information
                  </h3>
                </div>
                <span class="text-[10px] text-stone-400 font-medium">Default: Jonathan Vance</span>
              </div>

              <!-- Full Name & Staff ID -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div class="form-field-group">
                  <label class="form-label" for="form-requester-name">
                    <span>Full Name <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:user" data-stroke-width="1.8"></span>
                    <input type="text" id="form-requester-name" value="Jonathan Vance" required class="bank-input bank-input-with-icon text-xs" />
                  </div>
                </div>

                <div class="form-field-group">
                  <label class="form-label" for="form-requester-id">
                    <span>Staff ID <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:badge-check" data-stroke-width="1.8"></span>
                    <input type="text" id="form-requester-id" value="NBC-4102" required class="bank-input bank-input-with-icon font-mono font-semibold text-xs" />
                  </div>
                </div>
              </div>

              <!-- Directorate & Department -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div class="form-field-group">
                  <label class="form-label" for="form-requester-directorate">
                    <span>Directorate <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:building-2" data-stroke-width="1.8"></span>
                    <select id="form-requester-directorate" required onchange="app.handleDirectorateChange(this.value)" class="bank-input bank-input-with-icon text-xs text-stone-900 font-semibold">
                    </select>
                  </div>
                </div>

                <div class="form-field-group">
                  <label class="form-label" for="form-requester-department">
                    <span>Department <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:layers" data-stroke-width="1.8"></span>
                    <select id="form-requester-department" required onchange="app.handleDepartmentSubChange(this.value)" class="bank-input bank-input-with-icon text-xs text-stone-900 font-medium">
                    </select>
                  </div>
                </div>
              </div>

              <!-- Work Email & Phone Extension -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div class="form-field-group">
                  <label class="form-label" for="form-requester-email">
                    <span>Work Email <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:mail" data-stroke-width="1.8"></span>
                    <input type="email" id="form-requester-email" value="jonathan.vance@nbc.gov.kh" required class="bank-input bank-input-with-icon text-xs" />
                  </div>
                </div>

                <div class="form-field-group">
                  <label class="form-label" for="form-requester-phone">
                    <span>Phone Ext. <span class="text-red-700">*</span></span>
                  </label>
                  <div class="relative">
                    <span class="iconify input-icon-wrapper" data-icon="lucide:phone-call" data-stroke-width="1.8"></span>
                    <input type="text" id="form-requester-phone" value="Ext. 8421" required class="bank-input bank-input-with-icon text-xs font-semibold" />
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Bottom Navigation for Step 2 -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E9E3DD]">
            <button type="button" onclick="app.bookingFormGoToStep(1)" class="h-9 px-4 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition cursor-pointer">
              <span class="iconify text-sm" data-icon="lucide:arrow-left"></span>
              <span>Back</span>
            </button>
            <button type="button" onclick="app.bookingFormGoToStep(3)" class="btn-primary w-full sm:w-auto h-9 px-4 rounded-md text-[13px] font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
              <span>Next: Food & IT</span>
              <span class="iconify text-sm" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>

        <!-- ==================== STEP 3: FOOD & IT SUPPORT ==================== -->
        <div id="booking-step-3" class="hidden space-y-3 animate-fade-in">
          
          <!-- Top Guidance & 1-Click Skip Banner -->
          <div class="p-3.5 sm:p-4 bg-gradient-to-r from-[#FAF7F4] to-white rounded-xl border border-[#E9E3DD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
            <h3 class="text-sm font-heading font-bold text-stone-900 flex items-center space-x-2">
              <span class="iconify text-amber-700 text-base" data-icon="lucide:package-plus" data-stroke-width="1.8"></span>
              <span>Select Services & Add-ons (Optional)</span>
            </h3>
            <button type="button" onclick="app.bookingFormSkipAddons()" class="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-[#E9E3DD] text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition shrink-0 cursor-pointer">
              <span class="iconify text-stone-500 text-sm" data-icon="lucide:fast-forward"></span>
              <span>Skip All Add-ons (Standard Setup)</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            <!-- ADD-ON 1: FOOD & DRINKS (CATERING) -->
            <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[470px] min-h-[470px] max-h-[470px] overflow-hidden">
              <!-- Card Header -->
              <div class="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-bold shrink-0">
                    <span class="iconify" data-icon="lucide:utensils"></span>
                  </div>
                  <h4 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">Food & Refreshments</h4>
                </div>

                <!-- iOS Switch Toggle with clean plain text status -->
                <div class="flex items-center space-x-2 shrink-0">
                  <span id="catering-toggle-label" class="text-xs font-medium text-stone-500">Off</span>
                  <label class="nbc-switch" for="catering-toggle">
                    <input type="checkbox" id="catering-toggle" onchange="app.handleCateringToggleChange(); app.updatePricingSummary();">
                    <span class="nbc-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Collapsible Content (When ON) -->
              <div id="catering-details-panel" class="hidden flex-1 flex flex-col min-h-0 overflow-hidden pt-2">
                <!-- Panel Subheader -->
                <div class="flex items-center p-2  justify-between py-1 shrink-0">
                  <span class="text-xs font-semibold text-stone-800">Catering Packages</span>
                  <span id="cat-selection-counter-text" class="text-[11px] font-medium text-stone-500">1 package selected</span>
                </div>

                <!-- Smooth Internally Scrollable List of All 9 Packages -->
                <div id="catering-list-container" class="flex-1 p-3 min-h-0 overflow-y-auto space-y-1.5 pr-1.5 my-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  
                  <!-- Option 1: Lunch Box -->
                  <div onclick="app.selectCateringPackage('cat-1')" id="pkg-cat-1" class="option-card selected text-xs py-2 px-2.5 rounded-lg border border-[#991B1B] bg-[#FEF2F2]/40 cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:utensils"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Lunch Box</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Rice, meat, fresh salad & dessert</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-[#991B1B] bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-2xs transition">
                      <svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>

                  <!-- Option 2: Coffee & Pastries -->
                  <div onclick="app.selectCateringPackage('cat-2')" id="pkg-cat-2" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:coffee"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Coffee & Pastries</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Hot premium coffee, tea & fresh bakeries</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 3: Tea & Fresh Fruit -->
                  <div onclick="app.selectCateringPackage('cat-3')" id="pkg-cat-3" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:cup-soda"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Tea & Fresh Fruit</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Green tea, seasonal fruits & snacks</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 4: Executive VIP Buffet -->
                  <div onclick="app.selectCateringPackage('cat-4')" id="pkg-cat-4" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:chef-hat"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Executive VIP Buffet</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Hot entree stations, canapés & desserts</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 5: Healthy & Vegetarian -->
                  <div onclick="app.selectCateringPackage('cat-5')" id="pkg-cat-5" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:salad"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Healthy & Vegetarian</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Organic greens, juice & gourmet wraps</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 6: Afternoon High Tea -->
                  <div onclick="app.selectCateringPackage('cat-6')" id="pkg-cat-6" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:cake"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Afternoon High Tea</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Finger sandwiches, scones & fine teas</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 7: All-Day Beverage Bar -->
                  <div onclick="app.selectCateringPackage('cat-7')" id="pkg-cat-7" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-sky-50 text-sky-900 border border-sky-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:wine"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">All-Day Beverage Bar</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Espresso bar, iced tea & sparkling water</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 8: Breakfast & Dim Sum -->
                  <div onclick="app.selectCateringPackage('cat-8')" id="pkg-cat-8" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:croissant"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Breakfast & Dim Sum</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Steamed dumplings, pastries & soy milk</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 9: Khmer Heritage Set -->
                  <div onclick="app.selectCateringPackage('cat-9')" id="pkg-cat-9" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:soup"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Khmer Heritage Set</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Traditional Khmer delicacies & desserts</span>
                      </div>
                    </div>
                    <div class="cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                </div>

                <!-- Pinned Bottom Remarks Bar -->
                <div class="shrink-0 pt-2.5 border-t border-[#E9E3DD]">
                  <label class="form-label mb-1" for="form-catering-remarks">
                    <span>Dietary Remarks</span>
                    <span class="helper">Optional</span>
                  </label>
                  <input type="text" id="form-catering-remarks" placeholder="e.g. 2 vegetarian, no pork, halal options" class="bank-input text-xs h-8" />
                </div>
              </div>

              <!-- Empty / Inactive Placeholder when OFF -->
              <div id="catering-off-placeholder" class="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-[#FAF7F4] rounded-xl border border-dashed border-[#E9E3DD] my-2 animate-fade-in">
                <div class="w-12 h-12 rounded-full bg-stone-100/80 border border-stone-200/60 flex items-center justify-center text-stone-400 mb-2.5 shrink-0">
                  <span class="iconify text-xl" data-icon="lucide:utensils-crossed" data-stroke-width="1.8"></span>
                </div>
                <span class="text-xs font-heading font-semibold text-stone-700">No Catering Requested</span>
              </div>
            </div>

            <!-- ADD-ON 2: IT SUPPORT & TECHNICAL ASSISTANCE -->
            <div class="bg-white rounded-xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[470px] min-h-[470px] max-h-[470px] overflow-hidden">
              <!-- Card Header -->
              <div class="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center text-sm font-bold shrink-0">
                    <span class="iconify" data-icon="lucide:headset"></span>
                  </div>
                  <h4 class="text-xs font-heading font-bold text-stone-900 uppercase tracking-wide">IT & Technical Support</h4>
                </div>

                <!-- iOS Switch Toggle with clean plain text status -->
                <div class="flex items-center space-x-2 shrink-0">
                  <span id="it-toggle-label" class="text-xs font-medium text-stone-500">Off</span>
                  <label class="nbc-switch" for="it-toggle">
                    <input type="checkbox" id="it-toggle" onchange="app.handleITToggleChange(); app.updatePricingSummary();">
                    <span class="nbc-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Collapsible Content (When ON) -->
              <div id="it-details-panel" class="hidden flex-1 flex flex-col min-h-0 overflow-hidden pt-2">
                <!-- Panel Subheader -->
                <div class="flex items-center justify-between py-1 shrink-0">
                  <span class="text-xs font-semibold text-stone-800">IT Equipment & Services</span>
                  <span id="it-selection-counter-text" class="text-[11px] font-medium text-stone-500">2 items selected</span>
                </div>

                <!-- Smooth Internally Scrollable List of All 9 IT Items -->
                <div id="it-list-container" class="flex-1 p-3 min-h-0 overflow-y-auto space-y-1.5 pr-1.5 my-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  
                  <!-- Option 1 (0): Video Conference Setup -->
                  <div onclick="app.toggleITOption(0)" id="it-card-0" class="option-card selected text-xs py-2 px-2.5 rounded-lg border border-[#991B1B] bg-[#FEF2F2]/40 cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:video"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Video Conference Setup</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Zoom or Microsoft Teams room test & camera</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-[#991B1B] bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-2xs transition">
                      <svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>

                  <!-- Option 2 (1): Presentation Screen & TV -->
                  <div onclick="app.toggleITOption(1)" id="it-card-1" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:tv"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Presentation Screen & TV</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Laptop to TV display, HDMI & wireless stream</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 3 (2): Microphones & Audio Setup -->
                  <div onclick="app.toggleITOption(2)" id="it-card-2" class="option-card selected text-xs py-2 px-2.5 rounded-lg border border-[#991B1B] bg-[#FEF2F2]/40 cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:mic"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Microphones & Audio Setup</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Executive table mics & clear room loudspeakers</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-[#991B1B] bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-2xs transition">
                      <svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>

                  <!-- Option 4 (3): Smart Digital Whiteboard -->
                  <div onclick="app.toggleITOption(3)" id="it-card-3" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:monitor-play"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Smart Digital Whiteboard</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Interactive touch display & live notes export</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 5 (4): Session Recording & Stream -->
                  <div onclick="app.toggleITOption(4)" id="it-card-4" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:disc"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Session Recording & Stream</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">HD meeting archive & private video stream link</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 6 (5): Dedicated IT Standby Staff -->
                  <div onclick="app.toggleITOption(5)" id="it-card-5" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:user-check"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Dedicated IT Standby Staff</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">On-site technical specialist throughout session</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 7 (6): Presenter Laptop & Clicker -->
                  <div onclick="app.toggleITOption(6)" id="it-card-6" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:laptop"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Presenter Laptop & Clicker</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Pre-configured presentation laptop & pointer</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 8 (7): High-Density Wi-Fi / LAN -->
                  <div onclick="app.toggleITOption(7)" id="it-card-7" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:wifi"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">High-Density Wi-Fi / LAN</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Dedicated gigabit VLAN & ultra-fast Wi-Fi</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                  <!-- Option 9 (8): Simultaneous Translation -->
                  <div onclick="app.toggleITOption(8)" id="it-card-8" class="option-card text-xs py-2 px-2.5 rounded-lg border border-[#E9E3DD] bg-white cursor-pointer flex items-center justify-between gap-2.5 transition hover:border-[#D97706]/60 select-none">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div class="w-6 h-6 rounded-md bg-red-50 text-red-900 border border-red-200 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:languages"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <strong class="text-stone-900 block text-xs truncate font-bold leading-tight">Simultaneous Translation</strong>
                        <span class="text-stone-500 text-[10px] block leading-tight truncate">Multi-channel headsets & booth setup</span>
                      </div>
                    </div>
                    <div class="it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400"></div>
                  </div>

                </div>

                <!-- Pinned Bottom Remarks Bar -->
                <div class="shrink-0 pt-2.5 border-t border-[#E9E3DD]">
                  <label class="form-label mb-1" for="form-it-remarks">
                    <span>Special Equipment Notes</span>
                    <span class="helper">Optional</span>
                  </label>
                  <input type="text" id="form-it-remarks" onkeydown="if(event.key==='Enter'){event.preventDefault();}" placeholder="e.g. Need Mac HDMI adapter, presentation clicker" class="bank-input text-xs h-8" />
                </div>
              </div>

              <!-- Empty / Inactive Placeholder when OFF -->
              <div id="it-off-placeholder" class="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-[#FAF7F4] rounded-xl border border-dashed border-[#E9E3DD] my-2 animate-fade-in">
                <div class="w-12 h-12 rounded-full bg-stone-100/80 border border-stone-200/60 flex items-center justify-center text-stone-400 mb-2.5 shrink-0">
                  <span class="iconify text-xl" data-icon="lucide:headset" data-stroke-width="1.8"></span>
                </div>
                <span class="text-xs font-heading font-semibold text-stone-700">Standard Room AV Only</span>
              </div>
            </div>

          </div>

          <!-- Bottom Navigation for Step 3 -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E9E3DD]">
            <button type="button" onclick="app.bookingFormGoToStep(2)" class="h-9 px-4 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition cursor-pointer">
              <span class="iconify text-sm" data-icon="lucide:arrow-left"></span>
              <span>Back</span>
            </button>
            <button type="button" onclick="app.bookingFormGoToStep(4)" class="btn-primary w-full sm:w-auto h-9 px-4 rounded-md text-[13px] font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer">
              <span>Next: Review & Confirm</span>
              <span class="iconify text-sm" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>

        <!-- ==================== STEP 4: BOOKING REVIEW & SUBMIT ==================== -->
        <div id="booking-step-4" class="hidden animate-fade-in w-full max-w-8xl mx-auto flex flex-col min-h-0">
          
          <!-- Unified Single-Page 2-Column Reservation Summary Matching Reference Screenshot -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            <!-- LEFT COLUMN: Comprehensive Reservation Dossier (lg:col-span-8) -->
            <div class="lg:col-span-8 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              
              <!-- 1. Room Header & Schedule Bar -->
              <div class="flex items-start justify-between gap-3 pb-1">
                <div class="flex items-center gap-3.5 min-w-0">
                  <img id="step4-room-img" src="assets/rooms/summit-suite.jpg" alt="Room" class="w-36 h-24 sm:w-44 sm:h-26 rounded-xl object-cover border border-stone-200 shrink-0" />
                  <div class="min-w-0">
                    <h3 id="step4-room-name" class="font-heading font-bold text-base sm:text-lg text-stone-900 tracking-tight leading-tight truncate">ទន្លេសេកុង - Sisekong – Sekong River</h3>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-1 font-medium">
                      <span class="inline-flex items-center gap-1.5">
                        <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                        <span id="step4-room-floor">Floor 18 - Executive Suite</span>
                      </span>
                      <span class="inline-flex items-center gap-1.5">
                        <span class="iconify text-[#991B1B] text-sm" data-icon="lucide:users" data-stroke-width="1.8"></span>
                        <span id="step4-room-capacity">Capacity: 60 Seats</span>
                      </span>
                      <span id="step4-room-owner-tag" class="hidden inline-flex items-center gap-1.5 text-[#D97706] font-semibold">
                        <span class="iconify text-sm" data-icon="lucide:shield" data-stroke-width="1.8"></span>
                        <span id="step4-room-owner-text">Owner: Jonathan Vance</span>
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-2.5">
                      <span id="step4-room-type" class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#991B1B] border border-red-100">Standard Room</span>
                      <span class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#F5F2EE] text-[#6F5849] border border-[#E9E3DD]">Meeting Room</span>
                    </div>
                  </div>
                </div>
                <button type="button" onclick="app.bookingFormGoToStep(1)" class="h-8 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium inline-flex items-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer">
                  <span class="iconify text-stone-400 text-xs" data-icon="lucide:pencil" data-stroke-width="1.8"></span>
                  <span>Edit</span>
                </button>
              </div>

              <!-- 2. Schedule & Attendees Metrics Strip (Matching Reference) -->
              <div class="bg-[#FAF7F5] rounded-xl border border-stone-200/60 p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="flex items-start gap-2.5">
                  <span class="iconify text-[#991B1B] text-xl shrink-0 mt-0.5" data-icon="lucide:calendar" data-stroke-width="1.8"></span>
                  <div class="min-w-0">
                    <span class="text-[10.5px] font-medium text-stone-400 block leading-tight">Date</span>
                    <strong id="step4-date" class="font-heading font-bold text-xs sm:text-[13px] text-stone-900 block truncate mt-0.5">Wed, Sep 23, 2026</strong>
                    <span id="step4-day-label" class="text-[10.5px] text-stone-400 font-mono block truncate mt-0.5">Confirmed Slot</span>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="iconify text-[#991B1B] text-xl shrink-0 mt-0.5" data-icon="lucide:clock" data-stroke-width="1.8"></span>
                  <div class="min-w-0">
                    <span class="text-[10.5px] font-medium text-stone-400 block leading-tight">Time & Duration</span>
                    <strong id="step4-time" class="font-mono font-bold text-xs sm:text-[13px] text-stone-900 block truncate mt-0.5">07:30 – 09:00</strong>
                    <span id="step4-duration" class="text-[10.5px] text-stone-400 font-mono block truncate mt-0.5">Scheduled (1h 30m)</span>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="iconify text-[#991B1B] text-xl shrink-0 mt-0.5" data-icon="lucide:users" data-stroke-width="1.8"></span>
                  <div class="min-w-0">
                    <span class="text-[10.5px] font-medium text-stone-400 block leading-tight">Attendees</span>
                    <strong id="step4-attendees" class="font-mono font-bold text-xs sm:text-[13px] text-stone-900 block truncate mt-0.5">8 Persons</strong>
                    <span class="text-[10.5px] text-stone-400 block truncate mt-0.5">In-person</span>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="iconify text-[#991B1B] text-xl shrink-0 mt-0.5" data-icon="lucide:lock" data-stroke-width="1.8"></span>
                  <div class="min-w-0">
                    <span class="text-[10.5px] font-medium text-stone-400 block leading-tight">Door Access</span>
                    <strong class="font-heading font-bold text-xs sm:text-[13px] text-[#991B1B] block truncate mt-0.5">Digital PIN</strong>
                    <span class="text-[10.5px] text-stone-400 block truncate mt-0.5">Sent via email</span>
                  </div>
                </div>
              </div>

              <!-- Multi-Session Schedule Breakdown (Only when multiple sessions) -->
              <div id="step4-multi-sessions-section" class="hidden rounded-xl border border-stone-200/60 bg-[#FAF7F5] p-2.5 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-heading font-bold text-stone-900">Multi-Session Schedule</span>
                  <span id="step4-multi-sessions-count" class="font-mono text-xs font-bold text-[#991B1B]"></span>
                </div>
                <div id="step4-multi-sessions-list" class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-20 overflow-y-auto no-scrollbar"></div>
              </div>

              <!-- 3. Meeting & Requester (2-Column Grid) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <!-- Meeting Details Card -->
                <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6.5 h-6.5 rounded-full bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                      </span>
                      <span class="font-heading font-bold text-xs sm:text-sm text-stone-900">Meeting Details</span>
                    </div>
                    <button type="button" onclick="app.bookingFormGoToStep(2)" class="h-6 px-2 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-[11px] font-medium inline-flex items-center gap-1 transition cursor-pointer">
                      <span class="iconify text-[11px] text-stone-400" data-icon="lucide:pencil" data-stroke-width="1.8"></span>
                      <span>Edit</span>
                    </button>
                  </div>
                  <div>
                    <h4 id="step4-meeting-title" class="font-heading font-bold text-xs sm:text-sm text-stone-900 truncate">CC</h4>
                    <p id="step4-meeting-notes" class="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">General departmental meeting and discussion.</p>
                  </div>
                </div>

                <!-- Requester Profile Card -->
                <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6.5 h-6.5 rounded-full bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:user" data-stroke-width="1.8"></span>
                      </span>
                      <span class="font-heading font-bold text-xs sm:text-sm text-stone-900">Requester</span>
                    </div>
                    <span id="step4-staff-id" class="font-mono text-xs font-semibold text-stone-400">NBC-4102</span>
                  </div>
                  <div>
                    <strong id="step4-requester-name" class="font-heading font-bold text-xs sm:text-sm text-stone-900 block truncate">Jonathan Vance</strong>
                    <p id="step4-department" class="text-xs text-stone-500 truncate mt-0.5 leading-snug">Board of Directors & Cabinet • Board & Executive Office</p>
                    <div class="text-[11px] text-stone-500 font-mono truncate mt-1 flex items-center gap-1.5">
                      <span class="iconify text-stone-400 text-xs shrink-0" data-icon="lucide:mail" data-stroke-width="1.8"></span>
                      <span id="step4-phone">Ext. 8421</span> &bull; <span id="step4-email">jonathan.vance@nbc.gov.kh</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- 4. Services Specification: Food & IT (2-Column Grid) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <!-- Food & Catering -->
                <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6.5 h-6.5 rounded-full bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
                      </span>
                      <span class="font-heading font-bold text-xs sm:text-sm text-stone-900">Food & Catering</span>
                    </div>
                    <button type="button" onclick="app.bookingFormGoToStep(3)" class="h-6 px-2 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-[11px] font-medium inline-flex items-center gap-1 transition cursor-pointer">
                      <span class="iconify text-[11px] text-stone-400" data-icon="lucide:pencil" data-stroke-width="1.8"></span>
                      <span>Edit</span>
                    </button>
                  </div>
                  <div id="step4-food-content" class="hidden">
                    <div class="flex items-center justify-between text-xs">
                      <strong id="step4-food-package-name" class="font-bold text-stone-900 truncate">Package</strong>
                      <span id="step4-food-servings" class="font-mono text-xs text-stone-600 shrink-0 ml-1">8 Servings</span>
                    </div>
                    <p id="step4-food-remarks" class="text-xs text-stone-500 truncate mt-0.5 leading-relaxed"></p>
                  </div>
                  <div id="step4-food-empty">
                    <span class="text-xs text-stone-500 font-normal">Complimentary mineral water only</span>
                  </div>
                  <span id="step4-food-status" class="hidden">None</span>
                </div>

                <!-- IT Support -->
                <div class="bg-white rounded-xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6.5 h-6.5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:monitor" data-stroke-width="1.8"></span>
                      </span>
                      <span class="font-heading font-bold text-xs sm:text-sm text-stone-900">IT & AV Support</span>
                    </div>
                    <button type="button" onclick="app.bookingFormGoToStep(3)" class="h-6 px-2 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-[11px] font-medium inline-flex items-center gap-1 transition cursor-pointer">
                      <span class="iconify text-[11px] text-stone-400" data-icon="lucide:pencil" data-stroke-width="1.8"></span>
                      <span>Edit</span>
                    </button>
                  </div>
                  <div id="step4-it-content" class="hidden">
                    <div id="step4-it-chip-list" class="flex flex-wrap gap-2"></div>
                  </div>
                  <div id="step4-it-empty">
                    <span class="text-xs text-stone-500 font-normal">Standard in-room AV equipment only</span>
                  </div>
                  <span id="step4-it-status" class="hidden">Standard AV</span>
                </div>

              </div>

              <!-- 5. Private Room Justification (Conditional) -->
              <div id="step4-justification-card" class="hidden p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div class="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                  <span class="iconify text-amber-700 text-sm" data-icon="lucide:shield-alert" data-stroke-width="1.8"></span>
                  <span>Executive Justification for Private Room</span>
                </div>
                <p id="step4-justification-text" class="text-xs text-amber-900 leading-snug"></p>
              </div>

            </div>

            <!-- RIGHT COLUMN: Voucher & Action Console (lg:col-span-4) -->
            <div class="lg:col-span-4 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              
              <!-- Voucher Header -->
              <div class="flex items-center justify-between pb-3.5 border-b border-stone-200/70">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-[#801414] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span class="iconify text-xl text-white" data-icon="lucide:landmark" data-stroke-width="1.8"></span>
                  </div>
                  <div>
                    <h4 class="font-heading font-bold text-xs text-stone-900 uppercase tracking-wider leading-tight">NATIONAL BANK OF CAMBODIA</h4>
                    <span class="text-xs text-stone-400 font-medium">Reservation Voucher</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-md bg-red-50 text-[#991B1B] text-xs font-bold font-mono border border-red-100">DRAFT</span>
              </div>

              <!-- Booking Summary Inset Card -->
              <div class="p-4 bg-[#FAF7F5] rounded-xl border border-stone-200/60 space-y-2.5">
                <div class="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span class="iconify text-[#991B1B] text-base" data-icon="lucide:list" data-stroke-width="2"></span>
                  <span>Booking Summary</span>
                </div>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-stone-500">Facility</span>
                    <strong id="step4-voucher-room" class="font-bold text-stone-900 truncate ml-2 text-right">Sisekong – Sekong River</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-stone-500">Type</span>
                    <strong id="step4-voucher-type" class="font-bold text-stone-900 text-right">Standard Room</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-stone-500">Duration</span>
                    <strong id="step4-voucher-duration" class="font-mono font-bold text-stone-900 text-right">Scheduled</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-stone-500">Attendees</span>
                    <strong id="step4-voucher-attendees" class="font-mono font-bold text-stone-900 text-right">8 Persons</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-stone-500">Services</span>
                    <strong id="step4-voucher-services" class="font-bold text-stone-900 text-right">IT AV Setup</strong>
                  </div>
                </div>
              </div>

              <!-- Authorization Pathway -->
              <div class="space-y-2.5 pt-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="iconify text-[#991B1B] text-base" data-icon="lucide:git-pull-request" data-stroke-width="1.8"></span>
                    <span class="font-heading font-bold text-sm text-stone-900">Approval Route</span>
                  </div>
                  <span id="step4-pathway-turnaround" class="text-xs text-stone-400 font-mono">Est. 1-2 hours</span>
                </div>
                <div id="step4-pathway-steps" class="space-y-2"></div>
              </div>

              <!-- Notice Box -->
              <div class="p-3 rounded-xl bg-[#FDF8F3] border border-[#F5E6D8] flex items-center gap-2.5 text-xs text-stone-700">
                <span class="iconify text-[#D97706] text-base shrink-0" data-icon="lucide:info" data-stroke-width="1.8"></span>
                <span>Door PIN emailed 15m before session</span>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-2.5 pt-1">
                <button type="button" onclick="app.handleBookingSubmit(event)" id="form-submit-btn" class="btn-primary w-full h-9 rounded-md bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition active:scale-[0.98]">
                  <span id="form-submit-btn-text">Submit Request for Review</span>
                  <span class="iconify text-xs text-white" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
                </button>
                <button type="button" onclick="app.bookingFormGoToStep(3)" class="w-full h-9 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-[#E9E3DD] hover:border-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs">
                  <span class="iconify text-stone-500 text-xs" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
                  <span>Back to Services</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </form>`;
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
    container.innerHTML = `
      <div id="view-request-form" class="w-full space-y-3">
        ${this.template}
      </div>
    `;
    this.init(params);
  }

  init(params = {}) {
    if (params.sessions && Array.isArray(params.sessions) && params.sessions.length > 0) {
      this.selectedSessions = this.mergeContiguousSessions([...params.sessions]);
      this.slotSelectionMode = 'multi';
    } else if (params.startTime && params.endTime) {
      const defaultRoomId = params.roomId || (this.selectedRoomForBooking ? this.selectedRoomForBooking.id : 'ROOM-101');
      const targetDate = params.date || new Date().toISOString().split('T')[0];
      this.selectedSessions = [{ roomId: defaultRoomId, date: targetDate, startTime: params.startTime, endTime: params.endTime }];
      this.selectedTimelineSlot = { roomId: defaultRoomId, date: targetDate, startTime: params.startTime, endTime: params.endTime };
      this.slotSelectionMode = 'multi';
    } else {
      this.selectedSessions = [];
      this.slotSelectionMode = 'multi';
    }

    this.setDefaultDates();
    this.ensureFutureDefaultTimes();
    this.populateDirectoratesAndDepartments('DIR-BOD', 'DEPT-BOD-FIN');

    const defaultRoomId = params.roomId || (this.selectedRoomForBooking ? this.selectedRoomForBooking.id : 'ROOM-101');
    this.populateRoomDropdown(defaultRoomId);
    this.updateSelectedRoomPreview(defaultRoomId);

    if (params.date) {
      const dateInput = document.getElementById('form-date');
      if (dateInput) dateInput.value = params.date;
    }
    if (params.startTime) {
      const startInput = document.getElementById('form-start-time');
      if (startInput) startInput.value = params.startTime;
    }
    if (params.endTime) {
      const endInput = document.getElementById('form-end-time');
      if (endInput) endInput.value = params.endTime;
    }
    if (params.meetingTitle) {
      const titleInput = document.getElementById('form-meeting-title');
      if (titleInput) titleInput.value = params.meetingTitle;
    }

    if (params.fromView) {
      this.bookingFormFromView = params.fromView;
    }
    const backLabel = document.getElementById('btn-request-form-back-label');
    if (backLabel) {
      if (params.fromView === 'request-other-private') {
        backLabel.innerText = "Private Rooms";
      } else if (params.fromView === 'room-details') {
        backLabel.innerText = "Room Details";
      } else {
        backLabel.innerText = "All Rooms";
      }
    }

    this.updateDurationPreview();
    this.updateCateringUI();
    this.updateITUI();
    this.handleCateringToggleChange();
    this.handleITToggleChange();
    this.bookingFormGoToStep(1);

    const dateInput = document.getElementById('form-date');
    const targetDate = (dateInput && dateInput.value) ? dateInput.value : params.date;

    setTimeout(() => {
      this.mountStep1Calendar(defaultRoomId, targetDate);
      this.setSlotSelectionMode(this.slotSelectionMode, true);
      if (params.startTime && params.endTime) {
        this.setSelectedStep1Slot({
          roomId: defaultRoomId,
          date: targetDate,
          startTime: params.startTime,
          endTime: params.endTime
        });
      } else if (this.slotSelectionMode === 'multi' && this.selectedSessions.length > 0) {
        this.renderMultiSlotCalendarHighlights();
        this.renderSelectedSessionsTray();
        this.updateMultiBadge();
      } else {
        // Step 1 starts clean and empty without auto-selecting any slot
        this.resetStep1TimelineSelection(false);
      }
    }, 60);
  }

  setDefaultDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dateInput = document.getElementById('form-date');
    if (dateInput) {
      if (!dateInput.value || dateInput.value < dateStr) {
        dateInput.value = dateStr;
      }
      dateInput.min = dateStr;
    }
  }

  ensureFutureDefaultTimes() {
    const dateInput = document.getElementById('form-date');
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    if (!startInput || !endInput) return;

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    const selectedDate = dateInput ? dateInput.value : todayStr;
    if (selectedDate === todayStr) {
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const nowMins = nowH * 60 + nowM;

      const [curStartH, curStartM] = (startInput.value || '09:00').split(':').map(Number);
      const currentStartMins = curStartH * 60 + curStartM;

      if (currentStartMins <= nowMins) {
        const nextSlotMins = Math.ceil((nowMins + 10) / 30) * 30;
        const clampedStart = Math.min(18 * 60, Math.max(8 * 60, nextSlotMins));
        const clampedEnd = Math.min(19 * 60, clampedStart + 60);

        startInput.value = `${String(Math.floor(clampedStart / 60)).padStart(2, '0')}:${String(clampedStart % 60).padStart(2, '0')}`;
        endInput.value = `${String(Math.floor(clampedEnd / 60)).padStart(2, '0')}:${String(clampedEnd % 60).padStart(2, '0')}`;
      }
    }
  }

  validateMeetingTimes() {
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    const dateInput = document.getElementById('form-date');
    const errorBanner = document.getElementById('time-validation-error');
    const errorMsg = document.getElementById('time-validation-error-msg');
    const durationLabel = document.getElementById('calculated-duration-label');
    const durationBadge = document.getElementById('calculated-duration-badge');
    const durationIcon = document.getElementById('duration-badge-icon');
    const roomId = document.getElementById('form-room-id')?.value;

    if (!startInput || !endInput) return { valid: true };

    const startVal = startInput.value;
    const endVal = endInput.value;
    const dateVal = dateInput ? dateInput.value : '';

    if (!startVal || !endVal) {
      return { valid: false, message: "Please select start and end time." };
    }

    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let error = null;
    let conflictObj = null;

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const nowMins = now.getHours() * 60 + now.getMinutes();

    if (dateVal && dateVal < todayStr) {
      error = "Meeting date cannot be in the past.";
      conflictObj = { isPast: true };
    } else if (dateVal === todayStr && startMinutes < nowMins) {
      const nowFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      error = `Start time (${startVal}) has already passed today (Current time: ${nowFormatted}).`;
      conflictObj = { isPast: true };
    } else if (startMinutes < 7 * 60) {
      error = "Building opens at 07:00 AM.";
    } else if (endMinutes > 18 * 60) {
      error = "Building closes at 06:00 PM (18:00).";
    } else if (endMinutes <= startMinutes) {
      error = "End time must be after start time.";
    } else if (endMinutes - startMinutes < 15) {
      error = "Minimum meeting length is 15 minutes.";
    }

    if (!error && dateVal && roomId && typeof bookingStore !== 'undefined') {
      const conflict = bookingStore.checkBookingConflict(roomId, dateVal, startVal, endVal);
      if (conflict && conflict.hasConflict) {
        if (conflict.isPast) {
          error = conflict.message;
          conflictObj = conflict;
        } else {
          error = `Schedule Conflict: ${conflict.conflictingMeeting?.title || 'Another meeting'} is already booked (${conflict.conflictingMeeting?.duration || ''}).`;
          conflictObj = conflict;
        }
      }
    }

    if (error) {
      if (errorBanner) errorBanner.classList.remove('hidden');
      if (errorMsg) errorMsg.innerText = error;
      if (durationBadge) {
        durationBadge.classList.remove('hidden');
        durationBadge.className = 'inline-flex items-center px-1.5 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-800 text-[11px] sm:text-[12px] font-medium leading-none shrink-0';
      }
      if (durationLabel) durationLabel.innerText = "Conflict";
      this.renderFormScheduleTimeline(roomId, dateVal, startVal, endVal, conflictObj);
      return { valid: false, message: error, conflict: conflictObj };
    }

    if (errorBanner) errorBanner.classList.add('hidden');
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    let label = '';
    if (hours > 0) label += `${hours}h`;
    if (mins > 0) label += ` ${mins}m`;
    label = label.trim() || `${diff}m`;

    if (durationLabel) durationLabel.innerText = label;
    if (durationBadge) {
      durationBadge.classList.remove('hidden');
      durationBadge.className = 'inline-flex items-center px-1.5 py-0.5 rounded border border-red-200/60 bg-red-50 text-red-800 text-[11px] sm:text-[12px] font-medium leading-none shrink-0';
    }

    this.renderFormScheduleTimeline(roomId, dateVal, startVal, endVal, null);
    return { valid: true, durationLabel: label };
  }

  renderFormScheduleTimeline(roomId, dateVal, startVal, endVal, conflict = null) {
    const container = document.getElementById('form-schedule-timeline-container');
    if (!container || !roomId || !dateVal || typeof bookingStore === 'undefined') return;

    let timeline = [];
    if (typeof bookingStore.getRoomScheduleTimeline === 'function') {
      try {
        timeline = bookingStore.getRoomScheduleTimeline(roomId, dateVal);
      } catch (err) {
        console.warn('Could not load room schedule timeline:', err);
      }
    }
    if (!timeline || !timeline.length) {
      container.innerHTML = '';
      return;
    }

    const segmentsHtml = timeline.map(seg => {
      let bgClass = 'bg-stone-100 border-stone-200 text-stone-600';
      let statusLabel = 'Available';

      if (seg.isPast) {
        bgClass = 'bg-stone-200/70 border-stone-300 text-stone-400 opacity-60';
        statusLabel = 'Past';
      } else if (seg.isBooked) {
        bgClass = 'bg-rose-100 border-rose-200 text-rose-800 font-semibold';
        statusLabel = seg.meetingTitle || 'Booked';
      }

      return `
        <div class="p-1 rounded text-center border text-[9px] truncate ${bgClass}" title="${seg.slot}: ${statusLabel}">
          <span class="block font-bold">${seg.slot.split(' ')[0]}</span>
          <span class="block truncate opacity-80">${statusLabel}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="pt-1 space-y-1">
        <div class="flex items-center justify-between text-[10px] text-stone-500 font-semibold">
          <span>Day Schedule (07:00 – 18:00)</span>
          <span class="text-emerald-700">Green slots free</span>
        </div>
        <div class="grid grid-cols-6 sm:grid-cols-11 gap-1">
          ${segmentsHtml}
        </div>
      </div>
    `;
  }

  updateDurationPreview() {
    return this.validateMeetingTimes();
  }

  populateDirectoratesAndDepartments(selectedDirId = 'DIR-BOD', selectedDeptId = null) {
    const dirSelect = document.getElementById('form-requester-directorate');
    const deptSelect = document.getElementById('form-requester-department');
    if (!dirSelect || !deptSelect || typeof NBC_ORGANIZATION === 'undefined') return;

    dirSelect.innerHTML = NBC_ORGANIZATION.map(org => `
      <option value="${org.id}" ${org.id === selectedDirId ? 'selected' : ''}>
        ${org.name}
      </option>
    `).join('');

    const currentOrg = NBC_ORGANIZATION.find(o => o.id === selectedDirId) || NBC_ORGANIZATION[0];
    deptSelect.innerHTML = currentOrg.departments.map(dept => `
      <option value="${dept.id}" ${dept.id === selectedDeptId ? 'selected' : ''}>
        ${dept.name}
      </option>
    `).join('');
  }

  populateRoomDropdown(selectedRoomId) {
    const roomSelect = document.getElementById('form-room-select');
    if (!roomSelect) return;

    const standardRooms = bookingStore.getStandardRooms();
    const myPrivateRooms = bookingStore.getRooms().filter(room => 
      room.isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE')
    );
    const otherPrivateRooms = bookingStore.getRooms().filter(room =>
      room.isPrivate && !(room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE')
    );

    let html = `
      <optgroup label="Public Meeting Rooms">
        ${standardRooms.map(room => `
          <option value="${room.id}" ${room.id === selectedRoomId ? 'selected' : ''}>
            ${room.name} — ${room.floor.split('(')[0].trim()} (${room.capacity} seats)
          </option>
        `).join('')}
      </optgroup>
    `;

    if (myPrivateRooms.length > 0) {
      html += `
        <optgroup label="Your Private Room (Instant Confirmation)">
          ${myPrivateRooms.map(room => `
            <option value="${room.id}" ${room.id === selectedRoomId ? 'selected' : ''}>
              ${room.name} (Your Private Room) — ${room.floor.split('(')[0].trim()} (${room.capacity} seats)
            </option>
          `).join('')}
        </optgroup>
      `;
    }

    if (otherPrivateRooms.length > 0) {
      html += `
        <optgroup label="Other Private Rooms (Needs 2-Step Approval)">
          ${otherPrivateRooms.map(room => `
            <option value="${room.id}" ${room.id === selectedRoomId ? 'selected' : ''}>
              ${room.name} (Owner: ${room.roomOwner?.name || 'Owner'}) — ${room.floor.split('(')[0].trim()}
            </option>
          `).join('')}
        </optgroup>
      `;
    }

    roomSelect.innerHTML = html;
  }

  handleDirectorateChange(dirId) {
    if (typeof NBC_ORGANIZATION === 'undefined') return;
    const currentOrg = NBC_ORGANIZATION.find(o => o.id === dirId);
    if (!currentOrg) return;

    const deptSelect = document.getElementById('form-requester-department');
    if (deptSelect) {
      deptSelect.innerHTML = currentOrg.departments.map(dept => `
        <option value="${dept.id}">
          ${dept.name}
        </option>
      `).join('');
    }
    this.updatePricingSummary();
  }

  handleDepartmentSubChange(deptId) {
    this.updatePricingSummary();
  }

  handleFormRoomSelectChange(roomId) {
    this.updateSelectedRoomPreview(roomId);
    this.reloadStep1CalendarEvents();
    this.resetStep1TimelineSelection(false);
    this.clearAllSessions();
    this.updateDurationPreview();
    this.updatePricingSummary();
  }

  updateSelectedRoomPreview(roomId) {
    const room = bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0];
    this.selectedRoomForBooking = room;

    const isPrivate = !!room.isPrivate;
    const isMyRoom = isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');

    const nameEl = document.getElementById('form-selected-room-name');
    const metaEl = document.getElementById('form-selected-room-meta');
    const idEl = document.getElementById('form-room-id');
    const imgEl = document.getElementById('form-room-preview-img');
    const deptTagEl = document.getElementById('form-room-dept-tag');
    const capBadgeEl = document.getElementById('form-room-capacity-badge');
    const roomSelect = document.getElementById('form-room-select');

    if (nameEl) nameEl.innerText = room.name;
    if (metaEl) metaEl.innerText = `${room.floor.split('(')[0].trim()} • ${room.capacity} seats`;
    if (idEl) idEl.value = room.id;
    if (imgEl) imgEl.src = room.image;
    if (deptTagEl) {
      deptTagEl.innerText = `${room.floor.split('(')[0].trim()} • ${room.category} ${isPrivate ? (isMyRoom ? '(Your Private Room)' : `(Owner: ${room.roomOwner?.name || 'Executive'})`) : ''}`;
    }
    if (capBadgeEl) capBadgeEl.innerText = `${room.capacity} Seats`;
    if (roomSelect && roomSelect.value !== room.id) roomSelect.value = room.id;

    // Top Room Details Hero Card (Step 1 inspiration)
    const heroImg = document.getElementById('form-room-hero-img');
    const heroTitle = document.getElementById('form-room-hero-title');
    const heroMeta = document.getElementById('form-room-hero-meta');
    const heroAmenities = document.getElementById('form-room-hero-amenities');

    if (heroImg && room.image) heroImg.src = room.image;
    if (heroTitle) heroTitle.innerText = room.name;
    if (heroMeta) {
      const floorClean = (room.floor || 'Level 1').replace(/\(Floor \d+\)/, '').replace(/\s*-\s*/, ' • ').trim();
      heroMeta.innerText = `${floorClean} • ${room.capacity || 20} seats`;
    }
    if (heroAmenities) {
      heroAmenities.innerHTML = `
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F5F2EE] text-[#3E2B1E] border border-[#E9E3DD]">${isPrivate ? (isMyRoom ? 'Your Room' : 'Private') : 'Standard'}</span>
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
          <span class="iconify text-stone-400 text-xs" data-icon="lucide:projector" data-stroke-width="2"></span>
          <span>Projector</span>
        </span>
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
          <span class="iconify text-stone-400 text-xs" data-icon="lucide:video" data-stroke-width="2"></span>
          <span>Video Conference</span>
        </span>
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
          <span class="iconify text-stone-400 text-xs" data-icon="lucide:presentation" data-stroke-width="2"></span>
          <span>Whiteboard</span>
        </span>
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-stone-600 border border-[#E9E3DD]">
          <span class="iconify text-stone-400 text-xs" data-icon="lucide:wifi" data-stroke-width="2"></span>
          <span>Wi-Fi</span>
        </span>
      `;
    }

    // Right-hand Booking Basket Cart Room Preview
    const cartNameEl = document.getElementById('cart-room-name');
    const cartMetaEl = document.getElementById('cart-room-meta');
    const cartImgEl = document.getElementById('cart-room-img');
    const cartBadgeEl = document.getElementById('cart-room-badge');
    if (cartNameEl) cartNameEl.innerText = room.name;
    if (cartMetaEl) cartMetaEl.innerText = `${room.floor.split('(')[0].trim()} • ${room.capacity} seats`;
    if (cartImgEl) cartImgEl.src = room.image;
    if (cartBadgeEl) {
      cartBadgeEl.innerText = isPrivate ? (isMyRoom ? 'Your Room' : 'Private') : 'Standard';
      cartBadgeEl.className = isPrivate 
        ? 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0'
        : 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-200/80 text-stone-700 shrink-0';
    }

    // Toggle private justification textarea group (only required when requesting someone else's room)
    const pvtJustGroup = document.getElementById('form-private-justification-group');
    const pvtJustTextarea = document.getElementById('form-private-justification');
    if (pvtJustGroup) {
      pvtJustGroup.classList.toggle('hidden', !isPrivate || isMyRoom);
    }
    if (pvtJustTextarea) {
      pvtJustTextarea.required = isPrivate && !isMyRoom;
      if (isPrivate && !isMyRoom && !pvtJustTextarea.value) {
        pvtJustTextarea.value = "All standard meeting rooms are occupied today. Confidential executive session required.";
      }
    }

    // Header room owner badge
    const headerOwnerBadge = document.getElementById('form-header-owner-badge');
    if (headerOwnerBadge) {
      if (isPrivate && room.roomOwner) {
        headerOwnerBadge.classList.remove('hidden');
        headerOwnerBadge.classList.add('flex');
        const avatarEl = document.getElementById('form-header-owner-avatar');
        const nameEl = document.getElementById('form-header-owner-name');
        const youEl = document.getElementById('form-header-owner-you');
        if (avatarEl) avatarEl.src = room.roomOwner.avatar || room.image;
        if (nameEl) nameEl.innerText = room.roomOwner.name;
        if (youEl) youEl.classList.toggle('hidden', !isMyRoom);
      } else {
        headerOwnerBadge.classList.add('hidden');
        headerOwnerBadge.classList.remove('flex');
      }
    }
  }

  selectRoomAndProceed(roomId, fromView = 'book-room', targetDate = null, startTime = null, endTime = null, options = {}) {
    this.bookingFormFromView = fromView;
    this.navigateTo('request-form', { roomId, date: targetDate, startTime, endTime, fromView, ...options });
  }

  startFromTimelineSelection({ roomId, date, startTime, endTime, meetingTitle }) {
    this.bookingFormFromView = 'book-room';
    this.navigateTo('request-form', { roomId, date, startTime, endTime, meetingTitle });
  }

  // ==================== STEP 1 SCHEDULE CALENDAR LOGIC ====================

  mountStep1Calendar(roomId, dateString) {
    const calendarEl = document.getElementById('booking-step-timeline-calendar');
    if (!calendarEl) return;

    if (typeof FullCalendar === 'undefined') {
      setTimeout(() => this.mountStep1Calendar(roomId, dateString), 200);
      return;
    }

    if (this.step1Calendar) {
      try {
        this.step1Calendar.destroy();
      } catch (e) {}
      this.step1Calendar = null;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const initialScrollTime = (dateString === todayStr && now.getHours() >= 8)
      ? `${String(Math.min(15, Math.max(7, now.getHours() - 1))).padStart(2, '0')}:00:00`
      : '07:00:00';
    const events = (typeof bookingStore !== 'undefined')
      ? bookingStore.getRoomFullCalendarEvents(roomId, dateString)
      : [];

    const isMobile = window.innerWidth < 768;
    const defaultView = isMobile ? 'timeGridDay' : 'timeGridWeek';

    this.step1Calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: defaultView,
      initialDate: dateString || todayStr,
      headerToolbar: false,
      firstDay: 1, // Monday start (NBC / Cambodia operational standard)
      navLinks: true,
      navLinkDayClick: (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        this.switchStep1CalendarView('timeGridDay', dateStr);
      },
      dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
      dayHeaderContent: (arg) => {
        const d = arg.date;
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        const isToday = arg.isToday;
        return {
          html: `
            <div class="flex flex-col items-center py-0.5 leading-tight select-none">
              <span class="text-xs ${isToday ? 'font-bold text-[#991B1B]' : 'font-semibold text-stone-700'}">${weekday}</span>
              <span class="text-[11px] ${isToday ? 'font-bold text-[#991B1B]' : 'font-medium text-stone-400'} mt-0.5 font-sans">${month} ${day}</span>
            </div>
          `
        };
      },
      allDaySlot: false,
      slotMinTime: '07:00:00',
      slotMaxTime: '18:00:00',
      slotDuration: '00:30:00',
      slotLabelInterval: '01:00',
      scrollTime: initialScrollTime,
      scrollTimeReset: false,
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      expandRows: true,
      nowIndicator: true,
      slotEventOverlap: false,
      eventOverlap: false,
      height: 480,
      selectable: true,
      selectMirror: true,
      unselectAuto: false,
      unselectCancel: '#booking-step-1, input, textarea, button, select, .bank-input, #form-meeting-title',
      selectLongPressDelay: 100,
      editable: true,
      eventStartEditable: true,
      eventDurationEditable: true,
      dragRevertDuration: 200,
      datesSet: (dateInfo) => {
        this.updateStep1CalendarToolbar(dateInfo);
      },
      unselect: () => {
        if (this.slotSelectionMode === 'multi') return;
        if (this.selectedTimelineSlot) {
          setTimeout(() => this.ensureStep1SlotSelected(), 10);
        }
      },
      selectAllow: (selectInfo) => {
        if (selectInfo.start < new Date()) return false;
        // Strictly prevent multi-day cross-column selection
        const startDay = `${selectInfo.start.getFullYear()}-${String(selectInfo.start.getMonth() + 1).padStart(2, '0')}-${String(selectInfo.start.getDate()).padStart(2, '0')}`;
        const endDayObj = new Date(selectInfo.end.getTime() - 1);
        const endDay = `${endDayObj.getFullYear()}-${String(endDayObj.getMonth() + 1).padStart(2, '0')}-${String(endDayObj.getDate()).padStart(2, '0')}`;
        return startDay === endDay;
      },
      events: events,
      eventClassNames: (arg) => {
        if (arg.isMirror) return ['fc-event-mirror-slot'];
        if (arg.event.extendedProps && arg.event.extendedProps.isUserSelection) {
          return ['fc-event-selected-slot', 'fc-user-multi-slot'];
        }
        return [];
      },
      eventContent: (arg) => {
        if (arg.event.display === 'background') return null;

        // Selection Mirror: strictly NO text during active dragging/selection
        if (arg.isMirror) {
          return {
            html: '<div class="h-full w-full select-none pointer-events-none"></div>'
          };
        }

        const props = arg.event.extendedProps || {};

        let durationMins = 30;
        if (arg.event.start && arg.event.end) {
          durationMins = Math.round((arg.event.end.getTime() - arg.event.start.getTime()) / 60000);
        } else if (props.startTime && props.endTime) {
          const [sH, sM] = props.startTime.split(':').map(Number);
          const [eH, eM] = props.endTime.split(':').map(Number);
          durationMins = (eH * 60 + eM) - (sH * 60 + sM);
        } else if (this.selectedTimelineSlot && this.selectedTimelineSlot.startTime && this.selectedTimelineSlot.endTime) {
          const [sH, sM] = this.selectedTimelineSlot.startTime.split(':').map(Number);
          const [eH, eM] = this.selectedTimelineSlot.endTime.split(':').map(Number);
          durationMins = (eH * 60 + eM) - (sH * 60 + sM);
        }

        // User Selected Slot: Clean & Minimal, strictly adhering to GEMINI.md tokens and reference design
        if (props.isUserSelection) {
          let timeText = '';
          if (props.startTime && props.endTime) {
            timeText = `${props.startTime} – ${props.endTime}`;
          } else if (arg.event.start && arg.event.end) {
            const pad = (n) => String(n).padStart(2, '0');
            const sStr = `${pad(arg.event.start.getHours())}:${pad(arg.event.start.getMinutes())}`;
            const eStr = `${pad(arg.event.end.getHours())}:${pad(arg.event.end.getMinutes())}`;
            timeText = `${sStr} – ${eStr}`;
          } else {
            timeText = arg.timeText || '';
          }

          // When 30 mins selection: make the data show ONLY time range that is it
          if (durationMins <= 30) {
            return {
              html: `
                <div class="h-full w-full flex items-center justify-center px-1 py-0.5 select-none overflow-hidden text-center cursor-grab active:cursor-grabbing" title="Drag to move • Drag bottom to resize • Click to remove">
                  <span class="font-mono text-[11px] sm:text-[12px] font-semibold text-white tracking-tight leading-none whitespace-nowrap" style="font-family: 'JetBrains Mono', monospace;">
                    ${timeText}
                  </span>
                </div>
              `
            };
          }

          const title = props.meetingTitle
            || document.getElementById('form-meeting-title')?.value.trim()
            || (this.selectedRoomForBooking?.name ? (this.selectedRoomForBooking.name.includes('-') ? this.selectedRoomForBooking.name.split('-')[1].trim() : this.selectedRoomForBooking.name) : 'Calypso');

          const attendees = props.attendees
            || document.getElementById('form-attendees')?.value
            || (this.selectedRoomForBooking?.capacity ? Math.min(8, this.selectedRoomForBooking.capacity) : 8);

          const isShortSlot = durationMins <= 45;

          if (isShortSlot) {
            return {
              html: `
                <div class="h-full w-full flex items-center justify-between px-1.5 py-0.5 select-none overflow-hidden text-white leading-tight cursor-grab active:cursor-grabbing" title="Drag to move • Drag bottom to resize • Click to remove">
                  <span class="font-mono text-[10px] sm:text-[11px] font-semibold text-white tracking-tight leading-none whitespace-nowrap" style="font-family: 'JetBrains Mono', monospace;">
                    ${timeText}
                  </span>
                  <span class="font-heading font-semibold text-xs text-white truncate drop-shadow-2xs ml-1 flex-1" style="font-family: 'Poppins', sans-serif;">
                    ${title}
                  </span>
                  <span class="text-white/70 text-[9px] tracking-widest shrink-0 ml-1 select-none">...</span>
                </div>
              `
            };
          }

          return {
            html: `
              <div class="h-full w-full flex flex-col justify-between p-1.5 sm:p-2 select-none overflow-hidden leading-tight text-white cursor-grab active:cursor-grabbing" title="Drag to move • Drag bottom to resize • Click to remove">
                <div>
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-mono text-[10px] sm:text-[11px] font-semibold text-white tracking-tight leading-none whitespace-nowrap" style="font-family: 'JetBrains Mono', monospace;">
                      ${timeText}
                    </span>
                    <span class="text-white/70 text-[9px] tracking-widest select-none shrink-0">...</span>
                  </div>
                  <div class="font-heading font-semibold text-xs sm:text-[13px] text-white truncate drop-shadow-2xs mt-1" style="font-family: 'Poppins', sans-serif;">
                    ${title}
                  </div>
                </div>
                <div class="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-white/90 pt-1 mt-auto">
                  <span class="iconify text-xs shrink-0 text-white" data-icon="lucide:user" data-stroke-width="2"></span>
                  <span class="font-mono font-medium text-white leading-none" style="font-family: 'JetBrains Mono', monospace;">${attendees}</span>
                </div>
              </div>
            `
          };
        }

        const isPrivate = !!props.isPrivate;
        const timeText = (props.startTime && props.endTime) 
          ? `${props.startTime} – ${props.endTime}` 
          : arg.timeText;
        const title = arg.event.title || 'Reserved Meeting';
        const organizer = props.requesterName;
        const dept = props.requesterDept;
        const isShortSlot = durationMins <= 45;

        if (durationMins <= 30) {
          return {
            html: `
              <div class="h-full w-full flex items-center justify-center px-1.5 py-0.5 select-none overflow-hidden text-center">
                <span class="font-mono text-[11px] font-bold text-stone-200 tracking-tight leading-none whitespace-nowrap" style="font-family: 'JetBrains Mono', monospace;">
                  ${timeText}
                </span>
              </div>
            `
          };
        }

        if (isShortSlot) {
          return {
            html: `
              <div class="h-full w-full flex items-center justify-between px-2 py-0.5 select-none overflow-hidden font-sans text-white leading-tight">
                <span class="font-mono text-[11px] font-bold text-stone-200 truncate">
                  ${timeText}
                </span>
                <span class="font-heading font-semibold text-xs text-white truncate drop-shadow-xs ml-1.5 flex-1">
                  ${title}
                </span>
                <span class="text-stone-300 font-sans tracking-widest text-[9px] shrink-0 ml-1">...</span>
              </div>
            `
          };
        }

        return {
          html: `
            <div class="h-full w-full flex flex-col justify-between p-2 select-none overflow-hidden leading-tight font-sans text-white">
              <div>
                <div class="flex items-center justify-between text-[11px] font-mono font-bold text-stone-200">
                  <span>${timeText}</span>
                  <span class="text-stone-300 font-sans tracking-widest text-[10px]">...</span>
                </div>
                <div class="font-heading font-bold text-xs sm:text-[13px] text-white line-clamp-1 leading-snug drop-shadow-xs mt-0.5">
                  ${title}
                </div>
              </div>
              <div class="flex items-center space-x-1.5 text-[10px] text-stone-300 pt-1 mt-auto truncate">
                <span class="iconify text-xs shrink-0 text-stone-200" data-icon="lucide:user" data-stroke-width="2"></span>
                <span class="truncate font-medium text-stone-200">${organizer || '6'}</span>
              </div>
            </div>
          `
        };
      },
      select: (info) => {
        if (Date.now() - (this.justDeselected || 0) < 400) {
          if (this.step1Calendar) this.step1Calendar.unselect();
          return;
        }

        if (info.start < new Date()) {
          this.showToast("Time Has Passed", "You cannot book past time slots.", "warning");
          if (this.step1Calendar) this.step1Calendar.unselect();
          return;
        }

        const startDateStr = info.startStr.substring(0, 10);
        const endDateStr = info.endStr.substring(0, 10);
        const startTime = info.startStr.substring(11, 16);
        let endTime = info.endStr.substring(11, 16);

        // Clamping to same-day: a single session cannot span multiple days
        if (startDateStr !== endDateStr) {
          endTime = '18:00';
        }

        // Validate that start < end
        if (startTime >= endTime) {
          if (this.step1Calendar) this.step1Calendar.unselect();
          return;
        }

        this.addOrToggleSession(startDateStr, startTime, endTime);
        if (this.step1Calendar) this.step1Calendar.unselect();
      },
      eventDrop: (info) => {
        this.lastDragEndTime = Date.now();
        if (!info.event.extendedProps?.isUserSelection) {
          info.revert();
          return;
        }

        const now = new Date();
        if (info.event.start < now) {
          this.showToast("Time Has Passed", "You cannot move sessions to past dates or times.", "warning");
          info.revert();
          return;
        }

        const startDateStr = info.event.startStr.substring(0, 10);
        const endDateObj = new Date(info.event.end.getTime() - 1);
        const endDateStr = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

        if (startDateStr !== endDateStr) {
          this.showToast("Same Day Only", "Sessions cannot span across multiple days.", "warning");
          info.revert();
          return;
        }

        const newDateStr = startDateStr;
        const newStartTime = info.event.startStr.substring(11, 16);
        const newEndTime = info.event.endStr.substring(11, 16);
        const roomId = document.getElementById('form-room-id')?.value;

        // Check building business hours (07:00 - 18:00)
        if (newStartTime < '07:00' || newEndTime > '18:00' || newStartTime >= newEndTime) {
          this.showToast("Outside Building Hours", "Sessions must be scheduled between 07:00 and 18:00.", "warning");
          info.revert();
          return;
        }

        // Check booking conflict with existing booked meetings
        if (typeof bookingStore !== 'undefined' && bookingStore.checkBookingConflict) {
          const conflictCheck = bookingStore.checkBookingConflict(roomId, newDateStr, newStartTime, newEndTime);
          if (conflictCheck.hasConflict) {
            this.showToast("Slot Conflict", conflictCheck.message || "This slot conflicts with another reserved meeting.", "warning");
            info.revert();
            return;
          }
        }

        const oldDate = info.event.extendedProps.date;
        const oldStart = info.event.extendedProps.startTime;
        const oldEnd = info.event.extendedProps.endTime;

        const sessionIdx = this.selectedSessions.findIndex(s => s.date === oldDate && s.startTime === oldStart && s.endTime === oldEnd);
        if (sessionIdx !== -1) {
          this.selectedSessions[sessionIdx] = {
            roomId,
            date: newDateStr,
            startTime: newStartTime,
            endTime: newEndTime
          };
          this.selectedSessions = this.mergeContiguousSessions(this.selectedSessions);
          setTimeout(() => {
            this.renderMultiSlotCalendarHighlights();
            this.renderSelectedSessionsTray();
          }, 0);
          this.showToast("Session Moved", `Moved to ${newDateStr} (${newStartTime} – ${newEndTime})`, "success");
        } else {
          info.revert();
        }
      },
      eventResize: (info) => {
        this.lastDragEndTime = Date.now();
        if (!info.event.extendedProps?.isUserSelection) {
          info.revert();
          return;
        }

        const startDateStr = info.event.startStr.substring(0, 10);
        const endDateObj = new Date(info.event.end.getTime() - 1);
        const endDateStr = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

        if (startDateStr !== endDateStr) {
          this.showToast("Same Day Only", "A session cannot span across multiple days.", "warning");
          info.revert();
          return;
        }

        const newDateStr = startDateStr;
        const newStartTime = info.event.startStr.substring(11, 16);
        const newEndTime = info.event.endStr.substring(11, 16);
        const roomId = document.getElementById('form-room-id')?.value;

        const [sH, sM] = newStartTime.split(':').map(Number);
        const [eH, eM] = newEndTime.split(':').map(Number);
        const diffM = (eH * 60 + eM) - (sH * 60 + sM);
        if (diffM < 15 || newStartTime >= newEndTime) {
          this.showToast("Duration Too Short", "Meeting sessions must be at least 15 minutes.", "warning");
          info.revert();
          return;
        }

        if (newEndTime > '18:00' || newStartTime < '07:00') {
          this.showToast("Outside Building Hours", "Meeting sessions cannot extend past 18:00.", "warning");
          info.revert();
          return;
        }

        if (typeof bookingStore !== 'undefined' && bookingStore.checkBookingConflict) {
          const conflictCheck = bookingStore.checkBookingConflict(roomId, newDateStr, newStartTime, newEndTime);
          if (conflictCheck.hasConflict) {
            this.showToast("Slot Conflict", conflictCheck.message || "Extended duration conflicts with another meeting.", "warning");
            info.revert();
            return;
          }
        }

        const oldDate = info.event.extendedProps.date;
        const oldStart = info.event.extendedProps.startTime;
        const oldEnd = info.event.extendedProps.endTime;

        const sessionIdx = this.selectedSessions.findIndex(s => s.date === oldDate && s.startTime === oldStart && s.endTime === oldEnd);
        if (sessionIdx !== -1) {
          this.selectedSessions[sessionIdx] = {
            roomId,
            date: newDateStr,
            startTime: newStartTime,
            endTime: newEndTime
          };
          this.selectedSessions = this.mergeContiguousSessions(this.selectedSessions);
          setTimeout(() => {
            this.renderMultiSlotCalendarHighlights();
            this.renderSelectedSessionsTray();
          }, 0);
          const hrs = Math.floor(diffM / 60);
          const mins = diffM % 60;
          let durStr = '';
          if (hrs > 0) durStr += `${hrs}h`;
          if (mins > 0) durStr += ` ${mins}m`;
          durStr = durStr.trim() || `${diffM}m`;
          this.showToast("Duration Updated", `${durStr} (${newStartTime} – ${newEndTime})`, "success");
        } else {
          info.revert();
        }
      },
      eventClick: (info) => {
        if (Date.now() - (this.lastDragEndTime || 0) < 300) return;
        if (info.event.display === 'background') return;

        // If clicking user's own multi-slot selection -> remove it
        if (info.event.extendedProps?.isUserSelection) {
          const p = info.event.extendedProps;
          this.removeSessionByDateTime(p.date, p.startTime, p.endTime);
          return;
        }

        const props = info.event.extendedProps || {};
        this.showToast(
          "Slot Already Booked", 
          `Reserved: ${props.meetingTitle || 'Meeting'} (${props.startTime} - ${props.endTime}). Please click an open slot.`,
          "warning"
        );
      }
    });

    this.step1Calendar.render();
    setTimeout(() => {
      if (this.step1Calendar && typeof this.step1Calendar.updateSize === 'function') this.step1Calendar.updateSize();
    }, 100);

    // Double-click on calendar grid, mirror, or highlight to deselect slot
    calendarEl.addEventListener('dblclick', (e) => {
      const bookedEl = e.target.closest('.fc-event-booked-public, .fc-event-booked-private');
      if (bookedEl && !bookedEl.classList.contains('fc-event-mirror') && !bookedEl.closest('.fc-event-mirror')) {
        return;
      }
      if (this.selectedTimelineSlot) {
        e.preventDefault();
        e.stopPropagation();
        this.resetStep1TimelineSelection(false);
      }
    });
  }

  switchStep1CalendarView(viewName, targetDate = null) {
    if (!this.step1Calendar) return;
    if (targetDate) {
      this.step1Calendar.changeView(viewName, targetDate);
      const dateInput = document.getElementById('form-date');
      if (dateInput) dateInput.value = targetDate;
    } else {
      this.step1Calendar.changeView(viewName);
    }
    setTimeout(() => {
      if (this.step1Calendar && typeof this.step1Calendar.updateSize === 'function') this.step1Calendar.updateSize();
      this.ensureStep1SlotSelected();
    }, 50);
  }

  changeStep1TimelineCalendar(delta) {
    if (!this.step1Calendar) return;
    if (delta > 0) {
      this.step1Calendar.next();
    } else {
      this.step1Calendar.prev();
    }
    const curDate = this.step1Calendar.getDate();
    const curDateStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
    const dateInput = document.getElementById('form-date');
    if (dateInput) dateInput.value = curDateStr;
  }

  updateStep1CalendarToolbar(dateInfo) {
    if (!dateInfo || !dateInfo.view) return;
    const viewType = dateInfo.view.type;
    const btnWeek = document.getElementById('step1-btn-view-week');
    const btnDay = document.getElementById('step1-btn-view-day');
    const titleEl = document.getElementById('step1-calendar-title');
    const dateInput = document.getElementById('form-date');
    const hintEl = document.getElementById('step1-legend-hint');

    if (viewType === 'timeGridWeek') {
      if (btnWeek) {
        btnWeek.className = 'px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#991B1B] shadow-xs transition cursor-pointer flex items-center space-x-1';
      }
      if (btnDay) {
        btnDay.className = 'px-3 py-1 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer flex items-center space-x-1';
      }
      if (hintEl) {
        hintEl.innerText = 'Mon – Sun (Click day header to zoom)';
      }

      // Compute week date range cleanly
      const s = dateInfo.start;
      const e = new Date(dateInfo.end.getTime() - 86400000); // end is exclusive in FullCalendar
      const sMonth = s.toLocaleString('en-US', { month: 'short' });
      const eMonth = e.toLocaleString('en-US', { month: 'short' });
      const sDay = String(s.getDate()).padStart(2, '0');
      const eDay = String(e.getDate()).padStart(2, '0');
      const year = s.getFullYear();

      const rangeStr = sMonth === eMonth
        ? `${sDay} – ${eDay} ${sMonth} ${year}`
        : `${sDay} ${sMonth} – ${eDay} ${eMonth} ${year}`;

      if (titleEl) titleEl.innerText = rangeStr;

      // Keep date input synced if out of bounds
      if (dateInput) {
        const curVal = dateInput.value;
        if (!curVal || new Date(curVal + 'T12:00:00') < s || new Date(curVal + 'T12:00:00') > e) {
          const sDateStr = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
          dateInput.value = sDateStr;
        }
      }
    } else {
      if (btnDay) {
        btnDay.className = 'px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#991B1B] shadow-xs transition cursor-pointer flex items-center space-x-1';
      }
      if (btnWeek) {
        btnWeek.className = 'px-3 py-1 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer flex items-center space-x-1';
      }
      if (hintEl) {
        hintEl.innerText = 'Day View (Switch to Week for 7 days)';
      }

      const activeDate = dateInfo.start;
      const formattedDay = activeDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (titleEl) titleEl.innerText = formattedDay;

      const dStr = `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, '0')}-${String(activeDate.getDate()).padStart(2, '0')}`;
      if (dateInput) dateInput.value = dStr;
    }
  }

  reloadStep1CalendarEvents() {
    if (!this.step1Calendar) return;
    const roomId = document.getElementById('form-room-id')?.value;
    const dateInput = document.getElementById('form-date');
    const dateVal = dateInput ? dateInput.value : null;
    if (!roomId) return;

    this.step1Calendar.removeAllEvents();
    if (typeof bookingStore !== 'undefined') {
      const events = bookingStore.getRoomFullCalendarEvents(roomId, dateVal);
      this.step1Calendar.addEventSource(events);
    }

    if (this.slotSelectionMode === 'multi') {
      this.renderMultiSlotCalendarHighlights();
    } else {
      this.ensureStep1SlotSelected();
    }
  }

  handleStep1DateChange(newDate) {
    if (!newDate || !this.step1Calendar) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (newDate < todayStr) {
      this.showToast("Past Date", "Please pick today or a future date.", "warning");
      newDate = todayStr;
      const dateInput = document.getElementById('form-date');
      if (dateInput) dateInput.value = todayStr;
    }

    this.step1Calendar.gotoDate(newDate);
    this.reloadStep1CalendarEvents();
  }

  setStep1TimelineDateToToday() {
    if (this.step1Calendar) {
      this.step1Calendar.today();
    }
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateInput = document.getElementById('form-date');
    if (dateInput) dateInput.value = todayStr;
    this.reloadStep1CalendarEvents();
  }

  changeStep1TimelineDate(deltaDays) {
    this.changeStep1TimelineCalendar(deltaDays > 0 ? 1 : -1);
  }

  resetStep1TimelineSelection(notify = false) {
    this.justDeselected = Date.now();
    this.selectedTimelineSlot = null;
    const timeDisplay = document.getElementById('step1-selected-slot-text');
    const container = document.getElementById('step1-slot-display-container');
    const deselectBtn = document.getElementById('step1-deselect-slot-btn');
    const iconBox = document.getElementById('step1-slot-icon-box');
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    const durationLabel = document.getElementById('calculated-duration-label');
    const durationBadge = document.getElementById('calculated-duration-badge');

    if (timeDisplay) {
      timeDisplay.innerText = "Click an open slot";
      timeDisplay.className = "text-[14px] font-medium text-stone-400 leading-none truncate";
    }
    if (deselectBtn) deselectBtn.classList.add('hidden');
    if (iconBox) {
      iconBox.className = 'w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shrink-0';
    }
    if (container) {
      container.className = 'h-10 inline-flex items-center space-x-3 transition select-none cursor-pointer shrink-0';
    }
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
    if (durationLabel) durationLabel.innerText = "";
    if (durationBadge) {
      durationBadge.classList.add('hidden');
    }
    if (this.step1Calendar) {
      this.step1Calendar.unselect();
    }
    const calendarEl = document.getElementById('booking-step-timeline-calendar');
    if (calendarEl) {
      calendarEl.querySelectorAll('.fc-highlight').forEach(el => el.remove());
    }
    this.selectedSessions = [];
    this.renderSelectedSessionsTray();
    this.renderMultiSlotCalendarHighlights();
  }

  setSelectedStep1Slot({ roomId, date, startTime, endTime }) {
    this.selectedTimelineSlot = { roomId, date, startTime, endTime };
    this.selectedSessions = [{ roomId, date, startTime, endTime }];
    const dateInput = document.getElementById('form-date');
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    if (dateInput && date) dateInput.value = date;
    if (startInput && startTime) startInput.value = startTime;
    if (endInput && endTime) endInput.value = endTime;

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const diffMins = (eH * 60 + eM) - (sH * 60 + sM);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    let durStr = '';
    if (hours > 0) durStr += `${hours} hr${hours > 1 ? 's' : ''}`;
    if (mins > 0) durStr += ` ${mins} min${mins > 1 ? 's' : ''}`;
    durStr = durStr.trim() || `${diffMins} mins`;

    const slotText = document.getElementById('step1-selected-slot-text');
    const container = document.getElementById('step1-slot-display-container');
    const deselectBtn = document.getElementById('step1-deselect-slot-btn');
    const iconBox = document.getElementById('step1-slot-icon-box');
    const durBadge = document.getElementById('calculated-duration-badge');
    const durLabel = document.getElementById('calculated-duration-label');

    const dateObj = new Date(date + 'T12:00:00');
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedDate = !isNaN(dateObj.getTime()) ? dayFormatter.format(dateObj) : date;

    if (slotText) {
      slotText.innerText = `${formattedDate} • ${startTime} – ${endTime}`;
      slotText.className = "text-[13px] sm:text-[14px] font-semibold text-stone-800 leading-none shrink-0";
    }
    if (durLabel) {
      durLabel.innerText = durStr;
    }
    if (durBadge) {
      durBadge.classList.remove('hidden');
      durBadge.className = 'inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-semibold leading-none shrink-0';
    }
    if (deselectBtn) {
      deselectBtn.classList.remove('hidden');
    }
    if (iconBox) {
      iconBox.className = 'w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0';
    }
    if (container) {
      container.className = 'h-10 inline-flex items-center space-x-3 transition select-none cursor-pointer shrink-0';
    }

    this.renderSelectedSessionsTray();
    this.renderMultiSlotCalendarHighlights();

    if (this.step1Calendar) {
      this.step1Calendar.unselect();
    }

    this.validateMeetingTimes();
  }

  ensureStep1SlotSelected() {
    if (this.step1Calendar && this.selectedSessions && this.selectedSessions.length > 0) {
      this.renderMultiSlotCalendarHighlights();
    }
  }

  handleStep1TimeInputChange() {
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    const dateInput = document.getElementById('form-date');
    const roomId = document.getElementById('form-room-id')?.value;

    const startVal = startInput ? startInput.value : '';
    const endVal = endInput ? endInput.value : '';
    const dateVal = dateInput ? dateInput.value : '';

    if (startVal && endVal && dateVal && roomId) {
      const val = this.validateMeetingTimes();
      if (val.valid) {
        this.setSelectedStep1Slot({
          roomId,
          date: dateVal,
          startTime: startVal,
          endTime: endVal
        });
        if (this.step1Calendar) {
          this.step1Calendar.select(`${dateVal}T${startVal}:00`, `${dateVal}T${endVal}:00`);
        }
      }
    }
  }

  handleMeetingTitleInput(value) {
    const mirrorTitleEl = document.querySelector('#booking-step-timeline-calendar .fc-event-mirror .modal-mirror-title');
    if (mirrorTitleEl) {
      mirrorTitleEl.innerText = value.trim() || 'Selected Meeting Slot';
    }
  }

  autoSelectFirstAvailableSlot(roomId, dateString) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let startHour = 9;

    if (dateString === todayStr) {
      startHour = now.getHours() + 1;
      if (startHour < 7) startHour = 7;
      if (startHour >= 18) return; // Closed for today
    } else {
      startHour = 7;
    }

    for (let h = startHour; h < 18; h++) {
      const candidateStart = `${String(h).padStart(2, '0')}:00`;
      const candidateEnd = `${String(h + 1).padStart(2, '0')}:00`;

      const isAvail = (typeof bookingStore !== 'undefined' && bookingStore.checkBookingConflict)
        ? !bookingStore.checkBookingConflict(roomId, dateString, candidateStart, candidateEnd).hasConflict
        : true;

      if (isAvail) {
        this.setSelectedStep1Slot({
          roomId,
          date: dateString,
          startTime: candidateStart,
          endTime: candidateEnd
        });
        if (this.step1Calendar) {
          this.step1Calendar.select(`${dateString}T${candidateStart}:00`, `${dateString}T${candidateEnd}:00`);
          setTimeout(() => {
            const calendarEl = document.getElementById('booking-step-timeline-calendar');
            if (calendarEl && typeof calendarEl.querySelector === 'function') {
              const targetSlotEl = calendarEl.querySelector(`[data-time="${candidateStart}:00"]`);
              if (targetSlotEl && typeof targetSlotEl.scrollIntoView === 'function') {
                targetSlotEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }
          }, 100);
        }
        break;
      }
    }
  }

  // ==================== MULTI-SLOT SELECTION SYSTEM ====================

  handleMultiSlotTickToggle(isChecked) {
    this.setSlotSelectionMode(isChecked ? 'multi' : 'single');
  }

  setSlotSelectionMode(mode, silent = false) {
    this.slotSelectionMode = mode;

    const toggleCheckbox = document.getElementById('step1-toggle-multi-slot');
    const tickContainer = document.getElementById('step1-multi-slot-tick-container');
    const tickBox = document.getElementById('step1-multi-tick-box');
    const tickIcon = document.getElementById('step1-multi-tick-icon');
    const tickLabel = document.getElementById('step1-multi-tick-label');

    const btnSingle = document.getElementById('step1-btn-slot-single');
    const btnMulti = document.getElementById('step1-btn-slot-multi');
    const modeHint = document.getElementById('step1-slot-mode-hint');
    const calendarEl = document.getElementById('booking-step-timeline-calendar');

    if (toggleCheckbox) {
      toggleCheckbox.checked = (mode === 'multi');
    }

    if (mode === 'multi') {
      if (tickContainer) {
        tickContainer.className = 'flex items-center space-x-2 bg-emerald-950/60 hover:bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-500/70 shadow-xs ring-1 ring-emerald-500/40 transition cursor-pointer select-none group';
      }
      if (tickBox) {
        tickBox.className = 'w-4 h-4 rounded border border-emerald-400 bg-emerald-600 flex items-center justify-center transition shadow-2xs';
      }
      if (tickIcon) {
        tickIcon.classList.remove('opacity-0');
        tickIcon.classList.add('opacity-100');
      }
      if (tickLabel) {
        tickLabel.className = 'text-[11px] font-semibold text-emerald-300 transition tracking-tight flex items-center space-x-1';
      }

      if (btnMulti) btnMulti.className = 'px-2.5 py-0.5 rounded text-[11px] font-semibold text-white bg-stone-700 shadow-xs transition cursor-pointer flex items-center space-x-1';
      if (btnSingle) btnSingle.className = 'px-2.5 py-0.5 rounded text-[11px] font-medium text-stone-400 hover:text-stone-200 transition cursor-pointer flex items-center space-x-1';
      if (modeHint) modeHint.innerText = '• Click open slots across the week to batch book';

      if (!silent && typeof anime !== 'undefined' && tickBox) {
        anime({ targets: tickBox, scale: [0.94, 1], duration: 160, easing: 'easeOutQuad' });
      }

      if (calendarEl) {
        calendarEl.classList.add('fc-multi-mode');
        calendarEl.querySelectorAll('.fc-highlight, .fc-event-mirror').forEach(el => el.remove());
      }

      // Explicitly unselect FullCalendar single selection
      if (this.step1Calendar && typeof this.step1Calendar.unselect === 'function') {
        this.step1Calendar.unselect();
      }

      // Hide any single-slot time validation error banner
      const errorBanner = document.getElementById('time-validation-error');
      if (errorBanner) errorBanner.classList.add('hidden');

      // Migrate single selection if exists
      if (this.selectedTimelineSlot && this.selectedTimelineSlot.startTime && this.selectedTimelineSlot.endTime) {
        if (this.selectedSessions.length === 0) {
          this.selectedSessions.push({ ...this.selectedTimelineSlot });
        }
        this.selectedTimelineSlot = null;
      }
      this.renderSelectedSessionsTray();
      this.renderMultiSlotCalendarHighlights();
      this.updateMultiBadge();
      if (!silent) {
        this.showToast("Multi-Slot Mode Active", "Click open slots on any day across the week to add sessions.", "info");
      }
    } else {
      if (tickContainer) {
        tickContainer.className = 'flex items-center space-x-2 bg-stone-800/90 hover:bg-stone-750 px-2.5 py-1 rounded-md border border-stone-700/80 shadow-2xs transition cursor-pointer select-none group';
      }
      if (tickBox) {
        tickBox.className = 'w-4 h-4 rounded border border-stone-500 bg-stone-900 group-hover:border-emerald-400 flex items-center justify-center transition shadow-2xs';
      }
      if (tickIcon) {
        tickIcon.classList.remove('opacity-100');
        tickIcon.classList.add('opacity-0');
      }
      if (tickLabel) {
        tickLabel.className = 'text-[11px] font-medium text-stone-300 group-hover:text-white transition tracking-tight flex items-center space-x-1';
      }

      if (btnSingle) btnSingle.className = 'px-2.5 py-0.5 rounded text-[11px] font-semibold text-white bg-stone-700 shadow-xs transition cursor-pointer flex items-center space-x-1';
      if (btnMulti) btnMulti.className = 'px-2.5 py-0.5 rounded text-[11px] font-medium text-stone-400 hover:text-stone-200 transition cursor-pointer flex items-center space-x-1';
      if (modeHint) modeHint.innerText = '• Click or drag an open slot to book';

      if (!silent && typeof anime !== 'undefined' && tickBox) {
        anime({ targets: tickBox, scale: [0.94, 1], duration: 160, easing: 'easeOutQuad' });
      }

      if (calendarEl) {
        calendarEl.classList.remove('fc-multi-mode');
      }

      if (this.step1Calendar) {
        this.step1Calendar.getEvents().forEach(evt => {
          if (evt.extendedProps?.isUserSelection) evt.remove();
        });
      }

      if (this.selectedSessions.length > 0) {
        const latest = this.selectedSessions[this.selectedSessions.length - 1];
        const count = this.selectedSessions.length;
        const roomId = document.getElementById('form-room-id')?.value;
        this.selectedSessions = [{ roomId, date: latest.date, startTime: latest.startTime, endTime: latest.endTime }];
        this.selectedTimelineSlot = { roomId, date: latest.date, startTime: latest.startTime, endTime: latest.endTime };
        const dateInput = document.getElementById('form-date');
        const startInput = document.getElementById('form-start-time');
        const endInput = document.getElementById('form-end-time');
        if (dateInput && latest.date) dateInput.value = latest.date;
        if (startInput && latest.startTime) startInput.value = latest.startTime;
        if (endInput && latest.endTime) endInput.value = latest.endTime;

        if (this.step1Calendar && latest.date) {
          this.step1Calendar.gotoDate(latest.date);
          if (typeof this.step1Calendar.select === 'function') {
            this.step1Calendar.select(`${latest.date}T${latest.startTime}:00`, `${latest.date}T${latest.endTime}:00`);
          }
        }
        if (count > 1 && !silent) {
          this.showToast("Single Slot Mode", `Kept the most recent session (${latest.date} ${latest.startTime} – ${latest.endTime}).`, "info");
        }
      } else if (this.selectedTimelineSlot) {
        this.selectedSessions = [{ ...this.selectedTimelineSlot }];
        this.setSelectedStep1Slot(this.selectedSessions[0]);
      } else {
        this.selectedSessions = [];
        this.selectedTimelineSlot = null;
      }
      this.renderSelectedSessionsTray();
      this.updateMultiBadge();
    }
  }

  addOrToggleSession(date, startTime, endTime) {
    const roomId = document.getElementById('form-room-id')?.value;
    if (!roomId) return;

    // Check if past
    const now = new Date();
    const slotStart = new Date(`${date}T${startTime}:00`);
    if (slotStart < now) {
      this.showToast("Time Has Passed", "You cannot book past time slots.", "warning");
      return;
    }

    // Check conflict against already-booked meetings
    if (typeof bookingStore !== 'undefined' && bookingStore.checkBookingConflict) {
      const conflictCheck = bookingStore.checkBookingConflict(roomId, date, startTime, endTime);
      if (conflictCheck.hasConflict) {
        this.showToast("Slot Conflict", conflictCheck.message || `This slot conflicts with another meeting.`, "warning");
        return;
      }
    }

    // Check if exact same session already selected -> toggle off
    const existingIdx = this.selectedSessions.findIndex(s => s.date === date && s.startTime === startTime && s.endTime === endTime);
    if (existingIdx !== -1) {
      this.selectedSessions.splice(existingIdx, 1);
      this.renderMultiSlotCalendarHighlights();
      this.renderSelectedSessionsTray();
      this.showToast("Session Removed", `Removed ${date} (${startTime} – ${endTime})`, "info");
      return;
    }

    // Add and automatically merge contiguous/overlapping sessions
    this.selectedSessions.push({ roomId, date, startTime, endTime });
    this.selectedSessions = this.mergeContiguousSessions(this.selectedSessions);

    this.renderMultiSlotCalendarHighlights();
    this.renderSelectedSessionsTray();

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const diffM = (eH * 60 + eM) - (sH * 60 + sM);
    this.showToast("Session Added", `${date} • ${startTime} – ${endTime} (${diffM}m)`, "success");
  }

  removeSession(idx) {
    if (idx >= 0 && idx < this.selectedSessions.length) {
      const removed = this.selectedSessions.splice(idx, 1)[0];
      if (this.selectedSessions.length === 0) {
        this.resetStep1TimelineSelection(false);
      } else {
        this.renderMultiSlotCalendarHighlights();
        this.renderSelectedSessionsTray();
      }
      if (removed) {
        this.showToast("Session Removed", `Removed ${removed.date} (${removed.startTime} – ${removed.endTime})`, "info");
      }
    }
  }

  removeSessionByDateTime(date, startTime, endTime) {
    const idx = this.selectedSessions.findIndex(s => s.date === date && s.startTime === startTime && s.endTime === endTime);
    if (idx !== -1) {
      this.removeSession(idx);
    }
  }

  clearAllSessions() {
    this.selectedSessions = [];
    this.resetStep1TimelineSelection(false);
    this.showToast("Sessions Cleared", "All selected sessions removed.", "info");
  }

  mergeContiguousSessions(sessions) {
    if (!sessions || sessions.length <= 1) return sessions;

    const byDate = {};
    sessions.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = [];
      byDate[s.date].push({ ...s });
    });

    const merged = [];

    Object.keys(byDate).sort().forEach(date => {
      const daySessions = byDate[date];
      daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const dayMerged = [];
      for (const session of daySessions) {
        if (dayMerged.length === 0) {
          dayMerged.push(session);
        } else {
          const prev = dayMerged[dayMerged.length - 1];
          if (prev.endTime >= session.startTime) {
            if (session.endTime > prev.endTime) {
              prev.endTime = session.endTime;
            }
          } else {
            dayMerged.push(session);
          }
        }
      }
      merged.push(...dayMerged);
    });

    merged.sort((a, b) => {
      const dComp = a.date.localeCompare(b.date);
      return dComp !== 0 ? dComp : a.startTime.localeCompare(b.startTime);
    });

    return merged;
  }

  renderSelectedSessionsTray() {
    const listEl = document.getElementById('step1-multi-chips-list');
    const emptyHintEl = document.getElementById('step1-multi-empty-hint');
    const summaryEl = document.getElementById('step1-multi-total-summary');
    const trayTitleEl = document.getElementById('step1-tray-title');
    const clearBtn = document.getElementById('step1-clear-all-btn');
    const clearBtnLabel = document.getElementById('step1-clear-btn-label');
    const cartCountBadge = document.getElementById('step1-cart-count-badge');
    const sessionCountEl = document.getElementById('cart-summary-session-count');
    const totalDurEl = document.getElementById('cart-summary-total-duration');
    const checkoutBtn = document.getElementById('btn-cart-checkout');
    this.updateMultiBadge();

    // Synchronize form inputs with first session
    const dateInput = document.getElementById('form-date');
    const startInput = document.getElementById('form-start-time');
    const endInput = document.getElementById('form-end-time');
    if (this.selectedSessions.length > 0) {
      const first = this.selectedSessions[0];
      if (dateInput && first.date) dateInput.value = first.date;
      if (startInput && first.startTime) startInput.value = first.startTime;
      if (endInput && first.endTime) endInput.value = first.endTime;
    } else {
      if (startInput) startInput.value = '';
      if (endInput) endInput.value = '';
    }

    if (cartCountBadge) {
      cartCountBadge.innerText = this.selectedSessions.length;
    }

    if (trayTitleEl) {
      trayTitleEl.innerText = (this.selectedSessions.length > 1) ? 'Selected Sessions' : 'Selected Session';
    }

    if (clearBtnLabel) {
      clearBtnLabel.innerText = (this.selectedSessions.length > 1) ? 'Clear All' : 'Clear';
    }

    if (this.selectedSessions.length === 0) {
      if (listEl) {
        listEl.innerHTML = '';
        listEl.classList.add('hidden');
      }
      if (emptyHintEl) {
        emptyHintEl.classList.remove('hidden');
        const hintText = (this.slotSelectionMode === 'multi')
          ? 'Click open time slots on any day to add multiple sessions to this booking.'
          : 'Click or drag open time slots on the schedule to add sessions.';
        const hintTitle = (this.slotSelectionMode === 'multi')
          ? 'No sessions selected'
          : 'No session selected';
        emptyHintEl.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
            <span class="iconify text-lg" data-icon="lucide:calendar-plus"></span>
          </div>
          <div class="space-y-0.5">
            <div class="text-xs font-bold text-stone-700">${hintTitle}</div>
            <p id="step1-empty-hint-text" class="text-[11px] text-stone-400 max-w-[200px] leading-snug">${hintText}</p>
          </div>
        `;
      }
      if (summaryEl) {
        summaryEl.innerText = '0 Sessions • 0 mins';
        summaryEl.className = 'hidden';
      }
      if (sessionCountEl) sessionCountEl.innerText = '0 Sessions';
      if (totalDurEl) totalDurEl.innerText = '0 mins';
      if (clearBtn) clearBtn.classList.add('invisible');
      return;
    }

    if (clearBtn) clearBtn.classList.remove('invisible');
    if (emptyHintEl) emptyHintEl.classList.add('hidden');
    if (listEl) listEl.classList.remove('hidden');

    let totalMinutes = 0;
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (listEl) {
      listEl.innerHTML = this.selectedSessions.map((s, idx) => {
        const [sH, sM] = s.startTime.split(':').map(Number);
        const [eH, eM] = s.endTime.split(':').map(Number);
        const diffM = (eH * 60 + eM) - (sH * 60 + sM);
        totalMinutes += diffM;

        const hrs = Math.floor(diffM / 60);
        const mins = diffM % 60;
        let durStr = '';
        if (hrs > 0) durStr += `${hrs}h`;
        if (mins > 0) durStr += ` ${mins}m`;
        durStr = durStr.trim() || `${diffM}m`;

        let monthStr = 'SEP';
        let dayStr = '10';
        try {
          const dObj = new Date(s.date + 'T12:00:00');
          if (!isNaN(dObj.getTime())) {
            monthStr = dObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            dayStr = String(dObj.getDate());
          }
        } catch (_) {}

        const meetingTitle = document.getElementById('form-meeting-title')?.value.trim()
          || (this.selectedRoomForBooking?.name ? (this.selectedRoomForBooking.name.includes('-') ? this.selectedRoomForBooking.name.split('-')[1].trim() : this.selectedRoomForBooking.name) : 'Calypso');

        return `
          <div class="step1-cart-item p-3 rounded-xl bg-white border border-[#E9E3DD] shadow-2xs hover:border-amber-300 transition flex items-center justify-between gap-3 select-none group">
            <div class="text-center w-9 shrink-0">
              <span class="block text-[10px] font-semibold text-[#7D6857] tracking-wider uppercase font-sans">${monthStr}</span>
              <span class="block text-base font-bold text-[#3E2B1E] leading-tight font-heading">${dayStr}</span>
            </div>
            <div class="min-w-0 flex-1">
              <span class="block text-xs font-semibold text-[#3E2B1E] font-mono leading-tight" style="font-family: 'JetBrains Mono', monospace;">${s.startTime} &ndash; ${s.endTime}</span>
              <span class="block text-[11px] font-medium text-[#6F5849] truncate mt-0.5 font-sans">${meetingTitle}</span>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
              <span class="text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 rounded font-mono" style="font-family: 'JetBrains Mono', monospace;">${durStr}</span>
              <button type="button" onclick="app.removeSession(${idx})" class="w-6 h-6 rounded-md hover:bg-stone-100 text-stone-400 hover:text-[#991B1B] flex items-center justify-center transition cursor-pointer" title="Remove this session">
                <span class="iconify text-xs" data-icon="lucide:x" data-stroke-width="2"></span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (typeof anime !== 'undefined') {
        anime({
          targets: '#step1-multi-chips-list .step1-cart-item',
          opacity: [0, 1],
          scale: [0.95, 1],
          translateY: [4, 0],
          delay: anime.stagger(30),
          duration: 180,
          easing: 'easeOutQuad'
        });
      }
    }

    const totHours = Math.floor(totalMinutes / 60);
    const remMins = totalMinutes % 60;
    let totStr = '';
    if (totHours > 0) totStr += `${totHours} hr${totHours > 1 ? 's' : ''}`;
    if (remMins > 0) totStr += ` ${remMins} min${remMins > 1 ? 's' : ''}`;
    totStr = totStr.trim() || `${totalMinutes} mins`;

    if (sessionCountEl) {
      sessionCountEl.innerText = `${this.selectedSessions.length} Session${this.selectedSessions.length > 1 ? 's' : ''}`;
    }
    if (totalDurEl) {
      totalDurEl.innerText = totStr;
    }
    if (summaryEl) {
      summaryEl.innerText = `${this.selectedSessions.length} Session${this.selectedSessions.length > 1 ? 's' : ''} • ${totStr} total`;
    }
  }

  updateMultiBadge() {
    const badge = document.getElementById('step1-multi-badge');
    if (badge) {
      const count = this.selectedSessions.length;
      const prevCount = parseInt(badge.innerText, 10) || 0;
      badge.innerText = count;
      badge.classList.toggle('hidden', count === 0);
      if (count > 0 && count !== prevCount && typeof anime !== 'undefined') {
        anime({
          targets: badge,
          scale: [0.92, 1],
          duration: 180,
          easing: 'easeOutQuad'
        });
      }
    }
  }

  renderMultiSlotCalendarHighlights() {
    if (!this.step1Calendar) return;

    // Remove existing user-selection events
    this.step1Calendar.getEvents().forEach(evt => {
      if (evt.extendedProps?.isUserSelection) {
        evt.remove();
      }
    });

    if (typeof this.step1Calendar.unselect === 'function') {
      this.step1Calendar.unselect();
    }

    if (!this.selectedSessions || this.selectedSessions.length === 0) return;

    const meetingTitle = document.getElementById('form-meeting-title')?.value.trim()
      || (this.selectedRoomForBooking?.name ? (this.selectedRoomForBooking.name.includes('-') ? this.selectedRoomForBooking.name.split('-')[1].trim() : this.selectedRoomForBooking.name) : 'Calypso');
    const attendees = document.getElementById('form-attendees')?.value
      || (this.selectedRoomForBooking?.capacity ? Math.min(8, this.selectedRoomForBooking.capacity) : 8);

    this.selectedSessions.forEach((s, idx) => {
      if (typeof this.step1Calendar.addEvent === 'function') {
        this.step1Calendar.addEvent({
          id: `user-sel-${idx}-${Date.now()}`,
          title: meetingTitle,
          start: `${s.date}T${s.startTime}:00`,
          end: `${s.date}T${s.endTime}:00`,
          classNames: ['fc-event-selected-slot', 'fc-user-multi-slot'],
          editable: true,
          startEditable: true,
          durationEditable: true,
          extendedProps: {
            isUserSelection: true,
            meetingTitle,
            attendees,
            sessionIndex: idx,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime
          }
        });
      }
    });
  }

  navigateBackFromBookingForm() {
    if (this.bookingFormFromView === 'room-details' && this.selectedRoomForBooking) {
      this.navigateTo('room-details', { roomId: this.selectedRoomForBooking.id });
    } else {
      this.navigateTo(this.bookingFormFromView || 'book-room');
    }
  }

  // ==================== 4-STEP WIZARD NAVIGATION ====================

  bookingFormGoToStep(stepNumber) {
    if (stepNumber >= 2) {
      // Validate Step 1 first (Slot selection)
      if (this.slotSelectionMode === 'multi') {
        if (!this.selectedSessions || this.selectedSessions.length === 0) {
          this.showToast("Sessions Required", "Please click open time slots on the schedule to add at least one session.", "warning");
          return;
        }
      } else {
        if (!this.selectedTimelineSlot || !this.selectedTimelineSlot.startTime || !this.selectedTimelineSlot.endTime) {
          this.showToast("Time Slot Required", "Please click an open slot on the schedule before continuing.", "warning");
          return;
        }

        const timeValidation = this.validateMeetingTimes();
        if (!timeValidation.valid) {
          this.showToast("Invalid Schedule", timeValidation.message, "error");
          return;
        }
      }
    }

    if (stepNumber >= 3) {
      // Validate Step 2 (Meeting Details)
      const titleInput = document.getElementById('form-meeting-title');
      if (!titleInput || !titleInput.value.trim()) {
        this.showToast("Meeting Name Required", "Please enter a name for your meeting.", "error");
        titleInput?.focus();
        return;
      }

      const attendeesInput = document.getElementById('form-attendees');
      if (!attendeesInput || !attendeesInput.value || parseInt(attendeesInput.value, 10) < 1) {
        this.showToast("Attendees Required", "Please enter the number of expected attendees.", "error");
        attendeesInput?.focus();
        return;
      }

      const roomId = document.getElementById('form-room-id')?.value;
      const room = bookingStore.getRoomById(roomId);
      const isPrivate = !!room?.isPrivate;
      const isMyRoom = isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');

      if (isPrivate && !isMyRoom) {
        const justInput = document.getElementById('form-private-justification');
        if (!justInput || !justInput.value.trim()) {
          this.showToast("Reason Required", "Please write why you need this private room.", "error");
          justInput?.focus();
          return;
        }
      }
    }

    if (stepNumber === 3) {
      this.updateCateringUI();
      this.updateITUI();
    }

    if (stepNumber === 4) {
      this.updatePricingSummary();
    }

    this.currentStep = stepNumber;

    // Toggle Step Containers
    [1, 2, 3, 4].forEach(num => {
      const stepEl = document.getElementById(`booking-step-${num}`);
      const tabEl = document.getElementById(`wizard-tab-${num}`);
      if (stepEl) {
        stepEl.classList.toggle('hidden', num !== stepNumber);
      }
      if (tabEl) {
        const stepLabels = ['Time & Date', 'Purpose & Services', 'Layout & IT', 'Review & Confirm'];
        const labelSpan = tabEl.querySelector('span:last-child');
        const label = (labelSpan ? labelSpan.innerText : '').trim() || stepLabels[num - 1] || `Step ${num}`;
        if (num === stepNumber) {
          tabEl.className = 'wizard-step-tab active h-8 px-2.5 rounded-md bg-[#FEF2F2] border border-red-200 text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0';
          tabEl.innerHTML = `<span class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold">${num}</span><span>${label}</span>`;
        } else if (num < stepNumber) {
          tabEl.className = 'wizard-step-tab completed h-8 px-2.5 rounded-md bg-transparent border border-transparent text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50/50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0';
          tabEl.innerHTML = `<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold"><span class="iconify text-[10px]" data-icon="lucide:check" data-stroke-width="3"></span></span><span>${label}</span>`;
        } else {
          tabEl.className = 'wizard-step-tab h-8 px-2.5 rounded-md bg-transparent border border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0';
          tabEl.innerHTML = `<span class="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[11px] font-bold">${num}</span><span>${label}</span>`;
        }
      }
    });

    if (stepNumber === 1 && this.step1Calendar) {
      setTimeout(() => {
        if (typeof this.step1Calendar.updateSize === 'function') this.step1Calendar.updateSize();
        if (this.slotSelectionMode === 'multi') {
          this.renderMultiSlotCalendarHighlights();
          this.renderSelectedSessionsTray();
        } else {
          this.ensureStep1SlotSelected();
        }
      }, 60);
    }

    if (typeof window.scrollTo === 'function') {
      try { window.scrollTo(0, 0); } catch (_) {}
    }
  }

  bookingFormSkipAddons() {
    const cateringToggle = document.getElementById('catering-toggle');
    const itToggle = document.getElementById('it-toggle');

    if (cateringToggle) cateringToggle.checked = false;
    if (itToggle) itToggle.checked = false;

    this.handleCateringToggleChange();
    this.handleITToggleChange();

    this.showToast("Add-ons Skipped", "Proceeding with standard room setup.", "info");
    this.bookingFormGoToStep(4);
  }

  // ==================== ADD-ONS & SERVICE TOGGLES ====================

  handleCateringToggleChange() {
    const isChecked = document.getElementById('catering-toggle')?.checked;
    const panel = document.getElementById('catering-details-panel');
    const placeholder = document.getElementById('catering-off-placeholder');
    const label = document.getElementById('catering-toggle-label');

    if (label) {
      label.innerText = isChecked ? 'Active' : 'Off';
      label.className = isChecked ? 'text-xs font-semibold text-red-800' : 'text-xs font-medium text-stone-500';
    }
    if (panel) panel.classList.toggle('hidden', !isChecked);
    if (placeholder) placeholder.classList.toggle('hidden', !!isChecked);
    this.updatePricingSummary();
  }

  handleITToggleChange() {
    const isChecked = document.getElementById('it-toggle')?.checked;
    const panel = document.getElementById('it-details-panel');
    const placeholder = document.getElementById('it-off-placeholder');
    const label = document.getElementById('it-toggle-label');

    if (label) {
      label.innerText = isChecked ? 'Active' : 'Off';
      label.className = isChecked ? 'text-xs font-semibold text-red-800' : 'text-xs font-medium text-stone-500';
    }
    if (panel) panel.classList.toggle('hidden', !isChecked);
    if (placeholder) placeholder.classList.toggle('hidden', !!isChecked);
    this.updatePricingSummary();
  }

  // ==================== CATERING OPTIONS & SELECTION ====================

  goToCateringPage(pageIndex) {}
  prevCateringPage() {}
  nextCateringPage() {}
  updateCateringCarousel() {}

  selectCateringPackage(pkgId) {
    if (!this.selectedCateringPackageIds) {
      this.selectedCateringPackageIds = new Set(['cat-1']);
    }
    if (this.selectedCateringPackageIds.has(pkgId)) {
      this.selectedCateringPackageIds.delete(pkgId);
    } else {
      this.selectedCateringPackageIds.add(pkgId);
    }
    this.selectedCateringPackageId = Array.from(this.selectedCateringPackageIds)[0] || '';
    this.updateCateringUI();
    this.updatePricingSummary();
  }

  updateCateringUI() {
    const checkSvg = '<svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    const allCatIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7', 'cat-8', 'cat-9'];
    allCatIds.forEach(id => {
      const card = document.getElementById(`pkg-${id}`);
      if (!card) return;
      const isSelected = this.selectedCateringPackageIds && this.selectedCateringPackageIds.has(id);
      card.classList.toggle('selected', isSelected);
      if (isSelected) {
        card.classList.add('border-[#991B1B]', 'bg-[#FEF2F2]/40');
        card.classList.remove('border-red-700', 'bg-red-50/20', 'border-[#E9E3DD]', 'bg-white');
      } else {
        card.classList.remove('border-[#991B1B]', 'bg-[#FEF2F2]/40', 'border-red-700', 'bg-red-50/20');
        card.classList.add('border-[#E9E3DD]', 'bg-white');
      }
      const indicator = card.querySelector('.cat-indicator');
      if (indicator) {
        if (isSelected) {
          indicator.className = 'cat-indicator w-4.5 h-4.5 rounded-md border-2 border-[#991B1B] bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-2xs transition';
          indicator.innerHTML = checkSvg;
        } else {
          indicator.className = 'cat-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400';
          indicator.innerHTML = '';
        }
      }
    });

    const counterText = document.getElementById('cat-selection-counter-text');
    if (counterText) {
      const count = this.selectedCateringPackageIds ? this.selectedCateringPackageIds.size : 0;
      counterText.innerText = count === 1 ? '1 package selected' : `${count} packages selected`;
    }
  }

  // ==================== IT OPTIONS & SELECTION ====================

  goToITPage(pageIndex) {}
  prevITPage() {}
  nextITPage() {}
  updateITCarousel() {}

  toggleITOption(index) {
    if (!this.selectedITItemIndexes) {
      this.selectedITItemIndexes = new Set([0, 2]);
    }
    if (this.selectedITItemIndexes.has(index)) {
      this.selectedITItemIndexes.delete(index);
    } else {
      this.selectedITItemIndexes.add(index);
    }
    this.updateITUI();
    this.updatePricingSummary();
  }

  updateITUI() {
    const checkSvg = '<svg class="w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(idx => {
      const card = document.getElementById(`it-card-${idx}`);
      if (!card) return;
      const isSelected = this.selectedITItemIndexes && this.selectedITItemIndexes.has(idx);
      card.classList.toggle('selected', isSelected);
      if (isSelected) {
        card.classList.add('border-[#991B1B]', 'bg-[#FEF2F2]/40');
        card.classList.remove('border-red-700', 'bg-red-50/20', 'border-[#E9E3DD]', 'bg-white');
      } else {
        card.classList.remove('border-[#991B1B]', 'bg-[#FEF2F2]/40', 'border-red-700', 'bg-red-50/20');
        card.classList.add('border-[#E9E3DD]', 'bg-white');
      }
      const indicator = card.querySelector('.it-indicator');
      if (indicator) {
        if (isSelected) {
          indicator.className = 'it-indicator w-4.5 h-4.5 rounded-md border-2 border-[#991B1B] bg-[#991B1B] text-white flex items-center justify-center shrink-0 shadow-2xs transition';
          indicator.innerHTML = checkSvg;
        } else {
          indicator.className = 'it-indicator w-4.5 h-4.5 rounded-md border-2 border-stone-300 bg-white flex items-center justify-center shrink-0 transition hover:border-stone-400';
          indicator.innerHTML = '';
        }
      }
    });

    const counterText = document.getElementById('it-selection-counter-text');
    if (counterText) {
      const count = this.selectedITItemIndexes ? this.selectedITItemIndexes.size : 0;
      counterText.innerText = count === 1 ? '1 item selected' : `${count} items selected`;
    }
  }

  toggleITTile(checkbox, tileId) {
    // Kept for backward compatibility
  }

  // ==================== SERVICES & REVIEW STEP UPDATE ====================

  updatePricingSummary() {
    const roomId = document.getElementById('form-room-id')?.value;
    const room = bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0];
    const isPrivate = !!room?.isPrivate;
    const isMyRoom = isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');

    const attendees = parseInt(document.getElementById('form-attendees')?.value, 10) || 1;
    const date = document.getElementById('form-date')?.value || '';
    const startTime = document.getElementById('form-start-time')?.value || '';
    const endTime = document.getElementById('form-end-time')?.value || '';
    const meetingTitle = document.getElementById('form-meeting-title')?.value || 'Meeting';

    const cateringPackages = {
      'cat-1': { name: 'Lunch Box' },
      'cat-2': { name: 'Coffee & Pastries' },
      'cat-3': { name: 'Tea & Fresh Fruit' },
      'cat-4': { name: 'Executive VIP Buffet' },
      'cat-5': { name: 'Healthy & Vegetarian' },
      'cat-6': { name: 'Afternoon High Tea' },
      'cat-7': { name: 'All-Day Beverage Bar' },
      'cat-8': { name: 'Breakfast & Dim Sum' },
      'cat-9': { name: 'Khmer Heritage Set' }
    };

    const needsCatering = document.getElementById('catering-toggle')?.checked;
    const selectedPkgIds = Array.from(this.selectedCateringPackageIds || ['cat-1']);
    const selectedPkgNames = selectedPkgIds.map(id => cateringPackages[id]?.name || id);
    const cateringRemarks = document.getElementById('form-catering-remarks')?.value?.trim();
    const hasCatering = needsCatering && selectedPkgNames.length > 0;

    const needsIT = document.getElementById('it-toggle')?.checked;
    const itItemValues = [
      'Video Conference Setup (Zoom / Teams)',
      'Presentation Screen & TV',
      'Microphones & Audio Setup',
      'Smart Digital Whiteboard',
      'Session Recording & Stream',
      'Dedicated IT Standby Staff',
      'Presenter Laptop & Clicker',
      'High-Density Wi-Fi / LAN',
      'Simultaneous Translation'
    ];
    const selectedITIndexes = Array.from(this.selectedITItemIndexes || [0, 2]);
    const checkedITItems = selectedITIndexes.map(idx => itItemValues[idx]).filter(Boolean);

    // ===== STEP 4 EXECUTIVE RESERVATION DOSSIER POPULATION =====
    const calcDuration = document.getElementById('calculated-duration-label')?.innerText || 'Scheduled';

    // 1. Room Visual Banner
    const step4RoomImg = document.getElementById('step4-room-img');
    const step4RoomName = document.getElementById('step4-room-name');
    const step4RoomType = document.getElementById('step4-room-type');
    const step4RoomFloor = document.getElementById('step4-room-floor');
    const step4RoomCapacity = document.getElementById('step4-room-capacity');
    const step4RoomOwnerTag = document.getElementById('step4-room-owner-tag');
    const step4RoomOwnerText = document.getElementById('step4-room-owner-text');

    if (step4RoomImg) step4RoomImg.src = room.image || 'assets/rooms/summit-suite.jpg';
    if (step4RoomName) step4RoomName.innerText = room.name || 'Meeting Room';
    if (step4RoomType) {
      step4RoomType.innerText = isMyRoom ? 'Your Private Suite' : (isPrivate ? 'Executive Private Suite' : 'Standard Room');
    }
    if (step4RoomFloor) {
      const floorVal = room.floor || 'Floor 18';
      step4RoomFloor.innerText = (floorVal.includes('Suite') || floorVal.includes('Executive'))
        ? floorVal
        : `${floorVal} - Executive Suite`;
    }
    if (step4RoomCapacity) step4RoomCapacity.innerText = `Capacity: ${room.capacity || 60} Seats`;
    if (step4RoomOwnerTag) {
      step4RoomOwnerTag.classList.toggle('hidden', !isPrivate);
      if (isPrivate && step4RoomOwnerText) {
        step4RoomOwnerText.innerText = isMyRoom ? 'Owner: Jonathan Vance (You)' : `Owner: ${room.roomOwner?.name || 'Room Owner'}`;
      }
    }

    // 2. Schedule Info Grid
    const step4Date = document.getElementById('step4-date');
    const step4DayLabel = document.getElementById('step4-day-label');
    const step4Time = document.getElementById('step4-time');
    const step4Duration = document.getElementById('step4-duration');
    const step4Attendees = document.getElementById('step4-attendees');

    // Multi-Session Breakdown in Step 4
    const multiSec = document.getElementById('step4-multi-sessions-section');
    const multiList = document.getElementById('step4-multi-sessions-list');
    const multiCount = document.getElementById('step4-multi-sessions-count');

    let totalDurationText = calcDuration;
    if (this.selectedSessions && this.selectedSessions.length > 1) {
      let totalMinutes = 0;
      const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      if (multiList) {
        multiList.innerHTML = this.selectedSessions.map((s, idx) => {
          const [sH, sM] = s.startTime.split(':').map(Number);
          const [eH, eM] = s.endTime.split(':').map(Number);
          const diffM = (eH * 60 + eM) - (sH * 60 + sM);
          totalMinutes += diffM;
          const hrs = Math.floor(diffM / 60);
          const mins = diffM % 60;
          let dStr = '';
          if (hrs > 0) dStr += `${hrs}h`;
          if (mins > 0) dStr += ` ${mins}m`;
          dStr = dStr.trim() || `${diffM}m`;

          let fDate = s.date;
          try {
            const dObj = new Date(s.date + 'T12:00:00');
            if (!isNaN(dObj.getTime())) fDate = dayFormatter.format(dObj);
          } catch (_) {}

          return `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E9E3DD] text-xs">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-red-50 text-[#991B1B] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">#${idx + 1}</span>
                <div>
                  <span class="font-semibold text-stone-900 block leading-tight">${fDate}</span>
                  <span class="font-mono text-[11px] text-stone-600 block leading-tight">${s.startTime} – ${s.endTime}</span>
                </div>
              </div>
              <span class="font-mono text-[10.5px] font-semibold text-stone-600 px-1.5 py-0.5 bg-[#FAF7F4] rounded border border-[#E9E3DD]">${dStr}</span>
            </div>
          `;
        }).join('');
      }

      const totH = Math.floor(totalMinutes / 60);
      const remM = totalMinutes % 60;
      let totStr = '';
      if (totH > 0) totStr += `${totH} hr${totH > 1 ? 's' : ''}`;
      if (remM > 0) totStr += ` ${remM} min${remM > 1 ? 's' : ''}`;
      totStr = totStr.trim() || `${totalMinutes} mins`;
      totalDurationText = totStr;

      if (multiSec) multiSec.classList.remove('hidden');
      if (multiCount) multiCount.innerText = `${this.selectedSessions.length} Sessions (${totStr} total)`;
      if (step4Date) step4Date.innerText = `${this.selectedSessions.length} Sessions`;
      if (step4DayLabel) step4DayLabel.innerText = `${this.selectedSessions[0].date} & more`;
      if (step4Time) step4Time.innerText = `${this.selectedSessions[0].startTime} – ${this.selectedSessions[this.selectedSessions.length - 1].endTime}`;
      if (step4Duration) step4Duration.innerText = `${totStr} total`;
    } else {
      if (multiSec) multiSec.classList.add('hidden');
      if (multiList) multiList.innerHTML = '';
      if (step4Date) {
        try {
          const dateObj = new Date(date + 'T00:00:00');
          step4Date.innerText = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } catch(_) {
          step4Date.innerText = date;
        }
      }
      if (step4DayLabel) step4DayLabel.innerText = 'Confirmed Slot';
      if (step4Time) step4Time.innerText = `${startTime} – ${endTime}`;
      if (step4Duration) {
        step4Duration.innerText = calcDuration.startsWith('Scheduled') ? calcDuration : `Scheduled (${calcDuration})`;
      }
    }

    if (step4Attendees) step4Attendees.innerText = `${attendees} Persons`;

    // 3. Meeting Details & Requester
    const step4Title = document.getElementById('step4-meeting-title');
    if (step4Title) step4Title.innerText = meetingTitle;

    const meetingNotes = document.getElementById('form-purpose')?.value?.trim();
    const step4MeetingNotes = document.getElementById('step4-meeting-notes');
    if (step4MeetingNotes) {
      step4MeetingNotes.innerText = meetingNotes || 'General departmental meeting and discussion.';
    }

    const requesterName = document.getElementById('form-requester-name')?.value?.trim() || 'Jonathan Vance';
    const staffId = document.getElementById('form-requester-id')?.value?.trim() || 'NBC-4102';
    const staffEmail = document.getElementById('form-requester-email')?.value?.trim() || 'jonathan.vance@nbc.gov.kh';
    const staffPhone = document.getElementById('form-requester-phone')?.value?.trim() || 'Ext. 8421';
    const dirSelect = document.getElementById('form-requester-directorate');
    const deptSelect = document.getElementById('form-requester-department');
    const dirName = dirSelect?.options[dirSelect.selectedIndex]?.text?.trim() || 'Directorate of Banking Operations';
    const deptName = deptSelect?.options[deptSelect.selectedIndex]?.text?.trim() || 'Department of Financial Settlement';

    const step4ReqName = document.getElementById('step4-requester-name');
    const step4StaffId = document.getElementById('step4-staff-id');
    const step4Dept = document.getElementById('step4-department');
    const step4Phone = document.getElementById('step4-phone');
    const step4Email = document.getElementById('step4-email');

    if (step4ReqName) step4ReqName.innerText = requesterName;
    if (step4StaffId) step4StaffId.innerText = staffId;
    if (step4Dept) step4Dept.innerText = `${deptName} • ${dirName}`;
    if (step4Phone) step4Phone.innerText = staffPhone;
    if (step4Email) step4Email.innerText = staffEmail;

    // Private Justification
    const justificationCard = document.getElementById('step4-justification-card');
    const justificationText = document.getElementById('step4-justification-text');
    if (justificationCard) {
      if (isPrivate && !isMyRoom) {
        const reason = document.getElementById('form-private-justification')?.value?.trim() || 'Confidential banking session requiring executive private room isolation.';
        justificationCard.classList.remove('hidden');
        if (justificationText) justificationText.innerText = `"${reason}"`;
      } else {
        justificationCard.classList.add('hidden');
      }
    }

    // 4. Hospitality & IT Services Specification
    const foodStatus = document.getElementById('step4-food-status');
    const foodContent = document.getElementById('step4-food-content');
    const foodEmpty = document.getElementById('step4-food-empty');
    const foodPkgName = document.getElementById('step4-food-package-name');
    const foodServings = document.getElementById('step4-food-servings');
    const foodRemarksEl = document.getElementById('step4-food-remarks');

    if (foodStatus) foodStatus.innerText = hasCatering ? 'Requested' : 'None';
    if (hasCatering) {
      if (foodContent) foodContent.classList.remove('hidden');
      if (foodEmpty) foodEmpty.classList.add('hidden');
      if (foodPkgName) foodPkgName.innerText = selectedPkgNames.join(', ');
      if (foodServings) foodServings.innerText = `${attendees} Servings`;
      if (foodRemarksEl) {
        foodRemarksEl.innerText = cateringRemarks ? `Remarks: ${cateringRemarks}` : 'Standard beverage & hospitality arrangement.';
      }
    } else {
      if (foodContent) foodContent.classList.add('hidden');
      if (foodEmpty) foodEmpty.classList.remove('hidden');
    }

    const itStatus = document.getElementById('step4-it-status');
    const itContent = document.getElementById('step4-it-content');
    const itEmpty = document.getElementById('step4-it-empty');
    const itChipList = document.getElementById('step4-it-chip-list');

    if (itStatus) itStatus.innerText = (needsIT && checkedITItems.length > 0) ? `${checkedITItems.length} Items` : 'Standard AV';
    if (needsIT && checkedITItems.length > 0) {
      if (itContent) itContent.classList.remove('hidden');
      if (itEmpty) itEmpty.classList.add('hidden');
      const shortNames = {
        'Video Conference Setup (Zoom / Teams)': 'Video Conference',
        'Presentation Screen & TV': 'Screen & TV',
        'Microphones & Audio Setup': 'Microphones',
        'Smart Digital Whiteboard': 'Whiteboard',
        'Session Recording & Stream': 'Recording',
        'Dedicated IT Standby Staff': 'IT Standby',
        'Presenter Laptop & Clicker': 'Laptop & Clicker',
        'High-Density Wi-Fi / LAN': 'Wi-Fi / LAN',
        'Simultaneous Translation': 'Translation'
      };
      if (itChipList) {
        itChipList.innerHTML = checkedITItems.map(item => {
          const short = shortNames[item] || item;
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 font-medium shadow-2xs">
            <span class="iconify text-[#801414] text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
            <span>${short}</span>
          </span>`;
        }).join('');
      }
    } else {
      if (itContent) itContent.classList.add('hidden');
      if (itEmpty) itEmpty.classList.remove('hidden');
    }

    // 5. Right Column Voucher Metrics
    const voucherRoom = document.getElementById('step4-voucher-room');
    const voucherType = document.getElementById('step4-voucher-type');
    const voucherDuration = document.getElementById('step4-voucher-duration');
    const voucherAttendees = document.getElementById('step4-voucher-attendees');
    const voucherServices = document.getElementById('step4-voucher-services');

    if (voucherRoom) voucherRoom.innerText = room.name || 'Meeting Room';
    if (voucherType) {
      voucherType.innerText = isMyRoom ? 'Your Designated Suite' : (isPrivate ? 'Private Executive Suite' : 'Standard Room');
      voucherType.className = isPrivate ? 'font-semibold text-[#D97706]' : 'font-semibold text-stone-800';
    }
    if (voucherDuration) {
      voucherDuration.innerText = (this.selectedSessions && this.selectedSessions.length > 1) ? `${this.selectedSessions.length} Sessions • ${totalDurationText}` : (calcDuration || 'Scheduled');
    }
    if (voucherAttendees) voucherAttendees.innerText = `${attendees} Persons`;
    if (voucherServices) {
      let svcText = '';
      if (hasCatering && needsIT) svcText = 'Catering + IT Setup';
      else if (hasCatering) svcText = 'Catering Only';
      else if (needsIT) svcText = 'IT AV Setup';
      else svcText = 'Standard Room Only';
      voucherServices.innerText = svcText;
    }

    // 6. Authorization Pathway & Submit Button
    const pathwayTurnaround = document.getElementById('step4-pathway-turnaround');
    const pathwaySteps = document.getElementById('step4-pathway-steps');
    const submitBtn = document.getElementById('form-submit-btn');
    const submitBtnText = document.getElementById('form-submit-btn-text');
    if (submitBtn) submitBtn.style.width = '100%';

    if (isMyRoom) {
      if (hasCatering || needsIT) {
        if (pathwayTurnaround) pathwayTurnaround.innerText = 'Est. 1-2 hours';
        if (pathwaySteps) {
          pathwaySteps.innerHTML = `
            <div class="flex items-center gap-2.5 py-0.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px]">
                <span class="iconify text-[10px]" data-icon="lucide:check" data-stroke-width="2.5"></span>
              </span>
              <span class="text-stone-900 font-semibold">Room Ownership Verified</span>
            </div>
            <div class="flex items-center gap-2.5 py-0.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-[#801414] text-white flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">2</span>
              <span class="text-stone-900 font-semibold">Manager Service Verification</span>
            </div>
            <div class="flex items-center gap-2.5 py-0.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">3</span>
              <span class="text-stone-600 font-medium">Door PIN Activation</span>
            </div>
          `;
        }
        if (submitBtnText) submitBtnText.innerText = 'Submit for Manager Review';
      } else {
        if (pathwayTurnaround) pathwayTurnaround.innerText = 'Instant Confirmation';
        if (pathwaySteps) {
          pathwaySteps.innerHTML = `
            <div class="flex items-center gap-2.5 py-0.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px]">
                <span class="iconify text-[10px]" data-icon="lucide:check" data-stroke-width="2.5"></span>
              </span>
              <span class="text-stone-900 font-semibold">Room Ownership Verified</span>
            </div>
            <div class="flex items-center gap-2.5 py-0.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px]">
                <span class="iconify text-[10px]" data-icon="lucide:check" data-stroke-width="2.5"></span>
              </span>
              <span class="text-stone-900 font-semibold">Instant Passcode Confirmed</span>
            </div>
          `;
        }
        if (submitBtnText) submitBtnText.innerText = 'Confirm Booking & Issue Door PIN';
      }
    } else if (isPrivate) {
      const roomOwnerName = room.roomOwner?.name || 'Room Owner';
      if (pathwayTurnaround) pathwayTurnaround.innerText = 'Est. 2-4 hours';
      if (pathwaySteps) {
        pathwaySteps.innerHTML = `
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-[#801414] text-white flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">1</span>
            <span class="text-stone-900 font-semibold">Manager Pitika Review</span>
          </div>
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">2</span>
            <span class="text-stone-600 font-medium">Room Owner (${roomOwnerName})</span>
          </div>
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">3</span>
            <span class="text-stone-600 font-medium">Door PIN Issued</span>
          </div>
        `;
      }
      if (submitBtnText) submitBtnText.innerText = 'Submit for 2-Tier Approvals';
    } else {
      if (pathwayTurnaround) pathwayTurnaround.innerText = 'Est. 1-2 hours';
      if (pathwaySteps) {
        pathwaySteps.innerHTML = `
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-[#801414] text-white flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">1</span>
            <span class="text-stone-900 font-semibold">Manager Pitika Review</span>
          </div>
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">2</span>
            <span class="text-stone-600 font-medium">Service Dispatch (Food/IT)</span>
          </div>
          <div class="flex items-center gap-2.5 py-0.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 text-[10.5px] font-mono font-bold">3</span>
            <span class="text-stone-600 font-medium">Door PIN Issued</span>
          </div>
        `;
      }
      if (submitBtnText) submitBtnText.innerText = 'Submit Request for Review';
    }
  }

  // ==================== FINAL SUBMIT HANDLER ====================

  handleBookingSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (this.currentStep < 4) {
      this.bookingFormGoToStep(this.currentStep + 1);
      return;
    }

    // 1. Validate schedule times
    const timeValidation = this.validateMeetingTimes();
    if (!timeValidation.valid) {
      const errorTitle = timeValidation.conflict?.isPast ? "Time Has Passed" : "Invalid Schedule";
      this.showToast(errorTitle, timeValidation.message, "error");
      this.bookingFormGoToStep(1);
      return;
    }

    const roomId = document.getElementById('form-room-id')?.value;
    const room = bookingStore.getRoomById(roomId);
    const isPrivate = !!room?.isPrivate;
    const isMyRoom = isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');

    let privateJustification = '';
    if (isPrivate && !isMyRoom) {
      privateJustification = document.getElementById('form-private-justification')?.value.trim();
      if (!privateJustification) {
        this.showToast("Reason Required", "Please write why you need this private room.", "error");
        this.bookingFormGoToStep(2);
        document.getElementById('form-private-justification')?.focus();
        return;
      }
    } else if (isMyRoom) {
      privateJustification = "Room Owner Direct Booking";
    }

    const meetingTitle = document.getElementById('form-meeting-title')?.value.trim() || '';
    if (!meetingTitle) {
      this.showToast("Meeting Name Required", "Please enter a name for your meeting.", "error");
      this.bookingFormGoToStep(2);
      document.getElementById('form-meeting-title')?.focus();
      return;
    }
    const requesterName = document.getElementById('form-requester-name')?.value.trim() || 'Jonathan Vance';
    const staffId = document.getElementById('form-requester-id')?.value.trim() || 'NBC-4102';
    const staffEmail = document.getElementById('form-requester-email')?.value.trim() || 'jonathan.vance@nbc.gov.kh';
    const staffPhone = document.getElementById('form-requester-phone')?.value.trim() || 'Ext. 8421';

    const dirSelect = document.getElementById('form-requester-directorate');
    const deptSelect = document.getElementById('form-requester-department');
    const dirName = dirSelect?.options[dirSelect.selectedIndex]?.text?.trim() || 'General';
    const deptName = deptSelect?.options[deptSelect.selectedIndex]?.text?.trim() || 'Finance & Accounting';
    const requesterDept = `${deptName} &bull; ${dirName}`;

    const date = document.getElementById('form-date').value;
    const attendees = document.getElementById('form-attendees').value;
    const startTime = document.getElementById('form-start-time').value;
    const endTime = document.getElementById('form-end-time').value;
    const meetingPurpose = document.getElementById('form-purpose').value.trim() || (isPrivate ? `Private Room: ${privateJustification}` : 'General Meeting');

    // Catering selection
    const needsCatering = document.getElementById('catering-toggle')?.checked;
    const cateringPackages = {
      'cat-1': 'Lunch Box (Meat & Rice / Salad)',
      'cat-2': 'Morning Coffee & Pastries',
      'cat-3': 'Tea & Fresh Fruit',
      'cat-4': 'Executive VIP Buffet',
      'cat-5': 'Healthy & Vegetarian Set',
      'cat-6': 'Afternoon High Tea',
      'cat-7': 'All-Day Beverage Bar',
      'cat-8': 'Breakfast & Dim Sum',
      'cat-9': 'Khmer Heritage Set'
    };
    const selectedPkgIds = Array.from(this.selectedCateringPackageIds || ['cat-1']);
    const selectedPkgNames = selectedPkgIds.map(id => cateringPackages[id] || id);
    const cateringPackageId = selectedPkgIds[0] || 'cat-1';
    const cateringPackageName = selectedPkgNames.join(', ') || 'Lunch Box (Meat & Rice / Salad)';
    const cateringRemarks = document.getElementById('form-catering-remarks')?.value.trim();

    // IT Support selection
    const needsIT = document.getElementById('it-toggle')?.checked;
    const itItemValues = [
      'Video Conference Setup (Zoom / Teams)',
      'Presentation Screen & TV',
      'Microphones & Audio Setup',
      'Smart Digital Whiteboard',
      'Session Recording & Stream',
      'Dedicated IT Standby Staff',
      'Presenter Laptop & Clicker',
      'High-Density Wi-Fi / LAN',
      'Simultaneous Translation'
    ];
    const selectedITIndexes = Array.from(this.selectedITItemIndexes || [0, 2]);
    const checkedITItems = selectedITIndexes.map(idx => itItemValues[idx]).filter(Boolean);
    const itRemarks = document.getElementById('form-it-remarks')?.value.trim();

    let finalDate = date;
    let finalStartTime = startTime;
    let finalEndTime = endTime;
    let finalSessions = null;

    if (this.slotSelectionMode === 'multi' && this.selectedSessions && this.selectedSessions.length > 0) {
      finalSessions = this.selectedSessions.map(s => ({ ...s }));
      finalSessions.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      finalDate = finalSessions[0].date;
      finalStartTime = finalSessions[0].startTime;
      finalEndTime = finalSessions[0].endTime;
    } else {
      finalSessions = [{ date: finalDate, startTime: finalStartTime, endTime: finalEndTime }];
    }

    const payload = {
      roomId,
      meetingTitle,
      requesterName,
      requesterDept,
      staffId,
      staffEmail,
      staffPhone,
      date: finalDate,
      attendees,
      startTime: finalStartTime,
      endTime: finalEndTime,
      sessions: finalSessions,
      meetingPurpose,
      isPrivateRequest: isPrivate,
      privateJustification: privateJustification,
      needsCatering: needsCatering && selectedPkgIds.length > 0,
      cateringPackageId,
      cateringPackageIds: selectedPkgIds,
      cateringPackageName,
      cateringRemarks,
      needsIT,
      itItems: checkedITItems,
      itRemarks
    };

    let createdRequest = null;
    try {
      createdRequest = bookingStore.createBookingRequest(payload);
    } catch (err) {
      // Toast already handled by store
      return;
    }

    // Reset Form to Clean Initial State
    document.getElementById('room-booking-form').reset();
    document.getElementById('catering-toggle').checked = false;
    document.getElementById('it-toggle').checked = false;
    this.selectedCateringPackageIds = new Set(['cat-1']);
    this.currentCateringPage = 0;
    this.selectedITItemIndexes = new Set([0, 2]);
    this.currentITPage = 0;
    this.selectedSessions = [];
    this.slotSelectionMode = 'multi';
    this.resetStep1TimelineSelection(false);
    this.setSlotSelectionMode('multi', true);
    this.updateCateringUI();
    this.updateITUI();
    this.handleCateringToggleChange();
    this.handleITToggleChange();
    this.bookingFormGoToStep(1);

    if (window.app) {
      window.app.renderAll();
      window.app.navigateTo('my-bookings');
    }
  }
}

window.NBC.views['request-form'] = new BookingFormView();
if (window.app && typeof window.app.bindViewAndLayoutMethods === 'function') {
  window.app.bindViewAndLayoutMethods();
}
