// BGG XML API 2 Composable
// Based on: https://boardgamegeek.com/wiki/page/BGG_XML_API2

interface BggApiResponse {
  success: boolean
  message?: string
  data?: any
}

interface SearchParams {
  query: string
  type?: 'boardgame' | 'boardgameexpansion' | 'boardgameaccessory'
  exact?: boolean
  fuzzy?: boolean
  minyear?: number
  maxyear?: number
}

interface ThingParams {
  id: number
  type?: 'boardgame' | 'boardgameexpansion' | 'boardgameaccessory'
  stats?: boolean
  market?: boolean
  comments?: boolean
  videos?: boolean
  versions?: boolean
}

interface UserParams {
  username: string
  type?: 'boardgame' | 'rpg' | 'videogame'
}

interface CollectionParams {
  username: string
  subtype?: 'boardgame' | 'boardgameexpansion'
  excludesubtype?: 'boardgameexpansion'
  brief?: boolean
  stats?: boolean
}

export function useBggApi() {
  const config = useRuntimeConfig()
  const token = config.public.BGG_API_TOKEN

  // Search for items in database
  const searchItems = async (params: SearchParams): Promise<BggApiResponse> => {
    try {
      const response = await $fetch('/api/bgg/search', {
        method: 'GET',
        query: params
      })
      
     // console.log('BGG Search Response:', response)
      return response as BggApiResponse
    } catch (error) {
      console.error('BGG Search Error:', error)
      throw error
    }
  }

  // Get detailed information about a specific item
  const getThing = async (id: number, params?: Partial<ThingParams>): Promise<BggApiResponse> => {
    try {
      const response = await $fetch('/api/bgg/thing', {
        method: 'GET',
        query: { id, ...params }
      })
      
      // console.log('BGG Thing Response:', response)
      return response as BggApiResponse
    } catch (error) {
      console.error('BGG Thing Error:', error)
      throw error
    }
  }

  // Get user information
  const getUser = async (username: string, params?: Partial<UserParams>): Promise<BggApiResponse> => {
    try {
      const response = await $fetch('/api/bgg/user', {
        method: 'GET',
        query: { username, ...params }
      })
      
      // console.log('BGG User Response:', response)
      return response as BggApiResponse
    } catch (error) {
      console.error('BGG User Error:', error)
      throw error
    }
  }

  // Get user collection
  const getUserCollection = async (username: string, params?: Partial<CollectionParams>): Promise<BggApiResponse> => {
    try {
      const response = await $fetch('/api/bgg/collection', {
        method: 'GET',
        query: { username, ...params }
      })
      
      // console.log('BGG Collection Response:', response)
      return response as BggApiResponse
    } catch (error) {
      console.error('BGG Collection Error:', error)
      throw error
    }
  }

  // Get hot items
  const getHotItems = async (type: 'boardgame' | 'rpg' | 'videogame' = 'boardgame'): Promise<BggApiResponse> => {
    try {
      const response = await $fetch('/api/bgg/hot', {
        method: 'GET',
        query: { type }
      })
      
      // console.log('BGG Hot Items Response:', response)
      return response as BggApiResponse
    } catch (error) {
      console.error('BGG Hot Items Error:', error)
      throw error
    }
  }

  return {
    searchItems,
    getThing,
    getUser,
    getUserCollection,
    getHotItems
  }
}
