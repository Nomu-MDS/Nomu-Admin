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
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.apiBase}/interests/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body,
    })

    return response
  } catch (error: any) {
    console.error('Erreur création intérêt:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur création intérêt',
    })
  }
})
