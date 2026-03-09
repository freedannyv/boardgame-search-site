import { useCollectionStore } from '../stores/useCollectionStore'
import { useWishlistStore } from '../stores/useWishlistStore'

export function useGameActions() {
  const collectionStore = useCollectionStore()
  const wishlistStore = useWishlistStore()

  const toggleCollection = (gameId: number) => {
    if (collectionStore.isOwned(gameId)) {
      collectionStore.removeGame(gameId)
    } else {
      collectionStore.addGame(gameId)
    }
  }

  const toggleWishlist = (gameId: number) => {
    if (wishlistStore.isWishlisted(gameId)) {
      wishlistStore.removeGame(gameId)
    } else {
      wishlistStore.addGame(gameId)
    }
  }

  return {
    toggleCollection,
    toggleWishlist
  }
}
