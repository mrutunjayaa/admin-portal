    // --- VIEW: ANALYTICS ---
    Router.register('analytics', () => {
      const main = document.getElementById('main-content-view');
      main.innerHTML = `
        <div class="fade-in-up">
          <div class="grid-2" style="margin-bottom:24px;">
            <div class="card">
              <div class="card-title"><i class="material-icons-round">bar_chart</i>Income vs Expenses Summary</div>
              <canvas id="analyticsBarChart" height="150"></canvas>
            </div>
            <div class="card">
              <div class="card-title"><i class="material-icons-round">pie_chart</i>Expenses Category Breakup</div>
              <canvas id="analyticsPieChart" height="150"></canvas>
            </div>
          </div>

          <div class="card">
            <div class="card-title"><i class="material-icons-round">grid_on</i>Development Contributions Board (Commit Board Heatmap)</div>
            <div class="heatmap-grid" id="contributions-heatmap"></div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:12px; text-align:right;">
              Simulated Contribution Board Log. Total Commits: 142
            </div>
          </div>
        </div>
      `;

      // Render Heatmap cells
      const heat = document.getElementById('contributions-heatmap');
      if (heat) {
        let html = '';
        for (let i = 0; i < 96; i++) {
          const commits = Math.floor(Math.random() * 5);
          let color = 'rgba(201, 168, 76, 0.05)';
          if (commits === 1) color = 'rgba(201, 168, 76, 0.25)';
          else if (commits === 2) color = 'rgba(201, 168, 76, 0.5)';
          else if (commits > 2) color = 'rgba(201, 168, 76, 0.9)';
          html += `<div class="heatmap-cell" style="background-color:${color};" title="${commits} commits"></div>`;
        }
        heat.innerHTML = html;
      }

      // Build charts
      setTimeout(buildAnalyticsCharts, 100);
    });

    function buildAnalyticsCharts() {
      const fin = DB.cache.Finance;
      const income = fin.filter(f => f.type === 'income').reduce((s,i)=>s+i.amount, 0);
      const expenses = fin.filter(f => f.type === 'expense').reduce((s,i)=>s+i.amount, 0);

      // Bar Chart
      new Chart(document.getElementById('analyticsBarChart'), {
        type: 'bar',
        data: {
          labels: ['Income Ledger', 'Expenses Ledger'],
          datasets: [{
            label: 'Amount',
            data: [income, expenses],
            backgroundColor: ['rgba(16, 185, 129, 0.4)', 'rgba(239, 68, 68, 0.4)'],
            borderColor: ['#10b981', '#ef4444'],
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });

      // Pie Chart
      const expCats = {};
      fin.filter(f => f.type === 'expense').forEach(e => {
        expCats[e.category] = (expCats[e.category] || 0) + e.amount;
      });

      new Chart(document.getElementById('analyticsPieChart'), {
        type: 'pie',
        data: {
          labels: Object.keys(expCats),
          datasets: [{
            data: Object.values(expCats),
            backgroundColor: ['#c9a84c', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']
          }]
        },
        options: { responsive: true }
      });
    }
