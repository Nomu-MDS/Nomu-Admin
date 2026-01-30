<script setup lang="ts">
import type { Report, ReportFilters, ReportsResponse, ReportStatus, ReportStats } from '~/types/report'

definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})

// État
const reports = ref<Report[]>([])
const stats = ref<ReportStats | null>(null)
const pagination = ref<ReportsResponse['pagination'] | null>(null)
const loading = ref(false)
const loadingStats = ref(false)
const error = ref<string | null>(null)

// Filtres
const filters = ref<ReportFilters>({
  page: 1,
  limit: 25,
  status: '',
})

// Signalement sélectionné
const selectedReport = ref<Report | null>(null)
const showDetailsModal = ref(false)
const showStatusModal = ref(false)

// Charger les statistiques
async function loadStats() {
  loadingStats.value = true
  try {
    stats.value = await $fetch<ReportStats>('/api/reports/stats')
  } catch (e: any) {
    console.error('Erreur chargement statistiques:', e)
  } finally {
    loadingStats.value = false
  }
}

// Charger les signalements
async function loadReports() {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (filters.value.page) params.append('page', filters.value.page.toString())
    if (filters.value.limit) params.append('limit', filters.value.limit.toString())
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.reportedUserId) params.append('reportedUserId', filters.value.reportedUserId.toString())
    if (filters.value.reporterId) params.append('reporterId', filters.value.reporterId.toString())

    const data = await $fetch<ReportsResponse>(`/api/reports?${params.toString()}`)
    reports.value = data.reports
    pagination.value = data.pagination
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors du chargement des signalements'
    console.error('Erreur chargement signalements:', e)
  } finally {
    loading.value = false
  }
}

// Changer de page
function handlePageChange(newPage: number) {
  filters.value.page = newPage
  loadReports()
}

// Appliquer les filtres
function applyFilters() {
  filters.value.page = 1
  loadReports()
}

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    page: 1,
    limit: 25,
    status: '',
  }
  loadReports()
}

// Ouvrir le modal de détails
function openDetailsModal(report: Report) {
  selectedReport.value = report
  showDetailsModal.value = true
}

// Ouvrir le modal de changement de statut
function openStatusModal(report: Report) {
  selectedReport.value = report
  showStatusModal.value = true
}

// Fermer les modals
function closeModals() {
  showDetailsModal.value = false
  showStatusModal.value = false
  selectedReport.value = null
}

// Mettre à jour le statut
async function updateReportStatus(reportId: number, newStatus: ReportStatus) {
  try {
    await $fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    closeModals()
    await Promise.all([loadReports(), loadStats()])
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la mise à jour du statut')
  }
}

// Supprimer un signalement
async function deleteReport(reportId: number) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
    return
  }

  try {
    await $fetch(`/api/reports/${reportId}`, {
      method: 'DELETE'
    })
    closeModals()
    await Promise.all([loadReports(), loadStats()])
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la suppression')
  }
}

