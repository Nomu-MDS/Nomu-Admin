export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface ReportUser {
  id: number
  name: string
  email: string
}

export interface Report {
  id: number
  reason: string
  description?: string
  status: ReportStatus
  created_at: string
  updated_at: string
  reporter: ReportUser | null
  reportedUser: ReportUser | null
}

export interface ReportStats {
  total: number
  pending: number
  reviewed: number
  resolved: number
  dismissed: number
}

export interface ReportsResponse {
  reports: Report[]
  pagination: {
    currentPage: number
    totalPages: number
    totalReports: number
    perPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ReportFilters {
  page?: number
  limit?: number
  status?: ReportStatus | ''
  reportedUserId?: number
  reporterId?: number
}

export interface UpdateReportPayload {
  status: ReportStatus
}
