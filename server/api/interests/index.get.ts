export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.apiBase}/interests/admin`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

    return response
  } catch (error: any) {
    console.error('Erreur récupération intérêts:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération intérêts',
    })
  }
})
