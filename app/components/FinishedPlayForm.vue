<script setup lang="ts">
import ReviewModal from './review/ReviewModal.vue'

interface Game {
  id: number | string
  name: string
  thumbnail?: string | null
}

interface Player {
  id: string
  name: string
  score?: number | null
}

interface PlayData {
  gameId: number | string
  date: string
  startTime: string
  endTime: string
  players: Player[]
  winnerId: string | null
  expansions?: string[]
}

const props = defineProps<{
  game: Game
  initialPlayers?: Player[]
  initialDuration?: number
  expansions?: Array<{ id: string; name: string; yearPublished?: number | null }>
}>()

const emit = defineEmits<{
  savePlay: [data: PlayData]
  cancel: []
  reviewSubmit: [review: any]
}>()

// Composables
const { saveReview, getReviewCount } = useReviews()

// Review modal state
const isReviewModalOpen = ref(false)
const isSaving = ref(false)
const pendingPlayData = ref<PlayData | null>(null)

// Check if user should see review modal
const shouldShowReviewModal = computed(() => {
  const reviewCount = getReviewCount(String(props.game.id))
  return reviewCount < 3 // Show modal if user has less than 3 reviews
})

// Form state
const today = new Date().toISOString().split('T')[0] as string
const date = ref<string>(today)
const startTime = ref<string>('')
const endTime = ref<string>('')
const winnerId = ref<string | null>(null)

// Players state
const players = ref<Player[]>(props.initialPlayers?.map(p => ({ ...p, score: null })) || [])
const newPlayerName = ref('')

// Expansion state
const usedExpansions = ref(false)
const selectedExpansions = ref<string[]>([])

// Set initial times based on duration if provided
onMounted(() => {
  const now = new Date()
  endTime.value = formatTimeValue(now)
  
  if (props.initialDuration) {
    const startDateTime = new Date(now.getTime() - props.initialDuration * 60000)
    startTime.value = formatTimeValue(startDateTime)
  } else {
    const startDateTime = new Date(now.getTime() - 60000)
    startTime.value = formatTimeValue(startDateTime)
  }
})

