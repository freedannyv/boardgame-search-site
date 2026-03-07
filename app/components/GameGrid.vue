<script setup lang="ts">
import type { Game } from './GameCard.vue'

defineProps<{
  games: Game[]
  collectionIds?: string[]
  wishlistIds?: string[]
}>()

const emit = defineEmits<{
  'addToCollection': [gameId: string]
  'removeFromCollection': [gameId: string]
  'toggleWishlist': [gameId: string]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    <GameCard
      v-for="game in games"
      :key="game.id"
      :game="game"
      :is-in-collection="collectionIds?.includes(game.id)"
      :is-in-wishlist="wishlistIds?.includes(game.id)"
      @add-to-collection="emit('addToCollection', $event)"
      @remove-from-collection="emit('removeFromCollection', $event)"
      @toggle-wishlist="emit('toggleWishlist', $event)"
    />
  </div>
</template>
