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
    const response = await apiFetch<{ message: string; deletedUserId: number }>(
      event,
      `/admin/users/${id}`,
      { method: 'DELETE' },
    )
    return response
  } catch (error: any) {
    console.error('Erreur suppression utilisateur:', error)

    if (error.status === 404) {
      throw createError({ statusCode: 404, message: 'Utilisateur non trouvé' })
    }
    if (error.status === 403) {
      throw createError({ statusCode: 403, message: error.data?.error || 'Opération interdite' })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur suppression utilisateur',
    })
  }
})
