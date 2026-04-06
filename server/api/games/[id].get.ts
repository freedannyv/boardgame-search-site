export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Game ID is required' })
  }

  // TODO: Implement with your preferred database client
  throw createError({ statusCode: 501, message: 'Not implemented - Prisma removed' })
})
