import { useCollectionStore } from '../app/stores/useCollectionStore'
import { useWishlistStore } from '../app/stores/useWishlistStore'

export function useGameActions() {
  const collectionStore = useCollectionStore()
  const wishlistStore = useWishlistStore()

  function toggleCollection(gameId: number) {
    if (collectionStore.isOwned(gameId)) {
      collectionStore.removeGame(gameId)
    } else {
      collectionStore.addGame(gameId)
    }
  }

  function toggleWishlist(gameId: number) {
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
