<script setup lang="ts">
interface CategoryCompletion {
  name: string
  owned: number
  total: number
  topGames: { id: string; name: string; owned: boolean }[]
}

const props = defineProps<{
  categories: CategoryCompletion[]
}>()

// Sort by completion percentage, then by owned count
const sortedCategories = computed(() => {
  return [...props.categories]
    .filter(c => c.total > 0)
    .sort((a, b) => {
      const aPercent = a.owned / a.total
      const bPercent = b.owned / b.total
      if (bPercent !== aPercent) return bPercent - aPercent
      return b.owned - a.owned
    })
    .slice(0, 5) // Show top 5 categories
})

// Expanded category
const expandedCategory = ref<string | null>(null)

function toggleCategory(name: string) {
  expandedCategory.value = expandedCategory.value === name ? null : name
}

function getProgressColor(owned: number, total: number): string {
  const percent = (owned / total) * 100
  if (percent >= 80) return 'bg-emerald-500'
  if (percent >= 50) return 'bg-indigo-500'
  if (percent >= 25) return 'bg-amber-500'
  return 'bg-gray-400'
}

function getProgressBgColor(owned: number, total: number): string {
  const percent = (owned / total) * 100
  if (percent >= 80) return 'bg-emerald-100'
  if (percent >= 50) return 'bg-indigo-100'
  if (percent >= 25) return 'bg-amber-100'
  return 'bg-gray-100'
}
</script>

<template>
  <div v-if="sortedCategories.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-900">Collection Progress</h2>
      <span class="text-xs text-gray-500">Top 10 in each category</span>
    </div>

    <div class="space-y-3">
      <div 
        v-for="category in sortedCategories" 
        :key="category.name"
        class="rounded-xl border border-gray-100 overflow-hidden"
      >
        <!-- Category header -->
        <button
          type="button"
          @click="toggleCategory(category.name)"
          class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1.5">
              <p class="font-medium text-gray-900 truncate">{{ category.name }}</p>
              <span class="text-sm font-semibold" :class="category.owned === category.total ? 'text-emerald-600' : 'text-gray-600'">
                {{ category.owned }}/{{ category.total }}
              </span>
            </div>
            <!-- Progress bar -->
            <div class="h-2 rounded-full overflow-hidden" :class="getProgressBgColor(category.owned, category.total)">
              <div 
                class="h-full rounded-full transition-all duration-300"
                :class="getProgressColor(category.owned, category.total)"
                :style="{ width: `${(category.owned / category.total) * 100}%` }"
              />
            </div>
          </div>
          <Icon 
            :name="expandedCategory === category.name ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
            class="w-5 h-5 text-gray-400 flex-shrink-0" 
          />
        </button>

        <!-- Expanded game list -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedCategory === category.name" class="overflow-hidden">
            <div class="px-3 pb-3 space-y-1.5">
              <div 
                v-for="(game, index) in category.topGames" 
                :key="game.id"
                class="flex items-center gap-2 text-sm"
              >
                <span class="w-5 text-gray-400 text-xs">#{{ index + 1 }}</span>
                <Icon 
                  :name="game.owned ? 'mdi:check-circle' : 'mdi:circle-outline'" 
                  class="w-4 h-4 flex-shrink-0"
                  :class="game.owned ? 'text-emerald-500' : 'text-gray-300'"
                />
                <NuxtLink 
                  :to="`/game/${game.id}`"
                  class="flex-1 truncate hover:text-indigo-600 transition-colors"
                  :class="game.owned ? 'text-gray-900' : 'text-gray-500'"
                >
                  {{ game.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Completion badge for 100% -->
    <div 
      v-if="sortedCategories.some(c => c.owned === c.total)"
      class="mt-4 pt-4 border-t border-gray-100"
    >
      <div class="flex items-center gap-2 text-emerald-600">
        <Icon name="mdi:trophy" class="w-5 h-5" />
        <span class="text-sm font-medium">
          {{ sortedCategories.filter(c => c.owned === c.total).length }} category completed!
        </span>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
    <Icon name="mdi:progress-check" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
    <p class="text-gray-500">Add games to track your collection progress</p>
  </div>
</template>
