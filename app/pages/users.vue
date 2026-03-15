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

// Suppression
const userToDelete = ref<User | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

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

// Supprimer un utilisateur
function openDeleteModal(user: User) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function confirmDelete() {
  if (!userToDelete.value || deleting.value) return
  deleting.value = true
  try {
    await $fetch(`/api/users/${userToDelete.value.id}`, { method: 'DELETE' })
    closeDeleteModal()
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

// Badge de rôle
function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-navy/60 border-gray-500/30'
  }
}

// Badge de statut
function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? 'bg-green-500/20 text-green-300 border-green-500/30'
    : 'bg-red-500/20 text-red-300 border-red-500/30'
}

// Format date
function formatDate(date: string | null | undefined) {
  if (!date) return '-'
  const normalized = date.replace(' ', 'T').replace(/\+00$/, '+00:00')
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function resolveAvatar(imageUrl: string | null | undefined, userId: number): string {
  if (!imageUrl) return `https://i.pravatar.cc/500?img=${(userId % 70) + 1}`
  return imageUrl
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
    <div class="bg-card rounded-xl shadow-sm border border-navy/15 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-navy/60 mb-2">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom ou email..."
            class="w-full px-4 py-2 bg-card border border-navy/15 rounded-lg text-navy placeholder-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/30"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- Rôle -->
        <div>
          <label class="block text-sm font-medium text-navy/60 mb-2">Rôle</label>
          <select
            v-model="filters.role"
            class="w-full px-4 py-2 bg-card border border-navy/15 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
          >
            <option value="">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-navy/60 mb-2">Statut</label>
          <select
            v-model="filters.is_active"
            class="w-full px-4 py-2 bg-card border border-navy/15 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
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
          class="px-4 py-2 bg-navy text-cream font-medium rounded-lg hover:bg-navy/90 transition-colors"
        >
          <Icon name="heroicons:funnel" class="w-4 h-4 inline mr-2" />
          Filtrer
        </button>
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-navy/10 text-navy font-medium rounded-lg hover:bg-navy/20 transition-colors"
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
    <div class="bg-card rounded-xl shadow-sm border border-navy/15 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-card border-b border-navy/15">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">Créé le</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-navy/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-navy/15">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-navy/50">
                <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto mb-2" />
                Chargement...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-navy/50">
                Aucun utilisateur trouvé
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="hover:bg-navy/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full shrink-0 border-2 border-navy/20 overflow-hidden bg-navy/10 flex items-center justify-center">
                    <img
                      :src="resolveAvatar(user.Profile?.image_url, user.id)"
                      :alt="user.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-navy">{{ user.name }}</div>
                    <div class="text-xs text-navy/50">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-navy/60">
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-navy/50">
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
                    'transition-colors mr-3',
                    user.is_active ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'
                  ]"
                  :title="user.is_active ? 'Désactiver' : 'Activer'"
                >
                  <Icon :name="user.is_active ? 'heroicons:no-symbol' : 'heroicons:check-circle'" class="w-5 h-5" />
                </button>
                <button
                  @click="openDeleteModal(user)"
                  class="text-red-400 hover:text-red-300 transition-colors"
                  title="Supprimer définitivement"
                >
                  <Icon name="heroicons:trash" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="px-6 py-4 bg-card border-t border-navy/15 flex items-center justify-between">
        <div class="text-sm text-navy/50">
          Page {{ pagination.currentPage }} sur {{ pagination.totalPages }} 
          ({{ pagination.totalUsers }} utilisateur{{ pagination.totalUsers > 1 ? 's' : '' }})
        </div>
        <div class="flex gap-2">
          <button
            @click="handlePageChange(pagination.currentPage - 1)"
            :disabled="!pagination.hasPrevPage"
            class="px-4 py-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>
          <button
            @click="handlePageChange(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="px-4 py-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal && userToDelete" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-navy/50 backdrop-blur-sm" @click="closeDeleteModal"></div>

        <div class="relative bg-card rounded-xl shadow-xl border border-red-500/30 p-6 max-w-lg w-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-400" />
            </div>
            <h3 class="text-xl font-bold text-navy">Supprimer l'utilisateur</h3>
          </div>

          <div class="mb-6 space-y-3">
            <div class="flex items-center gap-3 p-3 bg-navy/5 rounded-lg">
              <img
                :src="resolveAvatar(userToDelete.Profile?.image_url, userToDelete.id)"
                :alt="userToDelete.name"
                class="w-10 h-10 rounded-full object-cover border border-navy/20"
              />
              <div>
                <p class="font-semibold text-navy text-sm">{{ userToDelete.name }}</p>
                <p class="text-navy/50 text-xs">{{ userToDelete.email }}</p>
              </div>
            </div>

            <p class="text-sm text-navy/70">Cette action est <strong class="text-red-400">irréversible</strong>. Elle supprimera :</p>
            <ul class="text-sm text-navy/60 space-y-1 list-none">
              <li class="flex items-center gap-2"><Icon name="heroicons:x-circle" class="w-4 h-4 text-red-400 shrink-0" />Profil, photo et index de recherche</li>
              <li class="flex items-center gap-2"><Icon name="heroicons:x-circle" class="w-4 h-4 text-red-400 shrink-0" />Toutes les conversations et messages</li>
              <li class="flex items-center gap-2"><Icon name="heroicons:x-circle" class="w-4 h-4 text-red-400 shrink-0" />Réservations, signalements et wallet</li>
            </ul>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeDeleteModal"
              :disabled="deleting"
              class="flex-1 px-4 py-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium"
            >
              <Icon v-if="deleting" name="svg-spinners:ring-resize" class="w-4 h-4 inline mr-2" />
              {{ deleting ? 'Suppression…' : 'Supprimer définitivement' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification du rôle -->
    <div v-if="showEditModal && selectedUser" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-navy/50 backdrop-blur-sm" @click="closeEditModal"></div>
        
        <div class="relative bg-card rounded-xl shadow-xl border border-navy/15 p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-navy mb-4">Modifier le rôle</h3>
          
          <div class="mb-6">
            <p class="text-navy/60 mb-2">Utilisateur : <span class="font-semibold text-navy">{{ selectedUser.name }}</span></p>
            <p class="text-navy/50 text-sm mb-4">{{ selectedUser.email }}</p>
            
            <label class="block text-sm font-medium text-navy/60 mb-2">Nouveau rôle</label>
            <div class="space-y-2">
              <button
                v-for="role in ['user', 'admin']"
                :key="role"
                @click="updateUserRole(selectedUser.id, role as 'user' | 'admin')"
                :class="[
                  'w-full px-4 py-3 rounded-lg border-2 transition-all text-left',
                  selectedUser.role === role
                    ? 'border-secondary bg-navy/10 text-navy'
                    : 'border-navy/15 bg-card text-navy/60 hover:border-secondary/50'
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
            class="w-full px-4 py-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
