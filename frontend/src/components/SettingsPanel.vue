<script setup>
import { ref } from 'vue'

defineProps({ open: Boolean })
defineEmits(['close'])

const form = ref({ keyId: '', secret: '', region: 'us-east-1' })
const connStatus = ref(null) // null | 'ok' | 'fail'
const testing = ref(false)

const regions = [
  'us-east-1', 'us-west-2', 'eu-west-1',
  'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'
]

async function testConnection() {
  testing.value = true
  connStatus.value = null
  // TODO: wire to Go → TestAWSConnection()
  await new Promise(r => setTimeout(r, 1000))
  connStatus.value = 'ok'
  testing.value = false
}

function save() {
  // TODO: wire to Go → SaveConfig(form.value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Settings</span>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        <div class="panel-body">
          <div class="section-label">AWS Credentials</div>

          <div class="field">
            <label for="s-key-id">Access Key ID</label>
            <input id="s-key-id" v-model="form.keyId" type="text" placeholder="AKIAIOSFODNN7EXAMPLE" />
          </div>

          <div class="field">
            <label for="s-secret">Secret Access Key</label>
            <input id="s-secret" v-model="form.secret" type="password" placeholder="••••••••••••••••••••" />
          </div>

          <div class="field">
            <label for="s-region">Region</label>
            <select id="s-region" v-model="form.region">
              <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <div v-if="connStatus" class="conn-result" :class="connStatus">
            {{ connStatus === 'ok' ? '✓ Connection successful' : '✗ Connection failed' }}
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn btn-ghost" :disabled="testing" @click="testConnection">
            {{ testing ? 'Testing…' : 'Test connection' }}
          </button>
          <button class="btn btn-primary" @click="save">Save settings</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  background: var(--surface);
  border-left: 1px solid var(--border-mid);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.2s ease;
  animation: panelIn 0.2s ease forwards;
}

@keyframes panelIn {
  to { transform: translateX(0); }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.panel-title { font-size: 13px; font-weight: 500; color: var(--text-bright); }

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
}

.close-btn:hover { background: var(--border); color: var(--text); }
.close-btn svg { width: 14px; height: 14px; }

.panel-body {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.panel-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field { display: flex; flex-direction: column; gap: 5px; }

label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--mono);
}

input, select {
  background: var(--bg);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}

input:focus, select:focus { border-color: var(--accent); }

.conn-result {
  font-family: var(--mono);
  font-size: 11px;
  padding: 6px 10px;
  border-radius: var(--radius);
}

.conn-result.ok { color: var(--green); background: var(--green-dim); }
.conn-result.fail { color: var(--red); background: var(--red-dim); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s;
  line-height: 1.4;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--accent); color: #0d0f11; border-color: var(--accent); }
.btn-primary:hover:not(:disabled) { background: #79b8ff; }
.btn-ghost { background: transparent; color: var(--text-dim); border-color: var(--border-mid); }
.btn-ghost:hover:not(:disabled) { color: var(--text); background: var(--border); }
</style>