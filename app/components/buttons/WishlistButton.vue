<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWishlistStore } from '~/stores/useWishlistStore'
import { useCollectionStore } from '~/stores/useCollectionStore'

const props = defineProps<{
  gameId: number
}>()

const wishlistStore = useWishlistStore()
const { isWishlisted } = storeToRefs(wishlistStore)

const collectionStore = useCollectionStore()
const { isOwned } = storeToRefs(collectionStore)


function toggleWishlist() {
  if (isWishlisted.value(props.gameId)) {
    wishlistStore.removeGame(props.gameId)
  } else {
    wishlistStore.addGame(props.gameId)
  }
}
</script>

<template>
  <button
    v-if="!isOwned(props.gameId)"
    type="button"
    @click="toggleWishlist"
    :class="[
      'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
      isWishlisted(props.gameId) 
        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    ]"
    :title="isWishlisted(props.gameId) ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <Icon 
      :name="isWishlisted(props.gameId) ? 'mdi:heart' : 'mdi:heart-outline'" 
      class="w-5 h-5"
    />
  </button>
</template>
