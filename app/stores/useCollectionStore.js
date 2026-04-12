import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCollectionStore = defineStore('userGames', () => {
  // STATE
  const collection = ref([])
  const wishlist = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const hasLoadedOnce = ref(false)
  const error = ref(null)

  // COMPOSABLE
  const userGames = useUserGames()

  // COMPUTED LOOKUP SETS
  const collectionGameIds = computed(() => {
    return new Set(collection.value.map(item => item.game_id.toString()))
  })

  const wishlistGameIds = computed(() => {
    return new Set(wishlist.value.map(item => item.game_id.toString()))
  })

  // CONVENIENCE METHODS
  const isGameInCollection = (gameId) => {
    return collectionGameIds.value.has(gameId.toString())
  }

  const isGameInWishlist = (gameId) => {
    return wishlistGameIds.value.has(gameId.toString())
  }

  // ACTIONS
  const loadUserGames = async (force = false) => {
    if (isLoaded.value && !force) {
      return
    }

    try {
      isLoading.value = true
      error.value = null
      
      // Fetch both collection and wishlist from the composable
      const [collectionData, wishlistData] = await Promise.all([
        userGames.getCollection(),
        userGames.getWishlist()
      ])
      
      // Set store arrays
      collection.value = collectionData
      wishlist.value = wishlistData
      
      // Set loaded states
      isLoaded.value = true
      hasLoadedOnce.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user games'
      throw err
    } finally {
      // Clear loading state
      isLoading.value = false
    }
  }

  const resetUserGames = () => {
    // Clear collection
    collection.value = []
    // Clear wishlist
    wishlist.value = []
    // Set isLoaded = false
    isLoaded.value = false
    // Set isLoading = false
    isLoading.value = false
    // Clear error
    error.value = null
  }
  const loadCollection = async () => {
    try {
      isLoading.value = true
      error.value = null
      collection.value = await userGames.getCollection()
      isLoaded.value = true
      hasLoadedOnce.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadWishlist = async () => {
    try {
      isLoading.value = true
      error.value = null
      wishlist.value = await userGames.getWishlist()
      isLoaded.value = true
      hasLoadedOnce.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadAll = async () => {
    await Promise.all([loadCollection(), loadWishlist()])
  }

  const addGameToCollection = async (input) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable addToCollection
      const result = await userGames.addToCollection(input)
      
      // After success, add returned item into collection
      // Avoid duplicate local entries by removing any existing item first
      const existingIndex = collection.value.findIndex(item => item.game_id === input.gameId)
      
      if (existingIndex === -1) {
        // Add new item to front
        collection.value.unshift(result)
      } else {
        // Replace existing item at same position
        collection.value[existingIndex] = result
      }
      
      // If the game exists in wishlist locally, remove it
      const wishlistIndex = wishlist.value.findIndex(item => item.game_id === input.gameId)
      if (wishlistIndex !== -1) {
        wishlist.value.splice(wishlistIndex, 1)
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add game to collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeGameFromCollection = async (gameId) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable removeFromCollection
      await userGames.removeFromCollection(gameId.toString())
      
      // After success, remove item from local collection
      collection.value = collection.value.filter(item => item.game_id.toString() !== gameId.toString())
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove game from collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addGameToWishlist = async (input) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable addToWishlist
      const result = await userGames.addToWishlist(input)
      
      // After success, add returned item into local wishlist
      // Avoid duplicate local entries by checking existing index first
      const existingIndex = wishlist.value.findIndex(item => item.game_id === input.gameId)
      
      if (existingIndex === -1) {
        // Add new item to front
        wishlist.value.unshift(result)
      } else {
        // Replace existing item at same position
        wishlist.value[existingIndex] = result
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add game to wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeGameFromWishlist = async (gameId) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable removeFromWishlist
      await userGames.removeFromWishlist(gameId)
      
      // After success, remove item from local wishlist
      wishlist.value = wishlist.value.filter(item => item.game_id !== gameId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove game from wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateGameInCollection = async (gameId, updates) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable updateCollectionItem
      const result = await userGames.updateCollectionItem(gameId, updates)
      
      // Replace the matching local item with the returned updated item
      const index = collection.value.findIndex(item => item.game_id === gameId)
      if (index !== -1) {
        // Immutable-safe update
        collection.value = [
          ...collection.value.slice(0, index),
          result,
          ...collection.value.slice(index + 1)
        ]
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update game in collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const moveGameWishlistToCollection = async (input) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Call composable moveWishlistToCollection
      const result = await userGames.moveWishlistToCollection(input.gameId, input)
      
      // After success:
      // Remove the game from local wishlist
      const wishlistIndex = wishlist.value.findIndex(item => item.game_id === input.gameId)
      if (wishlistIndex !== -1) {
        wishlist.value.splice(wishlistIndex, 1)
      }
      
      // Add or replace it in local collection
      const collectionIndex = collection.value.findIndex(item => item.game_id === input.gameId)
      if (collectionIndex === -1) {
        // Add new item to front
        collection.value.unshift(result)
      } else {
        // Replace existing item at same position
        collection.value[collectionIndex] = result
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move game from wishlist to collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addToWishlist = async (input) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await userGames.addToWishlist(input)
      
      // Update local cache
      wishlist.value.unshift(result)
      
      // Remove from collection if it was there
      const collectionIndex = collection.value.findIndex(item => item.game_id === input.gameId)
      if (collectionIndex !== -1) {
        collection.value.splice(collectionIndex, 1)
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add to wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeFromWishlist = async (gameId) => {
    try {
      isLoading.value = true
      error.value = null
      
      await userGames.removeFromWishlist(gameId)
      
      // Remove from local cache
      const index = wishlist.value.findIndex(item => item.game_id === gameId)
      if (index !== -1) {
        wishlist.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove from wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const moveWishlistToCollection = async (gameId, collectionData) => {
    try {
      isLoading.value = true
      error.value = null
      
      await userGames.moveWishlistToCollection(gameId, collectionData)
      
      // Refresh both collections to get accurate data
      await loadAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move from wishlist to collection'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCollectionItem = async (gameId, updates) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await userGames.updateCollectionItem(gameId, updates)
      
      // Update local cache
      const index = collection.value.findIndex(item => item.game_id === gameId)
      if (index !== -1) {
        collection.value[index] = result
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update collection item'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearCache = () => {
    collection.value = []
    wishlist.value = []
    error.value = null
    isLoading.value = false
    isLoaded.value = false
  }

  // Initialize store on first use
  const initializeStore = async () => {
    try {
      clearCache()
      await loadAll()
    } catch (err) {
      console.error('Failed to initialize user games store:', err)
    }
  }

  return {
    // State
    collection,
    wishlist,
    isLoaded,
    isLoading,
    hasLoadedOnce,
    
    // Computed
    collectionGameIds,
    wishlistGameIds,
    
    // Convenience Methods
    isGameInCollection,
    isGameInWishlist,
    
    // Actions
    loadUserGames,
    resetUserGames,
    addGameToCollection,
    removeGameFromCollection,
    updateGameInCollection,
    addGameToWishlist,
    removeGameFromWishlist,
    moveGameWishlistToCollection
  }
})
