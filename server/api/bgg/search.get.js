// BGG Search API Route
export default defineEventHandler(async (event) => {
  console.log('=== BGG Search API Called ===')
  
  const query = getQuery(event)
  console.log('Query params:', query)
  
  const config = useRuntimeConfig()
  console.log('Config loaded')
  console.log('BGG Token exists:', !!config.bggApiToken)
  
  if (!query.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query parameter is required'
    })
  }
  
  try {
    console.log('Making request to BGG with new token...')
    
    const response = await $fetch('https://boardgamegeek.com/xmlapi2/search', {
      method: 'GET',
      query: {
        query: query.query,
        type: query.type || 'boardgame',
        exact: query.exact,
        fuzzy: query.fuzzy,
        minyear: query.minyear,
        maxyear: query.maxyear
      },
      headers: {
        'Accept': 'application/xml',
        'Authorization': `Bearer ${config.bggApiToken}`
      }
    })
    
    console.log('BGG API success!')
    console.log('Response type:', typeof response)
    console.log('Response preview:', typeof response === 'string' ? response.substring(0, 200) : response)
    return response
  } catch (error) {
    console.error('Server error:', error.message)
    console.error('Error status:', error.status)
    console.error('Full error:', error)
    console.error('BGG Search API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search games'
    })
  }
})
