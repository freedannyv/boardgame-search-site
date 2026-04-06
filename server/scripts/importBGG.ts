import 'dotenv/config'
import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()

const serviceKey = config.supabaseServiceKey

const supabase = createClient(
  config.public.supabaseUrl!,
  serviceKey!
)

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi'

interface BGGLink {
  $: {
    type: string
    id: string
    value: string
  }
}

interface BGGItem {
  $: { id: string }
  name: Array<{ $: { type: string; value: string } }>
  description: string[]
  yearpublished: Array<{ $: { value: string } }>
  minplayers: Array<{ $: { value: string } }>
  maxplayers: Array<{ $: { value: string } }>
  playingtime: Array<{ $: { value: string } }>
  image: string[]
  thumbnail: string[]
  link: BGGLink[]
  statistics: Array<{
    ratings: Array<{
      averageweight: Array<{ $: { value: string } }>
    }>
  }>
}

let sessionCookie: string | null = null

async function loginToBGG(): Promise<void> {
  const username = config.bggUsername
  const password = config.bggPassword
  
  if (!username || !password) {
    console.log('No BGG credentials found, attempting unauthenticated requests...')
    return
  }
  
  console.log(`Logging in to BGG as ${username}...`)
  
  const response = await axios.post(
    'https://boardgamegeek.com/login/api/v1',
    {
      credentials: { username, password }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BoardGameTracker/1.0'
      },
      withCredentials: true
    }
  )
  
  const cookies = response.headers['set-cookie']
  if (cookies) {
    // Extract only the cookie name=value part from each set-cookie header
    const cookieValues = cookies
      .filter((cookie): cookie is string => cookie !== undefined)
      .map((cookie) => cookie.split(';')[0])
      .filter((cookie) => cookie && !cookie.includes('=deleted'))
    sessionCookie = cookieValues.join('; ')
    console.log('Successfully logged in to BGG')
  }
}

async function fetchGameFromBGG(bggId: number): Promise<BGGItem | null> {
  // Use old API v1 endpoint format
  const url = `${BGG_API_BASE}/boardgame/${bggId}?stats=1`
  
  console.log(`Fetching game ${bggId} from BGG...`)
  
  const headers: Record<string, string> = { 
    'Accept': 'text/xml, application/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
  
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie
  }
  
  // Try using native fetch
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`BGG API returned ${response.status}: ${response.statusText}`)
  }
  
  const xml = await response.text()
  const parsed = await parseStringPromise(xml)
  
  // API v1 returns boardgames.boardgame instead of items.item
  if (!parsed.boardgames?.boardgame?.[0]) {
    console.log(`Game ${bggId} not found on BGG`)
    return null
  }
  
  return parsed.boardgames.boardgame[0]
}

function extractGameData(item: BGGItem) {
  const primaryName = item.name?.find(n => n.$.type === 'primary')
  
  return {
    bggId: parseInt(item.$.id),
    name: primaryName?.$.value ?? item.name?.[0]?.$.value ?? 'Unknown',
    description: item.description?.[0] ?? null,
    yearPublished: item.yearpublished?.[0]?.$.value 
      ? parseInt(item.yearpublished[0].$.value) 
      : null,
    minPlayers: item.minplayers?.[0]?.$.value 
      ? parseInt(item.minplayers[0].$.value) 
      : null,
    maxPlayers: item.maxplayers?.[0]?.$.value 
      ? parseInt(item.maxplayers[0].$.value) 
      : null,
    playingTime: item.playingtime?.[0]?.$.value 
      ? parseInt(item.playingtime[0].$.value) 
      : null,
    weight: item.statistics?.[0]?.ratings?.[0]?.averageweight?.[0]?.$.value 
      ? parseFloat(item.statistics[0].ratings[0].averageweight[0].$.value) 
      : null,
    image: item.image?.[0] ?? null,
    thumbnail: item.thumbnail?.[0] ?? null
  }
}

function extractLinksFromItem(item: BGGItem) {
  const mechanics: Array<{ bggId: number; name: string }> = []
  const categories: Array<{ bggId: number; name: string }> = []
  
  for (const link of item.link ?? []) {
    if (link.$.type === 'boardgamemechanic') {
      mechanics.push({
        bggId: parseInt(link.$.id),
        name: link.$.value
      })
    } else if (link.$.type === 'boardgamecategory') {
      categories.push({
        bggId: parseInt(link.$.id),
        name: link.$.value
      })
    }
  }
  
  return { mechanics, categories }
}

