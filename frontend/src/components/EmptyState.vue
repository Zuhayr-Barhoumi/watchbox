<script setup>
defineEmits(['add'])
</script>

<template>
  <div class="empty">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5">
        <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor"/>
        <path d="M8 12h8M12 8v8" stroke="currentColor"/>
      </svg>
    </div>
    <p class="empty-title">No jobs yet</p>
    <p class="empty-sub">Add a job to start watching folders and uploading to S3.</p>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  min-height: 300px;
  color: var(--text-dim);
}

.empty-icon {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-mid);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg { width: 22px; height: 22px; }

.empty-title { font-size: 14px; color: var(--text); font-weight: 500; }
.empty-sub { font-size: 12px; }
</style>