<script setup lang="ts">
import StarRating from './StarRating.vue'
import { useReviews } from '~/composables/useReviews'

console.log('ReviewModal component loaded successfully')

// Props
interface Props {
  isOpen: boolean
  gameId: string
  gameName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  submit: [review: GameReview]
  dontReview: []
}>()

// Types
interface RatingCriteria {
  key: string
  label: string
  value: number
}

interface GameReview {
  gameId: string
  criteria: Record<string, number>
  personalRating: number
  favoritePlayerCount: number
  wouldRecommend: boolean
  likes: string[]
  dislikes: string[]
  overallAverage: number
  timestamp: number
}

// Composables
const { saveReview } = useReviews()

// Reactive state
const ratings = ref<RatingCriteria[]>([
  { key: 'fun', label: 'Fun', value: 0 },
  { key: 'replayability', label: 'Replayability', value: 0 },
  { key: 'playerInteraction', label: 'Player Interaction', value: 0 },
  { key: 'accessibility', label: 'Accessibility / Learning Curve', value: 0 },
  { key: 'flow', label: 'Flow / Pacing', value: 0 },
  { key: 'theme', label: 'Theme & Immersion', value: 0 },
  { key: 'production', label: 'Component / Production Quality', value: 0 },
  { key: 'balance', label: 'Balance / Fairness', value: 0 },
  { key: 'choices', label: 'Meaningful Choices', value: 0 },
  { key: 'visual', label: 'Table Presence / Visual Appeal', value: 0 }
])

const personalRating = ref(0)
const favoritePlayerCount = ref(2)
const wouldRecommend = ref(false)
const likesInput = ref('')
const dislikesInput = ref('')
const likes = ref<string[]>([])
const dislikes = ref<string[]>([])
const isSubmitting = ref(false)

// Computed values
const overallAverage = computed(() => {
  const criteriaTotal = ratings.value.reduce((sum, rating) => sum + rating.value, 0)
  const totalRatings = ratings.value.length + 1 // +1 for personal rating
  const overallTotal = criteriaTotal + personalRating.value
  return overallTotal > 0 ? Number((overallTotal / totalRatings).toFixed(1)) : 0
})

const hasValidRatings = computed(() => {
  // Check if all criteria have ratings > 0
  const allCriteriaRated = ratings.value.every(r => r.value > 0)
  const hasPersonalRating = personalRating.value > 0
  const hasPlayerCount = favoritePlayerCount.value > 0
  
  return allCriteriaRated && hasPersonalRating && hasPlayerCount
})

// Auto-set recommendation based on overall average
watch(overallAverage, (newAverage) => {
  if (newAverage > 7) {
    wouldRecommend.value = true
  } else {
    wouldRecommend.value = false
  }
})

// Methods
function updateRating(key: string, value: number) {
  const rating = ratings.value.find(r => r.key === key)
  if (rating) {
    rating.value = value
  }
}

function handleLikesInput(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const value = likesInput.value.trim()
    if (value) {
      likes.value.push(value)
      likesInput.value = ''
    }
    event.preventDefault()
  }
}

function handleDislikesInput(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const value = dislikesInput.value.trim()
    if (value) {
      dislikes.value.push(value)
      dislikesInput.value = ''
    }
    event.preventDefault()
  }
}

function removeLike(index: number) {
  likes.value.splice(index, 1)
}

function removeDislike(index: number) {
  dislikes.value.splice(index, 1)
}

async function handleSubmit() {
  if (!hasValidRatings.value) {
    return
  }

  isSubmitting.value = true

  try {
    // Create review object
    const review: GameReview = {
      gameId: props.gameId,
      criteria: Object.fromEntries(
        ratings.value.map(r => [r.key, r.value])
      ),
      personalRating: personalRating.value,
      favoritePlayerCount: favoritePlayerCount.value,
      wouldRecommend: wouldRecommend.value,
      likes: likes.value,
      dislikes: dislikes.value,
      overallAverage: overallAverage.value,
      timestamp: Date.now()
    }

    // Save review using composable
    saveReview(props.gameId, review)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Emit submit event
    emit('submit', review)
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  // Emit event to save play without review
  emit('dontReview')
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  console.log('ReviewModal isOpen changed to:', isOpen)
  console.log('Game ID:', props.gameId)
  console.log('Game Name:', props.gameName)
  
  if (isOpen) {
    resetForm()
  }
})

