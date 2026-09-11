// Room Details View Component (view-room-details)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class RoomDetailsView {
  constructor() {
    this.id = 'room-details';
    this.currentRoomDetailsId = 'ROOM-101';
    this.currentModalRoom = null;
    this.currentModalImageIndex = 0;
    this.selectedTimelineDate = new Date().toISOString().split('T')[0];
    this.currentStep = 1;
    if (window.app) {
      window.app.roomDetailsGoToStep = (step) => this.goToStep(step);
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    const step1El = document.getElementById('room-details-step-1');
    const step2El = document.getElementById('room-details-step-2');
    
    if (step1El && step2El) {
      if (stepNumber === 1) {
        step1El.classList.remove('hidden');
        step2El.classList.add('hidden');
      } else {
        step1El.classList.add('hidden');
        step2El.classList.remove('hidden');
      }
    }

    // Update wizard tracker tabs
    const tab1 = document.getElementById('room-wizard-tab-1');
    const tab2 = document.getElementById('room-wizard-tab-2');

    if (tab1 && tab2) {
      if (stepNumber === 1) {
        tab1.className = 'room-wizard-step-tab active h-8 px-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0';
        tab1.innerHTML = `<span class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold">1</span><span>Room Overview</span>`;
        
        tab2.className = 'room-wizard-step-tab h-8 px-2.5 rounded-lg bg-transparent border border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFEA] font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0';
        tab2.innerHTML = `<span class="w-5 h-5 rounded-full bg-[#E9E3DD] text-[#78716C] flex items-center justify-center text-[11px] font-bold">2</span><span>Building & Map</span>`;
      } else {
        tab1.className = 'room-wizard-step-tab completed h-8 px-2.5 rounded-lg bg-transparent border border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFEA] font-medium text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0';
        tab1.innerHTML = `<span class="w-5 h-5 rounded-full bg-[#E9E3DD] text-[#1C1917] flex items-center justify-center text-[11px] font-bold"><span class="iconify" data-icon="lucide:check"></span></span><span>Room Overview</span>`;
        
        tab2.className = 'room-wizard-step-tab active h-8 px-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-semibold text-[13px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0';
        tab2.innerHTML = `<span class="w-5 h-5 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] font-bold">2</span><span>Building & Map</span>`;
      }
    }

    const container = document.getElementById('view-room-details');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setTimelineDate(dateString) {
    if (!dateString) return;
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    if (dateString < todayStr) {
      this.showToast("Past Date", "Cannot book in the past. Showing today's schedule.", "warning");
      dateString = todayStr;
    }

    this.selectedTimelineDate = dateString;
    if (this.currentModalRoom) {
      this.renderRoomDetailsPage(this.currentModalRoom.id);
    }
  }

  handleBookSlotClick(roomId, date, startTime, endTime) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const nowMins = today.getHours() * 60 + today.getMinutes();

    if (date < todayStr) {
      this.showToast("Time Has Passed", "You cannot book meetings in the past. Please select today or a future date.", "warning");
      return;
    }

    const startMins = bookingStore.timeToMinutes(startTime);
    const endMins = bookingStore.timeToMinutes(endTime);

    if (date === todayStr) {
      if (endMins <= nowMins) {
        this.showToast("Time Has Passed", "This slot has already elapsed today. Please select an upcoming slot.", "warning");
        return;
      }

      // If slot began in the past, adjust start time forward to the next rounded 15-min mark
      if (startMins < nowMins) {
        const roundedNextStart = Math.min(endMins - 15, Math.ceil((nowMins + 5) / 15) * 15);
        if (roundedNextStart < endMins) {
          startTime = bookingStore.minutesToTime(roundedNextStart);
        } else {
          this.showToast("Slot Elapsed", "Not enough remaining time in this slot.", "warning");
          return;
        }
      }
    }

    if (window.app && window.app.navigateTo) {
      window.app.navigateTo('request-form', {
        roomId,
        date,
        startTime,
        endTime,
        fromView: 'room-details'
      });
    }
  }

  getAmenityIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('tv') || n.includes('screen') || n.includes('display')) return 'lucide:tv';
    if (n.includes('video') || n.includes('camera') || n.includes('zoom')) return 'lucide:video';
    if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet') || n.includes('network')) return 'lucide:wifi';
    if (n.includes('chair') || n.includes('seat') || n.includes('furniture')) return 'lucide:armchair';
    if (n.includes('coffee') || n.includes('tea') || n.includes('drink') || n.includes('beverage')) return 'lucide:coffee';
    if (n.includes('whiteboard') || n.includes('board') || n.includes('marker')) return 'lucide:presentation';
    if (n.includes('projector')) return 'lucide:projector';
    if (n.includes('mic') || n.includes('audio') || n.includes('speaker') || n.includes('sound')) return 'lucide:mic';
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

  render(container, params = {}) {
    if (!container) return;
    const roomId = params.roomId || this.currentRoomDetailsId || 'ROOM-101';
    this.currentRoomDetailsId = roomId;
    const initialIndex = params.initialIndex !== undefined ? params.initialIndex : 0;
    this.currentStep = params.step || 1;
    container.innerHTML = `
      <div id="view-room-details" class="w-full space-y-4"></div>
    `;
    this.renderRoomDetailsPage(roomId, initialIndex);
  }

  init(params = {}) {
    if (params.roomId) this.currentRoomDetailsId = params.roomId;
    if (params.initialIndex !== undefined) this.currentModalImageIndex = params.initialIndex;
    if (params.step !== undefined) this.currentStep = params.step;
  }

  openRoomDetailsPage(roomId, initialIndex = 0) {
    this.currentRoomDetailsId = roomId;
    this.currentModalImageIndex = initialIndex;
    this.currentStep = 1;
    this.navigateTo('room-details', { roomId });
  }

  // Backward compatibility alias

  navigateModalRoomImage(delta) {
    if (!this.currentModalRoom) return;
    const images = this.currentModalRoom.images || [this.currentModalRoom.image];
    this.currentModalImageIndex = (this.currentModalImageIndex + delta + images.length) % images.length;
    this.renderRoomDetailsPage(this.currentModalRoom.id);
  }


  setModalRoomImage(index) {
    this.currentModalImageIndex = index;
    if (this.currentModalRoom) {
      this.renderRoomDetailsPage(this.currentModalRoom.id);
    }
  }


  renderRoomDetailsPage(roomId) {
    const container = document.getElementById('view-room-details');
    if (!container) return;
    const room = bookingStore.getRoomById(roomId) || bookingStore.getRooms()[0];
    if (!room) return;

    this.currentModalRoom = room;
    this.currentStep = this.currentStep || 1;
    const activeStep = this.currentStep;
    const isMyRoom = !!room.isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');
    const isOtherPrivate = !!room.isPrivate && !isMyRoom;
    const mapInfo = bookingStore.getRoomMapDetails(room);

    const initRoom = typeof INITIAL_ROOMS_DATA !== 'undefined' ? INITIAL_ROOMS_DATA.find(ir => ir.id === room.id) : null;
    const images = initRoom?.images || room.images || [room.image];
    const currentIndex = Math.min(this.currentModalImageIndex || 0, images.length - 1);
    const currentImg = images[currentIndex] || images[0];

    container.innerHTML = `
      <!-- Top Action Breadcrumb Bar with 2-Step Wizard Tracker -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E9E3DD]">
        <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button onclick="app.navigateTo('book-room')" aria-label="Back to all rooms" class="h-8 px-3 rounded-md bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-medium flex items-center space-x-1.5 transition shadow-2xs shrink-0 cursor-pointer">
            <span class="iconify text-stone-400 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
            <span>All Rooms</span>
          </button>
          <div class="hidden sm:flex items-center space-x-1.5 text-xs text-stone-400">
            <span>Facilities</span>
            <span>/</span>
            <span class="text-stone-700 font-medium">${room.name}</span>
          </div>
          ${room.isPrivate && room.roomOwner ? `
            <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-xs text-stone-600 shrink-0">
              <img src="${room.roomOwner.avatar || room.image}" alt="${room.roomOwner.name}" class="w-4 h-4 rounded-full object-cover shrink-0" />
              <span>Owner: <strong class="text-stone-900">${room.roomOwner.name}</strong>${isMyRoom ? ' <span class="text-[10px] font-bold text-amber-700">(You)</span>' : ''}</span>
            </div>
          ` : ''}
        </div>

        <!-- Wizard Step Navigation Tracker (2 Steps) -->
        <div class="flex items-center space-x-1 text-xs shrink-0">
          <button type="button" onclick="window.NBC.views['room-details'].goToStep(1)" id="room-wizard-tab-1" class="room-wizard-step-tab ${activeStep === 1 ? 'active bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] shadow-2xs font-semibold' : 'bg-transparent border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFEA] font-medium'} h-8 px-2.5 rounded-lg border text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
            <span class="w-5 h-5 rounded-full ${activeStep === 1 ? 'bg-[#991B1B] text-white' : 'bg-[#E9E3DD] text-[#78716C]'} flex items-center justify-center text-[11px] font-bold">1</span>
            <span>Room Overview</span>
          </button>
          <span class="iconify text-[#78716C] text-[10px] shrink-0 mx-0.5" data-icon="lucide:chevron-right"></span>
          <button type="button" onclick="window.NBC.views['room-details'].goToStep(2)" id="room-wizard-tab-2" class="room-wizard-step-tab ${activeStep === 2 ? 'active bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] shadow-2xs font-semibold' : 'bg-transparent border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFEA] font-medium'} h-8 px-2.5 rounded-lg border text-[13px] flex items-center space-x-1.5 transition cursor-pointer shrink-0">
            <span class="w-5 h-5 rounded-full ${activeStep === 2 ? 'bg-[#991B1B] text-white' : 'bg-[#E9E3DD] text-[#78716C]'} flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Building & Map</span>
          </button>
        </div>
      </div>

      <!-- ==================== STEP 1: ROOM OVERVIEW & AMENITIES ==================== -->
      <div id="room-details-step-1" class="${activeStep === 1 ? '' : 'hidden'} space-y-4 animate-fade-in">
        <!-- Main Room Showcase Card (2-Column Layout) -->
        <div class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-xs p-4 sm:p-6 lg:p-7">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <!-- LEFT COLUMN: PHOTO GALLERY (lg:col-span-6) -->
          <div class="lg:col-span-6 space-y-3">
            
            <!-- Multi-Image Hero Stage -->
            <div class="relative h-72 sm:h-96 lg:h-[420px] rounded-2xl bg-stone-950 overflow-hidden group select-none shadow-xs border border-stone-200">
              <img id="modal-active-room-img" src="${currentImg}" alt="${room.name}" class="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.01]" />
              
              <!-- Subtle Contrast Vignette -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none"></div>

              <!-- Top Floating Controls -->
              <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center space-x-1.5">
                    <span class="iconify text-white text-xs" data-icon="lucide:camera" data-stroke-width="2"></span>
                    <span>Photo ${currentIndex + 1} of ${images.length}</span>
                  </span>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${(room.status || 'Available').toLowerCase() === 'available' ? 'bg-emerald-700 text-white' : 'bg-[#991B1B] text-white'} shadow-xs flex items-center space-x-1.5">
                    <span class="w-1.5 h-1.5 rounded-full ${(room.status || 'Available').toLowerCase() === 'available' ? 'bg-emerald-200' : 'bg-red-200'}"></span>
                    <span>${room.status || 'Available'}</span>
                  </span>
                </div>

                <div class="flex items-center space-x-1.5">
                  <button onclick="window.NBC.views['room-details'].toggleAddPhotoDrawer()" aria-label="Add new photo" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 hover:bg-white text-stone-900 backdrop-blur-md border border-white/40 shadow-xs flex items-center space-x-1 transition hover:scale-105 cursor-pointer">
                    <span class="iconify text-xs text-red-900" data-icon="lucide:image-plus" data-stroke-width="2"></span>
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              <!-- Carousel Nav Buttons -->
              ${images.length > 1 ? `
                <button onclick="app.navigateModalRoomImage(-1)" aria-label="Previous image" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition shadow-lg hover:scale-105 cursor-pointer">
                  <span class="iconify text-base" data-icon="lucide:chevron-left" data-stroke-width="2.5"></span>
                </button>
                <button onclick="app.navigateModalRoomImage(1)" aria-label="Next image" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition shadow-lg hover:scale-105 cursor-pointer">
                  <span class="iconify text-base" data-icon="lucide:chevron-right" data-stroke-width="2.5"></span>
                </button>
              ` : ''}
            </div>

            <!-- Expandable Photo Adder Tray (Hidden by default) -->
            <div id="modal-add-photo-tray" class="hidden p-3 rounded-xl bg-stone-900 text-white space-y-2.5 border border-stone-700 animate-fade-in">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold flex items-center space-x-1.5">
                  <span class="iconify text-white" data-icon="lucide:link"></span>
                  <span>Add Photo from URL or File</span>
                </span>
                <label class="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer">
                  Upload file
                  <input type="file" accept="image/*" onchange="app.handlePhotoFileUpload(event)" class="hidden" />
                </label>
              </div>
              <div class="flex gap-2">
                <input type="url" id="modal-new-photo-url" placeholder="https://..." class="bank-input text-xs bg-stone-800 text-white border-stone-700 flex-1" />
                <button onclick="app.handleAddPhotoSubmit()" class="btn-primary px-3 py-2 rounded-lg text-xs font-bold shrink-0">
                  Save Photo
                </button>
              </div>
            </div>

            <!-- Thumbnail Strip: Clean, Light, Integrated -->
            <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
              ${images.map((img, idx) => `
                <button onclick="app.setModalRoomImage(${idx})" aria-label="View photo ${idx + 1}" class="relative h-14 w-20 rounded-xl overflow-hidden shrink-0 transition-all duration-200 border cursor-pointer ${idx === currentIndex ? 'ring-2 ring-red-900 ring-offset-2 ring-offset-white border-transparent scale-102 opacity-100 shadow-sm' : 'border-stone-200 opacity-50 hover:opacity-90'}">
                  <img src="${img}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" />
                </button>
              `).join('')}
            </div>

          </div>

          <!-- RIGHT COLUMN: ROOM INFO & AMENITIES (lg:col-span-6) -->
          <div class="lg:col-span-6 flex flex-col justify-between space-y-5">
            
            <div class="space-y-4">
              <!-- Room Header: Title, Category, and Department -->
              <div class="space-y-2 pb-3 border-b border-stone-100">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${room.isPrivate ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-stone-100 text-stone-700 border border-stone-200'}">
                    ${room.category || 'Meeting Room'}
                  </span>
                  ${room.isPrivate ? `
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-200 flex items-center space-x-1">
                      <span class="iconify text-[11px]" data-icon="lucide:lock"></span>
                      <span>Private Room</span>
                    </span>
                  ` : `
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1">
                      <span class="iconify text-[11px]" data-icon="lucide:check-circle"></span>
                      <span>Shared Room</span>
                    </span>
                  `}
                </div>
                
                <h1 class="text-2xl sm:text-3xl font-heading font-black text-stone-900 tracking-tight leading-tight">${room.name}</h1>
                
                <p class="text-xs text-stone-500 font-medium flex items-center space-x-1.5 flex-wrap">
                  <span class="iconify text-stone-400 shrink-0 text-sm" data-icon="lucide:building-2"></span>
                  <span class="text-stone-700 font-semibold">${room.department}</span>
                  <span class="text-stone-300">&bull;</span>
                  <span class="text-stone-800 font-bold">${room.floor.split('(')[0].trim()}</span>
                </p>
              </div>

              <!-- Editorial Room Description -->
              <p class="text-stone-600 text-sm leading-relaxed">${room.description}</p>

              <!-- Sleek Metric Strip (Single Unified 3-Col Card with Dividers) -->
              <div class="grid grid-cols-3 py-3 px-3 sm:px-4 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] divide-x divide-stone-200/80">
                <div class="pr-2 sm:pr-3 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Capacity</span>
                  <div class="flex items-center justify-center space-x-1 mt-1 text-stone-900">
                    <span class="iconify text-stone-400 text-sm" data-icon="lucide:users"></span>
                    <strong class="text-base sm:text-lg font-heading font-bold">${room.capacity}</strong>
                    <span class="text-xs text-stone-500 font-medium">Seats</span>
                  </div>
                </div>

                <div class="px-2 sm:px-3 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Room Size</span>
                  <div class="flex items-center justify-center space-x-1 mt-1 text-stone-900">
                    <span class="iconify text-stone-400 text-sm" data-icon="lucide:maximize-2"></span>
                    <strong class="text-base sm:text-lg font-heading font-bold">${room.size}</strong>
                  </div>
                </div>

                <div class="pl-2 sm:pl-3 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Door Code</span>
                  <div class="flex items-center justify-center space-x-1 mt-1 text-stone-900">
                    <span class="iconify text-stone-400 text-sm" data-icon="lucide:key-round"></span>
                    <strong class="text-xs sm:text-sm font-heading font-bold text-stone-800 truncate max-w-[110px]" title="${room.doorNumber || 'Main Entry'}">${room.doorNumber || 'Main Entry'}</strong>
                  </div>
                </div>
              </div>

              <!-- Equipment & Facilities (Fluid Chips with Custom Semantic Icons) -->
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <span class="iconify text-red-900 text-xs" data-icon="lucide:layout-grid"></span>
                    <span>Equipment & Facilities</span>
                  </span>
                  <span class="text-[11px] text-stone-400 font-medium">${room.features.length} available</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  ${room.features.map(f => `
                    <span class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F4] hover:bg-[#F2ECE4] border border-[#E9E3DD] text-xs font-medium text-stone-700 transition shadow-2xs">
                      <span class="iconify text-red-900/80 text-sm" data-icon="${this.getAmenityIcon(f)}"></span>
                      <span>${f}</span>
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Primary Booking CTA & Next Step Navigation -->
            <div class="pt-3 border-t border-stone-100 space-y-2.5">
              <div class="flex flex-col sm:flex-row items-center gap-2.5">
                <button type="button" onclick="window.NBC.views['room-details'].goToStep(2)" class="w-full sm:w-auto h-11 px-5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[13px] font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0">
                  <span>View Building & Map</span>
                  <span class="iconify text-sm text-stone-400" data-icon="lucide:arrow-right"></span>
                </button>

                ${isMyRoom ? `
                  <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="flex-1 w-full min-h-[44px] py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition hover:scale-[1.005] bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 border border-amber-500 text-white cursor-pointer">
                    <span class="iconify text-base text-white" data-icon="lucide:calendar-clock" data-stroke-width="2"></span>
                    <span>Book This Room</span>
                  </button>
                ` : isOtherPrivate ? `
                  <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="flex-1 w-full min-h-[44px] py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition hover:scale-[1.005] bg-gradient-to-r from-stone-800 via-stone-900 to-stone-950 hover:from-stone-700 hover:to-stone-900 border border-stone-700 text-white cursor-pointer">
                    <span class="iconify text-base text-white" data-icon="lucide:calendar-clock" data-stroke-width="2"></span>
                    <span>Request Private Room Access &rarr;</span>
                  </button>
                ` : `
                  <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="btn-primary flex-1 w-full min-h-[44px] py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition hover:scale-[1.005] cursor-pointer">
                    <span class="iconify text-base text-white" data-icon="lucide:calendar-clock" data-stroke-width="2"></span>
                    <span>Book This Room</span>
                  </button>
                `}
              </div>
             
            </div>

          </div>

        </div>
      </div>
      </div>

      <!-- ==================== STEP 2: BUILDING LOCATION & MAP ==================== -->
      <div id="room-details-step-2" class="${activeStep === 2 ? '' : 'hidden'} space-y-4 animate-fade-in">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-xs p-4 sm:p-6 lg:p-7 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-stone-100">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-red-100/70 text-red-900 flex items-center justify-center border border-red-200 shadow-2xs shrink-0">
                <span class="iconify text-xl" data-icon="lucide:map-pin" data-stroke-width="2"></span>
              </div>
              <div>
                <h3 class="font-heading font-bold text-sm text-stone-900 leading-tight">Room & Building Map Location</h3>
                <p class="text-xs text-stone-500 mt-0.5">Find your way to this NBC facility</p>
              </div>
            </div>
            <span class="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Step 2 of 2</span>
          </div>

          <!-- 2-Column Grid: Map on Left (7 cols), Location & Actions on Right (5 cols) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            <!-- LEFT: Embedded Google Map (7 cols) -->
            <div class="lg:col-span-7 h-72 sm:h-80 md:h-[340px] rounded-xl overflow-hidden border border-[#E9E3DD] bg-stone-100 shadow-inner">
              <iframe
                title="Google Maps Location for ${mapInfo.building}"
                width="100%"
                height="100%"
                style="border:0;"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="${mapInfo.embedUrl}">
              </iframe>
            </div>

            <!-- RIGHT: Location Details & Directions (5 cols) -->
            <div class="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] space-y-4">
              <div class="space-y-3.5">
                <div>
                  <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Official Location</span>
                  <h4 class="font-heading font-bold text-base text-stone-900 mt-0.5">${mapInfo.building}</h4>
                  <p class="text-xs text-stone-600 mt-1.5 flex items-start space-x-1.5 leading-relaxed">
                    <span class="iconify text-red-800 text-xs mt-0.5 shrink-0" data-icon="lucide:map-pin"></span>
                    <span>${mapInfo.address}</span>
                  </p>
                </div>

                <div class="pt-3 border-t border-stone-200/70 grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2.5 rounded-lg bg-white border border-[#E9E3DD]">
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">City / Province</span>
                    <strong class="text-stone-900 text-xs block mt-0.5">${room.province || 'Phnom Penh'}</strong>
                  </div>
                  <div class="p-2.5 rounded-lg bg-white border border-[#E9E3DD]">
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Floor</span>
                    <strong class="text-stone-900 text-xs block mt-0.5 truncate" title="${room.floor}">${room.floor.split('-')[0].trim()}</strong>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-3 border-t border-stone-200/70 flex flex-col sm:flex-row gap-2">
                <a href="${mapInfo.directionsUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-[#E9E3DD] text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer text-center">
                  <span class="iconify text-xs text-stone-600" data-icon="lucide:navigation"></span>
                  <span>Get Directions</span>
                </a>
                <a href="${mapInfo.externalUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-red-900 hover:bg-red-950 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer text-center">
                  <span class="iconify text-xs text-white" data-icon="lucide:external-link"></span>
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

          </div>

          <!-- Bottom Navigation Bar for Step 2 -->
          <div class="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-stone-100 gap-3">
            <button type="button" onclick="window.NBC.views['room-details'].goToStep(1)" class="w-full sm:w-auto h-10 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs">
              <span class="iconify text-sm" data-icon="lucide:arrow-left"></span>
              <span>Back to Room Overview</span>
            </button>
            
            ${isMyRoom ? `
              <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="w-full sm:w-auto h-10 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 border border-amber-500 text-white cursor-pointer">
                <span class="iconify text-base text-white" data-icon="lucide:calendar-clock"></span>
                <span>Book This Room</span>
              </button>
            ` : isOtherPrivate ? `
              <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="w-full sm:w-auto h-10 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition bg-gradient-to-r from-stone-800 via-stone-900 to-stone-950 hover:from-stone-700 hover:to-stone-900 border border-stone-700 text-white cursor-pointer">
                <span class="iconify text-base text-white" data-icon="lucide:calendar-clock"></span>
                <span>Request Private Room Access &rarr;</span>
              </button>
            ` : `
              <button onclick="app.selectRoomAndProceed('${room.id}', 'room-details')" class="btn-primary w-full sm:w-auto h-10 px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer">
                <span class="iconify text-base text-white" data-icon="lucide:calendar-clock"></span>
                <span>Book This Room</span>
              </button>
            `}
          </div>

        </div>
      </div>

      <!-- Meeting Details Modal (For Booked Slot Clicks) -->
      <div id="meeting-details-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) window.NBC.views['room-details'].closeMeetingModal()">
        <div class="bg-white rounded-2xl border border-[#E9E3DD] max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
            <div class="space-y-1">
              <span id="modal-meeting-ref" class="text-[10px] font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded border border-red-200">#NBC-88219</span>
              <h3 id="modal-meeting-title" class="font-heading font-bold text-base text-stone-900 leading-tight">Meeting Title</h3>
            </div>
            <button onclick="window.NBC.views['room-details'].closeMeetingModal()" aria-label="Close" class="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer">
              <span class="iconify text-base" data-icon="lucide:x"></span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
              <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Time & Date</span>
              <strong id="modal-meeting-time" class="text-stone-900 text-xs block mt-0.5 font-bold">09:30 – 11:30</strong>
              <span id="modal-meeting-date" class="text-[10px] text-stone-500 block">2026-09-07</span>
            </div>
            <div class="p-2.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD]">
              <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Organizer</span>
              <strong id="modal-meeting-organizer" class="text-stone-900 text-xs block mt-0.5 truncate font-bold">Jonathan Vance</strong>
              <span id="modal-meeting-dept" class="text-[10px] text-stone-500 block truncate">Finance</span>
            </div>
          </div>

          <div>
            <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Meeting Details / Purpose</span>
            <p id="modal-meeting-purpose" class="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed"></p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
            <span id="modal-meeting-attendees" class="text-stone-500 font-medium">12 Attendees</span>
            <button onclick="window.NBC.views['room-details'].closeMeetingModal()" class="btn-primary px-4 py-1.5 rounded-lg text-xs font-bold shadow-2xs">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  mountFullCalendar(roomId, dateString) {
    const calendarEl = document.getElementById('room-fullcalendar');
    if (!calendarEl) return;

    if (typeof FullCalendar === 'undefined') {
      calendarEl.innerHTML = `
        <div class="p-6 text-center text-xs text-stone-500 space-y-2">
          <span class="iconify text-2xl text-stone-400 mx-auto block animate-spin" data-icon="lucide:loader-2"></span>
          <p>Loading schedule timeline engine...</p>
        </div>
      `;
      // Retry in 200ms if script is still downloading
      setTimeout(() => this.mountFullCalendar(roomId, dateString), 200);
      return;
    }

    if (this.calendar) {
      try {
        this.calendar.destroy();
      } catch (e) {}
      this.calendar = null;
    }

    const events = bookingStore.getRoomFullCalendarEvents(roomId);
    const isMobile = window.innerWidth < 768;
    const defaultView = isMobile ? 'timeGridDay' : 'timeGridWeek';

    this.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: defaultView,
      initialDate: dateString,
      headerToolbar: false,
      firstDay: 1, // Monday start
      navLinks: true,
      navLinkDayClick: (date) => {
        if (this.calendar) this.calendar.changeView('timeGridDay', date);
      },
      dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
      allDaySlot: false,
      slotMinTime: '07:00:00',
      slotMaxTime: '18:00:00',
      slotDuration: '00:30:00',
      slotLabelInterval: '01:00',
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
      selectLongPressDelay: 100,
      selectAllow: (selectInfo) => {
        // Disallow selecting past time slots
        return selectInfo.start >= new Date();
      },
      events: events,
      eventContent: (arg) => {
        if (arg.event.display === 'background') return null;
        const props = arg.event.extendedProps || {};
        const isPrivate = !!props.isPrivate;
        const timeText = (props.startTime && props.endTime) 
          ? `${props.startTime} – ${props.endTime}` 
          : arg.timeText;
        const title = arg.event.title || 'Reserved Meeting';
        const organizer = props.requesterName;
        const dept = props.requesterDept;

        // Determine slot duration in minutes to handle 30-minute compact display
        const durationMins = (arg.event.start && arg.event.end)
          ? Math.round((arg.event.end.getTime() - arg.event.start.getTime()) / 60000)
          : 30;
        const isShortSlot = durationMins <= 45;

        // Compact horizontal layout for 30-minute slots
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
            <div class="h-full w-full flex flex-col justify-between p-2 sm:p-2.5 select-none overflow-hidden leading-tight font-sans text-white">
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-1.5">
                  <span class="inline-flex items-center space-x-1 font-mono text-[11px] font-bold ${isPrivate ? 'text-amber-200' : 'text-amber-300'}">
                    <span class="iconify text-xs shrink-0" data-icon="${isPrivate ? 'lucide:lock' : 'lucide:clock'}"></span>
                    <span>${timeText}</span>
                  </span>
                  <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isPrivate ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40' : 'bg-black/30 text-amber-200 border border-amber-400/30'}">
                    ${isPrivate ? 'Private' : 'Booked'}
                  </span>
                </div>
                <div class="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug drop-shadow-xs tracking-tight">
                  ${title}
                </div>
              </div>
              ${organizer ? `
                <div class="flex items-center space-x-1.5 text-[10px] text-stone-200 pt-1.5 mt-auto border-t ${isPrivate ? 'border-amber-700/50' : 'border-red-800/60'} truncate">
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
        if (info.start < new Date()) {
          this.showToast("Time Has Passed", "You cannot select or book time slots that have already passed.", "warning");
          if (this.calendar) this.calendar.unselect();
          return;
        }
        const dateStr = info.startStr.substring(0, 10);
        const startTime = info.startStr.substring(11, 16);
        const endTime = info.endStr.substring(11, 16);
        this.handleBookSlotClick(roomId, dateStr, startTime, endTime);
      },
      eventClick: (info) => {
        if (info.event.display === 'background') return;
        this.openMeetingModal(info.event.extendedProps);
      }
    });

    this.calendar.render();
  }

  openMeetingModal(meeting) {
    if (!meeting) return;
    const modalEl = document.getElementById('meeting-details-modal');
    if (!modalEl) return;

    const titleEl = document.getElementById('modal-meeting-title');
    const refEl = document.getElementById('modal-meeting-ref');
    const timeEl = document.getElementById('modal-meeting-time');
    const dateEl = document.getElementById('modal-meeting-date');
    const orgEl = document.getElementById('modal-meeting-organizer');
    const deptEl = document.getElementById('modal-meeting-dept');
    const attEl = document.getElementById('modal-meeting-attendees');
    const purpEl = document.getElementById('modal-meeting-purpose');

    if (titleEl) titleEl.innerText = meeting.displayTitle || meeting.meetingTitle || 'Scheduled Meeting';
    if (refEl) refEl.innerText = meeting.referenceCode ? `#${meeting.referenceCode}` : '#NBC-RESERVED';
    if (timeEl) timeEl.innerText = `${meeting.startTime} – ${meeting.endTime}`;
    if (dateEl) dateEl.innerText = meeting.date || '';
    if (orgEl) orgEl.innerText = meeting.requesterName || 'NBC Staff';
    if (deptEl) deptEl.innerText = meeting.requesterDept || 'Operations';
    if (attEl) attEl.innerText = `${meeting.attendees || 1} Attendees`;

    if (purpEl) {
      if (meeting.isPrivate) {
        purpEl.innerText = "Confidential Executive Session. Agenda and notes are protected under NBC privacy standards.";
        purpEl.className = "text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 italic leading-relaxed";
      } else {
        purpEl.innerText = meeting.purpose || "Official department meeting and team discussion.";
        purpEl.className = "text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed";
      }
    }

    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  }

  openMeetingModalById(requestId) {
    const req = bookingStore.getRequestById(requestId);
    if (!req) return;
    const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
    this.openMeetingModal({
      referenceCode: req.referenceCode,
      meetingTitle: req.meetingTitle,
      displayTitle: isPrivate ? "Reserved (Private Session)" : req.meetingTitle,
      requesterName: req.requester?.name,
      requesterDept: req.requester?.department,
      attendees: req.attendees,
      purpose: req.meetingPurpose,
      isPrivate: isPrivate,
      startTime: req.startTime,
      endTime: req.endTime,
      date: req.date
    });
  }

  closeMeetingModal() {
    const modalEl = document.getElementById('meeting-details-modal');
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
    }
  }

  handleBookSlotClick(roomId, dateStr, startTime, endTime) {
    if (window.app && window.app.startFromTimelineSelection) {
      window.app.startFromTimelineSelection({ roomId, date: dateStr, startTime, endTime });
    } else if (window.app && window.app.selectRoomAndProceed) {
      window.app.selectRoomAndProceed(roomId, 'room-details', dateStr, startTime, endTime);
    }
  }


  toggleAddPhotoDrawer() {
    const tray = document.getElementById('modal-add-photo-tray');
    if (tray) {
      tray.classList.toggle('hidden');
      if (!tray.classList.contains('hidden')) {
        document.getElementById('modal-new-photo-url')?.focus();
      }
    }
  }


  handleAddPhotoSubmit() {
    const input = document.getElementById('modal-new-photo-url');
    const url = input?.value.trim();
    if (!url) {
      alert("Please enter a valid image URL.");
      return;
    }

    if (this.currentModalRoom) {
      bookingStore.addRoomPhoto(this.currentModalRoom.id, url);
      this.currentModalRoom = bookingStore.getRoomById(this.currentModalRoom.id);
      this.currentModalImageIndex = this.currentModalRoom.images.length - 1;
      this.renderRoomDetailsPage(this.currentModalRoom.id);
    }
  }


  handlePhotoFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (this.currentModalRoom && dataUrl) {
        bookingStore.addRoomPhoto(this.currentModalRoom.id, dataUrl);
        this.currentModalRoom = bookingStore.getRoomById(this.currentModalRoom.id);
        this.currentModalImageIndex = this.currentModalRoom.images.length - 1;
        this.renderRoomDetailsPage(this.currentModalRoom.id);
      }
    };
    reader.readAsDataURL(file);
  }


  addPresetPhoto(url) {
    if (this.currentModalRoom) {
      bookingStore.addRoomPhoto(this.currentModalRoom.id, url);
      this.currentModalRoom = bookingStore.getRoomById(this.currentModalRoom.id);
      this.currentModalImageIndex = this.currentModalRoom.images.length - 1;
      this.renderRoomDetailsPage(this.currentModalRoom.id);
    }
  }

  // Backward compatibility alias
}

window.NBC.views['room-details'] = new RoomDetailsView();
