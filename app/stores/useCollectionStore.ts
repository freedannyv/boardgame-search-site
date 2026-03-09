import { defineStore } from 'pinia'

interface CollectionState {
  gameIds: Set<number>
  loading: boolean
}

export const useCollectionStore = defineStore('collection', {
  state: (): CollectionState => ({
    gameIds: new Set<number>(),
    loading: false
  }),
  getters: {
    isOwned: (state) => (gameId: number): boolean => {
      return state.gameIds.has(gameId)
    }
  },
  actions: {
    setCollection(ids: number[]) {
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
    clearCollection() {
      this.gameIds.clear()
    }
  }
})
