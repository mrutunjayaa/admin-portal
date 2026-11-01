// --- VIEW: GENERIC TOUR DASHBOARD ---
Router.register('tourdashboard', (hash) => {
  const main = document.getElementById('main-content-view');
  const userRole = localStorage.getItem('saas_user_role') || 'admin';
  
  // Try to find the tour name from the Menu cache
  let tourName = "Tour & Travels Dashboard";
  if (hash) {
    const menuItem = DB.cache.Menu.find(m => m.target.toLowerCase() === hash);
    if (menuItem && menuItem.label) {
      tourName = menuItem.label;
    }
  }

  let deletedCards = [];
  try {
    const raw = localStorage.getItem('saas_deleted_cards_' + hash);
    if (raw) deletedCards = JSON.parse(raw);
  } catch(e){}

  let editedCards = {};
  try {
    const raw = localStorage.getItem('saas_edited_cards_' + hash);
    if (raw) editedCards = JSON.parse(raw);
  } catch(e){}

  // Card renderer helper
  const renderCard = (icon, title, desc, target, isCustom = false) => {
    let finalTitle = title;
    let finalIcon = icon;
    if (editedCards[title]) {
      finalTitle = editedCards[title].title || title;
      finalIcon = editedCards[title].icon || icon;
    }

    if (!isCustom && deletedCards.includes(title)) return '';

    let contextMenu = '';
    if (userRole === 'admin') {
      contextMenu = `
        <div style="position:absolute; top:15px; right:15px; z-index:5;" onclick="window.toggleCardMenu(event, this)">
          <i class="material-icons-round" style="color:var(--text-muted); padding:4px; border-radius:50%; transition:all 0.2s; background:var(--bg-tertiary);">more_vert</i>
          <div class="card-menu-dropdown" style="display:none; position:absolute; right:0; top:100%; background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:8px; padding:5px; box-shadow:0 4px 12px rgba(0,0,0,0.5); min-width:120px; text-align:left;">
            <div style="padding:8px 12px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:0.9rem; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" onclick="event.stopPropagation(); window.editCard('${title}', '${hash}', '${target}', '${finalIcon}')"><i class="material-icons-round" style="font-size:1.1rem;">edit</i> Edit</div>
            <div style="padding:8px 12px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:0.9rem; color:var(--danger); border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" onclick="event.stopPropagation(); window.deleteCard('${title}', '${hash}', '${target}')"><i class="material-icons-round" style="font-size:1.1rem;">delete</i> Delete</div>
          </div>
        </div>
      `;
    }

    const clickAction = target.startsWith('custom_') 
      ? `window.location.hash='${target}'` 
      : `localStorage.setItem('saas_current_tour_parent', '${hash}'); window.location.hash='${target}'`;

    return `
      <div class="card dashboard-card" style="position:relative; cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="${clickAction}">
        ${contextMenu}
        <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">${finalIcon}</i>
        <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">${finalTitle}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">${desc}</p>
      </div>
    `;
  };

  // Load custom pages
  let customPages = [];
  try {
    const raw = localStorage.getItem('saas_tour_custom_pages_' + hash);
    if (raw) customPages = JSON.parse(raw);
  } catch(e){}

  let customCardsHtml = customPages.map(page => renderCard(page.icon, page.title, `Custom page for ${tourName}.`, page.target, true)).join('');

  let createCardHtml = '';
  if (userRole === 'admin') {
    createCardHtml = `
      <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:30px 20px; border: 2px dashed var(--border-light); background: transparent;" onclick="localStorage.setItem('saas_target_tour', '${hash}'); window.location.hash='createtourpage';">
        <i class="material-icons-round" style="font-size:3rem; color:var(--text-muted); margin-bottom:15px;">add_circle_outline</i>
        <h3 style="font-size:1.1rem; font-weight:600; color:var(--text-muted);">Create Page</h3>
      </div>
    `;
  }

  main.innerHTML = `
    <div class="fade-in-up">
      <div class="card" style="padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size:1.5rem; margin-bottom:10px; color:var(--gold); display:flex; align-items:center; gap:8px;">
          <i class="material-icons-round" style="font-size:1.8rem;">commute</i>
          ${tourName} Dashboard
        </h2>
        <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:0;">
          Tour & Travels Operations and Promotional Management.
        </p>
      </div>

      <h3 style="margin-bottom: 16px; color:var(--text-muted); font-size:1.1rem; padding-left:4px;">${tourName}</h3>
      <div class="grid-3">
        ${hash === 'apnatourtravels' ? `
          ${renderCard('travel_explore', 'Ads on Google', 'Manage Google Ads campaigns.', 'tour_googleads')}
          ${renderCard('campaign', 'Meta Ads', 'Manage Facebook & Instagram Ads.', 'tour_metaads')}
          ${renderCard('map', 'Google Map', 'Manage business profile on Google Maps.', 'tour_googlemap')}
          ${renderCard('share', 'Social Media', 'Content calendar & social posts.', 'tour_socialmedia')}
          ${renderCard('web', 'Landing Page', 'Promotional website & funnel analytics.', 'tour_landingpage')}
          ${renderCard('flight_takeoff', 'Travel Promote Site', 'Tripadvisor & Make My Trip listings.', 'tour_promotesite')}
          ${renderCard('restaurant_menu', 'Menu', 'Tour packages and service catalog.', 'tour_menu')}
        ` : ''}
        ${customCardsHtml}
        ${createCardHtml}
      </div>
    </div>
  `;
});
