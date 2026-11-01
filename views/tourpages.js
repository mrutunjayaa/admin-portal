// --- VIEW: SPECIFIC TOUR PAGES ---
const tourPageMetadata = {
  'googleads': { title: 'Ads on Google', icon: 'travel_explore' },
  'metaads': { title: 'Meta Ads', icon: 'campaign' },
  'googlemap': { title: 'Google Map', icon: 'map' },
  'socialmedia': { title: 'Social Media', icon: 'share' },
  'landingpage': { title: 'Landing Page', icon: 'web' },
  'promotesite': { title: 'Travel Promote Site', icon: 'flight_takeoff' },
  'menu': { title: 'Menu', icon: 'restaurant_menu' }
};

Object.keys(tourPageMetadata).forEach(pageKey => {
  Router.register('tour_' + pageKey, (hash) => {
    const main = document.getElementById('main-content-view');
    const meta = tourPageMetadata[pageKey];
    
    // Find parent dashboard to go back to
    const parentHash = localStorage.getItem('saas_current_tour_parent') || 'apnatourtravels';
    let parentName = "Tour Dashboard";
    if (parentHash === 'apnatourtravels') {
      parentName = "Apna tour travels";
    } else {
      const menuItem = DB.cache.Menu.find(m => m.target.toLowerCase() === parentHash);
      if (menuItem) parentName = menuItem.label;
    }

    main.innerHTML = `
      <div class="fade-in-up">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom: 20px;">
          <button class="btn" style="background:var(--bg-tertiary); color:var(--text-primary); padding:10px 15px; display:flex; align-items:center; gap:5px; border:1px solid var(--border-light);" onclick="window.location.hash='${parentHash}'">
            <i class="material-icons-round">arrow_back</i> Back to ${parentName}
          </button>
        </div>

        <div class="card" style="padding: 40px; text-align:center; min-height: 60vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <div style="background:rgba(212, 175, 55, 0.1); color:var(--gold); border-radius:50%; width:100px; height:100px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
            <i class="material-icons-round" style="font-size:4rem;">${meta.icon}</i>
          </div>
          
          <h2 style="font-size:2rem; margin-bottom:15px; color:var(--text-primary);">
            ${meta.title}
          </h2>
          
          <p style="color:var(--text-secondary); font-size:1.1rem; max-width:600px; margin-bottom:30px; line-height:1.6;">
            This is the dedicated management page for <strong>${meta.title}</strong> operations under <strong>${parentName}</strong>.
            You can collaborate and perform specific client work here.
          </p>

          <div style="padding:20px; border:1px dashed var(--border-light); border-radius:12px; background:var(--bg-tertiary); color:var(--text-muted); display:inline-block;">
            <i class="material-icons-round" style="vertical-align:middle; margin-right:5px;">construction</i>
            Client workspace configuration is pending.
          </div>
        </div>
      </div>
    `;
  });
});
