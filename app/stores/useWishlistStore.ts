import { defineStore } from 'pinia'

interface WishlistState {
  gameIds: Set<number>
}

export const useWishlistStore = defineStore('wishlist', {
  state: (): WishlistState => ({
    gameIds: new Set<number>()
  }),
  getters: {
    isWishlisted: (state) => (gameId: number): boolean => {
      return state.gameIds.has(gameId)
    }
  },
  actions: {
    setWishlist(ids: number[]) {
      this.gameIds = new Set(ids)
    },
    addGame(gameId: number) {
      this.gameIds.add(gameId)
    },
    removeGame(gameId: number) {
      this.gameIds.delete(gameId)
    },
    toggleGame(gameId: number) {
      if (this.gameIds.has(gameId)) {
        this.gameIds.delete(gameId)
      } else {
        this.gameIds.add(gameId)
      }
    },
    clearWishlist() {
      this.gameIds.clear()
    }
  }
})
