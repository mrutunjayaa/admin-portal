// --- VIEW: CREATE SIDEBAR LINK ---
Router.register('createsidebarlink', () => {
  const main = document.getElementById('main-content-view');
  
  const targetCategory = localStorage.getItem('saas_target_sidebar_category') || 'Canva';

  const iconList = window.MATERIAL_ICONS || ['web', 'image', 'movie', 'design_services', 'analytics', 'bar_chart', 'people', 'settings', 'campaign', 'assignment', 'build', 'category', 'cloud', 'computer', 'dashboard', 'extension', 'face', 'favorite', 'home', 'language', 'lightbulb', 'lock', 'pets', 'print', 'public', 'schedule', 'search', 'shopping_cart', 'star', 'store', 'timeline', 'visibility', 'work'];

  main.innerHTML = `
    <div class="fade-in-up" style="max-width:500px; margin:40px auto;">
      <div class="card" style="padding:30px;">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
          <i class="material-icons-round" style="font-size:2.5rem; color:var(--gold);">note_add</i>
          <div>
            <h2 style="font-size:1.5rem; color:var(--text-primary);">Add Custom Page</h2>
            <span style="font-size:0.85rem; color:var(--text-muted);">Create a new page for this ${targetCategory} dashboard</span>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-secondary); text-transform:uppercase; font-weight:600;">Page Title</label>
          <input type="text" id="new-link-title" placeholder="e.g. Google Ads, SEO Analytics" class="form-control" style="width:100%; padding:12px; background:var(--bg-primary); border:1px solid var(--border-light); color:var(--text-primary); border-radius:8px;">
        </div>
        
        <div class="form-group" style="margin-bottom: 30px;">
          <label style="font-weight:600; margin-bottom:8px; display:block; text-transform:uppercase; font-size:0.9rem; color:var(--text-secondary);">Select an Icon</label>
          <div id="icon-picker-grid" style="display:flex; flex-wrap:wrap; gap:10px; max-height: 150px; overflow-y:auto; padding:10px; background:var(--bg-primary); border:1px solid var(--border-light); border-radius:8px;">
            ${iconList.map(icon => `
              <div class="icon-option ${icon === 'web' ? 'selected' : ''}" onclick="window.selectIcon(this, '${icon}')" style="cursor:pointer; padding:8px; border-radius:6px; display:flex; justify-content:center; align-items:center; border: 2px solid ${icon === 'web' ? 'var(--gold)' : 'transparent'}; background: ${icon === 'web' ? 'rgba(212,175,55,0.1)' : 'transparent'}; transition:all 0.2s;" title="${icon}">
                <i class="material-icons-round" style="font-size:1.5rem; color:${icon === 'web' ? 'var(--gold)' : 'var(--text-secondary)'};">${icon}</i>
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="new-page-icon" value="web">
        </div>

        <div style="display:flex; gap:15px; margin-top:30px;">
          <button class="btn" onclick="submitCreateSidebarLink()" style="flex:1; padding:12px; font-size:1.05rem; background:var(--gold); color:var(--bg-primary); font-weight:600; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">add_circle</i> Create
          </button>
          <button class="btn" onclick="window.location.hash='dashboard'" style="flex:1; padding:12px; font-size:1.05rem; background:var(--bg-tertiary); color:var(--text-primary); display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">cancel</i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
});

window.submitCreateSidebarLink = function() {
  const title = document.getElementById('new-link-title').value.trim();
  const icon = document.getElementById('new-page-icon').value.trim() || 'web';
  const targetCategory = localStorage.getItem('saas_target_sidebar_category') || 'MS';

  if (!title) {
    if (window.showNotification) window.showNotification("Title is required.", "danger");
    return;
  }

  // Create unique hash
  const hashVal = 'custom_' + title.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
  
  // Find category in Menu
  const categoryItem = DB.cache.Menu.find(m => m.type === 'label' && (m.label === targetCategory || m.label === 'MS'));
  let orderBase = categoryItem ? Math.floor(Number(categoryItem.order || 0)) : 3;
  
  // Find highest existing order under this category
  const links = DB.cache.Menu.filter(m => m.type === 'link' && Math.floor(Number(m.order || 0)) === orderBase);
  let newOrder = orderBase + 0.01;
  if (links.length > 0) {
    const maxOrder = Math.max(...links.map(l => Number(l.order || 0)));
    newOrder = maxOrder + 0.01;
  }

  const newLink = {
    id: DB.uid(),
    type: "link",
    label: title,
    icon: icon,
    target: hashVal,
    adminOnly: "false",
    order: newOrder
  };

  DB.cache.Menu.push(newLink);
  
  DB.saveTable('Menu').then(() => {
    if (window.showNotification) window.showNotification("Custom link created successfully!", "success");
    if (window.updateCoins) window.updateCoins(1);
    
    if (window.rebuildSidebar) window.rebuildSidebar();
    window.location.hash = hashVal;
  });
};
