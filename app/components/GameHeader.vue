<script setup lang="ts">
import { useCollectionStore } from '../stores/useCollectionStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useGameActions } from '../composables/useGameActions'

export interface GameHeaderProps {
  id: string | number
  name: string
  image?: string | null
  thumbnail?: string | null
  rating?: number | null
  minPlayers?: number | null
  maxPlayers?: number | null
  playtime?: number | null
  weight?: number | null
  year?: number | null
}

const props = defineProps<{
  game: GameHeaderProps
  expansions?: Array<{ id: string; name: string; yearPublished?: number | null }>
}>()

const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const { toggleCollection, toggleWishlist } = useGameActions()

const emit = defineEmits<{
  'addToCollection': []
  'removeFromCollection': []
  'toggleWishlist': []
}>()

const isInCollection = computed(() => {
  return collectionStore.isOwned(Number(props.game.id))
})

const isInWishlist = computed(() => {
  return wishlistStore.isWishlisted(Number(props.game.id))
})

const playerCount = computed(() => {
  const min = props.game.minPlayers
  const max = props.game.maxPlayers
  if (!min && !max) return null
  if (min === max) return `${min}`
  return `${min}-${max}`
})

const playTime = computed(() => {
  if (!props.game.playtime) return null
  const time = props.game.playtime
  if (time < 60) return `${time}m`
  const hours = Math.floor(time / 60)
  const mins = time % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
})

const weightLabel = computed(() => {
  if (!props.game.weight) return null
  const w = props.game.weight
  if (w < 2) return 'Light'
  if (w < 3) return 'Medium Light'
  if (w < 4) return 'Medium'
  if (w < 4.5) return 'Medium Heavy'
  return 'Heavy'
})

function handleCollectionClick() {
  toggleCollection(Number(props.game.id))
  if (isInCollection.value) {
    emit('removeFromCollection')
  } else {
    emit('addToCollection')
  }
}

function handleWishlistClick() {
  toggleWishlist(Number(props.game.id))
  emit('toggleWishlist')
}

const imageUrl = computed(() => props.game.image || '/wingspan.webp')
</script>

<template>
  <div>
    <!-- Game image -->
     <div class="flex gap-4">

       <div class="rounded-xl sm:rounded-2xl shadow-lg overflow-hidden bg-gray-100 w-64">
         <img
         :src="imageUrl"
         :alt="game.name"
         class=""
         />
        </div>

        <div class="flex flex-grow items-end">
          <div class="min-w-0">
            <p v-if="game.year" class="text-gray-500 mt-1">{{ game.year }}</p>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{{ game.name }}</h1>
          </div>
        </div>
      </div>

    <!-- Title and rating -->
    <div class="flex items-start gap-3">
      
      
      <!-- Rating badge -->
      <div v-if="game.rating" class="flex items-start gap-1.5 px-3 py-2 rounded-xl">
        <div class="flex items-center gap-2">
            <Icon name="mdi:star" class="w-5 h-5 text-amber-500" />
            <span class="font-bold text-lg text-amber-700">{{ game.rating.toFixed(1) }}</span>

        </div>
      </div>
    </div>

    <!-- Details row -->
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 pt-6 border-t border-gray-100">
      <!-- Players -->
      <div v-if="playerCount" class="flex items-center gap-2 text-gray-600">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <Icon name="mdi:account-group" class="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Players</p>
          <p class="font-medium text-gray-900">{{ playerCount }}</p>
        </div>
      </div>

      <!-- Playtime -->
      <div v-if="playTime" class="flex items-center gap-2 text-gray-600">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <Icon name="mdi:clock-outline" class="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Playtime</p>
          <p class="font-medium text-gray-900">{{ playTime }}</p>
        </div>
      </div>

      <!-- Weight -->
      <div v-if="game.weight" class="flex items-center gap-2 text-gray-600">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <Icon name="mdi:weight" class="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Weight</p>
          <p class="font-medium text-gray-900">{{ weightLabel }}</p>
        </div>
      </div>

      <!-- Year -->
      <div v-if="game.year" class="flex items-center gap-2 text-gray-600 sm:hidden">
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <Icon name="mdi:calendar" class="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Year</p>
          <p class="font-medium text-gray-900">{{ game.year }}</p>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <GameActions
      :game="{ id: game.id, name: game.name, thumbnail: game.thumbnail, expansions: expansions }"
      :is-owned="isInCollection"
      :is-wishlisted="isInWishlist"
      class="mt-6 pt-6 border-t border-gray-100"
      @add-to-collection="emit('addToCollection')"
      @remove-from-collection="emit('removeFromCollection')"
      @toggle-wishlist="emit('toggleWishlist')"
    />
  </div>
</template>
