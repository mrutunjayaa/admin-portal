// --- VIEW: CUSTOM DYNAMIC PAGE ---
Router.register('custompage', (hash) => {
  const main = document.getElementById('main-content-view');
  
  // Find the custom page details from localStorage
  let pageTitle = "Custom Page";
  let pageIcon = "web";
  let parentName = "";
  let parentHash = "dashboard";

  // Scan localStorage for saas_hotel_custom_pages_* and saas_tour_custom_pages_*
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('saas_hotel_custom_pages_') || key.startsWith('saas_tour_custom_pages_')) {
      try {
        const pages = JSON.parse(localStorage.getItem(key));
        const foundPage = pages.find(p => p.target === hash);
        if (foundPage) {
          pageTitle = foundPage.title;
          pageIcon = foundPage.icon || "web";
          
          // Extract parent hash
          if (key.startsWith('saas_hotel_custom_pages_')) {
            parentHash = key.replace('saas_hotel_custom_pages_', '');
            const menuItem = DB.cache.Menu.find(m => m.target.toLowerCase() === parentHash);
            parentName = menuItem ? menuItem.label : (parentHash === 'hotelno1' ? 'Hotel No 1' : 'Hotel Dashboard');
          } else if (key.startsWith('saas_tour_custom_pages_')) {
            parentHash = key.replace('saas_tour_custom_pages_', '');
            const menuItem = DB.cache.Menu.find(m => m.target.toLowerCase() === parentHash);
            parentName = menuItem ? menuItem.label : (parentHash === 'apnatourtravels' ? 'Apna tour travels' : 'Tour Dashboard');
          }
          break;
        }
      } catch (e) {}
    }
  }

  // Fallback: Check if it's a standalone sidebar link (like Canva/Dashboard custom pages)
  if (pageTitle === "Custom Page") {
    const menuItem = DB.cache.Menu.find(m => m.target === hash);
    if (menuItem) {
      pageTitle = menuItem.label;
      pageIcon = menuItem.icon || "web";
      
      // Find parent category
      const menuSorted = [...DB.cache.Menu].sort((a,b) => Number(a.order||0) - Number(b.order||0));
      const idx = menuSorted.indexOf(menuSorted.find(m => m.id === menuItem.id));
      for (let i = idx - 1; i >= 0; i--) {
        if (menuSorted[i].type === 'label') {
          parentName = menuSorted[i].label;
          parentHash = 'dashboard'; // Generic fallback for sidebar
          break;
        }
      }
    }
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
          <i class="material-icons-round" style="font-size:4rem;">${pageIcon}</i>
        </div>
        
        <h2 style="font-size:2rem; margin-bottom:15px; color:var(--text-primary);">
          ${pageTitle}
        </h2>
        
        <p style="color:var(--text-secondary); font-size:1.1rem; max-width:600px; margin-bottom:30px; line-height:1.6;">
          This is a newly created custom page for <strong>${parentName}</strong>. 
          The dashboard tools and integrations for this section can be configured here.
        </p>

        <div style="padding:20px; border:1px dashed var(--border-light); border-radius:12px; background:var(--bg-tertiary); color:var(--text-muted); display:inline-block;">
          <i class="material-icons-round" style="vertical-align:middle; margin-right:5px;">construction</i>
          Page configuration is pending.
        </div>
      </div>
    </div>
  `;
});
