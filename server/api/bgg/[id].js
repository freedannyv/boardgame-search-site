export default defineEventHandler(async (event) => {
  const gameId = getRouterParam(event, 'id')
  
  if (!gameId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Game ID is required'
    })
  }

  try {
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`)
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `BGG API error: ${response.statusText}`
      })
    }

    const xmlText = await response.text()
    
    // Parse XML using jsdom
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(xmlText)
    const document = dom.window.document
    const item = document.querySelector('item')
    
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Game not found'
      })
    }

    // Extract game data
    const name = item.querySelector('name')?.getAttribute('value') || `Game ${gameId}`
    const thumbnail = item.querySelector('thumbnail')?.textContent || null
    const image = item.querySelector('image')?.textContent || null
    const description = item.querySelector('description')?.textContent || ''
    const yearPublished = parseInt(item.querySelector('yearpublished')?.getAttribute('value') || '0')
    const minPlayers = parseInt(item.querySelector('minplayers')?.getAttribute('value') || '2')
    const maxPlayers = parseInt(item.querySelector('maxplayers')?.getAttribute('value') || '4')
    const playingTime = parseInt(item.querySelector('playingtime')?.getAttribute('value') || '60')
    const minPlayTime = parseInt(item.querySelector('minplaytime')?.getAttribute('value') || playingTime)
    const maxPlayTime = parseInt(item.querySelector('maxplaytime')?.getAttribute('value') || playingTime)
    const average = parseFloat(item.querySelector('average')?.getAttribute('value') || '0')
    const rank = parseInt(item.querySelector('rank')?.getAttribute('value') || '0')
    
    // Extract categories and mechanics
    const categories = []
    const mechanics = []
    
    item.querySelectorAll('link[type="boardgamecategory"]').forEach((link) => {
      categories.push(link.getAttribute('value') || '')
    })
    
    item.querySelectorAll('link[type="boardgamemechanic"]').forEach((link) => {
      mechanics.push(link.getAttribute('value') || '')
    })

    return {
      id: gameId,
      name,
      thumbnail,
      image,
      description,
      yearPublished,
      minPlayers,
      maxPlayers,
      playingTime,
      minPlayTime,
      maxPlayTime,
      average,
      rank,
      categories,
      mechanics
    }
  } catch (error) {
    console.error('BGG API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch game data from BGG'
    })
  }
})
