<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import { useCollectionStore } from '~/stores/useCollectionStore'
import { useBggApi } from '~/composables/useBggApi'
import { parseBggThingResponse, parseBggExpansionsResponse, extractExpansionIds } from '~/utils/bggParser'

interface GameDetail extends Game {
  description?: string | null
  yearPublished?: number | null
  weight?: number | null
  categories?: { name: string }[]
  mechanics?: { name: string }[]
}

const route = useRoute()
const gameId = computed(() => route.params.id as string)

// Store
const collectionStore = useCollectionStore()

// Reactive state
const game = ref<GameDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const expansions = ref<any[]>([])
const expansionsLoading = ref(false)

// Recommended games
const recommendedGames = ref<Game[]>([
  { id: '101', name: 'Wingspan', thumbnail: null, average: 8.1, minPlayers: 1, maxPlayers: 5, playingTime: 70 },
  { id: '102', name: 'Everdell', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 80 },
  { id: '103', name: 'Cascadia', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 45 },
  { id: '104', name: 'Parks', thumbnail: null, average: 7.7, minPlayers: 1, maxPlayers: 5, playingTime: 60 },
])

// Real BGG API call to fetch game details
async function fetchGame(id: string): Promise<GameDetail> {
  try {
    const { getThing } = useBggApi()
    const response = await getThing(Number(id), {
      stats: true,
      market: false,
      comments: false,
      videos: false,
      versions: false
    })
    
    // Parse XML response and transform to GameDetail format
    // console.log('============Parsed BGG game:', response.data || response)
    const parsedGame = parseBggThingResponse(response.data || response)
    
    // Extract expansion IDs from base game response
    const expansionIds = extractExpansionIds(response.data || response)
    console.log('Extracted expansion IDs:', expansionIds)
    
    // Store expansion IDs for later use
    if (expansionIds.length > 0) {
      // We'll use this in fetchExpansions
      ;(window as any).tempExpansionIds = expansionIds
    }
    
    if (!parsedGame) {
      throw new Error('Failed to parse game data')
    }
    
    // Transform to GameDetail interface
    return {
      id: parsedGame.id,
      name: parsedGame.name,
      image: (parsedGame as any).image || null,
      thumbnail: parsedGame.thumbnail,
      average: parsedGame.average || 0,
      minPlayers: (parsedGame as any).minPlayers || 1,
      maxPlayers: (parsedGame as any).maxPlayers || 4,
      playingTime: (parsedGame as any).playingTime || 60,
      yearPublished: parsedGame.yearPublished,
      weight: (parsedGame as any).weight || null,
      description: (parsedGame as any).description || null,
      categories: [], // TODO: Extract categories from XML
      mechanics: [] // TODO: Extract mechanics from XML
    }
  } catch (error) {
    console.error('Error fetching game:', error)
    throw error
  }
}

// Fetch game expansions from BGG
const fetchExpansions = async () => {
  try {
    expansionsLoading.value = true
    const { getThing } = useBggApi()
    
    // Get expansion IDs from the stored temp variable
    const expansionIds = (window as any).tempExpansionIds || []
    
    if (expansionIds.length === 0) {
      expansions.value = []
      return
    }
    
    console.log('Fetching expansions for IDs:', expansionIds)
    
    // Fetch each expansion individually
    const expansionPromises = expansionIds.map(async (id: string) => {
      try {
        const response = await getThing(Number(id), {
          stats: false,
          market: false,
          comments: false,
          videos: false,
          versions: false
        })
        
        const parsedExpansion = parseBggThingResponse(response.data || response)
        if (parsedExpansion) {
          return {
            id: parsedExpansion.id,
            name: parsedExpansion.name,
            yearPublished: parsedExpansion.yearPublished,
            thumbnail: parsedExpansion.thumbnail,
            average: null
          }
        }
        return null
      } catch (error) {
        console.error(`Error fetching expansion ${id}:`, error)
        return null
      }
    })
    
    const expansionResults = await Promise.all(expansionPromises)
    const validExpansions = expansionResults.filter(exp => exp !== null)
    
    // Sort expansions by yearPublished (newest first)
    const sortedExpansions = validExpansions.sort((a, b) => {
      const yearA = a.yearPublished || 0
      const yearB = b.yearPublished || 0
      return yearB - yearA
    })
    
    console.log('Fetched expansions:', sortedExpansions)
    expansions.value = sortedExpansions
  } catch (error) {
    console.error('Error fetching expansions:', error)
    expansions.value = []
  } finally {
    expansionsLoading.value = false
  }
}

