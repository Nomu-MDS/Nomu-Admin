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

    const raw = await apiFetch<UsersResponse>(event, '/admin/users', { query: params })

    // Sequelize peut retourner createdAt/updatedAt en camelCase selon la config du modèle
    const response: UsersResponse = {
      ...raw,
      users: (raw.users ?? []).map((u: any) => ({
        ...u,
        created_at: u.created_at ?? u.createdAt ?? null,
        updated_at: u.updated_at ?? u.updatedAt ?? null,
      })),
    }

    return response
  } catch (error: any) {
    console.error('Erreur récupération utilisateurs:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération utilisateurs',
    })
  }
})
