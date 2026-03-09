<script setup lang="ts">
import CollectionButton from './buttons/CollectionButton.vue'
import WishlistButton from './buttons/WishlistButton.vue'

interface Game {
  id: string | number
  name: string
  thumbnail?: string | null
}

const props = defineProps<{
  game: Game
}>()
</script>

<template>
  <div class="flex gap-2">
    <!-- Collection button -->
    <CollectionButton :gameId="Number(game.id)" />

    <!-- Wishlist button -->
    <WishlistButton 
      :gameId="Number(game.id)" 
    />

    <!-- Log play button -->
    <LogPlayButton :game="game" variant="action" />
  </div>
</template>
