    // --- VIEW: LOGIN ---
    Router.register('login', () => {
      const view = document.getElementById('login-viewport');
      view.innerHTML = `
        <div class="login-container">
          <style>
            /* Rounded layout styles */
            .login-card {
              border-radius: 24px !important;
              padding: 40px 32px !important;
              background-color: var(--bg-secondary) !important;
              border: 1px solid var(--border) !important;
              box-shadow: var(--shadow) !important;
              width: 100%;
              max-width: 420px;
              animation: fadeInUp 0.4s ease-out;
            }
            .login-header {
              text-align: center;
              margin-bottom: 24px;
            }
            .login-header h2 {
              font-size: 1.65rem;
              font-weight: 700;
              margin-bottom: 4px;
              color: var(--text-primary);
              font-family: 'Outfit', sans-serif;
            }
            .login-header p {
              font-size: 0.82rem;
              color: var(--text-secondary);
              line-height: 1.4;
            }
            .login-input-wrap {
              position: relative;
              margin-bottom: 16px;
            }
            .login-input-wrap input {
              border-radius: 50px !important;
              padding: 12px 48px 12px 20px !important;
              border: 1px solid var(--border) !important;
              background-color: var(--bg-tertiary) !important;
              color: var(--text-primary) !important;
              font-size: 0.85rem !important;
              height: 48px;
              width: 100%;
              outline: none;
              transition: all 0.2s ease;
            }
            .login-input-wrap input:focus {
              border-color: #10b981 !important;
              box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
            }
            .login-input-icon {
              position: absolute;
              right: 18px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              color: var(--text-muted);
              font-size: 1.1rem;
              user-select: none;
            }
            .login-forgot-link {
              display: block;
              text-align: right;
              font-size: 0.78rem;
              color: var(--text-secondary);
              text-decoration: none;
              margin-top: -8px;
              margin-bottom: 20px;
              font-weight: 600;
              cursor: pointer;
            }
            .login-forgot-link:hover {
              color: #10b981;
              text-decoration: underline;
            }
            .login-btn {
              width: 100%;
              height: 48px;
              border-radius: 50px !important;
              background-color: #10b981 !important;
              border: none !important;
              color: #ffffff !important;
              font-weight: 700 !important;
              font-size: 0.9rem !important;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .login-btn:hover {
              background-color: #059669 !important;
              transform: translateY(-1px);
            }
            .login-helper-text {
              font-size: 0.72rem;
              color: var(--text-muted);
              text-align: center;
              margin-top: 16px;
              line-height: 1.4;
            }
            .otp-banner {
              background: rgba(16, 185, 129, 0.1);
              border: 1px dashed #10b981;
              border-radius: 12px;
              padding: 10px 14px;
              font-size: 0.8rem;
              color: #10b981;
              margin-bottom: 16px;
              text-align: center;
              line-height: 1.4;
            }
          </style>

          <!-- Login Screen -->
          <div class="login-card" id="login-form-card">
            <div class="login-header">
              <h2>Admin Portal</h2>
              <p>Sign in with your Admin Email</p>
            </div>
            
            <div class="login-input-wrap">
              <input type="email" id="login-user" placeholder="Enter admin email address" onkeydown="if(event.key==='Enter') verifyLogin()">
            </div>

            <div class="login-input-wrap">
              <input type="password" id="login-pass" placeholder="Enter admin password" onkeydown="if(event.key==='Enter') verifyLogin()">
              <i class="fas fa-eye-slash login-input-icon" id="toggle-login-pass" onclick="togglePasswordVisibility('login-pass', 'toggle-login-pass')"></i>
            </div>

            <a class="login-forgot-link" onclick="showResetForm()">Forgot password?</a>

            <div id="login-err" style="color:var(--danger);font-size:0.8rem;text-align:center;display:none;margin-bottom:14px;">
              Incorrect Admin Credentials! Please try again.
            </div>

            <button class="login-btn" onclick="verifyLogin()">ADMIN LOGIN</button>

            <div class="login-helper-text" style="color:var(--text-muted);">
              <i class="fas fa-shield-halved" style="color:#10b981; margin-right:4px;"></i> Restricted: <b>Admin Access Only</b>
            </div>
          </div>

          <!-- 2FA Email OTP Verification Screen -->
          <div class="login-card" id="2fa-form-card" style="display:none;">
            <div class="login-header">
              <div style="width:56px; height:56px; border-radius:50%; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto;">
                <i class="fas fa-envelope-open-text" style="font-size:1.7rem; color:#10b981;"></i>
              </div>
              <h2>2FA Verification</h2>
              <p id="2fa-user-hint">We have sent a 6-digit verification code to your email.</p>
            </div>

            <div id="2fa-demo-notice" class="otp-banner" style="display:none;"></div>

            <div class="login-input-wrap">
              <input type="text" id="login-2fa-code" maxlength="6" placeholder="000000" style="letter-spacing: 8px; text-align: center; font-size: 1.4rem !important; font-weight:700; height:52px;" onkeydown="if(event.key==='Enter') verify2FACode()">
            </div>

            <div id="2fa-err" style="color:var(--danger);font-size:0.8rem;text-align:center;display:none;margin-bottom:14px;">
              Invalid verification code!
            </div>

            <button class="login-btn" onclick="verify2FACode()">VERIFY &amp; LOGIN</button>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
              <a class="login-forgot-link" onclick="resend2FACode()" style="margin:0; color:#10b981;"><i class="fas fa-redo-alt" style="margin-right:4px;"></i>Resend Code</a>
              <a class="login-forgot-link" onclick="showLoginForm()" style="margin:0;">Back to Login</a>
            </div>
          </div>

          <!-- Reset Password Screen -->
          <div class="login-card" id="reset-form-card" style="display:none;">
            <div class="login-header">
              <h2>Reset Admin Password</h2>
              <p>Provide old admin password to update</p>
            </div>

            <div class="login-input-wrap">
              <input type="email" id="reset-user" placeholder="Enter admin email address">
            </div>

            <div class="login-input-wrap">
              <input type="password" id="reset-old-pass" placeholder="Enter old password">
              <i class="fas fa-eye-slash login-input-icon" id="toggle-reset-old" onclick="togglePasswordVisibility('reset-old-pass', 'toggle-reset-old')"></i>
            </div>

            <div class="login-input-wrap">
              <input type="password" id="reset-new-pass" placeholder="Enter new password">
              <i class="fas fa-eye-slash login-input-icon" id="toggle-reset-new" onclick="togglePasswordVisibility('reset-new-pass', 'toggle-reset-new')"></i>
            </div>

            <div class="login-input-wrap">
              <input type="password" id="reset-confirm-pass" placeholder="Confirm new password">
              <i class="fas fa-eye-slash login-input-icon" id="toggle-reset-confirm" onclick="togglePasswordVisibility('reset-confirm-pass', 'toggle-reset-confirm')"></i>
            </div>

            <div id="reset-err" style="color:var(--danger);font-size:0.8rem;text-align:center;display:none;margin-bottom:14px;">
              Credentials mismatch! Please try again.
            </div>

            <button class="login-btn" onclick="verifyAndResetPassword()">SET PASSWORD</button>

            <a class="login-forgot-link" onclick="showLoginForm()" style="text-align:center; margin-top:16px; margin-bottom:0;">Back to Login</a>
          </div>
        </div>
      `;
    });

    let pendingAdminUser = null;
    window._active2FAEmail = null;

    window.showResetForm = function() {
      document.getElementById('login-form-card').style.display = 'none';
      if (document.getElementById('2fa-form-card')) document.getElementById('2fa-form-card').style.display = 'none';
      document.getElementById('reset-form-card').style.display = 'block';
    };

    window.showLoginForm = function() {
      document.getElementById('login-form-card').style.display = 'block';
      if (document.getElementById('reset-form-card')) document.getElementById('reset-form-card').style.display = 'none';
      if (document.getElementById('2fa-form-card')) document.getElementById('2fa-form-card').style.display = 'none';
      if (document.getElementById('login-err')) document.getElementById('login-err').style.display = 'none';
      if (document.getElementById('reset-err')) document.getElementById('reset-err').style.display = 'none';
      if (document.getElementById('2fa-err')) document.getElementById('2fa-err').style.display = 'none';
    };

    window.togglePasswordVisibility = function(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    };

    window.verifyLogin = function() {
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value;
      const errEl = document.getElementById('login-err');
      
      if (!user || !pass) {
        errEl.innerText = 'Email and Password are required!';
        errEl.style.display = 'block';
        return;
      }

      // Check Admin Credentials - only official.mrutunjaya@gmail.com and Mrutunjaya@782
      const adminUser = DB.cache.Settings.find(s => s.key === "admin_username")?.value || "official.mrutunjaya@gmail.com";
      const adminPass = DB.cache.Settings.find(s => s.key === "admin_password")?.value || "Mrutunjaya@782";
      
      if (user.toLowerCase() === adminUser.toLowerCase() && pass === adminPass) {
        const is2FA = DB.cache.Settings.find(s => s.key === "2fa_enabled")?.value !== "false"; // Default true
        
        if (is2FA) {
          // Trigger 2FA Email Code
          dispatch2FA(adminUser);
          return;
        }

        // Direct Login when 2FA is disabled
        completeAdminLogin(adminUser);
        return;
      }

      // Credentials mismatch
      errEl.innerText = 'Access Denied: Invalid Email or Password!';
      errEl.style.display = 'block';
    };

    function dispatch2FA(email) {
      pendingAdminUser = email;
      window._active2FAEmail = email;

      // Generate 6-digit random code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('saas_2fa_otp', otpCode);
      sessionStorage.setItem('saas_2fa_time', Date.now().toString());

      // Show 2FA Screen
      document.getElementById('login-form-card').style.display = 'none';
      document.getElementById('2fa-form-card').style.display = 'block';
      const hint = document.getElementById('2fa-user-hint');
      if (hint) {
        hint.innerHTML = `Verification code sent to <b>${email}</b>.`;
      }
      const codeInput = document.getElementById('login-2fa-code');
      if (codeInput) {
        codeInput.value = '';
        setTimeout(() => codeInput.focus(), 150);
      }

      const notice = document.getElementById('2fa-demo-notice');

      // Send Email via GAS if in GAS environment
      const isGAS = typeof google !== 'undefined' && typeof google.script !== 'undefined' && google.script.run;
      let gasUrl = (DB.cache.Settings.find(s => s.key === "gas_webapp_url")?.value || '').trim();
      if (gasUrl && !gasUrl.startsWith('http://') && !gasUrl.startsWith('https://')) {
        gasUrl = 'https://' + gasUrl;
      }

      if (isGAS) {
        google.script.run
          .withSuccessHandler(function() {
            if (notice) {
              notice.style.display = 'block';
              notice.innerHTML = `<i class="fas fa-check-circle" style="margin-right:4px;"></i> Code has been dispatched to <b>${email}</b>! Check your inbox.`;
            }
          })
          .withFailureHandler(function(err) {
            if (notice) {
              notice.style.display = 'block';
              notice.innerHTML = `<i class="fas fa-info-circle"></i> Verification code: <b>${otpCode}</b>`;
            }
          })
          .send2FAEmail(email, otpCode);
      } else if (gasUrl && (gasUrl.includes('script.google.com') || gasUrl.includes('/exec'))) {
        // Send via deployed GAS Web App URL from local computer!
        if (notice) {
          notice.style.display = 'block';
          notice.innerHTML = `<i class="fas fa-spinner fa-spin" style="margin-right:4px;"></i> Sending 2FA code to <b>${email}</b>...`;
        }
        fetch(`${gasUrl}?action=send2FA&email=${encodeURIComponent(email)}&code=${encodeURIComponent(otpCode)}`, { mode: 'no-cors' })
          .then(() => {
            if (notice) {
              notice.style.display = 'block';
              notice.innerHTML = `<i class="fas fa-check-circle" style="margin-right:4px;"></i> Real 2FA code dispatched to <b>${email}</b>! Check your inbox.`;
            }
          })
          .catch(() => {
            if (notice) {
              notice.style.display = 'block';
              notice.innerHTML = `<i class="fas fa-envelope" style="margin-right:4px;"></i> 2FA Code sent to <b>${email}</b><br><span style="font-size:0.75rem; color:var(--text-muted);">(Local Code: <b style="color:#10b981; font-size:0.95rem;">${otpCode}</b>)</span>`;
            }
          });
      } else {
        // Local preview simulation
        if (notice) {
          notice.style.display = 'block';
          notice.innerHTML = `<i class="fas fa-envelope" style="margin-right:4px;"></i> 2FA Code sent to <b>${email}</b><br><span style="font-size:0.75rem; color:var(--text-muted);">(Local Preview Code: <b style="color:#10b981; font-size:0.95rem;">${otpCode}</b>)</span>`;
        }
      }
    }

    window.resend2FACode = function() {
      const email = window._active2FAEmail || DB.cache.Settings.find(s => s.key === "admin_username")?.value || "official.mrutunjaya@gmail.com";
      dispatch2FA(email);
      alert("A new 6-digit verification code has been sent to " + email);
    };

    window.verify2FACode = function() {
      const enteredCode = document.getElementById('login-2fa-code').value.trim();
      const errEl = document.getElementById('2fa-err');
      const expectedCode = sessionStorage.getItem('saas_2fa_otp');

      if (!enteredCode) {
        errEl.innerText = 'Please enter the 6-digit verification code!';
        errEl.style.display = 'block';
        return;
      }

      if (enteredCode === expectedCode) {
        sessionStorage.removeItem('saas_2fa_otp');
        sessionStorage.removeItem('saas_2fa_time');
        const adminUser = pendingAdminUser || DB.cache.Settings.find(s => s.key === "admin_username")?.value || "official.mrutunjaya@gmail.com";
        completeAdminLogin(adminUser);
      } else {
        errEl.innerText = 'Invalid verification code! Please check your email and try again.';
        errEl.style.display = 'block';
      }
    };

    function completeAdminLogin(adminUser) {
      localStorage.setItem('saas_logged_in', 'true');
      localStorage.setItem('saas_user_role', 'admin');
      localStorage.setItem('saas_user_name', 'Admin User');
      localStorage.setItem('saas_user_username', adminUser);
      
      // Add log activity
      if (DB.cache.UserProfile) {
        if (!DB.cache.UserProfile.activityLog) DB.cache.UserProfile.activityLog = [];
        DB.cache.UserProfile.activityLog.unshift({
          timestamp: new Date().toISOString(),
          action: "Logged In",
          details: `Admin user (${adminUser}) successfully authenticated with 2FA`
        });
        DB.saveTable('UserProfile');
      }

      window.location.hash = '#dashboard';
    }

    window.verifyAndResetPassword = function() {
      const user = document.getElementById('reset-user').value.trim();
      const oldPass = document.getElementById('reset-old-pass').value;
      const newPass = document.getElementById('reset-new-pass').value;
      const confirmPass = document.getElementById('reset-confirm-pass').value;
      const errEl = document.getElementById('reset-err');
      
      if (!user || !oldPass || !newPass || !confirmPass) {
        errEl.innerText = 'All fields are required!';
        errEl.style.display = 'block';
        return;
      }

      if (newPass !== confirmPass) {
        errEl.innerText = 'New passwords do not match!';
        errEl.style.display = 'block';
        return;
      }

      // 1. Reset Admin Password
      const adminUser = DB.cache.Settings.find(s => s.key === "admin_username")?.value || "official.mrutunjaya@gmail.com";
      const adminPass = DB.cache.Settings.find(s => s.key === "admin_password")?.value || "Mrutunjaya@782";
      
      if (user.toLowerCase() === adminUser.toLowerCase()) {
        if (oldPass === adminPass) {
          let setting = DB.cache.Settings.find(s => s.key === "admin_password");
          if (setting) {
            setting.value = newPass;
          } else {
            DB.cache.Settings.push({ key: "admin_password", value: newPass });
          }
          DB.saveTable('Settings').then(() => {
            alert('Admin password updated successfully!');
            showLoginForm();
          });
          return;
        } else {
          errEl.innerText = 'Incorrect Old Admin Password!';
          errEl.style.display = 'block';
          return;
        }
      }

      // User not recognized
      errEl.innerText = 'Admin email not recognized!';
      errEl.style.display = 'block';
    };
