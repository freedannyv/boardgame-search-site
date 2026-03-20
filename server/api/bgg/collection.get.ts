// BGG Collection API Route
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  
  if (!query.username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username parameter is required'
    })
  }
  
  try {
    const response = await $fetch('https://boardgamegeek.com/xmlapi2/collection', {
      method: 'GET',
      query: {
        username: query.username,
        subtype: query.subtype || 'boardgame',
        excludesubtype: query.excludesubtype,
        brief: query.brief,
        stats: query.stats
      },
      headers: {
        'Accept': 'application/xml',
        'Authorization': `Bearer ${config.bggApiToken}`
      }
    })
    
    return response
  } catch (error: any) {
    console.error('BGG Collection API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user collection'
    })
  }
})
