export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit
  const sortBy = query.sortBy as string || 'name'
  const search = query.search as string || ''

  // Build orderBy based on sortBy parameter
  let orderBy: Record<string, 'asc' | 'desc'> = { name: 'asc' }
  if (sortBy === 'rank') orderBy = { rank: 'asc' }
  else if (sortBy === 'rating') orderBy = { average: 'desc' }
  else if (sortBy === 'newest') orderBy = { yearPublished: 'desc' }

  // Build where clause for search
  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {}

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      skip,
      take: limit,
      include: {
        mechanics: { include: { mechanic: true } },
        categories: { include: { category: true } }
      },
      orderBy
    }),
    prisma.game.count({ where })
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
