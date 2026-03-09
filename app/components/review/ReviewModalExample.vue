<script setup lang="ts">
import ReviewModal from './ReviewModal.vue'
import { useReviews } from '~/composables/useReviews'

// Example usage state
const isReviewModalOpen = ref(false)
const selectedGame = ref({
  id: '1',
  name: 'Wingspan'
})

// Composables
const { getGameReviews, getGameRating, getReviewCount } = useReviews()

// Open review modal
function openReviewModal() {
  isReviewModalOpen.value = true
}

// Handle review submission
function handleReviewSubmit(review: any) {
  console.log('Review submitted:', review)
  
  // Here you would typically:
  // 1. Show a success message
  // 2. Navigate to the gamified review experience
  // 3. Update UI to reflect the new review
  
  // For demo, show the review data
  alert(`Review submitted for ${selectedGame.value.name}!\n\nOverall Rating: ${review.overallAverage}/10\nWould Recommend: ${review.wouldRecommend ? 'Yes' : 'No'}`)
}

// Get existing review data for demo
const existingReviews = computed(() => getGameReviews(selectedGame.value.id))
const gameRating = computed(() => getGameRating(selectedGame.value.id))
const reviewCount = computed(() => getReviewCount(selectedGame.value.id))
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Review Modal Demo</h1>
    
    <!-- Demo Controls -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Test the Review Modal</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Game:</label>
          <select v-model="selectedGame.id" class="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="1">Wingspan</option>
            <option value="2">Everdell</option>
            <option value="3">Ark Nova</option>
          </select>
        </div>
        
        <button
          @click="openReviewModal"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Review {{ selectedGame.name }}
        </button>
      </div>
    </div>
    
    <!-- Existing Reviews Display -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Existing Reviews</h2>
      
      <div v-if="reviewCount === 0" class="text-gray-500">
        No reviews yet for {{ selectedGame.name }}
      </div>
      
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">{{ selectedGame.name }}</p>
            <p class="text-sm text-gray-600">{{ reviewCount }} review(s)</p>
          </div>
          <div v-if="gameRating" class="text-right">
            <p class="text-2xl font-bold text-yellow-600">{{ gameRating.averageRating }}/10</p>
            <p class="text-sm text-gray-500">Average Rating</p>
          </div>
        </div>
        
        <!-- Display individual reviews -->
        <div class="space-y-3">
          <div
            v-for="(review, index) in Object.entries(existingReviews)"
            :key="index"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-medium text-gray-700 capitalize">
                {{ String(index).replace('Review', '') }} Review
              </span>
              <span class="text-sm text-gray-500">
                {{ new Date(review[1].timestamp).toLocaleDateString() }}
              </span>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Overall:</span>
                <span class="text-yellow-600 font-bold">{{ review[1].overallAverage }}/10</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Personal Rating:</span>
                <span class="text-yellow-600 font-bold">{{ review[1].personalRating }}/10</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Favorite Players:</span>
                <span class="text-gray-700">{{ review[1].favoritePlayerCount }}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Would Recommend:</span>
                <span :class="review[1].wouldRecommend ? 'text-green-600' : 'text-red-600'">
                  {{ review[1].wouldRecommend ? 'Yes' : 'No' }}
                </span>
              </div>
              
              <div v-if="review[1].likes.length > 0" class="mt-2">
                <p class="text-sm font-medium text-green-700">Likes:</p>
                <ul class="list-disc list-inside text-sm text-gray-600">
                  <li v-for="like in review[1].likes" :key="like">{{ like }}</li>
                </ul>
              </div>
              
              <div v-if="review[1].dislikes.length > 0" class="mt-2">
                <p class="text-sm font-medium text-red-700">Dislikes:</p>
                <ul class="list-disc list-inside text-sm text-gray-600">
                  <li v-for="dislike in review[1].dislikes" :key="dislike">{{ dislike }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Review Modal -->
    <ReviewModal
      :is-open="isReviewModalOpen"
      :game-id="selectedGame.id"
      :game-name="selectedGame.name"
      @close="isReviewModalOpen = false"
      @submit="handleReviewSubmit"
    />
  </div>
</template>
