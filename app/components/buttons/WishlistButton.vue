<script setup lang="ts">
import { useWishlistStore } from '../stores/useWishlistStore'

const props = defineProps<{
  gameId: number
}>()

const wishlistStore = useWishlistStore()

const isWishlisted = computed(() => wishlistStore.isWishlisted(props.gameId))

function toggleWishlist() {
  if (wishlistStore.isWishlisted(props.gameId)) {
    wishlistStore.removeGame(props.gameId)
  } else {
    wishlistStore.addGame(props.gameId)
  }
}
</script>

<template>
  <button
    type="button"
    @click="toggleWishlist"
    :class="[
      'p-2 rounded-lg transition-colors',
      isWishlisted 
        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    ]"
    :title="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <Icon 
      :name="isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'" 
      class="w-5 h-5"
    />
  </button>
</template>
