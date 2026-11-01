    // --- VIEW: TOUR & TRAVELS ---
    Router.register('tourtravels', () => {
      const main = document.getElementById('main-content-view');
      const tours = DB.cache.TourBookings;

      main.innerHTML = `
        <div class="fade-in-up">
          <div class="card">
            <div class="card-title"><i class="material-icons-round">commute</i>Mahasuara Tour & Travels dispatch</div>
            <div style="margin-bottom: 12px; display:flex; justify-content: flex-end;">
              <button class="btn btn-primary" onclick="openAddTourModal()"><i class="fas fa-plus"></i> Dispatch New Taxi</button>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr><th>Date</th><th>Customer</th><th>Taxi Details</th><th>Assigned Driver</th><th>Package Itinerary</th><th>Cost</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${tours.map(t => `
                    <tr>
                      <td>${t.date}</td>
                      <td><b>${t.customerName}</b></td>
                      <td><code>${t.taxiDetails}</code></td>
                      <td>${t.driverName}</td>
                      <td>${t.tourPackage}</td>
                      <td style="font-weight:600;">${formatCurrency(t.totalAmount)}</td>
                      <td><span class="badge ${t.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${t.paymentStatus}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    });

    window.openAddTourModal = function() {
      const html = `
        <div class="form-group">
          <label>Customer Name</label>
          <input type="text" class="form-control" id="tt-name" placeholder="e.g. Subodh Das">
        </div>
        <div class="form-group">
          <label>Taxi Vehicle Number & Details</label>
          <input type="text" class="form-control" id="tt-taxi" placeholder="e.g. Swift Dzire (OD-02-X-1111)">
        </div>
        <div class="form-group">
          <label>Driver Name</label>
          <input type="text" class="form-control" id="tt-driver" placeholder="Assigned Driver Name">
        </div>
        <div class="form-group">
          <label>Tour Package Itinerary</label>
          <input type="text" class="form-control" id="tt-package" placeholder="e.g. Konark Transit, Puri Sightseeing">
        </div>
        <div class="form-group">
          <label>Total Fare Amount</label>
          <input type="number" class="form-control" id="tt-fare" placeholder="Total Cost">
        </div>
      `;
      showModal("Schedule Travel Tour Dispatch", html, "Dispatch Taxi", saveTourDispatch);
    };

    window.saveTourDispatch = function() {
      const tour = {
        id: DB.uid(),
        customerName: document.getElementById('tt-name').value,
        taxiDetails: document.getElementById('tt-taxi').value,
        driverName: document.getElementById('tt-driver').value,
        tourPackage: document.getElementById('tt-package').value,
        totalAmount: parseFloat(document.getElementById('tt-fare').value) || 1500,
        paymentStatus: 'Pending',
        date: window.globalSelectedDate
      };

      DB.cache.TourBookings.push(tour);
      DB.saveTable('TourBookings').then(() => {
        showNotification(`Taxi tour dispatched for customer ${tour.customerName}`);
        Router.routes['tourtravels']();
      });
    };
