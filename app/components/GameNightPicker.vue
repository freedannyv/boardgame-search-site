<script setup lang="ts">
import type { Game } from '~/components/GameCard.vue'

const props = defineProps<{
  games: Game[]
}>()

const emit = defineEmits<{
  'addToCollection': [gameId: string]
  'removeFromCollection': [gameId: string]
  'toggleWishlist': [gameId: string]
}>()

// Filter inputs
const players = ref<number | null>(null)
const maxPlaytime = ref<string | null>(null)
const complexity = ref<string | null>(null)

// Expanded state
const isExpanded = ref(false)

// Suggested game
const suggestedGame = ref<Game | null>(null)
const noMatch = ref(false)

// Options
const playerOptions = [1, 2, 3, 4, 5, 6]
const playtimeOptions = ['30 min', '60 min', '90 min', '2 hours', '3+ hours']
const complexityOptions = ['Light', 'Medium Light', 'Medium', 'Medium Heavy', 'Heavy']

// Filter and pick a random game
function suggestGame() {
  noMatch.value = false
  suggestedGame.value = null
  
  // Filter games based on criteria
  let filtered = [...props.games]
  
  // Filter by player count
  if (players.value !== null) {
    filtered = filtered.filter(game => {
      const min = game.minPlayers || 1
      const max = game.maxPlayers || 99
      return players.value! >= min && players.value! <= max
    })
  }
  
  // Filter by playtime
  if (maxPlaytime.value !== null) {
    const maxMinutes = parsePlaytime(maxPlaytime.value)
    filtered = filtered.filter(game => {
      return !game.playingTime || game.playingTime <= maxMinutes
    })
  }
  
  // Note: Complexity filtering would require weight data on Game type
  // For now, we skip complexity filtering as Game doesn't have weight
  
  if (filtered.length === 0) {
    noMatch.value = true
    return
  }
  
  // Pick random game
  const randomIndex = Math.floor(Math.random() * filtered.length)
  suggestedGame.value = filtered[randomIndex] ?? null
}

function parsePlaytime(playtime: string): number {
  switch (playtime) {
    case '30 min': return 30
    case '60 min': return 60
    case '90 min': return 90
    case '2 hours': return 120
    case '3+ hours': return 999
    default: return 999
  }
}

function reset() {
  players.value = null
  maxPlaytime.value = null
  complexity.value = null
  suggestedGame.value = null
  noMatch.value = false
  isExpanded.value = false
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    <!-- Collapsed state - just a button -->
    <button
      v-if="!isExpanded && !suggestedGame"
      type="button"
      @click="isExpanded = true"
      class="w-full flex items-center justify-center gap-3 p-4 text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      <Icon name="mdi:dice-multiple" class="w-6 h-6" />
      <span class="font-semibold">Game Night Picker</span>
      <Icon name="mdi:chevron-down" class="w-5 h-5" />
    </button>

    <!-- Expanded state -->
    <div v-else class="p-4">
      <!-- Header with collapse button -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">Game Night Picker</h2>
        <button
          v-if="!suggestedGame"
          type="button"
          @click="isExpanded = false"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:chevron-up" class="w-5 h-5" />
        </button>
      </div>
    
      <!-- Filters -->
      <div v-if="!suggestedGame && !noMatch" class="space-y-4">
      <!-- Players -->
      <div>
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          How many players?
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="count in playerOptions"
            :key="count"
            type="button"
            @click="players = players === count ? null : count"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="players === count 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ count }}{{ count === 6 ? '+' : '' }}
          </button>
        </div>
      </div>

      <!-- Playtime -->
      <div>
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Maximum playtime?
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="time in playtimeOptions"
            :key="time"
            type="button"
            @click="maxPlaytime = maxPlaytime === time ? null : time"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="maxPlaytime === time 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ time }}
          </button>
        </div>
      </div>

      <!-- Complexity -->
      <div>
        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Complexity?
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in complexityOptions"
            :key="level"
            type="button"
            @click="complexity = complexity === level ? null : level"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="complexity === level 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2 mt-6">
        <button
          type="button"
          @click="suggestGame"
          class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors active:scale-95"
        >
          <Icon name="mdi:dice-multiple" class="w-5 h-5" />
          Suggest a Game
        </button>
        <button
          v-if="players || maxPlaytime || complexity"
          type="button"
          @click="reset"
          class="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors active:scale-95"
        >
          <Icon name="mdi:refresh" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Result -->
    <div v-if="suggestedGame || noMatch" class="mt-2 pt-4 border-t border-gray-100">
      <!-- No match -->
      <div v-if="noMatch" class="text-center py-4">
        <Icon name="mdi:emoticon-sad-outline" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p class="text-gray-900 font-medium">No games match your criteria</p>
        <p class="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        <button
          type="button"
          @click="noMatch = false"
          class="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>

      <!-- Suggested game -->
      <div v-else-if="suggestedGame">
        <p class="text-sm text-gray-500 mb-3 text-center">Tonight's pick:</p>
        <div class="max-w-xs mx-auto">
          <GameCard
            :game="suggestedGame"
            :is-in-collection="true"
            :is-in-wishlist="false"
            @add-to-collection="emit('addToCollection', $event)"
            @remove-from-collection="emit('removeFromCollection', $event)"
            @toggle-wishlist="emit('toggleWishlist', $event)"
          />
        </div>
        <div class="flex gap-2 mt-4">
          <button
            type="button"
            @click="suggestGame"
            class="flex-1 py-2 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
          >
            Try another
          </button>
          <button
            type="button"
            @click="reset"
            class="flex-1 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
