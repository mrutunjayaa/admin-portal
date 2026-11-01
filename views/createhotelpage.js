// --- VIEW: CREATE CUSTOM HOTEL PAGE ---
Router.register('createhotelpage', () => {
  const main = document.getElementById('main-content-view');
  const userRole = localStorage.getItem('saas_user_role') || 'admin';
  const targetHotelHash = localStorage.getItem('saas_target_hotel');
  
  if (userRole !== 'admin') {
    main.innerHTML = `<div class="card" style="margin:20px; padding:20px;"><h2 style="color:var(--danger);"><i class="material-icons-round">error</i> Access Denied</h2></div>`;
    return;
  }
  
  if (!targetHotelHash) {
    main.innerHTML = `<div class="card" style="margin:20px; padding:20px;"><h2 style="color:var(--danger);"><i class="material-icons-round">error</i> Error: No target hotel selected.</h2></div>`;
    return;
  }

  // Get hotel name
  let hotelName = "Hotel";
  if (targetHotelHash === 'hotelno1') {
    hotelName = "Hotel No 1";
  } else {
    const menuItem = DB.cache.Menu.find(m => m.target.toLowerCase() === targetHotelHash);
    if (menuItem) hotelName = menuItem.label;
  }

  main.innerHTML = `
    <div class="fade-in-up" style="display:flex; justify-content:center; padding-top:40px;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 30px;">
        <h2 style="margin-bottom: 20px; color: var(--gold); display: flex; align-items: center; gap: 10px; font-size:1.6rem;">
          <i class="material-icons-round" style="font-size:2rem;">note_add</i> Create Custom Page
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 25px; line-height:1.5;">
          Add a new custom page dashboard inside <strong>${hotelName}</strong>.
        </p>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight:600; margin-bottom:8px; display:block;">Page Name</label>
          <input type="text" id="new-page-name" class="form-control" placeholder="e.g. Marketing, HR" style="padding:12px; font-size:1rem;">
        </div>
        
        <div class="form-group" style="margin-bottom: 30px;">
          <label style="font-weight:600; margin-bottom:8px; display:block;">Select an Icon</label>
          <div id="icon-picker-grid" style="display:flex; flex-wrap:wrap; gap:10px; max-height: 150px; overflow-y:auto; padding:10px; background:var(--bg-primary); border:1px solid var(--border-light); border-radius:8px;">
            ${(window.MATERIAL_ICONS || ['web']).map(icon => `
              <div class="icon-option ${icon === 'web' ? 'selected' : ''}" onclick="window.selectIcon(this, '${icon}')" style="cursor:pointer; padding:8px; border-radius:6px; display:flex; justify-content:center; align-items:center; border: 2px solid ${icon === 'web' ? 'var(--gold)' : 'transparent'}; background: ${icon === 'web' ? 'rgba(212,175,55,0.1)' : 'transparent'}; transition:all 0.2s;" title="${icon}">
                <i class="material-icons-round" style="font-size:1.5rem; color:${icon === 'web' ? 'var(--gold)' : 'var(--text-secondary)'};">${icon}</i>
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="new-page-icon" value="web">
        </div>
        
        <div style="display:flex; gap:15px;">
          <button class="btn btn-primary" onclick="submitCreateHotelPage('${targetHotelHash}')" style="flex:1; padding:12px; font-size:1.05rem; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">check_circle</i> Create Page
          </button>
          <button class="btn" onclick="window.location.hash='${targetHotelHash}'" style="flex:1; padding:12px; font-size:1.05rem; background:var(--bg-tertiary); color:var(--text-primary); display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">cancel</i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
});

window.selectIcon = function(el, iconName) {
  document.querySelectorAll('.icon-option').forEach(opt => {
    opt.style.border = '2px solid transparent';
    opt.style.background = 'transparent';
    opt.classList.remove('selected');
    opt.querySelector('i').style.color = 'var(--text-secondary)';
  });
  el.style.border = '2px solid var(--gold)';
  el.style.background = 'rgba(212,175,55,0.1)';
  el.classList.add('selected');
  el.querySelector('i').style.color = 'var(--gold)';
  document.getElementById('new-page-icon').value = iconName;
};

window.submitCreateHotelPage = function(targetHotelHash) {
  const nameInput = document.getElementById('new-page-name');
  const iconInput = document.getElementById('new-page-icon');
  const pageName = nameInput.value.trim();
  const pageIcon = iconInput.value.trim() || 'web';
  
  if (!pageName) {
    alert("Please enter a page name.");
    return;
  }
  
  let customPages = [];
  try {
    const raw = localStorage.getItem('saas_hotel_custom_pages_' + targetHotelHash);
    if (raw) customPages = JSON.parse(raw);
  } catch(e){}
  
  customPages.push({
    title: pageName,
    icon: pageIcon,
    target: "custom_" + Date.now()
  });
  
  localStorage.setItem('saas_hotel_custom_pages_' + targetHotelHash, JSON.stringify(customPages));
  
  if(window.showNotification) showNotification(pageName + " created successfully!");
  
  // Go back to the hotel dashboard
  window.location.hash = targetHotelHash;
  Router.handleRouting();
};
