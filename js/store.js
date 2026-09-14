// State Store for Meeting Room Booking Workspace
// Plain, simple A2 English with 2-Stage Private Room Approval

class BankBookingStore {
  constructor() {
    this.STORAGE_KEY = 'nbc_meeting_rooms_v17';
    this.listeners = [];
    // Clean up legacy storage versions
    try {
      localStorage.removeItem('nbc_meeting_rooms_v16');
      localStorage.removeItem('nbc_meeting_rooms_v15');
      localStorage.removeItem('nbc_meeting_rooms_v14');
      localStorage.removeItem('nbc_meeting_rooms_v13');
      localStorage.removeItem('nbc_meeting_rooms_v12');
      localStorage.removeItem('nbc_meeting_rooms_v11');
    } catch (e) {}
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedRooms = parsed.rooms || INITIAL_ROOMS_DATA;
        // Ensure any new rooms in INITIAL_ROOMS_DATA are present
        INITIAL_ROOMS_DATA.forEach(ir => {
          if (!storedRooms.some(r => r.id === ir.id)) {
            storedRooms.push(JSON.parse(JSON.stringify(ir)));
          }
        });
        this.rooms = storedRooms.map(r => {
          const initRoom = INITIAL_ROOMS_DATA.find(ir => ir.id === r.id);
          if (initRoom) {
            r.name = initRoom.name;
            if (initRoom.subtitle) r.subtitle = initRoom.subtitle;
            r.image = initRoom.image;
            r.images = initRoom.images;
            r.isPrivate = initRoom.isPrivate;
            r.roomOwner = initRoom.roomOwner;
            if (initRoom.province) r.province = initRoom.province;
            if (initRoom.location) r.location = initRoom.location;
            if (initRoom.branch) r.branch = initRoom.branch;
            if (initRoom.department) r.department = initRoom.department;
            if (initRoom.floor) r.floor = initRoom.floor;
            if (initRoom.description) r.description = initRoom.description;
            if (initRoom.features) r.features = initRoom.features;
            if (initRoom.capacity) r.capacity = initRoom.capacity;
            if (initRoom.size) r.size = initRoom.size;
            if (!r.category && initRoom.category) r.category = initRoom.category;
          }
          if (!r.province) r.province = "Phnom Penh";
          if (!r.location) r.location = "National Bank of Cambodia - Headquarters";
          if (!r.branch) r.branch = r.province;
          if (r.status === 'Under Maintenance' || r.status === 'Maintenance') {
            r.status = 'Available';
          }
          if (r.maintenance) {
            delete r.maintenance;
          }
          return r;
        });
        this.requests = parsed.requests || [];
        this.requests.forEach(req => {
          if (req.room && req.room.id) {
            const matched = this.rooms.find(mr => mr.id === req.room.id);
            if (matched) req.room.name = matched.name;
          }
        });
        this.notifications = parsed.notifications || [];
        this.itStaff = parsed.itStaff || INITIAL_IT_STAFF;
        this.ensureSeedBookings();
      } else {
        this.resetToDefaults(false);
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using defaults", e);
      this.resetToDefaults(false);
    }
  }

  saveState() {
    try {
      const payload = {
        rooms: this.rooms,
        requests: this.requests,
        notifications: this.notifications,
        itStaff: this.itStaff
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
    this.notify();
  }

  clearAllBookings(shouldNotify = true) {
    this.requests = [];
    this.notifications = [];
    this.saveState();
    if (shouldNotify) {
      this.emitToast("Bookings Cleared", "All booking data has been removed.", "info");
    }
  }

  resetToDefaults(shouldNotify = true) {
    this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS_DATA));
    this.requests = [];
    this.notifications = [];
    this.itStaff = JSON.parse(JSON.stringify(INITIAL_IT_STAFF));
    this.ensureSeedBookings();
    localStorage.removeItem(this.STORAGE_KEY);
    if (shouldNotify) {
      this.saveState();
      this.emitToast("System Reset", "All booking data has been cleared.", "info");
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  emitToast(title, message, type = "info") {
    // Toasts permanently removed
  }

  // ==================== GETTERS ====================

  getRooms() {
    return this.rooms;
  }

  getStandardRooms() {
    return this.rooms.filter(r => !r.isPrivate);
  }

  getPrivateRooms() {
    return this.rooms.filter(r => !!r.isPrivate);
  }

  getMyPrivateRooms() {
    return this.rooms.filter(r => r.isPrivate && (r.id === 'ROOM-107' || r.roomOwner?.name === 'Jonathan Vance' || r.roomOwner?.id === 'OWNER-VANCE'));
  }

  getOtherPrivateRooms() {
    return this.rooms.filter(r => r.isPrivate && !(r.id === 'ROOM-107' || r.roomOwner?.name === 'Jonathan Vance' || r.roomOwner?.id === 'OWNER-VANCE'));
  }

  getRoomById(id) {
    return this.rooms.find(r => r.id === id);
  }

  getRequests() {
    return this.requests;
  }

  getRequestById(id) {
    return this.requests.find(r => r.id === id);
  }

  getPendingPitikaRequests() {
    return this.requests.filter(r => 
      r.status === "Pending Review" || 
      r.status === "Pending Manager Review"
    );
  }

  getPendingRoomOwnerRequests() {
    return this.requests.filter(r => 
      r.isPrivateRequest && r.status === "Pending Room Owner Approval"
    );
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // ==================== 4-LEVEL HIERARCHY GETTERS ====================

  getProvinces() {
    if (typeof NBC_PROVINCES !== 'undefined' && Array.isArray(NBC_PROVINCES)) {
      return NBC_PROVINCES;
    }
    return [];
  }

  getLocationsByProvince(provinceName) {
    const provinces = this.getProvinces();
    const prov = provinces.find(p => p.name === provinceName || (provinceName && p.name.toLowerCase().includes(provinceName.toLowerCase())));
    if (prov && prov.locations) {
      return prov.locations;
    }
    // Fallback: return all locations across provinces
    const allLocations = [];
    provinces.forEach(p => {
      if (p.locations) allLocations.push(...p.locations);
    });
    return allLocations;
  }

  getDepartmentsByProvinceAndLocation(provinceName, locationName) {
    const locations = this.getLocationsByProvince(provinceName);
    const loc = locations.find(l => 
      l.name === locationName || 
      l.shortName === locationName || 
      (locationName && l.name.toLowerCase().includes(locationName.toLowerCase()))
    );
    if (loc && loc.departments) {
      return loc.departments;
    }
    // Fallback to general organization departments
    if (typeof NBC_ORGANIZATION !== 'undefined' && Array.isArray(NBC_ORGANIZATION)) {
      const all = [];
      NBC_ORGANIZATION.forEach(dir => {
        dir.departments.forEach(d => all.push(`${d.name} (${dir.name})`));
      });
      return all;
    }
    return [];
  }

  getFloorsByProvinceAndLocation(provinceName, locationName) {
    const locations = this.getLocationsByProvince(provinceName);
    const loc = locations.find(l => 
      l.name === locationName || 
      l.shortName === locationName || 
      (locationName && l.name.toLowerCase().includes(locationName.toLowerCase()))
    );
    if (loc && loc.floors) {
      return loc.floors;
    }
    return [
      "Level 18 (Floor 18) - Executive Suite",
      "Level 12 (Floor 12) - Banking Studies & Policy",
      "Level 5 (Floor 5) - Finance & Audit",
      "Level 3 (Floor 3) - Board & Cabinet",
      "Level 1 (Ground Floor) - Visitors & Public"
    ];
  }

  // Backwards compatibility aliases
  getLocations() {
    return this.getProvinces();
  }

  getBranches() {
    return this.getProvinces();
  }

  getDepartmentsByLocation(locName) {
    return this.getDepartmentsByProvinceAndLocation("Phnom Penh", locName);
  }

  getDepartmentsByBranch(branchName) {
    return this.getDepartmentsByLocation(branchName);
  }

  getFloorsByLocation(locName, deptName = '') {
    return this.getFloorsByProvinceAndLocation("Phnom Penh", locName);
  }

  getFloorsByBranch(branchName, deptName = '') {
    return this.getFloorsByLocation(branchName, deptName);
  }

  // ==================== GOOGLE MAPS DETAILS GETTER ====================
  getRoomMapDetails(room) {
    if (!room) {
      return {
        building: "National Bank of Cambodia",
        address: "Phnom Penh, Cambodia",
        province: "Phnom Penh",
        query: "National Bank of Cambodia, Wat Phnom, Phnom Penh",
        embedUrl: "https://maps.google.com/maps?q=National%20Bank%20of%20Cambodia%20Wat%20Phnom%20Phnom%20Penh&t=&z=16&ie=UTF8&iwloc=&output=embed",
        externalUrl: "https://www.google.com/maps/search/?api=1&query=National%20Bank%20of%20Cambodia%20Wat%20Phnom%20Phnom%20Penh",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=National%20Bank%20of%20Cambodia%20Wat%20Phnom%20Phnom%20Penh"
      };
    }

    const provinceName = room.province || "Phnom Penh";
    const locationName = room.location || room.branch || "";

    // Find location object from NBC_PROVINCES
    let locObj = null;
    if (typeof NBC_PROVINCES !== 'undefined' && Array.isArray(NBC_PROVINCES)) {
      const currentProv = NBC_PROVINCES.find(p => p.name.toLowerCase() === provinceName.toLowerCase());
      if (currentProv && currentProv.locations && currentProv.locations.length > 0) {
        if (locationName) {
          locObj = currentProv.locations.find(l => 
            l.name === locationName || 
            l.shortName === locationName ||
            (locationName && l.name.toLowerCase().includes(locationName.toLowerCase())) ||
            (locationName && l.shortName.toLowerCase().includes(locationName.toLowerCase()))
          );
        }
        if (!locObj && !locationName) {
          locObj = currentProv.locations[0];
        }
      }
      
      if (!locObj && locationName) {
        for (const prov of NBC_PROVINCES) {
          if (prov.locations) {
            const found = prov.locations.find(l => 
              l.name === locationName || 
              l.shortName === locationName ||
              (locationName && l.name.toLowerCase().includes(locationName.toLowerCase())) ||
              (locationName && l.shortName.toLowerCase().includes(locationName.toLowerCase()))
            );
            if (found) {
              locObj = found;
              break;
            }
          }
        }
      }
    }

    const building = locObj?.shortName || locObj?.name || (locationName ? locationName.split('(')[0].trim() : `National Bank of Cambodia (${provinceName})`);
    const address = room.address || locObj?.address || `${building}, ${provinceName}, Cambodia`;
    const query = room.mapQuery || locObj?.mapQuery || `${building}, ${provinceName}, Cambodia`;
    const encodedQuery = encodeURIComponent(query);

    return {
      building,
      address,
      province: provinceName,
      query,
      embedUrl: `https://maps.google.com/maps?q=${encodedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`
    };
  }

  // ==================== ASYNC BACKEND IMAGE FETCHER ====================
  async fetchRoomPhotos(roomId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const room = this.getRoomById(roomId);
        if (!room) {
          resolve([]);
          return;
        }
        const photos = (room.images && room.images.length > 0) ? room.images : [room.image];
        resolve([...photos]);
      }, 250);
    });
  }

  async fetchRoomImages(roomId) {
    return this.fetchRoomPhotos(roomId);
  }

  addRoomPhoto(roomId, photoUrl) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room || !photoUrl) return false;

    if (!room.images) {
      room.images = [room.image];
    }
    room.images.push(photoUrl);
    this.saveState();
    this.emitToast("Photo Added", `New photo saved to backend for ${room.name}.`, "success");
    return true;
  }

  createRoom(data) {
    // Determine new sequential ID: find highest numeric suffix in ROOM-XXX
    let maxIdNum = 100;
    this.rooms.forEach(r => {
      const match = r.id && r.id.match(/^ROOM-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }
    });
    const newId = `ROOM-${maxIdNum + 1}`;

    const defaultCover = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";
    const coverImage = (data.image && data.image.trim()) ? data.image.trim() : defaultCover;
    
    // Gallery images
    let imagesList = [coverImage];
    if (Array.isArray(data.images) && data.images.length > 0) {
      const filtered = data.images.filter(img => img && img.trim() && img.trim() !== coverImage);
      imagesList = [coverImage, ...filtered];
    } else if (typeof data.images === 'string' && data.images.trim()) {
      const extra = data.images.split(',').map(s => s.trim()).filter(s => s && s !== coverImage);
      imagesList = [coverImage, ...extra];
    }

    const isPrivate = !!data.isPrivate;
    let roomOwner = null;
    if (isPrivate && data.roomOwner && data.roomOwner.name) {
      roomOwner = {
        id: data.roomOwner.id || `OWNER-${String(this.rooms.length + 1).padStart(2, '0')}`,
        name: data.roomOwner.name.trim(),
        title: (data.roomOwner.title && data.roomOwner.title.trim()) || "Room Custodian",
        department: (data.roomOwner.department && data.roomOwner.department.trim()) || data.department || "Executive Office",
        phone: (data.roomOwner.phone && data.roomOwner.phone.trim()) || "Ext. 8800",
        avatar: (data.roomOwner.avatar && data.roomOwner.avatar.trim()) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
      };
    }

    const newRoom = {
      id: newId,
      name: (data.name && data.name.trim()) || "New Meeting Room",
      department: data.department || "General Secretariat (អគ្គលេខាធិការដ្ឋាន)",
      floor: data.floor || "Level 5 (Floor 5)",
      capacity: parseInt(data.capacity, 10) || 10,
      size: data.size ? (data.size.includes('sq') ? data.size : `${data.size} sq m`) : "45 sq m",
      category: data.category || "Team Room",
      description: (data.description && data.description.trim()) || "Modern meeting room equipped for executive presentations and team collaboration.",
      features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [
        "Large Video Screen (4K TV)",
        "Wireless Screen Sharing",
        "High-Speed Wi-Fi"
      ],
      image: coverImage,
      images: imagesList,
      status: data.status || "Available",
      isPrivate: isPrivate,
      roomOwner: roomOwner,
      doorNumber: data.doorNumber || "",
      layoutType: data.layoutType || "Boardroom",
      bufferMinutes: parseInt(data.bufferMinutes, 10) || 15,
      allowCatering: data.allowCatering !== undefined ? !!data.allowCatering : true
    };

    this.rooms.push(newRoom);
    this.saveState();
    this.emitToast("Room Created", `${newRoom.name} (${newRoom.id}) has been added successfully.`, "success");
    return newRoom;
  }

  // ==================== AVAILABILITY & TIMELINE SCHEDULING ====================

  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
  }

  minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatDuration(mins) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  getRoomBookingsByDate(roomId, dateString) {
    if (!roomId || !dateString) return [];
    return this.requests.filter(req => {
      const reqRoomId = req.room?.id || req.roomId;
      if (reqRoomId !== roomId) return false;
      if (req.date !== dateString) return false;
      const st = (req.status || '').toLowerCase();
      // Exclude rejected and cancelled
      if (st.includes('reject') || st.includes('cancel')) return false;
      return true;
    }).sort((a, b) => {
      return this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime);
    });
  }

  checkBookingConflict(roomId, dateString, startTime, endTime, excludeRequestId = null) {
    if (!roomId || !dateString || !startTime || !endTime) {
      return { hasConflict: false, conflictingBooking: null };
    }
    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);
    if (newEnd <= newStart) {
      return { hasConflict: false, conflictingBooking: null };
    }

    // Dynamic Past-Time Check: Cannot book in the past
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const nowMins = today.getHours() * 60 + today.getMinutes();
    const nowTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    if (dateString < todayStr) {
      return {
        hasConflict: true,
        isPast: true,
        message: "You cannot book a meeting in the past. Please select today or a future date."
      };
    }

    if (dateString === todayStr && newStart < nowMins) {
      return {
        hasConflict: true,
        isPast: true,
        message: `Start time (${startTime}) has already passed today (Current time: ${nowTimeStr}). Please choose an upcoming time.`
      };
    }

    const bookings = this.getRoomBookingsByDate(roomId, dateString);
    for (const b of bookings) {
      if (excludeRequestId && b.id === excludeRequestId) continue;
      const bStart = this.timeToMinutes(b.startTime);
      const bEnd = this.timeToMinutes(b.endTime);

      // Overlap: new booking starts before existing ends AND new booking ends after existing starts
      if (newStart < bEnd && newEnd > bStart) {
        const isPrivate = !!b.isPrivateRequest || !!b.room?.isPrivate;
        const displayTitle = isPrivate ? 'Reserved (Private Session)' : b.meetingTitle;
        return {
          hasConflict: true,
          isPast: false,
          conflictingBooking: b,
          conflictTime: `${b.startTime} – ${b.endTime}`,
          conflictTitle: displayTitle,
          message: `This room is already booked from ${b.startTime} to ${b.endTime} for "${displayTitle}".`
        };
      }
    }
    return { hasConflict: false, conflictingBooking: null };
  }

  getRoomAvailabilityTimeline(roomId, dateString) {
    const DAY_START = 7 * 60;   // 07:00 (420 mins)
    const DAY_END = 18 * 60;    // 18:00 (1080 mins)
    const TOTAL_MINS = DAY_END - DAY_START; // 660 mins

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const isPastDay = dateString < todayStr;
    const isToday = dateString === todayStr;

    const rawBookings = this.getRoomBookingsByDate(roomId, dateString);
    
    // Clamp bookings to building hours [480, 1140]
    const clampedBookings = rawBookings.map(b => {
      const bStart = Math.max(DAY_START, this.timeToMinutes(b.startTime));
      const bEnd = Math.min(DAY_END, this.timeToMinutes(b.endTime));
      const isPrivate = !!b.isPrivateRequest || !!b.room?.isPrivate;
      const isBookingPast = isPastDay || (isToday && bEnd <= nowMins);
      return {
        ...b,
        startMin: bStart,
        endMin: bEnd,
        displayTitle: isPrivate ? 'Reserved (Private Session)' : b.meetingTitle,
        isPrivateSession: isPrivate,
        isPast: isBookingPast
      };
    }).filter(b => b.endMin > b.startMin);

    const segments = [];
    let currentPointer = DAY_START;

    const addAvailableSegment = (startM, endM) => {
      if (endM <= startM) return;
      const duration = endM - startM;

      if (isPastDay) {
        segments.push({
          type: 'available',
          isPast: true,
          startMinutes: startM,
          endMinutes: endM,
          startTime: this.minutesToTime(startM),
          endTime: this.minutesToTime(endM),
          durationMins: duration,
          durationLabel: this.formatDuration(duration),
          widthPct: ((duration / TOTAL_MINS) * 100).toFixed(2),
          leftPct: (((startM - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
        });
      } else if (isToday) {
        if (endM <= nowMins) {
          // Entirely in past today
          segments.push({
            type: 'available',
            isPast: true,
            startMinutes: startM,
            endMinutes: endM,
            startTime: this.minutesToTime(startM),
            endTime: this.minutesToTime(endM),
            durationMins: duration,
            durationLabel: this.formatDuration(duration),
            widthPct: ((duration / TOTAL_MINS) * 100).toFixed(2),
            leftPct: (((startM - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
          });
        } else if (startM < nowMins && endM > nowMins) {
          // Partially in past: split into past and future
          const pastDuration = nowMins - startM;
          segments.push({
            type: 'available',
            isPast: true,
            startMinutes: startM,
            endMinutes: nowMins,
            startTime: this.minutesToTime(startM),
            endTime: this.minutesToTime(nowMins),
            durationMins: pastDuration,
            durationLabel: this.formatDuration(pastDuration),
            widthPct: ((pastDuration / TOTAL_MINS) * 100).toFixed(2),
            leftPct: (((startM - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
          });

          const futureDuration = endM - nowMins;
          // Calculate next convenient rounded slot (15 mins) for booking
          const roundedNextStart = Math.min(endM, Math.ceil((nowMins + 5) / 15) * 15);
          segments.push({
            type: 'available',
            isPast: false,
            startMinutes: nowMins,
            endMinutes: endM,
            startTime: this.minutesToTime(roundedNextStart),
            endTime: this.minutesToTime(endM),
            durationMins: futureDuration,
            durationLabel: this.formatDuration(futureDuration),
            widthPct: ((futureDuration / TOTAL_MINS) * 100).toFixed(2),
            leftPct: (((nowMins - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
          });
        } else {
          // Entirely in future
          segments.push({
            type: 'available',
            isPast: false,
            startMinutes: startM,
            endMinutes: endM,
            startTime: this.minutesToTime(startM),
            endTime: this.minutesToTime(endM),
            durationMins: duration,
            durationLabel: this.formatDuration(duration),
            widthPct: ((duration / TOTAL_MINS) * 100).toFixed(2),
            leftPct: (((startM - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
          });
        }
      } else {
        // Future date
        segments.push({
          type: 'available',
          isPast: false,
          startMinutes: startM,
          endMinutes: endM,
          startTime: this.minutesToTime(startM),
          endTime: this.minutesToTime(endM),
          durationMins: duration,
          durationLabel: this.formatDuration(duration),
          widthPct: ((duration / TOTAL_MINS) * 100).toFixed(2),
          leftPct: (((startM - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
        });
      }
    };

    clampedBookings.forEach(b => {
      // Free segment before this booking
      if (b.startMin > currentPointer) {
        addAvailableSegment(currentPointer, b.startMin);
      }

      // Booked segment
      const bookedDuration = b.endMin - b.startMin;
      segments.push({
        type: 'booked',
        requestId: b.id,
        meetingTitle: b.displayTitle,
        rawTitle: b.meetingTitle,
        isPrivate: b.isPrivateSession,
        requesterName: b.requester?.name || 'Staff',
        requesterDept: b.requester?.department || '',
        status: b.status,
        isPast: b.isPast,
        startMinutes: b.startMin,
        endMinutes: b.endMin,
        startTime: this.minutesToTime(b.startMin),
        endTime: this.minutesToTime(b.endMin),
        durationMins: bookedDuration,
        durationLabel: this.formatDuration(bookedDuration),
        widthPct: ((bookedDuration / TOTAL_MINS) * 100).toFixed(2),
        leftPct: (((b.startMin - DAY_START) / TOTAL_MINS) * 100).toFixed(2)
      });

      currentPointer = Math.max(currentPointer, b.endMin);
    });

    // Free segment after last booking until closing (18:00)
    if (currentPointer < DAY_END) {
      addAvailableSegment(currentPointer, DAY_END);
    }

    // Daily summary statistics
    const totalBookedMins = clampedBookings.reduce((sum, b) => sum + (b.endMin - b.startMin), 0);
    const totalFreeMins = Math.max(0, TOTAL_MINS - totalBookedMins);

    // Dynamic Live Status
    let statusText = 'Available for Booking';
    let statusTone = 'emerald'; // 'emerald' | 'amber' | 'stone'

    if (isToday) {
      if (nowMins < DAY_START) {
        statusText = 'Opens at 07:00 AM';
        statusTone = 'stone';
      } else if (nowMins >= DAY_END) {
        statusText = 'Closed for today';
        statusTone = 'stone';
      } else {
        // Find segment covering now
        const activeBooked = clampedBookings.find(b => nowMins >= b.startMin && nowMins < b.endMin);
        if (activeBooked) {
          statusText = `In use until ${this.minutesToTime(activeBooked.endMin)}`;
          statusTone = 'amber';
        } else {
          // Find next booked meeting today
          const upcoming = clampedBookings.find(b => b.startMin > nowMins);
          if (upcoming) {
            statusText = `Available now (Next meeting at ${this.minutesToTime(upcoming.startMin)})`;
            statusTone = 'emerald';
          } else {
            statusText = 'Available for the rest of today';
            statusTone = 'emerald';
          }
        }
      }
    } else if (isPastDay) {
      statusText = 'Past Day (Read-only)';
      statusTone = 'stone';
    } else {
      if (clampedBookings.length === 0) {
        statusText = 'All 11 Hours Available';
        statusTone = 'emerald';
      } else {
        statusText = `${clampedBookings.length} meeting${clampedBookings.length > 1 ? 's' : ''} scheduled (${this.formatDuration(totalFreeMins)} free)`;
        statusTone = 'stone';
      }
    }

    return {
      date: dateString,
      dayStart: '07:00',
      dayEnd: '18:00',
      segments,
      bookings: clampedBookings,
      totalBookedMins,
      totalFreeMins,
      bookedCount: clampedBookings.length,
      statusText,
      statusTone
    };
  }

  getRoomScheduleTimeline(roomId, dateString) {
    if (!roomId || !dateString) return [];
    const DAY_START = 7;  // 07:00
    const DAY_END = 18;   // 18:00

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const isPastDate = dateString < todayStr;
    const isToday = dateString === todayStr;

    const bookings = (this.requests || []).filter(r => {
      const rRoomId = r.room?.id || r.roomId;
      if (rRoomId !== roomId) return false;
      if (r.date !== dateString) return false;
      const st = (r.status || '').toLowerCase();
      if (st.includes('reject') || st.includes('cancel')) return false;
      return true;
    });

    const slots = [];
    for (let hour = DAY_START; hour < DAY_END; hour++) {
      const hourStartStr = `${String(hour).padStart(2, '0')}:00`;
      const hourEndStr = `${String(hour + 1).padStart(2, '0')}:00`;
      const slotStartMins = hour * 60;
      const slotEndMins = (hour + 1) * 60;

      const isPast = isPastDate || (isToday && slotEndMins <= nowMins);

      // Check if any booking overlaps this slot
      const overlapping = bookings.find(b => {
        const [bStartH, bStartM] = (b.startTime || '07:00').split(':').map(Number);
        const [bEndH, bEndM] = (b.endTime || '09:00').split(':').map(Number);
        const bStart = bStartH * 60 + bStartM;
        const bEnd = bEndH * 60 + bEndM;
        return Math.max(slotStartMins, bStart) < Math.min(slotEndMins, bEnd);
      });

      slots.push({
        slot: `${hourStartStr} - ${hourEndStr}`,
        start: hourStartStr,
        end: hourEndStr,
        isPast: isPast,
        isBooked: !!overlapping,
        meetingTitle: overlapping ? (overlapping.isPrivateRequest || overlapping.room?.isPrivate ? 'Reserved' : overlapping.meetingTitle) : null
      });
    }

    return slots;
  }

  getRoomFullCalendarEvents(roomId, dateString = null, isSingleDayOnly = false) {
    if (!roomId) return [];
    const bookings = this.requests.filter(req => {
      const reqRoomId = req.room?.id || req.roomId;
      if (reqRoomId !== roomId) return false;
      const st = (req.status || '').toLowerCase();
      if (st.includes('reject') || st.includes('cancel')) return false;
      return true;
    });

    const calendarEvents = [];
    bookings.forEach(req => {
      const isPrivate = !!req.isPrivateRequest || !!req.room?.isPrivate;
      const displayTitle = isPrivate ? "Reserved (Private Session)" : (req.meetingTitle || "Scheduled Meeting");

      const sessions = (req.sessions && Array.isArray(req.sessions) && req.sessions.length > 0)
        ? req.sessions
        : [{ date: req.date, startTime: req.startTime, endTime: req.endTime }];

      sessions.forEach((sess, idx) => {
        if (!sess.date || !sess.startTime || !sess.endTime) return;
        if (isSingleDayOnly && dateString && sess.date !== dateString) return;

        calendarEvents.push({
          id: `${req.id}-sess-${idx}`,
          title: displayTitle,
          start: `${sess.date}T${sess.startTime}:00`,
          end: `${sess.date}T${sess.endTime}:00`,
          className: isPrivate ? 'fc-event-booked-private' : 'fc-event-booked-public',
          extendedProps: {
            bookingId: req.id,
            referenceCode: req.referenceCode,
            meetingTitle: req.meetingTitle,
            displayTitle: displayTitle,
            requesterName: req.requester?.name || 'Staff',
            requesterDept: req.requester?.department || 'Operations',
            attendees: req.attendees || 1,
            purpose: req.meetingPurpose || '',
            isPrivate: isPrivate,
            startTime: sess.startTime,
            endTime: sess.endTime,
            date: sess.date,
            status: req.status,
            sessionIndex: idx,
            totalSessions: sessions.length
          }
        });
      });
    });

    // Add past-time background shading to clearly indicate elapsed hours and past days
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Determine current Monday of the active week to shade past days in the week view
    const refDate = dateString ? new Date(dateString + 'T12:00:00') : new Date();
    const currentDayOfWeek = refDate.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const weekStart = new Date(refDate);
    weekStart.setDate(refDate.getDate() + diffToMonday);

    // Shade past days in the visible week
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (dStr < todayStr) {
        calendarEvents.push({
          id: `past-day-shading-${dStr}`,
          start: `${dStr}T07:00:00`,
          end: `${dStr}T18:00:00`,
          display: 'background',
          className: 'fc-past-time-shading',
          title: 'Past'
        });
      } else if (dStr === todayStr && nowMins > 7 * 60) {
        const clampedEndMins = Math.min(18 * 60, nowMins);
        const endHourStr = String(Math.floor(clampedEndMins / 60)).padStart(2, '0');
        const endMinStr = String(clampedEndMins % 60).padStart(2, '0');
        calendarEvents.push({
          id: `past-today-shading-${dStr}`,
          start: `${dStr}T07:00:00`,
          end: `${dStr}T${endHourStr}:${endMinStr}:00`,
          display: 'background',
          className: 'fc-past-time-shading',
          title: 'Elapsed'
        });
      }
    }

    return calendarEvents;
  }

  // ==================== ACTIONS (SIMPLE A2 ENGLISH) ====================

  isSlotAvailable(roomId, date, startTime, endTime, excludeBookingId = null) {
    const conflict = this.checkBookingConflict(roomId, date, startTime, endTime, excludeBookingId);
    return !conflict.hasConflict;
  }

  checkBookingConflict(roomId, date, startTime, endTime, excludeBookingId = null) {
    if (!roomId || !date || !startTime || !endTime) {
      return { hasConflict: false };
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Check past date
    if (date < todayStr) {
      return { hasConflict: true, isPast: true, message: "Meeting date cannot be in the past." };
    }

    const parseMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const startMins = parseMins(startTime);
    const endMins = parseMins(endTime);
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Check past time on today
    if (date === todayStr && startMins < nowMins) {
      const nowFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return { hasConflict: true, isPast: true, message: `Start time (${startTime}) has already passed today (Current time: ${nowFormatted}).` };
    }

    // Operating hours (07:00 - 18:00)
    if (startMins < 7 * 60) {
      return { hasConflict: true, message: "Building opens at 07:00 AM." };
    }
    if (endMins > 18 * 60) {
      return { hasConflict: true, message: "Building closes at 06:00 PM (18:00)." };
    }
    if (endMins <= startMins) {
      return { hasConflict: true, message: "End time must be after start time." };
    }
    if (endMins - startMins < 15) {
      return { hasConflict: true, message: "Minimum meeting length is 15 minutes." };
    }

    // Check for overlap against active bookings
    const activeBookings = this.requests.filter(r => {
      if (excludeBookingId && r.id === excludeBookingId) return false;
      const rRoomId = r.room?.id || r.roomId;
      if (rRoomId !== roomId) return false;
      const st = (r.status || '').toLowerCase();
      if (st.includes('reject') || st.includes('cancel')) return false;

      // Match either primary date or any session date
      if (r.date === date) return true;
      if (r.sessions && Array.isArray(r.sessions) && r.sessions.some(s => s.date === date)) return true;
      return false;
    });

    for (const b of activeBookings) {
      const bSessions = (b.sessions && Array.isArray(b.sessions) && b.sessions.length > 0)
        ? b.sessions.filter(s => s.date === date)
        : (b.date === date ? [{ startTime: b.startTime, endTime: b.endTime }] : []);

      for (const s of bSessions) {
        const bStart = parseMins(s.startTime);
        const bEnd = parseMins(s.endTime);
        if (startMins < bEnd && bStart < endMins) {
          return {
            hasConflict: true,
            isPast: false,
            message: `Schedule conflict with existing booking "${b.meetingTitle}" on ${date} (${s.startTime} - ${s.endTime}).`,
            conflictingMeeting: {
              id: b.id,
              title: b.meetingTitle,
              duration: `${s.startTime} - ${s.endTime}`,
              start: s.startTime,
              end: s.endTime,
              date: date
            }
          };
        }
      }
    }

    return { hasConflict: false };
  }

  checkMultiSessionConflicts(roomId, sessions, excludeBookingId = null) {
    if (!roomId || !sessions || !sessions.length) return { hasConflict: false };

    const parseMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // 1. Internal self-overlap validation within submitted sessions
    for (let i = 0; i < sessions.length; i++) {
      const s1 = sessions[i];
      if (!s1.date || !s1.startTime || !s1.endTime) continue;
      const s1Start = parseMins(s1.startTime);
      const s1End = parseMins(s1.endTime);

      for (let j = i + 1; j < sessions.length; j++) {
        const s2 = sessions[j];
        if (!s2.date || !s2.startTime || !s2.endTime) continue;
        if (s1.date === s2.date) {
          const s2Start = parseMins(s2.startTime);
          const s2End = parseMins(s2.endTime);
          if (s1Start < s2End && s2Start < s1End) {
            return {
              hasConflict: true,
              conflictingSession: s2,
              message: `Two sessions in this booking overlap on ${s1.date} (${s1.startTime}–${s1.endTime} and ${s2.startTime}–${s2.endTime}).`
            };
          }
        }
      }
    }

    // 2. Conflict validation against existing bookings in store
    for (const sess of sessions) {
      const res = this.checkBookingConflict(roomId, sess.date, sess.startTime, sess.endTime, excludeBookingId);
      if (res.hasConflict) {
        return {
          hasConflict: true,
          conflictingSession: sess,
          isPast: res.isPast,
          message: res.message
        };
      }
    }
    return { hasConflict: false };
  }

  isSlotAvailable(roomId, date, startTime, endTime, excludeBookingId = null) {
    const res = this.checkBookingConflict(roomId, date, startTime, endTime, excludeBookingId);
    return !res.hasConflict;
  }

  createBookingRequest(data) {
    const sessions = (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0)
      ? data.sessions
      : [{ date: data.date, startTime: data.startTime, endTime: data.endTime }];

    // Check for scheduling conflict or past time across all sessions
    const conflict = this.checkMultiSessionConflicts(data.roomId, sessions);
    if (conflict.hasConflict) {
      const errorTitle = conflict.isPast ? "Time Has Passed" : "Schedule Conflict";
      this.emitToast(errorTitle, conflict.message, "error");
      throw new Error(conflict.message);
    }
    const room = this.getRoomById(data.roomId) || this.rooms[0];
    const isPrivate = !!room.isPrivate || !!data.isPrivateRequest;
    const isMyRoom = isPrivate && (room.id === 'ROOM-107' || room.roomOwner?.name === 'Jonathan Vance' || room.roomOwner?.id === 'OWNER-VANCE');
    const newId = `REQ-2026-${String(this.requests.length + 1).padStart(3, '0')}`;
    const refCode = `NBC-${Math.floor(10000 + Math.random() * 90000)}`;

    // Pricing Model Calculation
    const cateringPackages = {
      'cat-1': { id: 'cat-1', name: 'Lunch Box (Meat & Rice / Salad)', price: 0 },
      'cat-2': { id: 'cat-2', name: 'Morning Coffee & Pastries', price: 0 },
      'cat-3': { id: 'cat-3', name: 'Tea & Fresh Fruit', price: 0 },
      'cat-4': { id: 'cat-4', name: 'Executive VIP Buffet', price: 0 },
      'cat-5': { id: 'cat-5', name: 'Healthy & Vegetarian Set', price: 0 },
      'cat-6': { id: 'cat-6', name: 'Afternoon High Tea', price: 0 },
      'cat-7': { id: 'cat-7', name: 'All-Day Beverage Bar', price: 0 },
      'cat-8': { id: 'cat-8', name: 'Breakfast & Dim Sum', price: 0 },
      'cat-9': { id: 'cat-9', name: 'Khmer Heritage Set', price: 0 }
    };
    let pkgKey = data.cateringPackageId;
    if (!pkgKey && (data.cateringPackage || data.cateringPackageName)) {
      const searchStr = (data.cateringPackage || data.cateringPackageName || '').toLowerCase();
      if (searchStr.includes('coffee') || searchStr.includes('pastr')) {
        pkgKey = 'cat-2';
      } else if (searchStr.includes('tea') || searchStr.includes('fruit')) {
        pkgKey = 'cat-3';
      } else if (searchStr.includes('buffet') || searchStr.includes('vip')) {
        pkgKey = 'cat-4';
      } else if (searchStr.includes('vegetarian') || searchStr.includes('healthy')) {
        pkgKey = 'cat-5';
      } else if (searchStr.includes('high tea') || searchStr.includes('afternoon')) {
        pkgKey = 'cat-6';
      } else if (searchStr.includes('beverage') || searchStr.includes('bar')) {
        pkgKey = 'cat-7';
      } else if (searchStr.includes('breakfast') || searchStr.includes('dim sum')) {
        pkgKey = 'cat-8';
      } else if (searchStr.includes('khmer') || searchStr.includes('heritage')) {
        pkgKey = 'cat-9';
      } else {
        pkgKey = 'cat-1';
      }
    }
    const packageInfo = cateringPackages[pkgKey] || { id: pkgKey, name: data.cateringPackageName || 'Catering Package', price: 0 };
    const attendeesCount = parseInt(data.attendees, 10) || 1;
    const cateringTotal = 0.00;
    const roomFee = 0.00; // Free internal facility for NBC bank staff
    const itFee = 0.00;   // Free internal IT technician service
    const totalAmount = 0.00;
    const billingAccount = 'NBC Internal Service Allocation';

    const newRequest = {
      id: newId,
      referenceCode: refCode,
      meetingTitle: data.meetingTitle || (isPrivate ? (isMyRoom ? `Executive Session (${room.name})` : "Private Executive Session") : "General Team Meeting"),
      requester: {
        name: data.requesterName || "Jonathan Vance",
        staffId: data.staffId || "NBC-4102",
        title: isMyRoom ? "Room Owner & Senior Finance Officer" : "Senior Finance Officer",
        department: data.requesterDept || "Finance & Accounting",
        email: data.staffEmail || "jonathan.vance@nbc.gov.kh",
        phone: data.staffPhone || "Ext. 8421"
      },
      room: {
        id: room.id,
        name: room.name,
        floor: room.floor,
        capacity: room.capacity,
        isPrivate: isPrivate,
        roomOwner: room.roomOwner || null
      },
      date: sessions[0].date,
      startTime: sessions[0].startTime,
      endTime: sessions[0].endTime,
      sessions: sessions,
      duration: sessions.length > 1
        ? `${sessions.length} Sessions (${sessions.map(s => s.date.slice(5) + ' ' + s.startTime).join(', ')})`
        : `${sessions[0].startTime} - ${sessions[0].endTime}`,
      attendees: attendeesCount,
      meetingPurpose: data.meetingPurpose || (isPrivate ? "Private executive meeting" : "Team discussion"),
      isPrivateRequest: isPrivate,
      isMyRoom: isMyRoom,
      privateJustification: isPrivate 
        ? (isMyRoom ? "Room Owner Direct Booking (Instant Approval)" : (data.privateJustification || "Confidential executive session required.")) 
        : "",
      needsCatering: !!data.needsCatering,
      cateringDetails: data.needsCatering ? {
        packageId: packageInfo.id,
        packageIds: data.cateringPackageIds || [packageInfo.id],
        packageName: data.cateringPackageName || packageInfo.name,
        pricePerPax: 0.00,
        servings: attendeesCount,
        subtotal: 0.00,
        deliveryTime: data.cateringDeliveryTime || data.startTime,
        dietaryRemarks: data.cateringRemarks || "Standard food",
        approverNotes: (isMyRoom && !data.needsCatering && !data.needsIT) ? "Auto-confirmed for Room Owner." : "",
        isConfirmedByApprover: isMyRoom && !data.needsCatering && !data.needsIT
      } : null,
      needsIT: !!data.needsIT,
      itDetails: data.needsIT ? {
        requestedItems: data.itItems && data.itItems.length ? data.itItems : ["Video Call Setup (Zoom / Teams)"],
        specialRequirements: data.itRemarks || "",
        assignedStaff: null,
        scheduledPrepTime: "30 mins before meeting",
        technicianNotes: "",
        isReady: false,
        ticketForwardedToIT: false
      } : null,
      pricing: {
        roomFee: 0.00,
        itFee: 0.00,
        cateringFeePerPax: 0.00,
        cateringTotal: 0.00,
        totalAmount: 0.00,
        billingAccount: billingAccount
      },
      status: (isMyRoom && !data.needsCatering && !data.needsIT)
        ? "Approved - Confirmed" 
        : (isPrivate ? "Pending Manager Review" : "Pending Review"),
      submissionTimestamp: "Just now",
      approver: (isMyRoom && !data.needsCatering && !data.needsIT) ? {
        name: "Direct Owner Booking",
        title: "Room Owner",
        decision: "Approved",
        rejectionReason: "",
        reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      } : {
        name: "Pitika S.",
        title: "Room Booking Manager",
        decision: null,
        rejectionReason: "",
        reviewDate: null
      },
      managerReview: (isMyRoom && !data.needsCatering && !data.needsIT) ? {
        decision: "Not Required",
        notes: "Instant confirmation for room owner without add-ons.",
        reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      } : {
        decision: null,
        notes: "",
        reviewDate: null
      },
      roomOwnerReview: isMyRoom ? {
        decision: (data.needsCatering || data.needsIT) ? "Owner Pre-Approved" : "Owner Confirmed",
        approvedStartTime: data.startTime,
        approvedEndTime: data.endTime,
        ownerNotes: (data.needsCatering || data.needsIT) 
          ? "Self-booking by Room Owner. Waiting for Pitika Food & IT cost check."
          : "Instant self-booking by room owner.",
        reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      } : (isPrivate ? {
        decision: null,
        approvedStartTime: null,
        approvedEndTime: null,
        ownerNotes: "",
        reviewDate: null
      } : null),
      timeline: isMyRoom ? (
        (data.needsCatering || data.needsIT) ? [
          { step: "Booking Created", time: "Just now", completed: true },
          { step: "Manager Review (Pitika)", time: "In Progress", completed: false },
          { step: "IT & Food Setup", time: "Waiting for Pitika", completed: false },
          { step: "Door Pass Active", time: "Waiting", completed: false }
        ] : [
          { step: "Booking Created", time: "Just now", completed: true },
          { step: "Room Setup", time: "Ready", completed: true },
          { step: "Door Pass Active", time: "Confirmed", completed: true }
        ]
      ) : (isPrivate ? [
        { step: "Request Sent", time: "Just now", completed: true },
        { step: "Manager Review (Pitika)", time: "In Progress", completed: false },
        { step: "Room Owner Approval", time: "Waiting for Pitika", completed: false },
        { step: "IT & Room Setup", time: "Waiting for Both Approvals", completed: false },
        { step: "Booking Ready", time: "Waiting", completed: false }
      ] : [
        { step: "Request Sent", time: "Just now", completed: true },
        { step: "Manager Review", time: "In Progress", completed: false },
        { step: "IT & Food Setup", time: "Waiting", completed: false },
        { step: "Booking Ready", time: "Waiting", completed: false }
      ])
    };

    this.requests.unshift(newRequest);

    if (isMyRoom && !data.needsCatering && !data.needsIT) {
      // Notification for Booker (Instant confirmation + Door Pass)
      this.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        title: "Private Room Confirmed!",
        message: `Your booking for ${newRequest.room.name} is confirmed immediately. Door passcode: NBC-${refCode}.`,
        timestamp: "Just now",
        read: false,
        recipientRole: "Requester"
      });

      this.saveState();
      this.emitToast(
        "Room Confirmed!",
        `${newRequest.room.name} booked successfully. Door passcode ready: NBC-${refCode}`,
        "success"
      );
    } else if (isMyRoom) {
      // Notification for Manager Pitika to review Food/IT costs for own room
      this.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        title: "Food & IT Cost Review Needed",
        message: `Jonathan Vance booked ${newRequest.room.name} with Food/IT services. Please check and approve budget.`,
        timestamp: "Just now",
        read: false,
        recipientRole: "Approver"
      });

      this.saveState();
      this.emitToast(
        "Request Sent for Cost Review",
        `Booking created. Manager Pitika will check Food & IT services before setup.`,
        "info"
      );
    } else {
      // Add notification for Manager Pitika (Step 1 of 2)
      this.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        title: isPrivate ? "New Private Room Request (Step 1 of 2)" : "New Room Request",
        message: isPrivate 
          ? `${newRequest.requester.name} asked for Private Room ${newRequest.room.name}. Review Step 1 and send to Room Owner.`
          : `${newRequest.requester.name} requested to book ${newRequest.room.name}.`,
        timestamp: "Just now",
        read: false,
        recipientRole: "Approver"
      });

      this.saveState();
      this.emitToast(
        isPrivate ? "Private Room Request Sent" : "Request Sent",
        isPrivate 
          ? `Your request was sent to Manager Pitika for Step 1 review.`
          : `Your booking for ${newRequest.room.name} was sent to the manager.`,
        "success"
      );
    }
    return newRequest;
  }

  // Backward compatibility wrapper - redirects to createBookingRequest with standard flow
  createSimplePrivateRequest({ roomId, date, startTime, endTime, note, attendees = 4 }) {
    return this.createBookingRequest({
      roomId: roomId || 'ROOM-107',
      date,
      startTime,
      endTime,
      meetingTitle: `Private Session: ${this.getRoomById(roomId)?.name || 'Private Room'}`,
      meetingPurpose: note || "Private room session requested.",
      privateJustification: note || "Private room session requested.",
      attendees,
      isPrivateRequest: true,
      needsCatering: false,
      needsIT: false
    });
  }

  // Approval by Pitika for Private Room Requests
  approvePrivateRoomDirectly(requestId, options = {}) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    // For other users' private room requests, Pitika cannot bypass the Room Owner!
    if (!req.isMyRoom) {
      return this.forwardToRoomOwner(requestId, options);
    }

    req.approver.decision = "Approved";
    req.approver.reviewDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    req.managerReview = {
      decision: "Approved",
      notes: options.notes || "Approved Food & IT costs for Room Owner.",
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (req.cateringDetails) {
      req.cateringDetails.isConfirmedByApprover = true;
      req.cateringDetails.approverNotes = options.notes || "Food order verified.";
    }

    if (req.needsIT || req.needsCatering) {
      req.status = "Approved - Setup In Progress";

      if (req.timeline && req.timeline.length >= 3) {
        req.timeline[1].completed = true;
        req.timeline[1].time = "Approved by Pitika";
        req.timeline[2].time = "In Progress";
      }

      if (req.needsIT) {
        req.itDetails.ticketForwardedToIT = true;
        this.notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          title: "New IT Support Ticket",
          message: `Please set up equipment for ${req.room.name}.`,
          timestamp: "Just now",
          read: false,
          recipientRole: "IT"
        });
      }

      this.saveState();
      this.emitToast("Services Approved", `Food & IT approved for ${req.room.name}. Sent to setup.`, "success");
    } else {
      req.status = "Approved - Confirmed";

      if (req.timeline) {
        req.timeline.forEach((item, idx) => {
          item.completed = true;
          if (idx === 1) item.time = "Approved by Pitika";
          if (idx === req.timeline.length - 1) item.time = "Confirmed";
        });
      }

      this.saveState();
      this.emitToast("Private Room Approved", `Booking #${req.id} is confirmed.`, "success");
    }
  }

  // Stage 1 for Private Room: Pitika approves Step 1 and forwards to Room Owner
  forwardToRoomOwner(requestId, options = {}) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Pending Room Owner Approval";
    req.approver.decision = "Approved";
    req.managerReview = {
      decision: "Approved",
      notes: options.managerNotes || "Approved Step 1 by Manager Pitika. Sent to Room Owner for final approval.",
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (req.cateringDetails) {
      req.cateringDetails.isConfirmedByApprover = true;
      req.cateringDetails.approverNotes = options.managerNotes || "Food order approved by Manager Pitika.";
    }

    if (req.timeline && req.timeline.length >= 3) {
      req.timeline[1].completed = true;
      req.timeline[1].time = "Approved by Pitika";
      req.timeline[2].time = "In Progress";
      if (req.timeline[3]) {
        req.timeline[3].time = "Waiting for Room Owner";
      }
    }

    // Alert Room Owner
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Private Room Needs Your Final Approval",
      message: `Pitika approved Step 1 for ${req.requester.name}'s request (${req.room.name}, ${req.duration}). Both approvals required before setup.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "RoomOwner"
    });

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now() + 1}`,
      title: "Step 1 Approved by Manager",
      message: `Pitika approved Step 1 for ${req.room.name}. Sent to Room Owner for final approval before setup.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    this.saveState();
    this.emitToast("Approved & Sent to Owner", `Booking #${req.id} sent to Room Owner for final decision.`, "success");
  }

  // Stage 2: Private Room Owner Approves (Both approvals now complete -> Food & IT dispatch!)
  approveByRoomOwner(requestId, options = {}) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    // Apply any adjusted time limits
    if (options.approvedStartTime && options.approvedEndTime) {
      req.startTime = options.approvedStartTime;
      req.endTime = options.approvedEndTime;
      req.duration = `${options.approvedStartTime} - ${options.approvedEndTime} (Adjusted by Owner)`;
      if (req.cateringDetails) {
        req.cateringDetails.deliveryTime = options.approvedStartTime;
      }
    }

    req.roomOwnerReview = {
      decision: "Approved",
      approvedStartTime: req.startTime,
      approvedEndTime: req.endTime,
      ownerNotes: options.ownerNotes || "Approved for this specific session by Room Owner.",
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (req.timeline && req.timeline.length >= 3) {
      req.timeline[2].completed = true;
      req.timeline[2].time = "Approved by Owner";
    }

    // BOTH approvals complete: Now dispatch Food & IT support!
    if (req.needsIT || req.needsCatering) {
      req.status = "Approved - Setup In Progress";
      if (req.timeline && req.timeline.length >= 4) {
        req.timeline[3].time = "In Progress";
      }

      if (req.needsIT) {
        req.itDetails.ticketForwardedToIT = true;
        this.notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          title: "New IT Support Ticket (Both Approvals Granted)",
          message: `Both Manager Pitika and Room Owner approved ${req.room.name}. Please set up equipment (${req.startTime} - ${req.endTime}).`,
          timestamp: "Just now",
          read: false,
          recipientRole: "IT"
        });
      }
    } else {
      req.status = "Approved - Confirmed";
      if (req.timeline && req.timeline.length >= 5) {
        req.timeline[3].completed = true;
        req.timeline[3].time = "Ready";
        req.timeline[4].completed = true;
        req.timeline[4].time = "Confirmed";
      } else if (req.timeline && req.timeline.length >= 4) {
        req.timeline[3].completed = true;
        req.timeline[3].time = "Confirmed";
      }
    }

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now() + 2}`,
      title: "Private Room Fully Approved!",
      message: `Both Pitika and Room Owner approved your booking for ${req.room.name} (${req.startTime} - ${req.endTime}). ${req.needsIT ? 'IT technicians dispatched.' : 'Door pass ready.'}`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    // Alert Manager Pitika
    this.notifications.unshift({
      id: `NOTIF-${Date.now() + 3}`,
      title: "Room Owner Approved Booking",
      message: `Room Owner gave final approval for booking #${req.id} (${req.requester.name}).`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Approver"
    });

    this.saveState();
    this.emitToast("Final Approval Complete", `Both approvals complete. ${req.needsIT ? 'Dispatched to IT.' : 'Booking confirmed.'}`, "success");
  }

  // Stage 2: Private Room Owner Rejects
  rejectByRoomOwner(requestId, reason) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Rejected";
    req.roomOwnerReview = {
      decision: "Rejected",
      ownerNotes: reason || "Room not available for non-executive use today.",
      reviewDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (req.timeline && req.timeline.length >= 3) {
      req.timeline[2].completed = true;
      req.timeline[2].failed = true;
      req.timeline[2].time = "Rejected by Owner";
      if (req.timeline[3]) {
        req.timeline[3].time = "Cancelled";
      }
    }

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Private Room Request Declined",
      message: `The Room Owner rejected your request for ${req.room.name}. Reason: ${req.roomOwnerReview.ownerNotes}`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    // Alert Manager Pitika
    this.notifications.unshift({
      id: `NOTIF-${Date.now() + 1}`,
      title: "Room Owner Declined Request",
      message: `Room Owner declined booking #${req.id}. Reason: ${req.roomOwnerReview.ownerNotes}`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Approver"
    });

    this.saveState();
    this.emitToast("Request Rejected", `Booking #${req.id} was rejected by Room Owner.`, "error");
  }

  // Standard Approval for Normal Rooms
  approveAndSetupRequest(requestId, options = {}) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Approved - Setup In Progress";
    req.approver.decision = "Approved";
    req.approver.reviewDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    if (req.cateringDetails) {
      req.cateringDetails.isConfirmedByApprover = true;
      req.cateringDetails.approverNotes = options.cateringNotes || "Food order approved.";
    }

    if (req.needsIT && options.forwardToIT) {
      req.itDetails.ticketForwardedToIT = true;
      this.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        title: "New IT Support Ticket",
        message: `Please assign IT staff for ${req.meetingTitle} in ${req.room.name}.`,
        timestamp: "Just now",
        read: false,
        recipientRole: "IT"
      });
    }

    if (req.timeline && req.timeline.length >= 2) {
      req.timeline[1].completed = true;
      req.timeline[1].time = "Approved";
      if (req.timeline[2]) req.timeline[2].time = "In Progress";
    }

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Request Approved",
      message: `Your booking for ${req.room.name} was approved. Preparing room setup.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    this.saveState();
    this.emitToast("Request Approved", `Booking #${req.id} approved. Sent for setup.`, "success");
  }

  assignITStaff(requestId, { staffIds, staffId, prepTime, itNotes }) {
    const req = this.getRequestById(requestId);
    if (!req || !req.itDetails) return;

    let selectedStaffList = [];
    if (Array.isArray(staffIds) && staffIds.length > 0) {
      selectedStaffList = this.itStaff.filter(s => staffIds.includes(s.id));
    } else if (staffId) {
      const single = this.itStaff.find(s => s.id === staffId);
      if (single) selectedStaffList = [single];
    }
    
    if (selectedStaffList.length === 0) {
      selectedStaffList = [this.itStaff[0]];
    }

    const primaryStaff = selectedStaffList[0];
    const staffNames = selectedStaffList.map(s => s.name).join(', ');

    req.itDetails.assignedStaffList = selectedStaffList.map(s => ({
      id: s.id,
      name: s.name,
      title: s.title,
      phone: s.phone,
      avatar: s.avatar
    }));

    req.itDetails.assignedStaff = {
      id: primaryStaff.id,
      name: selectedStaffList.length > 1 ? `${primaryStaff.name} + ${selectedStaffList.length - 1} other${selectedStaffList.length > 2 ? 's' : ''}` : primaryStaff.name,
      title: selectedStaffList.length > 1 ? `${selectedStaffList.length} Technicians Assigned` : primaryStaff.title,
      phone: primaryStaff.phone,
      notes: itNotes || "Equipment tested and ready.",
      avatar: primaryStaff.avatar
    };

    req.itDetails.scheduledPrepTime = prepTime;
    req.itDetails.technicianNotes = itNotes || "Equipment tested and ready.";
    req.itDetails.isReady = true;

    // Alert Manager
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "IT Staff Assigned",
      message: `${staffNames} ${selectedStaffList.length > 1 ? 'are' : 'is'} ready for ${req.meetingTitle} in ${req.room.name}.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Approver"
    });

    this.saveState();
    this.emitToast("IT Assigned", `Assigned ${staffNames} for setup.`, "success");
  }

  finalizeRoomStatus(requestId) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Approved - Confirmed";
    const lastIdx = req.timeline ? req.timeline.length - 1 : 3;
    if (req.timeline && req.timeline[lastIdx - 1]) {
      req.timeline[lastIdx - 1].completed = true;
      req.timeline[lastIdx - 1].time = "Ready";
    }
    if (req.timeline && req.timeline[lastIdx]) {
      req.timeline[lastIdx].completed = true;
      req.timeline[lastIdx].time = "Confirmed";
    }

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Booking Ready & Confirmed",
      message: `Your booking for ${req.room.name} is confirmed. You can now print your receipt.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    this.saveState();
    this.emitToast("Booking Confirmed", `Booking #${req.id} is confirmed. Receipt is ready.`, "success");
  }

  rejectBookingRequest(requestId, reason) {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Rejected";
    req.approver.decision = "Rejected";
    req.approver.rejectionReason = reason || "Room is not available at this time.";
    req.approver.reviewDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    if (req.timeline && req.timeline.length >= 2) {
      req.timeline[1].completed = true;
      req.timeline[1].failed = true;
      req.timeline[1].time = "Rejected";
      for (let i = 2; i < req.timeline.length; i++) {
        req.timeline[i].time = "Cancelled";
      }
    }

    // Alert Requester
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Request Declined",
      message: `Your request for ${req.room.name} was rejected. Reason: ${req.approver.rejectionReason}`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Requester"
    });

    this.saveState();
    this.emitToast("Request Rejected", `Booking #${req.id} has been rejected.`, "error");
  }

  cancelBookingRequest(requestId, reason = "Cancelled by Booker") {
    const req = this.getRequestById(requestId);
    if (!req) return;

    req.status = "Cancelled";
    req.cancellationReason = reason;

    if (req.timeline) {
      req.timeline.forEach((step, idx) => {
        if (idx > 0 && !step.completed) {
          step.time = "Cancelled";
          step.failed = true;
        }
      });
    }

    // Alert Manager
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: "Booking Cancelled",
      message: `${req.requester.name} cancelled the booking for ${req.room.name}.`,
      timestamp: "Just now",
      read: false,
      recipientRole: "Approver"
    });

    this.saveState();
    this.emitToast("Booking Cancelled", `Booking #${req.id} was cancelled.`, "info");
  }

  cancelBooking(requestId, reason = "Cancelled by Booker") {
    return this.cancelBookingRequest(requestId, reason);
  }

  createRoom(payload) {
    const newId = `ROOM-${Date.now().toString().slice(-4)}`;
    const provinceVal = payload.province || payload.branch || "Phnom Penh";
    const locationVal = payload.location || "National Bank of Cambodia - Headquarters";
    const mapDetails = this.getRoomMapDetails({ location: locationVal, province: provinceVal });
    const newRoom = {
      id: newId,
      name: payload.name || "New Meeting Room",
      province: provinceVal,
      location: locationVal,
      branch: provinceVal,
      address: payload.address || mapDetails.address,
      mapQuery: payload.mapQuery || mapDetails.query,
      department: payload.department || "Board of Directors & Cabinet (ក្រុមប្រឹក្សាភិបាល)",
      category: payload.category || "Team Room",
      status: payload.status || "Available",
      description: payload.description || "",
      floor: payload.floor || "Level 18 (Floor 18) - Executive Suite",
      doorNumber: payload.doorNumber || "",
      capacity: payload.capacity || 10,
      size: payload.size || "50 sq m",
      layoutType: payload.layoutType || "Boardroom",
      isPrivate: !!payload.isPrivate,
      roomOwner: payload.roomOwner || null,
      features: payload.features || [],
      image: payload.image || "assets/rooms/innovation-hub.jpg",
      images: payload.images && payload.images.length > 0 ? payload.images : [payload.image || "assets/rooms/innovation-hub.jpg"],
      bufferMinutes: payload.bufferMinutes || 15,
      allowCatering: payload.allowCatering !== false
    };

    this.rooms.unshift(newRoom);
    this.saveState();
    this.emitToast("Room Created", `Successfully added "${newRoom.name}" at ${newRoom.location}.`, "success");
    return newRoom;
  }

  ensureSeedBookings() {
    if (!this.requests) this.requests = [];

    const hasSeed = this.requests.some(r => r.id === 'REQ-2026-021');
    if (hasSeed) return;

    const seedRequests = [
      {
        id: 'REQ-2026-021',
        referenceCode: 'NBC-81021',
        meetingTitle: 'Executive Governance & Monetary Review',
        meetingPurpose: 'Executive Governance & Monetary Review',
        date: '2026-09-11',
        startTime: '09:00',
        endTime: '11:00',
        room: this.getRoomById('ROOM-101') || { id: 'ROOM-101', name: 'ទន្លេមេគង្គ - Mekong River', isPrivate: true, floor: 'Level 18 (Floor 18) - Executive Suite' },
        status: 'Approved - Confirmed',
        statusDisplay: 'Approved',
        requester: { name: 'Jonathan Vance', department: 'Board & Executive Office', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        attendees: 16,
        isPrivateRequest: true,
        needsIT: true,
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '3 hours ago' },
          { step: 2, title: 'Manager Review', completed: true, time: '2 hours ago' },
          { step: 3, title: 'Room Owner', completed: true, time: '1 hour ago' },
          { step: 4, title: 'IT Setup', completed: true, time: '30 mins ago' },
          { step: 5, title: 'Ready', completed: true, time: 'Ready' }
        ]
      },
      {
        id: 'REQ-2026-022',
        referenceCode: 'NBC-81022',
        meetingTitle: 'Foreign Reserves Strategic Allocation',
        meetingPurpose: 'Foreign Reserves Strategic Allocation',
        date: '2026-09-11',
        startTime: '14:00',
        endTime: '16:00',
        room: this.getRoomById('ROOM-101') || { id: 'ROOM-101', name: 'ទន្លេមេគង្គ - Mekong River', isPrivate: true, floor: 'Level 18 (Floor 18) - Executive Suite' },
        status: 'Pending Review',
        statusDisplay: 'Pending Review',
        requester: { name: 'Serey Roth', department: 'Banking Operations', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
        attendees: 12,
        isPrivateRequest: true,
        needsIT: false,
        needsCatering: true,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '40 mins ago' },
          { step: 2, title: 'Manager Review', completed: false, time: 'Waiting' },
          { step: 3, title: 'Room Owner', completed: false, time: 'Pending' }
        ]
      },
      {
        id: 'REQ-2026-023',
        referenceCode: 'NBC-81023',
        meetingTitle: 'Macroeconomic Policy Research Sync',
        meetingPurpose: 'Macroeconomic Policy Research Sync',
        date: '2026-09-11',
        startTime: '10:00',
        endTime: '12:00',
        room: this.getRoomById('ROOM-102') || { id: 'ROOM-102', name: 'ទន្លេសាប - Tonle Sap River', isPrivate: false, floor: 'Level 12 (Floor 12) - Banking Studies & Policy' },
        status: 'Approved - Confirmed',
        statusDisplay: 'Approved',
        requester: { name: 'Chan Bora', department: 'Monetary Policy & Research', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
        attendees: 10,
        isPrivateRequest: false,
        needsIT: true,
        needsCatering: true,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '4 hours ago' },
          { step: 2, title: 'Auto Approved', completed: true, time: '4 hours ago' },
          { step: 3, title: 'Ready', completed: true, time: 'Ready' }
        ]
      },
      {
        id: 'REQ-2026-024',
        referenceCode: 'NBC-81024',
        meetingTitle: 'Confidential Audit Committee Session',
        meetingPurpose: 'Confidential Audit Committee Session',
        date: '2026-09-11',
        startTime: '13:00',
        endTime: '15:30',
        room: this.getRoomById('ROOM-103') || { id: 'ROOM-103', name: 'ទន្លេបាសាក់ - Bassac River', isPrivate: true, floor: 'Level 5 (Floor 5) - Finance & Audit' },
        status: 'Approved - Confirmed',
        statusDisplay: 'Approved',
        requester: { name: 'Kimly Chea', department: 'Internal Audit', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        attendees: 6,
        isPrivateRequest: true,
        needsIT: false,
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '5 hours ago' },
          { step: 2, title: 'Manager Review', completed: true, time: '4 hours ago' },
          { step: 3, title: 'Room Owner', completed: true, time: '3 hours ago' },
          { step: 4, title: 'Ready', completed: true, time: 'Ready' }
        ]
      },
      {
        id: 'REQ-2026-025',
        referenceCode: 'NBC-81025',
        meetingTitle: 'Bakong Settlement Protocol Engineering',
        meetingPurpose: 'Bakong Settlement Protocol Engineering',
        date: '2026-09-11',
        startTime: '08:30',
        endTime: '10:30',
        room: this.getRoomById('ROOM-105') || { id: 'ROOM-105', name: 'ទន្លេសេសាន - Sesan River', isPrivate: false, floor: 'Floor 3 - Core Banking & Networks' },
        status: 'Pending Review',
        statusDisplay: 'Pending Review',
        requester: { name: 'David Seng', department: 'Information Technology (IT)', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
        attendees: 8,
        isPrivateRequest: false,
        needsIT: true,
        needsCatering: false,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '30 mins ago' },
          { step: 2, title: 'Manager Review', completed: false, time: 'Waiting' }
        ]
      },
      {
        id: 'REQ-2026-026',
        referenceCode: 'NBC-81026',
        meetingTitle: 'Fintech Innovation Sprint Architecture',
        meetingPurpose: 'Fintech Innovation Sprint Architecture',
        date: '2026-09-11',
        startTime: '15:00',
        endTime: '17:00',
        room: this.getRoomById('ROOM-105') || { id: 'ROOM-105', name: 'ទន្លេសេសាន - Sesan River', isPrivate: false, floor: 'Floor 3 - Core Banking & Networks' },
        status: 'Pending Review',
        statusDisplay: 'Pending Review',
        requester: { name: 'Piseth Meas', department: 'Information Technology (IT)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
        attendees: 6,
        isPrivateRequest: false,
        needsIT: true,
        needsCatering: true,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '1 hour ago' },
          { step: 2, title: 'Manager Review', completed: false, time: 'Waiting' }
        ]
      },
      {
        id: 'REQ-2026-027',
        referenceCode: 'NBC-81027',
        meetingTitle: 'Correspondent Banking Delegation Reception',
        meetingPurpose: 'Correspondent Banking Delegation Reception',
        date: '2026-09-11',
        startTime: '11:00',
        endTime: '13:00',
        room: this.getRoomById('ROOM-106') || { id: 'ROOM-106', name: 'ទន្លេស្រែពក - Srepok River', isPrivate: false, floor: 'Ground Floor - Banking Hall & Tellers' },
        status: 'Approved - Confirmed',
        statusDisplay: 'Approved',
        requester: { name: 'Sopheap Keo', department: 'Banking Operations', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
        attendees: 8,
        isPrivateRequest: false,
        needsIT: false,
        needsCatering: true,
        timeline: [
          { step: 1, title: 'Sent', completed: true, time: '2 hours ago' },
          { step: 2, title: 'Manager Review', completed: true, time: '1 hour ago' },
          { step: 3, title: 'Ready', completed: true, time: 'Ready' }
        ]
      }
    ];

    this.requests.unshift(...seedRequests);
    this.saveState();
  }

  getRoomAvailability(dateStr = null) {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = dateStr || '2026-09-11';

    // Canonical order matching the specification and reference UI
    const preferredOrder = [
      'ROOM-104', // 1. ទន្លេសេកុង - Sekong River (Shared)
      'ROOM-101', // 2. ទន្លេមេគង្គ - Mekong River (Private)
      'ROOM-102', // 3. ទន្លេសាប - Tonle Sap River (Shared)
      'ROOM-107', // 4. ស្ទឹងសែន - Stung Sen River (Private)
      'ROOM-103', // 5. ទន្លេបាសាក់ - Bassac River (Private)
      'ROOM-110', // 6. ស្ទឹងពោធិ៍សាត់ - Stung Pursat River (Shared)
      'ROOM-105', // 7. ទន្លេសេសាន - Sesan River (Shared)
      'ROOM-106', // 8. ទន្លេស្រែពក - Srepok River (Shared)
      'ROOM-109', // 9. ស្ទឹងសៀមរាប - Stung Siem Reap River (Shared)
      'ROOM-108'  // 10. ស្ទឹងសង្កែ - Stung Sangker River (Shared)
    ];

    const allRooms = [...this.rooms].sort((a, b) => {
      const idxA = preferredOrder.indexOf(a.id);
      const idxB = preferredOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    const activeRequests = (this.requests || []).filter(req => {
      const status = (req.status || '').toLowerCase();
      if (status.includes('reject') || status.includes('cancel')) return false;
      if (req.date === targetDate) return true;
      if (req.sessions && Array.isArray(req.sessions) && req.sessions.some(s => s.date === targetDate)) return true;
      return false;
    });

    let occupiedRoomsCount = 0;
    let availableRoomsCount = 0;

    const roomSchedules = allRooms.map((room, index) => {
      const roomReqs = activeRequests.filter(r => (r.room?.id === room.id || r.roomId === room.id));

      const blocks = [];

      // Booking Requests (Occupied vs. Pending Approval)
      roomReqs.forEach(req => {
        const isConfirmed = req.status.includes('Approved') || req.status === 'Confirmed' || req.statusDisplay === 'Approved';
        const isPending = req.status.includes('Pending') || req.statusDisplay === 'Pending Review';

        let type = 'available';
        if (isConfirmed) type = 'occupied';
        else if (isPending) type = 'pending';

        const session = (req.sessions && req.sessions.find(s => s.date === targetDate)) || { startTime: req.startTime, endTime: req.endTime };
        const start = session.startTime || req.startTime || '09:00';
        const end = session.endTime || req.endTime || '11:00';

        blocks.push({
          id: req.id,
          type: type,
          startTime: start,
          endTime: end,
          title: req.meetingTitle || 'Meeting',
          requester: req.requester?.name || 'NBC Staff',
          department: req.requester?.department || 'National Bank of Cambodia',
          avatar: req.requester?.avatar || '',
          attendees: req.attendees || 0,
          statusDisplay: isConfirmed ? 'Occupied' : 'Pending Approval',
          color: isConfirmed ? 'red' : 'yellow',
          canClick: true,
          request: req
        });
      });

      // Sort blocks chronologically
      blocks.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

      // Determine overall room status for summary based on current/selected snapshot time (default 11:00)
      const refTimeMins = 11 * 60; // 11:00am snapshot
      const isCurrentlyOccupied = blocks.some(b => {
        if (b.type !== 'occupied') return false;
        const [sh, sm] = (b.startTime || '00:00').split(':').map(Number);
        const [eh, em] = (b.endTime || '00:00').split(':').map(Number);
        const sMins = sh * 60 + sm;
        const eMins = eh * 60 + em;
        return refTimeMins >= sMins && refTimeMins <= eMins;
      });

      let overallStatus = 'available';
      if (isCurrentlyOccupied || (targetDate !== '2026-09-11' && blocks.some(b => b.type === 'occupied'))) {
        overallStatus = 'occupied';
        occupiedRoomsCount++;
      } else {
        overallStatus = 'available';
        availableRoomsCount++;
      }

      return {
        room,
        index: index + 1,
        overallStatus,
        blocks,
        isUnderMaintenance: false
      };
    });

    return {
      date: targetDate,
      summary: {
        totalRooms: allRooms.length,
        available: availableRoomsCount,
        occupied: occupiedRoomsCount
      },
      rooms: roomSchedules
    };
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveState();
  }
}

// Global Store Instance
window.bookingStore = new BankBookingStore();
