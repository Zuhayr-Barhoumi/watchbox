<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import JobsTable from './components/JobsTable.vue'
import EmptyState from './components/EmptyState.vue'
import JobModal from './components/JobModal.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import StatusBar from './components/StatusBar.vue'
import { GetAllJobs, CreateJob, UpdateJob, DeleteJob, RunJobNow, GetJobByID } from '../wailsjs/go/main/App'
import { EventsOn } from '../wailsjs/runtime/runtime'
import type { Job } from '../wailsjs/go/models'

// ── State ──────────────────────────────────────────
const jobs = ref<Job[]>([])
const modalOpen = ref(false)
const editingJob = ref<Job | null>(null)
const settingsOpen = ref(false)
const confirmOpen = ref(false)
const pendingDeleteId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// ── Job actions ────────────────────────────────────
function openAddModal() {
  editingJob.value = null
  modalOpen.value = true
}

function openEditModal(job: Job) {
  editingJob.value = { ...job }
  modalOpen.value = true
}

async function saveJob(job: Job) {
  loading.value = true
  error.value = null
  try {
    if (job.ID) {
      await UpdateJob(job)
      const idx = jobs.value.findIndex(j => j.ID === job.ID)
      if (idx !== -1) jobs.value[idx] = job
    } else {
      const newId = await CreateJob(job)
      jobs.value.push({ ...job, ID: newId, LastStatus: 'never', LastRun: undefined, LastError: undefined, CreatedAt: new Date().toISOString() })
    }
    modalOpen.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save job'
  } finally {
    loading.value = false
  }
}

async function runJob(id: number) {
  const job = jobs.value.find(j => j.ID === id)
  if (!job) return
  job.LastStatus = 'running'
  try {
    await RunJobNow(id)
    // The backend will emit an event when job completes
    // For now, we'll simulate completion
    setTimeout(async () => {
      const updated = await GetJobByID(id)
      if (updated) {
        const idx = jobs.value.findIndex(j => j.ID === id)
        if (idx !== -1) jobs.value[idx] = updated
      }
    }, 2000)
  } catch (e) {
    job.LastStatus = 'failed'
    job.LastError = e instanceof Error ? e.message : 'Failed to run job'
  }
}

async function runAll() {
  const enabledJobs = jobs.value.filter(j => j.Enabled)
  for (const job of enabledJobs) {
    await runJob(job.ID)
  }
}

async function toggleJob(id: number, enabled: boolean) {
  const job = jobs.value.find(j => j.ID === id)
  if (!job) return
  const previousEnabled = job.Enabled
  job.Enabled = enabled
  try {
    await UpdateJob(job)
  } catch (e) {
    job.Enabled = previousEnabled
    error.value = e instanceof Error ? e.message : 'Failed to update job'
  }
}

function requestDelete(id: number) {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!pendingDeleteId.value) return
  loading.value = true
  error.value = null
  try {
    await DeleteJob(pendingDeleteId.value)
    jobs.value = jobs.value.filter(j => j.ID !== pendingDeleteId.value)
    pendingDeleteId.value = null
    confirmOpen.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to delete job'
  } finally {
    loading.value = false
  }
}

// ── Initialization ─────────────────────────────────
async function loadJobs() {
  loading.value = true
  error.value = null
  try {
    const loadedJobs = await GetAllJobs()
    jobs.value = loadedJobs
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load jobs'
  } finally {
    loading.value = false
  }
}

// Listen for real-time job updates from Go backend
onMounted(() => {
  loadJobs()
  
  EventsOn('job:updated', (updatedJob: Job) => {
    const idx = jobs.value.findIndex(j => j.ID === updatedJob.ID)
    if (idx !== -1) {
      jobs.value[idx] = updatedJob
    }
  })
  
  EventsOn('job:created', (newJob: Job) => {
    jobs.value.push(newJob)
  })
  
  EventsOn('job:deleted', (deletedId: number) => {
    jobs.value = jobs.value.filter(j => j.ID !== deletedId)
  })
})
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
          <button class="btn btn-primary" @click="openAddModal">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg>
            Add job
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <EmptyState v-if="jobs.length === 0" @add="openAddModal" />
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