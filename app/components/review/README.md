# Review Modal Component

A comprehensive, reusable Nuxt 3 modal component for collecting detailed game reviews after play sessions.

## Features

- **10 Rating Criteria**: Each with 1-10 star ratings
  - Fun
  - Replayability
  - Player Interaction
  - Accessibility / Learning Curve
  - Flow / Pacing
  - Theme & Immersion
  - Component / Production Quality
  - Balance / Fairness
  - Meaningful Choices
  - Table Presence / Visual Appeal

- **Personal Overall Rating**: 1-10 stars
- **Favorite Player Count**: Number input
- **Recommendation**: Would you recommend checkbox
- **Likes/Dislikes**: Multi-line text areas with Enter-to-add functionality
- **Automatic Average Calculation**: Overall average from all criteria + personal rating
- **Review Storage**: Stores reviews as firstReview, secondReview, thirdReview, etc.
- **Progressive Rating System**: 
  - First review provides initial ratings
  - Third+ reviews update main game rating

## Components

### ReviewModal.vue
Main modal component with all review functionality.

### StarRating.vue
Reusable star rating component (1-10 stars).

### useReviews.ts
Composable for managing review storage and calculations.

## Usage

### Basic Usage

```vue
<script setup>
import ReviewModal from '~/components/review/ReviewModal.vue'

const isReviewModalOpen = ref(false)
const selectedGame = ref({
  id: '1',
  name: 'Wingspan'
})

function handleReviewSubmit(review) {
  console.log('Review submitted:', review)
  // Handle review submission
}
</script>

<template>
  <ReviewModal
    :is-open="isReviewModalOpen"
    :game-id="selectedGame.id"
    :game-name="selectedGame.name"
    @close="isReviewModalOpen = false"
    @submit="handleReviewSubmit"
  />
</template>
```

### Integration with Game Logging

The modal is designed to appear after a user logs a game play (live or finished):

```vue
<script setup>
import { useReviews } from '~/composables/useReviews'

const { saveReview } = useReviews()

function afterGameLogging(gameId, gameName) {
  // Open review modal
  reviewModalProps.value = { gameId, gameName }
  isReviewModalOpen.value = true
}

function handleReviewSubmit(review) {
  // Save review
  saveReview(review.gameId, review)
  
  // Close modal
  isReviewModalOpen.value = false
  
  // Navigate to gamified review experience
  navigateTo(`/review-experience/${review.gameId}`)
}
</script>
```

## Data Structure

### GameReview Interface

```typescript
interface GameReview {
  gameId: string
  criteria: Record<string, number>     // 10 criteria ratings
  personalRating: number              // 1-10 personal rating
  favoritePlayerCount: number         // Favorite player count
  wouldRecommend: boolean             // Recommendation
  likes: string[]                    // Array of likes
  dislikes: string[]                 // Array of dislikes
  overallAverage: number             // Calculated average
  timestamp: number                  // Submission time
}
```

### Storage Structure

Reviews are stored in localStorage as:

```typescript
interface GameReviews {
  firstReview?: GameReview
  secondReview?: GameReview
  thirdReview?: GameReview
  fourthReview?: GameReview
  fifthReview?: GameReview
}
```

### Rating Data

Main game ratings are stored as:

```typescript
interface GameRatingData {
  gameId: string
  averageRating: number    // Updated from 3rd review onwards
  totalReviews: number
  lastUpdated: number
}
```

## Styling

The modal uses Tailwind CSS classes and matches the design of the LiveSession modal:

- Gradient header (indigo to purple)
- Smooth transitions and animations
- Responsive design
- Hover states and micro-interactions
- Star rating hover effects

## Composable API

### useReviews()

```typescript
const {
  saveReview,           // Save a review
  getGameReviews,       // Get all reviews for a game
  getGameRating,        // Get main rating for a game
  getReviewCount,       // Get review count
  hasReviewed,          // Check if user has reviewed
  getLatestReview,      // Get latest review
  getAllRatedGames,     // Get all rated games
  getTopRatedGames      // Get top rated games
} = useReviews()
```

## Integration Points

### After Live Session

```vue
<script setup>
// In LivePlaySession.vue or similar
function handleSessionComplete(gameId, gameName) {
  // Open review modal
  isReviewModalOpen.value = true
  reviewGame.value = { id: gameId, name: gameName }
}
</script>
```

### After Finished Play

```vue
<script setup>
// In FinishedPlayForm.vue or similar
function handlePlayLogged(gameId, gameName) {
  // Open review modal
  isReviewModalOpen.value = true
  reviewGame.value = { id: gameId, name: gameName }
}
</script>
```

## Future Enhancements

- Database integration (replace localStorage)
- Review editing functionality
- Review photos/images
- Social features (share reviews)
- Advanced filtering and search
- Review analytics and insights

## File Structure

```
app/components/review/
├── ReviewModal.vue          # Main modal component
├── StarRating.vue           # Star rating component
├── ReviewModalExample.vue   # Demo component
└── README.md               # This documentation

app/composables/
└── useReviews.ts           # Review management composable
```
