const MIN_PLAYS_REQUIRED = 3

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  if (!body.gameId) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  if (body.rating === undefined || body.rating === null) {
    throw createError({ statusCode: 400, message: 'Rating is required' })
  }

  const rating = Number(body.rating)
  if (isNaN(rating) || rating < 1 || rating > 10) {
    throw createError({ statusCode: 400, message: 'Rating must be between 1 and 10' })
  }

  // Create Supabase client
  const config = useRuntimeConfig(event)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  // Verify user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', body.userId)
    .single()

  if (userError || !user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Verify game exists
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id')
    .eq('id', body.gameId)
    .single()

  if (gameError || !game) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  // Check play count requirement
  const { data: plays, error: playsError } = await supabase
    .from('plays')
    .select('id')
    .eq('user_id', body.userId)
    .eq('game_id', body.gameId)

  if (playsError) {
    throw createError({ statusCode: 500, message: 'Failed to check plays' })
  }

  const playCount = plays?.length || 0

  if (playCount < MIN_PLAYS_REQUIRED) {
    throw createError({
      statusCode: 400,
      message: `You must log at least ${MIN_PLAYS_REQUIRED} plays before rating this game. Current plays: ${playCount}`
    })
  }

  // Create or update rating
  const { data: gameRating, error: ratingError } = await supabase
    .from('game_ratings')
    .upsert({
      user_id: body.userId,
      game_id: body.gameId,
      rating,
      review: body.review ?? null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,game_id'
    })
    .select(`
      *,
      games(id, name),
      users(id, username)
    `)
    .single()

  if (ratingError) {
    throw createError({ statusCode: 500, message: 'Failed to save rating', data: ratingError })
  }

  return { rating: gameRating }
})
