export const useStoreRehydration = () => {
  const user = useSupabaseUser()
  
  // Rehydrate all user-specific stores
  const rehydrateStores = async () => {
    if (!user.value?.sub) {
      return
    }

    try {
      // Rehydrate user games store (collection + wishlist)
      const userGamesStore = useUserGamesStore()
      await userGamesStore.loadUserGames()
      
      // Sync legacy stores with data from user games store
      const collectionStore = useCollectionStore()
      const wishlistStore = useWishlistStore()
      
      // Extract game IDs from full game objects (convert string IDs to numbers)
      const collectionIds = userGamesStore.collection.map((game: any) => parseInt(game.game_id))
      const wishlistIds = userGamesStore.wishlist.map((game: any) => parseInt(game.game_id))
      
      // Update legacy stores
      collectionStore.setCollection(collectionIds)
      wishlistStore.setWishlist(wishlistIds)
      
      // Rehydrate hot games store (only if not already loaded)
      const hotGamesStore = useHotGamesStore()
      if (!hotGamesStore.getIsLoaded) {
        await hotGamesStore.fetchHotGames()
      }
      
      console.log('All stores rehydrated successfully')
    } catch (error) {
      console.error('Error rehydrating stores:', error)
    }
  }
  
  // Watch for user authentication changes
  watch(
    () => user.value?.sub,
    async (userId) => {
      if (userId) {
        // User is authenticated, rehydrate stores
        await rehydrateStores()
      } else {
        // User is logged out, reset stores
        const userGamesStore = useUserGamesStore()
        userGamesStore.resetUserGames()
        
        // Also reset legacy stores
        const collectionStore = useCollectionStore()
        const wishlistStore = useWishlistStore()
        collectionStore.clearCollection()
        wishlistStore.clearWishlist()
      }
    },
    { immediate: true }
  )
  
  return {
    rehydrateStores
  }
}