function formatTimeValue(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

function addPlayer() {
  if (newPlayerName.value.trim()) {
    players.value.push({
      id: Date.now().toString(),
      name: newPlayerName.value.trim(),
      score: null
    })
    newPlayerName.value = ''
  }
}

function removePlayer(playerId: string) {
  players.value = players.value.filter(p => p.id !== playerId)
  if (winnerId.value === playerId) {
    winnerId.value = null
  }
}

function updatePlayerScore(playerId: string, score: string) {
  const player = players.value.find(p => p.id === playerId)
  if (player) {
    player.score = score && score !== '' ? parseInt(score) : null
  }
}

function setWinner(playerId: string) {
  winnerId.value = winnerId.value === playerId ? null : playerId
}

async function handleSave() {
  if (!isValid.value || players.value.length === 0) return
  
  isSaving.value = true
  
  try {
    const playData = {
      gameId: props.game.id,
      date: date.value,
      startTime: startTime.value,
      endTime: endTime.value,
      players: players.value,
      winnerId: winnerId.value,
      expansions: usedExpansions.value ? selectedExpansions.value : []
    }
    
    // Check if user has 3+ reviews
    const reviewCount = getReviewCount(String(props.game.id))
    
    if (reviewCount >= 3) {
      // User has 3+ reviews, just save play without showing modal
      emit('savePlay', playData)
      console.log('User has', reviewCount, 'reviews. Saving play directly.')
    } else {
      // User has <3 reviews, store play data and show review modal
      pendingPlayData.value = playData
      isReviewModalOpen.value = true
      
      // Wait for review submission before saving play
      console.log('Opening review modal for game:', props.game.name)
      console.log('User has', reviewCount, 'reviews so far')
    }
  } catch (error) {
    console.error('Error saving play:', error)
  } finally {
    isSaving.value = false
  }
}

function handleReviewSubmit(review: any) {
  console.log('Review submitted:', review)
  
  // Save the review first
  saveReview(String(props.game.id), review)
  
  // Now save the play data after review is submitted
  if (pendingPlayData.value) {
    emit('savePlay', pendingPlayData.value)
    console.log('Play saved after review submission')
    pendingPlayData.value = null
  }
  
  // Close review modal
  isReviewModalOpen.value = false
  
  // Optionally navigate to review experience
  // navigateTo(`/review-experience/${props.game.id}`)
}

function handleDontReview() {
  // Save the play data without review
  if (pendingPlayData.value) {
    emit('savePlay', pendingPlayData.value)
    console.log('Play saved without review')
    pendingPlayData.value = null
  }
  
  // Close review modal
  isReviewModalOpen.value = false
}

function handleReviewModalClose() {
  isReviewModalOpen.value = false
  // You might want to emit an event or navigate away after review is closed
  emit('cancel')
}

const isValid = computed(() => {
  return date.value && startTime.value && endTime.value
})
</script>

<template>
  <div class="bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Log Play</p>
          <h1 class="font-bold text-gray-900 truncate">{{ game.name }}</h1>
        </div>
        <div v-if="game.thumbnail" class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img :src="game.thumbnail" :alt="game.name" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <!-- Date & Time Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 class="font-bold text-gray-900 mb-4">When did you play?</h2>
        
        <!-- Date -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            v-model="date"
            type="date"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        <!-- Time row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              v-model="startTime"
              type="time"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              v-model="endTime"
              type="time"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Expansions Section -->
      <div v-if="props.expansions && props.expansions.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="usedExpansions"
            type="checkbox"
            class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="text-gray-700 font-medium">Used any expansions?</span>
        </label>

        <!-- Expansion Checklist -->
        <div
          v-if="usedExpansions"
          class="mt-4 p-4 bg-gray-50 rounded-xl"
        >
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Select expansions used:</h3>
          <div class="space-y-2">
            <label
              v-for="expansion in props.expansions"
              :key="expansion.id"
              class="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <input
                :value="expansion.id"
                v-model="selectedExpansions"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700">
                {{ expansion.name }}
                <span v-if="expansion.yearPublished" class="text-gray-500">({{ expansion.yearPublished }})</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Players Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-gray-900">Players</h2>
              <p class="text-sm text-gray-500">{{ players.length }} player{{ players.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Add player input -->
        <div class="p-4 border-b border-gray-100">
          <form @submit.prevent="addPlayer" class="flex gap-2">
            <input
              v-model="newPlayerName"
              type="text"
              placeholder="Add player"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <button
              type="submit"
              :disabled="!newPlayerName.trim()"
              class="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              <Icon name="mdi:plus" class="w-5 h-5" />
            </button>
          </form>
        </div>

        <!-- Players list -->
        <div v-if="players.length > 0" class="divide-y divide-gray-100">
          <div
            v-for="player in players"
            :key="player.id"
            class="px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <!-- Winner toggle -->
              <button
                type="button"
                @click="setWinner(player.id)"
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                :class="winnerId === player.id 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'"
                title="Set as winner"
              >
                <Icon name="mdi:trophy" class="w-5 h-5" />
              </button>
              
              <span class="flex-1 font-medium text-gray-900">{{ player.name }}</span>
              
              <!-- Score input -->
              <input
                v-model.number="player.score"
                type="number"
                placeholder="Score"
                class="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
              
              <button
                type="button"
                @click="removePlayer(player.id)"
                class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Icon name="mdi:close" class="w-5 h-5" />
              </button>
            </div>
            
            <!-- Winner badge -->
            <div v-if="winnerId === player.id" class="mt-2 ml-13">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <Icon name="mdi:trophy" class="w-3 h-3" />
                Winner
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="p-8 text-center">
          <Icon name="mdi:account-group-outline" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p class="text-gray-500">No players added yet</p>
          <p class="text-sm text-gray-400 mt-1">Add players who participated</p>
        </div>
      </div>

      <!-- Winner Section (if players exist but no winner selected) -->
      <div v-if="players.length > 0 && !winnerId" class="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div class="flex items-start gap-3">
          <Icon name="mdi:trophy-outline" class="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-amber-800">Who won?</p>
            <p class="text-xs text-amber-600 mt-0.5">Tap the trophy icon next to a player to mark them as the winner</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="px-4 pb-8 pt-4">
      <!-- Review count indicator -->
      <div v-if="!shouldShowReviewModal" class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center gap-2">
          <Icon name="mdi:information" class="w-5 h-5 text-blue-600" />
          <p class="text-sm text-blue-800">
            You've already reviewed this game {{ getReviewCount(String(props.game.id)) }} times. 
            You can change your last review by clicking here.
            <!-- TO DO: Add button to open review modal with 3rd review, updatable -->
          </p>
        </div>
      </div>
      
      <button
        type="button"
        @click="handleSave"
        :disabled="!isValid || isSaving"
        class="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 disabled:bg-gray-300 disabled:shadow-none"
      >
        <Icon v-if="isSaving" name="mdi:loading" class="w-6 h-6 inline-block mr-2 animate-spin" />
        <Icon v-else name="mdi:check" class="w-6 h-6 inline-block mr-2" />
        {{ isSaving ? 'Saving...' : (shouldShowReviewModal ? 'Log Play' : 'Save Play & Review') }}
      </button>
    </div>

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
</template>
