<script setup lang="ts">
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
  isInCollection?: boolean
  isInWishlist?: boolean
}>()

const emit = defineEmits<{
  'addToCollection': [gameId: string]
  'removeFromCollection': [gameId: string]
  'toggleWishlist': [gameId: string]
  'logPlay': [gameId: string]
}>()

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

function handleCollectionClick() {
  if (props.isInCollection) {
    emit('removeFromCollection', props.game.id)
  } else {
    emit('addToCollection', props.game.id)
  }
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
      <button
        @click.stop="handleCollectionClick"
        class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
        :class="isInCollection 
          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
          : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'"
        :title="isInCollection ? 'Remove from collection' : 'Add to collection'"
      >
        <Icon :name="isInCollection ? 'mdi:bookmark-check' : 'mdi:bookmark-plus-outline'" class="w-5 h-5" />
      </button>

      <!-- Wishlist toggle -->
      <button
        @click.stop="emit('toggleWishlist', game.id)"
        class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
        :class="isInWishlist 
          ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
          : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100'"
        :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
      >
        <Icon :name="isInWishlist ? 'mdi:heart' : 'mdi:heart-outline'" class="w-5 h-5" />
      </button>

      <!-- Log play -->
      <button
        @click.stop="emit('logPlay', game.id)"
        class="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition-colors"
        title="Log play"
      >
        <Icon name="mdi:dice-multiple-outline" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
