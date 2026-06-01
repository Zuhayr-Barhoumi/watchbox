<script setup>
defineProps({ open: Boolean })
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" :class="{ open }" @click.self="$emit('cancel')">
      <div class="box">
        <p class="box-title">Delete job?</p>
        <p class="box-msg">
          This will permanently remove the job and its upload history.
          Files already on S3 are not affected.
        </p>
        <div class="box-actions">
          <button class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
          <button class="btn btn-danger" @click="$emit('confirm')">Delete</button>
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
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.backdrop.open { opacity: 1; pointer-events: all; }

.box {
  background: var(--surface);
  border: 1px solid var(--border-mid);
  border-radius: 6px;
  padding: 20px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.box-title { font-size: 13px; font-weight: 500; color: var(--text-bright); }
.box-msg { font-size: 12px; color: var(--text-dim); line-height: 1.6; }

.box-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s;
  line-height: 1.6;
}

.btn-ghost { background: transparent; color: var(--text-dim); border-color: var(--border-mid); }
.btn-ghost:hover { color: var(--text); background: var(--border); }

.btn-danger { background: transparent; color: var(--red); border-color: var(--red); }
.btn-danger:hover { background: var(--red-dim); }
</style>