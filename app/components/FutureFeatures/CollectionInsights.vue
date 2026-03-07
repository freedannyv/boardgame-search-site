<script setup lang="ts">
interface GameWithStats {
  id: string
  name: string
  playCount?: number
  weight?: number
  playingTime?: number
  categories?: { name: string }[]
  mechanics?: { name: string }[]
}

const props = defineProps<{
  games: GameWithStats[]
}>()

// Most played game
const mostPlayedGame = computed(() => {
  if (props.games.length === 0) return null
  const sorted = [...props.games].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
  return sorted[0]?.playCount ? sorted[0] : null
})

// Total plays
const totalPlays = computed(() => {
  return props.games.reduce((sum, game) => sum + (game.playCount || 0), 0)
})

// Average weight
const averageWeight = computed(() => {
  const gamesWithWeight = props.games.filter(g => g.weight)
  if (gamesWithWeight.length === 0) return null
  const total = gamesWithWeight.reduce((sum, g) => sum + (g.weight || 0), 0)
  return (total / gamesWithWeight.length).toFixed(2)
})

// Weight label
const weightLabel = computed(() => {
  if (!averageWeight.value) return null
  const w = parseFloat(averageWeight.value)
  if (w < 2) return 'Light'
  if (w < 3) return 'Medium Light'
  if (w < 3.5) return 'Medium'
  if (w < 4) return 'Medium Heavy'
  return 'Heavy'
})

// Favorite mechanic (most common)
const favoriteMechanic = computed(() => {
  const mechanicCounts: Record<string, number> = {}
  props.games.forEach(game => {
    game.mechanics?.forEach(m => {
      mechanicCounts[m.name] = (mechanicCounts[m.name] || 0) + 1
    })
  })
  const sorted = Object.entries(mechanicCounts).sort((a, b) => b[1] - a[1])
  return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null
})

// Favorite category (most common)
const favoriteCategory = computed(() => {
  const categoryCounts: Record<string, number> = {}
  props.games.forEach(game => {
    game.categories?.forEach(c => {
      categoryCounts[c.name] = (categoryCounts[c.name] || 0) + 1
    })
  })
  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null
})

// Average playtime
const averagePlaytime = computed(() => {
  const gamesWithTime = props.games.filter(g => g.playingTime)
  if (gamesWithTime.length === 0) return null
  const total = gamesWithTime.reduce((sum, g) => sum + (g.playingTime || 0), 0)
  return Math.round(total / gamesWithTime.length)
})

// Format playtime
function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Heaviest game
const heaviestGame = computed(() => {
  if (props.games.length === 0) return null
  const gamesWithWeight = props.games.filter(g => g.weight)
  if (gamesWithWeight.length === 0) return null
  return gamesWithWeight.reduce((max, g) => (g.weight || 0) > (max.weight || 0) ? g : max)
})

// Lightest game
const lightestGame = computed(() => {
  if (props.games.length === 0) return null
  const gamesWithWeight = props.games.filter(g => g.weight)
  if (gamesWithWeight.length === 0) return null
  return gamesWithWeight.reduce((min, g) => (g.weight || 0) < (min.weight || 0) ? g : min)
})

// Longest game
const longestGame = computed(() => {
  if (props.games.length === 0) return null
  const gamesWithTime = props.games.filter(g => g.playingTime)
  if (gamesWithTime.length === 0) return null
  return gamesWithTime.reduce((max, g) => (g.playingTime || 0) > (max.playingTime || 0) ? g : max)
})

// Has any insights to show
const hasInsights = computed(() => {
  return props.games.length > 0
})
</script>

<template>
  <div v-if="hasInsights" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Collection Insights</h2>

    <div class="space-y-4">
      <!-- Most Played Game -->
      <div v-if="mostPlayedGame" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100">
          <Icon name="mdi:trophy" class="w-5 h-5 text-amber-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Most Played</p>
          <p class="font-semibold text-gray-900 truncate">{{ mostPlayedGame.name }}</p>
          <p class="text-sm text-gray-500">{{ mostPlayedGame.playCount }} plays</p>
        </div>
      </div>

      <!-- Total Plays -->
      <div v-if="totalPlays > 0" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-100">
          <Icon name="mdi:dice-multiple" class="w-5 h-5 text-indigo-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Total Plays</p>
          <p class="font-semibold text-gray-900">{{ totalPlays }}</p>
        </div>
      </div>

      <!-- Average Weight -->
      <div v-if="averageWeight" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-100">
          <Icon name="mdi:weight" class="w-5 h-5 text-purple-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Average Weight</p>
          <p class="font-semibold text-gray-900">{{ averageWeight }}</p>
          <p class="text-sm text-gray-500">{{ weightLabel }}</p>
        </div>
      </div>

      <!-- Favorite Mechanic -->
      <div v-if="favoriteMechanic" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-100">
          <Icon name="mdi:cog" class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Favorite Mechanic</p>
          <p class="font-semibold text-gray-900 truncate">{{ favoriteMechanic.name }}</p>
          <p class="text-sm text-gray-500">{{ favoriteMechanic.count }} games</p>
        </div>
      </div>

      <!-- Favorite Category -->
      <div v-if="favoriteCategory" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-100">
          <Icon name="mdi:tag" class="w-5 h-5 text-rose-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Favorite Category</p>
          <p class="font-semibold text-gray-900 truncate">{{ favoriteCategory.name }}</p>
          <p class="text-sm text-gray-500">{{ favoriteCategory.count }} games</p>
        </div>
      </div>

      <!-- Average Playtime -->
      <div v-if="averagePlaytime" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-100">
          <Icon name="mdi:clock-outline" class="w-5 h-5 text-sky-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Average Playtime</p>
          <p class="font-semibold text-gray-900">{{ formatPlaytime(averagePlaytime) }}</p>
        </div>
      </div>

      <!-- Heaviest & Lightest Games -->
      <div v-if="heaviestGame && lightestGame" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-100">
          <Icon name="mdi:scale-balance" class="w-5 h-5 text-orange-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Weight Range</p>
          <p class="text-sm text-gray-900">
            <span class="font-medium">{{ lightestGame.name }}</span>
            <span class="text-gray-400 mx-1">→</span>
            <span class="font-medium">{{ heaviestGame.name }}</span>
          </p>
          <p class="text-xs text-gray-500">{{ lightestGame.weight?.toFixed(1) }} to {{ heaviestGame.weight?.toFixed(1) }}</p>
        </div>
      </div>

      <!-- Longest Game -->
      <div v-if="longestGame" class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-100">
          <Icon name="mdi:timer-sand" class="w-5 h-5 text-teal-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Epic Marathon</p>
          <p class="font-semibold text-gray-900 truncate">{{ longestGame.name }}</p>
          <p class="text-sm text-gray-500">{{ formatPlaytime(longestGame.playingTime || 0) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
    <Icon name="mdi:chart-box-outline" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
    <p class="text-gray-500">Add games to see your collection insights</p>
  </div>
</template>
