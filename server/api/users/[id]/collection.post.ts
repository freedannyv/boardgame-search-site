export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  if (!body.gameId) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  // TODO: Implement with your preferred database client
  throw createError({ statusCode: 501, message: 'Not implemented - Prisma removed' })
})
