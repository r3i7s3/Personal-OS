<script setup>
import { useToastStore } from '../stores/toast'
const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="t in toastStore.toasts"
        :key="t.id"
        class="toast-item"
        :class="{ streak: t.isStreak }"
        @click="toastStore.dismiss(t.id)"
      >
        <span class="toast-emoji">{{ t.emoji }}</span>
        <span class="toast-text">{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  padding: 12px 18px;
  box-shadow: var(--sh2);
  font-size: 13px;
  color: var(--fg1);
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
  cursor: pointer;
  max-width: 320px;
}

.toast-item.streak {
  border-color: var(--warn);
  background: linear-gradient(135deg, var(--bg1), var(--warn-bg));
}

.toast-emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  line-height: 1.4;
}

/* TransitionGroup animations */
.toast-enter-active {
  animation: toast-in .35s cubic-bezier(.21, 1.02, .73, 1) forwards;
}
.toast-leave-active {
  animation: toast-out .25s cubic-bezier(.4, 0, 1, 1) forwards;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(16px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-8px) scale(.95); }
}
</style>
