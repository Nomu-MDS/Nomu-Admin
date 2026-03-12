import type { User, UpdateUserPayload } from '~/types/user'

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

  const body = await readBody<UpdateUserPayload>(event)

  // Validation
  if (!body.is_active && body.is_active !== false && !body.role) {
    throw createError({
      statusCode: 400,
      message: 'Au moins un champ (is_active ou role) est requis',
    })
  }

  if (body.role && !['user', 'admin'].includes(body.role)) {
    throw createError({
      statusCode: 400,
      message: 'Rôle invalide',
    })
  }

  try {
    const response = await apiFetch<User>(event, `/admin/users/${id}`, { method: 'PUT', body })

    return response
  } catch (error: any) {
    console.error('Erreur modification utilisateur:', error)
    
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Utilisateur non trouvé',
      })
    }

    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        message: error.data?.error || 'Opération interdite',
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur modification utilisateur',
    })
  }
})
