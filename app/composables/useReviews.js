import { ref, computed } from 'vue'

// Local storage helpers
function getLocalStorageData(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

function setLocalStorageData(key, value) {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error)
  }
}

// Reactive storage
const reviewsStorage = ref(getLocalStorageData('game-reviews', {}))
const ratingsStorage = ref(getLocalStorageData('game-ratings', {}))

// Sync with localStorage
watch(reviewsStorage, (newValue) => {
  setLocalStorageData('game-reviews', newValue)
}, { deep: true })

watch(ratingsStorage, (newValue) => {
  setLocalStorageData('game-ratings', newValue)
}, { deep: true })

export function useReviews() {
  // Save a review for a game
  function saveReview(gameId, review) {
    const currentReviews = reviewsStorage.value[gameId] || {}
    
    // Determine which review slot to use
    if (!currentReviews.firstReview) {
      currentReviews.firstReview = review
    } else if (!currentReviews.secondReview) {
      currentReviews.secondReview = review
    } else if (!currentReviews.thirdReview) {
      currentReviews.thirdReview = review
      // Third review updates the main rating
      updateMainRating(gameId, currentReviews)
    } else if (!currentReviews.fourthReview) {
      currentReviews.fourthReview = review
      updateMainRating(gameId, currentReviews)
    } else if (!currentReviews.fifthReview) {
      currentReviews.fifthReview = review
      updateMainRating(gameId, currentReviews)
    } else {
      // If all slots are filled, replace the oldest (or implement your own logic)
      // For now, we'll replace the first review
      currentReviews.firstReview = review
      updateMainRating(gameId, currentReviews)
    }
    
    reviewsStorage.value[gameId] = { ...currentReviews }
  }

  // Update the main rating for a game
  function updateMainRating(gameId, reviews) {
    const allReviews = Object.values(reviews).filter(Boolean)
    
    if (allReviews.length === 0) return
    
    // Calculate average from all reviews
    const totalRating = allReviews.reduce((sum, review) => sum + review.overallAverage, 0)
    const averageRating = Number((totalRating / allReviews.length).toFixed(1))
    
    ratingsStorage.value[gameId] = {
      gameId,
      averageRating,
      totalReviews: allReviews.length,
      lastUpdated: Date.now()
    }
  }

  // Get all reviews for a game
  function getGameReviews(gameId) {
    return reviewsStorage.value[gameId] || {}
  }

  // Get the main rating for a game
  function getGameRating(gameId) {
    return ratingsStorage.value[gameId] || null
  }

  // Get review count for a game
  function getReviewCount(gameId) {
    const reviews = reviewsStorage.value[gameId]
    if (!reviews) return 0
    return Object.values(reviews).filter(Boolean).length
  }

  // Check if user has reviewed a game
  function hasReviewed(gameId) {
    return getReviewCount(gameId) > 0
  }

  // Get the latest review for a game
  function getLatestReview(gameId) {
    const reviews = getGameReviews(gameId)
    const allReviews = Object.values(reviews).filter(Boolean)
    
    if (allReviews.length === 0) return null
    
    return allReviews.reduce((latest, review) => 
      review.timestamp > latest.timestamp ? review : latest
    )
  }

  // Delete all reviews for a game (for testing/admin)
  function deleteGameReviews(gameId) {
    const newReviews = { ...reviewsStorage.value }
    const newRatings = { ...ratingsStorage.value }
    
    delete newReviews[gameId]
    delete newRatings[gameId]
    
    reviewsStorage.value = newReviews
    ratingsStorage.value = newRatings
  }

  // Get all games with ratings
  function getAllRatedGames() {
    return Object.values(ratingsStorage.value)
  }

  // Get top rated games
  function getTopRatedGames(limit = 10) {
    return getAllRatedGames()
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)
  }

  return {
    // Actions
    saveReview,
    updateMainRating,
    deleteGameReviews,
    
    // Getters
    getGameReviews,
    getGameRating,
    getReviewCount,
    hasReviewed,
    getLatestReview,
    getAllRatedGames,
    getTopRatedGames,
    
    // Storage access (for advanced usage)
    reviewsStorage: readonly(reviewsStorage),
    ratingsStorage: readonly(ratingsStorage)
  }
}
