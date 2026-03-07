export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      skip,
      take: limit,
      include: {
        mechanics: { include: { mechanic: true } },
        categories: { include: { category: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.game.count()
  ])

  return {
    games,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
})
