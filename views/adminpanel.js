    // --- VIEW: ADMIN PANEL ---
    Router.register('adminpanel', () => {
      const main = document.getElementById('main-content-view');
      renderAdminPanel(main);
    });

    window.renderAdminPanel = function(container) {
      const menuList = [...DB.cache.Menu].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      const categories = [];
      let currentCat = null;
      
      menuList.forEach(item => {
        if (item.type === 'label') {
          currentCat = { id: item.id, label: item.label, order: Number(item.order), links: [] };
          categories.push(currentCat);
        } else if (item.type === 'link') {
          if (currentCat) {
            currentCat.links.push(item);
          } else {
            if (!categories.find(c => c.id === 'orphan')) {
              categories.unshift({ id: 'orphan', label: 'Uncategorized Pages', order: 0, links: [] });
            }
            categories[0].links.push(item);
          }
        }
      });
      
      container.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-1" style="margin-bottom: 20px;">
            <div class="card" style="padding: 20px;">
              <h2 style="font-size:1.5rem; margin-bottom:6px;"><i class="material-icons-round">shield</i>Admin Control Panel</h2>
              <p style="color:var(--text-secondary); font-size:0.88rem;">Manage system settings, databases, and edit sidebar navigation links dynamically.</p>
            </div>
          </div>

          <div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-tab-menu" onclick="switchAdminTab('menu')"><i class="fas fa-list"></i> Navigation Menu Manager</button>
            <button class="btn btn-secondary" id="btn-tab-emp" onclick="switchAdminTab('employees')"><i class="fas fa-users"></i> Employee Roster</button>
            <button class="btn btn-secondary" id="btn-tab-sys" onclick="switchAdminTab('system')"><i class="fas fa-info-circle"></i> System Integrity Logs</button>
          </div>

          <!-- Tab 1: Menu Manager Nested Accordion -->
          <div id="tab-admin-menu" style="display:block;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h3 style="font-size:1.1rem; margin:0;"><i class="material-icons-round" style="vertical-align:middle; margin-right:6px;">menu</i>Sidebar Structure Editor</h3>
              <button class="btn btn-success btn-sm" onclick="openCategoryEditModal()"><i class="fas fa-plus"></i> Add New Category</button>
            </div>

            ${categories.map((cat, idx) => {
              return `
                <div class="card" style="margin-bottom: 16px; padding: 0; overflow: visible;">
                  <!-- Category Header row -->
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; background:var(--bg-secondary); cursor:pointer; user-select:none; border-bottom:1px solid var(--border-light);" onclick="toggleAdminCategoryAccord('${cat.id}')">
                    <div style="display:flex; align-items:center; gap:12px;">
                      <i class="material-icons-round" id="accord-chevron-${cat.id}" style="color:var(--text-muted); transition:transform 0.2s;">expand_more</i>
                      <span style="font-weight:700; color:var(--gold-light); text-transform:uppercase; font-size:0.85rem; letter-spacing:0.8px;">${cat.label}</span>
                      <span style="font-size:0.75rem; color:var(--text-muted);">(Order: ${cat.order})</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;" onclick="event.stopPropagation()">
                      <button class="btn btn-secondary btn-sm" onclick="openCategoryEditModal('${cat.id}')" style="padding:4px 8px;"><i class="fas fa-edit"></i> Edit</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${cat.id}')" style="padding:4px 8px;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </div>

                  <!-- Category Links drawer -->
                  <div id="accord-drawer-${cat.id}" style="display:none; padding:20px; background:var(--bg-tertiary);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <h4 style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Page Links in this section</h4>
                      <button class="btn btn-primary btn-sm" style="padding:4px 10px; font-size:0.75rem;" onclick="openLinkEditModal(null, ${cat.order})"><i class="fas fa-plus"></i> Add Page to ${cat.label}</button>
                    </div>

                    ${cat.links.length === 0 ? `
                      <div style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding:15px; border:1px dashed var(--border); border-radius:8px;">
                        No pages inside this section. Click the button above to add one.
                      </div>
                    ` : `
                      <div style="overflow-x:auto;">
                        <table class="table" style="width:100%; font-size:0.82rem;">
                          <thead>
                            <tr>
                              <th style="width:70px;">Order</th>
                              <th>Page Label</th>
                              <th>Icon</th>
                              <th>Route Target</th>
                              <th>Access</th>
                              <th style="text-align:right; width:120px;">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${cat.links.map(link => {
                              const localOrder = Math.round((link.order - cat.order) * 100);
                              return `
                                <tr>
                                  <td style="font-weight:bold;">${localOrder}</td>
                                  <td style="font-weight:600;">${link.label}</td>
                                  <td><i class="material-icons-round" style="font-size:1.1rem; vertical-align:middle; margin-right:4px; color:var(--gold);">${link.icon}</i> <code>${link.icon}</code></td>
                                  <td><code>#${link.target}</code></td>
                                  <td><span class="badge ${link.adminOnly === 'true' ? 'badge-danger' : 'badge-success'}">${link.adminOnly === 'true' ? 'Admin' : 'Everyone'}</span></td>
                                  <td style="text-align:right;">
                                    <button class="btn btn-secondary btn-sm" onclick="openLinkEditModal('${link.id}', ${cat.order})" style="padding:3px 6px; margin-right:4px;"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${link.id}')" style="padding:3px 6px;"><i class="fas fa-trash-alt"></i></button>
                                  </td>
                                </tr>
                              `;
                            }).join('')}
                          </tbody>
                        </table>
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Tab 3: Employee Roster -->
          <div id="tab-admin-emp" class="card" style="display:none;">
            <div class="card-title" style="margin-bottom:14px;"><i class="material-icons-round">people</i>Registered Employees Accounts</div>
            <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px;">
              These staff accounts are loaded from the Google Sheets database. You can manually insert new rows directly in the <b>Employees</b> worksheet to add new employees.
            </p>
            <div style="overflow-x:auto;">
              <table class="table" style="width:100%;">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Password (Secret)</th>
                    <th>Assigned Role</th>
                    <th>Shift Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${(DB.cache.Employees || []).map(emp => `
                    <tr>
                      <td style="font-weight:600;">${emp.name || '-'}</td>
                      <td><code>${emp.username || '-'}</code></td>
                      <td><span style="font-family:monospace; font-size:0.8rem; background:var(--bg-tertiary); padding:2px 6px; border-radius:4px;">${emp.password || '-'}</span></td>
                      <td><span class="badge badge-info">${emp.role || 'Staff'}</span></td>
                      <td>${emp.shift || 'General'}</td>
                      <td>
                        <span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">
                          ${emp.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab 2: System Logs -->
          <div id="tab-admin-sys" class="card" style="display:none;">
            <div class="card-title"><i class="material-icons-round">analytics</i>System Logs & Database Status</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div class="habit-item">
                <span>Database Sync status:</span>
                <span class="badge badge-success">${DB.isGasEnv() ? "Google Sheets Sync Live" : "Local Storage (Standalone)"}</span>
              </div>
              <div class="habit-item">
                <span>Database settings checks:</span>
                <span>Active sheets: 11 worksheets</span>
              </div>
              <div class="habit-item">
                <span>Logged cache items count:</span>
                <span style="font-size:0.8rem; word-break:break-all;">${Object.keys(DB.cache).map(t=>`${t}: ${DB.cache[t].length}`).join(' | ')}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    window.switchAdminTab = function(tab) {
      const menuTab = document.getElementById('tab-admin-menu');
      const empTab = document.getElementById('tab-admin-emp');
      const sysTab = document.getElementById('tab-admin-sys');
      
      const btnMenu = document.getElementById('btn-tab-menu');
      const btnEmp = document.getElementById('btn-tab-emp');
      const btnSys = document.getElementById('btn-tab-sys');
      
      menuTab.style.display = tab === 'menu' ? 'block' : 'none';
      empTab.style.display = tab === 'employees' ? 'block' : 'none';
      sysTab.style.display = tab === 'system' ? 'block' : 'none';
      
      btnMenu.className = tab === 'menu' ? 'btn btn-primary' : 'btn btn-secondary';
      btnEmp.className = tab === 'employees' ? 'btn btn-primary' : 'btn btn-secondary';
      btnSys.className = tab === 'system' ? 'btn btn-primary' : 'btn btn-secondary';
    };

    window.toggleAdminCategoryAccord = function(catId) {
      const drawer = document.getElementById(`accord-drawer-${catId}`);
      const chevron = document.getElementById(`accord-chevron-${catId}`);
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'block' : 'none';
        if (chevron) {
          chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }
    };

    window.openCategoryEditModal = function(id = null) {
      const item = id ? DB.cache.Menu.find(m => m.id === id) : null;
      const html = `
        <div class="form-group">
          <label>Category Display Label</label>
          <input type="text" class="form-control" id="cat-label" value="${item ? item.label : ''}" placeholder="e.g. Main Suite, Mahasuara Tower">
        </div>
        <div class="form-group">
          <label>Sort Order Number</label>
          <input type="number" class="form-control" id="cat-order" value="${item ? Math.floor(Number(item.order)) : (DB.cache.Menu.filter(m=>m.type==='label').length + 1)}" placeholder="e.g. 1">
        </div>
        <input type="hidden" id="cat-id" value="${item ? item.id : ''}">
      `;
      showModal(item ? "Edit Category Header" : "Create New Category Header", html, "Save Category", saveCategoryEntry);
    };

    window.saveCategoryEntry = function() {
      const id = document.getElementById('cat-id').value;
      const label = document.getElementById('cat-label').value.trim() || 'Untitled Section';
      const order = Math.floor(Number(document.getElementById('cat-order').value || 1));
      
      if (id) {
        const item = DB.cache.Menu.find(m => m.id === id);
        if (item) {
          const oldParentOrder = Math.floor(Number(item.order));
          if (oldParentOrder !== order) {
            // Adjust all child links to the new category decimal base
            DB.cache.Menu.forEach(child => {
              if (child.type === 'link' && Math.floor(Number(child.order)) === oldParentOrder) {
                const decimalPart = Number(child.order) - oldParentOrder;
                child.order = order + decimalPart;
              }
            });
          }
          item.label = label;
          item.order = order;
        }
      } else {
        DB.cache.Menu.push({
          id: DB.uid(),
          type: 'label',
          label: label,
          icon: '',
          target: '',
          adminOnly: 'false',
          order: order
        });
      }

      DB.saveTable('Menu').then(() => {
        showNotification("Category header saved.");
        window.rebuildSidebar();
        Router.routes['adminpanel']();
      });
    };

    window.openLinkEditModal = function(id = null, parentCatOrder = 1) {
      const item = id ? DB.cache.Menu.find(m => m.id === id) : null;
      let localOrder = 1;
      
      if (item) {
        localOrder = Math.round((Number(item.order) - parentCatOrder) * 100);
      } else {
        const siblings = DB.cache.Menu.filter(m => m.type === 'link' && Math.floor(Number(m.order)) === parentCatOrder);
        localOrder = siblings.length + 1;
      }

      const html = `
        <div class="form-group">
          <label>Page Name / Link Label</label>
          <input type="text" class="form-control" id="link-label" value="${item ? item.label : ''}" placeholder="e.g. Dashboard, Finance Dashboard">
        </div>
        <div class="form-group">
          <label>Material Icon Code</label>
          <input type="text" class="form-control" id="link-icon" value="${item ? item.icon : 'grid_view'}" placeholder="e.g. hotel, local_taxi">
          <small style="color:var(--text-muted); font-size:0.75rem;">Material Round Icon code. See <a href="https://fonts.google.com/icons" target="_blank" style="color:var(--gold-light);">Google Fonts Icons</a></small>
        </div>
        <div class="form-group">
          <label>Target Route / Hash</label>
          <input type="text" class="form-control" id="link-target" value="${item ? item.target : ''}" placeholder="e.g. dashboard, finance, hotel">
        </div>
        <div class="form-group">
          <label>Admin-Only Access</label>
          <select id="link-admin-only" class="form-control">
            <option value="false" ${item && item.adminOnly === 'false' ? 'selected' : ''}>No (Accessible by Employees)</option>
            <option value="true" ${item && item.adminOnly === 'true' ? 'selected' : ''}>Yes (Admin-Only access)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Sort Order within Category</label>
          <input type="number" class="form-control" id="link-order" value="${localOrder}" placeholder="e.g. 1">
        </div>
        <input type="hidden" id="link-id" value="${item ? item.id : ''}">
        <input type="hidden" id="link-parent-order" value="${parentCatOrder}">
      `;
      showModal(item ? "Edit Page Link" : "Create New Page Link", html, "Save Page Link", saveLinkEntry);
    };

    window.saveLinkEntry = function() {
      const id = document.getElementById('link-id').value;
      const parentCatOrder = Number(document.getElementById('link-parent-order').value);
      const label = document.getElementById('link-label').value.trim() || 'Untitled Link';
      const icon = document.getElementById('link-icon').value.trim() || 'grid_view';
      const target = document.getElementById('link-target').value.trim().toLowerCase();
      const adminOnly = document.getElementById('link-admin-only').value;
      const localOrder = Number(document.getElementById('link-order').value || 1);
      
      if (!target) {
        alert("Target route/hash is required!");
        return;
      }

      const calculatedOrder = parentCatOrder + (localOrder / 100);

      if (id) {
        const item = DB.cache.Menu.find(m => m.id === id);
        if (item) {
          item.label = label;
          item.icon = icon;
          item.target = target;
          item.adminOnly = adminOnly;
          item.order = calculatedOrder;
        }
      } else {
        DB.cache.Menu.push({
          id: DB.uid(),
          type: 'link',
          label: label,
          icon: icon,
          target: target,
          adminOnly: adminOnly,
          order: calculatedOrder
        });
      }

      DB.saveTable('Menu').then(() => {
        showNotification("Page link saved.");
        window.rebuildSidebar();
        Router.routes['adminpanel']();
      });
    };

    window.deleteMenuItem = function(id) {
      if (confirm("Are you sure you want to delete this sidebar navigation item?")) {
        DB.cache.Menu = DB.cache.Menu.filter(m => m.id !== id);
        DB.saveTable('Menu').then(() => {
          showNotification("Sidebar navigation item removed.");
          window.rebuildSidebar();
          Router.routes['adminpanel']();
        });
      }
    };

    window.buildSidebarHtml = function(userRole, menuList, currentHash) {
      let sidebarNavHtml = '';
      const categories = [];
      let currentCat = null;

      menuList.forEach(item => {
        if (item.type === 'label') {
          currentCat = { label: item.label, links: [] };
          categories.push(currentCat);
        } else if (item.type === 'link') {
          if (currentCat) {
            currentCat.links.push(item);
          } else {
            currentCat = { label: 'Uncategorized', links: [item] };
            categories.unshift(currentCat);
          }
        }
      });

      categories.forEach(cat => {
        const visibleLinks = cat.links.filter(link => !(userRole !== 'admin' && link.adminOnly === 'true'));
        
        // Show category if it has visible links, OR if user is admin and it's a dynamic category
        const isDynamicCategory = ['MS', 'Hotel With Resturant', 'Tour and Travels', 'Bug Bounty', 'Sport Academy', 'Canva'].includes(cat.label);
        if (visibleLinks.length === 0 && !(userRole === 'admin' && isDynamicCategory)) return;

        let labelHtml = cat.label;
        if (cat.label === 'MS' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-ms-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="localStorage.setItem('saas_target_sidebar_category', 'MS'); window.location.hash='createsidebarlink'" title="Add Item">add</i>
                       </div>`;
        } else if (cat.label === 'Hotel With Resturant' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-hotel-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="window.location.hash='createhotel'" title="Add Hotel">add</i>
                       </div>`;
        } else if (cat.label === 'Tour and Travels' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-tour-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="window.location.hash='createtour'" title="Add Tour & Travels">add</i>
                       </div>`;
        } else if (cat.label === 'Bug Bounty' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-bugbounty-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="window.location.hash='createbugbounty'" title="Add Bug Bounty Platform">add</i>
                       </div>`;
        } else if (cat.label === 'Sport Academy' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-sport-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="window.location.hash='createsportacademy'" title="Add Sport Academy">add</i>
                       </div>`;
        } else if (cat.label === 'Canva' && userRole === 'admin') {
          labelHtml = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                         <span>${cat.label}</span>
                         <i class="material-icons-round add-canva-btn" style="font-size:16px; cursor:pointer; color:var(--gold);" onclick="localStorage.setItem('saas_target_sidebar_category', 'Canva'); window.location.hash='createsidebarlink'" title="Add Item">add</i>
                       </div>`;
        }

        sidebarNavHtml += `<div class="nav-label">${labelHtml}</div>`;
        visibleLinks.forEach(link => {
          sidebarNavHtml += `
            <a href="#${link.target}" class="sidebar-nav-item ${`#${link.target}` === currentHash ? 'active' : ''}">
              <div style="display:flex; align-items:center; gap:12px;">
                <i class="material-icons-round">${link.icon}</i>
                <span>${link.label}</span>
              </div>
            </a>
          `;
        });

      });

      return sidebarNavHtml;
    };

    window.toggleSidebarCategory = function(headerEl) {
      const wrapper = headerEl.parentElement;
      const linksEl = wrapper.querySelector('.sidebar-category-links');
      const isExpanded = linksEl.classList.contains('expanded');
      
      document.querySelectorAll('.sidebar-category-links').forEach(el => {
        el.classList.remove('expanded');
        el.style.maxHeight = '0';
        el.previousElementSibling.classList.remove('active-header');
      });

      if (!isExpanded) {
        linksEl.classList.add('expanded');
        linksEl.style.maxHeight = '600px';
        headerEl.classList.add('active-header');
      }
    };

    window.rebuildSidebar = function() {
      const userRole = localStorage.getItem('saas_user_role') || 'admin';
      const menuList = [...DB.cache.Menu].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      const sidebarNavHtml = window.buildSidebarHtml(userRole, menuList, window.location.hash);

      const navEl = document.querySelector('.sidebar-nav');
      if (navEl) {
        navEl.innerHTML = sidebarNavHtml;
      }
    };

    // --- GLOBAL SEARCH ENGINE ---
    window.handleGlobalSearch = function(e) {
      if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase();
        if (!query) return;

        // Search through notes, tasks, finance
        const matchedNotes = DB.cache.Notes.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));
        const matchedTasks = DB.cache.Tasks.filter(t => t.title.toLowerCase().includes(query));
        
        let resultMsg = `Search Results for "${query}":\n\n`;
        if (matchedNotes.length > 0) {
          resultMsg += `--- MATCHED NOTES ---\n` + matchedNotes.map(n => `- ${n.title}`).join('\n') + '\n\n';
        }
        if (matchedTasks.length > 0) {
          resultMsg += `--- MATCHED TASKS ---\n` + matchedTasks.map(t => `- ${t.title} (${t.status})`).join('\n') + '\n\n';
        }
        
        if (matchedNotes.length === 0 && matchedTasks.length === 0) {
          alert(`No entries found matching "${query}"`);
        } else {
          alert(resultMsg);
        }
      }
    };

    // --- BOOTSTRAP APP ---