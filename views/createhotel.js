// --- VIEW: CREATE NEW HOTEL ---
Router.register('createhotel', () => {
  const main = document.getElementById('main-content-view');
  
  // Security check: Only admins can access this page
  const userRole = localStorage.getItem('saas_user_role') || 'admin';
  if (userRole !== 'admin') {
    main.innerHTML = `<div class="card" style="margin:20px; padding:20px;"><h2 style="color:var(--danger);"><i class="material-icons-round">error</i> Access Denied</h2><p>Only administrators can create new hotels.</p></div>`;
    return;
  }
  
  main.innerHTML = `
    <div class="fade-in-up" style="display:flex; justify-content:center; padding-top:40px;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 30px;">
        <h2 style="margin-bottom: 20px; color: var(--gold); display: flex; align-items: center; gap: 10px; font-size:1.6rem;">
          <i class="material-icons-round" style="font-size:2rem;">add_business</i> Create New Hotel
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 25px; line-height:1.5;">
          Add a new hotel link under the <strong>Hotel With Resturant</strong> category in the sidebar.
        </p>
        
        <div class="form-group" style="margin-bottom: 30px;">
          <label style="font-weight:600; margin-bottom:8px; display:block;">Hotel Name</label>
          <input type="text" id="new-hotel-name" class="form-control" placeholder="e.g. Hotel No 2" style="padding:12px; font-size:1rem;">
        </div>
        
        <div style="display:flex; gap:15px;">
          <button class="btn btn-primary" onclick="submitCreateHotel()" style="flex:1; padding:12px; font-size:1.05rem; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">check_circle</i> Create Hotel
          </button>
          <button class="btn" onclick="window.location.hash='dashboard'" style="flex:1; padding:12px; font-size:1.05rem; background:var(--bg-tertiary); color:var(--text-primary); display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">cancel</i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
});

window.submitCreateHotel = function() {
  const nameInput = document.getElementById('new-hotel-name');
  const hotelName = nameInput.value.trim();
  const hotelTarget = "hotel_" + Date.now();
  
  if (!hotelName) {
    alert("Please enter a hotel name.");
    return;
  }
  
  // Find the label for 'Hotel With Resturant' or 'MS'
  const hwrLabel = DB.cache.Menu.find(m => m.type === 'label' && (m.label === 'Hotel With Resturant' || m.label === 'MS'));
  if (!hwrLabel) {
    alert("Error: 'MS' category not found in the menu.");
    return;
  }
  
  const baseOrder = Math.floor(hwrLabel.order);
  
  // Find links inside this category
  const hwrLinks = DB.cache.Menu.filter(m => Math.floor(m.order) === baseOrder && m.type === 'link');
  const maxOrder = hwrLinks.length > 0 ? Math.max(...hwrLinks.map(m => m.order)) : baseOrder;
  const newOrder = maxOrder + 0.01;
  
  const newHotel = {
    id: "m_h_" + Date.now(),
    type: "link",
    label: hotelName,
    icon: "hotel",
    target: hotelTarget,
    adminOnly: "false",
    order: newOrder
  };
  
  DB.cache.Menu.push(newHotel);
  DB.saveTable('Menu').then(() => {
    if(window.showNotification) showNotification(hotelName + " created successfully!");
    
    if (window.rebuildSidebar) window.rebuildSidebar();
    
    // Automatically redirect to the newly created dashboard
    window.location.hash = hotelTarget;
  });
};
