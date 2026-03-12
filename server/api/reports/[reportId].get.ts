import type { Report } from '~/types/report'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const reportId = getRouterParam(event, 'reportId')

  if (!reportId) {
    throw createError({
      statusCode: 400,
      message: 'ID signalement requis',
    })
  }

  try {
    const raw = await apiFetch<any>(event, `/admin/reports/${reportId}`)

    const response: Report = {
      ...raw,
      reporter:     raw.reporter     ?? raw.Reporter     ?? null,
      reportedUser: raw.reportedUser ?? raw.ReportedUser  ?? null,
    }

    return response
  } catch (error: any) {
    console.error('Erreur récupération signalement:', error)
    
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Signalement non trouvé',
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur récupération signalement',
    })
  }
})
