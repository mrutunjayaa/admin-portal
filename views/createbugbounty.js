// --- VIEW: CREATE BUG BOUNTY PLATFORM ---
Router.register('createbugbounty', () => {
  const main = document.getElementById('main-content-view');
  
  main.innerHTML = `
    <div class="fade-in-up" style="max-width:500px; margin:40px auto;">
      <div class="card" style="padding:30px;">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
          <i class="material-icons-round" style="font-size:2.5rem; color:var(--gold);">bug_report</i>
          <div>
            <h2 style="font-size:1.5rem; color:var(--text-primary);">Add Bug Bounty Platform</h2>
            <span style="font-size:0.85rem; color:var(--text-muted);">Create a new dashboard for a bug bounty program</span>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-secondary);">Platform Name</label>
          <input type="text" id="new-bb-name" placeholder="e.g. Intigriti, YesWeHack, Synack" class="form-control" style="width:100%; padding:12px; background:var(--bg-primary); border:1px solid var(--border-light); color:var(--text-primary); border-radius:8px;" onkeydown="if(event.key === 'Enter') window.submitCreateBugBounty();">
        </div>

        <div style="display:flex; gap:15px; margin-top:30px;">
          <button class="btn" onclick="window.submitCreateBugBounty()" style="flex:1; padding:12px; font-size:1.05rem; background:var(--gold); color:var(--bg-primary); font-weight:600; display:flex; justify-content:center; align-items:center; gap:8px;">
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

window.submitCreateBugBounty = function() {
  const nameInput = document.getElementById('new-bb-name');
  const bbName = nameInput.value.trim();
  const bbTarget = "bb_" + Date.now();
  
  if (!bbName) {
    alert("Please enter a platform name.");
    return;
  }
  
  // Find the label for 'Bug Bounty'
  const bbLabel = DB.cache.Menu.find(m => m.type === 'label' && m.label === 'Bug Bounty');
  if (!bbLabel) {
    alert("Error: 'Bug Bounty' category not found in the menu.");
    return;
  }
  
  const baseOrder = Math.floor(bbLabel.order);
  
  // Find links inside this category
  const bbLinks = DB.cache.Menu.filter(m => Math.floor(m.order) === baseOrder && m.type === 'link');
  const maxOrder = bbLinks.length > 0 ? Math.max(...bbLinks.map(m => m.order)) : baseOrder;
  const newOrder = maxOrder + 0.01;
  
  const newPlatform = {
    id: "m_bb_" + Date.now(),
    type: "link",
    label: bbName,
    icon: "security",
    target: bbTarget,
    adminOnly: "true",
    order: newOrder
  };
  
  DB.cache.Menu.push(newPlatform);
  
  // Initialize the specific data array for this new platform
  DB.cache[bbTarget] = [];
  
  DB.saveTable('Menu').then(() => {
    if(window.showNotification) window.showNotification(bbName + " platform created successfully!");
    
    if (window.rebuildSidebar) window.rebuildSidebar();
    
    // Automatically redirect to the newly created dashboard
    window.location.hash = bbTarget;
  });
};
