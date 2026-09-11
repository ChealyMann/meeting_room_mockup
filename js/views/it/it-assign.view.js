// IT Technician Assignment View Component (view-it-assign)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class ITAssignView {
  constructor() {
    this.id = 'it-assign';
    this.currentITAssignTicketId = null;
    this.selectedITStaffIds = new Set(['STAFF-01']);
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
    const ticketId = params.ticketId || this.currentITAssignTicketId || 'IT-001';
    this.currentITAssignTicketId = ticketId;
    container.innerHTML = `
      <div id="view-it-assign" class="w-full space-y-5"></div>
    `;
    this.renderITAssignPage(ticketId);
  }

  init(params = {}) {
    if (params.ticketId) this.currentITAssignTicketId = params.ticketId;
  }

  openITAssignPage(ticketId) {
    this.currentITAssignTicketId = ticketId;
    const ticket = bookingStore.getRequestById(ticketId);
    if (!ticket) return;

    this.selectedRequestForIT = ticket;

    // Initialize selected staff set from current assigned list or default
    this.selectedITStaffIds.clear();
    if (ticket.itDetails?.assignedStaffList && ticket.itDetails.assignedStaffList.length > 0) {
      ticket.itDetails.assignedStaffList.forEach(s => this.selectedITStaffIds.add(s.id));
    } else if (ticket.itDetails?.assignedStaff?.id) {
      this.selectedITStaffIds.add(ticket.itDetails.assignedStaff.id);
    } else {
      this.selectedITStaffIds.add('STAFF-01'); // default first staff
    }

    this.navigateTo('it-assign', { ticketId });
  }

  // Backward compatibility alias
  openITAssignModal(ticketId) {
    this.openITAssignPage(ticketId);
  }

  closeITAssignModal() {
    this.navigateTo('it-queue');
  }


  renderITAssignPage(ticketId) {
    const container = document.getElementById('view-it-assign');
    if (!container) return;

    const ticket = bookingStore.getRequestById(ticketId) || this.selectedRequestForIT;
    if (!ticket) {
      container.innerHTML = `
        <div class="py-12 text-center bg-white rounded-xl border border-[#E9E3DD]">
          <p class="text-xs font-semibold text-stone-800">IT ticket not found.</p>
          <button onclick="app.navigateTo('it-queue')" class="mt-3 px-4 py-2 btn-primary rounded-lg text-xs font-bold">Back to IT Queue</button>
        </div>
      `;
      return;
    }

    this.selectedRequestForIT = ticket;
    const count = this.selectedITStaffIds.size;

    container.innerHTML = `
      <!-- Top Action Breadcrumb Bar -->
      <div class="flex items-center justify-between pb-2 border-b border-[#E9E3DD]">
        <button type="button" onclick="app.navigateTo('it-queue')" class="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#E9E3DD] text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs">
          <span class="iconify text-stone-500 text-sm" data-icon="lucide:arrow-left" data-stroke-width="2"></span>
          <span>IT Tickets Queue</span>
        </button>

        <div class="flex items-center space-x-2">
          <button type="button" onclick="app.confirmITAssignment()" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition">
            <span class="iconify text-xs text-white" data-icon="lucide:check" data-stroke-width="2"></span>
            <span>Confirm Staff</span>
          </button>
        </div>
      </div>

      <!-- Main IT Workspace Card -->
      <div class="bg-white rounded-2xl border border-[#E9E3DD] p-5 sm:p-6 space-y-5 shadow-xs">
        
        <!-- Meeting Specs Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E9E3DD] text-xs">
          <div>
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Meeting & Time</span>
            <strong class="text-stone-900 text-xs font-bold block mt-0.5">${ticket.meetingTitle}</strong>
            <p class="text-stone-600 text-[11px]">${ticket.date} &bull; ${ticket.startTime} - ${ticket.endTime}</p>
          </div>

          <div>
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Room & Location</span>
            <strong class="text-stone-900 text-xs font-bold block mt-0.5">${ticket.room.name}</strong>
            <p class="text-stone-600 text-[11px]">${ticket.room.floor}</p>
          </div>

          <div>
            <span class="text-stone-500 text-[10px] uppercase font-bold block">Booked By</span>
            <strong class="text-stone-900 text-xs font-bold block mt-0.5">${ticket.requester.name}</strong>
            <p class="text-stone-600 text-[11px] flex items-center space-x-1 mt-0.5"><span class="iconify text-stone-400 text-xs" data-icon="lucide:phone"></span><span>${ticket.requester.phone || 'Internal Ext.'}</span></p>
          </div>
        </div>

        <!-- Equipment Requirements -->
        <div class="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs space-y-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-red-950 block">Equipment Needed:</span>
          <div class="flex flex-wrap gap-1.5">
            ${(ticket.itDetails.requestedItems || []).map(item => `
              <span class="px-2 py-0.5 rounded bg-white text-red-900 border border-red-200 font-bold flex items-center space-x-1 text-[11px] shadow-2xs">
                <span class="iconify text-emerald-600 text-xs" data-icon="lucide:check" data-stroke-width="2.5"></span>
                <span>${item}</span>
              </span>
            `).join('')}
          </div>
          ${ticket.itDetails.specialRequirements ? `
            <p class="text-[11px] text-stone-700 pt-1 border-t border-red-200/60"><strong>Booker note:</strong> ${ticket.itDetails.specialRequirements}</p>
          ` : ''}
        </div>

        <!-- Multi-Staff Selection Header -->
        <div class="flex items-center justify-between pt-1">
          <div>
            <h4 class="font-heading font-bold text-xs sm:text-sm text-stone-900 uppercase tracking-wide">
              Select IT Staff
            </h4>
            <p class="text-[11px] text-stone-500">Choose one or more IT staff for this room.</p>
          </div>

          <div class="flex items-center space-x-2">
            <span id="it-selected-count-badge" class="px-2.5 py-1 rounded-full bg-red-100 text-red-950 border border-red-200 text-xs font-bold">
              ${count} Selected
            </span>
            <button type="button" onclick="app.toggleSelectAllITStaff()" class="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition">
              Select All
            </button>
          </div>
        </div>

        <!-- Technician Cards Grid -->
        <div id="it-staff-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${bookingStore.itStaff.map(staff => {
            const isSelected = this.selectedITStaffIds.has(staff.id);
            let specialty = 'General IT';
            if (staff.title.toLowerCase().includes('audio')) specialty = 'Audio & Video';
            else if (staff.title.toLowerCase().includes('network')) specialty = 'Network & Wi-Fi';
            else if (staff.title.toLowerCase().includes('senior')) specialty = 'Lead Support';

            return `
              <div onclick="app.toggleITStaffCard('${staff.id}')" id="it-card-${staff.id}" class="it-staff-card p-3 rounded-xl bg-white border border-[#E9E3DD] hover:border-red-400 cursor-pointer flex items-center justify-between select-none transition shadow-2xs ${isSelected ? 'selected ring-2 ring-red-800 bg-red-50/20' : ''}">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-stone-200">
                    <img src="${staff.avatar}" alt="${staff.name}" class="w-full h-full object-cover" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center space-x-1.5">
                      <h4 class="font-heading font-bold text-stone-900 text-xs truncate">${staff.name}</h4>
                      <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200 shrink-0">${specialty}</span>
                    </div>
                    <p class="text-[11px] text-stone-500 truncate">${staff.title} &bull; <strong class="text-stone-700">${staff.phone}</strong></p>
                  </div>
                </div>
                <div class="w-5 h-5 rounded-md border border-stone-300 flex items-center justify-center it-card-checkbox shrink-0 ml-2 ${isSelected ? 'bg-red-800 border-red-800 text-white' : 'bg-white'}">
                  <span class="iconify text-xs ${isSelected ? 'block' : 'hidden'}" data-icon="lucide:check" data-stroke-width="2.5"></span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Setup Time & Notes -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div class="form-field-group">
            <label class="form-label text-xs"><span>Setup Time Before Meeting</span></label>
            <select id="it-prep-time-select" class="bank-input text-xs">
              <option value="15 mins before meeting">15 mins before meeting (Quick)</option>
              <option value="30 mins before meeting" selected>30 mins before meeting (Standard)</option>
              <option value="45 mins before meeting">45 mins before meeting (VIP)</option>
              <option value="1 hour before meeting">1 hour before meeting (Full Test)</option>
            </select>
          </div>

          <div class="form-field-group">
            <label class="form-label text-xs"><span>Notes for IT Staff</span></label>
            <input type="text" id="it-technician-notes" onkeydown="if(event.key==='Enter'){event.preventDefault();}" placeholder="e.g. Check HDMI adapter and wireless mics." value="${ticket.itDetails?.technicianNotes || ''}" class="bank-input text-xs" />
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
          <button type="button" onclick="app.navigateTo('it-queue')" class="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold border border-stone-300 transition">
            Cancel
          </button>
          <button type="button" onclick="app.confirmITAssignment()" class="btn-primary px-5 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center space-x-2 transition">
            <span class="iconify text-sm" data-icon="lucide:check-circle-2" data-stroke-width="2"></span>
            <span id="it-assign-confirm-btn-label">Assign Selected Staff (${count}) & Confirm</span>
          </button>
        </div>

      </div>
    `;
  }


  toggleITStaffCard(staffId) {
    if (this.selectedITStaffIds.has(staffId)) {
      if (this.selectedITStaffIds.size > 1) {
        this.selectedITStaffIds.delete(staffId);
      } else {
        this.showToast('Selection Required', 'You must keep at least 1 IT technician selected.', 'warning');
        return;
      }
    } else {
      this.selectedITStaffIds.add(staffId);
    }

    this.renderITAssignPage(this.currentITAssignTicketId);
  }


  toggleSelectAllITStaff() {
    if (this.selectedITStaffIds.size === bookingStore.itStaff.length) {
      this.selectedITStaffIds.clear();
      this.selectedITStaffIds.add(bookingStore.itStaff[0].id);
    } else {
      bookingStore.itStaff.forEach(s => this.selectedITStaffIds.add(s.id));
    }

    this.renderITAssignPage(this.currentITAssignTicketId);
  }


  confirmITAssignment() {
    if (!this.selectedRequestForIT) return;
    if (this.selectedITStaffIds.size === 0) {
      this.showToast('No Staff Selected', 'Please select at least 1 technician.', 'warning');
      return;
    }

    const staffIds = Array.from(this.selectedITStaffIds);
    const prepTime = document.getElementById('it-prep-time-select')?.value || '30 mins before meeting';
    const itNotes = document.getElementById('it-technician-notes')?.value.trim() || '';

    bookingStore.assignITStaff(this.selectedRequestForIT.id, { staffIds, prepTime, itNotes });
    this.showToast("Technicians Assigned", `Assigned ${staffIds.length} IT staff to Ticket #${this.selectedRequestForIT.id}.`, "success");
    this.navigateTo('it-queue');
  }

  // ==================== STANDALONE OFFICIAL E-RECEIPT PAGE ====================

}

window.NBC.views['it-assign'] = new ITAssignView();
