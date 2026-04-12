import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    gameIds: new Set()
  }),
  getters: {
    isWishlisted: (state) => (gameId) => {
      return state.gameIds.has(gameId)
    }
  },
  actions: {
    setWishlist(ids) {
      this.gameIds = new Set(ids)
    },
    addGame(gameId) {
      this.gameIds.add(gameId)
    },
    removeGame(gameId) {
      this.gameIds.delete(gameId)
    },
    toggleGame(gameId) {
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
