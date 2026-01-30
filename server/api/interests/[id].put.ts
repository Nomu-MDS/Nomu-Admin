export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.apiBase}/interests/admin/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body,
    })

    return response
  } catch (error: any) {
    console.error('Erreur mise à jour intérêt:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur mise à jour intérêt',
    })
  }
})
