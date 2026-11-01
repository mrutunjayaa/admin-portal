    // --- VIEW: REPORTS ---
    Router.register('reports', () => {
      const main = document.getElementById('main-content-view');
      main.innerHTML = `
        <div class="fade-in-up">
          <div class="card" style="max-width: 600px; margin: 0 auto;">
            <div class="card-title"><i class="material-icons-round">download</i>Generate Consolidated Reports</div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
              Select a data module sheet below to download/generate a formatted CSV database export spreadsheet.
            </p>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <button class="btn btn-secondary" onclick="exportCSV('Finance')"><i class="fas fa-file-csv"></i> Download Finance Transactions Ledger CSV</button>
              <button class="btn btn-secondary" onclick="exportCSV('BugBounty')"><i class="fas fa-file-csv"></i> Download Bug Bounty Reports CSV</button>
              <button class="btn btn-secondary" onclick="exportCSV('HotelBookings')"><i class="fas fa-file-csv"></i> Download Hotel Rooms Bookings CSV</button>
              <button class="btn btn-secondary" onclick="exportCSV('RestaurantOrders')"><i class="fas fa-file-csv"></i> Download Restaurant Sales Reports CSV</button>
            </div>
          </div>
        </div>
      `;
    });

    window.exportCSV = function(tableName) {
      const list = DB.cache[tableName] || [];
      if (list.length === 0) {
        alert("No records found in this table to export.");
        return;
      }
      
      // Simple CSV compilation
      const headers = Object.keys(list[0]);
      let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + list.map(e => headers.map(h => `"${String(e[h] || '').replace(/"/g, '""')}"`).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${tableName}_Export_${window.globalSelectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Exported CSV for ${tableName}`);
    };
