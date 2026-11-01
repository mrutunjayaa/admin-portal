    // --- VIEW: GENERIC BUG BOUNTY DASHBOARD ---
    Router.register('bugbountydashboard', (hash) => {
      const main = document.getElementById('main-content-view');
      window.currentBugBountyHash = hash;
      const bounties = DB.cache[hash] || [];
      const platformItem = DB.cache.Menu.find(m => m.target === hash);
      const platformName = platformItem ? platformItem.label : 'Bug Bounty Dashboard';
      
      window.bbCurrentPage = window.bbCurrentPage || 1;
      const reportsPerPage = 20;

      // Calculate the 9 metrics
      const totalBugReports = bounties.length;
      const pendingProgram = bounties.filter(b => b.status === 'Under Review').length;
      const privateProgramInvite = bounties.filter(b => b.isPrivate).length;
      const pointsEarned = bounties.reduce((sum, b) => sum + (parseFloat(b.points) || 0), 0);
      const hallOfFameAwarded = bounties.filter(b => b.isHoF).length;
      const totalCompany = new Set(bounties.map(b => b.program)).size;
      const totalP3Bug = bounties.filter(b => b.severity === 'Medium').length;
      const bugReportIDOR = bounties.filter(b => b.bugType === 'IDOR' || b.bugType === 'IDOR in Password Reset').length;
      const bugReportAT = bounties.filter(b => b.bugType && b.bugType.includes('Account Takeover')).length;

      const todayStr = window.globalSelectedDate;
      const assignedTasks = DB.cache.Tasks.filter(t => (t.assignTo === 'Bug Bounty' || t.assignTo === 'Bugcrowd') && (!t.date || t.date === todayStr));

      const taskListHtml = assignedTasks.length > 0 ? assignedTasks.map(t => `
        <div style="background:var(--bg-tertiary); border:1px solid var(--border); border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="habit-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleChecklistTask('${t.id}')">
                ${t.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
              </span>
              <span style="font-weight:600; font-size:0.9rem; ${t.status === 'completed' ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.title}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}">${t.priority}</span>
              <button class="toggle-sidebar-btn" onclick="openEditTaskModal('${t.id}')" style="color:var(--text-secondary); padding:2px;"><i class="fas fa-pen"></i></button>
            </div>
          </div>
          <div style="padding-left:32px; display:flex; gap:14px; flex-wrap:wrap; font-size:0.75rem; color:var(--text-muted);">
            ${t.description ? `<span><i class="fas fa-align-left" style="margin-right:4px;"></i>${t.description}</span>` : ''}
            ${t.time ? `<span style="color:var(--gold-light);"><i class="fas fa-clock" style="margin-right:4px;"></i>${t.time}</span>` : ''}
            ${t.date ? `<span><i class="fas fa-calendar" style="margin-right:4px;"></i>${t.date}</span>` : ''}
            ${t.timeSlot ? `<span style="text-transform:capitalize;"><i class="fas fa-sun" style="margin-right:4px;"></i>${t.timeSlot}</span>` : ''}
          </div>
        </div>
      `).join('') : `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem; font-style:italic;"><i class="material-icons-round" style="font-size:2rem; display:block; margin-bottom:8px;">inbox</i>No tasks assigned to Bug Bounty yet.</div>`;

      main.innerHTML = `
        <div class="fade-in-up">
          <!-- Stats bar: 3x3 Grid -->
          <div style="display:flex; flex-direction:column; gap:24px; margin-bottom:24px;">
            <!-- Row 1 -->
            <div class="grid-3">
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Total Bug Reports</span>
                  <span class="stat-val">${totalBugReports}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--info);"><i class="material-icons-round">bug_report</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Pending Program</span>
                  <span class="stat-val">${pendingProgram}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--warning);"><i class="material-icons-round">schedule</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Private Program Invite</span>
                  <span class="stat-val">${privateProgramInvite}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--gold-light);"><i class="material-icons-round">lock</i></div>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="grid-3">
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Points Earned</span>
                  <span class="stat-val">${pointsEarned}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">military_tech</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Hall of Fame Awarded</span>
                  <span class="stat-val">${hallOfFameAwarded}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--warning);"><i class="material-icons-round">emoji_events</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Total Company</span>
                  <span class="stat-val">${totalCompany}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--info);"><i class="material-icons-round">business</i></div>
              </div>
            </div>

            <!-- Row 3 -->
            <div class="grid-3">
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Total P3 Bug</span>
                  <span class="stat-val">${totalP3Bug}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--warning);"><i class="material-icons-round">warning</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Bug Report IDOR</span>
                  <span class="stat-val">${bugReportIDOR}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">key</i></div>
              </div>
              <div class="card stat-widget">
                <div class="stat-info">
                  <span class="stat-label">Bug Report Account Takeover</span>
                  <span class="stat-val">${bugReportAT}</span>
                </div>
                <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">switch_account</i></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title"><i class="material-icons-round">shield</i>Bounty Submission Tracker</div>
            <div style="margin-bottom: 12px; display:flex; justify-content: flex-end;">
              <button class="btn btn-primary" onclick="openBBDAddModal()"><i class="fas fa-plus"></i> Add Report Submission</button>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr><th>Date</th><th>Program</th><th>Bug Type</th><th>Severity</th><th>Points</th><th>Reward</th><th>Status</th><th>Payout Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  ${(() => {
                    const allReports = [...bounties].reverse();
                    const totalPages = Math.ceil(allReports.length / reportsPerPage);
                    if (window.bbCurrentPage > totalPages && totalPages > 0) window.bbCurrentPage = totalPages;
                    const startIndex = (window.bbCurrentPage - 1) * reportsPerPage;
                    const paginatedReports = allReports.slice(startIndex, startIndex + reportsPerPage);
                    
                    return paginatedReports.map(b => `
                      <tr>
                        <td>${b.submittedDate}</td>
                        <td><b>${b.program}</b>${b.isPrivate ? ' <i class="fas fa-lock" style="color:var(--gold-light); font-size:0.7rem;" title="Private Program"></i>' : ''}</td>
                        <td>${b.bugType || 'General'}</td>
                        <td><span class="badge badge-${b.severity === 'Critical' || b.severity === 'High' ? 'danger' : (b.severity === 'Info' || b.severity === 'N/A' ? 'info' : 'warning')}">${b.severity}</span></td>
                        <td>${b.points || 0}</td>
                        <td style="font-weight:600;">$ ${(b.reward || 0).toLocaleString()}</td>
                        <td><span class="badge badge-info">${b.status}</span></td>
                        <td><span class="badge ${b.paidStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${b.paidStatus}</span></td>
                        <td>
                          <div style="display:flex; gap:8px;">
                            <button class="toggle-sidebar-btn" onclick="openBBDAddModal('${b.id}')" style="color:var(--info);"><i class="fas fa-pen"></i></button>
                            <button class="toggle-sidebar-btn" onclick="deleteBBDBounty('${b.id}')" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    `).join('');
                  })()}
                </tbody>
              </table>
            </div>
            ${(() => {
              const allReports = [...bounties].reverse();
              const totalPages = Math.ceil(allReports.length / reportsPerPage);
              if (totalPages > 1) {
                return `
                  <div style="display:flex; justify-content:center; gap:8px; margin-top:20px;">
                    ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => `
                      <button class="btn ${p === window.bbCurrentPage ? 'btn-primary' : 'btn-secondary'}" style="padding:4px 12px; border-radius:6px; font-size:0.85rem;" onclick="bbdChangePage(${p})">${p}</button>
                    `).join('')}
                  </div>
                `;
              }
              return '';
            })()}
          </div>

          <!-- Assigned Tasks Section -->
          <div class="card" style="padding:24px; margin-top:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div class="card-title" style="margin:0;"><i class="material-icons-round">assignment</i>Assigned Tasks — Bug Bounty</div>
              <span class="badge" style="background:rgba(212,175,55,0.15); color:var(--gold-light); font-size:0.75rem;">${assignedTasks.length} task${assignedTasks.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${taskListHtml}
            </div>
          </div>
        </div>
      `;
    });

    window.editingBountyId = null;

    window.openBBDAddModal = function(editId = null) {
      window.editingBountyId = editId;
      let b = null;
      if (editId) {
        b = DB.cache[window.currentBugBountyHash].find(x => x.id === editId);
      }
      const bugTypes = [
        "Subdomain Takeover", "No Password Policy", "Username Enumeration", "Duplicate Account Creation",
        "Bypassing Email/Phone Verification", "Temporary Email Bypass", "Unverified Account Takeover",
        "SQL Injection", "LDAP Injection", "Cross-Site Scripting (XSS)", "Free Trial Abuse", "HTML Injection",
        "Role Elevation", "Duplicate Referral Exploit", "Coupon Code Exploit", "Rate Limiting Bypass",
        "Weak Token Generation", "CORS Misconfiguration", "Improper Account Deletion", "Account Takeover via Signup",
        "Cache Poisoning", "Captcha Bypass", "Default Credentials", "OAuth Login without Confirmation",
        "OAuth Misconfiguration Insecure Redirect URI", "Brute Force Attack", "Credential Stuffing", "MFA Bypass",
        "XSS via Login Fields", "Session Fixation", "Session Hijacking", "Cookie Misconfigurations", "Open Redirection",
        "IDOR", "API Rate Limiting Bypass", "Logic Manipulation", "IDOR in Password Reset", "No Rate Limiting",
        "CAPTCHA Missing", "Email Change Takeover", "Reset Token Hijacking", "Predictable Reset Token",
        "Token Not Invalidated", "Email Enumeration", "No Old Password Verification", "Open Redirect in Reset Link",
        "XSS in Email/Reset Fields", "Host Header Injection", "Failure to Invalidate Session on Password Reset and/or Change",
        "Authentication Bypass", "Command Injection", "File Inclusion", "Remote Code Execution", "XXE", "SSRF",
        "Sensitive Data Exposure", "Email Spoofing", "iframe/HTML Injection", "SSTI", "Directory Listing",
        "Session Not Invalidated on Logout", "Login/Reset over HTTP", "No Rate Limiting on Email/SMS/Login/Register",
        "Broken Link Hijacking", "Lack of Password Confirmation – Delete Account"
      ].sort();

      const html = `
        <datalist id="bugTypesList">
          ${bugTypes.map(t => `<option value="${t}"></option>`).join('')}
        </datalist>
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label>Program / Company Name</label>
              <input type="text" class="form-control" id="bb-prog" placeholder="e.g. Google, Microsoft">
            </div>
            <div class="form-group" style="margin:0;">
              <label>Is Private Program Invite?</label>
              <select class="form-control" id="bb-is-private">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
          
          <div class="form-group" style="margin:0;">
            <label>Bug Type (Search & Select)</label>
            <input list="bugTypesList" type="text" class="form-control" id="bb-bugtype" placeholder="Type to search bug types...">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label>Affected Target / URL</label>
              <input type="text" class="form-control" id="bb-target" placeholder="e.g. admin.company.com">
            </div>
            <div class="form-group" style="margin:0;">
              <label>Severity</label>
              <select class="form-control" id="bb-severity">
                <option>Critical (P1)</option>
                <option>High (P2)</option>
                <option>Medium (P3)</option>
                <option>Low (P4)</option>
                <option>Info (P5)</option>
                <option>N/A</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label>Points Awarded</label>
              <input type="number" class="form-control" id="bb-points" placeholder="e.g. 40">
            </div>
            <div class="form-group" style="margin:0;">
              <label>Bounty Reward ($)</label>
              <input type="number" class="form-control" id="bb-reward" placeholder="e.g. 1500">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label>Hall of Fame?</label>
              <select class="form-control" id="bb-hof">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label>Status</label>
              <select class="form-control" id="bb-status">
                <option>Under Review</option>
                <option>Triaged</option>
                <option>Resolved</option>
                <option>Duplicate</option>
                <option>N/A / Rejected</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label>Payout Status</label>
              <select class="form-control" id="bb-paid">
                <option>Unpaid</option>
                <option>Paid</option>
                <option>N/A</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:16px;">
            <div class="form-group" style="margin:0;">
              <label>Submission Date</label>
              <input type="date" class="form-control" id="bb-date" value="${window.globalSelectedDate}">
            </div>
          </div>
        </div>
      `;
      showModal(b ? "Edit Bug Bounty Submission Details" : "Add Bug Bounty Submission Details", html, b ? "Update Submission" : "Save Submission", saveBBDEntry);
      
      // Make the modal large
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) modalContent.style.maxWidth = '1000px';

      if (b) {
        document.getElementById('bb-prog').value = b.program || '';
        document.getElementById('bb-is-private').value = b.isPrivate ? 'true' : 'false';
        document.getElementById('bb-bugtype').value = b.bugType || '';
        document.getElementById('bb-target').value = b.target || '';
        document.getElementById('bb-severity').value = b.severity || 'Medium';
        document.getElementById('bb-points').value = b.points || 0;
        document.getElementById('bb-reward').value = b.reward || 0;
        document.getElementById('bb-hof').value = b.isHoF ? 'true' : 'false';
        document.getElementById('bb-status').value = b.status || 'Under Review';
        document.getElementById('bb-paid').value = b.paidStatus || 'Unpaid';
        document.getElementById('bb-date').value = b.submittedDate || '';
      }
    };

    window.saveBBDEntry = function() {
      const entry = {
        program: document.getElementById('bb-prog').value || 'Generic VRP',
        isPrivate: document.getElementById('bb-is-private').value === 'true',
        bugType: document.getElementById('bb-bugtype').value || 'General',
        target: document.getElementById('bb-target').value || 'API Asset',
        severity: document.getElementById('bb-severity').value,
        points: parseInt(document.getElementById('bb-points').value) || 0,
        reward: parseFloat(document.getElementById('bb-reward').value) || 0,
        isHoF: document.getElementById('bb-hof').value === 'true',
        status: document.getElementById('bb-status').value,
        paidStatus: document.getElementById('bb-paid').value,
        submittedDate: document.getElementById('bb-date').value
      };
      
      if (window.editingBountyId) {
        entry.id = window.editingBountyId;
        const index = DB.cache[window.currentBugBountyHash].findIndex(x => x.id === window.editingBountyId);
        if (index > -1) {
          DB.cache[window.currentBugBountyHash][index] = entry;
        }
        showNotification(`Bounty report updated for ${entry.program}`);
      } else {
        entry.id = DB.uid();
        if(!DB.cache[window.currentBugBountyHash]) DB.cache[window.currentBugBountyHash] = [];
        DB.cache[window.currentBugBountyHash].push(entry);
        if (window.updateCoins) window.updateCoins(1);
        showNotification(`Bounty report logged for ${entry.program} (+1 Coin)`);
      }
      
      window.editingBountyId = null;
      DB.saveTable('Menu').then(() => {
        Router.routes['bugbountydashboard'](window.currentBugBountyHash);
      });
    };

    window.deleteBBDBounty = function(id) {
      if (confirm("Delete this submission entry from log?")) {
        DB.cache[window.currentBugBountyHash] = DB.cache[window.currentBugBountyHash].filter(b => b.id !== id);
        DB.saveTable('Menu').then(() => {
          showNotification("Bounty report removed.");
          Router.routes['bugbountydashboard'](window.currentBugBountyHash);
        });
      }
    };

    window.bbdChangePage = function(p) {
      window.bbCurrentPage = p;
      Router.routes['bugbountydashboard'](window.currentBugBountyHash);
    };
