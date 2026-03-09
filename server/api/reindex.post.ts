export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const config = useRuntimeConfig()

  return $fetch<{ success: boolean; indexed: number }>(`${config.apiBase}/admin/reindex`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  })
})
