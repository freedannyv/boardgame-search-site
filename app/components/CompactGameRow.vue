<script setup lang="ts">
import { useCollectionStore } from '../stores/useCollectionStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useGameActions } from '../composables/useGameActions'
import CollectionButton from './buttons/CollectionButton.vue'
import WishlistButton from './buttons/WishlistButton.vue'

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

const imageUrl = computed(() => props.game.thumbnail || props.game.image)

const playerCount = computed(() => {
  const min = props.game.minPlayers
  const max = props.game.maxPlayers
  if (!min && !max) return null
  if (min === max) return `${min}`
  return `${min}-${max}`
})

const playTime = computed(() => {
  if (!props.game.playingTime) return null
  const time = props.game.playingTime
  if (time < 60) return `${time}m`
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

function handleCollectionClick() {
  toggleCollection(Number(props.game.id))
}

function handleWishlistClick() {
  toggleWishlist(Number(props.game.id), {
    thumbnail: props.game.thumbnail,
    image: props.game.image
  })
}
</script>

<template>
  <div class="flex items-center gap-3 p-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <!-- Thumbnail -->
    <div class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="game.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="mdi:dice-multiple" class="w-6 h-6 text-gray-400" />
      </div>
    </div>

    <!-- Game Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-gray-900 text-sm truncate">{{ game.name }}</h3>
      <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
        <!-- Rating -->
        <span v-if="game.average" class="flex items-center gap-1">
          <Icon name="mdi:star" class="w-3.5 h-3.5 text-amber-500" />
          {{ game.average.toFixed(1) }}
        </span>
        <!-- Players -->
        <span v-if="playerCount" class="flex items-center gap-1">
          <Icon name="mdi:account-group" class="w-3.5 h-3.5" />
          {{ playerCount }}
        </span>
        <!-- Play time -->
        <span v-if="playTime" class="flex items-center gap-1">
          <Icon name="mdi:clock-outline" class="w-3.5 h-3.5" />
          {{ playTime }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <!-- Collection toggle -->
      <CollectionButton :gameId="Number(game.id)" />
      <WishlistButton :gameId="Number(game.id)" />

      <!-- Log play -->
      <LogPlayButton :game="game" variant="compact" />
    </div>
  </div>
</template>
