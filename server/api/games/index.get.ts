export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit
  const sortBy = query.sortBy as string || 'name'
  const search = query.q as string || ''
  
  // Filter params
  const playerCount = query.playerCount ? Number(query.playerCount) : null
  const minRating = query.minRating ? Number(query.minRating) : null
  const playTime = query.playTime as string || null

  // Build orderBy based on sortBy parameter
  let orderBy: Record<string, 'asc' | 'desc'> = { name: 'asc' }
  if (sortBy === 'rank') orderBy = { rank: 'asc' }
  else if (sortBy === 'rating') orderBy = { average: 'desc' }
  else if (sortBy === 'newest') orderBy = { yearPublished: 'desc' }

  // Build where clause for search and filters
  const where: Record<string, any> = {}
  
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  
  if (playerCount) {
    where.minPlayers = { lte: playerCount }
    where.maxPlayers = { gte: playerCount }
  }
  
  if (minRating && minRating > 0) {
    where.average = { gte: minRating }
  }
  
  if (playTime) {
    if (playTime === '< 30 min') where.playingTime = { lt: 30 }
    else if (playTime === '30-60 min') where.playingTime = { gte: 30, lte: 60 }
    else if (playTime === '1-2 hours') where.playingTime = { gte: 60, lte: 120 }
    else if (playTime === '2+ hours') where.playingTime = { gt: 120 }
  }

  const [games, totalResults] = await Promise.all([
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

  const totalPages = Math.ceil(totalResults / limit)
  const nextPage = page < totalPages ? page + 1 : null

  return {
    games,
    totalResults,
    nextPage,
    currentPage: page,
    totalPages
  }
})
