// Room Details View Component (view-room-details)
// Option 4: Modern Executive Studio Deck (NBC Crimson Heritage & Cafe Design System)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomDetailsView {
  constructor() {
    this.id = 'room-details';
    this.currentRoomDetailsId = 'ROOM-101';
    this.currentModalRoom = null;
    this.currentModalImageIndex = 0;
    this.selectedDayIndex = 0; // 0: Today, 1: Tomorrow, 2: Day+2
    this.selectedDate = this.getTodayDateString();
    this.selectedSlotId = 'slot-1';
    this.selectedSlot = null;
    this.showDrawer = false;
    this.copied = false;
    this.days = [];
    this.slots = [];
  }

  getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  generateDays() {
    const days = [];
    const now = new Date();
    
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const weekdayShort = d.toLocaleString('en-US', { weekday: 'short' });

      let label = '';
      if (i === 0) {
        label = `Today, ${d.getDate()} ${monthShort}`;
      } else if (i === 1) {
        label = `Tomorrow, ${d.getDate()} ${monthShort}`;
      } else {
        label = `${weekdayShort}, ${d.getDate()} ${monthShort}`;
      }

      days.push({
        id: `day-${i}`,
        index: i,
        date: dateStr,
        label: label
      });
    }
    return days;
  }

  generateSlots(roomId, dateString) {
    const baseSlots = [
      { id: 'slot-1', startTime: '08:00', endTime: '09:00', duration: '60 mins', title: 'Early Morning Sync' },
      { id: 'slot-2', startTime: '09:00', endTime: '10:00', duration: '60 mins', title: 'Department Session' },
      { id: 'slot-3', startTime: '10:00', endTime: '11:00', duration: '60 mins', title: 'Mid-Morning Review' },
      { id: 'slot-4', startTime: '11:00', endTime: '12:00', duration: '60 mins', title: 'Executive Discussion' },
      { id: 'slot-5', startTime: '13:00', endTime: '14:00', duration: '60 mins', title: 'Early Afternoon Briefing' },
      { id: 'slot-6', startTime: '14:00', endTime: '15:00', duration: '60 mins', title: 'Afternoon Committee' },
      { id: 'slot-7', startTime: '15:00', endTime: '16:00', duration: '60 mins', title: 'Strategy Planning' },
      { id: 'slot-8', startTime: '16:00', endTime: '17:00', duration: '60 mins', title: 'Late Wrap-Up Session' }
    ];

    const todayStr = this.getTodayDateString();
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    return baseSlots.map(slot => {
      const timeStr = `${slot.startTime} – ${slot.endTime}`;
      let isBooked = false;
      let meetingInfo = null;

      // Check conflict with bookingStore
      if (typeof bookingStore !== 'undefined' && bookingStore.checkBookingConflict) {
        const conflict = bookingStore.checkBookingConflict(roomId, dateString, slot.startTime, slot.endTime);
        if (conflict.hasConflict) {
          isBooked = true;
          // Find the matching booking to display title
          if (bookingStore.requests) {
            const req = bookingStore.requests.find(r => {
              const rRoomId = r.room?.id || r.roomId;
              if (rRoomId !== roomId) return false;
              const st = (r.status || '').toLowerCase();
              if (st.includes('reject') || st.includes('cancel')) return false;
              
              if (r.date === dateString) {
                return (r.startTime < slot.endTime && r.endTime > slot.startTime);
              }
              if (r.sessions && Array.isArray(r.sessions)) {
                return r.sessions.some(s => s.date === dateString && s.startTime < slot.endTime && s.endTime > slot.startTime);
              }
              return false;
            });
            if (req) {
              const isPriv = !!req.isPrivateRequest || !!req.room?.isPrivate;
              meetingInfo = {
                title: isPriv ? 'Reserved (Private Session)' : (req.meetingTitle || 'Executive Session'),
                organizer: req.requester?.name || 'NBC Staff',
                dept: req.requester?.department || 'Operations',
                ref: req.referenceCode || 'NBC-RESERVED'
              };
            }
          }
        }
      }

      // Check if past today
      if (dateString === todayStr) {
        const [sH, sM] = slot.startTime.split(':').map(Number);
        if (sH * 60 + sM < nowMins) {
          isBooked = true;
          if (!meetingInfo) {
            meetingInfo = {
              title: 'Time Slot Elapsed',
              organizer: 'NBC Operations',
              dept: 'Daily Schedule',
              ref: 'PASSED'
            };
          }
        }
      }

      return {
        ...slot,
        time: timeStr,
        booked: isBooked,
        meetingInfo: meetingInfo
      };
    });
  }

  openFullSchedule() {
    if (!this.currentModalRoom) return;
    const roomId = this.currentModalRoom.id;
    const selectedDate = this.selectedDate;
    if (window.app && window.app.selectRoomAndProceed) {
      window.app.selectRoomAndProceed(roomId, 'room-details', selectedDate);
    } else if (window.NBC.views['request-form'] && window.NBC.views['request-form'].selectRoomAndProceed) {
      window.NBC.views['request-form'].selectRoomAndProceed(roomId, 'room-details', selectedDate);
    } else {
      this.navigateTo('request-form', { roomId, date: selectedDate, fromView: 'room-details' });
    }
  }

  getAmenityIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('tv') || n.includes('screen') || n.includes('display') || n.includes('wall') || n.includes('matrix')) return 'lucide:monitor';
    if (n.includes('video') || n.includes('camera') || n.includes('polycom') || n.includes('rig')) return 'lucide:video';
    if (n.includes('wifi') || n.includes('wi-fi') || n.includes('network') || n.includes('lan')) return 'lucide:wifi';
    if (n.includes('chair') || n.includes('seat') || n.includes('furniture')) return 'lucide:armchair';
    if (n.includes('coffee') || n.includes('refreshment') || n.includes('tea') || n.includes('bar')) return 'lucide:coffee';
    if (n.includes('whiteboard') || n.includes('board') || n.includes('marker')) return 'lucide:presentation';
    if (n.includes('projector')) return 'lucide:projector';
    if (n.includes('mic') || n.includes('audio') || n.includes('bose') || n.includes('speaker') || n.includes('sound')) return 'lucide:mic';
    if (n.includes('share') || n.includes('cast') || n.includes('clickshare')) return 'lucide:cast';
    if (n.includes('air') || n.includes('ac') || n.includes('cooling')) return 'lucide:wind';
    return 'lucide:check-circle-2';
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
    if (params.roomId) this.currentRoomDetailsId = params.roomId;
    if (params.initialIndex !== undefined) this.currentModalImageIndex = params.initialIndex;
    if (params.date) {
      this.selectedDate = params.date;
    } else {
      this.selectedDate = this.getTodayDateString();
    }
  }

  render(container, params = {}) {
    if (!container) return;
    const roomId = params.roomId || this.currentRoomDetailsId || 'ROOM-101';
    this.currentRoomDetailsId = roomId;
    this.currentModalImageIndex = params.initialIndex !== undefined ? params.initialIndex : 0;
    
    container.innerHTML = `
      <div id="view-room-details" class="w-full"></div>
    `;
    this.renderRoomDetailsPage(roomId);
  }

  openRoomDetailsPage(roomId, initialIndex = 0) {
    this.currentRoomDetailsId = roomId;
    this.currentModalImageIndex = initialIndex;
    this.navigateTo('room-details', { roomId });
  }

  navigateModalRoomImage(delta) {
    if (!this.currentModalRoom) return;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === this.currentModalRoom.id) : null;
    const images = initRoom?.images || this.currentModalRoom.images || [this.currentModalRoom.image];
    this.currentModalImageIndex = (this.currentModalImageIndex + delta + images.length) % images.length;
    this.updateImageGalleryUI(images);
  }

  setModalRoomImage(index) {
    if (!this.currentModalRoom) return;
    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === this.currentModalRoom.id) : null;
    const images = initRoom?.images || this.currentModalRoom.images || [this.currentModalRoom.image];
    this.currentModalImageIndex = index;
    this.updateImageGalleryUI(images);
  }

  updateImageGalleryUI(images) {
    const mainImgEl = document.getElementById('modal-active-room-img');
    const counterEl = document.getElementById('room-photo-counter');
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);
    
    if (mainImgEl) {
      mainImgEl.src = images[currentIndex] || images[0];
    }
    if (counterEl) {
      counterEl.innerText = `${currentIndex + 1} / ${images.length}`;
    }

    // Update thumbnail border rings
    const thumbs = document.querySelectorAll('.room-thumb-btn');
    thumbs.forEach((thumb, idx) => {
      if (idx === currentIndex) {
        thumb.className = 'room-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-[#991B1B] shadow-xs opacity-100 cursor-pointer transition';
      } else {
        thumb.className = 'room-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-[#E9E3DD] opacity-50 hover:opacity-90 cursor-pointer transition';
      }
    });
  }


  selectDay(dayIndex) {
    if (!this.days[dayIndex]) return;
    this.selectedDayIndex = dayIndex;
    this.selectedDate = this.days[dayIndex].date;
    
    // Refresh slots for new date
    this.slots = this.generateSlots(this.currentModalRoom.id, this.selectedDate);
    
    // Default to first available slot on this date
    const firstAvail = this.slots.find(s => !s.booked);
    if (firstAvail) {
      this.selectedSlotId = firstAvail.id;
      this.selectedSlot = firstAvail;
    } else {
      this.selectedSlotId = this.slots[0].id;
      this.selectedSlot = this.slots[0];
    }

    this.renderSlotsUI();
    this.updateDayPillsUI();
  }

  selectSlot(slotId) {
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) return;

    if (slot.booked) {
      if (slot.meetingInfo) {
        this.openMeetingModal({
          displayTitle: slot.meetingInfo.title,
          meetingTitle: slot.meetingInfo.title,
          referenceCode: slot.meetingInfo.ref,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: this.selectedDate,
          requesterName: slot.meetingInfo.organizer,
          requesterDept: slot.meetingInfo.dept,
          purpose: "Reserved meeting on official department calendar.",
          attendees: 12
        });
      } else {
        this.showToast("Slot Occupied", `This slot (${slot.time}) is already reserved. Please select another slot.`, "warning");
      }
      return;
    }

    this.selectedSlotId = slotId;
    this.selectedSlot = slot;
    this.renderSlotsUI();
  }

  proceedToBooking() {
    if (!this.currentModalRoom) return;
    const roomId = this.currentModalRoom.id;
    const selectedDate = this.selectedDate;
    const slot = this.selectedSlot;

    if (slot && !slot.booked) {
      const { startTime, endTime } = slot;
      if (window.app && window.app.selectRoomAndProceed) {
        window.app.selectRoomAndProceed(roomId, 'room-details', selectedDate, startTime, endTime);
      } else if (window.NBC.views['request-form'] && window.NBC.views['request-form'].selectRoomAndProceed) {
        window.NBC.views['request-form'].selectRoomAndProceed(roomId, 'room-details', selectedDate, startTime, endTime);
      } else {
        this.navigateTo('request-form', { roomId, date: selectedDate, startTime, endTime, fromView: 'room-details' });
      }
    } else {
      if (window.app && window.app.selectRoomAndProceed) {
        window.app.selectRoomAndProceed(roomId, 'room-details', selectedDate);
      } else if (window.NBC.views['request-form'] && window.NBC.views['request-form'].selectRoomAndProceed) {
        window.NBC.views['request-form'].selectRoomAndProceed(roomId, 'room-details', selectedDate);
      } else {
        this.navigateTo('request-form', { roomId, date: selectedDate, fromView: 'room-details' });
      }
    }
  }

  toggleDrawer(show) {
    this.showDrawer = show;
    const drawerEl = document.getElementById('room-location-drawer');
    const backdropEl = document.getElementById('room-drawer-backdrop');
    const panelEl = document.getElementById('room-drawer-panel');
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

  updateDayPillsUI() {
    const track = document.getElementById('room-day-glider-track');
    if (!track) return;
    const buttons = track.querySelectorAll('.day-pill-btn');
    buttons.forEach((btn, idx) => {
      if (idx === this.selectedDayIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  renderSlotsUI() {
    const container = document.getElementById('room-time-slots-container');
    const summaryTime = document.getElementById('room-selected-slot-time');
    const summaryDur = document.getElementById('room-selected-slot-duration');
    
    if (this.selectedSlot) {
      if (summaryTime) summaryTime.innerText = this.selectedSlot.time;
      if (summaryDur) summaryDur.innerText = `(${this.selectedSlot.duration})`;
    }

    if (!container) return;

    container.innerHTML = this.slots.map(slot => {
      const isSelected = (this.selectedSlotId === slot.id && !slot.booked);
      const isOccupied = slot.booked;

      return `
        <div
          onclick="window.NBC.views['room-details'].selectSlot('${slot.id}')"
          class="time-slot-card flex items-center justify-between transition ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}"
          role="button"
          tabindex="0"
          title="${isOccupied ? (slot.meetingInfo ? slot.meetingInfo.title : 'Slot Reserved') : 'Click to select this slot'}"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOccupied ? 'bg-stone-200 text-stone-500' : (isSelected ? 'bg-[#991B1B] text-white' : 'bg-[#FAF7F4] border border-[#E9E3DD] text-[#7D6857]')}"
            >
              <span class="iconify text-sm" data-icon="${isOccupied ? 'lucide:lock' : 'lucide:clock'}" data-stroke-width="2"></span>
            </span>
            <div class="min-w-0">
              <span class="font-mono text-xs font-bold text-[#3E2B1E] block leading-tight">${slot.time}</span>
              <span class="text-[11px] text-[#7D6857] truncate block mt-0.5">${isOccupied ? (slot.meetingInfo ? slot.meetingInfo.title : 'Reserved') : slot.title}</span>
            </div>
          </div>

          <div class="shrink-0 ml-2">
            ${!isOccupied ? `
              <span
                class="w-5 h-5 rounded-full border flex items-center justify-center transition ${isSelected ? 'bg-[#991B1B] border-[#991B1B] text-white' : 'border-[#D8CFC7] bg-white'}"
              >
                ${isSelected ? '<span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2.5"></span>' : ''}
              </span>
            ` : `
              <span class="text-[11px] font-mono text-stone-400">Occupied</span>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  renderRoomDetailsPage(roomId) {
    const container = document.getElementById('view-room-details');
    if (!container) return;
    const room = (typeof bookingStore !== 'undefined') 
      ? (bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0])
      : null;
    if (!room) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-2xs space-y-3.5 my-4 animate-empty-state">
          <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
            <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:door-closed" data-stroke-width="1.8"></span>
          </div>
          <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Meeting Room Not Found</h3>
          <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">The requested room details could not be located or may have been removed.</p>
          <div class="pt-2">
            <button onclick="app.navigateTo('catalog')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] flex items-center gap-1.5 mx-auto transition cursor-pointer shadow-xs">
              <span class="iconify text-sm text-white" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
              <span>Back to Directory</span>
            </button>
          </div>
        </div>
      `;
      if (window.Iconify && window.Iconify.scan) {
        window.Iconify.scan(container);
      }
      return;
    }

    this.currentModalRoom = room;
    this.days = this.generateDays();
    if (!this.selectedDate || this.selectedDate < this.days[0].date) {
      this.selectedDate = this.days[0].date;
      this.selectedDayIndex = 0;
    }
    this.slots = this.generateSlots(room.id, this.selectedDate);

    // Ensure an initial slot is selected
    const firstAvail = this.slots.find(s => !s.booked);
    if (firstAvail) {
      this.selectedSlotId = firstAvail.id;
      this.selectedSlot = firstAvail;
    } else {
      this.selectedSlotId = this.slots[0].id;
      this.selectedSlot = this.slots[0];
    }

    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === room.id) : null;
    const images = initRoom?.images || room.images || [room.image];
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);
    const currentImg = images[currentIndex] || images[0];

    const mapInfo = (typeof bookingStore !== 'undefined') ? bookingStore.getRoomMapDetails(room) : {
      building: 'National Bank of Cambodia - Headquarters',
      address: 'No. 22-24, Preah Norodom Blvd, Phnom Penh, Cambodia',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770638148902!2d104.920556!3d11.573611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3107870560a6a445%3A0x6a0f7e4113e00b39!2sNational%20Bank%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1700000000000',
      directionsUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia',
      externalUrl: 'https://maps.google.com/?q=National+Bank+of+Cambodia'
    };

    const floorShort = room.floor.split('-')[0].trim();

    container.innerHTML = `
      <!-- Main Studio Viewport (Strictly No Full-Page Vertical Scroll on Desktop) -->
      <div class="flex flex-col gap-4 lg:h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)] lg:overflow-hidden select-none">
        
        <!-- Top Action Bar: Clean, Confident, Modern -->
        <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD] shrink-0">
          <div class="flex items-center gap-3">
            <button
              onclick="app.navigateTo('book-room')"
              class="h-9 px-3 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              type="button"
            >
              <span class="iconify text-[#7D6857] text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
              <span>Catalog</span>
            </button>
            <div class="h-4 w-px bg-[#E9E3DD]"></div>
            <div>
              <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] leading-tight flex items-center gap-2">
                <span>${room.name}</span>
              </h2>
            </div>
          </div>

          <!-- Quick Action Controls -->
          <div class="flex items-center gap-2.5">
            <!-- Slide-Over Map Drawer Button -->
            <button
              onclick="window.NBC.views['room-details'].toggleDrawer(true)"
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
          <!-- LEFT COLUMN: CINEMATIC SHOWCASE & SPECS (5 Cols)                -->
          <!-- =============================================================== -->
          <div class="lg:col-span-5 flex flex-col gap-4 overflow-hidden">

            <!-- Visual Stage Card -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-3 space-y-2.5 shadow-xs shrink-0">
              <div class="relative h-60 sm:h-64 rounded-xl overflow-hidden bg-stone-900 group select-none">
                <img id="modal-active-room-img" src="${currentImg}" alt="${room.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

                <!-- Top Floating Clean Pill Tags (Strictly No Badges) -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#260707]/90 text-white backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                    <span class="iconify text-xs" data-icon="${room.isPrivate ? 'lucide:lock' : 'lucide:globe'}" data-stroke-width="2"></span>
                    <span>${room.isPrivate ? 'Private Room' : 'Shared Room'}</span>
                  </span>

                  <span id="room-photo-counter" class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs border border-white/20">
                    ${currentIndex + 1} / ${images.length}
                  </span>
                </div>

                <!-- Left / Right Carousel Controls -->
                ${images.length > 1 ? `
                  <button
                    onclick="window.NBC.views['room-details'].navigateModalRoomImage(-1)"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition border border-white/20 cursor-pointer"
                    type="button"
                    title="Previous photo"
                  >
                    <span class="iconify text-sm" data-icon="lucide:chevron-left" data-stroke-width="2.5"></span>
                  </button>
                  <button
                    onclick="window.NBC.views['room-details'].navigateModalRoomImage(1)"
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
                    <span>${room.location ? room.location.split('-')[0].trim() : 'Headquarters'} • ${floorShort}</span>
                  </span>
                </div>
              </div>

              <!-- Thumbnail Strip Glider -->
              <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                ${images.map((img, idx) => `
                  <button
                    onclick="window.NBC.views['room-details'].setModalRoomImage(${idx})"
                    class="room-thumb-btn relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${idx === currentIndex ? 'border-[#991B1B] shadow-xs' : 'border-[#E9E3DD] opacity-50 hover:opacity-90'}"
                    type="button"
                    title="Photo ${idx + 1}"
                  >
                    <img src="${img}" alt="${room.name}" class="w-full h-full object-cover" />
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Room Specifications & 4-Metric Grid -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 flex-1 flex flex-col justify-between shadow-xs overflow-hidden">
              <div class="space-y-3">
                <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Key Room Metrics</h3>

                <!-- 3-Stat Metric Row -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Capacity</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${room.capacity} Seats</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Room Area</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${room.size}</strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] text-center">
                    <span class="text-[10px] font-semibold text-[#7D6857] block">Floor</span>
                    <strong class="font-mono text-xs font-bold text-[#3E2B1E] mt-0.5 block">${floorShort}</strong>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-xs text-[#6F5849] leading-relaxed line-clamp-3">
                  ${room.description}
                </p>
              </div>

              <!-- Bottom Footer Details -->
              <div class="pt-2.5 border-t border-[#E9E3DD] flex items-center justify-between text-xs text-[#6F5849]">
                <span class="flex items-center gap-1.5 truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:shield-check"></span>
                  <span class="truncate">${room.department}</span>
                </span>
                <span class="font-mono text-[11px] text-[#16A34A] font-semibold shrink-0 ml-2">Available Now</span>
              </div>
            </div>

          </div>

          <!-- =============================================================== -->
          <!-- RIGHT COLUMN: INTERACTIVE WORKSPACE (7 Cols)                    -->
          <!-- =============================================================== -->
          <div class="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
            
            <!-- Interactive Day Planner & Time Slot Engine -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex flex-col shrink-0 space-y-3.5">
              
              <!-- Section Header: Clean Bold Title + Day Glider Track -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E9E3DD]">
                <div>
                  <h3 class="font-heading font-bold text-sm sm:text-base text-[#3E2B1E] tracking-tight">Today's Schedule & Slot Picker</h3>
                </div>

                <!-- Day Selector Pills -->
                <div id="room-day-glider-track" class="day-glider-track">
                  ${this.days.map((d, idx) => `
                    <button
                      onclick="window.NBC.views['room-details'].selectDay(${idx})"
                      class="day-pill-btn ${idx === this.selectedDayIndex ? 'active' : ''}"
                      type="button"
                    >
                      <span>${d.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Time Slots 2-Column Grid (Internally scrollable for full 8 working hours) -->
              <div id="room-time-slots-container" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[160px] sm:max-h-[185px] overflow-y-auto no-scrollbar content-start pr-0.5">
                <!-- Rendered dynamically by renderSlotsUI -->
              </div>

              <!-- Booking Summary & Instant CTA Row -->
              <div class="pt-2.5 border-t border-[#E9E3DD]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-[#6F5849] min-w-0">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="iconify text-[#16A34A] text-sm shrink-0" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
                    <span class="truncate">Selected: <strong id="room-selected-slot-time" class="text-[#3E2B1E] font-mono">${this.selectedSlot ? this.selectedSlot.time : '08:00 – 09:00'}</strong> <span id="room-selected-slot-duration">(${this.selectedSlot ? this.selectedSlot.duration : '60 mins'})</span></span>
                  </div>
                  <span class="hidden sm:inline text-stone-300">&bull;</span>
                  <button
                    onclick="window.NBC.views['room-details'].openFullSchedule()"
                    class="text-[11px] font-semibold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1 cursor-pointer transition shrink-0"
                    type="button"
                    title="Open full weekly schedule and timeline"
                  >
                    <span>Custom Time / Full Week</span>
                    <span class="iconify text-xs" data-icon="lucide:chevron-right" data-stroke-width="2"></span>
                  </button>
                </div>

                <button
                  onclick="window.NBC.views['room-details'].proceedToBooking()"
                  class="w-full sm:w-auto h-10 px-5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer shrink-0"
                  type="button"
                >
                  <span class="iconify text-white text-sm" data-icon="lucide:calendar-clock" data-stroke-width="2"></span>
                  <span>Confirm & Book This Slot</span>
                </button>
              </div>
            </div>

            <!-- Equipment & Installed Capabilities Deck -->
            <div class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs flex-1 flex flex-col overflow-hidden">
              <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD] shrink-0">
                <h3 class="font-heading font-bold text-sm text-[#3E2B1E] tracking-tight">Installed Equipment & Capabilities</h3>
                <span class="font-mono text-xs text-[#7D6857]">${room.features.length} verified items</span>
              </div>

              <!-- Internal Scrollable Equipment Grid -->
              <div class="flex-1 overflow-y-auto no-scrollbar pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
                ${room.features.map(item => `
                  <div class="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] hover:border-stone-300 transition">
                    <span class="w-7 h-7 rounded-lg bg-white border border-[#E9E3DD] flex items-center justify-center text-[#991B1B] shrink-0">
                      <span class="iconify text-sm" data-icon="${this.getAmenityIcon(item)}" data-stroke-width="2"></span>
                    </span>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-[#3E2B1E] block truncate">${item}</span>
                      <span class="text-[10px] text-stone-400 block truncate">NBC Certified Hardware</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Location Quick Strip -->
              <div class="pt-3 border-t border-[#E9E3DD] flex items-center justify-between shrink-0 text-xs">
                <div class="flex items-center gap-2 text-[#6F5849] truncate">
                  <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  <span class="truncate">${mapInfo.building}</span>
                </div>
                <button
                  onclick="window.NBC.views['room-details'].toggleDrawer(true)"
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
      <div id="room-location-drawer" class="fixed inset-0 z-50 overflow-hidden hidden">
        <div id="room-drawer-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity opacity-0" onclick="window.NBC.views['room-details'].toggleDrawer(false)"></div>

        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div id="room-drawer-panel" class="w-screen max-w-md bg-white border-l border-[#E9E3DD] p-6 flex flex-col justify-between shadow-2xl space-y-5 transition-transform duration-300 translate-x-full">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-[#E9E3DD]">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center">
                    <span class="iconify text-base" data-icon="lucide:map-pin" data-stroke-width="2"></span>
                  </span>
                  <h3 class="font-heading font-bold text-base text-[#3E2B1E]">Facility Location & Access</h3>
                </div>
                <button
                  onclick="window.NBC.views['room-details'].toggleDrawer(false)"
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

      <!-- Meeting Details Modal (For Occupied Slot Clicks) -->
      <div id="room-meeting-details-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4" onclick="if(event.target === this) window.NBC.views['room-details'].closeMeetingModal()">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4" onclick="event.stopPropagation()">
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
            <div class="space-y-1">
              <span id="room-modal-meeting-ref" class="text-[10px] font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded border border-red-200">#NBC-RESERVED</span>
              <h3 id="room-modal-meeting-title" class="font-heading font-bold text-base text-stone-900 leading-tight">Meeting Title</h3>
            </div>
            <button onclick="window.NBC.views['room-details'].closeMeetingModal()" aria-label="Close" class="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer">
              <span class="iconify text-base" data-icon="lucide:x"></span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
              <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Time & Date</span>
              <strong id="room-modal-meeting-time" class="text-stone-900 text-xs block mt-0.5 font-bold">08:30 – 10:00</strong>
              <span id="room-modal-meeting-date" class="text-[10px] text-stone-500 block">2026-09-17</span>
            </div>
            <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
              <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Organizer</span>
              <strong id="room-modal-meeting-organizer" class="text-stone-900 text-xs block mt-0.5 truncate font-bold">NBC Staff</strong>
              <span id="room-modal-meeting-dept" class="text-[10px] text-stone-500 block truncate">Operations</span>
            </div>
          </div>

          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Meeting Details / Purpose</span>
            <p id="room-modal-meeting-purpose" class="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed">Official department session.</p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
            <span id="room-modal-meeting-attendees" class="text-stone-500 font-medium">12 Attendees</span>
            <button onclick="window.NBC.views['room-details'].closeMeetingModal()" class="btn-primary px-4 py-1.5 rounded-lg text-xs font-bold shadow-2xs">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    // Render slots initially
    this.renderSlotsUI();
  }

  openMeetingModal(meeting) {
    if (!meeting) return;
    const modalEl = document.getElementById('room-meeting-details-modal');
    if (!modalEl) return;

    const titleEl = document.getElementById('room-modal-meeting-title');
    const refEl = document.getElementById('room-modal-meeting-ref');
    const timeEl = document.getElementById('room-modal-meeting-time');
    const dateEl = document.getElementById('room-modal-meeting-date');
    const orgEl = document.getElementById('room-modal-meeting-organizer');
    const deptEl = document.getElementById('room-modal-meeting-dept');
    const attEl = document.getElementById('room-modal-meeting-attendees');
    const purpEl = document.getElementById('room-modal-meeting-purpose');

    if (titleEl) titleEl.innerText = meeting.displayTitle || meeting.meetingTitle || 'Scheduled Meeting';
    if (refEl) refEl.innerText = meeting.referenceCode ? `#${meeting.referenceCode}` : '#NBC-RESERVED';
    if (timeEl) timeEl.innerText = `${meeting.startTime} – ${meeting.endTime}`;
    if (dateEl) dateEl.innerText = meeting.date || '';
    if (orgEl) orgEl.innerText = meeting.requesterName || 'NBC Staff';
    if (deptEl) deptEl.innerText = meeting.requesterDept || 'Operations';
    if (attEl) attEl.innerText = `${meeting.attendees || 1} Attendees`;

    if (purpEl) {
      purpEl.innerText = meeting.purpose || "Official department meeting and team discussion.";
    }

    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  }

  closeMeetingModal() {
    const modalEl = document.getElementById('room-meeting-details-modal');
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
    }
  }
}

window.NBC.views['room-details'] = new RoomDetailsView();
