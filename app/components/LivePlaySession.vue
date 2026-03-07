<script setup lang="ts">
import { useGameSessionStore } from '~/stores/gameSession'

interface Game {
  id: number | string
  name: string
  thumbnail?: string | null
}

interface Player {
  id: string
  name: string
}

const props = defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  finishGame: [players: Player[], elapsedSeconds: number]
  minimizeSession: []
  cancelSession: []
}>()

const sessionStore = useGameSessionStore()

// Local display state (updates every second from store)
const displaySeconds = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const newPlayerName = ref('')

// Computed from store
const isRunning = computed(() => sessionStore.activeSession?.isRunning ?? false)
const isPaused = computed(() => sessionStore.activeSession?.isPaused ?? false)
const players = computed(() => sessionStore.activeSession?.players ?? [])
const canStartTimer = computed(() => players.value.length > 0)
const showPlayerRequired = ref(false)

// Clear warning when player is added
watch(players, (newPlayers) => {
  if (newPlayers.length > 0) {
    showPlayerRequired.value = false
  }
})

// Update display from store
function updateDisplay() {
  displaySeconds.value = sessionStore.getCurrentElapsedSeconds()
}

// Start the display update interval
function startDisplayTimer() {
  if (timerInterval.value) return
  timerInterval.value = setInterval(updateDisplay, 1000)
}

// Stop the display update interval
function stopDisplayTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// Initialize display on mount
onMounted(() => {
  updateDisplay()
  startDisplayTimer()
})

// Clean up interval on unmount
onUnmounted(() => {
  stopDisplayTimer()
})

// Timer controls (delegate to store)
function startTimer() {
  if (!canStartTimer.value) {
    showPlayerRequired.value = true
    return
  }
  showPlayerRequired.value = false
  sessionStore.startTimer()
  // Immediately update display and ensure interval is running
  updateDisplay()
}

function pauseTimer() {
  sessionStore.pauseTimer()
  updateDisplay()
}

function resumeTimer() {
  sessionStore.resumeTimer()
  updateDisplay()
}

function stopTimer() {
  sessionStore.stopTimer()
  displaySeconds.value = 0
}

// Format time display
const formattedTime = computed(() => {
  const seconds = displaySeconds.value
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
})

function addPlayer() {
  if (newPlayerName.value.trim()) {
    sessionStore.addPlayer(newPlayerName.value.trim())
    newPlayerName.value = ''
  }
}

function removePlayer(playerId: string) {
  sessionStore.removePlayer(playerId)
  // Clear starting player if they were removed
  if (startingPlayerId.value === playerId) {
    startingPlayerId.value = null
  }
}

// Random starting player
const startingPlayerId = ref<string | null>(null)
const isSelectingRandom = ref(false)

function selectRandomStartingPlayer() {
  if (players.value.length < 2) {
    startingPlayerId.value = players.value[0]?.id ?? null
    return
  }
  
  // Animation effect - cycle through players
  isSelectingRandom.value = true
  let iterations = 0
  const maxIterations = 10 + Math.floor(Math.random() * 5)
  
  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * players.value.length)
    const player = players.value[randomIndex]
    if (player) {
      startingPlayerId.value = player.id
    }
    iterations++
    
    if (iterations >= maxIterations) {
      clearInterval(interval)
      isSelectingRandom.value = false
    }
  }, 100)
}

function handleFinishGame() {
  const result = sessionStore.finishSession()
  if (result) {
    emit('finishGame', result.players, result.elapsedSeconds)
  }
}

function handleMinimize() {
  emit('minimizeSession')
}

