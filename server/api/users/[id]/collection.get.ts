export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const collection = await prisma.collection.findMany({
    where: { userId: id },
    include: {
      game: {
        select: {
          id: true,
          name: true,
          yearPublished: true,
          thumbnail: true,
          minPlayers: true,
          maxPlayers: true,
          playingTime: true
        }
      }
    },
    orderBy: { game: { name: 'asc' } }
  })

  return { collection }
})
