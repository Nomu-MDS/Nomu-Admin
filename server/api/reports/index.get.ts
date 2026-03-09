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
    const config = useRuntimeConfig()
    
    // Construction des query params
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.status) params.append('status', query.status)
    if (query.reportedUserId) params.append('reportedUserId', query.reportedUserId.toString())
    if (query.reporterId) params.append('reporterId', query.reporterId.toString())

    const url = `${config.apiBase}/admin/reports${params.toString() ? `?${params.toString()}` : ''}`
    
    const raw = await $fetch<any>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

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
