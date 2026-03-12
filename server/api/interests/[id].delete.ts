export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const id = getRouterParam(event, 'id')

  try {
    const response = await apiFetch(event, `/interests/admin/${id}`, { method: 'DELETE' })

    return response
  } catch (error: any) {
    console.error('Erreur suppression intérêt:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur suppression intérêt',
    })
  }
})
