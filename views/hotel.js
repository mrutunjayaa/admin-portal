    // --- VIEW: HOTEL ---
    Router.register('hotel', () => {
      const main = document.getElementById('main-content-view');
      const bookings = DB.cache.HotelBookings;
      
      // Calculate Room Occupancy stats
      const occupiedRooms = bookings.filter(b => b.status === 'occupied').map(b => b.roomNumber);
      const cleaningRooms = ["202"]; // Dummy cleaning list
      
      const allRooms = ["101", "102", "103", "104", "201", "202", "203", "301", "302"];

      main.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-3" style="margin-bottom:24px;">
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Total Occupied Rooms</span>
                <span class="stat-val">${occupiedRooms.length}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">meeting_room</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Available for Booking</span>
                <span class="stat-val">${allRooms.length - occupiedRooms.length - cleaningRooms.length}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">check_circle</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Housekeeping Status (Cleaning)</span>
                <span class="stat-val">${cleaningRooms.length}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--warning);"><i class="material-icons-round">cleaning_services</i></div>
            </div>
          </div>

          <div class="grid-3">
            <!-- Room status grid -->
            <div class="card col-span-2">
              <div class="card-title"><i class="material-icons-round">room_preferences</i>Hotel No 1 — Room Status Grid</div>
              <div class="room-grid" style="margin-top:10px;">
                ${allRooms.map(rm => {
                  let status = 'available';
                  if (occupiedRooms.includes(rm)) status = 'occupied';
                  else if (cleaningRooms.includes(rm)) status = 'cleaning';
                  
                  return `
                    <div class="room-card ${status}" onclick="openRoomDetails('${rm}', '${status}')">
                      <div class="room-num">${rm}</div>
                      <div class="room-type">${rm.startsWith('3') ? 'Luxury Suite' : rm.startsWith('2') ? 'Deluxe Room' : 'Standard Room'}</div>
                      <span class="badge badge-${status === 'available' ? 'success' : status === 'occupied' ? 'danger' : 'warning'}" style="margin-top:8px;">${status}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Booking form card -->
            <div class="card">
              <div class="card-title"><i class="material-icons-round">add_circle</i>Book Room / Check-In</div>
              <div class="form-group">
                <label>Guest Full Name</label>
                <input type="text" class="form-control" id="h-guest-name" placeholder="e.g. Adarsh Goel">
              </div>
              <div class="form-group">
                <label>Contact Phone</label>
                <input type="text" class="form-control" id="h-guest-phone" placeholder="Mobile Number">
              </div>
              <div class="form-group">
                <label>Room Number</label>
                <select id="h-room-num">
                  ${allRooms.filter(r => !occupiedRooms.includes(r)).map(r => `<option value="${r}">Room ${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Duration check-in (Nights)</label>
                <input type="number" class="form-control" id="h-nights" value="2">
              </div>
              <div class="form-group">
                <label>Calculated Package Cost</label>
                <input type="number" class="form-control" id="h-price" value="5000">
              </div>
              <button class="btn btn-primary" style="width:100%;" onclick="saveRoomBooking()">Confirm Room Check-In</button>
            </div>
          </div>
        </div>
      `;
    });

    window.openRoomDetails = function(num, status) {
      if (status === 'occupied') {
        const booking = DB.cache.HotelBookings.find(b => b.roomNumber === num && b.status === 'occupied');
        if (booking) {
          alert(`Guest Details:\nName: ${booking.guestName}\nPhone: ${booking.guestPhone}\nCheck-in Date: ${booking.checkIn}\nPayment: ${booking.paymentStatus}`);
        }
      } else {
        alert(`Room ${num} is currently ${status}.`);
      }
    };

    window.saveRoomBooking = function() {
      const name = document.getElementById('h-guest-name').value;
      const phone = document.getElementById('h-guest-phone').value;
      const room = document.getElementById('h-room-num').value;
      const nights = parseInt(document.getElementById('h-nights').value) || 1;
      const price = parseFloat(document.getElementById('h-price').value) || 2000;
      
      if (!name || !phone) {
        alert("Please complete guest name and phone details!");
        return;
      }

      const hb = {
        id: DB.uid(),
        roomNumber: room,
        guestName: name,
        guestPhone: phone,
        checkIn: window.globalSelectedDate,
        checkOut: new Date(Date.now() + nights*24*60*60*1000).toISOString().split('T')[0],
        status: 'occupied',
        totalAmount: price,
        paymentStatus: 'pending'
      };

      DB.cache.HotelBookings.push(hb);
      DB.saveTable('HotelBookings').then(() => {
        showNotification(`Checked guest ${name} into Room ${room}`);
        Router.routes['hotel']();
      });
    };
