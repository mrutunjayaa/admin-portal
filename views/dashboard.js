    // --- VIEW: DASHBOARD ---
    Router.register('dashboard', () => {
      const main = document.getElementById('main-content-view');
      const userRole = localStorage.getItem('saas_user_role') || 'admin';
      
      let statsHtml = '';
      let ytIncome = 0, freeIncome = 0; // scoped variables
      
      if (userRole === 'admin') {
        const bugEarnings = DB.cache.BugBounty.reduce((sum, item) => sum + (item.paidStatus === 'Paid' ? item.reward : 0), 0) * 80;
        ytIncome = DB.cache.Finance.filter(f => f.category === 'YouTube').reduce((s, i) => s + i.amount, 0);
        freeIncome = DB.cache.Finance.filter(f => f.category === 'Freelancing').reduce((s, i) => s + i.amount, 0);
        const monthlyExp = DB.cache.Finance.filter(f => f.type === 'expense').reduce((s, i) => s + i.amount, 0);
        const totalIncome = DB.cache.Finance.filter(f => f.type === 'income').reduce((s, i) => s + i.amount, 0);
        const savings = totalIncome - monthlyExp;
        
        const todayTasks = DB.cache.Tasks.filter(t => t.date === window.globalSelectedDate);
        const pendingTasks = todayTasks.filter(t => t.status === 'pending').length;

        statsHtml = `
          <div class="grid-4" style="margin-bottom: 24px;">
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Pending Tasks</span>
                <span class="stat-val">${pendingTasks}</span>
              </div>
              <div class="stat-icon-wrap"><i class="material-icons-round">task_alt</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Bounty Earnings (Est)</span>
                <span class="stat-val">${formatCurrency(bugEarnings)}</span>
              </div>
              <div class="stat-icon-wrap"><i class="material-icons-round">bug_report</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Monthly Expenses</span>
                <span class="stat-val">${formatCurrency(monthlyExp)}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">trending_down</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Net Savings</span>
                <span class="stat-val">${formatCurrency(savings)}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">savings</i></div>
            </div>
          </div>
        `;
      } else {
        const todayTasks = DB.cache.Tasks.filter(t => t.date === window.globalSelectedDate);
        const pendingTasks = todayTasks.filter(t => t.status === 'pending').length;
        const occupiedRooms = DB.cache.HotelBookings.filter(b => b.status === 'occupied').length;
        const activeOrders = DB.cache.RestaurantOrders.filter(o => o.status !== 'Delivered').length;
        const activeTours = DB.cache.TourBookings.length;

        statsHtml = `
          <div class="grid-4" style="margin-bottom: 24px;">
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Pending Tasks</span>
                <span class="stat-val">${pendingTasks}</span>
              </div>
              <div class="stat-icon-wrap"><i class="material-icons-round">task_alt</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Occupied Rooms</span>
                <span class="stat-val">${occupiedRooms}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--warning);"><i class="material-icons-round">meeting_room</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Preparing Food Orders</span>
                <span class="stat-val">${activeOrders}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--info);"><i class="material-icons-round">flatware</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Dispatched Taxi Rides</span>
                <span class="stat-val">${activeTours}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">local_taxi</i></div>
            </div>
          </div>
        `;
      }

      const todayTasks = DB.cache.Tasks.filter(t => t.date === window.globalSelectedDate);

      main.innerHTML = `
        <div class="fade-in-up">
          <!-- Welcome Bar -->
          <div class="grid-2" style="margin-bottom: 24px;">
            <div class="card" style="padding: 24px; background: linear-gradient(135deg, var(--gold-alpha) 0%, transparent 100%);">
              <h2 style="font-size:1.8rem;margin-bottom:6px;">Welcome Back! 💻</h2>
              <p style="color:var(--text-secondary);font-size:0.9rem;">
                Here is the quick layout of your operations today.
              </p>
            </div>
            <div class="card" style="display:flex;align-items:center;justify-content:center;">
              <div class="clock-widget">
                <div class="clock-time" id="live-clock">00:00:00 AM</div>
                <div class="clock-date" id="live-date">Monday, 01 January</div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          ${statsHtml}
          
          <div class="grid-2">
            <!-- Daily Planner Checklist -->
            <div class="card">
              <div class="card-title"><i class="material-icons-round">checklist</i>Today's Agenda</div>
              <div id="dashboard-checklist-container"></div>
            </div>

            <!-- YouTube & Freelancing summary / Hotel quick summary -->
            <div class="card">
              <div class="card-title"><i class="material-icons-round">rocket_launch</i>Operational Summaries</div>
              <div style="display:flex;flex-direction:column;gap:14px;margin-top:10px;">
                ${userRole === 'admin' ? `
                  <div class="habit-item">
                    <span>YouTube Monetization</span>
                    <span class="badge badge-success">${formatCurrency(ytIncome)}</span>
                  </div>
                  <div class="habit-item">
                    <span>Freelance Python Consulting</span>
                    <span class="badge badge-success">${formatCurrency(freeIncome)}</span>
                  </div>
                  <div class="habit-item">
                    <span>Hotel Bookings Revenue</span>
                    <span class="badge badge-gold">${formatCurrency(DB.cache.HotelBookings.reduce((s,i)=>s+i.totalAmount,0))}</span>
                  </div>
                ` : `
                  <div class="habit-item">
                    <span>Active Booked Rooms</span>
                    <span class="badge badge-gold">${DB.cache.HotelBookings.filter(b=>b.status==='occupied').length} Rooms</span>
                  </div>
                  <div class="habit-item">
                    <span>Active Menu Orders</span>
                    <span class="badge badge-info">${DB.cache.RestaurantOrders.filter(o=>o.status==='Preparing').length} preparing</span>
                  </div>
                  <div class="habit-item">
                    <span>Scheduled Taxi Pickups</span>
                    <span class="badge badge-success">${DB.cache.TourBookings.filter(b=>b.paymentStatus==='Pending').length} pending payment</span>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;

      // Render Dashboard Checklist
      const checkContainer = document.getElementById('dashboard-checklist-container');
      if (todayTasks.length === 0) {
        checkContainer.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:20px;">All done! No tasks for today.</div>`;
      } else {
        checkContainer.innerHTML = todayTasks.map(t => `
          <div class="habit-item">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="habit-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleDashboardTask('${t.id}')">
                ${t.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
              </span>
              <span style="${t.status === 'completed' ? 'text-decoration:line-through;opacity:0.6;' : ''}">${t.title}</span>
            </div>
            <span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}">${t.priority}</span>
          </div>
        `).join('');
      }

      // Start Clock Update
      startClock();
    });

    window.toggleDashboardTask = function(id) {
      const task = DB.cache.Tasks.find(t => t.id === id);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        DB.saveTable('Tasks').then(() => {
          showNotification(`Task status changed: ${task.title}`);
          Router.routes['dashboard']();
        });
      }
    };

    let clockInterval;
    function startClock() {
      if (clockInterval) clearInterval(clockInterval);
      
      const update = () => {
        const now = new Date();
        const clockEl = document.getElementById('live-clock');
        const dateEl = document.getElementById('live-date');
        
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: true });
        if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      };
      
      update();
      clockInterval = setInterval(update, 1000);
    }
