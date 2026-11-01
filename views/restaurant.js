    // --- VIEW: RESTAURANT ---
    Router.register('restaurant', () => {
      const main = document.getElementById('main-content-view');
      const orders = DB.cache.RestaurantOrders;
      const inv = DB.cache.RestaurantInventory;

      main.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-3" style="margin-bottom:24px;">
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Daily Restaurant Orders</span>
                <span class="stat-val">${orders.length}</span>
              </div>
              <div class="stat-icon-wrap"><i class="material-icons-round">point_of_sale</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Restaurant Daily Revenue</span>
                <span class="stat-val">${formatCurrency(orders.reduce((s,i)=>s+i.totalAmount, 0))}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">currency_rupee</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Critical Stock Items Alert</span>
                <span class="stat-val" style="color:var(--danger);">${inv.filter(i => i.stock <= i.minStock).length}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">warning</i></div>
            </div>
          </div>

          <div class="grid-3">
            <!-- Daily Orders List -->
            <div class="card col-span-2">
              <div class="card-title"><i class="material-icons-round">flatware</i>Daily Orders Log</div>
              <div style="margin-bottom: 12px; display:flex; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="openAddOrderModal()"><i class="fas fa-plus"></i> New Food Order</button>
              </div>
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr><th>Order ID</th><th>Items Ordered</th><th>Total Cost</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    ${orders.map(o => `
                      <tr>
                        <td><b>${o.id}</b></td>
                        <td>${o.orderDetails}</td>
                        <td style="font-weight:600;">${formatCurrency(o.totalAmount)}</td>
                        <td><span class="badge badge-${o.status === 'Delivered' ? 'success' : 'warning'}">${o.status}</span></td>
                        <td>
                          ${o.status !== 'Delivered' ? `<button class="btn btn-secondary btn-sm" onclick="completeFoodOrder('${o.id}')" style="padding:4px 8px;">Complete</button>` : 'Delivered'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Inventory Panel -->
            <div class="card">
              <div class="card-title"><i class="material-icons-round">inventory_2</i>Kitchen Inventory</div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${inv.map(i => {
                  const alert = i.stock <= i.minStock;
                  return `
                    <div class="habit-item" style="border-left: 4px solid ${alert ? 'var(--danger)' : 'var(--success)'};">
                      <div>
                        <span><b>${i.item}</b></span>
                        <div style="font-size:0.7rem; color:var(--text-muted);">${i.category}</div>
                      </div>
                      <span class="badge badge-${alert ? 'danger' : 'success'}">${i.stock} / ${i.minStock} ${i.unit}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    window.openAddOrderModal = function() {
      const html = `
        <div class="form-group">
          <label>Food Item Description & Quantity</label>
          <input type="text" class="form-control" id="ro-items" placeholder="e.g. 1x Chicken Biryani, 2x Roti">
        </div>
        <div class="form-group">
          <label>Total Price (INR)</label>
          <input type="number" class="form-control" id="ro-price" placeholder="Total Cost">
        </div>
      `;
      showModal("Log New Restaurant Food Order", html, "Log Order", saveFoodOrder);
    };

    window.saveFoodOrder = function() {
      const items = document.getElementById('ro-items').value;
      const price = parseFloat(document.getElementById('ro-price').value) || 0;
      
      const order = {
        id: 'ord_' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        date: window.globalSelectedDate,
        orderDetails: items,
        totalAmount: price,
        status: 'Preparing'
      };

      DB.cache.RestaurantOrders.push(order);
      DB.saveTable('RestaurantOrders').then(() => {
        showNotification(`Logged preparing food order ${order.id}`);
        Router.routes['restaurant']();
      });
    };

    window.completeFoodOrder = function(id) {
      const ord = DB.cache.RestaurantOrders.find(o => o.id === id);
      if (ord) {
        ord.status = 'Delivered';
        DB.saveTable('RestaurantOrders').then(() => {
          showNotification(`Food order ${id} delivered successfully.`);
          Router.routes['restaurant']();
        });
      }
    };
