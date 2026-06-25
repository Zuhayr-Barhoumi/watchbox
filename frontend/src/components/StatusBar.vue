<script setup>
defineProps({
  jobs: Array,
})
</script>

<template>
  <div class="statusbar">
    <div class="status-item">
      <span class="status-dot"></span>
      <span>{{ activeCount }} active</span>
      <span v-if="failedCount > 0" class="failed-count">· {{ failedCount }} failed</span>
    </div>
    <div class="status-item" style="margin-left: auto">watchbox</div>
  </div>
</template>

<script>
export default {
  computed: {
    activeCount() {
      return this.jobs.filter(j => j.Enabled).length
    },
    failedCount() {
      return this.jobs.filter(j => j.LastStatus === 'failed').length
    }
  }
}
</script>

<style scoped>
.statusbar {
  height: 24px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  flex-shrink: 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-dim);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green);
}

.failed-count {
  color: var(--red);
}
</style>