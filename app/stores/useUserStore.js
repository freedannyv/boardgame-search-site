import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    username: null,
    displayName: null,
    preferences: {}
  }),
  actions: {
    setUser(userData) {
      this.id = userData.id
      this.username = userData.username
      this.displayName = userData.displayName
      this.preferences = userData.preferences || {}
    },
    clearUser() {
      this.id = null
      this.username = null
      this.displayName = null
      this.preferences = {}
    },
    updatePreferences(preferences) {
      this.preferences = { ...this.preferences, ...preferences }
    }
  }
})
