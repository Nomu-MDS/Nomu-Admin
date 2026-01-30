import type { User } from '~/types/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID utilisateur requis',
    })
  }

  try {
    const config = useRuntimeConfig()
    const response = await $fetch<User>(`${config.apiBase}/admin/users/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

    return response
  } catch (error: any) {
    console.error('Erreur récupération utilisateur:', error)
    
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Utilisateur non trouvé',
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération utilisateur',
    })
  }
})
