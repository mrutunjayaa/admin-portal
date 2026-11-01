// --- VIEW: APNA TOUR & TRAVELS ---
Router.register('apnatourtravels', () => {
  const main = document.getElementById('main-content-view');

  main.innerHTML = `
    <div class="fade-in-up">
      <div class="card" style="padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size:1.5rem; margin-bottom:10px; color:var(--gold); display:flex; align-items:center; gap:8px;">
          <i class="material-icons-round" style="font-size:1.8rem;">commute</i>
          Apna Tour Travels
        </h2>
        <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:0;">
          Manage all operations, promotions, and packages for Apna Tour Travels.
        </p>
      </div>

      <div class="grid-3">
        <!-- 1. Ads on Google -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='googleads'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">campaign</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Ads on Google</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Manage Google Ads and search campaigns.</p>
        </div>

        <!-- 2. Meta Ads -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='metaads'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">ads_click</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Meta Ads</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Facebook & Instagram Ad campaigns.</p>
        </div>

        <!-- 3. Google Map -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='googlemap'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">map</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Google Map</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">GMB profile, reviews, and local SEO.</p>
        </div>

        <!-- 4. Social Media -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='socialmedia'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">share</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Social Media</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Manage organic social media presence.</p>
        </div>

        <!-- 5. Landing Page -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='landingpage'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">web</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Landing Page</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Optimize landing pages for conversion.</p>
        </div>

        <!-- 6. Travel Promote Site -->
        <div class="card" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:20px;">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:10px;">flight</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Travel Promote Site</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">Promote packages on major platforms.</p>
          <div style="display:flex; gap:10px; width:100%;">
            <button class="btn btn-secondary" style="flex:1; padding:8px 5px; font-size:0.8rem;" onclick="event.stopPropagation(); window.location.hash='tripadvisor'">Tripadvisor</button>
            <button class="btn btn-secondary" style="flex:1; padding:8px 5px; font-size:0.8rem;" onclick="event.stopPropagation(); window.location.hash='makemytrip'">Make my Trip</button>
          </div>
        </div>

        <!-- 7. Menu -->
        <div class="card" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; padding:30px 20px;" onclick="window.location.hash='tourmenu'">
          <i class="material-icons-round" style="font-size:3rem; color:var(--gold); margin-bottom:15px;">restaurant_menu</i>
          <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Menu</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Tour packages, itineraries, and pricing.</p>
        </div>
      </div>
    </div>
  `;
});
