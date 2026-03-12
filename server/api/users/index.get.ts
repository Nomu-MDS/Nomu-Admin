import type { UserFilters, UsersResponse } from '~/types/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  try {
    const query = getQuery(event) as UserFilters
    const params: Record<string, any> = {}
    if (query.page) params.page = query.page
    if (query.role) params.role = query.role
    if (query.is_active) params.is_active = query.is_active
    if (query.search) params.search = query.search

    const response = await apiFetch<UsersResponse>(event, '/admin/users', { query: params })

    return response
  } catch (error: any) {
    console.error('Erreur récupération utilisateurs:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération utilisateurs',
    })
  }
})
