<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick(e: MouseEvent) {
  if (props.closeOnOverlayClick && e.target === e.currentTarget) {
    emit('close')
  }
}

// Prevent body scroll when modal is open
watch(() => props.show, (isShown) => {
  if (isShown) {
    // Save current scroll position
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    // Restore scroll position
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
        @click="handleOverlayClick"
      >
        <div class="min-h-screen py-4">
          <!-- Header with title and close button -->
          <div v-if="title || showCloseButton" class="bg-white border-b border-gray-200 px-4 py-4">
            <div class="flex items-center gap-3">
              <button
                v-if="showCloseButton"
                type="button"
                @click="emit('close')"
                class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Icon name="mdi:arrow-left" class="w-5 h-5 text-gray-600" />
              </button>
              <div class="flex-1 min-w-0">
                <p v-if="title" class="text-xs text-gray-500 uppercase tracking-wide">{{ title }}</p>
                <h1 v-if="title" class="font-bold text-gray-900 truncate">{{ title }}</h1>
              </div>
            </div>
          </div>

          <!-- Modal content -->
          <div class="flex-1">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
