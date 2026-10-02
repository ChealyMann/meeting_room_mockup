// Receipt View Component (view-receipt)
// Emil Kowalski Design Engineering Masterpiece + TypeUI Cafe Design System with NBC Crimson Heritage
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

  copyToClipboard(text, btnElement, successLabel = 'Copied') {
    if (!text) return;
    const fallbackCopy = (t) => {
      const el = document.createElement('textarea');
      el.value = t;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };

    const runFeedback = () => {
      this.showToast('Copied to Clipboard', text, 'success');
      if (btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `
          <span class="iconify text-xs text-emerald-600" data-icon="lucide:check" data-stroke-width="2.5"></span>
          <span class="text-emerald-700 font-semibold">${successLabel}</span>
        `;
        btnElement.classList.add('border-emerald-400', 'bg-emerald-50/80');
        setTimeout(() => {
          btnElement.innerHTML = originalHTML;
          btnElement.classList.remove('border-emerald-400', 'bg-emerald-50/80');
          if (window.Iconify && typeof window.Iconify.scan === 'function') {
            window.Iconify.scan(btnElement);
          }
        }, 1800);
        if (window.Iconify && typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(btnElement);
        }
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(runFeedback).catch(() => {
        fallbackCopy(text);
        runFeedback();
      });
    } else {
      fallbackCopy(text);
      runFeedback();
    }
  }

  shareReceipt(refCode) {
    const url = window.location.href;
    this.copyToClipboard(url, document.getElementById('btn-share-receipt'), 'Link Copied');
  }

  render(container, params = {}) {
    if (!container) return;
    const defaultId = (typeof bookingStore !== 'undefined' && bookingStore.getRequests && bookingStore.getRequests()[0]?.id) || 'REQ-2026-001';
    const requestId = params.requestId || this.currentReceiptId || defaultId;
    this.currentReceiptId = requestId;
    if (params.fromView) this.receiptFromView = params.fromView;
    container.innerHTML = `
      <div id="view-receipt" class="w-full lg:h-[calc(100vh-140px)] lg:min-h-0 flex flex-col gap-3"></div>
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
        <div class="bg-white rounded-2xl border border-[#E9E3DD] p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-xs space-y-3.5 my-4 animate-scale-up">
          <div class="w-14 h-14 rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center mx-auto shadow-2xs">
            <span class="iconify text-2xl text-[#991B1B]" data-icon="lucide:receipt" data-stroke-width="1.8"></span>
          </div>
          <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">Receipt Record Not Found</h2>
          <p class="text-xs sm:text-sm text-[#6F5849] max-w-md mx-auto leading-relaxed">
            No receipt could be generated for reference code ${requestId}.
          </p>
          <button type="button" onclick="app.navigateTo('my-bookings')" class="btn-primary h-9 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.97] transition-transform duration-160 cursor-pointer shadow-xs">
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

    const room = req.room || {};
    const doorAccess = bookingStore.getDoorAccessState
      ? bookingStore.getDoorAccessState(req)
      : { code: req.doorPasscode || req.referenceCode, expiresAt: null, isExpired: false };
    const backView = this.receiptFromView || 'my-bookings';
    const backLabel = backView === 'pitika-review'
      ? 'Back to Manager Review'
      : (backView === 'room-owner-review' ? 'Back to Owner Review' : (backView === 'booking-details' ? 'Back to Booking Details' : 'Back to My Bookings'));
    const approvedDate = req.approver?.reviewDate || req.submissionTimestamp || '15 May 2026';
    const approvedBy = req.approver?.name || (req.isMyRoom || room.id === 'ROOM-107' ? 'Jonathan Vance' : 'Pitika S.');
    const referenceCode = req.referenceCode || req.id;
    const isExpired = !!doorAccess.isExpired;

    // Service Breakdown Cards (Strict Zero-Badge Mandate)
    const serviceRows = [
      {
        icon: 'door-open',
        title: 'Meeting Room',
        detail: `${room.name || 'Meeting Room'} &bull; ${room.floor || 'Floor'} &bull; ${req.attendees || 0} seats`,
        state: 'Confirmed',
        stateColor: 'text-emerald-700',
        stateIcon: 'check-circle-2'
      },
      {
        icon: 'monitor-cog',
        title: 'IT & AV Support',
        detail: req.needsIT ? (req.itDetails?.requestedItems?.join(', ') || 'Video conferencing and audio setup') : 'Standard in-room equipment',
        state: req.needsIT ? (req.itDetails?.assignedStaff ? 'Staff Assigned' : (req.itDetails?.ticketForwardedToIT ? 'In Progress' : 'Approved')) : 'Standard',
        stateColor: req.needsIT ? 'text-amber-700' : 'text-stone-500',
        stateIcon: req.needsIT ? 'check-circle-2' : 'minus-circle'
      },
      {
        icon: 'utensils',
        title: 'Food & Catering',
        detail: req.needsCatering
          ? `${req.cateringDetails?.packageName || 'Executive Catering'} &bull; ${req.cateringDetails?.servings || req.attendees || 0} servings`
          : 'No catering requested',
        state: req.needsCatering ? 'Scheduled' : 'None',
        stateColor: req.needsCatering ? 'text-amber-700' : 'text-stone-500',
        stateIcon: req.needsCatering ? 'check-circle-2' : 'minus-circle'
      }
    ].map(service => `
      <div class="receipt-service-item p-3.5 rounded-xl bg-[#FAF7F4] border border-[#E9E3DD] flex flex-col justify-between gap-2.5 transition-transform duration-160 hover:border-stone-300">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-7 h-7 rounded-lg bg-white border border-[#E9E3DD] ${service.stateColor} flex items-center justify-center shrink-0 shadow-2xs">
              <span class="iconify text-xs" data-icon="lucide:${service.icon}" data-stroke-width="1.8"></span>
            </span>
            <span class="font-heading font-bold text-xs text-[#3E2B1E] truncate">${service.title}</span>
          </div>
          <span class="${service.stateColor} inline-flex items-center gap-1 text-[11px] font-semibold shrink-0">
            <span class="iconify text-xs" data-icon="lucide:${service.stateIcon}" data-stroke-width="2"></span>
            <span>${service.state}</span>
          </span>
        </div>
        <p class="text-xs text-[#6F5849] leading-relaxed line-clamp-2">${service.detail}</p>
      </div>
    `).join('');

    container.innerHTML = `
      <!-- Top Action Bar (No-Print) -->
      <div class="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2.5 border-b border-[#E9E3DD] shrink-0">
        <div class="flex items-center gap-2.5 min-w-0">
          <button type="button" onclick="app.navigateTo('${backView}', { requestId: '${req.id}' })" aria-label="${backLabel}" class="page-back-button h-8 px-3 rounded-lg bg-white hover:bg-[#F4EFEA] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-semibold flex items-center gap-1.5 active:scale-[0.97] transition-all duration-150 shadow-2xs cursor-pointer">
            <span class="iconify text-sm" data-icon="lucide:arrow-left" data-stroke-width="1.8"></span>
            <span>${backLabel}</span>
          </button>
          <div class="page-breadcrumb flex items-center gap-2 min-w-0 overflow-hidden">
            <span class="font-mono text-[11px] text-stone-500 shrink-0">${req.id}</span>
            <span class="text-stone-300 text-xs" aria-hidden="true">/</span>
            <h1 class="breadcrumb-current font-heading font-bold text-sm text-[#3E2B1E] truncate">Official Booking Receipt & Pass</h1>
          </div>
        </div>

        <!-- Quick Actions Toolbar -->
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" id="btn-share-receipt" onclick="NBC.views.receipt.shareReceipt('${referenceCode}')" class="h-8 px-3 rounded-lg bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-medium inline-flex items-center gap-1.5 active:scale-[0.97] transition-all duration-150 shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:share-2" data-stroke-width="1.8"></span>
            <span>Share</span>
          </button>
          <button type="button" id="btn-copy-ref" onclick="NBC.views.receipt.copyToClipboard('${referenceCode}', this, 'Reference Copied')" class="h-8 px-3 rounded-lg bg-white hover:bg-[#FAF7F4] text-[#3E2B1E] border border-[#E9E3DD] text-xs font-medium inline-flex items-center gap-1.5 active:scale-[0.97] transition-all duration-150 shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-stone-500" data-icon="lucide:copy" data-stroke-width="1.8"></span>
            <span>Copy Ref</span>
          </button>
          <button type="button" onclick="window.print()" aria-label="Print Receipt" class="btn-primary h-8 px-3.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold inline-flex items-center gap-1.5 active:scale-[0.97] transition-all duration-150 shadow-2xs cursor-pointer">
            <span class="iconify text-xs text-white" data-icon="lucide:printer" data-stroke-width="1.8"></span>
            <span class="text-white">Print Pass</span>
          </button>
        </div>
      </div>

      <!-- Main Receipt Document Container -->
      <div class="flex-1 min-h-0 lg:overflow-y-auto no-scrollbar pb-6 pr-0.5">
        <article id="receipt-printable-area" class="receipt-print-compact bg-white rounded-2xl border border-[#E9E3DD] shadow-sm max-w-4xl mx-auto overflow-hidden animate-scale-up relative">
          
          <!-- Sovereign Central Bank Heritage Band -->
          <div class="h-1.5 w-full bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#D97706]"></div>

          <div class="receipt-print-body p-6 sm:p-8 space-y-6">
            
            <!-- Document Header -->
            <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E9E3DD]">
              <div class="flex items-center gap-4 min-w-0">
                <!-- Precision Emblem Tile -->
                <div class="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl bg-[#FAF7F4] border border-[#E9E3DD] flex items-center justify-center shrink-0 p-2 shadow-2xs">
                  <img src="assets/nbc-logo.png" alt="National Bank of Cambodia emblem" class="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-khmer text-xs font-semibold text-[#991B1B] tracking-wide">ធនាគារជាតិនៃកម្ពុជា</span>
                    <span class="text-stone-300 text-xs" aria-hidden="true">&bull;</span>
                    <span class="font-mono text-[10px] text-[#7D6857] uppercase tracking-wider">Central Bank Headquarters</span>
                  </div>
                  <h2 class="font-heading font-black text-lg sm:text-xl tracking-tight text-[#3E2B1E] uppercase truncate mt-0.5">NATIONAL BANK OF CAMBODIA</h2>
                  <p class="font-mono text-[11px] text-[#7D6857] tracking-tight">Executive Facilities Boardroom Pass & Receipt</p>
                </div>
              </div>

              <!-- Status Block -->
              <div class="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FAF7F4]">
                <div class="inline-flex items-center gap-1.5 ${isExpired ? 'text-stone-500' : 'text-emerald-700'} text-xs font-bold">
                  <span class="iconify text-sm ${isExpired ? 'text-stone-400' : 'text-emerald-600'}" data-icon="lucide:${isExpired ? 'clock' : 'shield-check'}" data-stroke-width="2"></span>
                  <span>${isExpired ? 'Session Concluded' : 'Validated & Issued'}</span>
                </div>
                <span class="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Issued: ${approvedDate}</span>
              </div>
            </header>

            <!-- 4-Column High-Precision Security Matrix -->
            <div class="receipt-print-meta grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E9E3DD] rounded-xl border border-[#E9E3DD] overflow-hidden">
              <div class="receipt-print-meta-card p-3.5 bg-[#FAF7F4] flex flex-col justify-between">
                <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Booking Reference</span>
                <div class="flex items-center justify-between gap-1 mt-1">
                  <strong class="font-mono text-xs sm:text-sm font-bold text-[#991B1B] truncate">${referenceCode}</strong>
                  <button type="button" onclick="NBC.views.receipt.copyToClipboard('${referenceCode}', this, 'Copied')" aria-label="Copy reference" class="no-print p-1 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 active:scale-[0.95] transition-transform duration-150 cursor-pointer">
                    <span class="iconify text-xs" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                  </button>
                </div>
              </div>
              <div class="receipt-print-meta-card p-3.5 bg-[#FAF7F4] flex flex-col justify-between">
                <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Meeting Date</span>
                <strong class="font-mono text-xs sm:text-sm font-semibold text-[#3E2B1E] block mt-1 truncate">${req.date || 'Not set'}</strong>
              </div>
              <div class="receipt-print-meta-card p-3.5 bg-[#FAF7F4] flex flex-col justify-between">
                <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Authorized By</span>
                <strong class="text-xs sm:text-sm font-semibold text-[#3E2B1E] block mt-1 truncate" title="${approvedBy}">${approvedBy}</strong>
              </div>
              <div class="receipt-print-meta-card p-3.5 bg-[#FAF7F4] flex flex-col justify-between">
                <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Pass Status</span>
                <strong class="font-mono text-xs sm:text-sm font-semibold ${isExpired ? 'text-stone-500' : 'text-emerald-700'} block mt-1 flex items-center gap-1.5">
                  <span class="iconify text-xs" data-icon="lucide:${isExpired ? 'lock' : 'unlock'}" data-stroke-width="2"></span>
                  <span>${isExpired ? 'Archived Pass' : 'Active Credential'}</span>
                </strong>
              </div>
            </div>

            <!-- Executive Institutional Pass Divider -->
            <div class="relative py-1 flex items-center">
              <div class="w-full border-t border-[#E9E3DD]"></div>
              <div class="absolute left-1/2 -translate-x-1/2 px-3 bg-white text-[10px] font-mono tracking-widest uppercase text-stone-400 select-none">
                Boardroom Access Clearance
              </div>
            </div>

            <!-- Print Layout Grid: Meeting Details & Electronic Door Pass -->
            <div class="receipt-print-layout grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              <!-- Left Column: Meeting Details Panel -->
              <section class="receipt-meeting-card lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-[#E9E3DD] flex flex-col justify-between h-full" aria-labelledby="receipt-meeting-heading">
                <div>
                  <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                    <span class="w-7 h-7 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                      <span class="iconify text-xs" data-icon="lucide:calendar-clock" data-stroke-width="1.8"></span>
                    </span>
                    <h3 id="receipt-meeting-heading" class="font-heading font-bold text-sm text-[#3E2B1E]">Meeting Details</h3>
                  </div>

                  <div class="mt-3.5 space-y-3">
                    <div>
                      <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Meeting Title</span>
                      <strong class="text-sm font-heading font-bold text-[#3E2B1E] block mt-0.5" title="${req.meetingTitle || 'Meeting'}">${req.meetingTitle || 'Meeting'}</strong>
                      ${req.meetingPurpose ? `<p class="text-xs text-[#6F5849] mt-0.5 leading-relaxed">${req.meetingPurpose}</p>` : ''}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-[#FAF7F4]">
                      <div>
                        <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Reserved Time</span>
                        <div class="flex items-center gap-1.5 mt-0.5">
                          <strong class="font-mono text-xs font-semibold text-[#3E2B1E]">${req.startTime || '07:30'} - ${req.endTime || '08:30'}</strong>
                          <span class="font-mono text-[10px] text-[#7D6857]">(${req.duration || '1h'})</span>
                        </div>
                      </div>
                      <div>
                        <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Expected Attendance</span>
                        <div class="flex items-center gap-1 mt-0.5 text-xs text-[#3E2B1E]">
                          <span class="iconify text-xs text-stone-400" data-icon="lucide:users" data-stroke-width="1.8"></span>
                          <strong class="font-mono font-semibold">${req.attendees || 8} Attendees</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-3.5 mt-3.5 border-t border-[#E9E3DD]">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Organizer Profile</span>
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-[#3E2B1E]">
                    <strong class="font-medium">${req.requester?.name || 'Jonathan Vance'}</strong>
                    <span class="text-stone-300" aria-hidden="true">&bull;</span>
                    <span class="text-[#6F5849]">${req.requester?.department || 'Executive Cabinet'}</span>
                    <span class="text-stone-300 hidden sm:inline" aria-hidden="true">&bull;</span>
                    <span class="font-mono text-[11px] text-[#7D6857]">${req.requester?.phone || 'Ext. 8421'}</span>
                  </div>
                </div>
              </section>

              <!-- Right Column: Electronic Door Access Pass -->
              <section class="receipt-door-card lg:col-span-5 p-4 sm:p-5 ${isExpired ? 'bg-stone-50/80 border-stone-200' : 'bg-emerald-50/50 border-emerald-200/90'} rounded-2xl border flex flex-col justify-between h-full relative" aria-labelledby="receipt-access-heading">
                <div>
                  <div class="flex items-center justify-between pb-3 border-b ${isExpired ? 'border-stone-200' : 'border-emerald-200/80'}">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-lg ${isExpired ? 'bg-stone-100 text-stone-600' : 'bg-white text-emerald-800 shadow-2xs'} flex items-center justify-center shrink-0">
                        <span class="iconify text-xs" data-icon="lucide:key-round" data-stroke-width="1.8"></span>
                      </span>
                      <h3 id="receipt-access-heading" class="font-heading font-bold text-sm ${isExpired ? 'text-stone-800' : 'text-emerald-950'}">Door Access Pass</h3>
                    </div>
                    <span class="font-mono text-[10px] uppercase tracking-wider font-bold ${isExpired ? 'text-stone-400' : 'text-emerald-800'}">Keypad PIN</span>
                  </div>

                  <div class="flex items-center gap-3.5 pt-4">
                    <!-- Scanner Viewfinder Container -->
                    <div class="w-20 h-20 rounded-xl bg-white border ${isExpired ? 'border-stone-200' : 'border-emerald-300/80'} flex items-center justify-center shrink-0 shadow-2xs relative p-1.5">
                      <span class="iconify text-4xl ${isExpired ? 'text-stone-300' : 'text-emerald-900'}" data-icon="lucide:qr-code" data-stroke-width="1.5"></span>
                    </div>

                    <!-- Passcode Code & Copy Button -->
                    <div class="min-w-0 flex-1">
                      <span class="text-[10px] uppercase tracking-wider font-bold ${isExpired ? 'text-stone-400' : 'text-emerald-800'} block">Reader Keypad PIN</span>
                      
                      ${isExpired ? `
                        <strong class="font-mono text-base font-bold text-stone-500 block mt-0.5">EXPIRED PASS</strong>
                        <span class="text-[10px] text-stone-400 block mt-0.5">Deactivated</span>
                      ` : `
                        <strong class="font-mono text-xl sm:text-2xl tracking-[0.14em] font-extrabold text-emerald-950 block mt-0.5 truncate">${doorAccess.code || 'NBC-48192'}</strong>
                        
                        <div class="mt-2 flex items-center gap-1.5 no-print">
                          <button type="button" onclick="NBC.views.receipt.copyToClipboard('${doorAccess.code || ''}', this, 'PIN Copied')" aria-label="Copy Door PIN" class="h-6 px-2 rounded-md bg-white hover:bg-emerald-100/60 border border-emerald-300 text-[10px] font-mono text-emerald-900 inline-flex items-center gap-1 active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-2xs">
                            <span class="iconify text-[10px]" data-icon="lucide:copy" data-stroke-width="1.8"></span>
                            <span>Copy PIN</span>
                          </button>
                        </div>
                      `}
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t ${isExpired ? 'border-stone-200' : 'border-emerald-200/80'}">
                  <p class="text-[11px] ${isExpired ? 'text-stone-500' : 'text-emerald-900'} leading-relaxed">
                    ${isExpired ? 'This reservation period has concluded. Physical reader access is deactivated.' : 'Scan QR code at reader scanner or enter PIN on door keypad for room access.'}
                  </p>
                </div>
              </section>

              <!-- Room Facility & Security Authorization Clearance -->
              <section class="receipt-record-card lg:col-span-12 bg-white rounded-2xl border border-[#E9E3DD] overflow-hidden" aria-label="Room and authorization details">
                <div class="grid grid-cols-1 lg:grid-cols-12 h-full">
                  
                  <!-- Room Information Panel -->
                  <div class="receipt-room-panel lg:col-span-7 p-4 sm:p-5 bg-[#FAF7F4] flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                        <span class="w-7 h-7 rounded-lg bg-white border border-[#E9E3DD] text-[#991B1B] flex items-center justify-center shrink-0 shadow-2xs">
                          <span class="iconify text-xs" data-icon="lucide:building-2" data-stroke-width="1.8"></span>
                        </span>
                        <h3 id="receipt-room-heading" class="font-heading font-bold text-sm text-[#3E2B1E]">Room & Location</h3>
                      </div>
                      <div class="mt-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2.5 sm:items-end">
                        <div class="min-w-0">
                          <h4 class="font-heading font-bold text-sm text-[#3E2B1E] truncate" title="${room.name || 'Meeting Room'}">${room.name || 'Meeting Room'}</h4>
                          <p class="text-xs text-[#6F5849] mt-0.5 flex items-center gap-1.5">
                            <span class="iconify text-[#991B1B] shrink-0" data-icon="lucide:map-pin" data-stroke-width="1.8"></span>
                            <span class="truncate">${room.floor || 'Floor'}${room.branch ? ` &bull; ${room.branch.split('(')[0].trim()}` : ''}</span>
                          </p>
                        </div>
                        <p class="text-[11px] text-[#6F5849] sm:text-right font-mono">
                          <strong class="text-[#3E2B1E]">${room.capacity || req.attendees || 0}</strong> Seats &bull; ${room.category || 'Meeting Room'}
                        </p>
                      </div>
                    </div>

                    ${room.features && room.features.length > 0 ? `
                      <div class="pt-2.5 mt-2.5 border-t border-[#E9E3DD] flex flex-wrap items-center gap-2">
                        ${room.features.slice(0, 3).map(f => `
                          <span class="inline-flex items-center gap-1 text-[11px] text-[#6F5849] font-medium">
                            <span class="iconify text-xs text-emerald-600" data-icon="lucide:check" data-stroke-width="2"></span>
                            <span>${f}</span>
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Authorization Clearance Panel -->
                  <div class="receipt-auth-panel lg:col-span-5 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-[#E9E3DD] flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                        <span class="w-7 h-7 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                          <span class="iconify text-xs" data-icon="lucide:award" data-stroke-width="1.8"></span>
                        </span>
                        <h3 id="receipt-authority-heading" class="font-heading font-bold text-sm text-[#3E2B1E]">Authorization Clearance</h3>
                      </div>
                      <div class="mt-3">
                        <span class="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">Executive Reviewer</span>
                        <strong class="text-sm font-semibold text-[#3E2B1E] block mt-0.5 truncate" title="${approvedBy}">${approvedBy}</strong>
                        <p class="text-[11px] text-[#7D6857] mt-0.5">Facilities & Resource Allocation Directorate</p>
                      </div>
                    </div>

                    <div class="pt-2.5 mt-2.5 border-t border-[#FAF7F4] flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>Ref Token: SEC-${(req.id || 'REQ').replace(/[^0-9]/g, '') || '2026'}</span>
                      <span class="text-emerald-700 font-semibold">AUTHENTIC</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Reserved Services & Equipment Card -->
              <section class="receipt-services-card lg:col-span-12 p-4 sm:p-5 bg-white rounded-2xl border border-[#E9E3DD]" aria-labelledby="receipt-services-heading">
                <div class="flex items-center gap-2 pb-3 border-b border-[#E9E3DD]">
                  <span class="w-7 h-7 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                    <span class="iconify text-xs" data-icon="lucide:concierge-bell" data-stroke-width="1.8"></span>
                  </span>
                  <h3 id="receipt-services-heading" class="font-heading font-bold text-sm text-[#3E2B1E]">Reserved Services & Support</h3>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">${serviceRows}</div>
              </section>
            </div>

            <!-- Official Bank Certification Footer -->
            <footer class="pt-4 border-t border-[#E9E3DD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-2 text-[11px] text-[#7D6857]">
                <span class="iconify text-[#991B1B] text-sm shrink-0" data-icon="lucide:shield-check" data-stroke-width="1.8"></span>
                <span>Cryptographically verified official reservation recorded by National Bank of Cambodia Facilities Management.</span>
              </div>
              <span class="font-mono text-[10px] text-stone-400 shrink-0">${req.id}</span>
            </footer>
          </div>

          <!-- Bottom Print Floating Action (No-Print) -->
          <div class="no-print px-6 sm:px-8 pb-6 sm:pb-8">
            <div class="pt-4 border-t border-[#E9E3DD] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span class="text-xs text-[#7D6857] flex items-center gap-1.5">
                <span class="iconify text-stone-400" data-icon="lucide:info" data-stroke-width="1.8"></span>
                <span>Keep this digital voucher accessible for boardroom access verification.</span>
              </span>
              <button type="button" onclick="window.print()" aria-label="Print booking receipt" class="btn-primary min-h-[42px] w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.97] transition-all duration-150 cursor-pointer">
                <span class="iconify text-sm text-white" data-icon="lucide:printer" data-stroke-width="1.8"></span>
                <span class="text-white">Print Official Pass</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    `;

    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(container);
    }
  }
}

window.NBC.views['receipt'] = new ReceiptView();
