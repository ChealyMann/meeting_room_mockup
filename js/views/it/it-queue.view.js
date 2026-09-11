// IT Dispatch Queue View Component (view-it-queue)
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

class ITQueueView {
  constructor() {
    this.id = 'it-queue';
    this.template = "<div class=\"flex items-center justify-between border-b border-[#E9E3DD] pb-2.5\">\n          <div>\n            <h2 class=\"text-sm font-heading font-bold text-stone-900\">IT Support Queue</h2>\n            <p class=\"text-xs text-stone-500\">Assign IT staff and prepare equipment for approved meetings</p>\n          </div>\n        </div>\n\n        <div id=\"it-tickets-container\" class=\"space-y-3.5\">\n          <!-- Populated dynamically -->\n        </div>";
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

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div id="view-it-queue-content" class="w-full space-y-5">
        ${this.template}
      </div>
    `;
    this.init();
  }

  init() {
    this.renderITTickets();
  }

  update() {
    this.renderITTickets();
  }

  renderITTickets() {
    const container = document.getElementById('it-tickets-container');
    if (!container) return;

    const itTickets = bookingStore.getRequests().filter(r => r.needsIT && r.itDetails && r.itDetails.ticketForwardedToIT);

    if (itTickets.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-xl border border-[#E9E3DD]">
          <p class="text-xs font-semibold text-stone-800">No IT Tickets Waiting</p>
          <p class="text-[11px] text-stone-500 mt-1">When the manager approves a meeting with IT help, tickets will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = itTickets.map(ticket => {
      const isAssigned = !!ticket.itDetails.assignedStaff;
      const staffList = ticket.itDetails.assignedStaffList || (ticket.itDetails.assignedStaff ? [ticket.itDetails.assignedStaff] : []);

      return `
        <div class="slate-card p-4 space-y-3">
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 pb-2.5">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold text-xs shadow-xs">
                <span class="iconify text-xs" data-icon="lucide:server" data-stroke-width="1.8"></span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-[11px] font-bold text-red-950 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">Ticket #${ticket.id}</span>
                  ${ticket.isPrivateRequest ? `<span class="badge-private-room text-[9px] font-bold px-1.5 py-0.2 rounded">Private Room</span>` : ''}
                  <span class="text-[11px] text-stone-500">${ticket.isPrivateRequest ? 'Private Room &bull; Sent after Room Owner approval' : 'Sent by Manager (Pitika)'}</span>
                </div>
                <h3 class="font-heading font-bold text-xs sm:text-sm text-stone-900 mt-0.5">${ticket.meetingTitle}</h3>
              </div>
            </div>

            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isAssigned ? (ticket.status === 'Approved - Confirmed' ? 'badge-approved' : 'badge-setup') : 'badge-setup'}">
              ${ticket.status === 'Approved - Confirmed' ? 'Setup Complete & Confirmed' : (isAssigned ? `${staffList.length} Staff Assigned` : 'Waiting for Staff')}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 bg-[#FAF7F4] rounded-lg border border-[#E9E3DD] text-xs">
            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-semibold">Room & Location</span>
              <strong class="text-stone-900 font-heading">${ticket.room.name}</strong>
              <p class="text-[11px] text-stone-500">${ticket.room.floor}</p>
            </div>

            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-semibold">Meeting Time</span>
              <strong class="text-stone-900">${ticket.date}</strong>
              <p class="text-[11px] text-stone-500">${ticket.startTime} - ${ticket.endTime}</p>
            </div>

            <div>
              <span class="text-stone-500 block text-[10px] uppercase font-semibold">Contact Person</span>
              <strong class="text-stone-900">${ticket.requester.name}</strong>
              <p class="text-[11px] text-stone-500">${ticket.requester.phone}</p>
            </div>
          </div>

          <div class="p-2.5 bg-white rounded-lg border border-[#E9E3DD] text-xs space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Equipment Needed:</span>
            <div class="flex flex-wrap gap-1">
              ${(ticket.itDetails.requestedItems || []).map(item => `
                <span class="px-1.5 py-0.5 rounded bg-red-50 text-red-900 border border-red-200 font-medium flex items-center space-x-1 text-[10px]">
                  <span class="iconify text-red-700 text-[10px]" data-icon="lucide:check" data-stroke-width="2"></span>
                  <span>${item}</span>
                </span>
              `).join('')}
            </div>
            ${ticket.itDetails.specialRequirements ? `
              <p class="text-[10px] text-stone-600 pt-0.5"><strong>Booker note:</strong> ${ticket.itDetails.specialRequirements}</p>
            ` : ''}
          </div>

          ${isAssigned ? `
            <div class="p-2.5 bg-red-50/70 rounded-lg border border-red-200 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-stone-500 text-[9px] uppercase font-bold tracking-wider">Assigned IT Staff (${staffList.length})</span>
                <span class="text-[10px] text-red-800 font-medium">${ticket.itDetails.scheduledPrepTime || '30 mins before'}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                ${staffList.map(staff => `
                  <div class="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-md border border-red-200 shadow-2xs">
                    <img src="${staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="w-6 h-6 rounded-full object-cover border border-stone-200" />
                    <div>
                      <strong class="text-stone-900 text-[11px] block leading-none">${staff.name}</strong>
                      <span class="text-stone-500 text-[9px]">${staff.title?.split(' ')[0] || 'IT'} &bull; ${staff.phone}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-0.5">
            <span class="text-[11px] text-stone-500">
              ${isAssigned ? (ticket.status === 'Approved - Confirmed' ? 'Setup completed & door pass active' : 'Technicians assigned. Setup in progress.') : 'Waiting for technician assignment'}
            </span>
            <div class="flex items-center space-x-2">
              ${isAssigned && ticket.status !== 'Approved - Confirmed' ? `
                <button type="button" onclick="window.NBC.views['it-queue'].markSetupComplete('${ticket.id}')" class="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer">
                  <span class="iconify text-xs text-white" data-icon="lucide:check-circle-2"></span>
                  <span>Confirm Setup Ready</span>
                </button>
              ` : ''}
              <button type="button" onclick="app.openITAssignPage('${ticket.id}')" class="px-3.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-md text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer">
                <span class="iconify text-xs text-white" data-icon="lucide:user-cog" data-stroke-width="1.8"></span>
                <span>${isAssigned ? 'Change Staff' : 'Assign IT Staff'}</span>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join('');
  }

  markSetupComplete(ticketId) {
    bookingStore.finalizeRoomStatus(ticketId);
    this.showToast("Setup Ready", `Equipment setup verified and pass activated for #${ticketId}.`, "success");
    this.renderITTickets();
  }

  // ==================== STANDALONE IT ASSIGN PAGE ====================

}

window.NBC.views['it-queue'] = new ITQueueView();
