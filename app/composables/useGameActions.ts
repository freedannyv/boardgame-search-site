import { useCollectionStore } from '../stores/useCollectionStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useUserGamesStore } from '../stores/useUserGamesStore'

export function useGameActions() {
  const collectionStore = useCollectionStore()
  const wishlistStore = useWishlistStore()
  const userGamesStore = useUserGamesStore()

  const toggleCollection = async (gameId: number) => {
    try {
      if (collectionStore.isOwned(gameId)) {
        // Remove from collection via API
        await userGamesStore.removeGameFromCollection(String(gameId))
        // Update legacy store for immediate UI feedback
        collectionStore.removeGame(gameId)
      } else {
        // This would need game details - for now just update legacy store
        // In practice, this should open a modal to collect game details
        collectionStore.addGame(gameId)
      }
    } catch (error) {
      console.error('Error toggling collection:', error)
      // Revert UI change on error
      collectionStore.toggleGame(gameId)
    }
  }

  const toggleWishlist = async (gameId: number) => {
    try {
      if (wishlistStore.isWishlisted(gameId)) {
        // Remove from wishlist via API
        await userGamesStore.removeGameFromWishlist(String(gameId))
        // Update legacy store for immediate UI feedback
        wishlistStore.removeGame(gameId)
      } else {
        // Add to wishlist via API
        await userGamesStore.addGameToWishlist({ gameId: String(gameId) })
        // Update legacy store for immediate UI feedback
        wishlistStore.addGame(gameId)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      // Revert UI change on error
      wishlistStore.toggleGame(gameId)
    }
  }

  return {
    toggleCollection,
    toggleWishlist
  }
}
