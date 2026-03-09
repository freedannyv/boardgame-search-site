<script setup lang="ts">
import GameGrid from '../GameGrid.vue'
import GameCard from '../GameCard.vue'

interface Game {
  id: string
  name: string
  thumbnail?: string | null
}

const props = defineProps<{
  title: string
  games: Game[]
}>()

const showAll = ref(false)

// Expose showAll state to parent for potential external control
defineExpose({
  showAll
})
</script>

<template>
  <section class="mb-6">
    <div class="flex items-center justify-between px-4 mb-3">
      <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
      <button 
        @click="showAll = !showAll"
        class="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
      >
        {{ showAll ? 'Collapse' : 'See All' }}
        <Icon :name="showAll ? 'mdi:chevron-up' : 'mdi:chevron-right'" class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Expanded Grid View -->
    <div v-if="showAll" class="px-4">
      <GameGrid
        :games="games"
      />
    </div>
    
    <!-- Horizontal Scroll View -->
    <div v-else class="overflow-x-auto scrollbar-hide">
      <div class="flex gap-3 px-4 pb-2">
        <div v-for="game in games" :key="game.id" class="flex-shrink-0 aspect-square">
          <GameCard
            :game="game"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
