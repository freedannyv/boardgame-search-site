<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import { useCollectionStore } from '~/stores/useCollectionStore'
import { useWishlistStore } from '~/stores/useWishlistStore'
import { useGameActions } from '~/composables/useGameActions'

interface GameDetail extends Game {
  description?: string | null
  yearPublished?: number | null
  weight?: number | null
  categories?: { name: string }[]
  mechanics?: { name: string }[]
}

const route = useRoute()
const gameId = computed(() => route.params.id as string)

// Stores
const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const { toggleCollection, toggleWishlist } = useGameActions()

// Reactive state
const game = ref<GameDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Recommended games
const recommendedGames = ref<Game[]>([
  { id: '101', name: 'Wingspan', thumbnail: null, average: 8.1, minPlayers: 1, maxPlayers: 5, playingTime: 70 },
  { id: '102', name: 'Everdell', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 80 },
  { id: '103', name: 'Cascadia', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 45 },
  { id: '104', name: 'Parks', thumbnail: null, average: 7.7, minPlayers: 1, maxPlayers: 5, playingTime: 60 },
])

// Placeholder API call
async function fetchGame(id: string): Promise<GameDetail> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock game data
  return {
    id,
    name: 'Gloomhaven',
    image: null,
    thumbnail: null,
    average: 8.7,
    minPlayers: 1,
    maxPlayers: 4,
    playingTime: 120,
    yearPublished: 2017,
    weight: 3.86,
    description: `Gloomhaven is a game of Euro-inspired tactical combat in a persistent world of shifting motives. Players will take on the role of a wandering adventurer with their own special set of skills and their own reasons for traveling to this dark corner of the world.

Players must work together out of necessity to clear out menacing dungeons and forgotten ruins. In the process, they will enhance their abilities with experience and loot, discover new locations to explore and plunder, and expand an ever-branching story fueled by the decisions they make.

This is a game with a persistent and changing world that is ideally played over many game sessions. After a scenario, players will make decisions on what to do, which will determine how the story continues, much like a "Choose Your Own Adventure" book.`,
    categories: [
      { name: 'Adventure' },
      { name: 'Exploration' },
      { name: 'Fantasy' },
      { name: 'Fighting' },
      { name: 'Miniatures' },
    ],
    mechanics: [
      { name: 'Action Queue' },
      { name: 'Campaign / Battle Card Driven' },
      { name: 'Cooperative Game' },
      { name: 'Grid Movement' },
      { name: 'Hand Management' },
      { name: 'Legacy Game' },
      { name: 'Modular Board' },
      { name: 'Role Playing' },
    ]
  }
}

// Fetch game on mount
async function loadGame() {
  loading.value = true
  error.value = null
  
  try {
    game.value = await fetchGame(gameId.value)
  } catch (e) {
    error.value = 'Failed to load game details'
  } finally {
    loading.value = false
  }
}

// Computed properties for store state
const isInCollection = computed(() => {
  return game.value ? collectionStore.isOwned(Number(game.value.id)) : false
})

const isInWishlist = computed(() => {
  return game.value ? wishlistStore.isWishlisted(Number(game.value.id)) : false
})

// Action handlers
function handleAddToCollection() {
  if (game.value) {
    toggleCollection(Number(game.value.id))
  }
}

function handleRemoveFromCollection() {
  if (game.value) {
    toggleCollection(Number(game.value.id))
  }
}

function handleToggleWishlist() {
  if (game.value) {
    toggleWishlist(Number(game.value.id))
  }
}

// Recommended game handlers
function handleRecommendedAddToCollection(id: string) {
  toggleCollection(Number(id))
}

function handleRecommendedRemoveFromCollection(id: string) {
  toggleCollection(Number(id))
}

function handleRecommendedToggleWishlist(id: string) {
  toggleWishlist(Number(id))
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
