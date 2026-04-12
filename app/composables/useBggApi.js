// BGG XML API 2 Composable
// Based on: https://boardgamegeek.com/wiki/page/BGG_XML_API2

export function useBggApi() {
  console.log('usebggapi() function called')
  const config = useRuntimeConfig()
  const token = config.public.BGG_API_TOKEN

  // Search for items in database
  const searchItems = async (params) => {
    try {
      const response = await $fetch('/api/bgg/search', {
        method: 'GET',
        query: params
      })
      
     // console.log('BGG Search Response:', response)
      return response
    } catch (error) {
      console.error('BGG Search Error:', error)
      throw error
    }
  }

  // Get detailed information about a specific item
  const getThing = async (id, params) => {
    try {
      const response = await $fetch('/api/bgg/thing', {
        method: 'GET',
        query: { id, ...params }
      })
      
      // console.log('BGG Thing Response:', response)
      return response
    } catch (error) {
      console.error('BGG Thing Error:', error)
      throw error
    }
  }

  // Get user information
  const getUser = async (username, params) => {
    try {
      const response = await $fetch('/api/bgg/user', {
        method: 'GET',
        query: { username, ...params }
      })
      
      // console.log('BGG User Response:', response)
      return response
    } catch (error) {
      console.error('BGG User Error:', error)
      throw error
    }
  }

  // Get user collection
  const getUserCollection = async (username, params) => {
    try {
      const response = await $fetch('/api/bgg/collection', {
        method: 'GET',
        query: { username, ...params }
      })
      
      // console.log('BGG Collection Response:', response)
      return response
    } catch (error) {
      console.error('BGG Collection Error:', error)
      throw error
    }
  }

  // Get hot items
  const getHotItems = async (type = 'boardgame') => {
    try {
      const response = await $fetch('/api/bgg/hot', {
        method: 'GET',
        query: { type }
      })
      
      // console.log('BGG Hot Items Response:', response)
      return response
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
