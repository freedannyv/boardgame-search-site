import { defineStore } from 'pinia'

export const useGameSessionStore = defineStore('gameSession', () => {
  const activeSession = ref(null)
  const showSessionModal = ref(false)

  // Getters
  const hasActiveSession = computed(() => activeSession.value !== null)

  // Function (not computed) because Date.now() isn't reactive
  function getCurrentElapsedSeconds() {
    if (!activeSession.value) return 0

    const { startedAt, accumulatedSeconds, isRunning, isPaused } = activeSession.value

    if (!isRunning || isPaused || !startedAt) {
      return accumulatedSeconds
    }

    // Calculate current elapsed time
    return accumulatedSeconds + Math.floor((Date.now() - startedAt) / 1000)
  }

  // Actions
  function startSession(game) {
    activeSession.value = {
      id: crypto.randomUUID(),
      game,
      players: [],
      startedAt: null,
      accumulatedSeconds: 0,
      isRunning: false,
      isPaused: false
    }
  }

  function startTimer() {
    if (!activeSession.value) return false
    
    // Require at least 1 player to start
    if (activeSession.value.players.length === 0) return false

    activeSession.value.startedAt = Date.now()
    activeSession.value.isRunning = true
    activeSession.value.isPaused = false
    return true
  }

  function pauseTimer() {
    if (!activeSession.value || !activeSession.value.isRunning) return

    // Save accumulated time
    if (activeSession.value.startedAt) {
      activeSession.value.accumulatedSeconds += Math.floor(
        (Date.now() - activeSession.value.startedAt) / 1000
      )
    }

    activeSession.value.startedAt = null
    activeSession.value.isPaused = true
  }

  function resumeTimer() {
    if (!activeSession.value) return

    activeSession.value.startedAt = Date.now()
    activeSession.value.isPaused = false
  }

  function stopTimer() {
    if (!activeSession.value) return

    activeSession.value.startedAt = null
    activeSession.value.accumulatedSeconds = 0
    activeSession.value.isRunning = false
    activeSession.value.isPaused = false
  }

  function addPlayer(name) {
    if (!activeSession.value) return

    activeSession.value.players.push({
      id: crypto.randomUUID(),
      name
    })
  }

  function removePlayer(playerId) {
    if (!activeSession.value) return

    activeSession.value.players = activeSession.value.players.filter(
      p => p.id !== playerId
    )
  }

  function finishSession() {
    if (!activeSession.value || activeSession.value.players.length === 0) return null

    const timerMinLimit = getCurrentElapsedSeconds()
    if (timerMinLimit < 1) return null // TO DO Change to 5 minutes (300)
    if (!activeSession.value) return null

    // Calculate final elapsed time
    let elapsedSeconds = activeSession.value.accumulatedSeconds
    if (activeSession.value.startedAt && activeSession.value.isRunning && !activeSession.value.isPaused) {
      elapsedSeconds += Math.floor((Date.now() - activeSession.value.startedAt) / 1000)
    }

    const result = {
      players: [...activeSession.value.players],
      elapsedSeconds
    }

    return result
  }

  function clearSession() {
    activeSession.value = null
    showSessionModal.value = false
  }

  function openSessionModal() {
    showSessionModal.value = true
  }

  function closeSessionModal() {
    showSessionModal.value = false
  }

  return {
    // State
    activeSession,
    showSessionModal,
    // Getters
    hasActiveSession,
    getCurrentElapsedSeconds,
    // Actions
    startSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addPlayer,
    removePlayer,
    finishSession,
    clearSession,
    openSessionModal,
    closeSessionModal
  }
}, {
  persist: {
    pick: ['activeSession'] // Only persist session data, not UI state
  }
})
