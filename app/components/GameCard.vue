<script setup lang="ts">
import { useCollectionStore } from '../stores/useCollectionStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useGameActions } from '../composables/useGameActions'

export interface Game {
  id: string
  name: string
  image?: string | null
  thumbnail?: string | null
  average?: number | null
  minPlayers?: number | null
  maxPlayers?: number | null
  playingTime?: number | null
}

const props = defineProps<{
  game: Game
}>()

const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const { toggleCollection, toggleWishlist } = useGameActions()

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

const isInCollection = computed(() => {
  return collectionStore.isOwned(Number(props.game.id))
})

const isInWishlist = computed(() => {
  return wishlistStore.isWishlisted(Number(props.game.id))
})

function handleAddToCollection() {
  toggleCollection(Number(props.game.id))
}

function handleRemoveFromCollection() {
  toggleCollection(Number(props.game.id))
}

function handleToggleWishlist() {
  toggleWishlist(Number(props.game.id))
}
</script>

<template>
  <div class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <!-- Image container -->
    <NuxtLink :to="`/game/${game.id}`" class="block relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
      <!-- Game image -->
      <img
        v-if="hasImage"
        :src="imageUrl"
        :alt="game.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      
      <!-- Placeholder when no image -->
      <div 
        v-else 
        class="w-full h-full flex items-center justify-center bg-gray-200"
      >
        <Icon name="mdi:dice-multiple" class="h-16 w-16 text-gray-400" />
      </div>
      
      <!-- Gradient overlay for icons -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200" />
      
      <!-- Quick action icons - always visible on mobile, hover on desktop -->
      <div class="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-200">
        <!-- Wishlist toggle -->
        <button
          v-if="!isInCollection"
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all"
          :class="isInWishlist ? 'text-red-500' : 'text-gray-600'"
          :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
          @click.stop.prevent="handleToggleWishlist"
        >
          <Icon :name="isInWishlist ? 'mdi:heart' : 'mdi:heart-outline'" class="h-6 w-6" />
        </button>

        <!-- Add to collection -->
        <button
          v-if="!isInCollection"
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-gray-600 hover:bg-white hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all"
          title="Add to collection"
          @click.stop.prevent="handleAddToCollection"
        >
          <Icon name="mdi:plus" class="h-6 w-6" />
        </button>

        <!-- Remove from collection -->
        <button
          v-else
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-indigo-600 hover:bg-white hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
          title="Remove from collection"
          @click.stop.prevent="handleRemoveFromCollection"
        >
          <Icon name="mdi:minus" class="h-6 w-6" />
        </button>

        <!-- Log play -->
        <LogPlayButton :game="game" variant="card" />
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
        <h3 class="font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 hover:text-indigo-600 transition-colors">
          {{ game.name }}
        </h3>
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
    </div>
  </div>
</template>
