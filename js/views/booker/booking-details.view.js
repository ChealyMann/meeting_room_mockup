 // Booking Details View Component (view-booking-details)
 // TypeUI Cafe Design System with NBC Crimson Heritage
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
       <div id="view-booking-details" class="w-full lg:h-[calc(100vh-150px)] lg:min-h-0 flex flex-col gap-4"></div>
     `;
     this.renderBookingDetailsPage(requestId);
   }

   init(params = {}) {
     if (params.requestId) this.currentBookingDetailsId = params.requestId;
     window.app = window.app || {};
     window.app.openBookingDetailsPage = (id) => this.openBookingDetailsPage(id);
     window.app.handleCancelBooking = (id) => this.handleCancelBooking(id);
     window.app.downloadCalendarInvite = (id) => this.downloadCalendarInvite(id);
     window.app.copyReferenceCode = (code, label) => this.copyReferenceCode(code, label);
     window.app.handleAddFoodDrinks = (id) => this.handleAddFoodDrinks(id);
     window.app.handleViewRequestDetails = (id) => this.handleViewRequestDetails(id);
     window.app.handleContactSupport = (id) => this.handleContactSupport(id);
   }

   openBookingDetailsPage(requestId) {
     this.currentBookingDetailsId = requestId;
     this.navigateTo('booking-details', { requestId });
   }

   renderBookingDetailsPage(requestId) {
     const container = document.getElementById('view-booking-details');
     if (!container) return;

     const req = bookingStore.getRequestById(requestId);
     if (!req) {
       container.innerHTML = `
         <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-2xs space-y-3.5 my-4 animate-empty-state">
           <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
             <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:calendar-x-2" data-stroke-width="1.8"></span>
           </div>
           <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Booking Request Not Found</h3>
           <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">
             The requested reservation record does not exist or may have been removed.
           </p>
           <button type="button" onclick="app.navigateTo('my-bookings')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 bg-[#991B1B] hover:bg-[#7F1D1D] transition shadow-xs cursor-pointer active:scale-[0.98]">
             <span class="iconify text-xs text-white" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
             <span class="text-white">Back to My Bookings</span>
           </button>
         </div>
       `;
       if (window.Iconify && typeof window.Iconify.scan === 'function') {
         window.Iconify.scan(container);
       }
       return;
     }

     const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
     const isConfirmed = req.status === 'Approved - Confirmed' || req.statusDisplay === 'Approved';
     const isCancelled = req.status === 'Cancelled';
     const isRejected = req.status === 'Rejected' || req.statusDisplay === 'Rejected';
     const isOwnerPending = isPrivate && req.status === 'Pending Room Owner Approval';
     const isPending = req.status === 'Pending Review' || req.status === 'Pending Manager Review' || req.statusDisplay === 'Pending Review';
     const isSetup = req.status === 'Approved - Setup In Progress';
     const isMyRoom = req.isMyRoom || (req.room?.id === 'ROOM-107' || req.room?.roomOwner?.name === 'Jonathan Vance' || req.room?.roomOwner?.id === 'OWNER-VANCE');
     const isPitikaApproved = req.managerReview?.decision === 'Approved';
     const isCancelledAfterPitika = isCancelled && isPitikaApproved;
     const isCancelledBeforePitika = isCancelled && !isPitikaApproved;
     const isOwnerRejected = isRejected && (req.roomOwnerReview?.decision === 'Rejected' || req.managerReview?.decision === 'Approved');

     let statusLabel = 'In Review';
     let statusIcon = 'lucide:clock';
     let statusToneClass = 'text-[#B45309]';
     if (isConfirmed) {
       statusLabel = 'Confirmed';
       statusIcon = 'lucide:check-circle-2';
       statusToneClass = 'text-emerald-700';
     } else if (isSetup) {
       statusLabel = 'In Progress';
       statusIcon = 'lucide:settings';
       statusToneClass = 'text-blue-700';
     } else if (isRejected) {
       statusLabel = 'Rejected';
       statusIcon = 'lucide:x-circle';
       statusToneClass = 'text-rose-700';
     } else if (isCancelled) {
       statusLabel = 'Cancelled';
       statusIcon = 'lucide:slash';
       statusToneClass = 'text-stone-600';
     }

      const roomObj = bookingStore.getRoomById(req.room?.id) || req.room || {};
      const roomImgUrl = roomObj.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
      const formatFloorShort = (floorStr) => {
        if (!floorStr) return 'Ground Floor';
        const match = String(floorStr).match(/(?:Level|Floor)\s*(\d+)/i);
        if (match) return `Floor ${match[1]}`;
        if (/ground/i.test(floorStr)) return 'Ground Floor';
        return String(floorStr).split('(')[0].split('-')[0].trim().replace(/level/i, 'Floor');
      };
      const floorShort = formatFloorShort(roomObj.floor || 'Floor 18');
      const doorAccess = bookingStore.getDoorAccessState
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


    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E9E3DD] shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" onclick="app.navigateTo('my-bookings')" aria-label="Back to my bookings" class="page-back-button min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#F4EFEA] text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
            <span class="iconify text-sm" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
            <span>My Bookings</span>
          </button>

          <div class="page-breadcrumb flex items-center gap-2 min-w-0 overflow-hidden">
            <span class="font-mono text-[11px] text-stone-500 shrink-0">${req.id}</span>
            <span class="text-stone-300" aria-hidden="true">&bull;</span>
            <span class="font-mono text-[11px] text-stone-700 truncate">${req.referenceCode || req.id}</span>
            ${isConfirmed && !isCancelled && !doorAccess.isExpired && doorAccess.code ? `
              <span class="text-stone-300" aria-hidden="true">&bull;</span>
              <button type="button" onclick="app.copyReferenceCode('${doorAccess.code}', 'Door Access Code')" title="Click to copy door access code" class="font-mono text-[11px] text-stone-600 hover:text-[#991B1B] flex items-center gap-1 shrink-0 cursor-pointer transition">
                <span class="iconify text-xs text-stone-400 hover:text-[#991B1B]" data-icon="lucide:key-round" data-stroke-width="1.8"></span>
                <span>Door: ${doorAccess.code}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <span class="${statusToneClass} inline-flex items-center gap-1.5 text-xs font-semibold">
            <span class="iconify text-sm" data-icon="${statusIcon}" data-stroke-width="1.8"></span>
            <span>${statusLabel}</span>
          </span>
          ${isConfirmed ? `
            <button type="button" onclick="app.openReceiptPage('${req.id}', 'booking-details')" class="btn-primary min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
              <span class="iconify text-sm text-white" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
              <span class="text-white">Booking Receipt</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="flex-1 min-h-0 lg:overflow-y-auto no-scrollbar pb-4 pr-1">
        <div class="space-y-4">
          <section class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:px-6 shadow-xs" aria-labelledby="booking-progress-heading">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h2 id="booking-progress-heading" class="font-heading font-bold text-sm text-stone-900">Approval Progress</h2>
              <span class="font-mono text-[11px] text-stone-500">${req.submissionTimestamp || req.submittedText || 'Submitted'}</span>
            </div>
            ${this._renderStepper(req, isPrivate, isMyRoom, isConfirmed, isSetup, isOwnerPending, isPending, isRejected, isCancelled, isCancelledAfterPitika, isCancelledBeforePitika, isOwnerRejected)}
          </section>

          <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div class="xl:col-span-8 space-y-4">
              <section class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs" aria-labelledby="meeting-overview-heading">
                <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                  <span class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                    <span class="iconify text-sm" data-icon="lucide:calendar-days" data-stroke-width="1.8"></span>
                  </span>
                  <h2 id="meeting-overview-heading" class="font-heading font-bold text-base text-stone-900">Meeting Overview</h2>
                </div>

                <div class="py-4">
                  <h3 class="font-heading font-bold text-lg text-stone-900 leading-snug">${req.meetingTitle || 'Department Meeting'}</h3>
                  <div class="flex items-center gap-1.5 mt-1.5 text-xs text-stone-600">
                    <span class="iconify text-[#991B1B]" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                    <span>${roomObj.name || req.room?.name || 'Meeting Room'} &bull; ${floorShort}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 ${isConfirmed && !isCancelled && doorAccess.code ? 'sm:grid-cols-3 lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2">
                  <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Date</span>
                    <strong class="text-xs text-stone-900 block mt-1">${req.date || 'Not set'}</strong>
                  </div>
                  <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Time</span>
                    <strong class="font-mono text-xs text-stone-900 block mt-1">${req.startTime || '07:30'} - ${req.endTime || '08:30'}</strong>
                    <span class="text-[10px] text-stone-500">${durationText}</span>
                  </div>
                  <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Attendees</span>
                    <strong class="font-mono text-xs text-stone-900 block mt-1">${req.attendees || 8} people</strong>
                  </div>
                  <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Booking Code</span>
                    <div class="flex items-center justify-between gap-2 mt-1">
                      <strong class="font-mono text-xs text-[#991B1B] truncate">${req.referenceCode || req.id}</strong>
                      <button type="button" onclick="app.copyReferenceCode('${req.referenceCode || req.id}', 'Booking Code')" aria-label="Copy booking code" title="Copy booking code" class="w-7 h-7 -my-1 rounded-md text-stone-500 hover:text-[#991B1B] hover:bg-white flex items-center justify-center transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                        <span class="iconify text-sm" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                      </button>
                    </div>
                  </div>
                  ${isConfirmed && !isCancelled && doorAccess.code ? `
                    <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Door Access</span>
                      <div class="flex items-center justify-between gap-2 mt-1">
                        <strong class="font-mono text-xs ${doorAccess.isExpired ? 'text-stone-500' : 'text-emerald-800'} truncate">${doorAccess.isExpired ? 'Expired' : doorAccess.code}</strong>
                        ${doorAccess.isExpired ? '' : `
                          <button type="button" onclick="app.copyReferenceCode('${doorAccess.code}', 'Door Access Code')" aria-label="Copy door access code" title="Copy door access code" class="w-7 h-7 -my-1 rounded-md text-stone-500 hover:text-[#991B1B] hover:bg-white flex items-center justify-center transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                            <span class="iconify text-sm" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                          </button>
                        `}
                      </div>
                    </div>
                  ` : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:user-round" data-stroke-width="1.8"></span>
                      <h3 class="font-heading font-semibold text-xs text-stone-900">Booked By</h3>
                    </div>
                    <strong class="text-xs text-stone-900 block">${req.requester?.name || 'NBC Staff'}</strong>
                    <span class="text-[11px] text-stone-600">${req.requester?.department || 'National Bank of Cambodia'}</span>
                  </div>

                  <div class="p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD]">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:file-text" data-stroke-width="1.8"></span>
                      <h3 class="font-heading font-semibold text-xs text-stone-900">Meeting Notes</h3>
                    </div>
                    <p class="text-xs text-stone-700 leading-relaxed">${req.meetingPurpose || req.notes || 'No additional notes provided.'}</p>
                  </div>
                </div>

                ${(isPrivate || req.privateJustification) ? `
                  <div class="mt-3 p-3.5 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] flex items-start gap-3">
                    <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:shield-alert" data-stroke-width="1.8"></span>
                    </span>
                    <div class="min-w-0">
                      <strong class="text-xs text-amber-950 block">Private Room Request</strong>
                      <p class="text-xs text-amber-900 leading-relaxed mt-1">${req.privateJustification || 'A private meeting room was requested for this booking.'}</p>
                    </div>
                  </div>
                ` : ''}
              </section>

              <section class="bg-white rounded-2xl border border-[#E9E3DD] p-4 sm:p-5 shadow-xs" aria-labelledby="services-heading">
                <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                  <span class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                    <span class="iconify text-sm" data-icon="lucide:concierge-bell" data-stroke-width="1.8"></span>
                  </span>
                  <h2 id="services-heading" class="font-heading font-bold text-base text-stone-900">Services & Support</h2>
                </div>

                <div class="divide-y divide-[#E9E3DD]">
                  <div class="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span class="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <span class="iconify text-base" data-icon="lucide:utensils" data-stroke-width="1.8"></span>
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h3 class="font-heading font-semibold text-sm text-stone-900">Food & Drinks</h3>
                        <span class="${req.needsCatering ? 'text-emerald-700' : 'text-stone-500'} inline-flex items-center gap-1 text-[11px] font-semibold">
                          <span class="iconify" data-icon="${req.needsCatering ? 'lucide:check-circle-2' : 'lucide:minus-circle'}" data-stroke-width="1.8"></span>
                          <span>${req.needsCatering ? 'Requested' : 'Not requested'}</span>
                        </span>
                      </div>
                      <p class="text-xs text-stone-600 mt-1">${req.needsCatering ? `${req.cateringDetails?.packageName || 'Standard Catering Package'} &bull; ${req.cateringDetails?.servings || req.attendees || 8} servings` : 'No catering is attached to this booking.'}</p>
                    </div>
                    <button type="button" onclick="app.handleAddFoodDrinks('${req.id}')" class="btn-secondary min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                      <span class="iconify text-sm" data-icon="${req.needsCatering ? 'lucide:eye' : 'lucide:plus'}" data-stroke-width="1.8"></span>
                      <span>${req.needsCatering ? 'Service Details' : 'Add Service'}</span>
                    </button>
                  </div>

                  <div class="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span class="w-9 h-9 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-base" data-icon="lucide:monitor-cog" data-stroke-width="1.8"></span>
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h3 class="font-heading font-semibold text-sm text-stone-900">Equipment & IT</h3>
                        <span class="${req.needsIT ? (isConfirmed ? 'text-emerald-700' : 'text-amber-700') : 'text-stone-500'} inline-flex items-center gap-1 text-[11px] font-semibold">
                          <span class="iconify" data-icon="${req.needsIT ? (isConfirmed ? 'lucide:check-circle-2' : (req.itDetails?.ticketForwardedToIT ? 'lucide:clock-3' : 'lucide:clock')) : 'lucide:minus-circle'}" data-stroke-width="1.8"></span>
                          <span>${req.needsIT ? (isConfirmed ? 'Ready' : (req.itDetails?.ticketForwardedToIT ? 'In progress' : 'Awaiting approval')) : 'Not requested'}</span>
                        </span>
                      </div>
                      <p class="text-xs text-stone-600 mt-1">${req.needsIT ? (req.itDetails?.requestedItems?.join(', ') || 'Video conference and audio setup') : 'The room standard equipment will be used.'}</p>
                    </div>
                    <button type="button" onclick="app.handleViewRequestDetails('${req.id}')" class="btn-secondary min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                      <span class="iconify text-sm" data-icon="lucide:eye" data-stroke-width="1.8"></span>
                      <span>Request Details</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <aside class="xl:col-span-4 space-y-4">
              <section class="bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden shadow-xs" aria-labelledby="room-information-heading">
                <div class="relative">
                  <img src="${roomImgUrl}" class="w-full h-44 object-cover" alt="${roomObj.name || 'Meeting room'}" />
                  <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#260707]/80 to-transparent pointer-events-none"></div>
                  <h2 id="room-information-heading" class="absolute left-4 bottom-3 font-heading font-bold text-base text-white">${roomObj.name || req.room?.name || 'Meeting Room'}</h2>
                </div>

                <div class="p-4">
                  <div class="flex items-center gap-1.5 text-xs text-stone-600 pb-3 border-b border-[#E9E3DD]">
                    <span class="iconify text-[#991B1B]" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                    <span>${roomObj.floor || req.room?.floor || 'Floor'}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 py-3">
                    <div class="p-2.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center gap-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:users" data-stroke-width="1.8"></span>
                      <span class="text-[11px] text-stone-700"><strong class="font-mono text-stone-900">${roomObj.capacity || req.attendees || 8}</strong> seats</span>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center gap-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:monitor" data-stroke-width="1.8"></span>
                      <span class="text-[11px] text-stone-700">Display</span>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center gap-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:wifi" data-stroke-width="1.8"></span>
                      <span class="text-[11px] text-stone-700">Wi-Fi</span>
                    </div>
                    <div class="p-2.5 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] flex items-center gap-2">
                      <span class="iconify text-[#991B1B]" data-icon="lucide:wind" data-stroke-width="1.8"></span>
                      <span class="text-[11px] text-stone-700">Climate</span>
                    </div>
                  </div>

                  <button type="button" onclick="app.openRoomDetailsPage('${roomObj.id || req.room?.id || 'ROOM-101'}')" class="btn-secondary w-full min-h-[44px] px-4 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                    <span>View Room Details</span>
                    <span class="iconify text-sm" data-icon="lucide:arrow-right" data-stroke-width="1.8"></span>
                  </button>
                </div>
              </section>


              <section class="bg-white rounded-2xl border border-[#E9E3DD] p-4 shadow-xs" aria-labelledby="booking-actions-heading">
                <h2 id="booking-actions-heading" class="font-heading font-bold text-sm text-stone-900 pb-3 border-b border-[#E9E3DD]">Booking Actions</h2>
                <div class="space-y-2 mt-3">
                  ${isConfirmed ? `
                    <button type="button" onclick="app.downloadCalendarInvite('${req.id}')" class="btn-secondary w-full min-h-[44px] px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                      <span class="iconify text-sm" data-icon="lucide:calendar-plus" data-stroke-width="1.8"></span>
                      <span>Save to Calendar</span>
                    </button>
                  ` : ''}
                  <button type="button" onclick="app.handleContactSupport('${req.id}')" class="btn-primary w-full min-h-[44px] px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                    <span class="iconify text-sm text-white" data-icon="lucide:message-square" data-stroke-width="1.8"></span>
                    <span class="text-white">Contact Support</span>
                  </button>
                  ${!isCancelled && !isRejected ? `
                    <button type="button" onclick="app.handleCancelBooking('${req.id}')" class="btn-danger-outline w-full min-h-[44px] px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]">
                      <span class="iconify text-sm" data-icon="lucide:x-circle" data-stroke-width="1.8"></span>
                      <span>Cancel Booking</span>
                    </button>
                  ` : ''}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    `;
  }

  // Dynamic Stepper Generator
  _renderStepper(req, isPrivate, isMyRoom, isConfirmed, isSetup, isOwnerPending, isPending, isRejected, isCancelled, isCancelledAfterPitika, isCancelledBeforePitika, isOwnerRejected) {
    let steps = [];

    if (isMyRoom && !req.needsIT && !req.needsCatering) {
      // 3 steps
      steps = [
        { label: '1. Booked', sub: 'Instant', state: 'completed' },
        { label: '2. Setup', sub: 'Ready', state: 'completed' },
        { label: '3. Door Pass', sub: 'Active', state: 'completed' }
      ];
    } else if (isMyRoom && (req.needsIT || req.needsCatering)) {
      // 4 steps
      steps = [
        { label: '1. Booked', sub: 'Instant', state: 'completed' },
        { label: '2. Cost Review', sub: isConfirmed || isSetup ? 'Approved' : (isPending ? 'In Review' : 'Rejected'), state: isConfirmed || isSetup ? 'completed' : (isPending ? 'active' : 'pending') },
        { label: '3. IT Setup', sub: isConfirmed ? 'Ready' : (isSetup ? 'In Progress' : 'Waiting'), state: isConfirmed ? 'completed' : (isSetup ? 'active' : 'pending') },
        { label: '4. Door Pass', sub: isConfirmed ? 'Active' : 'Pending', state: isConfirmed ? 'completed' : 'pending' }
      ];
    } else if (isPrivate) {
      // 5 steps (Matches screenshot: 1. Sent -> 2. Pitika -> 3. Room Owner -> 4. IT Setup -> 5. Door Pass)
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
        { label: '1. Sent', sub: 'Just now', state: step1State },
        { label: '2. Pitika', sub: step2Sub, state: step2State },
        { label: '3. Room Owner', sub: step3Sub, state: step3State },
        { label: '4. IT Setup', sub: step4Sub, state: step4State },
        { label: '5. Door Pass', sub: step5Sub, state: step5State }
      ];
    } else {
      // 4 steps
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

    // Calculate progress line percentage
    let completedIndex = 0;
    steps.forEach((st, idx) => {
      if (st.state === 'completed') completedIndex = idx;
      else if (st.state === 'active') completedIndex = idx - 0.5;
    });
    const progressWidth = Math.max(0, Math.min(100, (completedIndex / (steps.length - 1)) * 100));

    return `
      <div class="w-full">
        <!-- Stepper Nodes Flex Row -->
        <div class="flex items-start justify-between w-full">
          ${steps.map((st, i) => {
            let circleHtml = '';
            let labelClass = 'text-stone-600';
            let subClass = 'text-stone-400';

            // Determine if the line connecting this node to the next should be active (green) or pending (stone)
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
                <!-- Connecting Line to next step (centered vertically on the circle, spans from this node center to next node center) -->
                ${i < steps.length - 1 ? `
                  <div class="absolute top-3 -translate-y-1/2 left-1/2 w-full h-[2px] z-0 pointer-events-none ${lineColor}"></div>
                ` : ''}

                <!-- Step Circle Icon -->
                ${circleHtml}

                <!-- Step Labels -->
                <span class="mt-2 text-xs font-semibold leading-tight truncate w-full ${labelClass}">${st.label}</span>
                <span class="mt-0.5 text-[10px] sm:text-[11px] leading-tight truncate w-full ${subClass}">${st.sub}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  handleAddFoodDrinks(requestId) {
    this.showToast("Catering Service", "Food & Drinks service is coordinated via internal hospitality hotline (ext 2305).", "info");
  }

  handleViewRequestDetails(requestId) {
    const req = bookingStore.getRequestById(requestId);
    const items = req?.itDetails?.requestedItems?.join(', ') || 'Video Conference & Audio Setup';
    this.showToast("Equipment Details", `IT Equipment requested: ${items}`, "info");
  }

  handleContactSupport(requestId) {
    this.showToast("NBC Support", "NBC Facilities & IT Support Hotline: +855 23 722 563 (ext 2305).", "info");
  }

  handleCancelBooking(requestId) {
    if (confirm("Are you sure you want to cancel this meeting room booking?")) {
      bookingStore.cancelBookingRequest(requestId);
      this.showToast("Booking Cancelled", "Your booking reservation has been cancelled.", "info");
      this.renderBookingDetailsPage(requestId);
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
}

window.NBC.views['booking-details'] = new BookingDetailsView();
