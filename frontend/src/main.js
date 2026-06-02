import './style.css';
// Wails bindings — these will exist once you expose them in app.go
// import { GetAllJobs, CreateJob, UpdateJob, DeleteJob } from '../wailsjs/go/main/App';
// import { EventsOn } from '../wailsjs/runtime/runtime';

// ── State ──────────────────────────────────────────
let jobs = [];
let editingJob = null;
let pendingDeleteId = null;

// ── Mock data for development (remove when wiring Go) ──
const mockJobs = [
  {
    ID: 1, Name: 'Daily Reports', LocalPath: '/home/user/reports',
    S3Bucket: 'my-bucket', S3Key: 'backups/reports/', Schedule: '02:00',
    Enabled: true, LastRun: '2026-05-29 02:00', LastStatus: 'ok', LastError: ''
  },
  {
    ID: 2, Name: 'Project Assets', LocalPath: '/home/user/assets',
    S3Bucket: 'my-bucket', S3Key: 'backups/assets/', Schedule: '14:30',
    Enabled: true, LastRun: '2026-05-28 14:30', LastStatus: 'failed', LastError: 'AccessDenied: s3:PutObject'
  },
  {
    ID: 3, Name: 'Config Backup', LocalPath: '/etc/myapp',
    S3Bucket: 'config-store', S3Key: 'server1/', Schedule: '00:00',
    Enabled: false, LastRun: null, LastStatus: 'never', LastError: ''
  },
];

// ── Render ─────────────────────────────────────────
function render() {
  document.querySelector('#app').innerHTML = `
    ${renderHeader()}
    <div class="main">
      ${renderToolbar()}
      <div class="table-wrap">
        ${jobs.length === 0 ? renderEmpty() : renderTable()}
      </div>
    </div>
    ${renderStatusBar()}
    ${renderModal()}
    ${renderSettings()}
    ${renderConfirm()}
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="header">
      <div class="header-left">
        <div class="logo-mark">
          <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="5" height="5" rx="1"/>
            <rect x="8" y="1" width="5" height="5" rx="1"/>
            <rect x="1" y="8" width="5" height="5" rx="1"/>
            <rect x="8" y="8" width="5" height="5" rx="1"/>
          </svg>
        </div>
        <span class="app-name">watchbox</span>
        <span class="app-version">v0.1.0</span>
      </div>
      <div class="header-right">
        <button class="btn btn-icon" id="btn-settings" title="Settings">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
          </svg>
        </button>
      </div>
    </header>
  `;
}

function renderToolbar() {
  const enabled = jobs.filter(j => j.Enabled).length;
  return `
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="section-label">Jobs</span>
        <span class="job-count">${jobs.length}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${enabled > 0 ? `<button class="btn btn-ghost" id="btn-run-all">
          <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5l10 5.5-10 5.5V2.5z"/>
          </svg>
          Run all
        </button>` : ''}
        <button class="btn btn-primary" id="btn-add">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3v10M3 8h10"/>
          </svg>
          Add job
        </button>
      </div>
    </div>
  `;
}

function renderTable() {
  return `
    <table>
      <thead>
        <tr>
          <th style="width:32px"></th>
          <th>Name</th>
          <th>Watch path</th>
          <th>S3 destination</th>
          <th>Schedule</th>
          <th>Status</th>
          <th>Last run</th>
          <th style="width:100px"></th>
        </tr>
      </thead>
      <tbody>
        ${jobs.map(renderRow).join('')}
      </tbody>
    </table>
  `;
}

