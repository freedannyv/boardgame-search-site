export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // TODO: Implement with your preferred database client
  throw createError({ statusCode: 501, message: 'Not implemented - Prisma removed' })
})
