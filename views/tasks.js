    // --- VIEW: TASKS ---
    Router.register('tasks', () => {
      const main = document.getElementById('main-content-view');
      const slots = ["morning", "afternoon", "evening", "night"];

      window.globalSelectedDate = window.globalSelectedDate || window.globalSelectedDate;
      const selectedDate = window.globalSelectedDate;

      window.changePlannerDate = function(val) {
        window.globalSelectedDate = val;
        Router.routes['tasks']();
      };

      main.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-3">
            <div class="card col-span-2">
              <div class="card-title"><i class="material-icons-round">edit_calendar</i>Weekly Routine Checklist</div>
              <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:0.85rem; color:var(--text-secondary);">Agenda for:</span>
                  <input type="date" id="planner-date" class="form-control" style="padding:4px 8px; font-size:0.85rem; height:auto; width:auto; background:var(--bg-tertiary); border:1px solid var(--border);" value="${selectedDate}" onchange="changePlannerDate(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Create Task</button>
              </div>

              <!-- Time Slots Columns -->
              <div style="display:flex; flex-direction:column; gap:16px;">
                ${slots.map(slot => {
                  const sTasks = DB.cache.Tasks.filter(t => t.timeSlot === slot && (!t.date || t.date === selectedDate));
                  return `
                    <div style="background:var(--bg-secondary); border:1px solid var(--border); padding:14px; border-radius:8px;">
                      <h4 style="text-transform:capitalize; margin-bottom:10px; font-size:0.9rem; color:var(--gold-light); display:flex; align-items:center; gap:8px;">
                        <i class="material-icons-round" style="font-size:1.15rem;">schedule</i>${slot} Routine
                      </h4>
                      <div style="display:flex; flex-direction:column; gap:8px;">
                        ${sTasks.length === 0 ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">No tasks set.</div>` : ''}
                        ${sTasks.map(t => {
                          const isCompleted = (!t.date) ? (t.completedDates || []).includes(selectedDate) : (t.status === 'completed');
                          return `
                          <div class="habit-item" style="margin-bottom:0; flex-direction:column; align-items:stretch; gap:6px;">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                              <div style="display:flex; align-items:center; gap:10px;">
                                <span class="habit-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleChecklistTask('${t.id}')">
                                  ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                                </span>
                                <span style="${isCompleted ? 'text-decoration:line-through; opacity:0.6;' : ''}; font-weight:600;">${t.title}</span>
                              </div>
                              <div style="display:flex; align-items:center; gap:8px;">
                                ${t.assignTo ? `<span class="badge badge-purple" style="font-size:0.65rem;">${t.assignTo}</span>` : ''}
                                <span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}">${t.priority}</span>
                                <button class="toggle-sidebar-btn" onclick="openEditTaskModal('${t.id}')" style="color:var(--text-secondary); padding:2px;"><i class="fas fa-pen"></i></button>
                              </div>
                            </div>
                            ${(t.description || t.time) ? `
                              <div style="padding-left:32px; display:flex; gap:12px; flex-wrap:wrap;">
                                ${t.description ? `<span style="font-size:0.72rem; color:var(--text-muted);"><i class="fas fa-align-left" style="margin-right:4px;"></i>${t.description}</span>` : ''}
                                ${t.time ? `<span style="font-size:0.72rem; color:var(--gold-light);"><i class="fas fa-clock" style="margin-right:4px;"></i>${t.time}</span>` : ''}
                              </div>
                            ` : ''}
                          </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Habits Card -->
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div class="card-title" style="margin:0;"><i class="material-icons-round">track_changes</i>Habit Tracker</div>
                <button class="btn btn-secondary btn-sm" onclick="openAddHabitModal()" style="padding:4px 10px;"><i class="fas fa-plus"></i></button>
              </div>

              <!-- Selected date label -->
              <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <i class="fas fa-calendar-day" style="color:var(--gold-light);"></i>
                Date: <b>${new Date(selectedDate).toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'short', year:'numeric'})}</b>
              </div>

              <!-- Progress bar -->
              ${(() => {
                const habits = DB.cache.Habits || [];
                const total = habits.length;
                const done = habits.filter(h => (h.completedDates || []).includes(selectedDate)).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return `
                  <div style="margin-bottom:14px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-bottom:4px;">
                      <span style="color:var(--text-secondary);">${done}/${total} completed</span>
                      <span style="color:var(--gold-light); font-weight:700;">${pct}%</span>
                    </div>
                    <div style="height:6px; background:var(--bg-tertiary); border-radius:6px; overflow:hidden;">
                      <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--gold), #10b981); border-radius:6px; transition:width 0.4s ease;"></div>
                    </div>
                  </div>
                `;
              })()}

              <div style="display:flex; flex-direction:column; gap:8px;">
                ${(DB.cache.Habits || []).map(h => {
                  const isDone = (h.completedDates || []).includes(selectedDate);
                  // Count streak
                  let streak = 0;
                  const d = window.getGlobalDateObj();
                  if (isDone) {
                    while ((h.completedDates || []).includes(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0])) {
                      streak++;
                      d.setDate(d.getDate() - 1);
                    }
                  }
                  return `
                    <div class="habit-item">
                      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                        <span class="habit-checkbox ${isDone ? 'checked' : ''}" onclick="toggleHabit('${h.id}')">
                          ${isDone ? '<i class="fas fa-check"></i>' : ''}
                        </span>
                        <span style="${isDone ? 'text-decoration:line-through; opacity:0.6;' : ''}; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.title}</span>
                      </div>
                      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                        ${streak > 1 ? `<span style="font-size:0.62rem; color:#f59e0b; font-weight:700;">🔥${streak}d</span>` : ''}
                        <button onclick="editHabit('${h.id}')" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:2px; font-size:0.75rem;" title="Edit habit"><i class="fas fa-pen"></i></button>
                      </div>
                    </div>
                  `;
                }).join('')}
                ${(DB.cache.Habits || []).length === 0 ? '<div style="font-size:0.78rem; color:var(--text-muted); font-style:italic; text-align:center; padding:10px;">No habits configured. Add one above!</div>' : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    window.toggleChecklistTask = function(id) {
      const task = DB.cache.Tasks.find(t => t.id === id);
      if (task) {
        let wasCompleted = false;
        
        // Handle routine vs fixed date tasks
        if (!task.date) {
          const selectedDate = window.globalSelectedDate || window.globalSelectedDate;
          if (!task.completedDates) task.completedDates = [];
          const idx = task.completedDates.indexOf(selectedDate);
          if (idx >= 0) {
            wasCompleted = true;
            task.completedDates.splice(idx, 1);
          } else {
            wasCompleted = false;
            task.completedDates.push(selectedDate);
          }
        } else {
          wasCompleted = task.status === 'completed';
          task.status = wasCompleted ? 'pending' : 'completed';
        }

        DB.saveTable('Tasks').then(() => {
          showNotification(`Task status updated!`);
          if (!wasCompleted) {
            if (window.updateCoins) window.updateCoins(1);
          } else {
            if (window.updateCoins) window.updateCoins(-1);
          }
          const cur = Router.currentView;
          if (Router.routes[cur]) Router.routes[cur]();
          else Router.routes['tasks']();
        });
      }
    };

    window.toggleHabit = function(id) {
      const habit = DB.cache.Habits.find(h => h.id === id);
      if (!habit) return;
      if (!habit.completedDates) habit.completedDates = [];
      const selectedDate = window.globalSelectedDate || window.globalSelectedDate;
      const idx = habit.completedDates.indexOf(selectedDate);
      if (idx >= 0) {
        habit.completedDates.splice(idx, 1);
      } else {
        habit.completedDates.push(selectedDate);
      }
      DB.saveTable('Habits').then(() => {
        const total = DB.cache.Habits.length;
        const done = DB.cache.Habits.filter(h => (h.completedDates || []).includes(selectedDate)).length;
        
        if (total > 0 && done === total) {
          if (localStorage.getItem('saas_habit_reward_date') !== selectedDate) {
            if (window.updateCoins) window.updateCoins(5);
            localStorage.setItem('saas_habit_reward_date', selectedDate);
            showNotification("All habits completed! +5 Coins awarded! 🎉");
          }
        } else {
          if (localStorage.getItem('saas_habit_reward_date') === selectedDate) {
            if (window.updateCoins) window.updateCoins(-5);
            localStorage.removeItem('saas_habit_reward_date');
            showNotification("Habit unchecked. 5 Coins removed.");
          }
        }

        const cur = Router.currentView;
        if (Router.routes[cur]) Router.routes[cur]();
        else Router.routes['tasks']();
      });
    };

    window.deleteHabit = function(id) {
      if (confirm("Remove this habit from your tracker?")) {
        DB.cache.Habits = DB.cache.Habits.filter(h => h.id !== id);
        DB.saveTable('Habits').then(() => {
          showNotification("Habit removed.");
          if (Router.currentView === 'habittracker') Router.routes['habittracker']();
          else Router.routes['tasks']();
        });
      }
    };

    window.openAddHabitModal = function() {
      const html = `
        <div class="form-group">
          <label>Habit Name</label>
          <input type="text" class="form-control" id="new-habit-title" placeholder="e.g. Drink 3L water daily">
        </div>
      `;
      showModal("Add New Habit", html, "Add Habit", () => {
        const title = document.getElementById('new-habit-title').value.trim();
        if (!title) return;
        DB.cache.Habits.push({
          id: DB.uid(),
          title: title,
          createdAt: window.globalSelectedDate || new Date().toISOString().split('T')[0],
          completedDates: []
        });
        DB.saveTable('Habits').then(() => {
          showNotification("New habit added to tracker!");
          if (Router.currentView === 'habittracker') Router.routes['habittracker']();
          else Router.routes['tasks']();
        });
      });
    };

    window.editHabit = function(id) {
      const habit = DB.cache.Habits.find(h => h.id === id);
      if (!habit) return;
      const html = `
        <div class="form-group">
          <label>Habit Name</label>
          <input type="text" class="form-control" id="edit-habit-title" value="${habit.title}">
        </div>
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
          <button class="btn btn-danger" style="width:100%; display:flex; justify-content:center; gap:8px;" onclick="deleteHabit('${habit.id}'); closeModal();">
            <i class="fas fa-trash"></i> Delete Habit
          </button>
        </div>
      `;
      showModal("Edit Habit", html, "Save Changes", () => {
        const newTitle = document.getElementById('edit-habit-title').value.trim();
        if (!newTitle) return;
        habit.title = newTitle;
        DB.saveTable('Habits').then(() => {
          showNotification("Habit updated successfully!");
          if (Router.currentView === 'habittracker') Router.routes['habittracker']();
          else Router.routes['tasks']();
        });
      });
    };
