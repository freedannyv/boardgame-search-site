<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import type { CollectionFiltersType } from '~/components/CollectionFilters.vue'

// Wishlist games
const games = ref<Game[]>([])
const loading = ref(true)

// Stats
const stats = ref({
  total: 0,
  highPriority: 0,
  recentlyAdded: 0
})

// Filters
const filters = ref<CollectionFiltersType>({
  playerCount: null,
  playTime: null,
  complexity: null,
  category: null,
  mechanic: null
})

// Sort
const sortBy = ref<string>('name')

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Placeholder API call
async function fetchWishlist(): Promise<{ games: Game[], stats: typeof stats.value }> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const gameNames = [
    'Ark Nova', 'Terraforming Mars', 'Spirit Island', 'Concordia',
    'Agricola', 'Puerto Rico', 'El Grande', 'Ticket to Ride'
  ]
  
  const mockGames = gameNames.map((name, i) => ({
    id: String(100 + i),
    name,
    thumbnail: null,
    average: Math.round((7 + Math.random() * 2) * 10) / 10,
    minPlayers: Math.floor(Math.random() * 2) + 1,
    maxPlayers: Math.floor(Math.random() * 4) + 2,
    playingTime: [30, 45, 60, 90, 120, 180][Math.floor(Math.random() * 6)]
  }))
  
  return {
    games: mockGames,
    stats: {
      total: mockGames.length,
      highPriority: Math.floor(mockGames.length * 0.3),
      recentlyAdded: Math.floor(mockGames.length * 0.25)
    }
  }
}

// Load wishlist
async function loadWishlist() {
  loading.value = true
  try {
    const result = await fetchWishlist()
    games.value = result.games
    stats.value = result.stats
  } finally {
    loading.value = false
  }
}

// Collection tracking
const collectionIds = ref<string[]>([])

function handleAddToCollection(gameId: string) {
  collectionIds.value.push(gameId)
  // Remove from wishlist when added to collection
  games.value = games.value.filter(g => g.id !== gameId)
  stats.value.total = games.value.length
}

function handleRemoveFromWishlist(gameId: string) {
  games.value = games.value.filter(g => g.id !== gameId)
  stats.value.total = games.value.length
}

// Handle filter changes from component
function handleFiltersChanged(newFilters: CollectionFiltersType) {
  filters.value = newFilters
  loadWishlist()
}

// Handle sort changes
function handleSortChanged(newSortBy: string) {
  sortBy.value = newSortBy
  loadWishlist()
}

onMounted(() => {
  loadWishlist()
})
</script>

<template>
  <div class="pb-8">
    <!-- Wishlist Header -->
    <div class="bg-gradient-to-b from-rose-50 to-white px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-900">Your Wishlist</h1>
      <p class="text-gray-600 mt-1">
        <span class="font-semibold text-rose-600">{{ stats.total }}</span> games wanted
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="px-4 -mt-2">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          <p class="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p class="text-2xl font-bold text-rose-600">{{ stats.highPriority }}</p>
          <p class="text-xs text-gray-500 mt-1">High Priority</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p class="text-2xl font-bold text-indigo-600">{{ stats.recentlyAdded }}</p>
          <p class="text-xs text-gray-500 mt-1">Recently Added</p>
        </div>
      </div>
    </div>

    <!-- Filters & Sort Bar -->
    <div class="sticky top-14 z-20 bg-white border-b border-gray-100 px-4 py-3 mt-4">
      <div class="flex items-center justify-between gap-3">
        <!-- Collection Filters Component -->
        <CollectionFilters 
          :filters="filters" 
          @filters-changed="handleFiltersChanged"
        />

        <div class="flex items-center gap-2">
          <!-- Sort dropdown -->
          <CollectionSort 
            :sort-by="sortBy" 
            @sort-changed="handleSortChanged" 
          />

          <!-- View toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              class="p-2 rounded-md transition-colors"
              :class="viewMode === 'grid' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              <Icon name="mdi:view-grid" class="w-5 h-5" />
            </button>
            <button
              @click="viewMode = 'list'"
              class="p-2 rounded-md transition-colors"
              :class="viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              <Icon name="mdi:view-list" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 mt-4">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-rose-600" />
      </div>

      <!-- Grid view -->
      <GameGrid
        v-else-if="games.length > 0 && viewMode === 'grid'"
        :games="games"
        :collection-ids="collectionIds"
        :wishlist-ids="games.map(g => g.id)"
        @add-to-collection="handleAddToCollection"
        @toggle-wishlist="handleRemoveFromWishlist"
      />

      <!-- List view -->
      <div v-else-if="games.length > 0 && viewMode === 'list'" class="-mx-4 bg-white">
        <CompactGameRow
          v-for="game in games"
          :key="game.id"
          :game="game"
          :is-in-collection="collectionIds.includes(game.id)"
          :is-in-wishlist="true"
          @add-to-collection="handleAddToCollection"
          @toggle-wishlist="handleRemoveFromWishlist"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center py-12">
        <Icon name="mdi:heart-outline" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p class="text-gray-900 font-medium text-lg">Your wishlist is empty</p>
        <p class="text-gray-500 mt-1">Browse games and add them to your wishlist</p>
        <NuxtLink 
          to="/search"
          class="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
        >
          <Icon name="mdi:magnify" class="w-5 h-5" />
          Browse Games
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
