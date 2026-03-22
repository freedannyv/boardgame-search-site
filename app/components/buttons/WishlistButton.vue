<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCollectionStore } from '~/stores/useCollectionStore'

const props = defineProps<{
  gameId: number
}>()

const collectionStore = useCollectionStore()
const { isLoading, isLoaded } = storeToRefs(collectionStore)

const isInWishlist = computed(() => {
  return collectionStore.isGameInWishlist(props.gameId)
})

const isInCollection = computed(() => {
  return collectionStore.isGameInCollection(props.gameId)
})

function toggleWishlist() {
  if (isInWishlist.value) {
    collectionStore.removeGameFromWishlist(props.gameId.toString())
  } else {
    collectionStore.addGameToWishlist({
      gameId: props.gameId.toString(),
      thumbnail: null,
      image: null
    })
  }
}
</script>
<template>
  <button
    v-if="!isInCollection"
    type="button"
    @click="toggleWishlist"
    :class="[
      'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
      isInWishlist 
        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    ]"
    :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <Icon 
      :name="isInWishlist ? 'mdi:heart' : 'mdi:heart-outline'" 
      class="w-5 h-5"
    />
  </button>
</template>
