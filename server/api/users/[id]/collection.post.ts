export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  if (!body.gameId) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Verify game exists
  const game = await prisma.game.findUnique({ where: { id: body.gameId } })
  if (!game) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  const collection = await prisma.collection.upsert({
    where: {
      userId_gameId: {
        userId: id,
        gameId: body.gameId
      }
    },
    update: {
      owned: body.owned ?? true,
      forTrade: body.forTrade ?? false
    },
    create: {
      userId: id,
      gameId: body.gameId,
      owned: body.owned ?? true,
      forTrade: body.forTrade ?? false
    },
    include: {
      game: {
        select: { id: true, name: true, thumbnail: true }
      }
    }
  })

  return { collection }
})