function renderRow(job) {
  const s3dest = `s3://${job.S3Bucket}/${job.S3Key}`;
  const lastrun = job.LastRun ? job.LastRun : '—';
  return `
    <tr data-id="${job.ID}">
      <td>
        <label class="toggle">
          <input type="checkbox" ${job.Enabled ? 'checked' : ''} data-toggle="${job.ID}"/>
          <span class="toggle-track"></span>
        </label>
      </td>
      <td class="td-name">${esc(job.Name)}</td>
      <td><span class="td-path" title="${esc(job.LocalPath)}">${esc(job.LocalPath)}</span></td>
      <td><span class="td-s3" title="${esc(s3dest)}">${esc(s3dest)}</span></td>
      <td class="td-schedule">${esc(job.Schedule)}</td>
      <td>${renderBadge(job.LastStatus)}</td>
      <td class="td-lastrun">${esc(lastrun)}</td>
      <td class="td-actions">
        <div class="actions-group">
          <button class="btn btn-icon" data-run="${job.ID}" title="Run now">
            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2.5l10 5.5-10 5.5V2.5z"/>
            </svg>
          </button>
          <button class="btn btn-icon" data-edit="${job.ID}" title="Edit">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/>
            </svg>
          </button>
          <button class="btn btn-danger" data-delete="${job.ID}" title="Delete">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderBadge(status) {
  const s = status || 'never';
  const labels = { ok: 'ok', failed: 'failed', running: 'running', pending: 'pending', never: 'never' };
  return `<span class="badge badge-${s}"><span class="badge-dot"></span>${labels[s] || s}</span>`;
}

function renderEmpty() {
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor"/>
          <path d="M8 12h8M12 8v8" stroke="currentColor"/>
        </svg>
      </div>
      <div class="empty-title">No jobs yet</div>
      <div class="empty-sub">Add a job to start watching folders and uploading to S3.</div>
      <button class="btn btn-primary" id="btn-add-empty">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3v10M3 8h10"/>
        </svg>
        Add first job
      </button>
    </div>
  `;
}

function renderStatusBar() {
  const enabled = jobs.filter(j => j.Enabled).length;
  const failed = jobs.filter(j => j.LastStatus === 'failed').length;
  return `
    <div class="statusbar">
      <div class="status-item">
        <span class="status-dot" style="${failed > 0 ? 'background:var(--red)' : ''}"></span>
        ${enabled} active
        ${failed > 0 ? `· <span style="color:var(--red)">${failed} failed</span>` : ''}
      </div>
      <div class="status-item" style="margin-left:auto">watchbox</div>
    </div>
  `;
}

