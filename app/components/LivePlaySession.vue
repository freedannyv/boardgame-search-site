<script setup lang="ts">
import { useGameSessionStore } from '../stores/gameSession'
import ReviewModal from './review/ReviewModal.vue'

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
  reviewSubmit: [review: any]
}>()

// Composables
const sessionStore = useGameSessionStore()
const { saveReview, getReviewCount } = useReviews()

// Review modal state
const isReviewModalOpen = ref(false)
const pendingSessionData = ref<{ players: Player[], elapsedSeconds: number } | null>(null)

// Check if user should see review modal
const shouldShowReviewModal = computed(() => {
  const reviewCount = getReviewCount(String(props.game.id))
  return reviewCount < 3 // Show modal if user has less than 3 reviews
})

// Local display state (updates every second from store)
const displaySeconds = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const newPlayerName = ref('')

// Computed from store
const isRunning = computed(() => sessionStore.activeSession?.isRunning ?? false)
const isPaused = computed(() => sessionStore.activeSession?.isPaused ?? false)
const players = computed(() => sessionStore.activeSession?.players ?? [])
const canStartTimer = computed(() => players.value.length > 0)

// Prevent body scroll when LivePlaySession is mounted
onMounted(() => {
  // Save current scroll position
  const scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
})

// Restore body scroll when LivePlaySession is unmounted
onUnmounted(() => {
  // Restore scroll position
  const scrollY = document.body.style.top
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo(0, parseInt(scrollY || '0') * -1)
})
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
  if (!process.client) return
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

// Stop warning modal
const showStopWarning = ref(false)

function handleStopClick() {
  showStopWarning.value = true
}

function confirmStop() {
  stopTimer()
  showStopWarning.value = false
}

function cancelStop() {
  showStopWarning.value = false
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
const selectionComplete = ref(false)

function selectRandomStartingPlayer() {
  if (!process.client) return
  if (players.value.length < 2) {
    startingPlayerId.value = players.value[0]?.id ?? null
    selectionComplete.value = true
    return
  }
  // Pick which player will be selected at the end
  const winnerIndex = Math.floor(Math.random() * players.value.length)
  // Calculate how many iterations to land on the winner
  // Do 6-10 full cycles plus landing on the winner
  const fullCycles = 6 + Math.floor(Math.random() * 4)
  const totalIterations = (fullCycles * players.value.length) + winnerIndex
  isSelectingRandom.value = true
  selectionComplete.value = false
  let currentIndex = 0
  let iterations = 0
  const interval = setInterval(() => {
    const player = players.value[currentIndex]
    if (player) {
      startingPlayerId.value = player.id
    }
    iterations++
    currentIndex = (currentIndex + 1) % players.value.length
    if (iterations > totalIterations) {
      clearInterval(interval)
      isSelectingRandom.value = false
      selectionComplete.value = true
    }
  }, 100)
}

function handleFinishGame() {
  const result = sessionStore.finishSession()
  if (result) {
    // Check if user has 3+ reviews
    const reviewCount = getReviewCount(String(props.game.id))
    
    if (reviewCount >= 3) {
      // User has 3+ reviews, emit finish game directly
      emit('finishGame', result.players, result.elapsedSeconds)
      console.log('User has', reviewCount, 'reviews. Session finished without review modal.')
    } else {
      // User has <3 reviews, store session data and show review modal
      pendingSessionData.value = result
      isReviewModalOpen.value = true
      console.log('Opening review modal for game:', props.game.name)
      console.log('User has', reviewCount, 'reviews so far')
    }
  }
}

function handleReviewSubmit(review: any) {
  console.log('Review submitted for live session:', review)
  
  // Save the review first
  saveReview(String(props.game.id), review)
  
  // Now emit the finish game event after review is submitted
  if (pendingSessionData.value) {
    emit('finishGame', pendingSessionData.value.players, pendingSessionData.value.elapsedSeconds)
    console.log('Session finished after review submission')
    pendingSessionData.value = null
  }
  
  // Close review modal
  isReviewModalOpen.value = false
  
  // Optionally navigate to review experience
  // navigateTo(`/review-experience/${props.game.id}`)
}

function handleDontReview() {
  // Finish the session without review
  if (pendingSessionData.value) {
    emit('finishGame', pendingSessionData.value.players, pendingSessionData.value.elapsedSeconds)
    console.log('Session finished without review')
    pendingSessionData.value = null
  }
  
  // Close review modal
  isReviewModalOpen.value = false
}

function handleReviewModalClose() {
  isReviewModalOpen.value = false
  // You might want to minimize or close the session after review
  emit('minimizeSession')
}

function handleMinimize() {
  emit('minimizeSession')
}

function handleCancel() {
  emit('cancelSession')
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
    <div class="min-h-screen py-4">
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
            @click="handleStopClick"
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
            class="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
            :class="{
              'bg-indigo-50': isSelectingRandom && startingPlayerId === player.id,
              'slide-in-bg': selectionComplete && startingPlayerId === player.id && !isSelectingRandom
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

    <!-- Stop Warning Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showStopWarning" 
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          @click.self="cancelStop"
        >
          <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <Icon name="mdi:alert" class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 text-center mb-2">Reset Timer?</h3>
            <p class="text-gray-600 text-center mb-6">
              This will reset the timer to zero. Your game progress will be lost.
            </p>
            <div class="flex gap-3">
              <button
                type="button"
                @click="cancelStop"
                class="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmStop"
                class="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Review Modal -->
    <ReviewModal
      :is-open="isReviewModalOpen"
      :game-id="String(props.game.id)"
      :game-name="props.game.name"
      @close="handleReviewModalClose"
      @submit="handleReviewSubmit"
      @dont-review="handleDontReview"
    />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-bg {
  position: relative;
  overflow: hidden;
}

.slide-in-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgb(238 242 255); /* bg-indigo-50 */
  animation: slideInBg 0.4s ease-out forwards;
  z-index: 0;
}

.slide-in-bg > * {
  position: relative;
  z-index: 1;
}

@keyframes slideInBg {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
