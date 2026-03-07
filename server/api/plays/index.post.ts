export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  if (!body.gameId) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
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

  const play = await prisma.play.create({
    data: {
      userId: body.userId,
      gameId: body.gameId,
      playDate: body.playDate ? new Date(body.playDate) : new Date(),
      playerCount: body.playerCount ?? null,
      duration: body.duration ?? null,
      notes: body.notes ?? null
    },
    include: {
      game: { select: { id: true, name: true, thumbnail: true } },
      user: { select: { id: true, username: true } }
    }
  })

  return { play }
})
