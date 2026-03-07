export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      mechanics: { include: { mechanic: true } },
      categories: { include: { category: true } },
      ratings: {
        select: {
          rating: true,
          review: true,
          createdAt: true,
          user: { select: { id: true, username: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!game) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  // Calculate average rating
  const avgRating = game.ratings.length > 0
    ? game.ratings.reduce((sum, r) => sum + r.rating, 0) / game.ratings.length
    : null

  return {
    ...game,
    averageRating: avgRating,
    ratingCount: game.ratings.length
  }
})
