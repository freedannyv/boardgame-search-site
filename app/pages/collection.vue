<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { CollectionFiltersType } from '~/components/CollectionFilters.vue'
import { useUserGamesStore } from '~/stores/useUserGamesStore'

// Store
const userGamesStore = useUserGamesStore()
const { collection, isLoading, isLoaded } = storeToRefs(userGamesStore)

// Transform collection data for GameGrid
const gamesForGrid = computed(() => {
  return collection.value.map(item => ({
    id: item.game_id,
    name: item.name || `Game ${item.game_id}`,
    thumbnail: item.thumbnail,
    image: item.image,
    average: null, // TODO: Could add rating from games table
    minPlayers: null, // TODO: Could add from games table
    maxPlayers: null, // TODO: Could add from games table
    playingTime: null, // TODO: Could add from games table
    yearPublished: null // TODO: Could add from games table
  }))
})

// Stats based on collection
const stats = computed(() => {
  const total = collection.value.length
  return {
    total,
    played: 0, // TODO: Add play tracking
    unplayed: 0 // TODO: Add play tracking
  }
})

// Load collection if not already loaded
onMounted(async () => {
  if (!isLoaded.value) {
    await userGamesStore.loadUserGames()
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

// Handle remove from collection
async function handleRemoveFromCollection(gameId: string) {
  try {
    await userGamesStore.removeGameFromCollection(Number(gameId))
  } catch (error) {
    console.error('Failed to remove from collection:', error)
  }
}

// Handle filter changes from component
function handleFiltersChanged(newFilters: CollectionFiltersType) {
  filters.value = newFilters
  // TODO: Apply filters to collectionGames
}

// Handle sort changes
function handleSortChanged(newSortBy: string) {
  sortBy.value = newSortBy
  // TODO: Apply sorting to collectionGames
}
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
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="text-center">
          <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p class="text-gray-600 text-sm">
            Loading collection...
          </p>
        </div>
      </div>

      <!-- Grid view -->
      <GameGrid
        v-else-if="gamesForGrid?.length > 0"
        :games="gamesForGrid"
      />

      <!-- Empty state -->
      <div v-else-if="!isLoading" class="text-center py-12">
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
