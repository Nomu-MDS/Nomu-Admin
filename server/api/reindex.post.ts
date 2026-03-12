export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  return apiFetch<{ success: boolean; indexed: number }>(event, '/admin/reindex', { method: 'POST' })
})
