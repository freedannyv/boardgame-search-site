<script setup lang="ts">
import { useCollectionStore } from '~/stores/useCollectionStore'

const collectionStore = useCollectionStore()

// Collection count from store
const collectionCount = computed(() => collectionStore.collection.length)
</script>

<template>
  <section class="px-4 pt-4 pb-6">
    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
      <div v-if="collectionCount > 0" class="flex items-center justify-between">
        <div>
          <p class="text-indigo-100 text-sm font-medium">Your Collection</p>
          <p class="text-3xl font-bold mt-1">{{ collectionCount }} <span class="text-lg font-normal text-indigo-100">games</span></p>
        </div>
        <NuxtLink 
          to="/collection" 
          class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View All
        </NuxtLink>
      </div>
      <div v-else class="text-center py-2">
        <Icon name="mdi:bookshelf" class="w-10 h-10 mx-auto mb-2 text-indigo-200" />
        <p class="text-indigo-100 text-sm">Start your collection by searching and tapping</p>
        <p class="text-2xl mt-1">
          <Icon name="mdi:plus-circle" class="w-6 h-6 inline" />
        </p>
      </div>
    </div>
  </section>
</template>
