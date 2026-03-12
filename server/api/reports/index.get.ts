import type { ReportFilters, ReportsResponse } from '~/types/report'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  try {
    const query = getQuery(event) as ReportFilters
    const params: Record<string, any> = {}
    if (query.page) params.page = query.page
    if (query.limit) params.limit = query.limit
    if (query.status) params.status = query.status
    if (query.reportedUserId) params.reportedUserId = query.reportedUserId
    if (query.reporterId) params.reporterId = query.reporterId

    const raw = await apiFetch<any>(event, '/admin/reports', { query: params })

    // Sequelize retourne les alias en PascalCase (Reporter, ReportedUser)
    // On normalise en camelCase pour le frontend
    const response: ReportsResponse = {
      ...raw,
      reports: (raw.reports ?? []).map((r: any) => ({
        ...r,
        reporter:     r.reporter     ?? r.Reporter     ?? null,
        reportedUser: r.reportedUser ?? r.ReportedUser  ?? null,
      })),
    }

    return response
  } catch (error: any) {
    console.error('Erreur récupération signalements:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération signalements',
    })
  }
})
