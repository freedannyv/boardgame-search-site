import { defineStore } from 'pinia'

interface UserState {
  id: number | null
  username: string | null
  displayName: string | null
  preferences: Record<string, any>
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    username: null,
    displayName: null,
    preferences: {}
  }),
  actions: {
    setUser(userData: {
      id: number
      username: string
      displayName: string
      preferences?: Record<string, any>
    }) {
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
    updatePreferences(preferences: Record<string, any>) {
      this.preferences = { ...this.preferences, ...preferences }
    }
  }
})
