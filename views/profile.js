    // --- VIEW: PROFILE ---
    Router.register('profile', () => {
      const main = document.getElementById('main-content-view');
      const userRole = localStorage.getItem('saas_user_role') || 'admin';
      
      // Ensure defaults in UserProfile cache
      if (!DB.cache.UserProfile || Object.keys(DB.cache.UserProfile).length === 0) {
        DB.cache.UserProfile = {
          firstName: "Mrutunjaya",
          lastName: "Mahasuara",
          phone: "9876543210",
          email: "mrutunjaya@example.com",
          address: "Bhubaneswar, Odisha",
          website: "https://mrutunjaya.dev",
          socials: {
            facebook: "https://facebook.com/mrutunjaya",
            twitter: "https://twitter.com/mrutunjaya",
            linkedin: "https://linkedin.com/in/mrutunjaya",
            instagram: "https://instagram.com/mrutunjaya"
          },
          notes: "Cybersecurity engineer, bug hunter, and software developer. Currently managing Mahasuara Tower operations.",
          activityLog: [
            { timestamp: new Date().toISOString(), action: "Profile Viewed", details: "Profile settings page accessed" }
          ]
        };
        DB.saveAllLocal();
      }

      const p = DB.cache.UserProfile;
      const initials = ((p.firstName || 'A').charAt(0) + (p.lastName || 'U').charAt(0)).toUpperCase();
      const displayName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Profile User';

      // Log activity if last was > 5 mins ago
      const lastLog = p.activityLog && p.activityLog[0];
      const timeDiffMin = lastLog ? (new Date() - new Date(lastLog.timestamp)) / 60000 : 999;
      if (timeDiffMin > 5) {
        p.activityLog.unshift({
          timestamp: new Date().toISOString(),
          action: "Profile Accessed",
          details: `Viewed by ${localStorage.getItem('saas_user_username') || 'current user'}`
        });
        DB.saveTable('UserProfile');
      }

      main.innerHTML = `
        <div class="fade-in-up profile-dashboard">
          <style>
            .profile-header-card {
              display: flex;
              gap: 24px;
              background: var(--bg-secondary);
              border: 1px solid var(--border);
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 24px;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .profile-avatar-wrap {
              width: 90px;
              height: 90px;
              border-radius: 50%;
              background: var(--gold-alpha);
              color: var(--gold-light);
              font-size: 2.2rem;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid var(--gold);
              flex-shrink: 0;
              box-shadow: 0 0 15px rgba(212, 175, 55, 0.15);
            }
            .profile-basic-info h2 {
              font-size: 1.5rem;
              font-weight: 700;
              margin: 0 0 6px 0;
              color: var(--text-primary);
            }
            .profile-details-row {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              font-size: 0.82rem;
              color: var(--text-secondary);
            }
            .profile-details-row span {
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .social-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .activity-timeline {
              display: flex;
              flex-direction: column;
              gap: 14px;
              max-height: 350px;
              overflow-y: auto;
              padding-right: 6px;
            }
            .activity-item {
              display: flex;
              gap: 12px;
              position: relative;
            }
            .activity-item::before {
              content: '';
              position: absolute;
              left: 7px;
              top: 18px;
              bottom: -18px;
              width: 1px;
              background: var(--border);
            }
            .activity-item:last-child::before {
              display: none;
            }
            .activity-dot {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: var(--bg-tertiary);
              border: 2px solid var(--gold);
              flex-shrink: 0;
              display: inline-block;
              z-index: 1;
            }
            .activity-content {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .activity-time {
              font-size: 0.7rem;
              color: var(--text-muted);
            }
            .activity-title {
              font-size: 0.82rem;
              font-weight: 600;
              color: var(--text-primary);
            }
            .activity-details {
              font-size: 0.75rem;
              color: var(--text-secondary);
            }
          </style>

          <!-- Top Header Card -->
          <div class="profile-header-card">
            <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
              <div class="profile-avatar-wrap">${initials}</div>
              <div class="profile-basic-info">
                <h2>${displayName}</h2>
                <div class="profile-details-row">
                <button class="btn btn-secondary btn-sm" style="padding:4px 10px;"><i class="fas fa-plus"></i> Notes</button>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div class="history-card-item" style="padding:10px; margin:0; flex-direction:row; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-glass-water" style="color:#3b82f6;"></i> <b>8 Cups</b> - per day</span>
                </div>
                <div class="history-card-item" style="padding:10px; margin:0; flex-direction:row; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-mug-hot" style="color:#f59e0b;"></i> <b>3 Cups</b> - per day</span>
                </div>
                <div class="history-card-item" style="padding:10px; margin:0; flex-direction:row; align-items:center; gap:8px;">
                  <i class="fas fa-clock" style="color:var(--gold-light);"></i>
                  <span style="font-size:0.8rem; font-weight:600;">Intermittent fasting.</span>
                </div>
                <div class="history-card-item" style="padding:10px; margin:0; flex-direction:row; align-items:center; gap:8px;">
                  <i class="fas fa-cubes" style="color:var(--danger);"></i>
                  <span style="font-size:0.8rem; font-weight:600;">Table sugar , Daily Avg 3 / 6</span>
                </div>
                <div class="history-card-item" style="padding:10px; margin:0; flex-direction:row; align-items:center; gap:8px;">
                  <i class="fas fa-cheese" style="color:var(--warning);"></i>
                  <span style="font-size:0.8rem; font-weight:600;">Lactose,Beans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Calendar Active Month/Year State
    let calCurrentMonth = new Date().getMonth();
    let calCurrentYear = new Date().getFullYear();
