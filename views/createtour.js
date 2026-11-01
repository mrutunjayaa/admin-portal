// --- VIEW: CREATE NEW TOUR & TRAVELS ---
Router.register('createtour', () => {
  const main = document.getElementById('main-content-view');
  
  // Security check: Only admins can access this page
  const userRole = localStorage.getItem('saas_user_role') || 'admin';
  if (userRole !== 'admin') {
    main.innerHTML = `<div class="card" style="margin:20px; padding:20px;"><h2 style="color:var(--danger);"><i class="material-icons-round">error</i> Access Denied</h2><p>Only administrators can create new agencies.</p></div>`;
    return;
  }
  
  main.innerHTML = `
    <div class="fade-in-up" style="display:flex; justify-content:center; padding-top:40px;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 30px;">
        <h2 style="margin-bottom: 20px; color: var(--gold); display: flex; align-items: center; gap: 10px; font-size:1.6rem;">
          <i class="material-icons-round" style="font-size:2rem;">add_location_alt</i> Create New Tour Agency
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 25px; line-height:1.5;">
          Add a new agency link under the <strong>Tour and Travels</strong> category in the sidebar.
        </p>
        
        <div class="form-group" style="margin-bottom: 30px;">
          <label style="font-weight:600; margin-bottom:8px; display:block;">Agency Name</label>
          <input type="text" id="new-tour-name" class="form-control" placeholder="e.g. Dream Vacations" style="padding:12px; font-size:1rem;">
        </div>
        
        <div style="display:flex; gap:15px;">
          <button class="btn btn-primary" onclick="submitCreateTour()" style="flex:1; padding:12px; font-size:1.05rem; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">check_circle</i> Create Agency
          </button>
          <button class="btn" onclick="window.location.hash='dashboard'" style="flex:1; padding:12px; font-size:1.05rem; background:var(--bg-tertiary); color:var(--text-primary); display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">cancel</i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
});

window.submitCreateTour = function() {
  const nameInput = document.getElementById('new-tour-name');
  const tourName = nameInput.value.trim();
  const tourTarget = "tour_" + Date.now();
  
  if (!tourName) {
    alert("Please enter an agency name.");
    return;
  }
  
  // Find the label for 'Tour and Travels' or 'MS'
  const ttLabel = DB.cache.Menu.find(m => m.type === 'label' && (m.label === 'Tour and Travels' || m.label === 'MS'));
  if (!ttLabel) {
    alert("Error: 'MS' category not found in the menu.");
    return;
  }
  
  const baseOrder = Math.floor(ttLabel.order);
  
  // Find links inside this category
  const ttLinks = DB.cache.Menu.filter(m => Math.floor(m.order) === baseOrder && m.type === 'link');
  const maxOrder = ttLinks.length > 0 ? Math.max(...ttLinks.map(m => m.order)) : baseOrder;
  const newOrder = maxOrder + 0.01;
  
  const newTour = {
    id: "m_t_" + Date.now(),
    type: "link",
    label: tourName,
    icon: "commute",
    target: tourTarget,
    adminOnly: "false",
    order: newOrder
  };
  
  DB.cache.Menu.push(newTour);
  DB.saveTable('Menu').then(() => {
    if(window.showNotification) showNotification(tourName + " created successfully!");
    
    if (window.rebuildSidebar) window.rebuildSidebar();
    
    // Automatically redirect to the newly created dashboard
    window.location.hash = tourTarget;
  });
};
