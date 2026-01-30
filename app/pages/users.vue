<script setup lang="ts">
import type { User, UserFilters, UsersResponse } from '~/types/user'

definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})

// État
const users = ref<User[]>([])
const pagination = ref<UsersResponse['pagination'] | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Filtres
const filters = ref<UserFilters>({
  page: 1,
  role: '',
  is_active: '',
  search: '',
})

// Utilisateur sélectionné pour modification
const selectedUser = ref<User | null>(null)
const showEditModal = ref(false)

// Charger les utilisateurs
async function loadUsers() {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (filters.value.page) params.append('page', filters.value.page.toString())
    if (filters.value.role) params.append('role', filters.value.role)
    if (filters.value.is_active) params.append('is_active', filters.value.is_active)
    if (filters.value.search) params.append('search', filters.value.search)

    const data = await $fetch<UsersResponse>(`/api/users?${params.toString()}`)
    users.value = data.users
    pagination.value = data.pagination
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors du chargement des utilisateurs'
    console.error('Erreur chargement utilisateurs:', e)
  } finally {
    loading.value = false
  }
}

// Changer de page
function handlePageChange(newPage: number) {
  filters.value.page = newPage
  loadUsers()
}

// Appliquer les filtres
function applyFilters() {
  filters.value.page = 1
  loadUsers()
}

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    page: 1,
    role: '',
    is_active: '',
    search: '',
  }
  loadUsers()
}

// Ouvrir le modal de modification
function openEditModal(user: User) {
  selectedUser.value = user
  showEditModal.value = true
}

// Fermer le modal
function closeEditModal() {
  showEditModal.value = false
  selectedUser.value = null
}

// Modifier le statut
async function toggleUserStatus(user: User) {
  if (!confirm(`${user.is_active ? 'Désactiver' : 'Activer'} l'utilisateur ${user.name} ?`)) {
    return
  }

  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      body: { is_active: !user.is_active }
    })
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la modification')
  }
}

// Modifier le rôle
async function updateUserRole(userId: number, newRole: 'user' | 'admin' | 'local') {
  try {
    await $fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: { role: newRole }
    })
    closeEditModal()
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la modification du rôle')
  }
}

// Badge de rôle
function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

// Badge de statut
function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? 'bg-green-500/20 text-green-300 border-green-500/30'
    : 'bg-red-500/20 text-red-300 border-red-500/30'
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Chargement initial
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Gestion des Utilisateurs"
      description="Administrez les comptes utilisateurs de la plateforme"
    />

    <!-- Filtres -->
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom ou email..."
            class="w-full px-4 py-2 bg-background border border-[#5D5D58] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- Rôle -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
          <select
            v-model="filters.role"
            class="w-full px-4 py-2 bg-background border border-[#5D5D58] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Statut</label>
          <select
            v-model="filters.is_active"
            class="w-full px-4 py-2 bg-background border border-[#5D5D58] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">Tous</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      <!-- Boutons d'action -->
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

    <!-- Tableau des utilisateurs -->
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-background border-b border-[#5D5D58]">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Solde</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Créé le</th>
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
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold border-2 border-secondary/30">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ user.name }}</div>
                    <div class="text-xs text-gray-400">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', getRoleBadgeClass(user.role)]">
                  {{ user.role.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', getStatusBadgeClass(user.is_active)]">
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.Wallet.balance }} €
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openEditModal(user)"
                  class="text-secondary hover:text-secondary/80 mr-3"
                  title="Modifier le rôle"
                >
                  <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  :class="[
                    'transition-colors',
                    user.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                  ]"
                  :title="user.is_active ? 'Désactiver' : 'Activer'"
                >
                  <Icon :name="user.is_active ? 'heroicons:no-symbol' : 'heroicons:check-circle'" class="w-5 h-5" />
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
          ({{ pagination.totalUsers }} utilisateur{{ pagination.totalUsers > 1 ? 's' : '' }})
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

    <!-- Modal de modification du rôle -->
    <div v-if="showEditModal && selectedUser" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeEditModal"></div>
        
        <div class="relative bg-[#464640] rounded-xl shadow-xl border border-[#5D5D58] p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-white mb-4">Modifier le rôle</h3>
          
          <div class="mb-6">
            <p class="text-gray-300 mb-2">Utilisateur : <span class="font-semibold text-white">{{ selectedUser.name }}</span></p>
            <p class="text-gray-400 text-sm mb-4">{{ selectedUser.email }}</p>
            
            <label class="block text-sm font-medium text-gray-300 mb-2">Nouveau rôle</label>
            <div class="space-y-2">
              <button
                v-for="role in ['user', 'admin']"
                :key="role"
                @click="updateUserRole(selectedUser.id, role as 'user' | 'admin')"
                :class="[
                  'w-full px-4 py-3 rounded-lg border-2 transition-all text-left',
                  selectedUser.role === role
                    ? 'border-secondary bg-secondary/20 text-white'
                    : 'border-[#5D5D58] bg-background text-gray-300 hover:border-secondary/50'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium capitalize">{{ role }}</span>
                  <Icon v-if="selectedUser.role === role" name="heroicons:check-circle" class="w-5 h-5 text-secondary" />
                </div>
              </button>
            </div>
          </div>

          <button
            @click="closeEditModal"
            class="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
