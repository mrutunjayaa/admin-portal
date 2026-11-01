// --- VIEW: CREATE SPORT ACADEMY PAGE ---
Router.register('createsportacademypage', () => {
  const main = document.getElementById('main-content-view');
  
  // Determine which sport academy dashboard triggered this
  const targetParent = localStorage.getItem('saas_target_sport') || 'sport_default';

  // Use the global MATERIAL_ICONS array or fallback to a basic list
  const iconList = window.MATERIAL_ICONS || ['web'];

  main.innerHTML = `
    <div class="fade-in-up" style="max-width:500px; margin:40px auto;">
      <div class="card" style="padding:30px;">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
          <i class="material-icons-round" style="font-size:2.5rem; color:var(--gold);">note_add</i>
          <div>
            <h2 style="font-size:1.5rem; color:var(--text-primary);">Add Custom Page</h2>
            <span style="font-size:0.85rem; color:var(--text-muted);">Create a new page for this Sport Academy dashboard</span>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-size:0.9rem; color:var(--text-secondary);">Page Title</label>
          <input type="text" id="new-page-title" placeholder="e.g. Google Ads, SEO Analytics" class="form-control" style="width:100%; padding:12px; background:var(--bg-primary); border:1px solid var(--border-light); color:var(--text-primary); border-radius:8px;">
        </div>

        <div class="form-group" style="margin-bottom: 30px;">
          <label style="font-weight:600; margin-bottom:8px; display:block;">Select an Icon</label>
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
          <button class="btn" onclick="window.submitCreateSportAcademyPage('${targetParent}')" style="flex:1; padding:12px; font-size:1.05rem; background:var(--gold); color:var(--bg-primary); font-weight:600; display:flex; justify-content:center; align-items:center; gap:8px;">
            <i class="material-icons-round" style="font-size:1.2rem;">add_circle</i> Create
          </button>
          <button class="btn" onclick="window.location.hash='${targetParent}'" style="flex:1; padding:12px; font-size:1.05rem; background:var(--bg-tertiary); color:var(--text-primary); display:flex; justify-content:center; align-items:center; gap:8px;">
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

window.submitCreateSportAcademyPage = function(targetParent) {
  const title = document.getElementById('new-page-title').value.trim();
  const icon = document.getElementById('new-page-icon').value.trim();
  const target = "custom_" + Date.now();
  
  if (!title) {
    alert("Please enter a page title.");
    return;
  }
  
  const parentKey = 'saas_sport_custom_pages_' + targetParent;
  let customPages = [];
  try {
    const raw = localStorage.getItem(parentKey);
    if (raw) customPages = JSON.parse(raw);
  } catch(e){}

  customPages.push({ title, icon, target });
  localStorage.setItem(parentKey, JSON.stringify(customPages));

  if (window.showNotification) window.showNotification(title + " page created successfully!");
  
  window.location.hash = targetParent;
};
