<script setup lang="ts">
import { ref, computed } from 'vue'

export interface CollectionFiltersType {
  playerCount: number | null
  playTime: string | null
  complexity: string | null
  category: string | null
  mechanic: string | null
}

const emit = defineEmits<{
  'filtersChanged': [filters: CollectionFiltersType]
  'sortChanged': [sortBy: string]
  'viewModeChanged': [viewMode: 'grid' | 'list']
}>()

// Internal state
const filters = ref<CollectionFiltersType>({
  playerCount: null,
  playTime: null,
  complexity: null,
  category: null,
  mechanic: null
})

const sortBy = ref<string>('name')
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)

// Filter options
const playerCountOptions = [1, 2, 3, 4, 5, 6]
const playTimeOptions = ['< 30 min', '30-60 min', '1-2 hours', '2+ hours']
const complexityOptions = ['Light', 'Medium Light', 'Medium', 'Medium Heavy', 'Heavy']
const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'playtime', label: 'Playtime' },
  { value: 'weight', label: 'Weight' },
  { value: 'year', label: 'Year' }
]

// Active filter count
const activeFilterCount = computed(() => {
  return Object.values(filters.value).filter(v => v !== null).length
})

// Filter functions
function updateFilter<K extends keyof CollectionFiltersType>(key: K, value: CollectionFiltersType[K]) {
  if (filters.value[key] === value) {
    filters.value[key] = null as CollectionFiltersType[K]
  } else {
    filters.value[key] = value
  }
  emit('filtersChanged', { ...filters.value })
}

function handlePlayerCountChange(event: Event) {
  const target = event.target as HTMLSelectElement
  updateFilter('playerCount', target.value ? Number(target.value) : null)
}

function handlePlayTimeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  updateFilter('playTime', target.value || null)
}

function handleComplexityChange(event: Event) {
  const target = event.target as HTMLSelectElement
  updateFilter('complexity', target.value || null)
}

function resetFilters() {
  filters.value = {
    playerCount: null,
    playTime: null,
    complexity: null,
    category: null,
    mechanic: null
  }
  emit('filtersChanged', { ...filters.value })
}

// Sort function
function handleSortChange(event: Event) {
  const target = event.target as HTMLSelectElement
  sortBy.value = target.value
  emit('sortChanged', target.value)
}

// View mode functions
function setViewMode(mode: 'grid' | 'list') {
  viewMode.value = mode
  emit('viewModeChanged', mode)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <!-- Filters -->
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-gray-700">Filters:</span>
      
      <!-- Player Count -->
      <select
        :value="filters.playerCount || ''"
        @change="handlePlayerCountChange"
        class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Players</option>
        <option v-for="count in playerCountOptions" :key="count" :value="count">
          {{ count }}
        </option>
      </select>

      <!-- Play Time -->
      <select
        :value="filters.playTime || ''"
        @change="handlePlayTimeChange"
        class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Play Time</option>
        <option v-for="time in playTimeOptions" :key="time" :value="time">
          {{ time }}
        </option>
      </select>

      <!-- Complexity -->
      <select
        :value="filters.complexity || ''"
        @change="handleComplexityChange"
        class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Complexity</option>
        <option v-for="complexity in complexityOptions" :key="complexity" :value="complexity">
          {{ complexity }}
        </option>
      </select>

      <!-- Active filter count & reset -->
      <span 
        v-if="activeFilterCount > 0" 
        class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
      >
        {{ activeFilterCount }} active
      </span>
      
      <button
        @click="resetFilters"
        class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Reset
      </button>
    </div>

    <!-- Sort dropdown -->
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-700">Sort:</label>
      <select
        :value="sortBy"
        @change="handleSortChange"
        class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- View toggle -->
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-700">View:</label>
      <div class="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          @click="setViewMode('grid')"
          class="p-1.5 rounded-md transition-colors"
          :class="viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="mdi:view-grid" class="w-4 h-4" />
        </button>
        <button
          @click="setViewMode('list')"
          class="p-1.5 rounded-md transition-colors"
          :class="viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="mdi:view-list" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
