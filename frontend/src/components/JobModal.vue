<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  open: Boolean,
  job: Object,
})

const emit = defineEmits(['save', 'close'])

const form = ref({ Name: '', LocalPath: '', S3Bucket: '', S3Key: '', Schedule: '00:00', Enabled: true })
const errors = ref({})

// Populate form when modal mounts (v-if recreates component)
onMounted(() => {
  form.value = props.job
    ? { ...props.job }
    : { Name: '', LocalPath: '', S3Bucket: '', S3Key: '', Schedule: '00:00', Enabled: true }
  errors.value = {}
})

function validate() {
  const e = {}
  if (!form.value.Name.trim()) e.Name = 'Name is required'
  if (!form.value.LocalPath.trim()) e.LocalPath = 'Path is required'
  if (!form.value.S3Bucket.trim()) e.S3Bucket = 'Bucket is required'
  if (!form.value.S3Key.trim()) e.S3Key = 'Prefix is required'
  errors.value = e
  return Object.keys(e).length === 0
}

function save() {
  if (!validate()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ job ? 'Edit job' : 'New job' }}</span>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label for="f-name">Job name</label>
            <input
              id="f-name"
              v-model="form.Name"
              type="text"
              placeholder="e.g. Daily Reports"
              :class="{ error: errors.Name }"
            />
            <span v-if="errors.Name" class="field-error">{{ errors.Name }}</span>
          </div>

          <div class="field">
            <label for="f-path">Watch path</label>
            <input
              id="f-path"
              v-model="form.LocalPath"
              type="text"
              placeholder="/home/user/documents"
              :class="{ error: errors.LocalPath }"
            />
            <span v-if="errors.LocalPath" class="field-error">{{ errors.LocalPath }}</span>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="f-bucket">S3 bucket</label>
              <input
                id="f-bucket"
                v-model="form.S3Bucket"
                type="text"
                placeholder="my-bucket"
                :class="{ error: errors.S3Bucket }"
              />
              <span v-if="errors.S3Bucket" class="field-error">{{ errors.S3Bucket }}</span>
            </div>
            <div class="field">
              <label for="f-key">S3 prefix</label>
              <input
                id="f-key"
                v-model="form.S3Key"
                type="text"
                placeholder="backups/folder/"
                :class="{ error: errors.S3Key }"
              />
              <span v-if="errors.S3Key" class="field-error">{{ errors.S3Key }}</span>
            </div>
          </div>

          <div class="field">
            <label for="f-schedule">Daily schedule</label>
            <input id="f-schedule" v-model="form.Schedule" type="time" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="save">
            {{ job ? 'Save changes' : 'Create job' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border-mid);
  border-radius: 6px;
  width: 460px;
  max-width: calc(100vw - 40px);
  transform: translateY(8px);
  transition: transform 0.15s;
  animation: modalIn 0.15s ease-out forwards;
}

@keyframes modalIn {
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-bright);
}

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

.modal-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--mono);
}

input[type="text"],
input[type="time"] {
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

input:focus { border-color: var(--accent); }
input.error { border-color: var(--red); }

.field-error {
  font-size: 11px;
  color: var(--red);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  line-height: 1.6;
}

.btn-primary { background: var(--accent); color: #0d0f11; border-color: var(--accent); }
.btn-primary:hover { background: #79b8ff; }

.btn-ghost { background: transparent; color: var(--text-dim); border-color: var(--border-mid); }
.btn-ghost:hover { color: var(--text); background: var(--border); }
</style>