<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCollectionStore } from '~/stores/useCollectionStore'

const props = defineProps<{
  gameId: number
}>()

const collectionStore = useCollectionStore()
const { isOwned } = storeToRefs(collectionStore)

const wishlistStore = useWishlistStore()

function toggleCollection() {
  if (isOwned.value(props.gameId)) {
    collectionStore.removeGame(props.gameId)
  } else {
    collectionStore.addGame(props.gameId)
  }
}
</script>

<template>
  <button
    type="button"
    @click="toggleCollection"
    class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
    :class="isOwned(props.gameId) 
      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'"
    >
    <Icon :name="isOwned(props.gameId) ? 'mdi:bookmark-check' : 'mdi:bookmark-plus-outline'" class="w-5 h-5" />
  </button>
</template>
