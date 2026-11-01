    // --- VIEW: FINANCE ---
    Router.register('finance', () => {
      const main = document.getElementById('main-content-view');
      const fin = DB.cache.Finance;
      
      const income = fin.filter(f => f.type === 'income').reduce((s, i) => s + i.amount, 0);
      const expenses = fin.filter(f => f.type === 'expense').reduce((s, i) => s + i.amount, 0);
      const balance = income - expenses;

      main.innerHTML = `
        <div class="fade-in-up">
          <!-- Summary cards -->
          <div class="grid-3" style="margin-bottom:24px;">
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Total Income Ledger</span>
                <span class="stat-val" style="color:var(--success);">${formatCurrency(income)}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--success);"><i class="material-icons-round">trending_up</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Total Expenses Ledger</span>
                <span class="stat-val" style="color:var(--danger);">${formatCurrency(expenses)}</span>
              </div>
              <div class="stat-icon-wrap" style="color:var(--danger);"><i class="material-icons-round">trending_down</i></div>
            </div>
            <div class="card stat-widget">
              <div class="stat-info">
                <span class="stat-label">Calculated Bank Balance</span>
                <span class="stat-val" style="color:var(--gold-light);">${formatCurrency(balance)}</span>
              </div>
              <div class="stat-icon-wrap"><i class="material-icons-round">account_balance</i></div>
            </div>
          </div>

          <div class="grid-3" style="margin-bottom:24px;">
            <div class="card col-span-2">
              <div class="card-title"><i class="material-icons-round">receipt_long</i>Transactions Ledger</div>
              <div style="margin-bottom: 12px; display:flex; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="openAddTransactionModal()"><i class="fas fa-plus"></i> Add Transaction</button>
              </div>
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Category</th><th>Details</th><th>Mode</th><th>Amount</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    ${fin.map(f => `
                      <tr>
                        <td>${f.date}</td>
                        <td><span class="badge ${f.type === 'income' ? 'badge-success' : 'badge-danger'}">${f.category}</span></td>
                        <td>${f.description}</td>
                        <td>${f.paymentMode}</td>
                        <td style="font-weight:600; color:${f.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
                          ${f.type === 'income' ? '+' : '-'}${formatCurrency(f.amount)}
                        </td>
                        <td>
                          <button class="toggle-sidebar-btn" onclick="deleteTransaction('${f.id}')" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- EMI & Investment calculator card -->
            <div class="card">
              <div class="card-title"><i class="material-icons-round">calculate</i>EMI Calculator</div>
              <div class="form-group">
                <label>Principal Amount</label>
                <input type="number" class="form-control" id="emi-principal" value="500000">
              </div>
              <div class="form-group">
                <label>Rate of Interest (%)</label>
                <input type="number" class="form-control" id="emi-rate" value="9">
              </div>
              <div class="form-group">
                <label>Tenure (Months)</label>
                <input type="number" class="form-control" id="emi-months" value="36">
              </div>
              <button class="btn btn-primary" style="width:100%;" onclick="calculateEmi()">Calculate Monthly EMI</button>
              <div id="emi-result" style="margin-top: 14px; text-align:center; font-weight:700; color:var(--gold-light);"></div>
            </div>
          </div>
        </div>
      `;
    });

    window.openAddTransactionModal = function() {
      const html = `
        <div class="form-group">
          <label>Type</label>
          <select id="t-type">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" class="form-control" id="t-cat" placeholder="e.g. Bug Bounty, YouTube, Food, Subscriptions">
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input type="number" class="form-control" id="t-amount" placeholder="e.g. 5000">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" class="form-control" id="t-date" value="${window.globalSelectedDate}">
        </div>
        <div class="form-group">
          <label>Mode</label>
          <input type="text" class="form-control" id="t-mode" placeholder="e.g. UPI, Net Banking, Card">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" id="t-desc" rows="3" placeholder="Specific notes..."></textarea>
        </div>
      `;
      showModal("Add Transaction Ledger Entry", html, "Save Entry", saveTransactionEntry);
    };

    window.saveTransactionEntry = function() {
      const entry = {
        id: DB.uid(),
        type: document.getElementById('t-type').value,
        category: document.getElementById('t-cat').value || 'Uncategorized',
        amount: parseFloat(document.getElementById('t-amount').value) || 0,
        date: document.getElementById('t-date').value,
        paymentMode: document.getElementById('t-mode').value || 'UPI',
        description: document.getElementById('t-desc').value
      };
      
      DB.cache.Finance.push(entry);
      DB.saveTable('Finance').then(() => {
        showNotification("Finance transaction entry saved!");
        Router.routes['finance']();
      });
    };

    window.deleteTransaction = function(id) {
      if (confirm("Are you sure you want to delete this record?")) {
        DB.cache.Finance = DB.cache.Finance.filter(f => f.id !== id);
        DB.saveTable('Finance').then(() => {
          showNotification("Finance transaction deleted.");
          Router.routes['finance']();
        });
      }
    };

    window.calculateEmi = function() {
      const p = parseFloat(document.getElementById('emi-principal').value);
      const r = parseFloat(document.getElementById('emi-rate').value) / 12 / 100;
      const n = parseFloat(document.getElementById('emi-months').value);
      
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      document.getElementById('emi-result').innerText = `EMI: ${formatCurrency(emi.toFixed(2))} / month`;
    };
