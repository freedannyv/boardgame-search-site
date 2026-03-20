<script setup lang="ts">
import GameSection from '~/components/game/GameSection.vue'
import CollectionSnapshot from '~/components/collection/CollectionSnapshot.vue'

// Get recommended games from store
import { usePlaceholderGamesStore } from '~/stores/games'
const placeholderGamesStore = usePlaceholderGamesStore()

const recommendedGames = computed(() => placeholderGamesStore.getPlaceholderGames)

const toast = useToastStore()

const popularGames = computed(() => placeholderGamesStore.getPlaceholderGames)

const categories = [
  { name: 'Strategy', icon: 'mdi:chess-knight', slug: 'strategy' },
  { name: 'Party', icon: 'mdi:party-popper', slug: 'party' },
  { name: 'Family', icon: 'mdi:account-group', slug: 'family' },
  { name: 'Cooperative', icon: 'mdi:handshake', slug: 'cooperative' },
  { name: 'Deck Building', icon: 'mdi:cards', slug: 'deck-building' },
  { name: 'Abstract', icon: 'mdi:shape', slug: 'abstract' },
]

// Handle fetch button click with BGG API call
const handleGameFetch = async () => {
  try {
    
    const config = useRuntimeConfig()
    const token = config.public.BGG_API_TOKEN
     
    const response = await $fetch('https://boardgamegeek.com/xmlapi2/search?query=obsession', {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('BGG API Response:', response)
  } catch (error) {
    console.error('BGG API Error:', error)
    console.error('Error status:', error?.status || error?.statusCode)
    toast.show('Failed to fetch games', 'error')
  }
}

// ... rest of the script remains the same ...

</script>

<template>
  <div class="pb-6">
    <CollectionSnapshot />

    <button @click="handleGameFetch">Fetch Games</button>
    
    <GameNightPicker :games="[...recommendedGames, ...popularGames]" />

    <!-- Recommended For You -->
    <GameSection
      ref="recommendedSection"
      title="Recommended For You"
      :games="recommendedGames"
    />
    
    <!-- Popular Games -->
    <GameSection
      ref="popularSection"
      title="Popular Games"
      :games="popularGames"
    />

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