<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameSessionStore } from '~/stores/gameSession'

const sessionStore = useGameSessionStore()
const { activeSession, hasActiveSession } = storeToRefs(sessionStore)

const displayTime = ref('00:00:00')
let intervalId: ReturnType<typeof setInterval> | null = null

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function updateDisplay() {
  displayTime.value = formatTime(sessionStore.getCurrentElapsedSeconds())
}

function startDisplayTimer() {
  stopDisplayTimer()
  updateDisplay()
  intervalId = setInterval(updateDisplay, 1000)
}

function stopDisplayTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Watch for session changes
watch(
  hasActiveSession,
  (hasSession) => {
    if (hasSession) {
      startDisplayTimer()
    } else {
      stopDisplayTimer()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  stopDisplayTimer()
})

function toggleTimer() {
  if (activeSession.value?.isRunning && !activeSession.value?.isPaused) {
    sessionStore.pauseTimer()
  } else {
    sessionStore.resumeTimer()
  }
  updateDisplay()
}

function handleOpen() {
  sessionStore.openSessionModal()
}

const isTimerRunning = computed(() => 
  activeSession.value?.isRunning && !activeSession.value?.isPaused
)
</script>

<template>
  <div
    v-if="hasActiveSession"
    class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 shadow-md"
  >
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="activeSession?.isRunning ? 'bg-white animate-pulse' : 'bg-white/60'"
          />
          <span class="font-mono font-semibold text-sm sm:text-base">{{ displayTime }}</span>
        </div>
        <span class="hidden sm:inline text-white/80">|</span>
        <span class="font-medium truncate text-sm sm:text-base">
          {{ activeSession?.game.name }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          :title="isTimerRunning ? 'Pause' : 'Play'"
          @click="toggleTimer"
        >
          <Icon :name="isTimerRunning ? 'mdi:pause' : 'mdi:play'" class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors"
          @click="handleOpen"
        >
          <Icon name="mdi:open-in-new" class="w-4 h-4" />
          <span class="hidden sm:inline">Open</span>
        </button>
      </div>
    </div>
  </div>
</template>
