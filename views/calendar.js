    // --- VIEW: CALENDAR ---
    Router.register('calendar', () => {
      const main = document.getElementById('main-content-view');
      
      // Ensure defaults in cache
      let changed = false;
      if (!DB.cache.CalendarLegend) {
        DB.cache.CalendarLegend = {
          "blue": "Shift A",
          "red": "Shift B",
          "green": "Shift C",
          "orange": "Weekly Leave",
          "yellow": "Maintenance",
          "purple": "Training"
        };
        changed = true;
      }
      if (!DB.cache.CalendarEvents) {
        DB.cache.CalendarEvents = {
          "2023-07-02": ["orange"],
          "2023-07-04": ["blue"],
          "2023-07-05": ["blue"],
          "2023-07-07": ["green"],
          "2023-07-11": ["blue", "red"],
          "2023-07-12": ["blue", "red"],
          "2023-07-14": ["green"],
          "2023-07-16": ["orange"],
          "2023-07-18": ["blue"],
          "2023-07-19": ["blue"],
          "2023-07-21": ["red", "green", "red"],
          "2023-07-23": ["orange"],
          "2023-07-25": ["blue"],
          "2023-07-26": ["blue"],
          "2023-07-27": ["red"],
          "2023-07-28": ["red"]
        };
        changed = true;
      }
      if (changed) {
        DB.saveAllLocal();
      }

      // Render Calendar View
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      
      const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
      // Adjust first day for Monday start (0: Mon, 1: Tue, ... 6: Sun)
      const blanks = (firstDay === 0) ? 6 : (firstDay - 1);
      const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
      
      // Calculate previous month days to fill blanks
      const prevMonthYear = calCurrentMonth === 0 ? calCurrentYear - 1 : calCurrentYear;
      const prevMonth = calCurrentMonth === 0 ? 11 : calCurrentMonth - 1;
      const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

      let blanksHtml = '';
      for (let i = blanks - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        blanksHtml += `<div class="cal-cell other-month" style="opacity: 0.2; min-height:85px; border:1px solid var(--border); padding:6px; background:var(--bg-tertiary);"><span>${day}</span></div>`;
      }

      let daysHtml = '';
      const colorMap = {
        blue: '#2563eb', // Royal Blue
        red: '#dc2626',  // Red
        green: '#16a34a', // Green
        orange: '#ea580c', // Orange
        yellow: '#ca8a04', // Yellow/Gold
        purple: '#7c3aed'  // Purple
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const activeMarkers = DB.cache.CalendarEvents[dateStr] || [];
        
        let isToday = day === new Date().getDate() && 
                      calCurrentMonth === new Date().getMonth() && 
                      calCurrentYear === new Date().getFullYear();

        const hasOrange = activeMarkers.includes('orange');
        const otherMarkers = activeMarkers.filter(c => c !== 'orange');

        daysHtml += `
          <div class="cal-cell ${isToday ? 'today' : ''}" onclick="openCalendarDateModal('${dateStr}')" style="position:relative; min-height:85px; display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; border:${isToday ? '2px solid var(--primary)' : '1px solid var(--border)'}; padding:6px; background:${isToday ? 'rgba(0, 255, 170, 0.05)' : 'var(--bg-tertiary)'}; cursor:pointer; transition:background 0.2s; border-radius: 6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <span style="font-weight:${isToday ? '900' : '700'}; font-size:0.85rem; color:${isToday ? 'var(--primary)' : 'var(--text-primary)'};">${day} ${isToday ? '(Today)' : ''}</span>
              ${hasOrange ? `<div style="width:14px; height:14px; background:${colorMap.orange}; border-radius:3px;" title="${DB.cache.CalendarLegend.orange}"></div>` : '<div></div>'}
            </div>
            
            <!-- Other Color Squares aligned as flex rows at the bottom -->
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; justify-content:center; align-items:center; width:100%;">
              ${otherMarkers.map(color => `
                <div style="width:14px; height:14px; background:${colorMap[color] || color}; border-radius:3px;" title="${DB.cache.CalendarLegend[color] || color}"></div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Calculate trailing blanks to complete 7-col grid rows
      const totalCells = blanks + daysInMonth;
      const trailingBlanks = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
      let trailingHtml = '';
      for (let day = 1; day <= trailingBlanks; day++) {
        trailingHtml += `<div class="cal-cell other-month" style="opacity: 0.2; min-height:85px; border:1px solid var(--border); padding:6px; background:var(--bg-tertiary);"><span>${day}</span></div>`;
      }

      main.innerHTML = `
        <div class="fade-in-up" style="display:grid; grid-template-columns: 280px 1fr; gap:20px; align-items:start;">
          <!-- Left: Legend & Tracker Panel -->
          <div class="card" style="padding:18px; display:flex; flex-direction:column; gap:16px;">
            <h3 class="card-title" style="margin:0;"><i class="material-icons-round">palette</i>Color Tracking Legend</h3>
            <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">Customize labels below to define what each color tracks on your calendar.</p>
            
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${Object.keys(DB.cache.CalendarLegend).map(color => `
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="width:16px; height:16px; background:${colorMap[color]}; border-radius:4px; flex-shrink:0; display:inline-block; border:1px solid rgba(255,255,255,0.1);"></span>
                  <input type="text" class="form-control" style="margin:0; padding:6px 10px; font-size:0.8rem; height:auto; background:var(--bg-secondary); border:1px solid var(--border);" value="${DB.cache.CalendarLegend[color]}" onchange="updateCalendarLegendLabel('${color}', this.value)" placeholder="Label name">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Interactive Calendar Grid -->
          <div class="card" style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
              <h2 style="font-size:1.25rem; font-weight:700; color:var(--gold-light); display:flex; align-items:center; gap:8px; margin:0;">
                <i class="material-icons-round" style="color:var(--gold);">calendar_today</i>
                ${monthNames[calCurrentMonth]} ${calCurrentYear}
              </h2>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="changeCalendarMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="setCalendarToCurrentMonth()">Today</button>
                <button class="btn btn-secondary btn-sm" onclick="changeCalendarMonth(1)"><i class="fas fa-chevron-right"></i></button>
              </div>
            </div>

            <!-- Calendar Days Header -->
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; text-align:center; margin-bottom:8px;">
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Mo</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Tu</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">We</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Th</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Fr</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sa</div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Su</div>
            </div>

            <!-- Grid Cells -->
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px;">
              ${blanksHtml}
              ${daysHtml}
              ${trailingHtml}
            </div>
          </div>
        </div>
      `;
    });

    // Helper functions
    window.changeCalendarMonth = function(offset) {
      calCurrentMonth += offset;
      if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear += 1;
      } else if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear -= 1;
      }
      Router.routes['calendar']();
    };

    window.setCalendarToCurrentMonth = function() {
      calCurrentMonth = new Date().getMonth();
      calCurrentYear = new Date().getFullYear();
      Router.routes['calendar']();
    };

    window.updateCalendarLegendLabel = function(color, value) {
      if (!DB.cache.CalendarLegend) DB.cache.CalendarLegend = {};
      DB.cache.CalendarLegend[color] = value;
      DB.saveTable('CalendarLegend').then(() => {
        showNotification(`Legend for ${color} updated!`);
      });
    };

    window.openCalendarDateModal = function(dateStr) {
      const activeColors = DB.cache.CalendarEvents[dateStr] || [];
      const colorMap = {
        blue: '#2563eb',
        red: '#dc2626',
        green: '#16a34a',
        orange: '#ea580c',
        yellow: '#ca8a04',
        purple: '#7c3aed'
      };

      const modalBody = `
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:14px;">Select the color trackers active for <b>${dateStr}</b>:</p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${Object.keys(DB.cache.CalendarLegend).map(color => {
            const occurrences = activeColors.filter(c => c === color).length;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="width:14px; height:14px; background:${colorMap[color]}; border-radius:3px; display:inline-block;"></span>
                  <span style="font-size:0.82rem; font-weight:600;">${DB.cache.CalendarLegend[color]}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="adjustColorCount('${dateStr}', '${color}', -1)">-</button>
                  <span id="marker-count-${color}" style="font-size:0.82rem; font-weight:700; width:16px; text-align:center;">${occurrences}</span>
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="adjustColorCount('${dateStr}', '${color}', 1)">+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:16px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="window.globalSelectedDate='${dateStr}'; Router.routes['tasks'](); closeModal();">
          <i class="fas fa-calendar-check"></i> Open Daily Planner for ${dateStr}
        </button>
      `;

      showModal(`Manage Markers — ${dateStr}`, modalBody, "Save Markers", () => saveCalendarDateMarkers(dateStr));
    };

    // Keep track of counts inside the modal temp state
    let tempDateMarkers = {};
    window.adjustColorCount = function(dateStr, color, delta) {
      if (!tempDateMarkers[dateStr]) {
        tempDateMarkers[dateStr] = [...(DB.cache.CalendarEvents[dateStr] || [])];
      }
      
      if (delta > 0) {
        if (tempDateMarkers[dateStr].filter(c => c === color).length < 3) {
          tempDateMarkers[dateStr].push(color);
        }
      } else {
        const index = tempDateMarkers[dateStr].indexOf(color);
        if (index > -1) {
          tempDateMarkers[dateStr].splice(index, 1);
        }
      }
      
      const newCount = tempDateMarkers[dateStr].filter(c => c === color).length;
      document.getElementById(`marker-count-${color}`).innerText = newCount;
    };

    window.saveCalendarDateMarkers = function(dateStr) {
      if (tempDateMarkers[dateStr] !== undefined) {
        DB.cache.CalendarEvents[dateStr] = tempDateMarkers[dateStr];
        delete tempDateMarkers[dateStr];
      }
      
      DB.saveTable('CalendarEvents').then(() => {
        showNotification(`Markers saved for ${dateStr}!`);
        hideModal();
        Router.routes['calendar']();
      });
    };
