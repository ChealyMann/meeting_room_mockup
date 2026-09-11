// ===================================================================
// Enterprise SaaS Dashboard Logic
// Strictly follows TypeUI Enterprise Design Specifications
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Service Catalog Mock Data
  const services = [
    {
      id: 'svc-1',
      name: 'api-gateway-edge',
      version: 'v2.14.0',
      status: 'running',
      statusLabel: 'Healthy',
      replicas: '16 / 16',
      latency: '12ms',
      cpu: '24%',
      mem: '4.2 GB',
      deployed: '14m ago'
    },
    {
      id: 'svc-2',
      name: 'auth-tokens-vault',
      version: 'v3.1.2',
      status: 'running',
      statusLabel: 'Healthy',
      replicas: '8 / 8',
      latency: '8ms',
      cpu: '18%',
      mem: '2.1 GB',
      deployed: '2h ago'
    },
    {
      id: 'svc-3',
      name: 'billing-ledger-stream',
      version: 'v1.8.9',
      status: 'scaling',
      statusLabel: 'Scaling Auto',
      replicas: '12 / 16',
      latency: '24ms',
      cpu: '78%',
      mem: '9.4 GB',
      deployed: '45m ago'
    },
    {
      id: 'svc-4',
      name: 'search-vector-indexer',
      version: 'v4.0.0-rc',
      status: 'deploying',
      statusLabel: 'Canary Rollout',
      replicas: '4 / 12',
      latency: '38ms',
      cpu: '55%',
      mem: '14.8 GB',
      deployed: 'Just now'
    },
    {
      id: 'svc-5',
      name: 'notification-dispatch-worker',
      version: 'v2.0.4',
      status: 'running',
      statusLabel: 'Healthy',
      replicas: '6 / 6',
      latency: '15ms',
      cpu: '12%',
      mem: '1.8 GB',
      deployed: '1d ago'
    }
  ];

  const tableBody = document.getElementById('servicesTableBody');
  const searchInput = document.getElementById('serviceSearchInput');
  const systemClock = document.getElementById('systemClock');

  // Render Table Rows
  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-tertiary);">
            No services found matching search query.
          </td>
        </tr>
      `;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement('tr');
      
      let chipClass = 'chip-running';
      if (item.status === 'deploying') chipClass = 'chip-deploying';
      if (item.status === 'scaling') chipClass = 'chip-scaling';

      tr.innerHTML = `
        <td>
          <div class="service-name-cell">
            <div class="service-icon" aria-hidden="true">⬢</div>
            <div>
              <div class="service-title">${item.name}</div>
              <span style="font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono);">${item.version}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="status-chip ${chipClass}">
            ● ${item.statusLabel}
          </span>
        </td>
        <td class="mono-metric">${item.replicas}</td>
        <td class="mono-metric">${item.latency}</td>
        <td class="mono-metric">${item.cpu} / ${item.mem}</td>
        <td style="color: var(--text-tertiary); font-size: 12px;">${item.deployed}</td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon" title="View Telemetry Logs" aria-label="Logs for ${item.name}"><span class="iconify" data-icon="lucide:file-text" data-stroke-width="2"></span></button>
            <button class="btn-icon" title="Restart Service Pods" aria-label="Restart ${item.name}"><span class="iconify" data-icon="lucide:rotate-cw" data-stroke-width="2"></span></button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  renderTable(services);

  // Search Filter with instant feedback
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = services.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.statusLabel.toLowerCase().includes(q) ||
        s.version.toLowerCase().includes(q)
      );
      renderTable(filtered);
    });

    // Keyboard shortcut Ctrl+K / Cmd+K to focus search
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Segmented Time Range Controller
  const timeBtns = document.querySelectorAll('.segment-btn');
  const throughputEl = document.getElementById('val-throughput');
  const latencyEl = document.getElementById('val-latency');
  const errorEl = document.getElementById('val-error');
  const nodesEl = document.getElementById('val-nodes');
  const primaryLine = document.getElementById('chartPrimaryLine');
  const areaPath = document.getElementById('chartAreaPath');

  const rangePresets = {
    '1h': {
      throughput: '148.2k',
      latency: '18.4 ms',
      error: '0.008%',
      nodes: '64 / 64',
      path: 'M40,140 Q120,80 200,110 T360,70 T520,90 T680,60',
      area: 'M40,180 L40,140 Q120,80 200,110 T360,70 T520,90 T680,60 L680,180 Z'
    },
    '24h': {
      throughput: '3.42M',
      latency: '21.2 ms',
      error: '0.012%',
      nodes: '64 / 64',
      path: 'M40,160 Q120,130 200,80 T360,110 T520,60 T680,85',
      area: 'M40,180 L40,160 Q120,130 200,80 T360,110 T520,60 T680,85 L680,180 Z'
    },
    '7d': {
      throughput: '24.8M',
      latency: '19.6 ms',
      error: '0.009%',
      nodes: '64 / 64',
      path: 'M40,120 Q120,90 200,140 T360,85 T520,70 T680,50',
      area: 'M40,180 L40,120 Q120,90 200,140 T360,85 T520,70 T680,50 L680,180 Z'
    },
    '30d': {
      throughput: '108.4M',
      latency: '22.1 ms',
      error: '0.014%',
      nodes: '62 / 64',
      path: 'M40,150 Q120,100 200,120 T360,60 T520,80 T680,45',
      area: 'M40,180 L40,150 Q120,100 200,120 T360,60 T520,80 T680,45 L680,180 Z'
    }
  };

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.dataset.range;
      const preset = rangePresets[range];
      if (!preset) return;

      if (throughputEl) throughputEl.textContent = preset.throughput;
      if (latencyEl) latencyEl.textContent = preset.latency;
      if (errorEl) errorEl.textContent = preset.error;
      if (nodesEl) nodesEl.textContent = preset.nodes;

      if (primaryLine) primaryLine.setAttribute('d', preset.path);
      if (areaPath) areaPath.setAttribute('d', preset.area);
    });
  });

  // Action Buttons Feedback
  const deployBtn = document.getElementById('deployServiceBtn');
  if (deployBtn) {
    deployBtn.addEventListener('click', () => {
      const originalText = deployBtn.innerHTML;
      deployBtn.disabled = true;
      deployBtn.innerHTML = `<span>Deploying Pod...</span>`;
      setTimeout(() => {
        deployBtn.innerHTML = `<span><span class="iconify" data-icon="lucide:check" data-stroke-width="2"></span> Deployed</span>`;
        setTimeout(() => {
          deployBtn.innerHTML = originalText;
          deployBtn.disabled = false;
        }, 1500);
      }, 1000);
    });
  }

  const exportBtn = document.getElementById('exportTelemetryBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const originalText = exportBtn.innerHTML;
      exportBtn.disabled = true;
      exportBtn.innerHTML = `<span>Exporting...</span>`;
      setTimeout(() => {
        exportBtn.innerHTML = `<span><span class="iconify" data-icon="lucide:check" data-stroke-width="2"></span> CSV Ready</span>`;
        setTimeout(() => {
          exportBtn.innerHTML = originalText;
          exportBtn.disabled = false;
        }, 1500);
      }, 800);
    });
  }

  // System Clock Live UTC updater
  function updateClock() {
    if (!systemClock) return;
    const now = new Date();
    systemClock.textContent = now.toUTCString().split(' ')[4] + ' UTC';
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Live Chart Micro-Jitter (Simulates real-time network stream)
  let tick = 0;
  setInterval(() => {
    tick++;
    const secondaryLine = document.getElementById('chartSecondaryLine');
    if (secondaryLine) {
      const jitter = (Math.sin(tick) * 5).toFixed(1);
      secondaryLine.setAttribute('d', `M40,${160 + parseFloat(jitter)} Q120,${110 - parseFloat(jitter)} 200,${130 + parseFloat(jitter)} T360,${100 - parseFloat(jitter)} T520,${120 + parseFloat(jitter)} T680,${95 - parseFloat(jitter)}`);
    }
  }, 3000);
});
