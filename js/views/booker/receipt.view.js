 // Receipt View Component (view-receipt)
 // TypeUI Cafe Design System with NBC Crimson Heritage
 window.NBC = window.NBC || {};
 window.NBC.views = window.NBC.views || {};

 class ReceiptView {
   constructor() {
     this.id = 'receipt';
     this.currentReceiptId = null;
     this.receiptFromView = 'my-bookings';
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
     const requestId = params.requestId || this.currentReceiptId || 'REQ-001';
     this.currentReceiptId = requestId;
     if (params.fromView) this.receiptFromView = params.fromView;
     container.innerHTML = `
       <div id="view-receipt" class="w-full lg:h-[calc(100vh-150px)] lg:min-h-0 flex flex-col gap-4"></div>
     `;
     this.renderReceiptPage(requestId);
   }

   init(params = {}) {
     if (params.requestId) this.currentReceiptId = params.requestId;
     if (params.fromView) this.receiptFromView = params.fromView;
   }

   openReceiptPage(requestId, fromView = 'my-bookings') {
     this.currentReceiptId = requestId;
     this.receiptFromView = fromView;
     this.navigateTo('receipt', { requestId, fromView });
   }

   renderReceiptPage(requestId) {
     const container = document.getElementById('view-receipt');
     if (!container) return;

     const req = bookingStore.getRequestById(requestId);
     if (!req) {
       container.innerHTML = `
         <div class="py-12 px-4 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-xs">
           <span class="iconify text-2xl text-stone-400" data-icon="lucide:receipt" data-stroke-width="1.8"></span>
           <h2 class="font-heading font-bold text-sm text-stone-900 mt-3">Receipt Record Not Found</h2>
           <button type="button" onclick="app.navigateTo('my-bookings')" class="btn-primary mt-4 min-h-[44px] px-4 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
             <span class="iconify text-sm text-white" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
             <span class="text-white">Back to My Bookings</span>
           </button>
         </div>
       `;
       return;
     }

     const room = req.room || {};
     const doorAccess = bookingStore.getDoorAccessState
       ? bookingStore.getDoorAccessState(req)
       : { code: req.doorPasscode || req.referenceCode, expiresAt: null, isExpired: false };
     const backView = this.receiptFromView || 'my-bookings';
     const backLabel = backView === 'pitika-review'
       ? 'Back to Manager Review'
       : (backView === 'room-owner-review' ? 'Back to Owner Review' : (backView === 'booking-details' ? 'Back to Booking Details' : 'Back to My Bookings'));
     const approvedDate = req.approver?.reviewDate || req.submissionTimestamp || 'Not available';
     const approvedBy = req.approver?.name || (req.isMyRoom || room.id === 'ROOM-107' ? 'Jonathan Vance' : 'Pitika S.');
     const serviceRows = [
       {
         icon: 'door-open',
         title: 'Meeting room',
         detail: `${room.name || 'Meeting Room'} &bull; ${room.floor || 'Floor'} &bull; ${req.attendees || 0} attendees`,
         state: 'Reserved',
         tone: 'text-emerald-700'
       },
       {
         icon: 'monitor-cog',
         title: 'IT & AV support',
         detail: req.needsIT ? (req.itDetails?.requestedItems?.join(', ') || 'Video conference and audio setup') : 'Standard room equipment',
         state: req.needsIT ? (req.itDetails?.assignedStaff ? 'Assigned' : (req.itDetails?.ticketForwardedToIT ? 'In Progress' : 'Awaiting Approval')) : 'Standard',
         tone: req.needsIT ? 'text-amber-700' : 'text-stone-500'
       },
       {
         icon: 'utensils',
         title: 'Food & catering',
         detail: req.needsCatering
           ? `${req.cateringDetails?.packageName || 'Standard catering'} &bull; ${req.cateringDetails?.servings || req.attendees || 0} servings`
           : 'No catering requested',
         state: req.needsCatering ? 'Requested' : 'None',
         tone: req.needsCatering ? 'text-amber-700' : 'text-stone-500'
       }
     ].map(service => `
       <div class="flex items-start gap-3 py-3.5">
         <span class="w-8 h-8 rounded-lg bg-[#FAF7F4] border border-[#E9E3DD] ${service.tone} flex items-center justify-center shrink-0">
           <span class="iconify text-sm" data-icon="lucide:${service.icon}" data-stroke-width="1.8"></span>
         </span>
         <div class="flex-1 min-w-0">
           <div class="flex items-center justify-between gap-3">
             <h3 class="font-heading font-semibold text-xs text-stone-900">${service.title}</h3>
             <span class="${service.tone} inline-flex items-center gap-1 text-[11px] font-semibold shrink-0">
               <span class="iconify text-xs" data-icon="lucide:${service.state === 'None' || service.state === 'Standard' ? 'minus-circle' : 'check-circle-2'}" data-stroke-width="1.8"></span>
               <span>${service.state}</span>
             </span>
           </div>
           <p class="text-[11px] text-stone-600 leading-relaxed mt-1">${service.detail}</p>
         </div>
       </div>
     `).join('');

     container.innerHTML = `
        <div class="no-print flex items-center gap-3 pb-3 border-b border-[#E9E3DD] shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <button type="button" onclick="app.navigateTo('${backView}', { requestId: '${req.id}' })" aria-label="${backLabel}" class="page-back-button min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#F4EFEA] text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.98]">
              <span class="iconify text-sm" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
              <span>${backLabel}</span>
            </button>
            <div class="page-breadcrumb flex items-center gap-2 min-w-0 overflow-hidden">
              <span class="font-mono text-[11px] text-stone-500 shrink-0">${req.id}</span>
              <span class="breadcrumb-separator" aria-hidden="true">/</span>
              <h1 class="breadcrumb-current font-heading font-bold text-sm sm:text-base truncate">Booking Receipt</h1>
            </div>
          </div>
        </div>

       <div class="flex-1 min-h-0 lg:overflow-y-auto no-scrollbar pb-4 pr-1">
         <article id="receipt-printable-area" class="receipt-print-compact bg-white rounded-2xl border border-[#E9E3DD] shadow-xs max-w-5xl mx-auto overflow-hidden">
           <div class="receipt-print-body p-5 sm:p-7 lg:p-8 space-y-6">
             <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 pb-5 border-b-2 border-[#991B1B]">
               <div class="flex items-center gap-3 min-w-0">
                 <div class="w-14 h-14 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] flex items-center justify-center shrink-0 p-2">
                   <img src="assets/nbc-logo.png" alt="National Bank of Cambodia emblem" class="w-full h-full object-contain" />
                 </div>
                 <div class="min-w-0">
                   <p class="font-heading font-extrabold text-base sm:text-lg tracking-tight text-red-950 truncate">NATIONAL BANK OF CAMBODIA</p>
                   <h2 class="font-heading font-bold text-sm text-stone-900 mt-1">Meeting Room Booking Receipt</h2>
                   <p class="text-[11px] text-stone-500 mt-1 truncate">Headquarters Tower &bull; Norodom Boulevard, Phnom Penh</p>
                 </div>
               </div>
               <div class="sm:text-right shrink-0">
                 <div class="inline-flex items-center gap-1.5 text-emerald-700 text-sm font-bold">
                   <span class="iconify text-base" data-icon="lucide:check-circle-2" data-stroke-width="1.8"></span>
                   <span>Confirmed</span>
                 </div>
                 <p class="font-mono text-[10px] text-stone-500 mt-1 uppercase">Issued ${approvedDate}</p>
               </div>
             </header>

              <div class="receipt-print-meta grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E9E3DD] rounded-xl border border-[#E9E3DD] overflow-hidden">
                <div class="receipt-print-meta-card p-4 bg-[#FAF7F4]">
                 <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Booking reference</span>
                 <strong class="font-mono text-xs text-[#991B1B] block mt-1 truncate">${req.referenceCode || req.id}</strong>
               </div>
                <div class="receipt-print-meta-card p-4 bg-[#FAF7F4]">
                 <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Meeting date</span>
                 <strong class="font-mono text-xs text-stone-900 block mt-1 truncate">${req.date || 'Not set'}</strong>
               </div>
                <div class="receipt-print-meta-card p-4 bg-[#FAF7F4]">
                 <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Approved by</span>
                 <strong class="text-xs text-stone-900 block mt-1 truncate" title="${approvedBy}">${approvedBy}</strong>
               </div>
                <div class="receipt-print-meta-card p-4 bg-[#FAF7F4]">
                 <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Door access</span>
                 <strong class="font-mono text-xs ${doorAccess.isExpired ? 'text-stone-500' : 'text-emerald-700'} block mt-1">${doorAccess.isExpired ? 'Expired' : 'Ready'}</strong>
               </div>
             </div>

              <div class="receipt-print-layout grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <section class="receipt-meeting-card lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-[#E9E3DD] flex flex-col h-full" aria-labelledby="receipt-meeting-heading">
                  <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                    <span class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:calendar-days" data-stroke-width="1.8"></span>
                    </span>
                    <h2 id="receipt-meeting-heading" class="font-heading font-bold text-base text-stone-900">Meeting Details</h2>
                  </div>
                  <div class="receipt-meeting-fields grid grid-cols-1 sm:grid-cols-2 gap-px mt-3 bg-[#E9E3DD] rounded-xl border border-[#E9E3DD] overflow-hidden flex-1">
                    <div class="p-3.5 bg-[#FAF7F4]">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Meeting title</span>
                      <strong class="text-sm font-heading font-bold text-stone-900 block mt-1 truncate" title="${req.meetingTitle || 'Meeting'}">${req.meetingTitle || 'Meeting'}</strong>
                      <p class="text-xs text-stone-600 mt-1 leading-relaxed">${req.meetingPurpose || 'Department meeting'}</p>
                    </div>
                    <div class="p-3.5 bg-[#FAF7F4]">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Schedule</span>
                      <strong class="font-mono text-sm text-stone-900 block mt-1">${req.startTime || '07:30'} - ${req.endTime || '08:30'}</strong>
                      <p class="text-xs text-stone-600 mt-1">${req.duration || 'Meeting duration'}</p>
                    </div>
                    <div class="p-3.5 bg-[#FAF7F4] sm:col-span-2">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Booked by</span>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <strong class="text-sm text-stone-900">${req.requester?.name || 'NBC Staff'}</strong>
                        <span class="text-stone-300" aria-hidden="true">&bull;</span>
                        <span class="text-xs text-stone-600">${req.requester?.department || 'National Bank of Cambodia'}</span>
                        <span class="text-stone-300 hidden sm:inline" aria-hidden="true">&bull;</span>
                        <span class="text-xs text-stone-600">${req.requester?.phone || 'Ext. 8421'}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="receipt-door-card lg:col-span-5 p-4 sm:p-5 ${doorAccess.isExpired ? 'bg-stone-50 border-stone-200' : 'bg-emerald-50 border-emerald-200'} rounded-2xl border flex flex-col h-full" aria-labelledby="receipt-access-heading">
                  <div class="flex items-center gap-2 pb-3 border-b ${doorAccess.isExpired ? 'border-stone-200' : 'border-emerald-200'}">
                    <span class="w-8 h-8 rounded-lg ${doorAccess.isExpired ? 'bg-stone-100 text-stone-600' : 'bg-emerald-100 text-emerald-800'} flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:key-round" data-stroke-width="1.8"></span>
                    </span>
                    <h2 id="receipt-access-heading" class="font-heading font-bold text-base ${doorAccess.isExpired ? 'text-stone-800' : 'text-emerald-950'}">Door Access</h2>
                  </div>
                  <div class="flex items-center gap-3 pt-4 flex-1">
                    <div class="w-20 h-20 rounded-xl bg-white border ${doorAccess.isExpired ? 'border-stone-200' : 'border-emerald-200'} flex items-center justify-center shrink-0">
                      <span class="iconify text-4xl ${doorAccess.isExpired ? 'text-stone-400' : 'text-emerald-800'}" data-icon="lucide:qr-code" data-stroke-width="1.5"></span>
                    </div>
                    <div class="min-w-0">
                      <span class="text-[10px] uppercase tracking-wider font-bold ${doorAccess.isExpired ? 'text-stone-500' : 'text-emerald-800'} block">Passcode</span>
                      <strong class="font-mono text-lg tracking-wider ${doorAccess.isExpired ? 'text-stone-600' : 'text-emerald-950'} block mt-1 truncate">${doorAccess.isExpired ? 'Expired' : (doorAccess.code || 'Unavailable')}</strong>
                      <p class="text-[11px] ${doorAccess.isExpired ? 'text-stone-500' : 'text-emerald-800'} mt-1 leading-relaxed">${doorAccess.isExpired ? 'This booking has ended.' : `Use this code at the room door.`}</p>
                    </div>
                  </div>
                </section>

                <section class="receipt-record-card lg:col-span-12 bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden" aria-label="Room and authorization details">
                  <div class="grid grid-cols-1 lg:grid-cols-12 h-full">
                    <div class="receipt-room-panel lg:col-span-7 p-4 sm:p-5 bg-[#FAF7F4]">
                      <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                        <span class="w-8 h-8 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0">
                          <span class="iconify text-sm" data-icon="lucide:building-2" data-stroke-width="1.8"></span>
                        </span>
                        <h2 id="receipt-room-heading" class="font-heading font-bold text-base text-stone-900">Room Information</h2>
                      </div>
                      <div class="mt-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:items-end">
                        <div class="min-w-0">
                          <h3 class="font-heading font-bold text-sm text-stone-900 truncate" title="${room.name || 'Meeting Room'}">${room.name || 'Meeting Room'}</h3>
                          <p class="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                            <span class="iconify text-[#991B1B] shrink-0" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                            <span class="truncate">${room.floor || 'Floor'}${room.branch ? ` &bull; ${room.branch.split('(')[0].trim()}` : ''}</span>
                          </p>
                        </div>
                        <p class="text-[11px] text-stone-600 sm:text-right"><strong class="font-mono text-stone-900">${room.capacity || req.attendees || 0}</strong> seats &bull; ${room.category || 'Meeting room'}</p>
                      </div>
                    </div>
                    <div class="receipt-auth-panel lg:col-span-5 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-[#E9E3DD]">
                      <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                        <span class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                          <span class="iconify text-sm" data-icon="lucide:shield-check" data-stroke-width="1.8"></span>
                        </span>
                        <h2 id="receipt-authority-heading" class="font-heading font-bold text-base text-stone-900">Authorization</h2>
                      </div>
                      <div class="mt-3">
                        <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Approved by</span>
                        <strong class="text-sm text-red-950 block mt-1 truncate" title="${approvedBy}">${approvedBy}</strong>
                        <p class="text-[11px] text-stone-500 mt-1">NBC Facilities Management</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="receipt-services-card lg:col-span-12 p-4 sm:p-5 bg-white rounded-2xl border border-[#E9E3DD]" aria-labelledby="receipt-services-heading">
                  <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                    <span class="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-sm" data-icon="lucide:concierge-bell" data-stroke-width="1.8"></span>
                    </span>
                    <h2 id="receipt-services-heading" class="font-heading font-bold text-base text-stone-900">Services & Support</h2>
                  </div>
                  <div class="divide-y divide-[#E9E3DD] mt-1 grid grid-cols-1 lg:grid-cols-3 lg:gap-x-4">${serviceRows}</div>
                </section>
              </div>

             <footer class="pt-5 border-t-2 border-[#991B1B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
               <div class="flex items-center gap-2 text-[11px] text-stone-500">
                 <span class="iconify text-[#991B1B]" data-icon="lucide:shield-check" data-stroke-width="1.8"></span>
                 <span>This receipt confirms the reservation recorded by NBC Facilities Management.</span>
               </div>
               <span class="font-mono text-[10px] text-stone-400">${req.id}</span>
             </footer>
           </div>

           <div class="no-print px-5 sm:px-7 lg:px-8 pb-5 sm:pb-7">
             <div class="pt-4 border-t border-[#E9E3DD] flex justify-end">
               <button type="button" onclick="window.print()" aria-label="Print booking receipt" class="btn-primary min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]">
                 <span class="iconify text-sm text-white" data-icon="lucide:printer" data-stroke-width="1.8"></span>
                 <span class="text-white">Print Booking Receipt</span>
               </button>
             </div>
           </div>
         </article>
       </div>
     `;
   }
 }

 window.NBC.views['receipt'] = new ReceiptView();