async function upsertMechanics(mechanics: Array<{ bggId: number; name: string }>) {
  const results: string[] = []
  
  for (const mechanic of mechanics) {
    const { data, error } = await supabase
      .from('game_mechanics')
      .upsert({
        bgg_id: mechanic.bggId,
        name: mechanic.name
      }, {
        onConflict: 'bgg_id'
      })
      .select('id')
      .single()
    
    if (error) {
      console.error(`Error upserting mechanic ${mechanic.name}:`, error)
      continue
    }
    
    results.push(data.id)
  }
  
  return results
}

async function upsertCategories(categories: Array<{ bggId: number; name: string }>) {
  const results: string[] = []
  
  for (const category of categories) {
    const { data, error } = await supabase
      .from('game_categories')
      .upsert({
        bgg_id: category.bggId,
        name: category.name
      }, {
        onConflict: 'bgg_id'
      })
      .select('id')
      .single()
    
    if (error) {
      console.error(`Error upserting category ${category.name}:`, error)
      continue
    }
    
    results.push(data.id)
  }
  
  return results
}

export async function importGame(bggId: number) {
  const item = await fetchGameFromBGG(bggId)
  
  if (!item) {
    return null
  }
  
  const gameData = extractGameData(item)
  const { mechanics, categories } = extractLinksFromItem(item)
  
  console.log(`Importing: ${gameData.name} (${gameData.yearPublished})`)
  
  // Upsert game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .upsert({
      bgg_id: gameData.bggId,
      name: gameData.name,
      description: gameData.description,
      year_published: gameData.yearPublished,
      min_players: gameData.minPlayers,
      max_players: gameData.maxPlayers,
      playing_time: gameData.playingTime,
      weight: gameData.weight,
      image: gameData.image,
      thumbnail: gameData.thumbnail,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'bgg_id'
    })
    .select('id, name')
    .single()
    
  if (gameError || !game) {
    console.error('Failed to upsert game:', gameError)
    return null
  }

  console.log(`Game upserted with ID: ${game.id}`)
  
  // Upsert mechanics and categories
  const mechanicIds = await upsertMechanics(mechanics)
  const categoryIds = await upsertCategories(categories)
  
  // Clear existing joins
  await supabase
    .from('game_mechanic_joins')
    .delete()
    .eq('game_id', game.id)
    
  await supabase
    .from('game_category_joins')
    .delete()
    .eq('game_id', game.id)
  
  // Create new joins
  if (mechanicIds.length > 0) {
    const mechanicJoins = mechanicIds.map(mechanicId => ({
      game_id: game.id,
      mechanic_id: mechanicId
    }))
    
    await supabase
      .from('game_mechanic_joins')
      .insert(mechanicJoins)
      
    console.log(`Linked ${mechanicIds.length} mechanics`)
  }
  
  if (categoryIds.length > 0) {
    const categoryJoins = categoryIds.map(categoryId => ({
      game_id: game.id,
      category_id: categoryId
    }))
    
    await supabase
      .from('game_category_joins')
      .insert(categoryJoins)
      
    console.log(`Linked ${categoryIds.length} categories`)
  }
  
  return game
}

export async function importMultipleGames(bggIds: number[], delayMs = 1000) {
  const results: Array<{ bggId: number; success: boolean; name?: string; error?: string }> = []
  
  for (const bggId of bggIds) {
    try {
      const game = await importGame(bggId)
      results.push({
        bggId,
        success: !!game,
        name: game?.name
      })
    } catch (error) {
      console.error(`Failed to import game ${bggId}:`, error)
      results.push({
        bggId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Rate limiting - BGG has request limits
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return results
}

// CLI execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npx tsx server/scripts/importBGG.ts <bggId> [bggId2] [bggId3] ...')
    console.log('Example: npx tsx server/scripts/importBGG.ts 174430 167791 224517')
    process.exit(1)
  }
  
  const bggIds = args.map(id => parseInt(id)).filter(id => !isNaN(id))
  
  if (bggIds.length === 0) {
    console.error('No valid BGG IDs provided')
    process.exit(1)
  }
  
  // Login to BGG first
  await loginToBGG()
  
  console.log(`\nImporting ${bggIds.length} game(s)...\n`)
  
  const results = await importMultipleGames(bggIds)
  
  console.log('\n--- Import Summary ---')
  for (const result of results) {
    if (result.success) {
      console.log(`✓ ${result.bggId}: ${result.name}`)
    } else {
      console.log(`✗ ${result.bggId}: ${result.error}`)
    }
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`\nImported ${successCount}/${results.length} games`)
}

main().catch((e: Error) => {
  console.error(e)
  process.exit(1)
})
