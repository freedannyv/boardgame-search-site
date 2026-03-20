<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  closeOnOverlayClick: true,
  maxWidth: 'md',
  padding: 'md'
})

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick(e: MouseEvent) {
  if (props.closeOnOverlayClick && e.target === e.currentTarget) {
    emit('close')
  }
}

const maxWidthClasses = computed(() => {
  const classes = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }
  return classes[props.maxWidth]
})

const paddingClasses = computed(() => {
  const classes = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  return classes[props.padding]
})

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
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click="handleOverlayClick"
      >
        <div 
          class="w-full rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]"
          :class="[maxWidthClasses, paddingClasses]"
        >
          <!-- Header with title and close button -->
          <div v-if="title || showCloseButton" class="flex items-center justify-between mb-4">
            <h2 v-if="title" class="text-xl font-bold text-gray-900">{{ title }}</h2>
            <button
              v-if="showCloseButton"
              type="button"
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Icon name="mdi:close" class="w-5 h-5 text-gray-600" />
            </button>
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .max-w-md,
.modal-leave-active .max-w-md {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .max-w-md,
.modal-leave-to .max-w-md {
  transform: translateY(100%);
  opacity: 0;
}
</style>
