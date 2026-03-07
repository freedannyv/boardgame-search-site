<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  debounceMs?: number
}>(), {
  modelValue: '',
  placeholder: 'Search board games...',
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const query = ref(props.modelValue)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

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
  emit('search', query.value)
}

function clearSearch() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
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
  </div>
</template>
