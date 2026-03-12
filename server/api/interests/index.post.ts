export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const body = await readBody(event)

  try {
    const response = await apiFetch(event, '/interests/admin', { method: 'POST', body })

    return response
  } catch (error: any) {
    console.error('Erreur création intérêt:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur création intérêt',
    })
  }
})
