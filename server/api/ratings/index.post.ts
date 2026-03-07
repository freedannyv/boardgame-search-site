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

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: body.userId } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Verify game exists
  const game = await prisma.game.findUnique({ where: { id: body.gameId } })
  if (!game) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  // Check play count requirement
  const playCount = await prisma.play.count({
    where: {
      userId: body.userId,
      gameId: body.gameId
    }
  })

  if (playCount < MIN_PLAYS_REQUIRED) {
    throw createError({
      statusCode: 400,
      message: `You must log at least ${MIN_PLAYS_REQUIRED} plays before rating this game. Current plays: ${playCount}`
    })
  }

  const gameRating = await prisma.gameRating.upsert({
    where: {
      userId_gameId: {
        userId: body.userId,
        gameId: body.gameId
      }
    },
    update: {
      rating,
      review: body.review ?? null
    },
    create: {
      userId: body.userId,
      gameId: body.gameId,
      rating,
      review: body.review ?? null
    },
    include: {
      game: { select: { id: true, name: true } },
      user: { select: { id: true, username: true } }
    }
  })

  return { rating: gameRating }
})
