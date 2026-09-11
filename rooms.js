// ===================================================================
// National Bank of Cambodia - Meeting Room Catalog Controller
// TypeUI Enterprise Design System Redesign
// ===================================================================

// Support classical script loading for file:/// protocol as well as modular environments
const NBC_ROOMS_DATA = (typeof window !== 'undefined' && window.NBC_ROOMS) || [];
const HIERARCHY_DATA = (typeof window !== 'undefined' && window.HIERARCHY_GROUPS) || [];

class RoomsCatalogController {
  constructor() {
    this.rooms = [...NBC_ROOMS_DATA];
    this.hierarchy = HIERARCHY_DATA;

    // Filter State
    this.state = {
      searchQuery: '',
      buildingFilter: 'all',
      statusFilter: 'all', // 'all' | 'available' | 'shared' | 'private'
      largeCapacityOnly: false,
      layoutMode: 'grid', // 'grid' | 'list'
      activeRoomId: null,
      selectedSlot: '01:30 PM - 03:00 PM'
    };

    // DOM References
    this.elements = {
      searchInput: document.getElementById('roomSearchInput'),
      btnClearSearch: document.getElementById('btnClearSearch'),
      locationPillsTrack: document.getElementById('locationPillsTrack'),
      catalogContainer: document.getElementById('roomsCatalogContent'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      filterAvailableBtn: document.getElementById('filterAvailableBtn'),
      filterSharedBtn: document.getElementById('filterSharedBtn'),
      filterExecutiveBtn: document.getElementById('filterExecutiveBtn'),
      filterLargeCapBtn: document.getElementById('filterLargeCapBtn'),
      btnLayoutGrid: document.getElementById('btnLayoutGrid'),
      btnLayoutList: document.getElementById('btnLayoutList'),
      
      // Drawer DOM
      drawerBackdrop: document.getElementById('drawerBackdrop'),
      roomDrawer: document.getElementById('roomDrawer'),
      btnCloseDrawer: document.getElementById('btnCloseDrawer'),
      btnCancelDrawer: document.getElementById('btnCancelDrawer'),
      btnConfirmReservation: document.getElementById('btnConfirmReservation'),
      drawerMainImg: document.getElementById('drawerMainImg'),
      drawerThumbsContainer: document.getElementById('drawerThumbsContainer'),
      drawerRoomCategory: document.getElementById('drawerRoomCategory'),
      drawerRoomTitle: document.getElementById('drawerRoomTitle'),
      drawerRoomFloor: document.getElementById('drawerRoomFloor'),
      drawerCapacity: document.getElementById('drawerCapacity'),
      drawerSize: document.getElementById('drawerSize'),
      drawerStatusBadge: document.getElementById('drawerStatusBadge'),
      drawerDescriptionEn: document.getElementById('drawerDescriptionEn'),
      drawerDescriptionKh: document.getElementById('drawerDescriptionKh'),
      drawerAmenitiesList: document.getElementById('drawerAmenitiesList'),
      drawerCoordinatorCard: document.getElementById('drawerCoordinatorCard'),
      drawerCoordAvatar: document.getElementById('drawerCoordAvatar'),
      drawerCoordName: document.getElementById('drawerCoordName'),
      drawerCoordTitle: document.getElementById('drawerCoordTitle'),
      drawerCoordPhone: document.getElementById('drawerCoordPhone'),
      drawerSlotsGrid: document.getElementById('drawerSlotsGrid'),

      // Sidebar DOM References
      sidebar: document.getElementById('portalSidebar'),
      sidebarBackdrop: document.getElementById('sidebarBackdrop'),
      btnToggleSidebarDesktop: document.getElementById('btnToggleSidebarDesktop'),
      btnToggleSidebarMobile: document.getElementById('btnToggleSidebarMobile'),
      btnCollapseSidebar: document.getElementById('btnCollapseSidebar'),
      btnCloseSidebar: document.getElementById('btnCloseSidebar'),
      sidebarSecurityBtn: document.getElementById('sidebarSecurityBtn'),

      // Toast
      toastNotice: document.getElementById('toastNotice'),
      toastMessage: document.getElementById('toastMessage'),

      // KPI Numbers
      kpiTotal: document.getElementById('kpi-total-rooms'),
      kpiAvailable: document.getElementById('kpi-available-rooms'),
      kpiExecutive: document.getElementById('kpi-executive-rooms'),
      kpiCapacity: document.getElementById('kpi-capacity-rooms')
    };

    this.init();
  }

  init() {
    this.restoreSidebarState();
    this.renderKPIs();
    this.bindEvents();
    this.renderLocationPills();
    this.renderCatalog();
  }

  // Restore collapsed sidebar state from localStorage (mirrors original NBC application)
  restoreSidebarState() {
    const isCollapsed = localStorage.getItem('nbc-sidebar-collapsed') === 'true';
    if (this.elements.sidebar) {
      if (isCollapsed) {
        this.elements.sidebar.classList.add('sidebar-collapsed');
      } else {
        this.elements.sidebar.classList.remove('sidebar-collapsed');
      }
      this.elements.btnToggleSidebarDesktop?.setAttribute('aria-expanded', String(!isCollapsed));
      this.elements.btnCollapseSidebar?.setAttribute('aria-expanded', String(!isCollapsed));
    }
  }

  // Calculate and update Overview KPI Bento cards
  renderKPIs() {
    const total = this.rooms.length;
    const available = this.rooms.filter(r => r.status.toLowerCase() === 'available').length;
    const executive = this.rooms.filter(r => r.isPrivate).length;
    const totalSeats = this.rooms.reduce((sum, r) => sum + (Number(r.capacity) || 0), 0);

    if (this.elements.kpiTotal) this.elements.kpiTotal.textContent = `${total} Suites`;
    if (this.elements.kpiAvailable) this.elements.kpiAvailable.textContent = `${available} Ready`;
    if (this.elements.kpiExecutive) this.elements.kpiExecutive.textContent = `${executive} Private`;
    if (this.elements.kpiCapacity) this.elements.kpiCapacity.textContent = `${totalSeats} Seats`;
  }

  bindEvents() {
    // Search input typing
    this.elements.searchInput?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.trim().toLowerCase();
      this.elements.btnClearSearch?.classList.toggle('visible', this.state.searchQuery.length > 0);
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    // Clear search button
    this.elements.btnClearSearch?.addEventListener('click', () => {
      if (this.elements.searchInput) {
        this.elements.searchInput.value = '';
        this.elements.searchInput.focus();
      }
      this.state.searchQuery = '';
      this.elements.btnClearSearch?.classList.remove('visible');
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    // Global keyboard shortcuts (Ctrl+K or / to search, Escape to close drawer)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.elements.searchInput?.focus();
      } else if (e.key === '/' && document.activeElement !== this.elements.searchInput) {
        e.preventDefault();
        this.elements.searchInput?.focus();
      } else if (e.key === 'Escape') {
        if (this.elements.roomDrawer?.classList.contains('open')) {
          this.closeDrawer();
        } else if (this.elements.sidebar?.classList.contains('open')) {
          this.toggleMobileSidebar(false);
        }
      }
    });

    // Desktop sidebar collapse toggle (mirrors original NBC application)
    this.elements.btnToggleSidebarDesktop?.addEventListener('click', () => {
      this.toggleSidebar();
    });
    this.elements.btnCollapseSidebar?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Mobile sidebar offcanvas drawer triggers (mirrors original NBC application)
    this.elements.btnToggleSidebarMobile?.addEventListener('click', () => {
      this.toggleMobileSidebar(true);
    });
    this.elements.btnCloseSidebar?.addEventListener('click', () => {
      this.toggleMobileSidebar(false);
    });
    this.elements.sidebarBackdrop?.addEventListener('click', () => {
      this.toggleMobileSidebar(false);
    });

    // Auto-close mobile drawer if resizing viewport up to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && this.elements.sidebar?.classList.contains('open')) {
        this.toggleMobileSidebar(false);
      }
    });

    // Sidebar Category Jump links
    document.querySelectorAll('[data-category-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.categoryJump;
        document.querySelectorAll('.sidebar-menu-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');

        this.resetAllFilters();

        if (cat === 'private') {
          this.state.statusFilter = 'private';
          this.elements.filterExecutiveBtn?.classList.add('active-purple');
        } else if (cat === 'large') {
          this.state.largeCapacityOnly = true;
          this.elements.filterLargeCapBtn?.classList.add('active');
        } else if (cat === 'available') {
          this.state.statusFilter = 'available';
          this.elements.filterAvailableBtn?.classList.add('active-success');
        }

        this.updateResetButton();
        this.renderLocationPills();
        this.renderCatalog();
        if (window.innerWidth < 1024) this.toggleMobileSidebar(false);
      });
    });

    // Sidebar Building Jump links
    document.querySelectorAll('[data-building-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = btn.dataset.buildingJump;
        document.querySelectorAll('.sidebar-menu-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');

        this.state.buildingFilter = b;
        this.updateResetButton();
        this.renderLocationPills();
        this.renderCatalog();
        if (window.innerWidth < 1024) this.toggleMobileSidebar(false);
      });
    });

    // Sidebar Security Clearance action
    this.elements.sidebarSecurityBtn?.addEventListener('click', () => {
      this.showToast('Security Clearance: Tier 1 VIP Active (Access to Level 18 Executive Suites Granted)');
      if (window.innerWidth < 1024) this.toggleMobileSidebar(false);
    });

    // Quick status toggle buttons
    this.elements.filterAvailableBtn?.addEventListener('click', () => {
      this.state.statusFilter = this.state.statusFilter === 'available' ? 'all' : 'available';
      this.elements.filterAvailableBtn.classList.toggle('active-success', this.state.statusFilter === 'available');
      this.elements.filterSharedBtn?.classList.remove('active');
      this.elements.filterExecutiveBtn?.classList.remove('active-purple');
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    this.elements.filterSharedBtn?.addEventListener('click', () => {
      this.state.statusFilter = this.state.statusFilter === 'shared' ? 'all' : 'shared';
      this.elements.filterSharedBtn.classList.toggle('active', this.state.statusFilter === 'shared');
      this.elements.filterAvailableBtn?.classList.remove('active-success');
      this.elements.filterExecutiveBtn?.classList.remove('active-purple');
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    this.elements.filterExecutiveBtn?.addEventListener('click', () => {
      this.state.statusFilter = this.state.statusFilter === 'private' ? 'all' : 'private';
      this.elements.filterExecutiveBtn.classList.toggle('active-purple', this.state.statusFilter === 'private');
      this.elements.filterAvailableBtn?.classList.remove('active-success');
      this.elements.filterSharedBtn?.classList.remove('active');
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    this.elements.filterLargeCapBtn?.addEventListener('click', () => {
      this.state.largeCapacityOnly = !this.state.largeCapacityOnly;
      this.elements.filterLargeCapBtn.classList.toggle('active', this.state.largeCapacityOnly);
      this.updateResetButton();
      this.renderLocationPills();
      this.renderCatalog();
    });

    // Reset all filters button
    this.elements.btnResetFilters?.addEventListener('click', () => {
      this.resetAllFilters();
    });

    // Layout switcher
    this.elements.btnLayoutGrid?.addEventListener('click', () => {
      this.state.layoutMode = 'grid';
      this.elements.btnLayoutGrid.classList.add('active');
      this.elements.btnLayoutList?.classList.remove('active');
      this.renderCatalog();
    });

    this.elements.btnLayoutList?.addEventListener('click', () => {
      this.state.layoutMode = 'list';
      this.elements.btnLayoutList.classList.add('active');
      this.elements.btnLayoutGrid?.classList.remove('active');
      this.renderCatalog();
    });

    // Drawer events
    this.elements.btnCloseDrawer?.addEventListener('click', () => this.closeDrawer());
    this.elements.btnCancelDrawer?.addEventListener('click', () => this.closeDrawer());
    this.elements.drawerBackdrop?.addEventListener('click', () => this.closeDrawer());

    // Time Slot Selection in Drawer
    this.elements.drawerSlotsGrid?.addEventListener('click', (e) => {
      const slotBtn = e.target.closest('.slot-btn');
      if (!slotBtn || slotBtn.classList.contains('booked')) return;

      this.elements.drawerSlotsGrid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      slotBtn.classList.add('selected');
      this.state.selectedSlot = slotBtn.dataset.slot;
    });

    // Reservation confirmation button
    this.elements.btnConfirmReservation?.addEventListener('click', () => {
      this.confirmReservation();
    });
  }

  // ===================================================================
  // Sidebar Controls (Mirrors Original NBC Application)
  // ===================================================================

  // Desktop Sidebar Collapse Toggle (.sidebar-collapsed + localStorage persistence)
  toggleSidebar() {
    if (!this.elements.sidebar) return;
    const isCollapsed = this.elements.sidebar.classList.toggle('sidebar-collapsed');
    localStorage.setItem('nbc-sidebar-collapsed', String(isCollapsed));
    this.elements.btnToggleSidebarDesktop?.setAttribute('aria-expanded', String(!isCollapsed));
    this.elements.btnCollapseSidebar?.setAttribute('aria-expanded', String(!isCollapsed));
  }

  // Mobile Sidebar Offcanvas Drawer Toggle (.open + backdrop .active)
  toggleMobileSidebar(forceState = null) {
    if (!this.elements.sidebar) return;
    const shouldOpen = forceState !== null ? forceState : !this.elements.sidebar.classList.contains('open');
    if (shouldOpen) {
      this.elements.sidebar.classList.add('open');
      this.elements.sidebarBackdrop?.classList.add('active');
      this.elements.btnToggleSidebarMobile?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      this.elements.sidebar.classList.remove('open');
      this.elements.sidebarBackdrop?.classList.remove('active');
      this.elements.btnToggleSidebarMobile?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  closeSidebar() {
    this.toggleMobileSidebar(false);
  }

  updateResetButton() {
    const hasActiveFilters =
      this.state.searchQuery.length > 0 ||
      this.state.buildingFilter !== 'all' ||
      this.state.statusFilter !== 'all' ||
      this.state.largeCapacityOnly;

    if (this.elements.btnResetFilters) {
      this.elements.btnResetFilters.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }
  }

  resetAllFilters() {
    this.state.searchQuery = '';
    this.state.buildingFilter = 'all';
    this.state.statusFilter = 'all';
    this.state.largeCapacityOnly = false;

    if (this.elements.searchInput) this.elements.searchInput.value = '';
    this.elements.btnClearSearch?.classList.remove('visible');
    this.elements.filterAvailableBtn?.classList.remove('active-success');
    this.elements.filterSharedBtn?.classList.remove('active');
    this.elements.filterExecutiveBtn?.classList.remove('active-purple');
    this.elements.filterLargeCapBtn?.classList.remove('active');

    this.updateResetButton();
    this.renderLocationPills();
    this.renderCatalog();
  }

  // Filter pipeline
  getFilteredRooms() {
    return this.rooms.filter(room => {
      // 1. Status filter
      if (this.state.statusFilter === 'available') {
        if (room.status.toLowerCase() !== 'available') return false;
      } else if (this.state.statusFilter === 'shared') {
        if (room.isPrivate) return false;
      } else if (this.state.statusFilter === 'private') {
        if (!room.isPrivate) return false;
      }

      // 2. Capacity filter (large = >= 20 seats)
      if (this.state.largeCapacityOnly && Number(room.capacity) < 20) {
        return false;
      }

      // 3. Search query fuzzy match
      if (this.state.searchQuery) {
        const q = this.state.searchQuery;
        const name = (room.name || '').toLowerCase();
        const subtitle = (room.subtitle || '').toLowerCase();
        const floor = (room.floor || '').toLowerCase();
        const loc = (room.location || '').toLowerCase();
        const dept = (room.department || '').toLowerCase();
        const cat = (room.category || '').toLowerCase();
        const features = (room.features || []).map(f => f.toLowerCase()).join(' ');

        const matchesSearch =
          name.includes(q) ||
          subtitle.includes(q) ||
          floor.includes(q) ||
          loc.includes(q) ||
          dept.includes(q) ||
          cat.includes(q) ||
          features.includes(q);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  renderLocationPills() {
    if (!this.elements.locationPillsTrack) return;

    const filteredPool = this.getFilteredRooms();

    const pills = [
      { id: 'all', label: 'All Locations', icon: 'lucide:globe', count: filteredPool.length },
      ...this.hierarchy.map(g => ({
        id: g.id,
        label: g.shortName,
        icon: g.icon,
        count: filteredPool.filter(r => g.matches(r)).length
      }))
    ];

    this.elements.locationPillsTrack.innerHTML = pills.map(p => {
      const isActive = this.state.buildingFilter === p.id;
      return `
        <button
          type="button"
          class="loc-pill-btn ${isActive ? 'active' : ''}"
          data-building="${p.id}"
          role="tab"
          aria-selected="${isActive}"
        >
          <span class="iconify" data-icon="${p.icon}" data-stroke-width="2"></span>
          <span>${p.label}</span>
          <span class="pill-count-chip">${p.count}</span>
        </button>
      `;
    }).join('');

    // Attach click listeners to location pills
    this.elements.locationPillsTrack.querySelectorAll('.loc-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.buildingFilter = btn.dataset.building;
        this.updateResetButton();
        this.renderLocationPills();
        this.renderCatalog();
      });
    });
  }

  renderCatalog() {
    if (!this.elements.catalogContainer) return;

    const matchingRooms = this.getFilteredRooms();

    // If 0 rooms match filters
    if (matchingRooms.length === 0) {
      this.elements.catalogContainer.innerHTML = `
        <div class="rooms-empty-state">
          <div class="empty-icon" aria-hidden="true"><span class="iconify" data-icon="lucide:search" data-stroke-width="1.8" style="font-size: 2.2rem;"></span></div>
          <h3 style="font-size: var(--text-base); font-weight: 600; color: var(--text-primary);">
            No meeting rooms match your filter criteria
          </h3>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 440px;">
            ${this.state.searchQuery ? `No results found for "<strong>${this.escape(this.state.searchQuery)}</strong>".` : 'Try clearing your status or location filters.'}
          </p>
          <button type="button" class="btn-inspect" id="emptyStateResetBtn" style="margin-top: 12px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px;">
            <span class="iconify" data-icon="lucide:rotate-ccw" data-stroke-width="2"></span>
            <span>Reset All Filters</span>
          </button>
        </div>
      `;
      document.getElementById('emptyStateResetBtn')?.addEventListener('click', () => {
        this.resetAllFilters();
      });
      return;
    }

    // Determine which hierarchy groups to render
    const groupsToRender = this.state.buildingFilter === 'all'
      ? this.hierarchy
      : this.hierarchy.filter(g => g.id === this.state.buildingFilter);

    let html = '';

    groupsToRender.forEach(group => {
      const groupRooms = matchingRooms.filter(r => group.matches(r));
      if (groupRooms.length === 0) return;

      // Sort rooms by floor level descending
      groupRooms.sort((a, b) => {
        const floorA = parseInt((a.floorShort || '').replace(/\D/g, ''), 10) || 0;
        const floorB = parseInt((b.floorShort || '').replace(/\D/g, ''), 10) || 0;
        return floorB - floorA;
      });

      const cardsHtml = groupRooms.map(room => this.renderRoomCard(room)).join('');

      html += `
        <section class="location-group-section" data-group-id="${group.id}">
          <div class="group-section-header">
            <div class="group-title-wrap">
              <span class="group-icon">${group.icon}</span>
              <div>
                <h2 class="group-title">${group.title}</h2>
                <div style="font-size: 11px; color: var(--text-tertiary);">${group.description}</div>
              </div>
            </div>
            <span class="group-count-badge">${groupRooms.length} ${groupRooms.length === 1 ? 'Suite' : 'Suites'}</span>
          </div>

          <div class="rooms-grid ${this.state.layoutMode === 'list' ? 'list-mode' : ''}">
            ${cardsHtml}
          </div>
        </section>
      `;
    });

    this.elements.catalogContainer.innerHTML = html;

    // Attach card event listeners
    this.elements.catalogContainer.querySelectorAll('.btn-inspect').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.dataset.roomId;
        this.openDrawer(roomId);
      });
    });

    this.elements.catalogContainer.querySelectorAll('.btn-reserve').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.dataset.roomId;
        this.openDrawer(roomId);
      });
    });

    this.elements.catalogContainer.querySelectorAll('.room-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent double trigger if clicking button
        if (e.target.closest('button') || e.target.closest('a')) return;
        const roomId = card.dataset.roomId;
        this.openDrawer(roomId);
      });
    });
  }

  renderRoomCard(room) {
    const isAvailable = room.status.toLowerCase() === 'available';
    const statusClass = isAvailable ? 'status-available' : 'status-reserved';
    const statusDot = isAvailable ? '●' : '○';

    const typeClass = room.isPrivate ? 'type-private' : 'type-shared';
    const typeLabel = room.isPrivate ? 'Private' : 'Shared';
    const typeIcon = room.isPrivate ? 'lucide:lock' : 'lucide:globe';

    const displayFeatures = (room.features || []).slice(0, 3);
    const extraFeaturesCount = Math.max(0, (room.features || []).length - 3);

    return `
      <article class="room-card" data-room-id="${room.id}" style="cursor: pointer;" tabindex="0" role="button" aria-label="${room.name}, capacity ${room.capacity} seats">
        
        <!-- Media Banner -->
        <div class="card-media-banner">
          <img
            src="${room.image}"
            alt="${this.escape(room.name)}"
            class="room-photo"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';"
          />
          <div class="media-gradient-scrim"></div>

          <!-- Floor Badge -->
          <div class="banner-pill-left">
            <span class="iconify" data-icon="lucide:layers" data-stroke-width="2"></span>
            <span>${room.floorShort || 'Ground'}</span>
          </div>

          <!-- Status & Type Pills -->
          <div class="banner-pill-right">
            <span class="status-pill ${statusClass}">
              <span>${statusDot}</span>
              <span>${room.status}</span>
            </span>
            <span class="type-pill ${typeClass}">
              <span class="iconify" data-icon="${typeIcon}" data-stroke-width="2"></span>
              <span>${typeLabel}</span>
            </span>
          </div>

          <!-- Title Overlay -->
          <div class="banner-title-overlay">
            <div class="card-room-id">${room.id} · ${room.category}</div>
            <h3 class="card-room-title">${this.escape(room.name)}</h3>
          </div>
        </div>

        <!-- Content Area -->
        <div class="card-content-area">
          <p class="card-subtitle">${this.escape(room.subtitle || room.description)}</p>

          <!-- Key Specs Strip -->
          <div class="specs-capsule-strip">
            <div class="spec-capsule-item">
              <span class="spec-val">${room.capacity} Seats</span>
              <span class="spec-lbl">Capacity</span>
            </div>
            <div class="spec-capsule-item">
              <span class="spec-val">${room.size}</span>
              <span class="spec-lbl">Dimension</span>
            </div>
            <div class="spec-capsule-item">
              <span class="spec-val">${room.floorShort}</span>
              <span class="spec-lbl">Location</span>
            </div>
          </div>

          <!-- Amenities Preview -->
          <div class="amenities-preview-wrap">
            <div class="amenities-tags-grid">
              ${displayFeatures.map(f => `
                <span class="amenity-chip"><span class="iconify" data-icon="lucide:check" data-stroke-width="2"></span> ${this.escape(f)}</span>
              `).join('')}
              ${extraFeaturesCount > 0 ? `<span class="amenity-chip" style="color: var(--color-primary);">+${extraFeaturesCount} more</span>` : ''}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-actions-row">
            <button type="button" class="btn-inspect" data-room-id="${room.id}" aria-label="View details for ${room.name}">
              Inspect Specs
            </button>
            <button type="button" class="btn-reserve" data-room-id="${room.id}" aria-label="Reserve ${room.name}">
              <span>${room.isPrivate ? 'Request VIP' : 'Instant Book'}</span>
              <span class="iconify" data-icon="lucide:arrow-right" data-stroke-width="2"></span>
            </button>
          </div>
        </div>

      </article>
    `;
  }

  // Slide-over Drawer Interactions
  openDrawer(roomId) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;

    this.state.activeRoomId = roomId;

    // Populate Drawer Elements
    if (this.elements.drawerRoomCategory) this.elements.drawerRoomCategory.textContent = `${room.id} · ${room.category}`;
    if (this.elements.drawerRoomTitle) this.elements.drawerRoomTitle.textContent = room.name;
    if (this.elements.drawerRoomFloor) this.elements.drawerRoomFloor.textContent = `${room.location} · ${room.floor}`;
    if (this.elements.drawerCapacity) this.elements.drawerCapacity.textContent = `${room.capacity} Seats`;
    if (this.elements.drawerSize) this.elements.drawerSize.textContent = room.size;
    if (this.elements.drawerStatusBadge) this.elements.drawerStatusBadge.textContent = room.status;
    if (this.elements.drawerDescriptionEn) this.elements.drawerDescriptionEn.textContent = room.description;
    if (this.elements.drawerDescriptionKh) this.elements.drawerDescriptionKh.textContent = room.descriptionKh || '';

    // Gallery & Thumbnails
    const galleryImages = room.images && room.images.length > 0 ? room.images : [room.image];
    if (this.elements.drawerMainImg) this.elements.drawerMainImg.src = galleryImages[0];

    if (this.elements.drawerThumbsContainer) {
      this.elements.drawerThumbsContainer.innerHTML = galleryImages.map((img, i) => `
        <div class="thumb-item ${i === 0 ? 'active' : ''}" data-index="${i}">
          <img src="${img}" alt="Thumbnail ${i + 1}" />
        </div>
      `).join('');

      this.elements.drawerThumbsContainer.querySelectorAll('.thumb-item').forEach(thumb => {
        thumb.addEventListener('click', () => {
          this.elements.drawerThumbsContainer.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          const idx = parseInt(thumb.dataset.index, 10);
          if (this.elements.drawerMainImg) this.elements.drawerMainImg.src = galleryImages[idx];
        });
      });
    }

    // Installed Amenities
    if (this.elements.drawerAmenitiesList) {
      this.elements.drawerAmenitiesList.innerHTML = (room.features || []).map(f => `
        <span class="amenity-chip" style="font-size: 12px; padding: 4px 10px;"><span class="iconify" data-icon="lucide:check" data-stroke-width="2"></span> ${this.escape(f)}</span>
      `).join('');
    }

    // Coordinator Card
    if (this.elements.drawerCoordinatorCard) {
      if (room.roomOwner) {
        this.elements.drawerCoordinatorCard.style.display = 'flex';
        if (this.elements.drawerCoordAvatar) this.elements.drawerCoordAvatar.src = room.roomOwner.avatar;
        if (this.elements.drawerCoordName) this.elements.drawerCoordName.textContent = room.roomOwner.name;
        if (this.elements.drawerCoordTitle) this.elements.drawerCoordTitle.textContent = room.roomOwner.title;
        if (this.elements.drawerCoordPhone) this.elements.drawerCoordPhone.textContent = room.roomOwner.phone;
      } else {
        // Standard shared room coordinator
        this.elements.drawerCoordinatorCard.style.display = 'flex';
        if (this.elements.drawerCoordAvatar) this.elements.drawerCoordAvatar.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
        if (this.elements.drawerCoordName) this.elements.drawerCoordName.textContent = "General Secretariat Logistics Desk";
        if (this.elements.drawerCoordTitle) this.elements.drawerCoordTitle.textContent = "NBC Asset & Facility Management";
        if (this.elements.drawerCoordPhone) this.elements.drawerCoordPhone.textContent = "Ext. 8800 (General)";
      }
    }

    // Open drawer
    this.elements.drawerBackdrop?.classList.add('open');
    this.elements.roomDrawer?.classList.add('open');
    this.elements.roomDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    this.elements.drawerBackdrop?.classList.remove('open');
    this.elements.roomDrawer?.classList.remove('open');
    this.elements.roomDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  confirmReservation() {
    const room = this.rooms.find(r => r.id === this.state.activeRoomId);
    if (!room) return;

    this.showToast(`Hold confirmed for ${room.name} (${this.state.selectedSlot})`);
    this.closeDrawer();
  }

  showToast(message) {
    if (!this.elements.toastNotice || !this.elements.toastMessage) return;

    this.elements.toastMessage.textContent = message;
    this.elements.toastNotice.classList.add('show');

    setTimeout(() => {
      this.elements.toastNotice.classList.remove('show');
    }, 3500);
  }

  escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Initialize on document ready (handles both loading and already loaded readyStates)
function initRoomsApp() {
  if (!window.roomsCatalogApp) {
    window.roomsCatalogApp = new RoomsCatalogController();
    window.app = window.app || window.roomsCatalogApp;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoomsApp);
} else {
  initRoomsApp();
}
