<script setup lang="ts">
import CollectionButton from './buttons/CollectionButton.vue'
import WishlistButton from './buttons/WishlistButton.vue'
import LogPlayButton from './LogPlayButton.vue'

export interface Game {
  id: string
  name: string
  image?: string | null
  thumbnail?: string | null
  average?: number | null
  minPlayers?: number | null
  maxPlayers?: number | null
  playingTime?: number | null
  yearPublished?: number | null
}

const props = defineProps<{
  game: Game
}>()

const hasImage = computed(() => {
  return !!(props.game.image || props.game.thumbnail)
})

const imageUrl = computed(() => {
  return props.game.image || props.game.thumbnail || ''
})

const displayRating = computed(() => {
  if (!props.game.average) return 'N/A'
  return props.game.average.toFixed(1)
})

const playerCount = computed(() => {
  const min = props.game.minPlayers
  const max = props.game.maxPlayers
  
  if (!min && !max) return null
  if (min === max) return `${min}`
  if (!max) return `${min}+`
  return `${min}-${max}`
})

const playtime = computed(() => {
  if (!props.game.playingTime) return null
  const time = props.game.playingTime
  if (time < 60) return `${time} min`
  const hours = Math.floor(time / 60)
  const mins = time % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
})
</script>

<template>
  <div class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 w-48">
    <!-- Image container -->
    <NuxtLink :to="`/game/${game.id}`" class="block relative bg-gray-100 overflow-hidden cursor-pointer">
      <!-- Game image -->
       <div class="w-52 aspect-square sm:w-full">
         <img
           :src=" hasImage ? imageUrl : '/wingspan.webp'"
           :alt="game.name"
           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
           loading="lazy"
         />

       </div>
      
      <!-- Gradient overlay for icons -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200" />
      
      <!-- Quick action icons - always visible on mobile, hover on desktop -->
      <div class="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-200">
        <!-- Collection button -->

      </div>

      <!-- Rating badge -->
      <div 
        v-if="game.average"
        class="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-semibold"
      >
        <Icon name="mdi:star" class="h-4 w-4 text-yellow-400" />
        {{ displayRating }}
      </div>
    </NuxtLink>

    <!-- Card content -->
    <div class="p-3">
      <!-- Title -->
      <NuxtLink :to="`/game/${game.id}`" class="block">
        <h3 class="font-semibold text-gray-900 line-clamp-2 leading-tight  hover:text-indigo-600 transition-colors">
          {{ game.name }}
        </h3>
        <span class="text-sm text-gray-500">{{ game.yearPublished }}</span>
      </NuxtLink>

      <!-- Meta info -->
      <div class="flex items-center gap-3 text-sm text-gray-500">
        <!-- Players -->
        <div v-if="playerCount" class="flex items-center gap-1">
          <Icon name="mdi:account-group" class="h-4 w-4" />
          <span>{{ playerCount }}</span>
        </div>

        <!-- Playtime -->
        <div v-if="playtime" class="flex items-center gap-1">
          <Icon name="mdi:clock-outline" class="h-4 w-4" />
          <span>{{ playtime }}</span>
        </div>
      </div>
      <div class="flex gap-2 items-center mt-2">
        <CollectionButton :gameId="Number(game.id)" />
  
        <!-- Wishlist button -->
        <WishlistButton :gameId="Number(game.id)" />
        
        <!-- Log play -->
        <LogPlayButton :game="game" variant="card" />

      </div>
    </div>
  </div>
</template>
