export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const start = (page - 1) * limit
  const sortBy = query.sortBy as string || 'name'
  const search = query.q as string || ''
  
  // Filter params
  const playerCount = query.playerCount ? Number(query.playerCount) : null
  const minRating = query.minRating ? Number(query.minRating) : null
  const playTime = query.playTime as string || null

  // Create Supabase client manually for server-side
  const config = useRuntimeConfig(event)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: false
      }
    }
  )

  // Build query
  let queryBuilder = supabase
    .from('games')
    .select(`
      *,
      game_mechanic_joins(
        game_mechanics(id, bgg_id, name)
      ),
      game_category_joins(
        game_categories(id, bgg_id, name)
      )
    `, { count: 'exact' })

  // Apply search filter
  if (search) {
    queryBuilder = queryBuilder.ilike('name', `%${search}%`)
  }
  
  // Apply player count filter
  if (playerCount) {
    queryBuilder = queryBuilder
      .lte('min_players', playerCount)
      .gte('max_players', playerCount)
  }
  
  // Apply rating filter
  if (minRating && minRating > 0) {
    queryBuilder = queryBuilder.gte('average', minRating)
  }
  
  // Apply play time filter
  if (playTime) {
    if (playTime === '< 30 min') queryBuilder = queryBuilder.lt('playing_time', 30)
    else if (playTime === '30-60 min') queryBuilder = queryBuilder.gte('playing_time', 30).lte('playing_time', 60)
    else if (playTime === '1-2 hours') queryBuilder = queryBuilder.gte('playing_time', 60).lte('playing_time', 120)
    else if (playTime === '2+ hours') queryBuilder = queryBuilder.gt('playing_time', 120)
  }

  // Apply sorting
  if (sortBy === 'rank') queryBuilder = queryBuilder.order('rank', { ascending: true })
  else if (sortBy === 'rating') queryBuilder = queryBuilder.order('average', { ascending: false })
  else if (sortBy === 'newest') queryBuilder = queryBuilder.order('year_published', { ascending: false })
  else queryBuilder = queryBuilder.order('name', { ascending: true })

  // Apply pagination
  queryBuilder = queryBuilder.range(start, start + limit - 1)

  const { data: games, error, count } = await queryBuilder

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch games',
      data: error
    })
  }

  const totalResults = count || 0
  const totalPages = Math.ceil(totalResults / limit)
  const nextPage = page < totalPages ? page + 1 : null

  return {
    games: games || [],
    totalResults,
    nextPage,
    currentPage: page,
    totalPages
  }
})
