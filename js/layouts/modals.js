// Modals Layout Component
window.NBC = window.NBC || {};
window.NBC.layouts = window.NBC.layouts || {};

window.NBC.layouts.modals = {
  selectedTimelineRoomId: null,
  selectedTimelineDate: null,
  selectedTimelineSlot: null,
  timelineCalendar: null,

  render() {
    const container = document.getElementById('app-modals');
    if (!container) return;

    container.innerHTML = `
      <!-- ================================================================ -->
      <!--       PREMIUM FULLCALENDAR BOOKING TIMELINE MODAL (POPUP)       -->
      <!-- ================================================================ -->
      <div id="modal-booking-timeline" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in" onclick="event.stopPropagation()">
          
          <!-- Modal Header (NBC Burgundy Luxury Strip) -->
          <div class="bg-gradient-to-r from-[#2A0808] via-[#3D0C0C] to-[#2A0808] px-4 sm:px-6 py-3.5 border-b border-[#4A1010] flex flex-wrap items-center justify-between text-white gap-3 shrink-0">
            <div class="flex items-center space-x-3 min-w-0">
              <img id="timeline-modal-room-img" src="assets/rooms/boardroom-alpha.jpg" alt="Room" class="w-12 h-12 rounded-xl object-cover border border-amber-400/30 shrink-0 shadow-xs" />
              <div class="min-w-0">
                <div class="flex items-center space-x-2 mb-0.5">
                  <span id="timeline-modal-badge" class="px-2 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
                    Executive Boardroom
                  </span>
                  <span id="timeline-modal-cap" class="text-[10px] text-stone-300 font-semibold">12 Seats</span>
                </div>
                <h3 id="timeline-modal-room-name" class="font-heading font-bold text-sm sm:text-base text-white leading-tight truncate">Room Name</h3>
                <p id="timeline-modal-room-floor" class="text-[10px] sm:text-[11px] text-amber-200/80 mt-0.5 truncate">Floor 3 • Building A</p>
              </div>
            </div>

            <!-- Date Switcher Toolbar with Week/Day View Toggle -->
            <div class="flex items-center space-x-1.5 shrink-0">
              <!-- View Toggle [ Week | Day ] -->
              <div class="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <button type="button" id="timeline-modal-btn-week" onclick="NBC.layouts.modals.switchModalView('timeGridWeek')" class="px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-white/20 shadow-xs transition cursor-pointer flex items-center space-x-1" title="7-Day Week View">
                  <span class="iconify text-[11px]" data-icon="lucide:calendar-range"></span>
                  <span>Week</span>
                </button>
                <button type="button" id="timeline-modal-btn-day" onclick="NBC.layouts.modals.switchModalView('timeGridDay')" class="px-2 py-0.5 rounded text-[11px] font-medium text-stone-300 hover:text-white transition cursor-pointer flex items-center space-x-1" title="Single Day View">
                  <span class="iconify text-[11px]" data-icon="lucide:calendar-1"></span>
                  <span>Day</span>
                </button>
              </div>

              <!-- Date Nav -->
              <div class="flex items-center space-x-1 bg-black/35 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                <button type="button" onclick="NBC.layouts.modals.changeTimelineCalendar(-1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer" title="Previous">
                  <span class="iconify text-sm" data-icon="lucide:chevron-left"></span>
                </button>
                <input type="date" id="timeline-modal-date-picker" onchange="NBC.layouts.modals.setTimelineDate(this.value)" class="bg-transparent text-white text-xs font-bold px-1 sm:px-2 py-1 outline-none cursor-pointer [color-scheme:dark]" title="Jump to date" />
                <button type="button" onclick="NBC.layouts.modals.changeTimelineCalendar(1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer" title="Next">
                  <span class="iconify text-sm" data-icon="lucide:chevron-right"></span>
                </button>
                <button type="button" onclick="NBC.layouts.modals.setTimelineDateToToday()" class="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer">
                  Today
                </button>
                <div class="h-4 w-px bg-white/20 mx-1"></div>
                <button type="button" onclick="NBC.layouts.modals.closeBookingTimelineModal()" class="w-7 h-7 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer" aria-label="Close">
                  <span class="iconify text-base" data-icon="lucide:x"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Availability & Legend Strip -->
          <div class="px-4 sm:px-6 py-2 bg-[#F9F7F5] border-b border-[#E9E3DD] flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
            <div class="flex items-center space-x-3">
              <span class="inline-flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                <span>Click Open Slot to Select</span>
              </span>
              <span class="inline-flex items-center space-x-1.5 text-[11px] font-bold text-red-900">
                <span class="w-2.5 h-2.5 rounded-full bg-red-800 ring-2 ring-red-200"></span>
                <span>Reserved Meeting</span>
              </span>
              <span class="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-stone-500">
                <span class="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
                <span>Past Time</span>
              </span>
            </div>
            <div class="text-[11px] text-stone-500 font-medium flex items-center space-x-3">
              <span class="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" title="Double click on the calendar or slot badge to clear selection">
                <span class="iconify text-xs shrink-0" data-icon="lucide:mouse-pointer-click"></span>
                <span>Double-click slot to deselect</span>
              </span>
              <span>Operating Hours: <strong>07:00 – 18:00</strong></span>
            </div>
          </div>

          <!-- FullCalendar TimeGrid Mount Container -->
          <div class="p-2 sm:p-4 overflow-y-auto flex-1 bg-white min-h-[380px]">
            <div id="timeline-modal-calendar" class="nbc-calendar-container min-h-[360px]"></div>
          </div>

          <!-- Bottom Action Bar -->
          <div class="p-3.5 sm:p-4 bg-[#FAF7F4] border-t border-[#E9E3DD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <!-- Selected Range & Title Input -->
            <div class="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div id="timeline-modal-slot-display" ondblclick="NBC.layouts.modals.resetTimelineSelection(false)" title="Double-click to deselect" class="p-2 sm:py-2 sm:px-3 rounded-xl bg-white border border-[#E9E3DD] flex items-center space-x-2 shrink-0 transition select-none cursor-pointer">
                <div class="w-7 h-7 rounded-lg bg-red-50 text-red-900 flex items-center justify-center font-bold text-xs shrink-0">
                  <span class="iconify text-sm" data-icon="lucide:clock"></span>
                </div>
                <div class="min-w-0">
                  <span class="text-[9px] uppercase font-bold text-stone-400 block leading-tight">Selected Slot</span>
                  <strong id="timeline-modal-selected-time" class="text-xs text-stone-900 font-bold block leading-tight truncate">Select an open slot</strong>
                </div>
                <button type="button" id="timeline-modal-deselect-btn" onclick="event.stopPropagation(); NBC.layouts.modals.resetTimelineSelection(false)" class="hidden ml-1 p-1 rounded-md text-red-800 hover:text-red-950 hover:bg-red-100 transition cursor-pointer" title="Deselect slot">
                  <span class="iconify text-xs" data-icon="lucide:x"></span>
                </button>
              </div>

              <!-- Quick Meeting Title Input -->
              <div class="flex-1 min-w-[180px]">
                <input type="text" id="timeline-modal-title" onfocus="NBC.layouts.modals.ensureTimelineSlotSelected()" onclick="NBC.layouts.modals.ensureTimelineSlotSelected()" placeholder="Meeting Title (e.g. Executive Strategy Review)" class="bank-input text-xs py-2 px-3 w-full font-medium" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-2 shrink-0">
              <button type="button" onclick="NBC.layouts.modals.closeBookingTimelineModal()" class="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E9E3DD] text-stone-700 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer">
                Cancel
              </button>
              <button type="button" id="timeline-modal-btn-confirm" onclick="NBC.layouts.modals.confirmTimelineSlotAndProceed()" class="btn-primary min-h-[42px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center space-x-2 transition cursor-pointer">
                <span>Continue to Meeting Details</span>
                <span class="iconify text-sm" data-icon="lucide:arrow-right"></span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Click backdrop to close
    const timelineModal = document.getElementById('modal-booking-timeline');
    if (timelineModal) {
      timelineModal.onclick = (e) => {
        if (e.target === timelineModal) this.closeBookingTimelineModal();
      };
    }
  },

  // ==================== FULLCALENDAR TIMELINE MODAL LOGIC ====================

  openBookingTimelineModal(roomId, targetDate = null) {
    if (!roomId || typeof bookingStore === 'undefined') return;

    const room = bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0];
    if (!room) return;

    this.selectedTimelineRoomId = room.id;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.selectedTimelineDate = targetDate || todayStr;
    this.selectedTimelineSlot = null;

    const modal = document.getElementById('modal-booking-timeline');
    if (!modal) {
      this.render();
    }
    const activeModal = document.getElementById('modal-booking-timeline');
    if (!activeModal) return;

    // Update Room Header
    const imgEl = document.getElementById('timeline-modal-room-img');
    const nameEl = document.getElementById('timeline-modal-room-name');
    const floorEl = document.getElementById('timeline-modal-room-floor');
    const capEl = document.getElementById('timeline-modal-cap');
    const badgeEl = document.getElementById('timeline-modal-badge');
    const datePicker = document.getElementById('timeline-modal-date-picker');
    const titleInput = document.getElementById('timeline-modal-title');

    if (imgEl) imgEl.src = room.image;
    if (nameEl) nameEl.innerText = room.name;
    if (floorEl) floorEl.innerText = `${room.floor || 'Floor 3'} • ${room.branch ? room.branch.split('(')[0].trim() : 'Phnom Penh'}`;
    if (capEl) capEl.innerText = `${room.capacity} Seats`;
    if (badgeEl) {
      badgeEl.innerHTML = room.isPrivate 
        ? '<span class="iconify inline text-[10px] mr-1" data-icon="lucide:lock"></span><span>Private Room</span>'
        : '<span class="iconify inline text-[10px] mr-1" data-icon="lucide:check-circle"></span><span>Public Room</span>';
      badgeEl.className = room.isPrivate 
        ? 'px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide inline-flex items-center'
        : 'px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide inline-flex items-center';
    }

    if (datePicker) {
      datePicker.min = todayStr;
      datePicker.value = this.selectedTimelineDate;
    }

    if (titleInput) {
      titleInput.value = `Meeting: ${room.name}`;
    }

    activeModal.classList.remove('hidden');
    activeModal.classList.add('flex');

    // Mount FullCalendar
    setTimeout(() => {
      this.mountTimelineCalendar(room.id, this.selectedTimelineDate);
    }, 60);
  },

  closeBookingTimelineModal() {
    const modal = document.getElementById('modal-booking-timeline');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (this.timelineCalendar) {
      try {
        this.timelineCalendar.destroy();
      } catch (e) {}
      this.timelineCalendar = null;
    }
    this.selectedTimelineSlot = null;
  },

  setTimelineDate(newDate) {
    if (!newDate) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (newDate < todayStr) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Past Date", "Please pick today or a future date.", "warning");
      }
      newDate = todayStr;
    }

    this.selectedTimelineDate = newDate;
    const picker = document.getElementById('timeline-modal-date-picker');
    if (picker) picker.value = newDate;

    if (this.timelineCalendar) {
      this.timelineCalendar.gotoDate(newDate);
      this.reloadTimelineCalendarEvents();
    }
    this.resetTimelineSelection();
  },

  setTimelineDateToToday() {
    if (this.timelineCalendar) {
      this.timelineCalendar.today();
    }
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.selectedTimelineDate = todayStr;
    const picker = document.getElementById('timeline-modal-date-picker');
    if (picker) picker.value = todayStr;
    this.reloadTimelineCalendarEvents();
  },

  changeTimelineCalendar(delta) {
    if (!this.timelineCalendar) return;
    if (delta > 0) {
      this.timelineCalendar.next();
    } else {
      this.timelineCalendar.prev();
    }
    const curDate = this.timelineCalendar.getDate();
    const curDateStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
    this.selectedTimelineDate = curDateStr;
    const picker = document.getElementById('timeline-modal-date-picker');
    if (picker) picker.value = curDateStr;
  },

  changeTimelineDate(deltaDays) {
    this.changeTimelineCalendar(deltaDays > 0 ? 1 : -1);
  },

  switchModalView(viewName, targetDate = null) {
    if (!this.timelineCalendar) return;
    if (targetDate) {
      this.timelineCalendar.changeView(viewName, targetDate);
      const picker = document.getElementById('timeline-modal-date-picker');
      if (picker) picker.value = targetDate;
    } else {
      this.timelineCalendar.changeView(viewName);
    }
    setTimeout(() => {
      if (this.timelineCalendar) this.timelineCalendar.updateSize();
      this.ensureTimelineSlotSelected();
    }, 50);
  },

  updateModalCalendarToolbar(dateInfo) {
    if (!dateInfo || !dateInfo.view) return;
    const viewType = dateInfo.view.type;
    const btnWeek = document.getElementById('timeline-modal-btn-week');
    const btnDay = document.getElementById('timeline-modal-btn-day');
    const picker = document.getElementById('timeline-modal-date-picker');

    if (viewType === 'timeGridWeek') {
      if (btnWeek) {
        btnWeek.className = 'px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-white/20 shadow-xs transition cursor-pointer flex items-center space-x-1';
      }
      if (btnDay) {
        btnDay.className = 'px-2 py-0.5 rounded text-[11px] font-medium text-stone-300 hover:text-white transition cursor-pointer flex items-center space-x-1';
      }
      if (picker && dateInfo.start) {
        const s = dateInfo.start;
        const sDateStr = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
        picker.value = sDateStr;
        this.selectedTimelineDate = sDateStr;
      }
    } else {
      if (btnDay) {
        btnDay.className = 'px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-white/20 shadow-xs transition cursor-pointer flex items-center space-x-1';
      }
      if (btnWeek) {
        btnWeek.className = 'px-2 py-0.5 rounded text-[11px] font-medium text-stone-300 hover:text-white transition cursor-pointer flex items-center space-x-1';
      }
      if (picker && dateInfo.start) {
        const d = dateInfo.start;
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        picker.value = dStr;
        this.selectedTimelineDate = dStr;
      }
    }
  },

  reloadTimelineCalendarEvents() {
    if (!this.timelineCalendar || !this.selectedTimelineRoomId) return;
    this.timelineCalendar.removeAllEvents();
    const events = bookingStore.getRoomFullCalendarEvents(this.selectedTimelineRoomId, this.selectedTimelineDate);
    this.timelineCalendar.addEventSource(events);
  },

  resetTimelineSelection(notify = false) {
    this.justDeselected = Date.now();
    this.selectedTimelineSlot = null;
    const timeDisplay = document.getElementById('timeline-modal-selected-time');
    const container = document.getElementById('timeline-modal-slot-display');
    const deselectBtn = document.getElementById('timeline-modal-deselect-btn');
    if (timeDisplay) timeDisplay.innerText = "Click an open slot";
    if (deselectBtn) deselectBtn.classList.add('hidden');
    if (container) {
      container.className = 'p-2 sm:py-2 sm:px-3 rounded-xl bg-white border border-[#E9E3DD] flex items-center space-x-2 shrink-0 transition select-none cursor-pointer';
    }
    if (this.timelineCalendar) {
      this.timelineCalendar.unselect();
    }
    const calendarEl = document.getElementById('timeline-modal-calendar');
    if (calendarEl) {
      calendarEl.querySelectorAll('.fc-highlight').forEach(el => el.remove());
    }
  },

  setSelectedTimelineSlot({ roomId, date, startTime, endTime }) {
    this.selectedTimelineSlot = { roomId, date, startTime, endTime };

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const diffMins = (eH * 60 + eM) - (sH * 60 + sM);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    let durStr = '';
    if (hours > 0) durStr += `${hours} hr${hours > 1 ? 's' : ''}`;
    if (mins > 0) durStr += ` ${mins} min${mins > 1 ? 's' : ''}`;
    durStr = durStr.trim() || `${diffMins} mins`;

    const timeDisplay = document.getElementById('timeline-modal-selected-time');
    const container = document.getElementById('timeline-modal-slot-display');
    const deselectBtn = document.getElementById('timeline-modal-deselect-btn');

    const dateObj = new Date(date + 'T12:00:00');
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedDate = !isNaN(dateObj.getTime()) ? dayFormatter.format(dateObj) : date;

    if (timeDisplay) {
      timeDisplay.innerText = `${formattedDate} • ${startTime} – ${endTime} (${durStr})`;
    }
    if (deselectBtn) {
      deselectBtn.classList.remove('hidden');
    }
    if (container) {
      container.className = 'p-2 sm:py-2 sm:px-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 shrink-0 transition shadow-2xs text-red-950 select-none cursor-pointer';
    }

    if (this.timelineCalendar) {
      const calendarEl = document.getElementById('timeline-modal-calendar');
      if (calendarEl && !calendarEl.querySelector('.fc-highlight')) {
        this.timelineCalendar.select(`${date}T${startTime}:00`, `${date}T${endTime}:00`);
      }
    }
  },

  ensureTimelineSlotSelected() {
    if (this.timelineCalendar && this.selectedTimelineSlot) {
      const { date, startTime, endTime } = this.selectedTimelineSlot;
      if (date && startTime && endTime) {
        const calendarEl = document.getElementById('timeline-modal-calendar');
        if (calendarEl && !calendarEl.querySelector('.fc-highlight')) {
          this.timelineCalendar.select(`${date}T${startTime}:00`, `${date}T${endTime}:00`);
        }
      }
    }
  },

  mountTimelineCalendar(roomId, dateString) {
    const calendarEl = document.getElementById('timeline-modal-calendar');
    if (!calendarEl) return;

    if (typeof FullCalendar === 'undefined') {
      setTimeout(() => this.mountTimelineCalendar(roomId, dateString), 200);
      return;
    }

    if (this.timelineCalendar) {
      try {
        this.timelineCalendar.destroy();
      } catch (e) {}
      this.timelineCalendar = null;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const initialScrollTime = (dateString === todayStr && now.getHours() >= 8)
      ? `${String(Math.min(15, Math.max(7, now.getHours() - 1))).padStart(2, '0')}:00:00`
      : '07:00:00';
    const events = bookingStore.getRoomFullCalendarEvents(roomId, dateString);

    const isMobile = window.innerWidth < 768;
    const defaultView = isMobile ? 'timeGridDay' : 'timeGridWeek';

    this.timelineCalendar = new FullCalendar.Calendar(calendarEl, {
      initialView: defaultView,
      initialDate: dateString || todayStr,
      headerToolbar: false,
      firstDay: 1, // Monday start
      navLinks: true,
      navLinkDayClick: (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        this.switchModalView('timeGridDay', dateStr);
      },
      dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
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
      height: 460,
      selectable: true,
      selectMirror: true,
      unselectAuto: false,
      unselectCancel: '#modal-booking-timeline, input, textarea, button, select, .bank-input, #timeline-modal-title',
      selectLongPressDelay: 100,
      datesSet: (dateInfo) => {
        this.updateModalCalendarToolbar(dateInfo);
      },
      unselect: () => {
        if (this.selectedTimelineSlot) {
          setTimeout(() => this.ensureTimelineSlotSelected(), 10);
        }
      },
      selectAllow: (selectInfo) => {
        // Prevent selecting past timeslots
        return selectInfo.start >= new Date();
      },
      events: events,
      eventClassNames: (arg) => {
        if (arg.isMirror) return ['fc-event-selected-slot'];
        return [];
      },
      eventContent: (arg) => {
        if (arg.event.display === 'background') return null;

        // Determine slot duration in minutes to handle 30-minute compact display
        let durationMins = 30;
        if (arg.event.start && arg.event.end) {
          durationMins = Math.round((arg.event.end.getTime() - arg.event.start.getTime()) / 60000);
        } else if (this.selectedTimelineSlot && this.selectedTimelineSlot.startTime && this.selectedTimelineSlot.endTime) {
          const [sH, sM] = this.selectedTimelineSlot.startTime.split(':').map(Number);
          const [eH, eM] = this.selectedTimelineSlot.endTime.split(':').map(Number);
          durationMins = (eH * 60 + eM) - (sH * 60 + sM);
        }
        const isShortSlot = durationMins <= 45;

        // Selection Mirror: styled with vibrant Emerald & Mint card aesthetic (distinct from booked slots)
        if (arg.isMirror) {
          const timeText = arg.timeText || '';
          const titleInput = document.getElementById('timeline-modal-title');
          const meetingTitle = titleInput?.value.trim() || 'Selected Meeting Slot';

          // For 30-minute short slots, use a sleek single-line horizontal layout to prevent text clipping
          if (isShortSlot) {
            return {
              html: `
                <div class="h-full w-full flex items-center justify-between px-2 sm:px-2.5 py-0.5 select-none overflow-hidden font-sans text-white leading-tight">
                  <div class="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                    <span class="inline-flex items-center space-x-1 font-mono text-[11px] font-bold text-emerald-300 shrink-0">
                      <span class="iconify text-xs shrink-0" data-icon="lucide:clock"></span>
                      <span>${timeText}</span>
                    </span>
                    <span class="text-emerald-400/60 shrink-0 text-[10px]">&bull;</span>
                    <span class="modal-mirror-title font-heading font-bold text-xs text-white truncate drop-shadow-xs">
                      ${meetingTitle}
                    </span>
                    <span class="hidden md:inline-flex items-center text-[10px] text-emerald-200/70 shrink-0 italic">
                      (Double-click to deselect)
                    </span>
                  </div>
                  <span class="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 shrink-0 shadow-2xs">
                    YOUR SELECTION
                  </span>
                </div>
              `
            };
          }

          // Full multi-line layout for 1-hour or longer slots
          return {
            html: `
              <div class="h-full w-full flex flex-col justify-between px-2.5 py-1.5 select-none overflow-hidden leading-tight font-sans text-white">
                <div class="space-y-0.5">
                  <div class="flex items-center justify-between gap-1.5">
                    <span class="inline-flex items-center space-x-1 font-mono text-[11px] font-bold text-emerald-300">
                      <span class="iconify text-xs shrink-0" data-icon="lucide:clock"></span>
                      <span>${timeText}</span>
                    </span>
                    <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 shadow-2xs">
                      YOUR SELECTION
                    </span>
                  </div>
                  <div class="modal-mirror-title font-heading font-bold text-xs sm:text-[13px] text-white line-clamp-1 leading-snug drop-shadow-xs tracking-tight">
                    ${meetingTitle}
                  </div>
                </div>
                <div class="flex items-center space-x-1.5 text-[10px] text-emerald-200/90 pt-1 mt-auto border-t border-emerald-700/50 truncate">
                  <span class="iconify text-xs shrink-0 text-emerald-300" data-icon="lucide:mouse-pointer-click"></span>
                  <span class="truncate text-emerald-100/90 font-medium">Double-click to deselect</span>
                </div>
              </div>
            `
          };
        }

        const props = arg.event.extendedProps || {};
        const isPrivate = !!props.isPrivate;
        const timeText = (props.startTime && props.endTime) 
          ? `${props.startTime} – ${props.endTime}` 
          : arg.timeText;
        const title = arg.event.title || 'Reserved Meeting';
        const organizer = props.requesterName;
        const dept = props.requesterDept;

        // Compact horizontal layout for 30-minute booked meetings
        if (isShortSlot) {
          return {
            html: `
              <div class="h-full w-full flex items-center justify-between px-2 sm:px-2.5 py-0.5 select-none overflow-hidden font-sans text-white leading-tight">
                <div class="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                  <span class="inline-flex items-center space-x-1 font-mono text-[11px] font-bold ${isPrivate ? 'text-amber-200' : 'text-amber-300'} shrink-0">
                    <span class="iconify text-xs shrink-0" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:clock'}"></span>
                    <span>${timeText}</span>
                  </span>
                  <span class="text-stone-400 shrink-0 text-[10px]">&bull;</span>
                  <span class="font-heading font-bold text-xs text-white truncate drop-shadow-xs">
                    ${title}
                  </span>
                  ${organizer ? `
                    <span class="hidden md:inline text-stone-400 shrink-0 text-[10px]">&bull;</span>
                    <span class="hidden md:inline text-[10px] text-stone-300 truncate">${organizer}</span>
                  ` : ''}
                </div>
                <span class="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isPrivate ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40' : 'bg-black/30 text-amber-200 border border-amber-400/30'} shrink-0">
                  ${isPrivate ? 'Private' : 'Booked'}
                </span>
              </div>
            `
          };
        }

        return {
          html: `
            <div class="h-full w-full flex flex-col justify-between px-2.5 py-1.5 select-none overflow-hidden leading-tight font-sans text-white">
              <div class="space-y-0.5">
                <div class="flex items-center justify-between gap-1.5">
                  <span class="inline-flex items-center space-x-1 font-mono text-[11px] font-bold ${isPrivate ? 'text-amber-200' : 'text-amber-300'}">
                    <span class="iconify text-xs shrink-0" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:clock'}"></span>
                    <span>${timeText}</span>
                  </span>
                  <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isPrivate ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40' : 'bg-black/30 text-amber-200 border border-amber-400/30'}">
                    ${isPrivate ? 'Private' : 'Booked'}
                  </span>
                </div>
                <div class="font-heading font-bold text-xs sm:text-[13px] text-white line-clamp-1 leading-snug drop-shadow-xs tracking-tight">
                  ${title}
                </div>
              </div>
              ${organizer ? `
                <div class="flex items-center space-x-1.5 text-[10px] text-stone-200 pt-1 mt-auto border-t ${isPrivate ? 'border-amber-700/50' : 'border-red-800/60'} truncate">
                  <span class="iconify text-xs shrink-0 text-white" data-icon="lucide:user"></span>
                  <span class="truncate font-semibold text-white">${organizer}</span>
                  ${dept ? `<span class="text-stone-400">&bull;</span><span class="truncate text-stone-300">${dept.split('&bull;')[0].trim()}</span>` : ''}
                </div>
              ` : ''}
            </div>
          `
        };
      },
      select: (info) => {
        // Prevent race condition if user just double-clicked to deselect
        if (Date.now() - (this.justDeselected || 0) < 400) {
          if (this.timelineCalendar) this.timelineCalendar.unselect();
          return;
        }

        if (info.start < new Date()) {
          if (window.app && window.app.showToast) {
            window.app.showToast("Time Has Passed", "You cannot book past time slots.", "warning");
          }
          if (this.timelineCalendar) this.timelineCalendar.unselect();
          return;
        }

        const dateStr = info.startStr.substring(0, 10);
        const startTime = info.startStr.substring(11, 16);
        const endTime = info.endStr.substring(11, 16);

        this.setSelectedTimelineSlot({
          roomId,
          date: dateStr,
          startTime,
          endTime
        });
      },
      eventClick: (info) => {
        if (info.event.display === 'background') return;
        const props = info.event.extendedProps || {};
        if (window.app && window.app.showToast) {
          window.app.showToast(
            "Slot Already Booked", 
            `Reserved: ${props.meetingTitle || 'Meeting'} (${props.startTime} - ${props.endTime}). Please click an open green slot.`,
            "warning"
          );
        }
      }
    });

    this.timelineCalendar.render();
    setTimeout(() => {
      if (this.timelineCalendar) this.timelineCalendar.updateSize();
    }, 100);

    // Double-click on calendar grid, mirror, or highlight to deselect slot
    calendarEl.addEventListener('dblclick', (e) => {
      // Don't deselect if double-clicking on an actual booked meeting (unless it's the selection mirror)
      const bookedEl = e.target.closest('.fc-event-booked-public, .fc-event-booked-private');
      if (bookedEl && !bookedEl.classList.contains('fc-event-mirror') && !bookedEl.closest('.fc-event-mirror')) {
        return;
      }
      if (this.selectedTimelineSlot) {
        e.preventDefault();
        e.stopPropagation();
        this.resetTimelineSelection(false);
      }
    });

    // Live update mirror title when typing in the Meeting Title field
    const titleInput = document.getElementById('timeline-modal-title');
    if (titleInput && !titleInput._hasMirrorTitleListener) {
      titleInput._hasMirrorTitleListener = true;
      titleInput.addEventListener('input', () => {
        const mirrorTitleEl = calendarEl.querySelector('.fc-event-mirror .modal-mirror-title');
        if (mirrorTitleEl) {
          mirrorTitleEl.innerText = titleInput.value.trim() || 'Selected Meeting Slot';
        }
      });
    }

    // Auto-select the first available slot after current time (convenience for the user)
    this.autoSelectFirstAvailableSlot(roomId, dateString);
  },

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

      const isAvail = bookingStore.isSlotAvailable 
        ? bookingStore.isSlotAvailable(roomId, dateString, candidateStart, candidateEnd)
        : (bookingStore.checkBookingConflict ? !bookingStore.checkBookingConflict(roomId, dateString, candidateStart, candidateEnd).hasConflict : true);

      if (isAvail) {
        this.setSelectedTimelineSlot({
          roomId,
          date: dateString,
          startTime: candidateStart,
          endTime: candidateEnd
        });
        if (this.timelineCalendar) {
          this.timelineCalendar.select(`${dateString}T${candidateStart}:00`, `${dateString}T${candidateEnd}:00`);
          setTimeout(() => {
            const calendarEl = document.getElementById('timeline-modal-calendar');
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
  },

  confirmTimelineSlotAndProceed() {
    if (!this.selectedTimelineSlot) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Select a Time Slot", "Please click or drag an open slot on the timeline schedule first.", "warning");
      }
      return;
    }

    const { roomId, date, startTime, endTime } = this.selectedTimelineSlot;
    const titleInput = document.getElementById('timeline-modal-title');
    const room = bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0];
    const meetingTitle = titleInput?.value.trim() || `Meeting in ${room.name}`;

    // Availability validation check
    const conflict = bookingStore.checkBookingConflict
      ? bookingStore.checkBookingConflict(roomId, date, startTime, endTime)
      : { hasConflict: false };

    if (conflict.hasConflict) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Slot Not Available", conflict.message || "This slot overlaps with another meeting. Please select another slot.", "error");
      }
      return;
    }

    this.closeBookingTimelineModal();

    // Directly start booking form at Step 2 (Food & IT Support)
    if (window.NBC && window.NBC.views && window.NBC.views['request-form']) {
      window.NBC.views['request-form'].startFromTimelineSelection({
        roomId,
        date,
        startTime,
        endTime,
        meetingTitle
      });
    } else if (window.app && window.app.selectRoomAndProceed) {
      window.app.selectRoomAndProceed(roomId);
    }
  },

  // Legacy wrappers for backward compatibility
  open(roomId) {
    this.openBookingTimelineModal(roomId);
  },
  close() {
    this.closeBookingTimelineModal();
  },
  openSimplePrivateModal(roomId) {
    this.openBookingTimelineModal(roomId);
  },
  closeSimplePrivateModal() {
    this.closeBookingTimelineModal();
  }
};
