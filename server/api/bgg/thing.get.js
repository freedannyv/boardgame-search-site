// BGG Thing API Route
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  
  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID parameter is required'
    })
  }
  
  try {
    const response = await $fetch('https://boardgamegeek.com/xmlapi2/thing', {
      method: 'GET',
      query: {
        id: query.id,
        stats: query.stats,
        market: query.market,
        comments: query.comments,
        videos: query.videos,
        versions: query.versions
      },
      headers: {
        'Accept': 'application/xml',
        'Authorization': `Bearer ${config.bggApiToken}`
      }
    })
    
    return response
  } catch (error) {
    console.error('BGG Thing API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get item details'
    })
  }
})