function resetForm() {
  ratings.value.forEach(r => r.value = 0)
  personalRating.value = 0
  favoritePlayerCount.value = 2
  wouldRecommend.value = false
  likes.value = []
  dislikes.value = []
  likesInput.value = ''
  dislikesInput.value = ''
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="handleClose"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-300"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            class="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl "
            @click.stop
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
              <div class="flex items-center justify-center">
                <div class="text-center">
                  <h2 class="text-xl font-bold">Game Review</h2>
                  <p class="text-indigo-100 text-sm">{{ gameName }}</p>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div class="space-y-6">
                <!-- Rating Criteria -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Rate the Game <span class="text-red-500">*</span></h3>
                  <div class="space-y-4">
                    <div
                      v-for="rating in ratings"
                      :key="rating.key"
                      class="flex flex-col sm:flex-row sm:items-center justify-between sm:p-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <label class="text-sm font-medium text-gray-700">
                        {{ rating.label }} <span class="text-red-500">*</span>
                      </label>
                      <StarRating
                        :model-value="rating.value"
                        @update:model-value="updateRating(rating.key, $event)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Personal Rating -->
                <div class="p-4 bg-indigo-50 rounded-lg">
                  <label class="block text-sm font-semibold text-indigo-900 mb-2">
                    Personal Overall Rating <span class="text-red-500">*</span>
                  </label>
                  <StarRating
                    :model-value="personalRating"
                    @update:model-value="personalRating = $event"
                  />
                </div>

                <!-- Additional Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Favorite Player Count -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Favorite Player Count <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="favoritePlayerCount"
                      type="number"
                      min="1"
                      max="20"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <!-- Would Recommend -->
                  <div class="flex items-center">
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="wouldRecommend"
                        type="checkbox"
                        class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-sm font-medium text-gray-700">
                        Would you recommend this game?
                      </span>
                    </label>
                    <div class="ml-2 text-xs text-gray-500">
                      (Auto-set based on rating)
                    </div>
                  </div>
                </div>

                <!-- Likes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    What did you like?
                  </label>
                  <input
                    v-model="likesInput"
                    @keydown="handleLikesInput"
                    type="text"
                    placeholder="Press Enter to add each point"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div v-if="likes.length > 0" class="mt-2 space-y-1">
                    <div
                      v-for="(like, index) in likes"
                      :key="index"
                      class="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                    >
                      <span>{{ like }}</span>
                      <button
                        type="button"
                        @click="removeLike(index)"
                        class="text-red-500 hover:text-red-700"
                      >
                        <Icon name="mdi:close" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Dislikes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    What did you dislike?
                  </label>
                  <input
                    v-model="dislikesInput"
                    @keydown="handleDislikesInput"
                    type="text"
                    placeholder="Press Enter to add each point"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div v-if="dislikes.length > 0" class="mt-2 space-y-1">
                    <div
                      v-for="(dislike, index) in dislikes"
                      :key="index"
                      class="flex items-center justify-between p-2 bg-red-50 rounded text-sm"
                    >
                      <span>{{ dislike }}</span>
                      <button
                        type="button"
                        @click="removeDislike(index)"
                        class="text-red-500 hover:text-red-700"
                      >
                        <Icon name="mdi:close" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Overall Average -->
                <div v-if="overallAverage > 0" class="p-4 bg-yellow-50 rounded-lg text-center">
                  <p class="text-sm text-gray-600">Overall Average Rating</p>
                  <p class="text-2xl font-bold text-yellow-600">{{ overallAverage }}/10</p>
                </div>
              </div>
            </div>

            <!-- Validation Message -->
            <div v-if="!hasValidRatings" class="px-6 py-3 bg-red-50 border-t border-red-200">
              <div class="flex items-center justify-between text-sm text-red-700">
                <p class="font-medium">Please complete all required fields, or:</p>
                <button
                    type="button"
                    @click="handleClose"
                    class="text-red-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Don't Review
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div v-else class="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  <p>This is your TO DO review</p>
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="handleSubmit"
                    :disabled="!hasValidRatings || isSubmitting"
                    class="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon v-if="isSubmitting" name="mdi:loading" class="w-4 h-4 animate-spin mr-2" />
                    {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