function handleCancel() {
  emit('cancelSession')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleMinimize"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Icon name="mdi:chevron-down" class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Now Playing</p>
          <h1 class="font-bold text-gray-900 truncate">{{ game.name }}</h1>
        </div>
        <div v-if="game.thumbnail" class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img :src="game.thumbnail" :alt="game.name" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Timer -->
    <div class="px-4 py-8">
      <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-center shadow-lg">
        <p class="text-emerald-100 text-sm font-medium mb-2">Elapsed Time</p>
        <p class="text-5xl font-bold font-mono tracking-wider">{{ formattedTime }}</p>
        
        <!-- Timer status -->
        <div class="mt-4 flex items-center justify-center gap-2 text-emerald-100">
          <template v-if="isRunning && !isPaused">
            <Icon name="mdi:circle" class="w-2 h-2 animate-pulse" />
            <span class="text-sm">Session in progress</span>
          </template>
          <template v-else-if="isPaused">
            <Icon name="mdi:pause" class="w-4 h-4" />
            <span class="text-sm">Paused</span>
          </template>
          <template v-else>
            <Icon name="mdi:clock-outline" class="w-4 h-4" />
            <span class="text-sm">Ready to start</span>
          </template>
        </div>

        <!-- Timer Controls -->
        <div class="mt-6 flex items-center justify-center gap-3">
          <!-- Start/Resume button -->
          <button
            v-if="!isRunning || isPaused"
            type="button"
            @click="isPaused ? resumeTimer() : startTimer()"
            class="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
            :class="!isPaused && !canStartTimer 
              ? 'bg-white/10 text-white/50 cursor-not-allowed' 
              : 'bg-white/20 hover:bg-white/30'"
          >
            <Icon name="mdi:play" class="w-8 h-8" />
          </button>

          <!-- Pause button -->
          <button
            v-if="isRunning && !isPaused"
            type="button"
            @click="pauseTimer"
            class="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <Icon name="mdi:pause" class="w-8 h-8" />
          </button>

          <!-- Stop/Reset button -->
          <button
            v-if="isRunning || displaySeconds > 0"
            type="button"
            @click="stopTimer"
            class="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <Icon name="mdi:stop" class="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>

    <!-- Players Section -->
    <div class="px-4 pb-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-bold text-gray-900">Players</h2>
          <p class="text-sm text-gray-500">{{ players.length }} player{{ players.length !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Add player input (only before game starts) -->
        <div v-if="!isRunning" class="p-4 border-b border-gray-100">
          <form @submit.prevent="addPlayer" class="flex gap-2">
            <input
              v-model="newPlayerName"
              type="text"
              placeholder="Enter player name"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
            <button
              type="submit"
              :disabled="!newPlayerName.trim()"
              class="px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              <Icon name="mdi:plus" class="w-5 h-5" />
            </button>
          </form>
          
          <!-- Random starting player button -->
          <button
            v-if="players.length >= 2"
            type="button"
            @click="selectRandomStartingPlayer"
            :disabled="isSelectingRandom"
            class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            <Icon name="mdi:dice-multiple" class="w-5 h-5" :class="{ 'animate-spin': isSelectingRandom }" />
            <span>{{ startingPlayerId ? 'Reroll Starting Player' : 'Pick Random Starting Player' }}</span>
          </button>
        </div>

        <!-- Players list -->
        <div v-if="players.length > 0" class="divide-y divide-gray-100">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            class="flex items-center gap-3 px-4 py-3 transition-colors"
            :class="{
              'bg-indigo-50': startingPlayerId === player.id,
              'animate-pulse': isSelectingRandom && startingPlayerId === player.id
            }"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors"
              :class="startingPlayerId === player.id ? 'bg-indigo-200 text-indigo-700' : 'bg-emerald-100 text-emerald-700'"
            >
              <Icon v-if="startingPlayerId === player.id && !isSelectingRandom" name="mdi:star" class="w-4 h-4" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-medium text-gray-900">{{ player.name }}</span>
              <span 
                v-if="startingPlayerId === player.id && !isSelectingRandom" 
                class="ml-2 text-xs font-medium text-indigo-600"
              >
                Starting Player
              </span>
            </div>
            <button
              v-if="!isRunning"
              type="button"
              @click="removePlayer(player.id)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="p-8 text-center">
          <Icon name="mdi:account-group-outline" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p class="text-gray-500">No players added yet</p>
          <p class="text-sm text-gray-400 mt-1">Add players to track who's playing</p>
          <p v-if="showPlayerRequired" class="text-sm text-red-500 mt-3 font-medium">
            Add at least one player to start the timer
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="px-4 pb-8">
      <button
        type="button"
        @click="handleFinishGame"
        class="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20"
      >
        <Icon name="mdi:flag-checkered" class="w-6 h-6 inline-block mr-2" />
        Finish Game
      </button>
      
      <button
        type="button"
        @click="handleCancel"
        class="w-full mt-3 py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
      >
        Cancel Session
      </button>
    </div>
  </div>
</template>
