<script setup>
defineEmits(['open-settings'])
</script>

<template>
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
      <button class="btn-icon" @click="$emit('open-settings')" title="Settings">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="8" cy="8" r="2.5"/>
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 22px;
  height: 22px;
  background: var(--accent);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-mark svg {
  width: 13px;
  height: 13px;
  fill: #0d0f11;
}

.app-name {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-bright);
  letter-spacing: 0.02em;
}

.app-version {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-dim);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.btn-icon:hover {
  color: var(--text);
  background: var(--border);
}

.btn-icon svg {
  width: 15px;
  height: 15px;
}
</style>