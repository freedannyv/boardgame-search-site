import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error'>('success')

  function show(msg: string, toastType: 'success' | 'error' = 'success') {
    message.value = msg
    type.value = toastType
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return { visible, message, type, show, hide }
})
