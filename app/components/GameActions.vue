<script setup lang="ts">
import CollectionButton from './buttons/CollectionButton.vue'
import WishlistButton from './buttons/WishlistButton.vue'
import CollectionFormModal from './CollectionFormModal.vue'

interface Game {
  id: string | number
  name: string
  thumbnail?: string | null
  expansions?: Array<{ id: string; name: string; yearPublished?: number | null }>
}

const props = defineProps<{
  game: Game
}>()

// Collection modal state
const showCollectionModal = ref(false)

function handleOpenCollectionModal(gameId: number) {
  showCollectionModal.value = true
}

function handleCloseCollectionModal() {
  showCollectionModal.value = false
}
</script>

<template>
  <div>
    <div class="flex gap-2">
      <!-- Collection button -->
      <CollectionButton 
        :gameId="Number(game.id)" 
        @openCollectionModal="handleOpenCollectionModal"
      />

      <!-- Wishlist button -->
      <WishlistButton 
        :gameId="Number(game.id)" 
      />

      <!-- Log play button -->
      <LogPlayButton :game="game" :expansions="game.expansions" variant="action" />
    </div>

    <!-- Collection Modal -->
    <CollectionFormModal
      :show="showCollectionModal"
      :game="{ id: game.id, name: game.name, thumbnail: game.thumbnail }"
      @close="handleCloseCollectionModal"
    />
  </div>
</template>
