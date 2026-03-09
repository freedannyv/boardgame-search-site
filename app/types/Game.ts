export interface Game {
  id: string
  name: string
  thumbnail: string | null
  average: number
  minPlayers: number
  maxPlayers: number
  playingTime: number
}
