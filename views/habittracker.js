    // --- VIEW: HABIT TRACKER (Full Page) ---
    Router.register('habittracker', () => {
      const main = document.getElementById('main-content-view');
      const today = window.globalSelectedDate;
      const habits = DB.cache.Habits || [];
      const activeHabits = habits.filter(h => !h.createdAt || h.createdAt <= today);
      const total = activeHabits.length;
      const done = activeHabits.filter(h => (h.completedDates || []).includes(today)).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      // Generate last 7 days for weekly grid
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = window.getGlobalDateObj();
        d.setDate(d.getDate() - i);
        last7.push({ date: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0], day: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate() });
      }

      // Generate date ranges for all views
      const viewRanges = {
        day: (() => {
          const arr = [];
          const d = window.getGlobalDateObj();
          arr.push({ date: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0], day: 'Today', num: d.getDate() });
          return arr;
        })(),
        week: last7,
        month: (() => {
          const arr = [];
          for (let i = 29; i >= 0; i--) {
            const d = window.getGlobalDateObj(); d.setDate(d.getDate() - i);
            arr.push({ date: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0], day: d.getDate().toString(), num: d.getDate() });
          }
          return arr;
        })(),
        year: (() => {
          const arr = [];
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          for (let i = 11; i >= 0; i--) {
            const d = window.getGlobalDateObj(); d.setMonth(d.getMonth() - i);
            const y = d.getFullYear(); const m = d.getMonth();
            // Get all dates in that month
            const dates = [];
            const daysInMonth = new Date(y, m+1, 0).getDate();
            for (let dd = 1; dd <= daysInMonth; dd++) {
              dates.push(`${y}-${String(m+1).padStart(2,'0')}-${String(dd).padStart(2,'0')}`);
            }
            arr.push({ label: monthNames[m], dates: dates });
          }
          return arr;
        })()
      };

      const selectedView = window._habitViewMode || 'week';

      // Build grid HTML based on view
      let gridHtml = '';
      if (selectedView === 'year') {
        // Year view: months as columns, show ratio
        const months = viewRanges.year;
        gridHtml = `
          <div style="overflow-x:auto;">
            <div style="display:grid; grid-template-columns: 1fr repeat(${months.length}, minmax(42px, 1fr)); gap:0; font-size:0.72rem; align-items:center;">
              <div class="ht-weekly-header" style="text-align:left;">Habit</div>
              ${months.map((m, mi) => {
                const now = window.getGlobalDateObj();
                const isCurrentMonth = mi === months.length - 1;
                return `<div class="ht-weekly-header ${isCurrentMonth ? 'today-col' : ''}">${m.label}</div>`;
              }).join('')}
              ${habits.map(h => `
                <div class="ht-weekly-name">${h.title}</div>
                ${months.map((m, mi) => {
                  const completedInMonth = m.dates.filter(d => (h.completedDates || []).includes(d)).length;
                  const totalInMonth = m.dates.length;
                  const ratio = totalInMonth > 0 ? Math.round((completedInMonth / totalInMonth) * 100) : 0;
                  const isCurrentMonth = mi === months.length - 1;
                  let color = ratio >= 80 ? '#10b981' : ratio >= 40 ? '#f59e0b' : 'var(--text-muted)';
                  return `<div class="ht-weekly-cell"><span style="font-size:0.65rem; font-weight:700; color:${color};">${ratio}%</span></div>`;
                }).join('')}
              `).join('')}
            </div>
          </div>
        `;
      } else if (selectedView === 'month') {
        const days = viewRanges.month;
        gridHtml = `
          <div style="overflow-x:auto;">
            <div style="display:grid; grid-template-columns: 1fr repeat(${days.length}, 28px); gap:0; font-size:0.72rem; align-items:center;">
              <div class="ht-weekly-header" style="text-align:left;">Habit</div>
              ${days.map(day => `<div class="ht-weekly-header ${day.date === today ? 'today-col' : ''}" style="font-size:0.58rem;">${day.num}</div>`).join('')}
              ${habits.map(h => `
                <div class="ht-weekly-name" style="font-size:0.72rem;">${h.title}</div>
                ${days.map(day => {
                  const isCreated = (!h.createdAt || h.createdAt <= day.date);
                  if (!isCreated) return `<div class="ht-weekly-cell" style="padding:4px 0;"><span style="width:20px; height:20px; display:inline-block;"></span></div>`;
                  const isDone = (h.completedDates || []).includes(day.date);
                  const isToday = day.date === today;
                  let cls = isDone ? (isToday ? 'today-done' : 'done') : (isToday ? 'today-miss' : 'miss');
                  return `<div class="ht-weekly-cell" style="padding:4px 0;"><span class="ht-dot ${cls}" style="width:20px; height:20px; font-size:0.75rem;">${isDone ? '<i class="fas fa-check" style="font-weight:900;"></i>' : ''}</span></div>`;
                }).join('')}
              `).join('')}
            </div>
          </div>
        `;
      } else if (selectedView === 'day') {
        const dayData = viewRanges.day[0];
        gridHtml = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${habits.map(h => {
              const isCreated = (!h.createdAt || h.createdAt <= dayData.date);
              if (!isCreated) return '';
              const isDone = (h.completedDates || []).includes(dayData.date);
              return `
                <div class="habit-item" style="padding:12px 14px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span class="habit-checkbox ${isDone ? 'checked' : ''}" onclick="toggleHabitFull('${h.id}')">
                      ${isDone ? '<i class="fas fa-check" style="font-weight:900;"></i>' : ''}
                    </span>
                    <span style="${isDone ? 'text-decoration:line-through; opacity:0.6;' : ''}; font-weight:600;">${h.title}</span>
                  </div>
                  <span class="badge ${isDone ? 'badge-success' : 'badge-warning'}" style="font-size:0.68rem;">${isDone ? 'Done' : 'Pending'}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        // Week view (default)
        gridHtml = `
          <div class="ht-weekly-grid">
            <div class="ht-weekly-header" style="text-align:left;">Habit</div>
            ${last7.map(day => `<div class="ht-weekly-header ${day.date === today ? 'today-col' : ''}">${day.day}<br>${day.num}</div>`).join('')}
            ${habits.map(h => `
              <div class="ht-weekly-name">${h.title}</div>
              ${last7.map(day => {
                const isCreated = (!h.createdAt || h.createdAt <= day.date);
                if (!isCreated) return `<div class="ht-weekly-cell"><span style="width:24px; height:24px; display:inline-block;"></span></div>`;
                const isDone = (h.completedDates || []).includes(day.date);
                const isToday = day.date === today;
                let cls = isDone ? (isToday ? 'today-done' : 'done') : (isToday ? 'today-miss' : 'miss');
                return `<div class="ht-weekly-cell"><span class="ht-dot ${cls}">${isDone ? '<i class="fas fa-check" style="font-weight:900;"></i>' : '—'}</span></div>`;
              }).join('')}
            `).join('')}
          </div>
        `;
      }

      const viewLabels = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

      main.innerHTML = `
        <div class="fade-in-up">
          <style>
            .ht-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
            .ht-stats { display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; margin-bottom:24px; }
            .ht-stat-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:16px 20px; text-align:center; }
            .ht-stat-val { font-size:1.6rem; font-weight:800; color:var(--gold-light); }
            .ht-stat-label { font-size:0.72rem; color:var(--text-muted); margin-top:2px; }
            .ht-weekly-grid { display:grid; grid-template-columns: 1fr repeat(7, 40px); gap:0; font-size:0.75rem; align-items:center; }
            .ht-weekly-header { text-align:center; padding:6px 0; color:var(--text-muted); font-weight:600; font-size:0.68rem; }
            .ht-weekly-header.today-col { color:var(--gold-light); }
            .ht-weekly-cell { text-align:center; padding:8px 0; border-top:1px solid var(--border); }
            .ht-weekly-name { padding:8px 10px; border-top:1px solid var(--border); font-weight:500; color:var(--text-primary); display:flex; align-items:center; gap:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .ht-dot { width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.85rem; margin:0 auto; }
            .ht-dot.done { background:#10b981; color:#fff; }
            .ht-dot.miss { background:rgba(239,68,68,0.15); color:#ef4444; }
            .ht-dot.today-done { background:#10b981; color:#fff; }
            .ht-dot.today-miss { background:rgba(239,68,68,0.15); border:2px solid var(--gold); color:#ef4444; }
            .ht-habit-row { background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:16px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
            .ht-habit-left { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
            .ht-habit-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
            .ht-action-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:5px 8px; cursor:pointer; color:var(--text-secondary); font-size:0.72rem; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s; }
            .ht-action-btn:hover { background:var(--bg-tertiary); color:var(--text-primary); }
            .ht-action-btn.danger:hover { border-color:var(--danger); color:var(--danger); }
            .ht-view-select { background:var(--bg-tertiary); border:1px solid var(--border); border-radius:8px; color:var(--text-primary); padding:6px 12px; font-size:0.78rem; font-weight:600; cursor:pointer; }
          </style>

          <!-- Header -->
          <div class="ht-header">
            <div>
              <h2 style="font-size:1.3rem; margin:0 0 4px 0; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                <i class="material-icons-round" style="color:var(--gold);">track_changes</i>Habit Tracker
              </h2>
              <span style="font-size:0.78rem; color:var(--text-muted);">
                <i class="fas fa-calendar-day" style="color:var(--gold-light); margin-right:4px;"></i>
                ${window.getGlobalDateObj().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
              </span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openAddHabitModal()"><i class="fas fa-plus"></i> Add Habit</button>
          </div>

          <!-- Stats Row -->
          <div class="ht-stats">
            <div class="ht-stat-card">
              <div class="ht-stat-val">${done}/${total}</div>
              <div class="ht-stat-label">Today's Completed</div>
            </div>
            <div class="ht-stat-card">
              <div class="ht-stat-val" style="color:#10b981;">${pct}%</div>
              <div class="ht-stat-label">Completion Rate</div>
            </div>
            <div class="ht-stat-card">
              <div class="ht-stat-val" style="color:#f59e0b;">${(() => {
                if (!habits || habits.length === 0) return 0;
                let totalStreak = 0;
                habits.forEach(h => {
                  let s = 0;
                  const d2 = window.getGlobalDateObj();
                  while ((h.completedDates || []).includes(new Date(d2.getTime() - d2.getTimezoneOffset() * 60000).toISOString().split('T')[0])) {
                    s++;
                    d2.setDate(d2.getDate() - 1);
                  }
                  totalStreak += s;
                });
                return totalStreak;
              })()}</div>
              <div class="ht-stat-label">Best Streak 🔥</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="card" style="margin-bottom:20px; padding:16px 20px;">
            <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:6px;">
              <span style="color:var(--text-secondary); font-weight:600;">Daily Progress</span>
              <span style="color:var(--gold-light); font-weight:700;">${pct}%</span>
            </div>
            <div style="height:8px; background:var(--bg-tertiary); border-radius:8px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--gold), #10b981); border-radius:8px; transition:width 0.4s ease;"></div>
            </div>
          </div>

          <!-- Overview Grid with Dropdown -->
          <div class="card" style="margin-bottom:20px; padding:18px 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
              <div class="card-title" style="margin:0;"><i class="material-icons-round">date_range</i>${viewLabels[selectedView]} Overview</div>
              <select class="ht-view-select" onchange="switchHabitView(this.value)">
                <option value="day" ${selectedView === 'day' ? 'selected' : ''}>Day</option>
                <option value="week" ${selectedView === 'week' ? 'selected' : ''}>Week</option>
                <option value="month" ${selectedView === 'month' ? 'selected' : ''}>Month</option>
                <option value="year" ${selectedView === 'year' ? 'selected' : ''}>Year</option>
              </select>
            </div>
            ${gridHtml}
          </div>

          <!-- Habit List with Edit/Delete -->
          <div class="card" style="padding:18px 20px;">
            <div class="card-title" style="margin-bottom:14px;"><i class="material-icons-round">list</i>Manage Habits</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${habits.map(h => {
                const isDone = (h.completedDates || []).includes(today);
                let streak = 0;
                const sd = window.getGlobalDateObj();
                if (isDone) { while ((h.completedDates || []).includes(new Date(sd.getTime() - sd.getTimezoneOffset() * 60000).toISOString().split('T')[0])) { streak++; sd.setDate(sd.getDate()-1); } }
                const totalDone = (h.completedDates || []).length;
                return `
                  <div class="ht-habit-row">
                    <div class="ht-habit-left">
                      <span class="habit-checkbox ${isDone ? 'checked' : ''}" onclick="toggleHabitFull('${h.id}')" style="flex-shrink:0;">
                        ${isDone ? '<i class="fas fa-check" style="font-weight:900;"></i>' : ''}
                      </span>
                      <div style="min-width:0;">
                        <div style="font-weight:600; font-size:0.9rem; ${isDone ? 'text-decoration:line-through; opacity:0.6;' : ''}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.title}</div>
                        <div style="font-size:0.68rem; color:var(--text-muted); display:flex; gap:10px; margin-top:2px;">
                          <span>${totalDone} total completions</span>
                          ${streak > 0 ? '<span style="color:#f59e0b;">🔥 ' + streak + ' day streak</span>' : ''}
                        </div>
                      </div>
                    </div>
                    <div class="ht-habit-actions">
                      <button class="ht-action-btn" onclick="editHabit('${h.id}')" title="Edit"><i class="fas fa-pen"></i> Edit</button>
                      <button class="ht-action-btn danger" onclick="deleteHabit('${h.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
              ${habits.length === 0 ? '<div style="text-align:center; padding:30px; color:var(--text-muted); font-style:italic;"><i class="material-icons-round" style="font-size:2.5rem; display:block; margin-bottom:8px;">add_task</i>No habits yet. Click "Add Habit" to get started!</div>' : ''}
            </div>
          </div>
        </div>
      `;
    });

    window.switchHabitView = function(mode) {
      window._habitViewMode = mode;
      Router.routes['habittracker']();
    };

    window.toggleHabitFull = function(id) {
      const habit = DB.cache.Habits.find(h => h.id === id);
      if (!habit) return;
      if (!habit.completedDates) habit.completedDates = [];
      const today = window.globalSelectedDate;
      const idx = habit.completedDates.indexOf(today);
      if (idx >= 0) {
        habit.completedDates.splice(idx, 1);
      } else {
        habit.completedDates.push(today);
      }
      DB.saveTable('Habits').then(() => {
        const activeHabits = DB.cache.Habits.filter(h => !h.createdAt || h.createdAt <= today);
        const total = activeHabits.length;
        const done = activeHabits.filter(h => (h.completedDates || []).includes(today)).length;
        
        let rewardedDates = [];
        try { rewardedDates = JSON.parse(localStorage.getItem('saas_habit_rewards') || '[]'); } catch(e){}

        if (total > 0 && done === total) {
          if (!rewardedDates.includes(today)) {
            if (window.updateCoins) window.updateCoins(5);
            rewardedDates.push(today);
            localStorage.setItem('saas_habit_rewards', JSON.stringify(rewardedDates));
            showNotification("All habits completed! +5 Coins awarded! 🎉");
          }
        } else {
          if (rewardedDates.includes(today)) {
            if (window.updateCoins) window.updateCoins(-5);
            rewardedDates = rewardedDates.filter(d => d !== today);
            localStorage.setItem('saas_habit_rewards', JSON.stringify(rewardedDates));
            showNotification("Habit unchecked. 5 Coins removed.");
          }
        }

        const cur = Router.currentView;
        if (Router.routes[cur]) Router.routes[cur]();
        else Router.routes['habittracker']();
      });
    };

    window.toggleCustomDropdown = function(el) {
      const menu = el.nextElementSibling;
      document.querySelectorAll('.custom-dropdown-menu').forEach(m => { if(m !== menu) m.classList.remove('show'); });
      menu.classList.toggle('show');
    };
    
    window.toggleCustomDropdownGroup = function(el, event) {
      event.stopPropagation();
      const items = el.nextElementSibling;
      const icon = el.querySelector('.group-chevron');
      if (items.classList.contains('show')) {
        items.classList.remove('show');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        items.classList.add('show');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    };
    
    window.selectCustomOption = function(el, inputId, value, labelText, event) {
      event.stopPropagation();
      const container = el.closest('.custom-dropdown-container');
      const input = container.querySelector('#' + inputId);
      const trigger = container.querySelector('.custom-dropdown-trigger span');
      
      input.value = value;
      trigger.textContent = labelText;
      
      container.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
      
      container.querySelector('.custom-dropdown-menu').classList.remove('show');
    };

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.custom-dropdown-menu').forEach(m => m.classList.remove('show'));
      }
    });

    window.buildProjectDropdownOptions = function(selectedValue = '', inputId = 'assignTo-input') {
      const menuSorted = [...DB.cache.Menu].sort((a,b) => Number(a.order||0) - Number(b.order||0));
      
      let displayValue = '-- No Project (General Note) --';
      if (selectedValue) displayValue = selectedValue;
      
      let html = `<div class="custom-dropdown-container">`;
      html += `<input type="hidden" id="${inputId}" value="${selectedValue}">`;
      html += `<div class="custom-dropdown-trigger" onclick="toggleCustomDropdown(this)"><span>${displayValue}</span> <i class="fas fa-chevron-down"></i></div>`;
      html += `<div class="custom-dropdown-menu">`;
      html += `<div class="custom-dropdown-item main-item ${selectedValue === '' ? 'selected' : ''}" onclick="selectCustomOption(this, '${inputId}', '', '-- No Project (General Note) --', event)">-- No Project (General Note) --</div>`;

      let currentLabel = null;
      let tempGroupItems = '';
      
      menuSorted.forEach(m => {
        if (m.type === 'label') {
          if (currentLabel) {
             html += `<div class="custom-dropdown-group-items">${tempGroupItems}</div></div>`;
          }
          if (m.label !== 'Dashboard' && m.label !== 'Systting') {
            currentLabel = m.label;
            html += `<div class="custom-dropdown-group">`;
            html += `<div class="custom-dropdown-group-header" onclick="toggleCustomDropdownGroup(this, event)">
                        <span><i class="fas fa-folder" style="margin-right:8px; color:var(--gold-light);"></i>${m.label}</span>
                        <i class="fas fa-chevron-down group-chevron" style="transition: transform 0.2s;"></i>
                     </div>`;
            tempGroupItems = `<div class="custom-dropdown-item main-item ${selectedValue === m.label ? 'selected' : ''}" onclick="selectCustomOption(this, '${inputId}', '${m.label}', '${m.label}', event)"><i class="fas fa-cube" style="margin-right:6px; font-size:0.85em;"></i>${m.label} (Main Project)</div>`;
          } else {
            currentLabel = null;
          }
        } else if (m.type === 'link' && currentLabel) {
          tempGroupItems += `<div class="custom-dropdown-item ${selectedValue === m.label ? 'selected' : ''}" onclick="selectCustomOption(this, '${inputId}', '${m.label}', '${m.label}', event)"><i class="fas fa-level-up-alt fa-rotate-90" style="margin-right:6px; color:var(--text-muted); font-size:0.8em;"></i>${m.label}</div>`;
        }
      });
      if (currentLabel) {
        html += `<div class="custom-dropdown-group-items">${tempGroupItems}</div></div>`;
      }
      
      html += `</div></div>`;
      return html;
    };

    window.openAddTaskModal = function() {
      const labelOptions = window.buildProjectDropdownOptions('', 'task-assign');

      const html = `
        <div class="form-group">
          <label>Task Title</label>
          <input type="text" class="form-control" id="task-title" placeholder="e.g. Poster Design">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" id="task-desc" rows="3" placeholder="Task details..."></textarea>
        </div>
        <div class="form-group">
          <label>Time Slot</label>
          <select class="form-control" id="task-slot">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div class="form-group">
          <label>Time</label>
          <input type="text" class="form-control" id="task-time" placeholder="e.g. 7AM to 11PM">
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Priority</label>
            <select class="form-control" id="task-priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="form-group">
            <label>Scheduled Date</label>
            <input type="date" class="form-control" id="task-date" min="${window.globalSelectedDate}" value="${window.globalSelectedDate}">
          </div>
        </div>
        <div class="form-group">
          <label>Assign To Project</label>
          ${labelOptions}
        </div>
      `;
      showModal("Create Planned Task", html, "Add Task", saveTaskEntry);
    };

    window.saveTaskEntry = function() {
      const task = {
        id: DB.uid(),
        title: document.getElementById('task-title').value || 'New Scheduled Task',
        description: document.getElementById('task-desc').value || '',
        time: document.getElementById('task-time').value || '',
        timeSlot: document.getElementById('task-slot').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        assignTo: document.getElementById('task-assign').value || '',
        status: 'pending',
        habits: {}
      };
      
      DB.cache.Tasks.push(task);
      DB.saveTable('Tasks').then(() => {
        showNotification("New routine task added successfully!");
        const cur = Router.currentView;
        if (Router.routes[cur]) Router.routes[cur]();
        else Router.routes['tasks']();
      });
    };

    window.openEditTaskModal = function(id) {
      const task = DB.cache.Tasks.find(t => t.id === id);
      if (!task) return;

      const today = window.globalSelectedDate;
      if (task.date && task.date < today) {
        showNotification("Yesterday's work is locked and cannot be edited.");
        return;
      }

      const labelOptions = window.buildProjectDropdownOptions(task.assignTo, 'edit-task-assign');

      const html = `
        <div class="form-group">
          <label>Task Title</label>
          <input type="text" class="form-control" id="edit-task-title" value="${task.title}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" id="edit-task-desc" rows="3">${task.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Time Slot</label>
          <select class="form-control" id="edit-task-slot">
            <option value="morning" ${task.timeSlot === 'morning' ? 'selected' : ''}>Morning</option>
            <option value="afternoon" ${task.timeSlot === 'afternoon' ? 'selected' : ''}>Afternoon</option>
            <option value="evening" ${task.timeSlot === 'evening' ? 'selected' : ''}>Evening</option>
            <option value="night" ${task.timeSlot === 'night' ? 'selected' : ''}>Night</option>
          </select>
        </div>
        <div class="form-group">
          <label>Time</label>
          <input type="text" class="form-control" id="edit-task-time" value="${task.time || ''}">
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Priority</label>
            <select class="form-control" id="edit-task-priority">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div class="form-group">
            <label>Scheduled Date</label>
            <input type="date" class="form-control" id="edit-task-date" min="${window.globalSelectedDate}" value="${task.date || window.globalSelectedDate}">
          </div>
        </div>
        <div class="form-group">
          <label>Assign To Project</label>
          ${labelOptions}
        </div>
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
          <button class="btn btn-danger" style="width:100%; display:flex; justify-content:center; gap:8px;" onclick="deleteTask('${task.id}'); closeModal();">
            <i class="fas fa-trash"></i> Delete Task
          </button>
        </div>
      `;
      showModal("Edit Task", html, "Save Changes", () => {
        task.title = document.getElementById('edit-task-title').value || task.title;
        task.description = document.getElementById('edit-task-desc').value || '';
        task.time = document.getElementById('edit-task-time').value || '';
        task.timeSlot = document.getElementById('edit-task-slot').value;
        task.priority = document.getElementById('edit-task-priority').value;
        task.date = document.getElementById('edit-task-date').value;
        task.assignTo = document.getElementById('edit-task-assign').value || '';
        DB.saveTable('Tasks').then(() => {
          showNotification("Task updated successfully!");
          const cur = Router.currentView;
          if (Router.routes[cur]) Router.routes[cur]();
          else Router.routes['tasks']();
        });
      });
    };

    window.deleteTask = function(id) {
      const task = DB.cache.Tasks.find(t => t.id === id);
      if (task) {
        const today = window.globalSelectedDate;
        if (task.date && task.date < today) {
          showNotification("Yesterday's work is locked and cannot be deleted.");
          return;
        }
      }
      if(confirm('Are you sure you want to delete this task?')) {
        DB.cache.Tasks = DB.cache.Tasks.filter(t => t.id !== id);
        DB.saveTable('Tasks').then(() => {
          showNotification("Task deleted from database.");
          const cur = Router.currentView;
          if (Router.routes[cur]) Router.routes[cur]();
          else Router.routes['tasks']();
        });
      }
    };
