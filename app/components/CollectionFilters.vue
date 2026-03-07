<script setup lang="ts">
export interface CollectionFiltersType {
  playerCount: number | null
  playTime: string | null
  complexity: string | null
  category: string | null
  mechanic: string | null
}

const props = defineProps<{
  filters: CollectionFiltersType
}>()

const emit = defineEmits<{
  'filtersChanged': [filters: CollectionFiltersType]
}>()

// Local copy of filters
const localFilters = ref<CollectionFiltersType>({ ...props.filters })

// Sync with parent when prop changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Filter options
const playerCountOptions = [1, 2, 3, 4, 5, 6]
const playTimeOptions = ['< 30 min', '30-60 min', '1-2 hours', '2+ hours']
const complexityOptions = ['Light', 'Medium Light', 'Medium', 'Medium Heavy', 'Heavy']

// Show filter panel
const showFilters = ref(false)

// Active filter count
const activeFilterCount = computed(() => {
  return Object.values(localFilters.value).filter(v => v !== null).length
})

function updateFilter<K extends keyof CollectionFiltersType>(key: K, value: CollectionFiltersType[K]) {
  if (localFilters.value[key] === value) {
    localFilters.value[key] = null as CollectionFiltersType[K]
  } else {
    localFilters.value[key] = value
  }
  emit('filtersChanged', { ...localFilters.value })
}

function resetFilters() {
  localFilters.value = {
    playerCount: null,
    playTime: null,
    complexity: null,
    category: null,
    mechanic: null
  }
  emit('filtersChanged', { ...localFilters.value })
}
</script>

<template>
  <div>
    <!-- Filter toggle button -->
    <button
      type="button"
      @click="showFilters = !showFilters"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
      :class="activeFilterCount > 0 
        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'"
    >
      <Icon name="mdi:filter-variant" class="w-5 h-5" />
      <span class="text-sm font-medium">Filters</span>
      <span 
        v-if="activeFilterCount > 0"
        class="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-xs rounded-full"
      >
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- Expandable filters panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="showFilters" class="overflow-hidden">
        <div class="pt-4 space-y-4">
          <!-- Player count -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Players</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="count in playerCountOptions"
                :key="count"
                type="button"
                @click="updateFilter('playerCount', count)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="localFilters.playerCount === count 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ count }}{{ count === 6 ? '+' : '' }}
              </button>
            </div>
          </div>

          <!-- Play time -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Playtime</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="time in playTimeOptions"
                :key="time"
                type="button"
                @click="updateFilter('playTime', time)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="localFilters.playTime === time 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ time }}
              </button>
            </div>
          </div>

          <!-- Complexity -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Complexity</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="level in complexityOptions"
                :key="level"
                type="button"
                @click="updateFilter('complexity', level)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="localFilters.complexity === level 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <!-- Reset button -->
          <button
            v-if="activeFilterCount > 0"
            type="button"
            @click="resetFilters"
            class="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            Reset all filters
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