// Badge de statut
function getStatusBadgeClass(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'reviewed':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'resolved':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'dismissed':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

// Traduction des statuts
function getStatusLabel(status: ReportStatus) {
  switch (status) {
    case 'pending': return 'En attente'
    case 'reviewed': return 'Examiné'
    case 'resolved': return 'Résolu'
    case 'dismissed': return 'Rejeté'
    default: return status
  }
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Chargement initial
onMounted(() => {
  loadStats()
  loadReports()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Gestion des Signalements"
      description="Modérez et traitez les signalements utilisateurs"
    />

    <!-- Statistiques -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="bg-[#464640] p-4 rounded-xl shadow-sm border border-[#5D5D58]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-400 font-medium text-xs uppercase">Total</h3>
          <Icon name="heroicons:flag" class="w-5 h-5 text-gray-400" />
        </div>
        <div v-if="loadingStats" class="text-xl font-bold text-white">-</div>
        <div v-else class="text-2xl font-bold text-white">{{ stats?.total || 0 }}</div>
      </div>

      <div class="bg-[#464640] p-4 rounded-xl shadow-sm border border-yellow-500/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-yellow-400 font-medium text-xs uppercase">En attente</h3>
          <Icon name="heroicons:clock" class="w-5 h-5 text-yellow-400" />
        </div>
        <div v-if="loadingStats" class="text-xl font-bold text-white">-</div>
        <div v-else class="text-2xl font-bold text-yellow-300">{{ stats?.pending || 0 }}</div>
      </div>

      <div class="bg-[#464640] p-4 rounded-xl shadow-sm border border-blue-500/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-blue-400 font-medium text-xs uppercase">Examinés</h3>
          <Icon name="heroicons:eye" class="w-5 h-5 text-blue-400" />
        </div>
        <div v-if="loadingStats" class="text-xl font-bold text-white">-</div>
        <div v-else class="text-2xl font-bold text-blue-300">{{ stats?.reviewed || 0 }}</div>
      </div>

      <div class="bg-[#464640] p-4 rounded-xl shadow-sm border border-green-500/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-green-400 font-medium text-xs uppercase">Résolus</h3>
          <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400" />
        </div>
        <div v-if="loadingStats" class="text-xl font-bold text-white">-</div>
        <div v-else class="text-2xl font-bold text-green-300">{{ stats?.resolved || 0 }}</div>
      </div>

      <div class="bg-[#464640] p-4 rounded-xl shadow-sm border border-gray-500/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-400 font-medium text-xs uppercase">Rejetés</h3>
          <Icon name="heroicons:x-circle" class="w-5 h-5 text-gray-400" />
        </div>
        <div v-if="loadingStats" class="text-xl font-bold text-white">-</div>
        <div v-else class="text-2xl font-bold text-gray-300">{{ stats?.dismissed || 0 }}</div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Statut</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-2 bg-background border border-[#5D5D58] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examiné</option>
            <option value="resolved">Résolu</option>
            <option value="dismissed">Rejeté</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-secondary text-background font-medium rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Icon name="heroicons:funnel" class="w-4 h-4 inline mr-2" />
          Filtrer
        </button>
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4 inline mr-2" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
      <p class="text-red-300">{{ error }}</p>
    </div>

    <!-- Tableau des signalements -->
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-background border-b border-[#5D5D58]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Signalé par</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Utilisateur signalé</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Raison</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#5D5D58]">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto mb-2" />
                Chargement...
              </td>
            </tr>
            <tr v-else-if="reports.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                Aucun signalement trouvé
              </td>
            </tr>
            <tr v-else v-for="report in reports" :key="report.id" class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                #{{ report.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">{{ report.reporter.name }}</div>
                <div class="text-xs text-gray-400">{{ report.reporter.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">{{ report.reportedUser.name }}</div>
                <div class="text-xs text-gray-400">{{ report.reportedUser.email }}</div>
              </td>
              <td class="px-6 py-4 max-w-xs">
                <div class="text-sm text-gray-300 truncate">{{ report.reason }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', getStatusBadgeClass(report.status)]">
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {{ formatDate(report.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openDetailsModal(report)"
                  class="text-blue-400 hover:text-blue-300 mr-3"
                  title="Voir détails"
                >
                  <Icon name="heroicons:eye" class="w-5 h-5" />
                </button>
                <button
                  @click="openStatusModal(report)"
                  class="text-secondary hover:text-secondary/80 mr-3"
                  title="Modifier le statut"
                >
                  <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                </button>
                <button
                  @click="deleteReport(report.id)"
                  class="text-red-400 hover:text-red-300"
                  title="Supprimer"
                >
                  <Icon name="heroicons:trash" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="px-6 py-4 bg-background border-t border-[#5D5D58] flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Page {{ pagination.currentPage }} sur {{ pagination.totalPages }} 
          ({{ pagination.totalReports }} signalement{{ pagination.totalReports > 1 ? 's' : '' }})
        </div>
        <div class="flex gap-2">
          <button
            @click="handlePageChange(pagination.currentPage - 1)"
            :disabled="!pagination.hasPrevPage"
            class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>
          <button
            @click="handlePageChange(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal détails -->
    <div v-if="showDetailsModal && selectedReport" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModals"></div>
        
        <div class="relative bg-[#464640] rounded-xl shadow-xl border border-[#5D5D58] p-6 max-w-2xl w-full">
          <div class="flex items-start justify-between mb-6">
            <h3 class="text-xl font-bold text-white">Détails du signalement #{{ selectedReport.id }}</h3>
            <button @click="closeModals" class="text-gray-400 hover:text-white">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-400 uppercase">Signalé par</label>
                <div class="mt-1">
                  <p class="text-white font-medium">{{ selectedReport.reporter.name }}</p>
                  <p class="text-sm text-gray-400">{{ selectedReport.reporter.email }}</p>
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase">Utilisateur signalé</label>
                <div class="mt-1">
                  <p class="text-white font-medium">{{ selectedReport.reportedUser.name }}</p>
                  <p class="text-sm text-gray-400">{{ selectedReport.reportedUser.email }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase">Raison</label>
              <p class="mt-1 text-white">{{ selectedReport.reason }}</p>
            </div>

            <div v-if="selectedReport.description">
              <label class="text-xs text-gray-400 uppercase">Description</label>
              <p class="mt-1 text-white whitespace-pre-wrap">{{ selectedReport.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-400 uppercase">Statut</label>
                <div class="mt-1">
                  <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', getStatusBadgeClass(selectedReport.status)]">
                    {{ getStatusLabel(selectedReport.status) }}
                  </span>
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase">Date de création</label>
                <p class="mt-1 text-white">{{ formatDate(selectedReport.created_at) }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              @click="openStatusModal(selectedReport)"
              class="flex-1 px-4 py-2 bg-secondary text-background font-medium rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Modifier le statut
            </button>
            <button
              @click="closeModals"
              class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal changement de statut -->
    <div v-if="showStatusModal && selectedReport" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModals"></div>
        
        <div class="relative bg-[#464640] rounded-xl shadow-xl border border-[#5D5D58] p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-white mb-4">Modifier le statut</h3>
          
          <div class="mb-6">
            <p class="text-gray-300 mb-4">Signalement #{{ selectedReport.id }}</p>
            
            <label class="block text-sm font-medium text-gray-300 mb-2">Nouveau statut</label>
            <div class="space-y-2">
              <button
                v-for="status in ['pending', 'reviewed', 'resolved', 'dismissed']"
                :key="status"
                @click="updateReportStatus(selectedReport.id, status as ReportStatus)"
                :class="[
                  'w-full px-4 py-3 rounded-lg border-2 transition-all text-left',
                  selectedReport.status === status
                    ? 'border-secondary bg-secondary/20 text-white'
                    : 'border-[#5D5D58] bg-background text-gray-300 hover:border-secondary/50'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ getStatusLabel(status as ReportStatus) }}</span>
                  <Icon v-if="selectedReport.status === status" name="heroicons:check-circle" class="w-5 h-5 text-secondary" />
                </div>
              </button>
            </div>
          </div>

          <button
            @click="closeModals"
            class="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
