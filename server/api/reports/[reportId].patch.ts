import type { Report, UpdateReportPayload } from '~/types/report'

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

  const body = await readBody<UpdateReportPayload>(event)

  // Validation
  if (!body.status) {
    throw createError({
      statusCode: 400,
      message: 'Statut requis',
    })
  }

  if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(body.status)) {
    throw createError({
      statusCode: 400,
      message: 'Statut invalide',
    })
  }

  try {
    const raw = await apiFetch<any>(event, `/admin/reports/${reportId}`, { method: 'PATCH', body })

    const report = raw.report ?? raw
    return {
      ...raw,
      report: {
        ...report,
        reporter:     report.reporter     ?? report.Reporter     ?? null,
        reportedUser: report.reportedUser ?? report.ReportedUser  ?? null,
      },
    }
  } catch (error: any) {
    console.error('Erreur mise à jour signalement:', error)
    
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Signalement non trouvé',
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.error || 'Erreur mise à jour signalement',
    })
  }
})