// ── Modal ──────────────────────────────────────────
function renderModal() {
  const job = editingJob;
  const isEdit = job && job.ID;
  const v = job || { Name:'', LocalPath:'', S3Bucket:'', S3Key:'', Schedule:'00:00', Enabled: true };
  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${isEdit ? 'Edit job' : 'New job'}</span>
          <button class="btn btn-icon" id="modal-close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label for="f-name">Job name</label>
            <input type="text" id="f-name" placeholder="e.g. Daily Reports" value="${esc(v.Name)}"/>
            <span class="field-error" id="err-name">Name is required</span>
          </div>
          <div class="field">
            <label for="f-path">Watch path</label>
            <input type="text" id="f-path" placeholder="/home/user/documents" value="${esc(v.LocalPath)}"/>
            <span class="field-error" id="err-path">Path is required</span>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-bucket">S3 bucket</label>
              <input type="text" id="f-bucket" placeholder="my-bucket" value="${esc(v.S3Bucket)}"/>
              <span class="field-error" id="err-bucket">Bucket is required</span>
            </div>
            <div class="field">
              <label for="f-key">S3 prefix</label>
              <input type="text" id="f-key" placeholder="backups/folder/" value="${esc(v.S3Key)}"/>
              <span class="field-error" id="err-key">Prefix is required</span>
            </div>
          </div>
          <div class="field">
            <label for="f-schedule">Daily schedule (HH:MM)</label>
            <input type="time" id="f-schedule" value="${esc(v.Schedule || '00:00')}"/>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-save">${isEdit ? 'Save changes' : 'Create job'}</button>
        </div>
      </div>
    </div>
  `;
}

// ── Settings ───────────────────────────────────────
function renderSettings() {
  return `
    <div class="settings-backdrop" id="settings-backdrop">
      <div class="settings-panel">
        <div class="settings-header">
          <span class="settings-title">Settings</span>
          <button class="btn btn-icon" id="settings-close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="field">
            <label for="s-key-id">AWS Access Key ID</label>
            <input type="text" id="s-key-id" placeholder="AKIAIOSFODNN7EXAMPLE"/>
          </div>
          <div class="field">
            <label for="s-secret">AWS Secret Access Key</label>
            <input type="text" id="s-secret" placeholder="wJalrXUtnFEMI/K7MDENG/..."/>
          </div>
          <div class="field">
            <label for="s-region">AWS Region</label>
            <select id="s-region">
              <option value="us-east-1">us-east-1</option>
              <option value="us-west-2">us-west-2</option>
              <option value="eu-west-1">eu-west-1</option>
              <option value="eu-central-1">eu-central-1</option>
              <option value="ap-southeast-1">ap-southeast-1</option>
              <option value="ap-northeast-1">ap-northeast-1</option>
            </select>
          </div>
          <div id="conn-result" class="conn-result"></div>
        </div>
        <div class="settings-footer">
          <button class="btn btn-ghost" id="btn-test-conn">Test connection</button>
          <button class="btn btn-primary" id="btn-save-settings">Save settings</button>
        </div>
      </div>
    </div>
  `;
}

// ── Confirm ────────────────────────────────────────
function renderConfirm() {
  return `
    <div class="confirm-backdrop" id="confirm-backdrop">
      <div class="confirm-box">
        <div class="confirm-title">Delete job?</div>
        <div class="confirm-msg">This will permanently remove the job and its history. Files on S3 are not affected.</div>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Delete</button>
        </div>
      </div>
    </div>
  `;
}

// ── Events ─────────────────────────────────────────
function bindEvents() {
  // Add job buttons
  on('btn-add', 'click', () => openModal(null));
  on('btn-add-empty', 'click', () => openModal(null));
  on('btn-run-all', 'click', runAll);

  // Modal
  on('modal-backdrop', 'click', (e) => { if (e.target.id === 'modal-backdrop') closeModal(); });
  on('modal-close', 'click', closeModal);
  on('modal-cancel', 'click', closeModal);
  on('modal-save', 'click', saveJob);

  // Settings
  on('btn-settings', 'click', openSettings);
  on('settings-backdrop', 'click', (e) => { if (e.target.id === 'settings-backdrop') closeSettings(); });
  on('settings-close', 'click', closeSettings);
  on('btn-test-conn', 'click', testConnection);
  on('btn-save-settings', 'click', saveSettings);

  // Confirm delete
  on('confirm-cancel', 'click', closeConfirm);
  on('confirm-ok', 'click', confirmDelete);

  // Table row actions (delegated)
  document.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', () => {
      const job = jobs.find(j => j.ID === parseInt(el.dataset.edit));
      if (job) openModal(job);
    });
  });

  document.querySelectorAll('[data-delete]').forEach(el => {
    el.addEventListener('click', () => {
      pendingDeleteId = parseInt(el.dataset.delete);
      openConfirm();
    });
  });

  document.querySelectorAll('[data-run]').forEach(el => {
    el.addEventListener('click', () => runJob(parseInt(el.dataset.run)));
  });

  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('change', () => toggleJob(parseInt(el.dataset.toggle), el.checked));
  });
}

// ── Modal logic ────────────────────────────────────
function openModal(job) {
  editingJob = job ? { ...job } : { Name:'', LocalPath:'', S3Bucket:'', S3Key:'', Schedule:'00:00', Enabled: true };
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal() {
  editingJob = null;
  document.getElementById('modal-backdrop').classList.remove('open');
  clearErrors();
}

function clearErrors() {
  ['name','path','bucket','key'].forEach(f => {
    const el = document.getElementById(`err-${f}`);
    const inp = document.getElementById(`f-${f}`);
    if (el) el.classList.remove('visible');
    if (inp) inp.classList.remove('error');
  });
}

function validateModal() {
  clearErrors();
  let valid = true;
  const fields = [
    { id: 'f-name', err: 'err-name' },
    { id: 'f-path', err: 'err-path' },
    { id: 'f-bucket', err: 'err-bucket' },
    { id: 'f-key', err: 'err-key' },
  ];
  fields.forEach(({ id, err }) => {
    const inp = document.getElementById(id);
    if (!inp.value.trim()) {
      inp.classList.add('error');
      document.getElementById(err).classList.add('visible');
      valid = false;
    }
  });
  return valid;
}

function saveJob() {
  if (!validateModal()) return;

  const job = {
    ID: editingJob.ID || 0,
    Name: document.getElementById('f-name').value.trim(),
    LocalPath: document.getElementById('f-path').value.trim(),
    S3Bucket: document.getElementById('f-bucket').value.trim(),
    S3Key: document.getElementById('f-key').value.trim(),
    Schedule: document.getElementById('f-schedule').value,
    Enabled: editingJob.Enabled ?? true,
    LastRun: editingJob.LastRun || null,
    LastStatus: editingJob.LastStatus || 'never',
    LastError: editingJob.LastError || '',
    CreatedAt: editingJob.CreatedAt || new Date().toISOString(),
  };

  if (job.ID) {
    // UpdateJob(job)  ← wire this to Go
    jobs = jobs.map(j => j.ID === job.ID ? job : j);
  } else {
    // CreateJob(job)  ← wire this to Go
    job.ID = Date.now(); // temp ID until Go returns real one
    jobs.push(job);
  }

  closeModal();
  render();
}

// ── Job actions ────────────────────────────────────
function runJob(id) {
  // RunJobNow(id)  ← wire to Go
  jobs = jobs.map(j => j.ID === id ? { ...j, LastStatus: 'running' } : j);
  render();
  // Simulate completion for now
  setTimeout(() => {
    jobs = jobs.map(j => j.ID === id ? { ...j, LastStatus: 'ok', LastRun: new Date().toLocaleString() } : j);
    render();
  }, 2000);
}

function runAll() {
  jobs.filter(j => j.Enabled).forEach(j => runJob(j.ID));
}

function toggleJob(id, enabled) {
  // UpdateJob(...)  ← wire to Go
  jobs = jobs.map(j => j.ID === id ? { ...j, Enabled: enabled } : j);
  // re-render just statusbar count
  const sb = document.querySelector('.statusbar');
  if (sb) {
    const enabled_count = jobs.filter(j => j.Enabled).length;
    const failed = jobs.filter(j => j.LastStatus === 'failed').length;
    sb.querySelector('.status-item').innerHTML = `
      <span class="status-dot" style="${failed > 0 ? 'background:var(--red)' : ''}"></span>
      ${enabled_count} active
      ${failed > 0 ? `· <span style="color:var(--red)">${failed} failed</span>` : ''}
    `;
  }
}

// ── Delete ─────────────────────────────────────────
function openConfirm() {
  document.getElementById('confirm-backdrop').classList.add('open');
}

function closeConfirm() {
  pendingDeleteId = null;
  document.getElementById('confirm-backdrop').classList.remove('open');
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  // DeleteJob(pendingDeleteId)  ← wire to Go
  jobs = jobs.filter(j => j.ID !== pendingDeleteId);
  closeConfirm();
  render();
}

// ── Settings logic ─────────────────────────────────
function openSettings() {
  document.getElementById('settings-backdrop').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-backdrop').classList.remove('open');
}

function testConnection() {
  const result = document.getElementById('conn-result');
  result.className = 'conn-result';
  result.textContent = 'Testing...';
  result.style.display = 'block';
  // TestAWSConnection()  ← wire to Go
  setTimeout(() => {
    result.className = 'conn-result ok';
    result.textContent = '✓ Connection successful';
  }, 1000);
}

function saveSettings() {
  // SaveConfig(...)  ← wire to Go
  closeSettings();
}

// ── Utilities ──────────────────────────────────────
function on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ───────────────────────────────────────────
async function init() {
  // When Go is wired, replace this with:
  // jobs = await GetAllJobs();
  jobs = mockJobs;
  render();

  // Live updates from Go scheduler:
  // EventsOn("job:updated", (updatedJob) => {
  //   jobs = jobs.map(j => j.ID === updatedJob.ID ? updatedJob : j);
  //   render();
  // });
}

init();