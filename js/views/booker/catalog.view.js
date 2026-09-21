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
      title: 'Headquarters (Wat Phnom)',
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
      title: 'IT Department Building',
      pillIcon: 'lucide:cpu',
      pillLabel: 'IT Dept',
      matches: (room) => {
        const loc = (room.location || '').toLowerCase();
        return loc.includes('it department') || loc.includes('it building');
      }
    },
    {
      id: 'branch',
      title: 'Phnom Penh Branch',
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
        const rangeStart = ref('');
        const rangeEnd = ref('');
        const rooms = ref([]);

        const todayString = (() => {
          const today = new Date();
          return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        })();

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

        const getPrimaryFeature = (room) => {
          if (!room || !Array.isArray(room.features) || room.features.length === 0) {
            return { label: 'Screen / VC', icon: 'lucide:monitor' };
          }
          const displayFeat = room.features.find(f => {
            const s = String(f).toLowerCase();
            return s.includes('screen') || s.includes('tv') || s.includes('display') || s.includes('video') || s.includes('vc');
          });
          if (displayFeat) {
            let label = 'Screen / VC';
            if (/4k/i.test(displayFeat)) label = '4K Screen / VC';
            else if (/dual/i.test(displayFeat)) label = 'Dual Display';
            else if (/projector/i.test(displayFeat)) label = 'Projector';
            return { label, icon: 'lucide:monitor' };
          }
          const first = room.features[0];
          return { label: first, icon: getFeatureIcon(first) };
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

        const dateRangeError = computed(() => {
          if (!rangeStart.value || !rangeEnd.value) return '';
          if (rangeStart.value < todayString) return 'The start date cannot be in the past.';
          if (rangeEnd.value < rangeStart.value) return 'The end date must be on or after the start date.';
          return '';
        });

        const hasDateRange = computed(() => Boolean(rangeStart.value && rangeEnd.value && !dateRangeError.value));
        const dateRangeLabel = computed(() => {
          if (!hasDateRange.value) return '';
          const formatDate = (value) => {
            const date = new Date(`${value}T12:00:00`);
            return Number.isNaN(date.getTime())
              ? value
              : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          };
          return `${formatDate(rangeStart.value)} – ${formatDate(rangeEnd.value)}`;
        });

        const isRoomAvailableForRange = (room) => {
          if (!hasDateRange.value) return true;
          if (typeof bookingStore === 'undefined' || typeof bookingStore.getRoomAvailabilityForDateRange !== 'function') return true;
          return bookingStore.getRoomAvailabilityForDateRange(room.id, rangeStart.value, rangeEnd.value).available;
        };

        const handleImgError = (event) => {
          event.target.src = 'assets/rooms/boardroom-alpha.jpg';
        };

        // Computed Filtered Rooms
        const matchingRooms = computed(() => {
          const query = searchQuery.value.trim().toLowerCase();
          return rooms.value.filter(room => {
            if (!room) return false;

            if (!isRoomAvailableForRange(room)) return false;
            if (hasDateRange.value && (room.status || 'Available').toLowerCase() !== 'available') return false;

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

        // Grouped Hierarchy Sections to Display (Minimal Location Hierarchy - No Floor Subheaders)
        const displayedSections = computed(() => {
          const groups = currentBuildingFilter.value === 'all'
            ? hierarchyGroups
            : hierarchyGroups.filter(g => g.id === currentBuildingFilter.value);

          return groups.map(group => {
            const groupRooms = matchingRooms.value.filter(r => group.matches(r));
            if (groupRooms.length === 0) return null;

            // Sort rooms by floor number descending, then capacity descending
            const sortedRooms = [...groupRooms].sort((a, b) => {
              const floorA = getFloorNumber(a.floor);
              const floorB = getFloorNumber(b.floor);
              if (floorB !== floorA) {
                return floorB - floorA;
              }
              return (b.capacity || 0) - (a.capacity || 0);
            });

            return {
              id: group.id,
              title: group.title,
              pillIcon: group.pillIcon,
              rooms: sortedRooms
            };
          }).filter(Boolean);
        });

        const hasActiveFilters = computed(() => {
          return currentBuildingFilter.value !== 'all' ||
                 currentStatusFilter.value !== 'all' ||
                 searchQuery.value.trim().length > 0 ||
                 rangeStart.value !== '' ||
                 rangeEnd.value !== '';
        });

        // Iconify rescanning on DOM changes
        const scanIcons = () => {
          nextTick(() => {
            if (window.Iconify && typeof window.Iconify.scan === 'function') {
              window.Iconify.scan();
            }
          });
        };

        watch([searchQuery, currentBuildingFilter, currentStatusFilter, rangeStart, rangeEnd, rooms], () => {
          scanIcons();
        });

        watch(rangeStart, (newStart) => {
          if (newStart && rangeEnd.value && rangeEnd.value < newStart) {
            rangeEnd.value = newStart;
          }
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
          rangeStart.value = '';
          rangeEnd.value = '';
        };

        const clearDateRange = () => {
          rangeStart.value = '';
          rangeEnd.value = '';
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
            window.app.selectRoomAndProceed(
              room.id,
              'book-room',
              rangeStart.value || null,
              null,
              null,
              {
                dateRangeStart: rangeStart.value || null,
                dateRangeEnd: rangeEnd.value || null
              }
            );
          } else if (window.app && typeof window.app.navigateTo === 'function') {
            window.app.navigateTo('request-form', {
              roomId: room.id,
              date: rangeStart.value || null,
              dateRangeStart: rangeStart.value || null,
              dateRangeEnd: rangeEnd.value || null
            });
          }
        };

        return {
          searchQuery,
          currentBuildingFilter,
          currentStatusFilter,
          rangeStart,
          rangeEnd,
          todayString,
          dateRangeError,
          dateRangeLabel,
          hasDateRange,
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
          getPrimaryFeature,
          getRoomBorderClass,
          getRoomTypeIcon,
          getRoomTypeIconColor,
          getRoomTypeTextColor,
          getRoomTypeLabel,
          handleImgError,
          setBuildingFilter,
          setStatusFilter,
          clearSearch,
          clearDateRange,
          resetAllFilters,
          navigateToAddRoom,
          handleDetails,
          handleProceed
        };
      },

      template: `
        <div class="space-y-5">
          <section class="sticky-catalog-navbar -mx-3.5 sm:-mx-5 lg:-mx-6 xl:-mx-8 px-3.5 sm:px-5 lg:px-6 xl:px-8 -mt-3.5 sm:-mt-5 lg:-mt-6 xl:-mt-6 pt-3.5 sm:pt-5 lg:pt-6 xl:pt-6 pb-4 border-b border-[#E9E3DD]/80" aria-label="Room search and filters">
            <div class="bg-white rounded-2xl border border-[#E9E3DD] shadow-xs p-4 sm:p-5 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div class="md:col-span-7">
                  <label for="room-search-input" class="block text-sm font-semibold text-[#6F5849] mb-1.5">Search rooms</label>
                  <div class="relative">
                    <app-icon icon="lucide:search" class-name="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6857] text-base pointer-events-none" />
                    <input type="search" v-model="searchQuery" id="room-search-input" placeholder="Name, floor, amenity, or department" autocomplete="off" class="w-full h-11 pl-10 pr-10 bg-[#FAF7F4] hover:bg-white focus:bg-white text-[#1C1917] text-sm font-medium rounded-xl border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition outline-none" />
                    <button v-if="searchQuery.trim().length > 0" @click="clearSearch" id="room-search-clear" class="search-clear-btn" title="Clear search" aria-label="Clear search" type="button"><app-icon icon="lucide:x" class-name="text-xs" /></button>
                  </div>
                </div>

                <div class="md:col-span-5 grid grid-cols-2 gap-2.5">
                  <div>
                    <label for="catalog-date-from" class="block text-sm font-semibold text-[#6F5849] mb-1.5">From</label>
                    <input id="catalog-date-from" type="date" v-model="rangeStart" :min="todayString" aria-label="Availability start date" class="w-full h-11 px-3 bg-[#FAF7F4] hover:bg-white focus:bg-white text-[#3E2B1E] font-mono text-xs font-medium rounded-xl border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition outline-none cursor-pointer" />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label for="catalog-date-to" class="block text-sm font-semibold text-[#6F5849]">To</label>
                      <button v-if="rangeStart || rangeEnd" @click="clearDateRange" type="button" class="text-xs font-semibold text-[#991B1B] hover:text-[#7F1D1D] hover:underline">Clear</button>
                    </div>
                    <input id="catalog-date-to" type="date" v-model="rangeEnd" :min="rangeStart || todayString" aria-label="Availability end date" class="w-full h-11 px-3 bg-[#FAF7F4] hover:bg-white focus:bg-white text-[#3E2B1E] font-mono text-xs font-medium rounded-xl border border-[#E9E3DD] focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition outline-none cursor-pointer" />
                  </div>
                </div>
              </div>

              <p v-if="dateRangeError" class="text-xs font-semibold text-[#991B1B]" role="alert">{{ dateRangeError }}</p>

              <div class="flex items-center justify-between gap-3 pt-3 border-t border-[#E9E3DD]/80 overflow-x-auto no-scrollbar">
                <div class="flex items-center gap-2 flex-nowrap shrink-0">
                  <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A8988B]">Location</span>
                  <div id="building-pills-track" role="group" aria-label="Location">
                    <button v-for="p in buildingPills" :key="p.id" :id="'pill-btn-' + p.id" @click="setBuildingFilter(p.id)" class="glider-pill-btn" :class="{ active: currentBuildingFilter === p.id }" :aria-pressed="currentBuildingFilter === p.id" type="button"><app-icon :icon="p.icon" class-name="text-sm" /><span>{{ p.label }}</span></button>
                  </div>
                  <div class="h-5 w-px bg-[#E9E3DD] mx-1 shrink-0"></div>
                  <div class="flex items-center gap-1.5 flex-nowrap" role="group" aria-label="Room type and availability">
                    <button v-for="s in statusChips" :key="s.id" :id="'status-chip-' + s.id" @click="setStatusFilter(s.id)" class="status-chip" :class="{ active: currentStatusFilter === s.id }" :aria-pressed="currentStatusFilter === s.id" type="button"><app-icon :icon="s.icon" class-name="text-sm" /><span>{{ s.label.replace(' Now', '') }}</span></button>
                  </div>
                </div>
                <button v-if="hasActiveFilters" @click="resetAllFilters" class="text-xs font-semibold text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#FEF2F2] transition cursor-pointer shrink-0" type="button"><app-icon icon="lucide:rotate-ccw" class-name="text-xs" /><span>Reset filters</span></button>
              </div>
            </div>
          </section>

          <div class="flex items-center justify-between px-1 text-sm text-[#6F5849]" aria-live="polite">
            <strong class="font-semibold text-[#3E2B1E]">{{ matchingRooms.length }} {{ matchingRooms.length === 1 ? 'room' : 'rooms' }} available</strong>
            <span class="font-mono text-xs">{{ dateRangeLabel || 'Across NBC locations' }}</span>
          </div>

          <div v-if="matchingRooms.length === 0" class="animate-empty-state py-12 px-6 text-center bg-white rounded-2xl border border-[#E9E3DD] shadow-xs space-y-3.5 max-w-xl mx-auto my-6" role="status">
            <div class="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 mx-auto flex items-center justify-center"><app-icon icon="lucide:search-x" class-name="text-2xl text-amber-700" :stroke-width="1.8" /></div>
            <h2 class="text-lg font-heading font-bold text-[#3E2B1E]">No matching rooms found</h2>
            <p class="text-sm text-[#6F5849] max-w-sm mx-auto leading-relaxed">{{ dateRangeError || (hasDateRange ? 'No room is available for every day in the selected range.' : searchQuery.trim() ? 'Try a different search term.' : 'Try a different location or room type.') }}</p>
            <button @click="resetAllFilters" class="px-4 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-sm rounded-xl transition shadow-xs inline-flex items-center gap-2 cursor-pointer" type="button"><app-icon icon="lucide:rotate-ccw" class-name="text-sm text-white" /><span>Reset filters</span></button>
          </div>

          <div v-else :key="currentBuildingFilter + '-' + currentStatusFilter" class="catalog-view-container space-y-9 flex flex-col pt-1">
            <section v-for="group in displayedSections" :key="group.id" class="space-y-5" :data-building-id="group.id">
              <!-- Sleek Pure Editorial Typography Location Header: No icons, clean bold heading + subtle count -->
              <div class="flex items-center justify-between pb-2.5 border-b border-[#E9E3DD]">
                <h2 class="font-heading font-bold text-base sm:text-lg text-[#3E2B1E] tracking-tight truncate">{{ group.title }}</h2>
                <span class="font-mono text-xs font-medium text-[#7D6857] shrink-0 ml-3">{{ group.rooms.length }} {{ group.rooms.length === 1 ? 'room' : 'rooms' }}</span>
              </div>

              <!-- Flat Room Cards Grid (Floor hierarchy completely removed) -->
              <div class="rooms-section-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <article v-for="room in group.rooms" :key="room.id" class="catalog-room-card bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group" :class="getRoomBorderClass(room)">
                  <!-- Image Header -->
                  <div class="relative h-44 bg-[#F4EFEA] overflow-hidden">
                    <img :src="room.image || 'assets/rooms/boardroom-alpha.jpg'" :alt="room.name || 'Meeting Room'" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" @error="handleImgError" />
                    <div class="absolute top-3 left-3 bg-[#260707]/80 backdrop-blur-xs text-white text-xs font-mono px-2.5 py-1 rounded-lg">
                      {{ formatFloorShort(room.floor) }}
                    </div>
                    <div class="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg" :class="room.isPrivate ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'">
                      {{ room.isPrivate ? 'Private' : 'Shared' }}
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 class="text-base font-bold text-[#3E2B1E] leading-snug line-clamp-1" :title="room.name || 'Untitled Room'">{{ room.name || 'Untitled Room' }}</h3>
                      <p class="text-xs text-[#6F5849] mt-0.5 truncate" :title="room.location || ''">{{ room.location || 'Headquarters' }}</p>

                      <div class="flex items-center gap-4 text-xs font-medium text-[#6F5849] mt-3 pt-2 border-t border-[#E9E3DD]/60">
                        <span class="flex items-center gap-1.5 shrink-0">
                          <app-icon icon="lucide:users" class-name="text-[#7D6857]" />
                          {{ Number(room.capacity) || 0 }} Seats
                        </span>
                        <span class="flex items-center gap-1.5 min-w-0" :title="getPrimaryFeature(room).label">
                          <app-icon :icon="getPrimaryFeature(room).icon" class-name="text-[#7D6857] shrink-0" />
                          <span class="truncate">{{ getPrimaryFeature(room).label }}</span>
                        </span>
                      </div>
                    </div>

                    <!-- Card Actions -->
                    <div class="pt-2 flex items-center gap-2">
                      <button @click="handleDetails(room)" class="flex-1 h-9 rounded-xl border border-[#E9E3DD] hover:bg-[#FAF7F4] active:bg-[#E9E3DD] text-xs font-semibold text-[#3E2B1E] transition cursor-pointer" type="button">
                        View Details
                      </button>
                      <button @click="handleProceed(room)" class="flex-1 h-9 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#691515] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs" type="button">
                        <app-icon icon="lucide:calendar" class-name="text-white text-xs" />
                        <span>{{ isOtherPrivate(room) ? 'Request' : 'Book' }}</span>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
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
