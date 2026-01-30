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
    const config = useRuntimeConfig()
    
    // Construction des query params
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.role) params.append('role', query.role)
    if (query.is_active) params.append('is_active', query.is_active)
    if (query.search) params.append('search', query.search)

    const url = `${config.apiBase}/admin/users${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await $fetch<UsersResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

    return response
  } catch (error: any) {
    console.error('Erreur récupération utilisateurs:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération utilisateurs',
    })
  }
})
