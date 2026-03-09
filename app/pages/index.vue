<script setup lang="ts">

import type { Game } from '~/components/GameCard.vue'
import { useToastStore } from '~/stores/toast'
import { useCollectionStore } from '~/stores/useCollectionStore'
import { useWishlistStore } from '~/stores/useWishlistStore'
import { useGameActions } from '~/composables/useGameActions'

// Stores
const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const { toggleCollection, toggleWishlist } = useGameActions()
const toast = useToastStore()

// Collection count from store
const collectionCount = computed(() => collectionStore.gameIds.size)


// Get recommended games from store
import { usePlaceholderGamesStore } from '~/stores/games'
const placeholderGamesStore = usePlaceholderGamesStore()

const recommendedGames = computed(() => placeholderGamesStore.getPlaceholderGames)
const popularGames = computed(() => placeholderGamesStore.getPlaceholderGames.reverse())

const categories = [
  { name: 'Strategy', icon: 'mdi:chess-knight', slug: 'strategy' },
  { name: 'Party', icon: 'mdi:party-popper', slug: 'party' },
  { name: 'Family', icon: 'mdi:account-group', slug: 'family' },
  { name: 'Cooperative', icon: 'mdi:handshake', slug: 'cooperative' },
  { name: 'Deck Building', icon: 'mdi:cards', slug: 'deck-building' },
  { name: 'Abstract', icon: 'mdi:shape', slug: 'abstract' },
]

// Expand states for sections
const showAllRecommended = ref(false)
const showAllPopular = ref(false)

// Helper functions for collection/wishlist state
function isInCollection(gameId: string) {
  return collectionStore.isOwned(Number(gameId))
}

function isInWishlist(gameId: string) {
  return wishlistStore.isWishlisted(Number(gameId))
}

function handleAddToCollection(gameId: string) {
  toggleCollection(Number(gameId))
  // Find the game name
  const game = [...recommendedGames.value, ...popularGames.value].find(g => g.id === gameId)
  if (game) {
    toast.show(`${game.name} added to your collection!`, 'success')
  }
}

function handleRemoveFromCollection(gameId: string) {
  toggleCollection(Number(gameId))
}

function handleToggleWishlist(gameId: string) {
  toggleWishlist(Number(gameId))
  // Find the game name
  const game = [...recommendedGames.value, ...popularGames.value].find(g => g.id === gameId)
  if (game) {
    toast.show(`${game.name} added to your wishlist!`, 'success')
  }
}
</script>

<template>
  <div class="pb-6">
    <!-- Collection Snapshot -->
    <section class="px-4 pt-4 pb-6">
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        <div v-if="collectionCount > 0" class="flex items-center justify-between">
          <div>
            <p class="text-indigo-100 text-sm font-medium">Your Collection</p>
            <p class="text-3xl font-bold mt-1">{{ collectionCount }} <span class="text-lg font-normal text-indigo-100">games</span></p>
          </div>
          <NuxtLink 
            to="/collection" 
            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View All
          </NuxtLink>
        </div>
        <div v-else class="text-center py-2">
          <Icon name="mdi:bookshelf" class="w-10 h-10 mx-auto mb-2 text-indigo-200" />
          <p class="text-indigo-100 text-sm">Start your collection by searching and tapping</p>
          <p class="text-2xl mt-1">
            <Icon name="mdi:plus-circle" class="w-6 h-6 inline" />
          </p>
        </div>
      </div>
    </section>
    
    <GameNightPicker :games="[...recommendedGames, ...popularGames]" />

    <!-- Recommended For You -->
    <section class="mb-6">
      <div class="flex items-center justify-between px-4 mb-3">
        <h2 class="text-lg font-bold text-gray-900">Recommended For You</h2>
        <button 
          @click="showAllRecommended = !showAllRecommended"
          class="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
        >
          {{ showAllRecommended ? 'Collapse' : 'See All' }}
          <Icon :name="showAllRecommended ? 'mdi:chevron-up' : 'mdi:chevron-right'" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Expanded Grid View -->
      <div v-if="showAllRecommended" class="px-4">
        <GameGrid
          :games="recommendedGames"
          @add-to-collection="handleAddToCollection"
          @remove-from-collection="handleRemoveFromCollection"
          @toggle-wishlist="handleToggleWishlist"
        />
      </div>
      
      <!-- Horizontal Scroll View -->
      <div v-else class="overflow-x-auto scrollbar-hide">
        <div class="flex gap-3 px-4 pb-2">
          <div v-for="game in recommendedGames" :key="game.id" class="flex-shrink-0 w-36">
            <GameCard
              :game="game"
              :is-in-collection="isInCollection(game.id)"
              :is-in-wishlist="isInWishlist(game.id)"
              @add-to-collection="handleAddToCollection"
              @remove-from-collection="handleRemoveFromCollection"
              @toggle-wishlist="handleToggleWishlist"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Games -->
    <section class="mb-6">
      <div class="flex items-center justify-between px-4 mb-3">
        <h2 class="text-lg font-bold text-gray-900">Popular Games</h2>
        <button 
          @click="showAllPopular = !showAllPopular"
          class="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
        >
          {{ showAllPopular ? 'Collapse' : 'See All' }}
          <Icon :name="showAllPopular ? 'mdi:chevron-up' : 'mdi:chevron-right'" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Expanded Grid View -->
      <div v-if="showAllPopular" class="px-4">
        <GameGrid
          :games="popularGames"
          @add-to-collection="handleAddToCollection"
          @remove-from-collection="handleRemoveFromCollection"
          @toggle-wishlist="handleToggleWishlist"
        />
      </div>
      
      <!-- Horizontal Scroll View -->
      <div v-else class="overflow-x-auto scrollbar-hide">
        <div class="flex gap-3 px-4 pb-2">
          <div v-for="game in popularGames" :key="game.id" class="flex-shrink-0 w-36">
            <GameCard
              :game="game"
              :is-in-collection="isInCollection(game.id)"
              :is-in-wishlist="isInWishlist(game.id)"
              @add-to-collection="handleAddToCollection"
              @remove-from-collection="handleRemoveFromCollection"
              @toggle-wishlist="handleToggleWishlist"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Categories -->
    <section class="px-4">
      <h2 class="text-lg font-bold text-gray-900 mb-3">Popular Categories</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NuxtLink
          v-for="category in categories"
          :key="category.slug"
          :to="`/category/${category.slug}`"
          class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-indigo-300 transition-colors shadow-sm"
        >
          <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Icon :name="category.icon" class="w-5 h-5 text-indigo-600" />
          </div>
          <span class="font-medium text-gray-900 text-sm">{{ category.name }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
