<script setup lang="ts">
import { useGameSessionStore } from '../stores/gameSession'

interface Game {
  id: string | number
  name: string
  thumbnail?: string | null
}

interface Player {
  id: string
  name: string
  score?: number | null
}

const props = defineProps<{
  game: Game
  variant?: 'action' | 'card' | 'compact'
}>()

const sessionStore = useGameSessionStore()

// View states: 'none' | 'modal' | 'live' | 'form'
const currentView = ref<'none' | 'modal' | 'live' | 'form'>('none')
const sessionPlayers = ref<Player[]>([])
const sessionDuration = ref<number>(0)

// Watch for store requesting to show session modal
watch(
  () => sessionStore.showSessionModal,
  (shouldShow) => {
    if (shouldShow && sessionStore.activeSession?.game.id === props.game.id) {
      currentView.value = 'live'
      sessionStore.closeSessionModal()
    }
  }
)

function handleClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  
  // If there's an active session for this game, show it
  if (sessionStore.hasActiveSession && sessionStore.activeSession?.game.id === props.game.id) {
    currentView.value = 'live'
    return
  }
  
  currentView.value = 'modal'
}

function handleStartGame() {
  sessionStore.startSession(props.game)
  currentView.value = 'live'
}

function handleLogFinishedGame() {
  sessionPlayers.value = []
  sessionDuration.value = 0
  currentView.value = 'form'
}

function handleFinishGame(players: Player[], elapsedSeconds: number) {
  sessionPlayers.value = players
  sessionDuration.value = elapsedSeconds
  sessionStore.clearSession()
  currentView.value = 'form'
}

function handleMinimizeSession() {
  // Just hide the view, keep the session running in the store
  currentView.value = 'none'
}

function handleCancelSession() {
  sessionStore.clearSession()
  currentView.value = 'none'
}

function handleSavePlay(data: any) {
  console.log('Play saved:', data)
  // TODO: Save to API
  currentView.value = 'none'
  sessionPlayers.value = []
  sessionDuration.value = 0
}

function handleCancelForm() {
  currentView.value = 'none'
  sessionPlayers.value = []
  sessionDuration.value = 0
}

const buttonClass = computed(() => {
  switch (props.variant) {
    case 'card':
      return 'flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-gray-600 hover:bg-white hover:text-green-600 hover:scale-110 active:scale-95 transition-all'
    case 'compact':
      return 'w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition-colors'
    case 'action':
    default:
      return 'flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95'
  }
})

const iconClass = computed(() => {
  switch (props.variant) {
    case 'card':
      return 'h-6 w-6'
    case 'compact':
      return 'w-5 h-5'
    case 'action':
    default:
      return 'w-5 h-5'
  }
})

const iconName = computed(() => {
  switch (props.variant) {
    case 'card':
      return 'mdi:notebook-edit'
    case 'compact':
      return 'mdi:dice-multiple-outline'
    case 'action':
    default:
      return 'mdi:dice-multiple'
  }
})

// Hide button if there's an active session for a different game
const shouldShowButton = computed(() => {
  if (!sessionStore.hasActiveSession) return true
  return sessionStore.activeSession?.game.id === props.game.id
})
</script>

<template>
  <button
    v-if="shouldShowButton"
    type="button"
    :class="buttonClass"
    title="Log a play"
    @click="handleClick"
  >
    <Icon :name="iconName" :class="iconClass" />
    <span v-if="variant === 'action' || !variant" class="hidden sm:inline">Log Play</span>
  </button>

  <!-- Play Log Modal -->
  <PlayLogModal
    v-if="currentView === 'modal'"
    :game="{ id: Number(game.id), name: game.name, thumbnail: game.thumbnail || undefined }"
    @start-game="handleStartGame"
    @log-finished-game="handleLogFinishedGame"
    @close="currentView = 'none'"
  />

  <!-- Live Play Session -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="currentView === 'live'" class="fixed inset-0 z-50 bg-gray-50">
        <LivePlaySession
          :game="{ id: game.id, name: game.name, thumbnail: game.thumbnail }"
          @finish-game="handleFinishGame"
          @minimize-session="handleMinimizeSession"
          @cancel-session="handleCancelSession"
        />
      </div>
    </Transition>
  </Teleport>

  <!-- Finished Play Form -->
  <Teleport to="body">
    <div v-if="currentView === 'form'" class="fixed inset-0 z-50 bg-gray-50">
      <FinishedPlayForm
        :game="{ id: game.id, name: game.name, thumbnail: game.thumbnail }"
        :initial-players="sessionPlayers"
        :initial-duration="sessionDuration"
        @save-play="handleSavePlay"
        @cancel="handleCancelForm"
      />
    </div>
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
