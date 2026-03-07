<script setup lang="ts">
const props = defineProps<{
  sortBy: string
}>()

const emit = defineEmits<{
  'sortChanged': [sortBy: string]
}>()

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'playtime', label: 'Playtime' },
  { value: 'weight', label: 'Weight' },
  { value: 'year', label: 'Year' }
]

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('sortChanged', target.value)
}
</script>

<template>
  <select
    :value="sortBy"
    @change="handleChange"
    class="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
