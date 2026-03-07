<script setup lang="ts">
interface Game {
  id: string | number
  name: string
  thumbnail?: string | null
}

const props = defineProps<{
  game: Game
  isOwned?: boolean
  isWishlisted?: boolean
}>()

const emit = defineEmits<{
  'addToCollection': []
  'removeFromCollection': []
  'toggleWishlist': []
}>()

function handleCollectionClick() {
  if (props.isOwned) {
    emit('removeFromCollection')
  } else {
    emit('addToCollection')
  }
}
</script>

<template>
  <div class="flex gap-2">
    <!-- Collection button -->
    <button
      type="button"
      @click="handleCollectionClick"
      class="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all active:scale-95"
      :class="isOwned 
        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
        : 'bg-indigo-600 text-white hover:bg-indigo-700'"
    >
      <Icon :name="isOwned ? 'mdi:bookmark-check' : 'mdi:bookmark-plus-outline'" class="w-5 h-5" />
      <span class="hidden sm:inline">{{ isOwned ? 'In Collection' : 'Add to Collection' }}</span>
    </button>

    <!-- Wishlist button -->
    <button
      v-if="!isOwned"
      type="button"
      @click="emit('toggleWishlist')"
      class="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium border transition-all active:scale-95"
      :class="isWishlisted 
        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-rose-500 hover:border-rose-200'"
    >
      <Icon :name="isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'" class="w-5 h-5" />
      <span class="hidden sm:inline">{{ isWishlisted ? 'Wishlisted' : 'Wishlist' }}</span>
    </button>

    <!-- Log play button -->
    <LogPlayButton :game="game" variant="action" />
  </div>
</template>
