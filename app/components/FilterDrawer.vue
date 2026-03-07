<script setup lang="ts">
export interface Filters {
  playerCount: number | null
  playTime: string | null
  minRating: number
}

const props = withDefaults(defineProps<{
  isOpen: boolean
}>(), {
  isOpen: false
})

const emit = defineEmits<{
  'close': []
  'applyFilters': [filters: Filters]
}>()

// Filter state
const selectedPlayerCount = ref<number | null>(null)
const selectedPlayTime = ref<string | null>(null)
const minRating = ref(0)

const playerCountOptions = [1, 2, 3, 4, 5, 6] as const
const playTimeOptions = ['< 30 min', '30-60 min', '1-2 hours', '2+ hours'] as const

function togglePlayerCount(count: number) {
  selectedPlayerCount.value = selectedPlayerCount.value === count ? null : count
}

function togglePlayTime(time: string) {
  selectedPlayTime.value = selectedPlayTime.value === time ? null : time
}

function resetFilters() {
  selectedPlayerCount.value = null
  selectedPlayTime.value = null
  minRating.value = 0
}

function applyFilters() {
  emit('applyFilters', {
    playerCount: selectedPlayerCount.value,
    playTime: selectedPlayTime.value,
    minRating: minRating.value
  })
  emit('close')
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/50"
        @click="close"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden"
      >
        <!-- Drawer handle -->
        <div class="flex justify-center py-3">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Drawer header -->
        <div class="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              @click="resetFilters"
            >
              Reset
            </button>
            <button
              type="button"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              @click="close"
            >
              <Icon name="mdi:close" class="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <!-- Filter content -->
        <div class="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          <!-- Player Count -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Player Count</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="n in playerCountOptions"
                :key="n"
                type="button"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                :class="selectedPlayerCount === n 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'"
                @click="togglePlayerCount(n)"
              >
                {{ n === 6 ? '6+' : n }}
              </button>
            </div>
          </div>

          <!-- Play Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Play Time</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="time in playTimeOptions"
                :key="time"
                type="button"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                :class="selectedPlayTime === time 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'"
                @click="togglePlayTime(time)"
              >
                {{ time }}
              </button>
            </div>
          </div>

          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating: {{ minRating === 0 ? 'Any' : minRating.toFixed(1) }}
            </label>
            <input
              v-model.number="minRating"
              type="range"
              min="0"
              max="10"
              step="0.5"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Any</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <!-- Apply button -->
        <div class="p-4 border-t border-gray-200">
          <button
            type="button"
            class="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            @click="applyFilters"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
