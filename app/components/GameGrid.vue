<script setup lang="ts">
import type { Game } from './GameCard.vue'

defineProps<{
  games: Game[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <GameCard
      v-for="game in games"
      :key="game.id"
      :game="game"
    />
  </div>
</template>
