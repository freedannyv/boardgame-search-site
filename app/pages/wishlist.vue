<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'
import type { CollectionFiltersType } from '~/components/CollectionFilters.vue'
import { useCollectionStore } from '~/stores/useCollectionStore'
import { useWishlistStore } from '~/stores/useWishlistStore'
import { usePlaceholderGamesStore } from '~/stores/games'

// Stores
const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const placeholderGamesStore = usePlaceholderGamesStore()

// Wishlist games from store
const wishlistGames = computed(() => {
  const gameIds = Array.from(wishlistStore.gameIds)
  return placeholderGamesStore.getPlaceholderGames.filter(game => 
    gameIds.includes(Number(game.id))
  )
})

// Loading state
const loading = ref(false)

// Stats based on wishlist
const stats = computed(() => {
  const total = wishlistGames.value.length
  return {
    total,
    highPriority: Math.floor(total * 0.3), // Placeholder - would come from priority system
    recentlyAdded: Math.floor(total * 0.25)  // Placeholder - would come from timestamps
  }
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

// Handle filter changes from component
function handleFiltersChanged(newFilters: CollectionFiltersType) {
  filters.value = newFilters
  // TODO: Apply filters to wishlistGames
}

// Handle sort changes
function handleSortChanged(newSortBy: string) {
  sortBy.value = newSortBy
  // TODO: Apply sorting to wishlistGames
}

// Load wishlist (reactive - no async needed)
function loadWishlist() {
  loading.value = true
  // Wishlist data is now reactive from stores
  setTimeout(() => {
    loading.value = false
  }, 300) // Brief loading state for UX
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
        v-else-if="wishlistGames.length > 0 && viewMode === 'grid'"
        :games="wishlistGames"
      />

      <!-- List view -->
      <div v-else-if="wishlistGames.length > 0 && viewMode === 'list'" class="-mx-4 bg-white">
        <CompactGameRow
          v-for="game in wishlistGames"
          :key="game.id"
          :game="game"
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
