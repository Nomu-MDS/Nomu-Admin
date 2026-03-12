export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  try {
    const response = await apiFetch(event, '/interests/admin')

    return response
  } catch (error: any) {
    console.error('Erreur récupération intérêts:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération intérêts',
    })
  }
})
