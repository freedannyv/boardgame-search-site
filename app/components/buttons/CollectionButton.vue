<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserGamesStore } from '~/stores/useUserGamesStore'

const props = defineProps<{
  gameId: number
}>()

const emit = defineEmits<{
  openCollectionModal: [gameId: number]
}>()

const userGamesStore = useUserGamesStore()
const { isLoading, isLoaded } = storeToRefs(userGamesStore)

const isInCollection = ref(false)

// Watch for store to be loaded and game ID changes
watch([isLoaded, () => props.gameId], () => {
  if (isLoaded.value) {
    const result = userGamesStore.isGameInCollection(props.gameId)
    console.log('🎯 CollectionButton check:', { 
      gameId: props.gameId, 
      gameIdString: props.gameId.toString(),
      isInCollection: result,
      storeCollectionCount: userGamesStore.collection.length,
      storeCollectionGameIds: Array.from(userGamesStore.collectionGameIds),
      checkingGameId: props.gameId,
      checkingGameIdString: props.gameId.toString(),
      hasGameIdInStore: userGamesStore.collectionGameIds.has(props.gameId.toString()),
      isLoaded: isLoaded.value
    })
    isInCollection.value = result
  } else {
    isInCollection.value = false
  }
}, { immediate: true })

async function toggleCollection() {
  if (isInCollection.value) {
    try {
      await userGamesStore.removeGameFromCollection(props.gameId)
    } catch (error) {
      console.error('Failed to remove from collection:', error)
    }
  } else {
    // Open collection modal instead of just adding to store
    emit('openCollectionModal', props.gameId)
  }
}
</script>

<template>
  <button
    type="button"
    @click="toggleCollection"
    class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
    :class="!isLoaded || isLoading 
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
      : isInCollection 
        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'"
    :disabled="!isLoaded || isLoading"
  >
    <Icon 
      :name="!isLoaded || isLoading 
        ? 'mdi:loading' 
        : isInCollection 
          ? 'mdi:bookmark-check' 
          : 'mdi:bookmark-plus-outline'" 
      :class="!isLoaded || isLoading ? 'animate-spin' : ''"
      class="w-5 h-5" 
    />
  </button>
</template>
