<script setup>
defineProps({ status: { type: String, default: 'never' } })
</script>

<template>
  <span class="badge" :class="`badge-${status || 'never'}`">
    <span class="badge-dot" />
    {{ status || 'never' }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-ok { color: var(--green); background: var(--green-dim); border-color: #2ea04326; }
.badge-ok .badge-dot { background: var(--green); }

.badge-failed { color: var(--red); background: var(--red-dim); border-color: #f8514926; }
.badge-failed .badge-dot { background: var(--red); }

.badge-running { color: var(--accent); background: var(--accent-dim); border-color: #58a6ff26; }
.badge-running .badge-dot { background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }

.badge-never, .badge-pending {
  color: var(--text-dim); background: var(--border); border-color: var(--border-mid);
}
.badge-never .badge-dot, .badge-pending .badge-dot { background: var(--text-dim); }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
</style>