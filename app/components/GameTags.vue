<script setup lang="ts">
defineProps<{
  categories?: { name: string }[]
  mechanics?: { name: string }[]
}>()
</script>

<template>
  <div class="space-y-8">
    <!-- Categories -->
    <section v-if="categories?.length">
      <h2 class="text-lg font-bold text-gray-900 mb-3">Categories</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink 
          v-for="category in categories" 
          :key="category.name"
          :to="`/search?category=${encodeURIComponent(category.name)}`"
          class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          {{ category.name }}
        </NuxtLink>
      </div>
    </section>

    <!-- Mechanics -->
    <section v-if="mechanics?.length">
      <h2 class="text-lg font-bold text-gray-900 mb-3">Mechanics</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink 
          v-for="mechanic in mechanics" 
          :key="mechanic.name"
          :to="`/search?mechanic=${encodeURIComponent(mechanic.name)}`"
          class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          {{ mechanic.name }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
