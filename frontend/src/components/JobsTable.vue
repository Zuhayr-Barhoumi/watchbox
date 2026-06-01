<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({ jobs: Array })
defineEmits(['edit', 'delete', 'run', 'toggle'])
</script>

<template>
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
      <tr v-for="job in jobs" :key="job.ID" class="job-row">
        <!-- Toggle -->
        <td>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="job.Enabled"
              @change="$emit('toggle', job.ID, $event.target.checked)"
            />
            <span class="toggle-track" />
          </label>
        </td>

        <!-- Name -->
        <td class="td-name">{{ job.Name }}</td>

        <!-- Watch path -->
        <td>
          <span class="td-mono td-truncate" :title="job.LocalPath">
            {{ job.LocalPath }}
          </span>
        </td>

        <!-- S3 destination -->
        <td>
          <span class="td-mono td-truncate" :title="`s3://${job.S3Bucket}/${job.S3Key}`">
            s3://{{ job.S3Bucket }}/{{ job.S3Key }}
          </span>
        </td>

        <!-- Schedule -->
        <td class="td-mono">{{ job.Schedule }}</td>

        <!-- Status -->
        <td>
          <StatusBadge :status="job.LastStatus" />
        </td>

        <!-- Last run -->
        <td class="td-mono td-dim">{{ job.LastRun || '—' }}</td>

        <!-- Actions -->
        <td>
          <div class="actions">
            <button class="action-btn" @click="$emit('run', job.ID)" title="Run now">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>
            </button>
            <button class="action-btn" @click="$emit('edit', job)" title="Edit">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/>
              </svg>
            </button>
            <button class="action-btn action-btn--danger" @click="$emit('delete', job.ID)" title="Delete">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 8px 16px;
  text-align: left;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 1;
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

tbody tr:hover { background: var(--surface); }

tbody td {
  padding: 10px 16px;
  vertical-align: middle;
}

.td-name {
  font-weight: 500;
  color: var(--text-bright);
}

.td-mono {
  font-family: var(--mono);
  font-size: 11px;
}

.td-dim { color: var(--text-dim); }

.td-truncate {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-dim);
}

/* Toggle */
.toggle {
  position: relative;
  width: 32px;
  height: 18px;
  display: block;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-track {
  position: absolute;
  inset: 0;
  background: var(--border-mid);
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle input:checked + .toggle-track {
  background: var(--accent-dim);
  border: 1px solid var(--accent);
}

.toggle-track::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--text-dim);
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s, background 0.2s;
}

.toggle input:checked + .toggle-track::after {
  transform: translateX(14px);
  background: var(--accent);
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.job-row:hover .actions { opacity: 1; }

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.action-btn svg { width: 13px; height: 13px; }

.action-btn:hover {
  color: var(--text);
  background: var(--border);
}

.action-btn--danger:hover {
  color: var(--red);
  background: var(--red-dim);
}
</style>