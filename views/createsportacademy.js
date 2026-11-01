// --- VIEW: CREATE SPORT ACADEMY ---
Router.register('createsportacademy', () => {
  const main = document.getElementById('main-content-view');
  
  main.innerHTML = `
    <div class="fade-in-up" style="max-width:500px; margin:40px auto;">
      <div class="card" style="padding:30px;">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
          <i class="material-icons-round" style="font-size:2.5rem; color:var(--gold);">sports_cricket</i>
          <div>
            <h2 style="font-size:1.5rem; color:var(--text-primary);">Add Sport Academy</h2>
            <span style="font-size:0.85rem; color:var(--text-muted);">Create a new dashboard for a Sport Academy</span>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-secondary);">Academy Name</label>
          <input type="text" id="new-sa-name" placeholder="e.g. Cricket Academy, Football Club" class="form-control" style="width:100%; padding:12px; background:var(--bg-primary); border:1px solid var(--border-light); color:var(--text-primary); border-radius:8px;" onkeydown="if(event.key === 'Enter') window.submitCreateSportAcademy();">
        </div>

        <div style="display:flex; gap:15px; margin-top:30px;">
          <button class="btn" onclick="window.submitCreateSportAcademy()" style="flex:1; padding:12px; font-size:1.05rem; background:var(--gold); color:var(--bg-primary); font-weight:600; display:flex; justify-content:center; align-items:center; gap:8px;">
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

window.submitCreateSportAcademy = function() {
  const nameInput = document.getElementById('new-sa-name');
  const saName = nameInput.value.trim();
  const saTarget = "sport_" + Date.now();
  
  if (!saName) {
    alert("Please enter an academy name.");
    return;
  }
  
  // Find the label for 'Sport Academy' or 'MS'
  const saLabel = DB.cache.Menu.find(m => m.type === 'label' && (m.label === 'Sport Academy' || m.label === 'MS'));
  if (!saLabel) {
    alert("Error: 'MS' category not found in the menu.");
    return;
  }
  
  const baseOrder = Math.floor(saLabel.order);
  
  // Find links inside this category
  const saLinks = DB.cache.Menu.filter(m => Math.floor(m.order) === baseOrder && m.type === 'link');
  const maxOrder = saLinks.length > 0 ? Math.max(...saLinks.map(m => m.order)) : baseOrder;
  const newOrder = maxOrder + 0.01;
  
  const newAcademy = {
    id: "m_sa_" + Date.now(),
    type: "link",
    label: saName,
    icon: "sports_cricket",
    target: saTarget,
    adminOnly: "false",
    order: newOrder
  };
  
  DB.cache.Menu.push(newAcademy);
  
  // Initialize the specific data array for this new academy
  DB.cache[saTarget] = [];
  
  DB.saveTable('Menu').then(() => {
    if(window.showNotification) window.showNotification(saName + " created successfully!");
    
    if (window.rebuildSidebar) window.rebuildSidebar();
    
    // Automatically redirect to the newly created dashboard
    window.location.hash = saTarget;
  });
};
