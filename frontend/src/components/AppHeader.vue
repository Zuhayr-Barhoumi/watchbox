<script setup>
import { ref, onMounted } from 'vue'
defineEmits(['open-settings'])

const isDark = ref(true)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('light', !isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved ? saved === 'dark' : prefersDark
  isDark.value = dark
  document.documentElement.classList.toggle('light', !dark)
})
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
      <button class="btn-icon" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
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