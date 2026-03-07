<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'

defineProps<{
  games: Game[]
}>()

const emit = defineEmits<{
  'addToCollection': [gameId: string]
  'removeFromCollection': [gameId: string]
  'toggleWishlist': [gameId: string]
}>()
</script>

<template>
  <section v-if="games?.length">
    <h2 class="text-lg font-bold text-gray-900 mb-4">You may also like</h2>
    <div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div class="flex gap-3 pb-2">
        <div v-for="game in games" :key="game.id" class="flex-shrink-0 w-36">
          <GameCard
            :game="game"
            :is-in-collection="false"
            :is-in-wishlist="false"
            @add-to-collection="emit('addToCollection', $event)"
            @remove-from-collection="emit('removeFromCollection', $event)"
            @toggle-wishlist="emit('toggleWishlist', $event)"
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
