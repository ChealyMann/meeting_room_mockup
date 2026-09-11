// Receipt View Component (view-receipt)
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
      <div id="view-receipt" class="w-full space-y-5"></div>
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

  // Backward compatibility alias

  renderReceiptPage(requestId) {
    const container = document.getElementById('view-receipt');
    if (!container) return;

    const req = bookingStore.getRequestById(requestId);
    if (!req) {
      container.innerHTML = `
        <div class="py-12 text-center bg-white rounded-xl border border-[#E9E3DD]">
          <p class="text-xs font-semibold text-stone-800">Receipt record not found.</p>
          <button onclick="app.navigateTo('my-bookings')" class="mt-3 px-4 py-2 btn-primary rounded-lg text-xs font-bold">Back to My Bookings</button>
        </div>
      `;
      return;
    }

    const backView = this.receiptFromView || 'my-bookings';
    let backLabel = 'Back to My Bookings';
    if (backView === 'pitika-review') backLabel = 'Back to Manager Review';
    else if (backView === 'room-owner-review') backLabel = 'Back to Owner Review';
    else if (backView === 'booking-details') backLabel = 'Back to Booking Details';

    container.innerHTML = `
      <!-- Top Action Breadcrumb Bar (Hidden during printing) -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E9E3DD]">
        <div class="flex items-center space-x-3">
          <button onclick="app.navigateTo('${backView}', { requestId: '${req.id}' })" aria-label="${backLabel}" class="min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs">
            <span class="iconify text-stone-500 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
            <span>${backLabel}</span>
          </button>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                #${req.referenceCode}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold badge-approved">
                Booking Receipt
              </span>
            </div>
            <h2 class="font-heading font-bold text-base sm:text-lg text-stone-900 leading-tight mt-0.5">Meeting Room Booking Receipt</h2>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="window.print()" aria-label="Print receipt" class="btn-primary min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition">
            <span class="iconify text-xs text-white" data-icon="lucide:printer" data-stroke-width="2"></span>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      <!-- Printable Area Wrapper -->
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
        <div id="receipt-printable-area" class="space-y-6">
          
          <!-- NBC Official Header -->
          <div class="border-b-2 border-red-900 pb-4 flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-14 h-14 flex items-center justify-center shrink-0">
                <img src="assets/nbc-logo.png" alt="NBC Emblem" class="w-full h-full object-contain" />
              </div>
              <div>
                <span class="font-heading font-extrabold text-base sm:text-lg tracking-tight text-red-950">NATIONAL BANK OF CAMBODIA</span>
                <p class="text-xs text-stone-700 font-semibold">Meeting Room Booking Receipt & Door Pass</p>
                <p class="text-[10px] text-stone-500">Headquarters Tower &bull; Norodom Boulevard, Phnom Penh</p>
              </div>
            </div>

            <div class="text-right">
              <span class="approved-stamp text-xs sm:text-sm px-3 py-1">APPROVED</span>
              <p class="text-[10px] text-stone-600 mt-1 font-mono font-bold">STATUS: CONFIRMED</p>
            </div>
          </div>

          <!-- Metadata 4-Box Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] text-xs">
            <div>
              <span class="text-stone-500 block text-[9px] uppercase font-bold">Booking Code</span>
              <strong class="text-stone-900 font-mono text-xs">${req.referenceCode}</strong>
            </div>
            <div>
              <span class="text-stone-500 block text-[9px] uppercase font-bold">Approved Date</span>
              <strong class="text-stone-900 text-[11px]">${req.approver?.reviewDate || req.submissionTimestamp || 'Sep 02, 2026'}</strong>
            </div>
            <div>
              <span class="text-stone-500 block text-[9px] uppercase font-bold">Approved By</span>
              <strong class="text-stone-900 text-[11px]">${req.approver?.name || 'Pitika S.'}</strong>
            </div>
            <div>
              <span class="text-stone-500 block text-[9px] uppercase font-bold">Door Passcode</span>
              <strong class="text-red-950 font-mono text-xs font-bold">NBC-${req.referenceCode}</strong>
            </div>
          </div>

          <!-- Section 1: Meeting Room Details -->
          <div class="space-y-2">
            <h4 class="font-heading font-bold text-xs text-red-950 uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center space-x-1.5">
              <span class="iconify text-red-900" data-icon="lucide:map-pin"></span>
              <span>1. Room Details</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[9px] block uppercase font-bold">Location</span>
                <strong class="text-stone-900 text-sm font-heading font-bold">${req.room.name}</strong>
                <p class="text-stone-600 text-xs">${req.room.branch ? req.room.branch.split('(')[0].trim() + ' &bull; ' : ''}${req.room.floor}</p>
                <p class="text-stone-500 text-[11px] mt-1">Seats: ${req.room.capacity} &bull; Type: ${req.room.category}</p>
              </div>
              <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[9px] block uppercase font-bold">Date & Time</span>
                <strong class="text-stone-900 text-sm font-heading font-bold">${req.date}</strong>
                <p class="text-stone-800 text-xs font-semibold">${req.startTime} - ${req.endTime}</p>
                <p class="text-stone-500 text-[11px] mt-1">People: ${req.attendees}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[9px] block font-bold uppercase">Meeting Name:</span>
                <strong class="text-stone-900 leading-tight block text-xs mt-0.5">${req.meetingTitle}</strong>
                <p class="text-stone-600 text-[11px] mt-1">${req.meetingPurpose || 'Department Meeting'}</p>
              </div>
              <div class="p-3 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD]">
                <span class="text-stone-500 text-[9px] block font-bold uppercase">Booked By:</span>
                <strong class="text-stone-900 text-xs block leading-tight mt-0.5">${req.requester.name} <span class="text-[10px] font-mono text-red-900 bg-red-100 px-1 py-0.2 rounded font-semibold">${req.requester.staffId || 'NBC-4102'}</span></strong>
                <p class="text-stone-600 text-[11px] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="inline-flex items-center space-x-1">
                    <span class="iconify text-stone-500 text-xs" data-icon="lucide:phone" data-stroke-width="1.8"></span>
                    <span>${req.requester.phone || 'Ext. 8421'}</span>
                  </span>
                  <span class="text-stone-300">&bull;</span>
                  <span class="inline-flex items-center space-x-1">
                    <span class="iconify text-stone-500 text-xs" data-icon="lucide:mail" data-stroke-width="1.8"></span>
                    <span>${req.requester.email || 'requester@nbc.gov.kh'}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Section 2: Extra Services -->
          <div class="space-y-2">
            <h4 class="font-heading font-bold text-xs text-red-950 uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center space-x-1.5">
              <span class="iconify text-red-900" data-icon="lucide:clipboard-check"></span>
              <span>2. Extra Services</span>
            </h4>
            <div class="table-responsive">
              <table class="w-full min-w-[340px] text-xs text-left border border-[#E9E3DD] rounded-lg overflow-hidden">
                <thead class="bg-[#FAF7F4] text-stone-700 font-semibold border-b border-[#E9E3DD] text-[11px]">
                  <tr>
                    <th class="p-2.5">Service</th>
                    <th class="p-2.5">Details</th>
                    <th class="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E9E3DD] text-stone-800 text-[11px]">
                  <tr>
                    <td class="p-2.5 font-bold text-stone-900">
                      <span class="inline-flex items-center space-x-1.5"><span class="iconify text-amber-700 text-sm" data-icon="lucide:utensils"></span><span>Food & Drinks</span></span>
                    </td>
                    <td class="p-2.5">
                      ${req.needsCatering ? `
                        <strong class="text-stone-900">${req.cateringDetails?.packageName}</strong> (${req.cateringDetails?.servings || req.attendees} people)
                        <p class="text-[10px] text-stone-500">Notes: ${req.cateringDetails?.dietaryRemarks || 'Standard'}</p>
                      ` : 'No food requested'}
                    </td>
                    <td class="p-2.5">
                      ${req.needsCatering ? `<span class="text-emerald-700 font-bold">Confirmed</span>` : `<span class="text-stone-400">None</span>`}
                    </td>
                  </tr>
                  <tr>
                    <td class="p-2.5 font-bold text-stone-900">
                      <span class="inline-flex items-center space-x-1.5"><span class="iconify text-red-800 text-sm" data-icon="lucide:headset"></span><span>IT Support</span></span>
                    </td>
                    <td class="p-2.5">
                      ${req.needsIT ? `
                        <strong class="text-stone-900">${req.itDetails?.requestedItems?.join(', ') || 'Video Call Setup'}</strong>
                        <p class="text-[10px] text-stone-500">Prep: ${req.itDetails?.scheduledPrepTime || '30 mins before'}</p>
                      ` : 'Standard room setup only'}
                    </td>
                    <td class="p-2.5">
                      ${req.needsIT && req.itDetails?.assignedStaff ? `
                        <span class="text-emerald-800 font-bold">Assigned: ${req.itDetails.assignedStaff.name}</span>
                      ` : (req.needsIT ? `<span class="text-amber-700 font-bold">Scheduled</span>` : `<span class="text-stone-400">None</span>`)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 3: Services & Logistics Summary -->
          <div class="space-y-2">
            <h4 class="font-heading font-bold text-xs text-red-950 uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center justify-between">
              <span class="flex items-center space-x-1.5">
                <span class="iconify text-red-900" data-icon="lucide:layers"></span>
                <span>3. Services & Logistics Summary</span>
              </span>
              <span class="text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">NBC Internal Services</span>
            </h4>

            <div class="table-responsive">
              <table class="w-full text-xs text-left border border-[#E9E3DD] rounded-lg overflow-hidden">
                <thead class="bg-[#FAF7F4] text-stone-700 font-semibold border-b border-[#E9E3DD] text-[11px]">
                  <tr>
                    <th class="p-2.5 w-1/3">Service Item</th>
                    <th class="p-2.5">Specifications & Scope</th>
                    <th class="p-2.5 text-right w-28">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E9E3DD] text-stone-800 text-[11px]">
                  <tr>
                    <td class="p-2.5">
                      <strong class="text-stone-900 block">${req.room.name}</strong>
                      <span class="text-[10px] text-stone-500">${req.isPrivateRequest ? 'Private Executive Boardroom' : 'Standard Meeting Facility'} &bull; ${req.room.floor}</span>
                    </td>
                    <td class="p-2.5 text-stone-700">Reserved for ${req.attendees} attendees (${req.duration || (req.startTime + ' - ' + req.endTime)})</td>
                    <td class="p-2.5 text-right">
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="iconify" data-icon="lucide:check-circle-2"></span>
                        <span>Reserved</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="p-2.5">
                      <strong class="text-stone-900 block">IT Support & AV Assistance</strong>
                      <span class="text-[10px] text-stone-500">NBC Internal Technical Service</span>
                    </td>
                    <td class="p-2.5 text-stone-700">
                      ${req.needsIT ? (req.itDetails?.requestedItems?.join(', ') || 'AV Support & Video Call Setup') : 'Standard setup without additional technician'}
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
                    <td class="p-2.5">
                      <strong class="text-stone-900 block">Food & Catering Hospitality</strong>
                      <span class="text-[10px] text-stone-500">Internal Pantry & Refreshment Service</span>
                    </td>
                    <td class="p-2.5 text-stone-700">
                      ${req.needsCatering ? `
                        ${req.cateringDetails?.packageName} for ${req.attendees} attendees
                        ${req.cateringDetails?.dietaryRemarks ? `<span class="block text-[10px] text-stone-500 mt-0.5">Notes: ${req.cateringDetails.dietaryRemarks}</span>` : ''}
                      ` : 'No food package selected'}
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

          <!-- Bottom Door Pass & Signature -->
          <div class="border-t-2 border-stone-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-16 h-16 bg-stone-100 p-1 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#E9E3DD]">
                <span class="iconify text-4xl text-stone-800" data-icon="lucide:qr-code"></span>
              </div>
              <div class="text-xs text-stone-600 space-y-0.5">
                <p class="font-bold text-stone-900 text-xs">Door Passcode & QR Code:</p>
                <p class="text-[11px]">Scan or enter passcode at door keylock.</p>
                <p class="font-mono text-xs text-red-950 font-bold tracking-wider">CODE: NBC-${req.referenceCode}</p>
              </div>
            </div>

            <div class="text-right text-xs text-stone-600">
              <p class="text-[11px] font-semibold text-stone-500">Authorized By:</p>
              <div class="font-serif italic font-bold text-red-950 text-base mt-1">
                ${(req.isMyRoom || req.room?.id === 'ROOM-107') ? 'Jonathan Vance (Executive Owner)' : (req.approver?.name || 'Pitika S.')}
              </div>
              <p class="text-[10px] text-stone-500">National Bank of Cambodia &bull; Facilities Management</p>
            </div>
          </div>

        </div>

        <!-- Action Footer (Hidden during printing) -->
        <div class="no-print pt-6 border-t border-stone-200 mt-6 flex items-center justify-end">
          <button onclick="window.print()" aria-label="Print booking receipt" class="btn-primary min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition hover:scale-102">
            <span class="iconify text-sm" data-icon="lucide:printer"></span>
            <span>Print Booking Receipt</span>
          </button>
        </div>

      </div>
    `;
  }



}

window.NBC.views['receipt'] = new ReceiptView();
