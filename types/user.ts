export interface UserProfile {
  id: number
  is_searchable: boolean
  biography: string | null
  country?: string
  city?: string
  created_at?: string
  updated_at?: string
}

export interface UserWallet {
  id: number
  balance: number
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  is_active: boolean
  bio: string | null
  location: string | null
  created_at: string
  updated_at: string
  Profile: UserProfile
  Wallet: UserWallet
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalUsers: number
  perPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface UsersResponse {
  users: User[]
  pagination: PaginationInfo
}

export interface UserFilters {
  page?: number
  role?: 'user' | 'admin' | ''
  is_active?: 'true' | 'false' | ''
  search?: string
}

export interface UpdateUserPayload {
  is_active?: boolean
  role?: 'user' | 'admin'
}
