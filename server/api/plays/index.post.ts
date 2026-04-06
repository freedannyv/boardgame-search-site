export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  if (!body.gameId) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  // TODO: Implement with your preferred database client
  throw createError({ statusCode: 501, message: 'Not implemented - Prisma removed' })
})
