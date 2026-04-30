CC.modules.register({
  id: 'overview',
  name: 'Overview',
  icon: '📊',
  section: 'Dashboard',
  panel: function() {
    return '<div id="overview-panel" style="max-width:900px">' +
      '<div style="font-size:22px;font-weight:700;margin-bottom:4px;">Welcome back 👋</div>' +
      '<div style="font-size:14px;color:var(--text-muted);margin-bottom:28px;" id="ov-subtitle"></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:28px;" id="ov-stats"></div>' +
      '<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:20px;">' +
        '<div style="font-weight:600;margin-bottom:14px;">Quick Actions</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;" id="ov-actions"></div>' +
      '</div>' +
    '</div>';
  },
  init: function() {
    CC.getSession().then(function(session) {
      if (!session) return;
      var biz = session.business;
      var user = session.user;

      var sub = document.getElementById('ov-subtitle');
      if (sub) sub.textContent = "Here's what's happening with " + (biz ? biz.name : 'your business') + '.';

      var stats = document.getElementById('ov-stats');
      if (stats && biz) {
        var items = [
          ['Plan', (biz.plan || 'free').charAt(0).toUpperCase() + (biz.plan||'free').slice(1)],
          ['Business Type', (biz.type || '—').charAt(0).toUpperCase() + (biz.type||'').slice(1)],
          ['Status', (biz.status || 'active').charAt(0).toUpperCase() + (biz.status||'').slice(1)],
          ['Your URL', '@' + (biz.subdomain || '—')]
        ];
        stats.innerHTML = items.map(function(i) {
          return '<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:18px">' +
            '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' + i[0] + '</div>' +
            '<div style="font-size:16px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + i[1] + '</div>' +
          '</div>';
        }).join('');
      }

      var actions = document.getElementById('ov-actions');
      if (actions) {
        actions.innerHTML =
          '<button onclick="CC.modules.show(\'__appstore\')" style="background:var(--primary);color:#fff;border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">🛍️ App Store</button>' +
          '<button onclick="CC.modules.show(\'core-profile\')" style="background:var(--card-border);color:var(--text);border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">✏️ Edit Profile</button>';
        if (biz && biz.subdomain) {
          actions.innerHTML += '<a href="/wavegent/' + biz.subdomain + '" target="_blank" style="background:var(--card-border);color:var(--text);border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;">🌐 View My Page</a>';
        }
      }
    });
  }
});
