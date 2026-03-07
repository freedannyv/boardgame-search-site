<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import type { CollectionFiltersType } from '~/components/CollectionFilters.vue'

// Collection games
const games = ref<Game[]>([])
const loading = ref(true)

// Stats
const stats = ref({
  total: 0,
  played: 0,
  unplayed: 0
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
async function fetchCollection(): Promise<{ games: Game[], stats: typeof stats.value }> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const gameNames = [
    'Gloomhaven', 'Brass: Birmingham', 'Pandemic Legacy', 'Twilight Imperium',
    'Great Western Trail', 'Viticulture', 'Scythe', 'Root', 'Dune: Imperium',
    'Lost Ruins of Arnak', 'Clank!', 'Wingspan', 'Everdell', 'Parks'
  ]
  
  const mockGames = gameNames.map((name, i) => ({
    id: String(i + 1),
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
      played: Math.floor(mockGames.length * 0.6),
      unplayed: Math.ceil(mockGames.length * 0.4)
    }
  }
}

// Load collection
async function loadCollection() {
  loading.value = true
  try {
    const result = await fetchCollection()
    games.value = result.games
    stats.value = result.stats
  } finally {
    loading.value = false
  }
}

// Wishlist tracking
const wishlistIds = ref<string[]>([])

function handleRemoveFromCollection(gameId: string) {
  games.value = games.value.filter(g => g.id !== gameId)
  stats.value.total = games.value.length
}

function handleToggleWishlist(gameId: string) {
  if (wishlistIds.value.includes(gameId)) {
    wishlistIds.value = wishlistIds.value.filter(id => id !== gameId)
  } else {
    wishlistIds.value.push(gameId)
  }
}

// Handle filter changes from component
function handleFiltersChanged(newFilters: CollectionFiltersType) {
  filters.value = newFilters
  loadCollection()
}

// Handle sort changes
function handleSortChanged(newSortBy: string) {
  sortBy.value = newSortBy
  loadCollection()
}

onMounted(() => {
  loadCollection()
})
</script>

<template>
  <div class="pb-8">
    <!-- Collection Header -->
    <div class="bg-gradient-to-b from-indigo-50 to-white px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-900">Your Collection</h1>
      <p class="text-gray-600 mt-1">
        <span class="font-semibold text-indigo-600">{{ stats.total }}</span> games owned
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
          <p class="text-2xl font-bold text-emerald-600">{{ stats.played }}</p>
          <p class="text-xs text-gray-500 mt-1">Played</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p class="text-2xl font-bold text-amber-600">{{ stats.unplayed }}</p>
          <p class="text-xs text-gray-500 mt-1">Unplayed</p>
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
              :class="viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              <Icon name="mdi:view-grid" class="w-5 h-5" />
            </button>
            <button
              @click="viewMode = 'list'"
              class="p-2 rounded-md transition-colors"
              :class="viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
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
        <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <!-- Grid view -->
      <GameGrid
        v-else-if="games.length > 0 && viewMode === 'grid'"
        :games="games"
        :collection-ids="games.map(g => g.id)"
        :wishlist-ids="wishlistIds"
        @remove-from-collection="handleRemoveFromCollection"
        @toggle-wishlist="handleToggleWishlist"
      />

      <!-- List view -->
      <div v-else-if="games.length > 0 && viewMode === 'list'" class="-mx-4 bg-white">
        <CompactGameRow
          v-for="game in games"
          :key="game.id"
          :game="game"
          :is-in-collection="true"
          :is-in-wishlist="wishlistIds.includes(game.id)"
          @remove-from-collection="handleRemoveFromCollection"
          @toggle-wishlist="handleToggleWishlist"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center py-12">
        <Icon name="mdi:bookshelf" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p class="text-gray-900 font-medium text-lg">Your collection is empty</p>
        <p class="text-gray-500 mt-1">Start adding games to build your collection</p>
        <NuxtLink 
          to="/search"
          class="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Icon name="mdi:magnify" class="w-5 h-5" />
          Browse Games
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
