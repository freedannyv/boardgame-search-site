// BGG XML Response Parser
import type { SearchResult } from '~/components/SearchBar.vue'

// Decode HTML entities like &#039; to proper characters
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

interface BggItem {
  id: string
  type: string
  name: {
    value: string
    type: string
  }[]
  yearpublished?: {
    value: string
  }
  thumbnail?: string
  image?: string
  statistics?: {
    ratings: {
      average: {
        value: string
      }
    }
  }
}

interface BggSearchResponse {
  items?: {
    item: BggItem[]
  }
}

export function parseBggSearchResponse(xmlString: string): SearchResult[] {
  const results: SearchResult[] = []
  
  try {
    // Simple XML parsing for BGG search response
    // This is a basic parser - for production, consider using a proper XML library
    
    // Extract items using regex patterns
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    itemMatches.forEach(itemXml => {
      const idMatch = itemXml.match(/id="(\d+)"/)
      const nameMatch = itemXml.match(/<name[^>]*value="([^"]*)"/)
      const yearMatch = itemXml.match(/<yearpublished[^>]*value="(\d+)"/)
      const thumbnailMatch = itemXml.match(/<thumbnail>([^<]*)<\/thumbnail>/)
      
      if (idMatch && nameMatch && idMatch[1] && nameMatch[1]) {
        const result: SearchResult = {
          id: idMatch[1],
          name: decodeHtmlEntities(nameMatch[1]),
          yearPublished: yearMatch?.[1] ? parseInt(yearMatch[1]) : undefined,
          thumbnail: thumbnailMatch?.[1] || null,
          average: null // TODO: Extract rating from statistics if needed
        }
        results.push(result)
      }
    })
    
    return results
  } catch (error) {
    console.error('Error parsing BGG XML:', error)
    return []
  }
}

export function parseBggHotItemsResponse(xmlString: string): SearchResult[] {
  const results: SearchResult[] = []
  
  try {
    // Extract items using regex patterns for hot items
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    itemMatches.forEach(itemXml => {
      const idMatch = itemXml.match(/id="(\d+)"/)
      const nameMatch = itemXml.match(/<name[^>]*value="([^"]*)"/)
      const yearMatch = itemXml.match(/<yearpublished[^>]*value="(\d+)"/)
      const thumbnailMatch = itemXml.match(/<thumbnail[^>]*value="([^"]*)"/)
      const rankMatch = itemXml.match(/<rank[^>]*value="(\d+)"/)
      
      console.log('Processing item XML:', itemXml.substring(0, 200) + '...')
      console.log('Thumbnail match:', thumbnailMatch)
      
      if (idMatch && nameMatch && idMatch[1] && nameMatch[1]) {
        const result: SearchResult = {
          id: idMatch[1],
          name: decodeHtmlEntities(nameMatch[1]),
          yearPublished: yearMatch?.[1] ? parseInt(yearMatch[1]) : undefined,
          thumbnail: thumbnailMatch?.[1] || null,
          average: null // Hot items don't include ratings
        }
        console.log('Parsed result:', result)
        results.push(result)
      }
    })
    
    return results
  } catch (error) {
    console.error('Error parsing BGG Hot Items XML:', error)
    return []
  }
}

// Extract expansion IDs from base game response
export function extractExpansionIds(xmlString: string): string[] {
  const expansionIds: string[] = []
  
  try {
    // Find all expansion links in the base game
    const expansionMatches = xmlString.match(/<link[^>]*type="boardgameexpansion"[^>]*>/g) || []
    
    expansionMatches.forEach(linkXml => {
      const idMatch = linkXml.match(/id="(\d+)"/)
      if (idMatch && idMatch[1]) {
        expansionIds.push(idMatch[1])
      }
    })
    
    return expansionIds
  } catch (error) {
    console.error('Error extracting expansion IDs:', error)
    return []
  }
}

export function parseBggExpansionsResponse(xmlString: string, baseGameId: string): SearchResult[] {
  const results: SearchResult[] = []
  
  try {
    // Extract items using regex patterns
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    itemMatches.forEach(itemXml => {
      const idMatch = itemXml.match(/id="(\d+)"/)
      const nameMatch = itemXml.match(/<name[^>]*value="([^"]*)"/)
      const yearMatch = itemXml.match(/<yearpublished[^>]*value="(\d+)"/)
      const thumbnailMatch = itemXml.match(/<thumbnail[^>]*value="([^"]*)"/)
      
      // Since we're using type parameter, all items should be expansions
      if (idMatch && nameMatch && idMatch[1] && nameMatch[1]) {
        const result: SearchResult = {
          id: idMatch[1],
          name: decodeHtmlEntities(nameMatch[1]),
          yearPublished: yearMatch?.[1] ? parseInt(yearMatch[1]) : undefined,
          thumbnail: thumbnailMatch?.[1] || null,
          average: null // Expansions typically don't have separate ratings
        }
        // console.log('Parsed expansion:', result)
        results.push(result)
      }
    })
    
    return results
  } catch (error) {
    console.error('Error parsing BGG Expansions XML:', error)
    return []
  }
}

export function parseBggThingResponse(xmlString: string): SearchResult | null {
  try {
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    if (itemMatches.length > 0) {
      const itemXml = itemMatches[0]
      if (!itemXml) return null
      
      const idMatch = itemXml.match(/id="(\d+)"/)
      const nameMatch = itemXml.match(/<name[^>]*value="([^"]*)"/)
      const yearMatch = itemXml.match(/<yearpublished[^>]*value="(\d+)"/)
      const thumbnailMatch = itemXml.match(/<thumbnail>([^<]*)<\/thumbnail>/)
      const imageMatch = itemXml.match(/<image>([^<]*)<\/image>/)
      const ratingMatch = itemXml.match(/<average[^>]*value="([\d.]+)"/)
      const minPlayersMatch = itemXml.match(/<minplayers[^>]*value="(\d+)"/)
      const maxPlayersMatch = itemXml.match(/<maxplayers[^>]*value="(\d+)"/)
      const playingTimeMatch = itemXml.match(/<playingtime[^>]*value="(\d+)"/)
      const weightMatch = itemXml.match(/<averageweight[^>]*value="([\d.]+)"/)
      const descriptionMatch = itemXml.match(/<description>([^<]*)<\/description>/)
      
      if (idMatch && nameMatch && idMatch[1] && nameMatch[1]) {
        return {
          id: idMatch[1],
          name: decodeHtmlEntities(nameMatch[1]),
          yearPublished: yearMatch?.[1] ? parseInt(yearMatch[1]) : undefined,
          thumbnail: thumbnailMatch?.[1] || null,
          average: ratingMatch?.[1] ? parseFloat(ratingMatch[1]) : null,
          // Additional fields that will be extracted by the game page parser
          image: imageMatch?.[1] || null,
          minPlayers: minPlayersMatch?.[1] ? parseInt(minPlayersMatch[1]) : undefined,
          maxPlayers: maxPlayersMatch?.[1] ? parseInt(maxPlayersMatch[1]) : undefined,
          playingTime: playingTimeMatch?.[1] ? parseInt(playingTimeMatch[1]) : undefined,
          weight: weightMatch?.[1] ? parseFloat(weightMatch[1]) : null,
          description: descriptionMatch?.[1] ? decodeHtmlEntities(descriptionMatch[1]) : null
        } as any // Using any for now since SearchResult interface doesn't include all fields
      }
    }
    
    return null
  } catch (error) {
    console.error('Error parsing BGG Thing XML:', error)
    return null
  }
}
