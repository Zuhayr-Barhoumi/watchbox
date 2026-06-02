<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import JobsTable from './components/JobsTable.vue'
import EmptyState from './components/EmptyState.vue'
import JobModal from './components/JobModal.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import StatusBar from './components/StatusBar.vue'

// ── State ──────────────────────────────────────────
const jobs = ref([
  {
    ID: 1, Name: 'Daily Reports', LocalPath: '/home/user/reports',
    S3Bucket: 'my-bucket', S3Key: 'backups/reports/', Schedule: '02:00',
    Enabled: true, LastRun: '2026-05-29 02:00', LastStatus: 'ok', LastError: ''
  },
  {
    ID: 2, Name: 'Project Assets', LocalPath: '/home/user/assets',
    S3Bucket: 'my-bucket', S3Key: 'backups/assets/', Schedule: '14:30',
    Enabled: true, LastRun: '2026-05-28 14:30', LastStatus: 'failed',
    LastError: 'AccessDenied: s3:PutObject'
  },
  {
    ID: 3, Name: 'Config Backup', LocalPath: '/etc/myapp',
    S3Bucket: 'config-store', S3Key: 'server1/', Schedule: '00:00',
    Enabled: false, LastRun: null, LastStatus: 'never', LastError: ''
  },
])

const modalOpen = ref(false)
const editingJob = ref(null)
const settingsOpen = ref(false)
const confirmOpen = ref(false)
const pendingDeleteId = ref(null)

// ── Job actions ────────────────────────────────────
function openAddModal() {
  editingJob.value = null
  modalOpen.value = true
}

function openEditModal(job) {
  editingJob.value = { ...job }
  modalOpen.value = true
}

function saveJob(job) {
  if (job.ID) {
    // TODO: wire to Go → UpdateJob(job)
    const idx = jobs.value.findIndex(j => j.ID === job.ID)
    if (idx !== -1) jobs.value[idx] = job
  } else {
    // TODO: wire to Go → CreateJob(job)
    jobs.value.push({ ...job, ID: Date.now(), LastStatus: 'never', LastRun: null })
  }
  modalOpen.value = false
}

function runJob(id) {
  // TODO: wire to Go → RunJobNow(id)
  const job = jobs.value.find(j => j.ID === id)
  if (!job) return
  job.LastStatus = 'running'
  setTimeout(() => {
    job.LastStatus = 'ok'
    job.LastRun = new Date().toLocaleString()
  }, 2000)
}

function runAll() {
  jobs.value.filter(j => j.Enabled).forEach(j => runJob(j.ID))
}

function toggleJob(id, enabled) {
  // TODO: wire to Go → UpdateJob(...)
  const job = jobs.value.find(j => j.ID === id)
  if (job) job.Enabled = enabled
}

function requestDelete(id) {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

function confirmDelete() {
  // TODO: wire to Go → DeleteJob(pendingDeleteId)
  jobs.value = jobs.value.filter(j => j.ID !== pendingDeleteId.value)
  pendingDeleteId.value = null
  confirmOpen.value = false
}
</script>

<template>
  <div class="layout">
    <AppHeader @open-settings="settingsOpen = true" />

    <main class="main">
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="section-label">Jobs</span>
          <span class="job-count">{{ jobs.length }}</span>
        </div>
        <div class="toolbar-right">
          <button v-if="jobs.some(j => j.Enabled)" class="btn btn-ghost" @click="runAll">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>
            Run all
          </button>
          <button class="btn btn-primary" @click="() => { console.log('clicked'); modalOpen.value = true }">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg>
            Add job
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <EmptyState v-if="jobs.length === 0" @add="() => { console.log('clicked'); modalOpen.value = true }" />
        <JobsTable
          v-else
          :jobs="jobs"
          @edit="openEditModal"
          @delete="requestDelete"
          @run="runJob"
          @toggle="toggleJob"
        />
      </div>
    </main>

    <StatusBar :jobs="jobs" />

    <JobModal
      :open="modalOpen"
      :job="editingJob"
      @save="saveJob"
      @close="modalOpen = false"
    />

    <SettingsPanel
      :open="settingsOpen"
      @close="settingsOpen = false"
    />

    <ConfirmDialog
      :open="confirmOpen"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>


<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.job-count {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-dim);
  background: var(--border);
  padding: 1px 7px;
  border-radius: 10px;
}

.table-wrap {
  flex: 1;
  overflow-y: auto;
}

.table-wrap::-webkit-scrollbar { width: 6px; }
.table-wrap::-webkit-scrollbar-track { background: transparent; }
.table-wrap::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 3px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  line-height: 1;
}

.btn-primary {
  background: var(--accent);
  color: #0d0f11;
  border-color: var(--accent);
}

.btn-primary:hover { background: #79b8ff; border-color: #79b8ff; }

.btn-ghost {
  background: transparent;
  color: var(--text-dim);
  border-color: var(--border-mid);
}

.btn-ghost:hover { color: var(--text); border-color: var(--text-dim); background: var(--border); }
</style>