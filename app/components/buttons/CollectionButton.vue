<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCollectionStore } from '~/stores/useCollectionStore'

const props = defineProps<{
  gameId: number
}>()

const collectionStore = useCollectionStore()
const { isOwned } = storeToRefs(collectionStore)

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
    class="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all active:scale-95"
    :class="isOwned(props.gameId) 
      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
      : 'bg-indigo-600 text-white hover:bg-indigo-700'"
    >
    <Icon :name="isOwned(props.gameId) ? 'mdi:bookmark-check' : 'mdi:bookmark-plus-outline'" class="w-5 h-5" />
    <span class="hidden sm:inline">{{ isOwned(props.gameId) ? 'In Collection' : 'Add to Collection' }}</span>
  </button>
</template>