// Fetch game on mount
async function loadGame() {
  loading.value = true
  error.value = null
  
  try {
    game.value = await fetchGame(gameId.value)
    // After game is loaded, fetch expansions
    await fetchExpansions()
  } catch (e) {
    error.value = 'Failed to load game details'
  } finally {
    loading.value = false
  }
}

// Computed properties for store state
const isInCollection = computed(() => {
  return game.value ? collectionStore.isGameInCollection(game.value.id) : false
})

const isInWishlist = computed(() => {
  return game.value ? collectionStore.isGameInWishlist(game.value.id) : false
})

// Action handlers
function handleAddToCollection() {
  if (game.value) {
    // For now just log - collection modal would be needed
    console.log('Collection modal would open for game:', game.value.id)
  }
}

function handleRemoveFromCollection() {
  if (game.value) {
    collectionStore.removeGameFromCollection(Number(game.value.id))
  }
}

function handleToggleWishlist() {
  if (game.value) {
    if (collectionStore.isGameInWishlist(game.value.id)) {
      collectionStore.removeGameFromWishlist(game.value.id)
    } else {
      collectionStore.addGameToWishlist({
        gameId: game.value.id,
        thumbnail: game.value.thumbnail,
        image: game.value.image
      })
    }
  }
}

// Recommended game handlers
function handleRecommendedAddToCollection(id: string) {
  // For now just log - collection modal would be needed
  console.log('Collection modal would open for game:', id)
}

function handleRecommendedRemoveFromCollection(id: string) {
  collectionStore.removeGameFromCollection(Number(id))
}

function handleRecommendedToggleWishlist(id: string) {
  // Find the recommended game data - this would need access to the recommended games list
  // For now, we'll call without image data, but ideally this should be updated
  if (collectionStore.isGameInWishlist(id)) {
    collectionStore.removeGameFromWishlist(id)
  } else {
    collectionStore.addGameToWishlist({
      gameId: id,
      thumbnail: null,
      image: null
    })
  }
}

// Format game data for GameHeader
const gameHeaderData = computed(() => {
  if (!game.value) return null
  return {
    id: game.value.id,
    name: game.value.name,
    image: game.value.image,
    thumbnail: game.value.thumbnail,
    rating: game.value.average,
    minPlayers: game.value.minPlayers,
    maxPlayers: game.value.maxPlayers,
    playtime: game.value.playingTime,
    weight: game.value.weight,
    year: game.value.yearPublished
  }
})

// Watch for route changes
watch(gameId, () => {
  loadGame()
}, { immediate: true })
</script>

<template>
  <div class="pb-8">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-20">
      <Icon name="mdi:loading" class="w-10 h-10 animate-spin text-indigo-600" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-20 px-4">
      <Icon name="mdi:alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-500" />
      <p class="text-gray-900 font-medium text-lg">{{ error }}</p>
      <button 
        @click="loadGame"
        class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Game content -->
    <div v-else-if="game">
      <!-- Back button -->
      <div class="px-4 pt-4">
        <button 
          @click="$router.back()"
          class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors mb-4"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <!-- Main content -->
      <div class="px-4">
        <!-- Game Header -->
        <GameHeader 
          v-if="gameHeaderData" 
          :game="gameHeaderData"
          :expansions="expansions"
          :is-in-collection="isInCollection"
          :is-in-wishlist="isInWishlist"
          @add-to-collection="handleAddToCollection"
          @remove-from-collection="handleRemoveFromCollection"
          @toggle-wishlist="handleToggleWishlist"
        />


        <!-- Description -->
        <section v-if="game.description" class="mt-10">
          <h2 class="text-lg font-bold text-gray-900 mb-3">About</h2>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{ game.description }}</p>
          </div>
        </section>

        <!-- Categories & Mechanics -->
        <GameTags 
          v-if="game.categories?.length || game.mechanics?.length"
          :categories="game.categories"
          :mechanics="game.mechanics"
          class="mt-8"
        />

        <!-- Expansions -->
        <GameSection
          ref="expansionsSection"
          :title="`${expansions.length} Expansions for ${game.name}`"
          :games="expansions"
          :loading="expansionsLoading"
          class="mt-8"
        />

        <!-- Recommended games -->
        <RecommendedGames
          :games="recommendedGames"
          class="mt-12 pt-8 border-t border-gray-100"
          @add-to-collection="handleRecommendedAddToCollection"
          @remove-from-collection="handleRecommendedRemoveFromCollection"
          @toggle-wishlist="handleRecommendedToggleWishlist"
        />
      </div>
    </div>
  </div>
</template>
