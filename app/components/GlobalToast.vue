<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'fixed z-50 left-1/2 -translate-x-1/2 top-6 min-w-[220px] max-w-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white text-sm font-medium',
        type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
      ]"
      role="alert"
    >
      <Icon :name="type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'" class="w-5 h-5" />
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
const { visible, message, type } = toastStore

// Auto-hide after 1.5s
watchEffect(() => {
  if (visible.value) {
    setTimeout(() => {
      toastStore.hide()
    }, 1500)
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
