<script setup lang="ts">
export interface SearchResult {
  id: string
  name: string
  thumbnail?: string | null
  average?: number | null
  yearPublished?: number | null
}

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  debounceMs?: number
  results?: SearchResult[]
  loading?: boolean
  showResults?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Search board games...',
  debounceMs: 300,
  results: () => [],
  loading: false,
  showResults: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'select': [result: SearchResult]
  'viewAll': []
}>()

const query = ref(props.modelValue)
const isFocused = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Show dropdown when focused, has query, and showResults is true
const showDropdown = computed(() => {
  return isFocused.value && query.value.length > 0 && props.showResults
})

// Sync with v-model
watch(() => props.modelValue, (newValue) => {
  query.value = newValue
})

function updateQuery(value: string) {
  query.value = value
  emit('update:modelValue', value)
  
  // Debounced search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, props.debounceMs)
}

function handleEnter() {
  // Clear debounce and emit immediately
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  emit('viewAll')
}

function handleSelect(result: SearchResult) {
  emit('select', result)
  isFocused.value = false
}

function handleViewAll() {
  emit('viewAll')
  isFocused.value = false
}

function clearSearch() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}

function handleFocus() {
  isFocused.value = true
  if (query.value) {
    emit('search', query.value)
  }
}

function handleBlur() {
  // Delay to allow click on dropdown items
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="relative w-full">
    <!-- Search icon -->
    <Icon 
      name="mdi:magnify" 
      class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" 
    />
    
    <!-- Input field -->
    <input
      :value="query"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-3 bg-gray-100 border-0 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
      @input="updateQuery(($event.target as HTMLInputElement).value)"
      @keyup.enter="handleEnter"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <!-- Clear button -->
    <button
      v-if="query"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
      @click="clearSearch"
    >
      <Icon name="mdi:close-circle" class="h-5 w-5 text-gray-400" />
    </button>

    <!-- Search Results Dropdown -->
    <div 
      v-if="showDropdown"
      class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-80 overflow-y-auto"
    >
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-6">
        <Icon name="mdi:loading" class="w-6 h-6 animate-spin text-indigo-600" />
      </div>

      <!-- Results list -->
      <template v-else-if="results.length > 0">
        <button
          v-for="result in results.slice(0, 6)"
          :key="result.id"
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
          @mousedown.prevent="handleSelect(result)"
        >
          <!-- Thumbnail -->
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              v-if="result.thumbnail"
              :src="result.thumbnail"
              :alt="result.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="mdi:dice-multiple" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm truncate">{{ result.name }}</p>
            <p class="text-xs text-gray-500">
              <span v-if="result.average" class="inline-flex items-center gap-1">
                <Icon name="mdi:star" class="w-3 h-3 text-amber-500" />
                {{ result.average.toFixed(1) }}
              </span>
              <span v-if="result.yearPublished" class="ml-2">{{ result.yearPublished }}</span>
            </p>
          </div>

          <!-- Add icon -->
          <Icon name="mdi:chevron-right" class="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>

        <!-- View all button -->
        <button
          class="w-full px-4 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          @mousedown.prevent="handleViewAll"
        >
          View all results
        </button>
      </template>

      <!-- No results -->
      <div v-else class="px-4 py-6 text-center text-gray-500 text-sm">
        No games found for "{{ query }}"
      </div>
    </div>
  </div>
</template>
