// BGG Hot Items API Route
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  
  try {
    const response = await $fetch('https://boardgamegeek.com/xmlapi2/hot', {
      method: 'GET',
      query: {
        type: query.type || 'boardgame'
      },
      headers: {
        'Accept': 'application/xml',
        'Authorization': `Bearer ${config.bggApiToken}`
      }
    })
    
    return response
  } catch (error: any) {
    console.error('BGG Hot Items API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get hot items'
    })
  }
})
