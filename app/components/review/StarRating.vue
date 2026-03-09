<script setup lang="ts">
interface Props {
  modelValue: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

function updateRating(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center gap-0.5 sm:gap-1">
    <button
      v-for="star in 10"
      :key="star"
      type="button"
      @click="updateRating(star)"
      @mouseenter="hoverRating = star"
      @mouseleave="hoverRating = 0"
      class="text-xl sm:text-2xl transition-colors hover:transform hover:scale-110"
      :class="star <= (hoverRating || modelValue) ? 'text-yellow-400' : 'text-gray-300'"
    >
      <Icon name="mdi:star" />
    </button>
    <span class="ml-2 text-sm text-gray-600 font-medium">{{ modelValue || '-' }}/10</span>
  </div>
</template>
