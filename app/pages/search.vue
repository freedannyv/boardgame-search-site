<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import type { Filters } from '~/components/FilterDrawer.vue'

const route = useRoute()

// Read search query from URL
const searchQuery = computed(() => (route.query.q as string) || '')

// Inject filters from layout
const filters = inject<Ref<Filters>>('searchFilters', ref({
  playerCount: null,
  playTime: null,
  minRating: 0
}))

const games = ref<Game[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const totalCount = ref(0)
const hasMore = ref(true)

// View mode: 'grid' or 'list'
const viewMode = ref<'grid' | 'list'>('grid')

// Request versioning to handle race conditions
let currentRequestId = 0

// Mock data generator
function generateMockGames(startId: number, count: number): Game[] {
  const gameNames = [
    'Gloomhaven', 'Brass: Birmingham', 'Pandemic Legacy', 'Twilight Imperium',
    'Great Western Trail', 'Viticulture', 'Scythe', 'Root', 'Dune: Imperium',
    'Lost Ruins of Arnak', 'Clank!', 'Quacks of Quedlinburg', 'Wingspan',
    'Everdell', 'Parks', 'Photosynthesis', 'Azul', 'Sagrada', 'Century: Spice Road'
  ]
  
  return Array.from({ length: count }, (_, i) => ({
    id: String(startId + i),
    name: gameNames[(startId + i) % gameNames.length] + (startId + i > 18 ? ` ${Math.floor((startId + i) / 19) + 1}` : ''),
    thumbnail: null,
    average: Math.round((6 + Math.random() * 3) * 10) / 10,
    minPlayers: Math.floor(Math.random() * 2) + 1,
    maxPlayers: Math.floor(Math.random() * 4) + 2,
    playingTime: [30, 45, 60, 90, 120, 180][Math.floor(Math.random() * 6)]
  }))
}

// Placeholder API call
async function fetchGames(query: string, filterParams: Filters, pageNum: number): Promise<{ games: Game[], total: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock results - fewer results when searching
  const baseCount = query ? 47 : 1245
  const perPage = 20
  const remaining = Math.max(0, baseCount - (pageNum - 1) * perPage)
  const count = Math.min(perPage, remaining)
  
  return {
    games: generateMockGames((pageNum - 1) * perPage, count),
    total: baseCount
  }
}

// Initial load and search handler
async function handleSearch(query: string) {
  // Increment request ID to track this specific request
  const requestId = ++currentRequestId
  
  loading.value = true
  page.value = 1
  games.value = []
  hasMore.value = true
  
  try {
    const result = await fetchGames(query, filters.value, 1)
    
    // Ignore stale results from previous requests
    if (requestId !== currentRequestId) return
    
    games.value = result.games
    totalCount.value = result.total
    hasMore.value = result.games.length === 20
  } finally {
    // Only update loading state if this is still the current request
    if (requestId === currentRequestId) {
      loading.value = false
    }
  }
}

// Load more games
async function loadMore() {
  if (loadingMore.value || !hasMore.value || loading.value) return
  
  const requestId = currentRequestId
  loadingMore.value = true
  page.value++
  
  try {
    const result = await fetchGames(searchQuery.value, filters.value, page.value)
    
    // Ignore if a new search was started
    if (requestId !== currentRequestId) return
    
    games.value = [...games.value, ...result.games]
    hasMore.value = result.games.length === 20
  } finally {
    if (requestId === currentRequestId) {
      loadingMore.value = false
    }
  }
}

// Watch for filter changes from layout
watch(filters, () => {
  handleSearch(searchQuery.value)
}, { deep: true })

// Infinite scroll detection
const scrollContainer = ref<HTMLElement | null>(null)

function handleScroll() {
  if (!scrollContainer.value || loading.value || loadingMore.value || !hasMore.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const threshold = 200
  
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    loadMore()
  }
}

// Collection and wishlist state (placeholder)
const collectionIds = ref<string[]>([])
const wishlistIds = ref<string[]>([])

function handleAddToCollection(gameId: string) {
  collectionIds.value.push(gameId)
}

function handleRemoveFromCollection(gameId: string) {
  collectionIds.value = collectionIds.value.filter(id => id !== gameId)
}

function handleToggleWishlist(gameId: string) {
  if (wishlistIds.value.includes(gameId)) {
    wishlistIds.value = wishlistIds.value.filter(id => id !== gameId)
  } else {
    wishlistIds.value.push(gameId)
  }
}

function handleLogPlay(gameId: string) {
  console.log('Log play for game:', gameId)
}

// Watch for URL query changes
watch(() => route.query.q, (newQuery) => {
  handleSearch((newQuery as string) || '')
}, { immediate: true })
</script>

<template>
  <div 
    ref="scrollContainer" 
    class="h-full overflow-y-auto"
    @scroll="handleScroll"
  >
    <!-- Results section -->
    <div class="p-4">
      <!-- Header with title and view toggle -->
      <div class="flex items-center justify-between mb-3">
        <div>
          <h1 v-if="searchQuery" class="text-lg font-semibold text-gray-900">
            Results for "{{ searchQuery }}"
          </h1>
          <h1 v-else class="text-lg font-semibold text-gray-900">
            Browse All Games
          </h1>
          <p v-if="!loading && games.length > 0" class="text-sm text-gray-600 mt-0.5">
            <span class="font-semibold text-gray-900">{{ totalCount.toLocaleString() }}</span> games found
          </p>
        </div>
        
        <!-- View toggle -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            class="p-2 rounded-md transition-colors"
            :class="viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            title="Grid view"
          >
            <Icon name="mdi:view-grid" class="w-5 h-5" />
          </button>
          <button
            @click="viewMode = 'list'"
            class="p-2 rounded-md transition-colors"
            :class="viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            title="List view"
          >
            <Icon name="mdi:view-list" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <!-- Game grid view -->
      <GameGrid
        v-else-if="games.length > 0 && viewMode === 'grid'"
        :games="games"
        :collection-ids="collectionIds"
        :wishlist-ids="wishlistIds"
        @add-to-collection="handleAddToCollection"
        @remove-from-collection="handleRemoveFromCollection"
        @toggle-wishlist="handleToggleWishlist"
        @log-play="handleLogPlay"
      />

      <!-- Compact list view -->
      <div v-else-if="games.length > 0 && viewMode === 'list'" class="-mx-4 bg-white">
        <CompactGameRow
          v-for="game in games"
          :key="game.id"
          :game="game"
          :is-in-collection="collectionIds.includes(game.id)"
          :is-in-wishlist="wishlistIds.includes(game.id)"
          @add-to-collection="handleAddToCollection"
          @remove-from-collection="handleRemoveFromCollection"
          @toggle-wishlist="handleToggleWishlist"
          @log-play="handleLogPlay"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && searchQuery" class="text-center py-12">
        <Icon name="mdi:magnify-close" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-gray-900 font-medium">No games found</p>
        <p class="text-gray-500 text-sm mt-1">Try a different search or adjust your filters</p>
      </div>

      <!-- Loading more indicator -->
      <div v-if="loadingMore" class="flex justify-center py-6">
        <Icon name="mdi:loading" class="w-6 h-6 animate-spin text-indigo-600" />
      </div>

      <!-- End of results -->
      <div v-else-if="!hasMore && games.length > 0" class="text-center py-6 text-gray-500 text-sm">
        You've reached the end
      </div>
    </div>
  </div>
</template>
