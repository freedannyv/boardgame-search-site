import { defineStore } from 'pinia'

export const usePlaceholderGamesStore = defineStore('placeholderGames', {
  state: () => ({
    games: [
      { id: '1', name: 'Wingspan', thumbnail: null, average: 8.1, minPlayers: 1, maxPlayers: 5, playingTime: 70 },
      { id: '2', name: 'Everdell', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 80 },
      { id: '3', name: 'Ark Nova', thumbnail: null, average: 8.5, minPlayers: 1, maxPlayers: 4, playingTime: 150 },
      { id: '4', name: 'Cascadia', thumbnail: null, average: 8.0, minPlayers: 1, maxPlayers: 4, playingTime: 45 },
      { id: '5', name: 'Terraforming Mars', thumbnail: null, average: 8.4, minPlayers: 1, maxPlayers: 5, playingTime: 120 },
      { id: '6', name: 'Spirit Island', thumbnail: null, average: 8.3, minPlayers: 1, maxPlayers: 4, playingTime: 120 },
    ]
  }),
  getters: {
    getPlaceholderGames: (state) => state.games
  }
})
