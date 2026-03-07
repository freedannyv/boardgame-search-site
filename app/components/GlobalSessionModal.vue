<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameSessionStore } from '~/stores/gameSession'

interface Player {
  id: string
  name: string
  score?: number | null
}

const sessionStore = useGameSessionStore()
const { activeSession, showSessionModal } = storeToRefs(sessionStore)

// Local state for form after finishing
const showForm = ref(false)
const sessionPlayers = ref<Player[]>([])
const sessionDuration = ref<number>(0)

function handleFinishGame(players: Player[], elapsedSeconds: number) {
  sessionPlayers.value = players
  sessionDuration.value = elapsedSeconds
  sessionStore.clearSession()
  sessionStore.closeSessionModal()
  showForm.value = true
}

function handleMinimizeSession() {
  sessionStore.closeSessionModal()
}

function handleCancelSession() {
  sessionStore.clearSession()
  sessionStore.closeSessionModal()
}

function handleSavePlay(data: any) {
  console.log('Play saved:', data)
  // TODO: Save to API
  showForm.value = false
  sessionPlayers.value = []
  sessionDuration.value = 0
}

function handleCancelForm() {
  showForm.value = false
  sessionPlayers.value = []
  sessionDuration.value = 0
}
</script>

<template>
  <!-- Live Play Session Modal -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="showSessionModal && activeSession" class="fixed inset-0 z-50 bg-gray-50">
        <LivePlaySession
          :game="{ id: activeSession.game.id, name: activeSession.game.name, thumbnail: activeSession.game.thumbnail }"
          @finish-game="handleFinishGame"
          @minimize-session="handleMinimizeSession"
          @cancel-session="handleCancelSession"
        />
      </div>
    </Transition>
  </Teleport>

  <!-- Finished Play Form -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="showForm" class="fixed inset-0 z-50 bg-gray-50">
        <FinishedPlayForm
          v-if="sessionPlayers.length || sessionDuration"
          :game="{ id: '', name: 'Game Session', thumbnail: null }"
          :initial-players="sessionPlayers"
          :initial-duration="sessionDuration"
          @save-play="handleSavePlay"
          @cancel="handleCancelForm"
        />
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
