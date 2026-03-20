<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameSessionStore } from '../stores/gameSession'
import BaseModal from './BaseModal.vue'
import FullScreenModal from './FullScreenModal.vue'

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
  <BaseModal
    :show="showSessionModal && activeSession !== null"
    :close-on-overlay-click="false"
    max-width="lg"
    padding="none"
    @close="handleCancelSession"
  >
    <LivePlaySession
      :game="{ id: activeSession!.game.id, name: activeSession!.game.name, thumbnail: activeSession!.game.thumbnail }"
      @finish-game="handleFinishGame"
      @minimize-session="handleMinimizeSession"
      @cancel-session="handleCancelSession"
    />
  </BaseModal>

  <!-- Finished Play Form -->
  <FullScreenModal
    :show="showForm"
    title="Log Play"
    @close="handleCancelForm"
  >
    <FinishedPlayForm
      v-if="sessionPlayers.length || sessionDuration"
      :game="{ id: '', name: 'Game Session', thumbnail: null }"
      :initial-players="sessionPlayers"
      :initial-duration="sessionDuration"
      @save-play="handleSavePlay"
      @cancel="handleCancelForm"
    />
  </FullScreenModal>
</template>
