<script setup lang="ts">
import type { Filters } from '~/components/FilterDrawer.vue'
import type { SearchResult } from '~/components/SearchBar.vue'
import GlobalToast from '~/components/GlobalToast.vue'
import { useBggApi } from '~/composables/useBggApi'
import { parseBggSearchResponse } from '~/utils/bggParser'
import { useStoreRehydration } from '~/composables/useStoreRehydration'

// Initialize store rehydration
useStoreRehydration()

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const searchLoading = ref(false)
const isFilterOpen = ref(false)
const filters = ref<Filters>({
  playerCount: null,
  playTime: null,
  minRating: 0
})

// Provide filters to child pages
provide('searchFilters', filters)

// Sync search query with URL when on search page
watch(() => route.query.q, (newQuery) => {
  if (route.path === '/search') {
    searchQuery.value = (newQuery as string) || ''
  }
}, { immediate: true })

// Clear search when leaving search page
watch(() => route.path, (newPath) => {
  if (newPath !== '/search') {
    searchQuery.value = ''
    searchResults.value = []
  }
})

const navigation = [
  { name: 'Home', icon: 'mdi:home', to: '/' },
  { name: 'Search', icon: 'mdi:magnify', to: '/search' },
  { name: 'Collection', icon: 'mdi:bookshelf', to: '/collection' },
  { name: 'Wishlist', icon: 'mdi:heart', to: '/wishlist' },
  { name: 'Friends', icon: 'mdi:account-group', to: '/friends' }
]

function openFilters() {
  isFilterOpen.value = true
}

function closeFilters() {
  isFilterOpen.value = false
}

// Real search using BGG API - always dropdown behavior
async function handleSearch(query: string) {
  // Always fetch dropdown results, regardless of current page
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  searchLoading.value = true
  
  try {
    const { searchItems } = useBggApi()
    const response = await searchItems({
      query: query.trim(),
      type: 'boardgame'
    })
    
    // Parse XML response and transform to SearchResult format
    const transformedResults = parseBggSearchResponse(response.data || response)
    // console.log('Parsed BGG results:', transformedResults)
    
    searchResults.value = transformedResults
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

function handleSelectGame(result: SearchResult) {
  // Navigate to game detail page (or handle as needed)
  navigateTo(`/game/${result.id}`)
  searchQuery.value = ''
  searchResults.value = []
}

function handleViewAllResults() {
  // Navigate to search page with current query
  navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
}

function handleApplyFilters(newFilters: Filters) {
  filters.value = newFilters
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0 max-w-7xl mx-auto">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-40 bg-white shadow-sm">
      <!-- Top bar -->
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <Icon name="mdi:dice-multiple" class="h-8 w-8 text-indigo-600" />
          <span class="text-xl font-bold text-gray-900 hidden sm:block">BoardGame Tracker</span>
        </NuxtLink>

        <!-- Profile icon -->
        <NuxtLink to="/profile" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Icon name="mdi:account-circle" class="h-7 w-7 text-gray-600" />
        </NuxtLink>
      </div>

      <!-- Search bar -->
      <div class="px-4 pb-3">
        <div class="flex gap-2">
          <SearchBar 
            v-model="searchQuery" 
            class="flex-1"
            :results="searchResults"
            :loading="searchLoading"
            :show-results="true"
            @search="handleSearch"
            @select="handleSelectGame"
            @view-all="handleViewAllResults"
          />
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            @click="openFilters"
          >
            <Icon name="mdi:filter-variant" class="h-5 w-5" />
            <span class="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      <!-- Active Session Banner -->
      <ActiveSessionBanner />
    </header>


    <!-- Desktop/Tablet Navbar -->
    <nav class="hidden sm:block bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center gap-2 px-6">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
          :class="$route.path === item.to 
            ? 'text-indigo-600 bg-indigo-50' 
            : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'"
        >
          <Icon :name="item.icon" class="h-5 w-5" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Main content -->
    <main class="min-h-[calc(100vh-180px)]">
      <slot />
    </main>

    <!-- Bottom Mobile Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 sm:hidden">
      <div class="flex items-center justify-between py-2 sm:justify-around sm:max-w-xl mx-auto">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors"
          :class="$route.path === item.to 
            ? 'text-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon :name="item.icon" class="h-6 w-6" />
          <span class="text-xs font-medium">{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Filter Drawer -->
    <FilterDrawer 
      :is-open="isFilterOpen" 
      @close="closeFilters"
      @apply-filters="handleApplyFilters"
    />

    <!-- Global Session Modal (for resuming sessions from banner) -->
    <GlobalSessionModal />

    <!-- Global Toast Notification -->
    <GlobalToast />
  </div>
</template>
