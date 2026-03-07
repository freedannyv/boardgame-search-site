export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const [plays, total] = await Promise.all([
    prisma.play.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        game: {
          select: { id: true, name: true, thumbnail: true }
        }
      },
      orderBy: { playDate: 'desc' }
    }),
    prisma.play.count({ where: { userId } })
  ])

  return {
    plays,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
})
