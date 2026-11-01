    // --- VIEW: SETTINGS ---
    Router.register('settings', () => {
      const main = document.getElementById('main-content-view');
      const themeVal = DB.cache.Settings.find(s => s.key === "theme")?.value || 'dark';
      const currency = DB.cache.Settings.find(s => s.key === "currency")?.value || 'INR';
      const userRole = localStorage.getItem('saas_user_role') || 'admin';
      const adminEmail = DB.cache.Settings.find(s => s.key === "admin_username")?.value || 'official.mrutunjaya@gmail.com';
      const adminPass = DB.cache.Settings.find(s => s.key === "admin_password")?.value || 'Mrutunjaya@782';
      const is2FA = DB.cache.Settings.find(s => s.key === "2fa_enabled")?.value !== 'false';

      main.innerHTML = `
        <div class="fade-in-up" style="max-width: 600px; margin: 0 auto;">
          <div class="card">
            <div class="card-title"><i class="material-icons-round">settings</i>Preferences Settings</div>
            
            ${userRole === 'admin' ? `
              <div class="form-group" style="margin-top:18px;">
                <label style="font-weight:600;">Primary Currency Code</label>
                <select id="setting-currency" onchange="updateCurrencySetting()" class="form-control" style="background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border);">
                  <option value="INR" ${currency === 'INR' ? 'selected' : ''}>INR (₹) Rupees</option>
                  <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD ($) Dollars</option>
                </select>
              </div>

              <div class="form-group" style="margin-top:18px;">
                <label style="font-weight:600;">Admin Login Email Address</label>
                <input type="email" class="form-control" id="setting-email" value="${adminEmail}" placeholder="admin@example.com" style="background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border);">
                <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="updateEmailSetting()"><i class="fas fa-envelope" style="margin-right:5px;"></i>Update Email</button>
              </div>

              <div class="form-group" style="margin-top:18px;">
                <label style="font-weight:600;">Admin Login Password</label>
                <div style="position:relative;">
                  <input type="password" class="form-control" id="setting-pass" value="${adminPass}" style="background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border); padding-right:40px;">
                  <i class="fas fa-eye-slash" id="toggle-setting-pass" onclick="togglePasswordVisibility('setting-pass', 'toggle-setting-pass')" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-muted);"></i>
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="updatePasswordSetting()"><i class="fas fa-key" style="margin-right:5px;"></i>Update Password</button>
              </div>

              <!-- Two-Factor Authentication (2FA Email OTP) Setting -->
              <div class="form-group" style="margin-top:22px; padding:18px; border-radius:14px; background:var(--bg-tertiary); border:1px solid var(--border-light);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                  <div>
                    <label style="font-weight:700; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                      <i class="fas fa-shield-alt" style="color:#10b981; font-size:1.15rem;"></i> Two-Factor Authentication (Email 2FA)
                    </label>
                    <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Require 6-digit email verification code when logging in</span>
                  </div>
                  <select id="setting-2fa-status" style="padding:8px 14px; border-radius:8px; font-weight:700; background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border); cursor:pointer;" onchange="toggle2FASetting()">
                    <option value="true" ${is2FA ? 'selected' : ''}>Enabled</option>
                    <option value="false" ${!is2FA ? 'selected' : ''}>Disabled</option>
                  </select>
                </div>
                <div style="margin-top:12px; font-size:0.76rem; color:var(--text-muted); line-height:1.4; border-top:1px solid var(--border); padding-top:10px;">
                  <i class="fas fa-info-circle" style="color:#10b981; margin-right:4px;"></i>
                  Jab 2FA <b>Enabled</b> hoga, tab login ke dauran <b>${adminEmail}</b> par 6-digit security code bheja jayega jise daal kar aap login kar sakenge.
                </div>

                <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border);">
                  <label style="font-size:0.8rem; font-weight:600; display:block; margin-bottom:4px;">Google Apps Script Web App URL (Optional for Local Mode)</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" class="form-control" id="setting-gas-url" value="${DB.cache.Settings.find(s=>s.key==='gas_webapp_url')?.value || ''}" placeholder="https://script.google.com/macros/s/.../exec" style="font-size:0.82rem; background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border);">
                    <button class="btn btn-secondary btn-sm" onclick="saveGasUrlSetting()"><i class="fas fa-link" style="margin-right:4px;"></i>Save URL</button>
                  </div>
                  <small style="color:var(--text-muted); font-size:0.72rem; display:block; margin-top:6px;"><i class="fas fa-check-circle" style="color:#10b981; margin-right:4px;"></i> Connected to Google Apps Script for live 2FA email dispatch.</small>
                </div>
              </div>

              <div style="margin-top: 24px; border-top:1px solid var(--border); padding-top:18px;">
                <button class="btn btn-danger" style="width:100%;" onclick="resetDatabaseCache()">Reset Database Cache</button>
              </div>
            ` : `
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:20px; padding-top:10px; border-top:1px solid var(--border-light);">
                Some options are restricted by your system administrator.
              </div>
            `}
          </div>
        </div>
      `;
    });

    window.toggleThemeSetting = function() {
      const isLight = document.getElementById('theme-toggle').checked;
      const themeVal = isLight ? 'light' : 'dark';
      
      const set = DB.cache.Settings.find(s => s.key === "theme");
      if (set) set.value = themeVal;
      
      DB.saveTable('Settings').then(() => {
        applyTheme();
        showNotification(`Theme changed to ${themeVal}`);
      });
    };

    window.toggleThemeGlobal = function() {
      const currentTheme = DB.cache.Settings.find(s => s.key === "theme")?.value || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      const set = DB.cache.Settings.find(s => s.key === "theme");
      if (set) set.value = newTheme;
      
      DB.saveTable('Settings').then(() => {
        applyTheme();
        showNotification(`Theme changed to ${newTheme}`);
        if (Router.currentView === 'settings') {
          Router.routes['settings']();
        }
      });
    };

    window.updateCurrencySetting = function() {
      const val = document.getElementById('setting-currency').value;
      const set = DB.cache.Settings.find(s => s.key === "currency");
      if (set) set.value = val;
      
      DB.saveTable('Settings').then(() => {
        showNotification(`Base currency updated: ${val}`);
      });
    };

    window.updateEmailSetting = function() {
      const val = document.getElementById('setting-email').value.trim();
      if (!val) {
        showNotification("Admin email cannot be empty!");
        return;
      }
      let set = DB.cache.Settings.find(s => s.key === "admin_username");
      if (set) {
        set.value = val;
      } else {
        DB.cache.Settings.push({ key: "admin_username", value: val });
      }
      DB.saveTable('Settings').then(() => {
        showNotification(`Admin email updated to: ${val}`);
      });
    };

    window.updatePasswordSetting = function() {
      const val = document.getElementById('setting-pass').value;
      if (!val) {
        showNotification("Password cannot be empty!");
        return;
      }
      let set = DB.cache.Settings.find(s => s.key === "admin_password");
      if (set) {
        set.value = val;
      } else {
        DB.cache.Settings.push({ key: "admin_password", value: val });
      }
      DB.saveTable('Settings').then(() => {
        showNotification(`Admin security login password updated.`);
      });
    };

    window.toggle2FASetting = function() {
      const val = document.getElementById('setting-2fa-status').value;
      let set = DB.cache.Settings.find(s => s.key === "2fa_enabled");
      if (set) {
        set.value = val;
      } else {
        DB.cache.Settings.push({ key: "2fa_enabled", value: val });
      }

      DB.saveTable('Settings').then(() => {
        showNotification(`Email 2FA Authentication ${val === 'true' ? 'Enabled' : 'Disabled'}.`);
      });
    };

    window.saveGasUrlSetting = function() {
      let val = document.getElementById('setting-gas-url').value.trim();
      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
        val = 'https://' + val;
      }
      let set = DB.cache.Settings.find(s => s.key === "gas_webapp_url");
      if (set) {
        set.value = val;
      } else {
        DB.cache.Settings.push({ key: "gas_webapp_url", value: val });
      }
      DB.saveTable('Settings').then(() => {
        showNotification("Google Apps Script Web App URL saved successfully!");
      });
    };

    window.resetDatabaseCache = function() {
      if (confirm("Warning! This action will reset the local database cache to seed defaults. Proceed?")) {
        localStorage.removeItem('saas_db');
        DB.seedMockData();
        DB.saveAllLocal();
        showNotification("Local database state reset to system default seed.");
        window.location.reload();
      }
    };
