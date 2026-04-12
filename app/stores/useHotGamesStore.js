import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseBggHotItemsResponse } from '~/utils/bggParser'

export const useHotGamesStore = defineStore('hotGames', () => {
  // STATE
  const hotGames = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const lastFetched = ref(null)
  const error = ref(null)

  // ACTIONS
  const fetchHotGames = async (force = false) => {
    // Skip if already loaded and not forcing refresh
    if (isLoaded.value && !force) {
      return
    }

    try {
      isLoading.value = true
      error.value = null
      
      console.log('Fetching hot games...')
      
      const { getHotItems } = useBggApi()
      const response = await getHotItems('boardgame')

      console.log('Hot games response:', response)
      
      // Parse XML response and transform to game format
      const parsedGames = parseBggHotItemsResponse(response.data || response)
      
      hotGames.value = parsedGames
      isLoaded.value = true
      lastFetched.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch hot games'
      hotGames.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearHotGames = () => {
    hotGames.value = []
    isLoaded.value = false
    lastFetched.value = null
    error.value = null
  }

  // GETTERS
  const getHotGames = computed(() => hotGames.value)
  const getIsLoaded = computed(() => isLoaded.value)
  const getIsLoading = computed(() => isLoading.value)
  const getLastFetched = computed(() => lastFetched.value)
  const getError = computed(() => error.value)

  return {
    // State
    hotGames,
    isLoaded,
    isLoading,
    lastFetched,
    error,
    // Actions
    fetchHotGames,
    clearHotGames,
    // Getters
    getHotGames,
    getIsLoaded,
    getIsLoading,
    getLastFetched,
    getError
  }
})
