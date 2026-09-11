// Room Catalog View Component (view-book-room) - Powered by Vue 3 CDN
// Ultra-smooth reactive filtering, search, and FLIP TransitionGroup animations
window.NBC = window.NBC || {};
window.NBC.views = window.NBC.views || {};

window.NBC.views['book-room'] = {
  _vueApp: null,
  _unsubscribeStore: null,
  _vueInstance: null,

  // Official NBC Building Hierarchy Structure (Phnom Penh HQ, IT, Branch, Provinces)
  hierarchyGroups: [
    {
      id: 'hq',
      title: 'National Bank of Cambodia - Headquarters',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      pillIcon: 'lucide:landmark',
      pillLabel: 'Headquarters',
      matches: (room) => {
        const loc = (room.location || '').toLowerCase();
        const prov = (room.province || '').toLowerCase();
        return (
          loc.includes('headquarters') ||
          (prov.includes('phnom penh') &&
            !loc.includes('it department') &&
            !loc.includes('branch'))
        );
      }
    },
    {
      id: 'it',
      title: 'National Bank of Cambodia - IT Department',
      badgeClass: 'bg-[#FAF7F4] text-stone-800 border-[#E9E3DD]',
      pillIcon: 'lucide:cpu',
      pillLabel: 'IT Dept',
      matches: (room) => {
        const loc = (room.location || '').toLowerCase();
        return loc.includes('it department') || loc.includes('it building');
      }
    },
    {
      id: 'branch',
      title: 'National Bank of Cambodia - Phnom Penh Branch',
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      pillIcon: 'lucide:building-2',
      pillLabel: 'PP Branch',
      matches: (room) => {
        const loc = (room.location || '').toLowerCase();
        const prov = (room.province || '').toLowerCase();
        return (
          prov.includes('phnom penh') &&
          (loc.includes('phnom penh branch') ||
            (loc.includes('branch') &&
              !loc.includes('battambang') &&
              !loc.includes('siem reap')))
        );
      }
    },
    {
      id: 'provinces',
      title: 'Regional Provincial Branches',
      badgeClass: 'bg-purple-50 text-purple-900 border-purple-300',
      pillIcon: 'lucide:map-pin',
      pillLabel: 'Provinces',
      matches: (room) => {
        const prov = (room.province || '').toLowerCase();
        return prov !== '' && !prov.includes('phnom penh');
      }
    }
  ],

  render(container) {
    if (!container) return;

    // Cleanly unmount previous Vue instance to prevent memory leaks and duplicate store subscriptions
    this.cleanup();

    container.innerHTML = '<div id="vue-catalog-root"></div>';

    if (typeof Vue === 'undefined') {
      console.error('Vue 3 is not loaded via CDN. Please check index.html.');
      return;
    }

    const { createApp, ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const hierarchyGroups = this.hierarchyGroups;
    const self = this;

    const app = createApp({
      setup() {
        // State
        const searchQuery = ref('');
        const currentBuildingFilter = ref('all');
        const currentStatusFilter = ref('all');
        const rooms = ref([]);

        // Load initial rooms
        if (typeof bookingStore !== 'undefined') {
          rooms.value = [...(bookingStore.getRooms() || [])];
        }

        // Subscribe to global store updates
        let unsub = null;
        if (typeof bookingStore !== 'undefined' && typeof bookingStore.subscribe === 'function') {
          unsub = bookingStore.subscribe(() => {
            rooms.value = [...(bookingStore.getRooms() || [])];
          });
          self._unsubscribeStore = unsub;
        }

        // Helpers
        const getFloorNumber = (floorStr) => {
          if (!floorStr) return 0;
          const match = String(floorStr).match(/(?:Level|Floor)\s*(\d+)/i);
          if (match) return parseInt(match[1], 10);
          if (/ground/i.test(floorStr)) return 0;
          return 0;
        };

        const formatFloorShort = (floorStr) => {
          if (!floorStr) return 'Ground';
          const match = String(floorStr).match(/(?:Level|Floor)\s*(\d+)/i);
          if (match) return `Floor ${match[1]}`;
          if (/ground/i.test(floorStr)) return 'Ground Floor';
          return String(floorStr).split('-')[0].trim();
        };

        const isMyRoom = (room) => {
          return !!room.isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');
        };

        const isOtherPrivate = (room) => {
          return !!room.isPrivate && !isMyRoom(room);
        };

        const getMapInfo = (room) => {
          if (typeof bookingStore !== 'undefined' && bookingStore.getRoomMapDetails) {
            return bookingStore.getRoomMapDetails(room);
          }
          return { externalUrl: '#', building: 'NBC' };
        };

        const getFeatureIcon = (featureName) => {
          const f = String(featureName || '').toLowerCase();
          if (f.includes('tv') || f.includes('screen') || f.includes('display') || f.includes('monitor')) return 'lucide:monitor';
          if (f.includes('video') || f.includes('camera') || f.includes('call') || f.includes('streaming') || f.includes('webcam')) return 'lucide:video';
          if (f.includes('chair') || f.includes('seat') || f.includes('sofa') || f.includes('desk') || f.includes('table')) return 'lucide:armchair';
          if (f.includes('wi-fi') || f.includes('wifi') || f.includes('internet') || f.includes('network')) return 'lucide:wifi';
          if (f.includes('board') || f.includes('marker') || f.includes('podium') || f.includes('stage') || f.includes('presentation')) return 'lucide:presentation';
          if (f.includes('coffee') || f.includes('tea') || f.includes('drink') || f.includes('water')) return 'lucide:coffee';
          if (f.includes('mic') || f.includes('speaker') || f.includes('audio') || f.includes('sound') || f.includes('phone')) return 'lucide:mic';
          if (f.includes('socket') || f.includes('power') || f.includes('charge')) return 'lucide:zap';
          if (f.includes('cable') || f.includes('ethernet') || f.includes('port')) return 'lucide:network';
          if (f.includes('elevator')) return 'lucide:arrow-up-down';
          return 'lucide:sparkles';
        };

        const getRoomBorderClass = (room) => {
          const isOther = isOtherPrivate(room);
          const isAvailable = (room.status || 'Available').toLowerCase() === 'available';
          if (isOther) {
            return 'border-2 border-amber-600/40 hover:border-amber-600 shadow-[0_2px_12px_rgba(217,119,6,0.08)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.16)]';
          } else if (!isAvailable) {
            return 'border border-red-200/80 hover:border-red-300 shadow-[0_2px_8px_rgba(220,38,38,0.04)]';
          }
          return 'border border-[#E9E3DD] hover:border-[#991B1B]/40 shadow-[0_2px_8px_rgba(42,8,8,0.04)] hover:shadow-[0_8px_24px_rgba(153,27,27,0.08)]';
        };

        const getRoomTypeIcon = (room) => {
          return (isMyRoom(room) || isOtherPrivate(room)) ? 'lucide:lock' : 'lucide:globe';
        };

        const getRoomTypeIconColor = (room) => {
          return (isMyRoom(room) || isOtherPrivate(room)) ? 'text-amber-700' : 'text-emerald-700';
        };

        const getRoomTypeTextColor = (room) => {
          return (isMyRoom(room) || isOtherPrivate(room)) ? 'text-amber-900' : 'text-emerald-800';
        };

        const getRoomTypeLabel = (room) => {
          return (isMyRoom(room) || isOtherPrivate(room)) ? 'Private' : 'Shared';
        };

        const handleImgError = (event) => {
          event.target.src = 'assets/rooms/boardroom-alpha.jpg';
        };

        // Computed Filtered Rooms
        const matchingRooms = computed(() => {
          const query = searchQuery.value.trim().toLowerCase();
          return rooms.value.filter(room => {
            if (!room) return false;

            // Status filter
            if (currentStatusFilter.value === 'available') {
              const isAvail = (room.status || 'Available').toLowerCase() === 'available';
              if (!isAvail) return false;
            } else if (currentStatusFilter.value === 'public') {
              if (room.isPrivate) return false;
            } else if (currentStatusFilter.value === 'private') {
              if (!room.isPrivate) return false;
            }

            if (!query) return true;

            const name = (room.name || '').toLowerCase();
            const floor = (room.floor || '').toLowerCase();
            const prov = (room.province || '').toLowerCase();
            const loc = (room.location || '').toLowerCase();
            const cat = (room.category || '').toLowerCase();
            const dept = (room.department || '').toLowerCase();
            const ownerName = (room.roomOwner?.name || '').toLowerCase();
            const features = Array.isArray(room.features) ? room.features.map(f => String(f).toLowerCase()) : [];

            return (
              name.includes(query) ||
              floor.includes(query) ||
              prov.includes(query) ||
              loc.includes(query) ||
              cat.includes(query) ||
              dept.includes(query) ||
              ownerName.includes(query) ||
              features.some(f => f.includes(query))
            );
          });
        });

        // Building Location Pills
        const buildingPills = computed(() => [
          { id: 'all', label: 'All Locations', icon: 'lucide:layout-grid' },
          ...hierarchyGroups.map(g => ({
            id: g.id,
            label: g.pillLabel,
            icon: g.pillIcon
          }))
        ]);

        // Status Toggle Chips
        const statusChips = [
          { id: 'available', label: 'Available Now', icon: 'lucide:check-circle-2' },
          { id: 'public', label: 'Shared Only', icon: 'lucide:globe' },
          { id: 'private', label: 'Private Only', icon: 'lucide:lock' }
        ];

        // Grouped Hierarchy Sections to Display
        const displayedSections = computed(() => {
          const groups = currentBuildingFilter.value === 'all'
            ? hierarchyGroups
            : hierarchyGroups.filter(g => g.id === currentBuildingFilter.value);

          return groups.map(group => {
            const groupRooms = matchingRooms.value.filter(r => group.matches(r));
            if (groupRooms.length === 0) return null;

            // Sort rooms inside group by floor descending, then capacity
            const sorted = [...groupRooms].sort((a, b) => {
              const floorDiff = getFloorNumber(b.floor) - getFloorNumber(a.floor);
              if (floorDiff !== 0) return floorDiff;
              return (b.capacity || 0) - (a.capacity || 0);
            });

            return {
              id: group.id,
              title: group.title,
              badgeClass: group.badgeClass,
              rooms: sorted
            };
          }).filter(Boolean);
        });

        const hasActiveFilters = computed(() => {
          return currentBuildingFilter.value !== 'all' ||
                 currentStatusFilter.value !== 'all' ||
                 searchQuery.value.trim().length > 0;
        });

        // Iconify rescanning on DOM changes
        const scanIcons = () => {
          nextTick(() => {
            if (window.Iconify && typeof window.Iconify.scan === 'function') {
              window.Iconify.scan();
            }
          });
        };

        watch([searchQuery, currentBuildingFilter, currentStatusFilter, rooms], () => {
          scanIcons();
        });

        onMounted(() => {
          scanIcons();
        });

        onUnmounted(() => {
          if (unsub) unsub();
        });

        // Actions
        const setBuildingFilter = (id) => {
          currentBuildingFilter.value = id;
        };

        const setStatusFilter = (id) => {
          currentStatusFilter.value = currentStatusFilter.value === id ? 'all' : id;
        };

        const clearSearch = () => {
          searchQuery.value = '';
          const el = document.getElementById('room-search-input');
          if (el) el.focus();
        };

        const resetAllFilters = () => {
          currentBuildingFilter.value = 'all';
          currentStatusFilter.value = 'all';
          searchQuery.value = '';
        };

        const navigateToAddRoom = () => {
          if (window.app && typeof window.app.navigateTo === 'function') {
            window.app.navigateTo('create-room');
          }
        };

        const handleDetails = (room) => {
          if (window.app && typeof window.app.navigateTo === 'function') {
            window.app.navigateTo('room-details', { roomId: room.id });
          }
        };

        const handleProceed = (room) => {
          if (window.app && typeof window.app.selectRoomAndProceed === 'function') {
            window.app.selectRoomAndProceed(room.id, 'book-room');
          } else if (window.app && typeof window.app.navigateTo === 'function') {
            window.app.navigateTo('request-form', { roomId: room.id });
          }
        };

        return {
          searchQuery,
          currentBuildingFilter,
          currentStatusFilter,
          rooms,
          matchingRooms,
          buildingPills,
          statusChips,
          displayedSections,
          hasActiveFilters,
          formatFloorShort,
          isMyRoom,
          isOtherPrivate,
          getMapInfo,
          getFeatureIcon,
          getRoomBorderClass,
          getRoomTypeIcon,
          getRoomTypeIconColor,
          getRoomTypeTextColor,
          getRoomTypeLabel,
          handleImgError,
          setBuildingFilter,
          setStatusFilter,
          clearSearch,
          resetAllFilters,
          navigateToAddRoom,
          handleDetails,
          handleProceed
        };
      },

      template: `
        <div>
          <!-- Sticky Frosted Search & Actions Bar -->
          <div class="sticky top-11 sm:top-14 z-15 -mx-1 sm:-mx-2 px-1 sm:px-2 py-2 bg-[#F9F7F5]/90 backdrop-blur-md">
            <div class="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E9E3DD] p-3 sm:p-4 shadow-sm hover:shadow-md transition space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <!-- Main Search Input with Clear Button -->
                <div class="relative flex-1">
                  <app-icon icon="lucide:search" class-name="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6857] text-base pointer-events-none" />
                  <input
                    type="text"
                    v-model="searchQuery"
                    id="room-search-input"
                    placeholder="Search rooms by name, floor, amenities, or department..."
                    class="w-full h-11 pl-10 pr-9 bg-[#F4EFEA] hover:bg-[#EAE3DC] focus:bg-white text-[#1C1917] text-xs sm:text-sm font-medium rounded-xl border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition outline-none"
                  />
                  <!-- Clear Button (X) -->
                  <transition name="fade-scale">
                    <button
                      v-if="searchQuery.trim().length > 0"
                      @click="clearSearch"
                      id="room-search-clear"
                      class="search-clear-btn"
                      title="Clear search"
                      aria-label="Clear search"
                      type="button"
                    >
                      <app-icon icon="lucide:x" class-name="text-xs" />
                    </button>
                  </transition>
                </div>

                <!-- Add Room Button (Admin Quick Action) -->
                <button
                  @click="navigateToAddRoom"
                  class="h-11 px-4 rounded-xl text-xs font-bold bg-[#260707] hover:bg-[#3D0C0C] text-white border border-white/20 shadow-xs flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
                  title="Create a new meeting room (Admin)"
                  type="button"
                >
                  <app-icon icon="lucide:plus-circle" class-name="text-base text-white" />
                  <span>Add Room</span>
                </button>
              </div>

              <!-- Smart Quick-Filter Chips Bar with Segmented Glider Track -->
              <div class="flex items-center justify-between gap-3 pt-1 border-t border-[#E9E3DD]/60 overflow-x-auto no-scrollbar">
                <div class="flex items-center gap-2 flex-nowrap py-0.5 shrink-0">
                  <!-- Clean Location Filter Track -->
                  <div id="building-pills-track">
                    <button
                      v-for="p in buildingPills"
                      :key="p.id"
                      :id="'pill-btn-' + p.id"
                      @click="setBuildingFilter(p.id)"
                      class="glider-pill-btn"
                      :class="{ active: currentBuildingFilter === p.id }"
                      type="button"
                    >
                      <app-icon :icon="p.icon" class-name="text-sm" />
                      <span>{{ p.label }}</span>
                    </button>
                  </div>

                  <div class="h-4 w-px bg-stone-300 mx-1 shrink-0"></div>

                  <!-- Status Toggle Chips -->
                  <div class="flex items-center gap-1.5 flex-nowrap">
                    <button
                      v-for="s in statusChips"
                      :key="s.id"
                      :id="'status-chip-' + s.id"
                      @click="setStatusFilter(s.id)"
                      class="status-chip"
                      :class="{ active: currentStatusFilter === s.id }"
                      type="button"
                    >
                      <app-icon :icon="s.icon" class-name="text-sm" />
                      <span>{{ s.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Reset Filter Button (Shown when filters active) -->
                <transition name="fade-scale">
                  <div v-if="hasActiveFilters" class="shrink-0">
                    <button
                      @click="resetAllFilters"
                      class="text-xs font-semibold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#FEF2F2] transition cursor-pointer"
                      type="button"
                    >
                      <app-icon icon="lucide:rotate-ccw" class-name="text-xs" />
                      <span>Reset</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Live Results Summary Info -->
          <div class="flex items-center justify-between px-1 text-xs text-[#7D6857] my-2">
            <span class="font-medium transition-opacity duration-200">
              Showing {{ matchingRooms.length }} {{ matchingRooms.length === 1 ? 'room' : 'rooms' }} across NBC
            </span>
          </div>

          <!-- Empty State (when 0 rooms match) -->
          <transition name="fade-scale">
            <div
              v-if="matchingRooms.length === 0"
              class="animate-empty-state py-12 px-6 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-xs space-y-3.5 max-w-xl mx-auto my-6"
            >
              <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-700 border border-amber-200 mx-auto flex items-center justify-center">
                <app-icon icon="lucide:search-x" class-name="text-2xl text-amber-700" :stroke-width="1.8" />
              </div>
              <div class="space-y-1">
                <h4 class="text-base font-heading font-bold text-stone-900">No matching rooms found</h4>
                <p class="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  <span v-if="searchQuery.trim()">No rooms match &ldquo;<strong>{{ searchQuery.trim() }}</strong>&rdquo;. </span>
                  <span v-else>No rooms match your selected building or status filters. </span>
                  Try resetting your filters to see all available rooms.
                </p>
              </div>
              <div class="pt-2">
                <button
                  @click="resetAllFilters"
                  class="px-4 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-xs rounded-xl transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <app-icon icon="lucide:rotate-ccw" class-name="text-sm text-white" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </transition>

          <!-- Hierarchy Sections and FLIP TransitionGroup Card Grid -->
          <!-- Hierarchy Sections and Card Grid (Pure Fade, No Motion, No Layout Shifts) -->
          <div
            v-if="matchingRooms.length > 0"
            :key="currentBuildingFilter + '-' + currentStatusFilter"
            class="catalog-view-container space-y-8 flex flex-col pt-0.5"
          >
            <div class="space-y-8">
              <section
                v-for="group in displayedSections"
                :key="group.id"
                class="space-y-3.5"
                :data-building-id="group.id"
              >
                <!-- Location Section Header -->
                <div class="flex items-center justify-between pb-2 border-b border-[#E9E3DD]">
                  <div class="flex items-center gap-2.5">
                    <h3 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight">
                      {{ group.title }}
                    </h3>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs" :class="group.badgeClass">
                      {{ group.rooms.length }} {{ group.rooms.length === 1 ? 'Room' : 'Rooms' }}
                    </span>
                  </div>
                </div>

                <!-- Section 3-Column Grid -->
                <div
                  class="rooms-section-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                >
                  <div
                    v-for="room in group.rooms"
                    :key="room.id"
                    class="catalog-room-card bg-white rounded-2xl overflow-hidden flex flex-col justify-between group transition-[border-color,box-shadow] duration-200"
                    :class="getRoomBorderClass(room)"
                  >
                    <!-- Top Image with Floor Badge, Map Button and Title -->
                    <div class="relative h-44 sm:h-48 bg-stone-900 overflow-hidden">
                      <img
                        :src="room.image || 'assets/rooms/boardroom-alpha.jpg'"
                        :alt="room.name || 'Meeting Room'"
                        loading="lazy"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        @error="handleImgError"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>

                      <!-- Top-Left Floor Badge (NBC Dark Red Heritage) -->
                      <div class="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#260707]/90 text-white shadow-xs flex items-center gap-1 backdrop-blur-md border border-white/20">
                          <app-icon icon="lucide:layers" class-name="text-xs text-white" />
                          <span>{{ formatFloorShort(room.floor) }}</span>
                        </span>
                      </div>

                      <!-- Top-Right Map Button -->
                      <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        <a
                          :href="getMapInfo(room).externalUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          @click.stop
                          class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#260707]/90 hover:bg-[#380B0B] text-white shadow-xs flex items-center gap-1 backdrop-blur-md transition cursor-pointer border border-white/20"
                          :title="'Open Google Maps for ' + (getMapInfo(room).building || 'Location')"
                        >
                          <app-icon icon="lucide:map-pin" class-name="text-white text-xs" />
                          <span>Map</span>
                        </a>
                      </div>

                      <!-- Bottom Title & Subtitle inside Image -->
                      <div class="absolute bottom-3 left-3.5 right-3.5 text-white pointer-events-none z-10">
                        <h3 class="font-heading font-bold text-[15px] sm:text-[17px] text-white leading-snug drop-shadow-sm line-clamp-1">
                          {{ room.name || 'Untitled Room' }}
                        </h3>
                        <p class="text-white/90 text-[11.5px] sm:text-xs mt-0.5 font-normal line-clamp-1 drop-shadow-xs">
                          {{ room.subtitle || 'Modern meeting space for productive teams' }}
                        </p>
                      </div>
                    </div>

                    <!-- Card Body Content -->
                    <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div class="space-y-2.5">
                        <!-- Room Status & Capacity Capsule -->
                        <div class="bg-[#F9F7F5] border border-[#E9E3DD] rounded-xl py-1 px-1 flex items-center min-h-[32px]">
                          <div class="flex-1 relative flex items-center justify-center min-h-[28px] px-1">
                            <div
                              class="absolute left-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0 border border-[#E9E3DD]"
                              :class="getRoomTypeIconColor(room)"
                            >
                              <app-icon :icon="getRoomTypeIcon(room)" class-name="text-xs" />
                            </div>
                            <span class="font-bold text-xs text-center" :class="getRoomTypeTextColor(room)">
                              {{ getRoomTypeLabel(room) }}
                            </span>
                          </div>

                          <div class="h-4 w-px bg-[#E9E3DD] shrink-0"></div>

                          <div class="flex-1 relative flex items-center justify-center min-h-[28px] px-1">
                            <div class="absolute left-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#6F5849] shadow-2xs shrink-0 border border-[#E9E3DD]">
                              <app-icon icon="lucide:users" class-name="text-xs" />
                            </div>
                            <span class="font-bold text-[#3E2B1E] text-xs text-center font-mono">
                              {{ Number(room.capacity) || 0 }} Seats
                            </span>
                          </div>
                        </div>

                        <!-- Amenities -->
                        <div class="space-y-1.5">
                          <div class="flex items-center justify-between">
                            <h4 class="font-bold text-[#3E2B1E] text-xs tracking-tight">Amenities</h4>
                            <span
                              v-if="(room.features || []).length > 3"
                              class="bg-[#E9E3DD] text-[#6F5849] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#D8CFC7]"
                            >
                              +{{ (room.features || []).length - 3 }} more
                            </span>
                          </div>

                          <div class="grid grid-cols-2 gap-1.5">
                            <template v-if="(room.features || []).length > 0">
                              <div
                                v-for="(f, fIdx) in (room.features || []).slice(0, 3)"
                                :key="fIdx"
                                class="bg-[#F9F7F5] hover:bg-[#F4EFEA] border border-[#E9E3DD] rounded-lg py-1 px-1.5 flex items-center gap-1.5 text-[#3E2B1E] text-[11px] font-medium min-w-0 transition"
                                :title="f"
                              >
                                <app-icon :icon="getFeatureIcon(f)" class-name="text-[#7D6857] text-xs shrink-0" />
                                <span class="truncate whitespace-nowrap">{{ f }}</span>
                              </div>
                            </template>
                            <div v-else class="col-span-2 text-[11px] text-[#A8988B] py-1 italic">
                              Standard meeting room equipment
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Bottom Action Buttons: NBC Crimson Action -->
                      <div class="pt-2.5 border-t border-[#E9E3DD]/80 grid grid-cols-2 gap-2 items-stretch">
                        <button
                          @click="handleDetails(room)"
                          class="h-9 sm:h-10 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F4EFEA] active:bg-[#E9E3DD] text-[#1C1917] border border-[#D8CFC7] hover:border-[#991B1B]/50 transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          type="button"
                        >
                          <app-icon icon="lucide:file-text" class-name="text-sm text-[#78716C] shrink-0" />
                          <span>Details</span>
                        </button>

                        <button
                          @click="handleProceed(room)"
                          class="h-9 sm:h-10 px-2 rounded-xl text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          type="button"
                        >
                          <app-icon icon="lucide:calendar" class-name="text-sm text-white shrink-0" />
                          <span>{{ isOtherPrivate(room) ? 'Request' : 'Book Room' }}</span>
                          <app-icon icon="lucide:arrow-right" class-name="text-sm text-white shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      `
    });

    // Register reusable Lucide Iconify component for clean SVG scanning
    app.component('app-icon', {
      props: {
        icon: { type: String, required: true },
        className: { type: String, default: '' },
        strokeWidth: { type: [Number, String], default: 2 }
      },
      mounted() {
        if (window.Iconify && typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(this.$el);
        }
      },
      updated() {
        if (window.Iconify && typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(this.$el);
        }
      },
      template: `
        <span class="inline-flex items-center justify-center shrink-0" :class="className">
          <span class="iconify" :data-icon="icon" :data-stroke-width="strokeWidth"></span>
        </span>
      `
    });

    this._vueApp = app;
    this._vueInstance = app.mount('#vue-catalog-root');
  },

  cleanup() {
    if (typeof this._unsubscribeStore === 'function') {
      this._unsubscribeStore();
      this._unsubscribeStore = null;
    }
    if (this._vueApp) {
      try {
        this._vueApp.unmount();
      } catch (e) {
        console.warn('Error unmounting Vue catalog app:', e);
      }
      this._vueApp = null;
      this._vueInstance = null;
    }
  },

  update() {
    // Vue automatically reacts to bookingStore updates via reactive subscription
  },

  // Backward-compatible delegators if called by app orchestrator
  setBuildingFilter(id) {
    if (this._vueInstance && typeof this._vueInstance.setBuildingFilter === 'function') {
      this._vueInstance.setBuildingFilter(id);
    }
  },

  setStatusFilter(id) {
    if (this._vueInstance && typeof this._vueInstance.setStatusFilter === 'function') {
      this._vueInstance.setStatusFilter(id);
    }
  },

  resetRoomFilters() {
    if (this._vueInstance && typeof this._vueInstance.resetAllFilters === 'function') {
      this._vueInstance.resetAllFilters();
    }
  }
};
