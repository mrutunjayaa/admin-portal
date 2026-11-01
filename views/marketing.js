    // Dynamic registrations for new custom views
    [
      { route: 'socialpost', title: 'Social Media Post Planner', desc: 'Schedule and manage social media updates across your channels.' },
      { route: 'stories', title: 'Social Stories Manager', desc: 'Design, schedule, and review visual stories for Instagram and Facebook.' },
      { route: 'socialstrategy', title: 'Social Media Strategy & Scope', desc: 'Outline keywords, targeted audience groups, and content calendars.' },
      { route: 'socialreport', title: 'Social Media Analytics Report', desc: 'Performance analytics, click-through rates, and engagement logs.' },
      { route: 'googleads', title: 'Google Ads Campaigns Manager', desc: 'Track search ads keywords, CPC rates, ad budgets, and target regions.' },
      { route: 'metaads', title: 'Meta Ads Manager', desc: 'Configure and monitor Meta pixel events, ad campaigns, and custom audience sets.' },
      { route: 'googlemap', title: 'Google Map Optimization', desc: 'Manage local SEO, Google My Business listings, and map visibility.' },
      { route: 'socialmedia', title: 'Social Media Campaigns', desc: 'Manage Tour and Travels social media presence and engagements.' },
      { route: 'landingpage', title: 'Landing Page Builder', desc: 'Design and track conversions on Tour and Travel landing pages.' },
      { route: 'tripadvisor', title: 'Tripadvisor Promotions', desc: 'Manage reviews, respond to customers, and promote listings on Tripadvisor.' },
      { route: 'makemytrip', title: 'Make My Trip Integrations', desc: 'Track bookings, listings, and visibility on Make My Trip.' },
      { route: 'tourmenu', title: 'Tour & Travels Menu', desc: 'Configure tour packages, pricing menus, and travel itineraries.' },
      { route: 'videoediting', title: 'Canva Video Editing Studio', desc: 'Video production, trims, animations, templates, and video resizing.' },
      { route: 'postediting', title: 'Canva Social Post Designer', desc: 'Graphics editor, canvas sizing, background removal, and asset downloads.' },
      { route: 'bannerediting', title: 'Canva Banner Maker', desc: 'Website banners, display ads banners, and custom resolution templates.' },
      { route: 'menuediting', title: 'Canva Menu Creator', desc: 'Restaurant digital menus, board menus, and seasonal printable menus.' },
      { route: 'cardediting', title: 'Canva Visiting Card Designer', desc: 'Business cards, custom layout prints, logo sizing, and typography scopes.' }
    ].forEach(view => {
      Router.register(view.route, () => {
        const main = document.getElementById('main-content-view');

        // Find the parent label category for this route
        const menuItem = DB.cache.Menu.find(m => m.type === 'link' && m.target === view.route);
        let parentLabel = '';
        if (menuItem) {
          const menuSorted = [...DB.cache.Menu].sort((a,b) => Number(a.order||0) - Number(b.order||0));
          const idx = menuSorted.indexOf(menuSorted.find(m => m.id === menuItem.id));
          for (let i = idx - 1; i >= 0; i--) {
            if (menuSorted[i].type === 'label') {
              parentLabel = menuSorted[i].label;
              break;
            }
          }
        }

        // Get tasks assigned to this parent label or the specific sub-project
        const todayStr = window.globalSelectedDate;
        const assignedTasks = (parentLabel || menuItem) ? DB.cache.Tasks.filter(t => (t.assignTo === parentLabel || (menuItem && t.assignTo === menuItem.label)) && (!t.date || t.date === todayStr)) : [];

        const taskListHtml = assignedTasks.length > 0 ? assignedTasks.map(t => `
          <div style="background:var(--bg-tertiary); border:1px solid var(--border); border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="habit-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleChecklistTask('${t.id}')">
                  ${t.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                </span>
                <span style="font-weight:600; font-size:0.9rem; ${t.status === 'completed' ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.title}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}">${t.priority}</span>
                <button class="toggle-sidebar-btn" onclick="openEditTaskModal('${t.id}')" style="color:var(--text-secondary); padding:2px;"><i class="fas fa-pen"></i></button>
              </div>
            </div>
            <div style="padding-left:32px; display:flex; gap:14px; flex-wrap:wrap; font-size:0.75rem; color:var(--text-muted);">
              ${t.description ? `<span><i class="fas fa-align-left" style="margin-right:4px;"></i>${t.description}</span>` : ''}
              ${t.time ? `<span style="color:var(--gold-light);"><i class="fas fa-clock" style="margin-right:4px;"></i>${t.time}</span>` : ''}
              ${t.date ? `<span><i class="fas fa-calendar" style="margin-right:4px;"></i>${t.date}</span>` : ''}
              ${t.timeSlot ? `<span style="text-transform:capitalize;"><i class="fas fa-sun" style="margin-right:4px;"></i>${t.timeSlot}</span>` : ''}
            </div>
          </div>
        `).join('') : `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem; font-style:italic;"><i class="material-icons-round" style="font-size:2rem; display:block; margin-bottom:8px;">inbox</i>No tasks assigned to ${parentLabel || 'this project'} yet.</div>`;

        main.innerHTML = `
          <div class="fade-in-up">
            <div class="card" style="padding: 24px;">
              <h2 style="font-size:1.5rem; margin-bottom:10px; color:var(--gold); display:flex; align-items:center; gap:8px;">
                <i class="material-icons-round" style="font-size:1.8rem;">design_services</i>
                ${view.title}
              </h2>
              <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:20px; line-height:1.5;">
                ${view.desc}
              </p>
              
              <!-- Premium Mock Interface for Interactive Feeling -->
              <div style="background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:12px; padding:30px; text-align:center; margin-top:20px; border-style:dashed;">
                <i class="material-icons-round" style="font-size:4rem; color:var(--text-muted); margin-bottom:12px; display:inline-block;">cloud_done</i>
                <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:6px;">Workspace Live Connection</h3>
                <p style="color:var(--text-muted); font-size:0.8rem; max-width:400px; margin:0 auto 16px;">
                  This interface is connected to the database workspace cache. Ready to synchronize details.
                </p>
                <button class="btn btn-primary" onclick="showNotification('Database module synced successfully!')">Sync Module Workspace</button>
              </div>
            </div>

            <!-- Assigned Tasks Section -->
            <div class="card" style="padding:24px; margin-top:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div class="card-title" style="margin:0;"><i class="material-icons-round">assignment</i>Assigned Tasks ${parentLabel ? '— ' + parentLabel : ''}</div>
                <span class="badge" style="background:rgba(212,175,55,0.15); color:var(--gold-light); font-size:0.75rem;">${assignedTasks.length} task${assignedTasks.length !== 1 ? 's' : ''}</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${taskListHtml}
              </div>
            </div>
          </div>
        `;
      });
    });
