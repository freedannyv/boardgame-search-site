<script setup lang="ts">
import type { Filters } from '~/components/FilterDrawer.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
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
  }
})

const navigation = [
  { name: 'Home', icon: 'mdi:home', to: '/' },
  { name: 'Search', icon: 'mdi:magnify', to: '/search' },
  { name: 'Collection', icon: 'mdi:bookshelf', to: '/collection' },
  { name: 'Wishlist', icon: 'mdi:heart', to: '/wishlist' },
  { name: 'Profile', icon: 'mdi:account', to: '/profile' }
]

function openFilters() {
  isFilterOpen.value = true
}

function closeFilters() {
  isFilterOpen.value = false
}

function handleSearch(query: string) {
  // If already on search page, just update URL query param (no full navigation)
  if (route.path === '/search') {
    router.replace({ 
      path: '/search', 
      query: query ? { q: query } : {} 
    })
  } else {
    // Navigate to search page
    navigateTo(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }
}

function handleApplyFilters(newFilters: Filters) {
  filters.value = newFilters
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
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
            @search="handleSearch" 
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
    </header>

    <!-- Main content -->
    <main class="min-h-[calc(100vh-180px)]">
      <slot />
    </main>

    <!-- Bottom Mobile Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div class="flex items-center justify-around py-2">
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
  </div>
</template>
