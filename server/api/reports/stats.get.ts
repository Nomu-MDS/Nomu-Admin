import type { ReportStats } from '~/types/report'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  try {
    const response = await apiFetch<ReportStats>(event, '/admin/reports/stats')

    return response
  } catch (error: any) {
    console.error('Erreur récupération statistiques signalements:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération statistiques',
    })
  }
})
