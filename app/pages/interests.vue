<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})

interface Interest {
  id: number
  name: string
  icon: string | null
  is_active: boolean
  createdAt?: string
  updatedAt?: string
}

const interests = ref<Interest[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingInterest = ref<Interest | null>(null)
const formData = ref({
  name: '',
  icon: '',
  is_active: true
})
const error = ref('')
const success = ref('')

// Récupérer tous les intérêts
const fetchInterests = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<Interest[]>('/api/interests', {
      method: 'GET'
    })
    interests.value = response
  } catch (err: any) {
    error.value = err.data?.error || 'Erreur lors de la récupération des intérêts'
    console.error('Erreur fetchInterests:', err)
  } finally {
    loading.value = false
  }
}

// Ouvrir le modal pour créer
const openCreateModal = () => {
  editingInterest.value = null
  formData.value = {
    name: '',
    icon: '',
    is_active: true
  }
  error.value = ''
  success.value = ''
  showModal.value = true
}

// Ouvrir le modal pour éditer
const openEditModal = (interest: Interest) => {
  editingInterest.value = interest
  formData.value = {
    name: interest.name,
    icon: interest.icon || '',
    is_active: interest.is_active
  }
  error.value = ''
  success.value = ''
  showModal.value = true
}

// Créer ou mettre à jour un intérêt
const saveInterest = async () => {
  error.value = ''
  success.value = ''
  
  if (!formData.value.name.trim()) {
    error.value = 'Le nom est requis'
    return
  }
  
  loading.value = true
  
  try {
    if (editingInterest.value) {
      // Mise à jour
      await $fetch(`/api/interests/${editingInterest.value.id}`, {
        method: 'PUT',
        body: {
          name: formData.value.name.trim(),
          icon: formData.value.icon || null,
          is_active: formData.value.is_active
        }
      })
      success.value = 'Intérêt mis à jour avec succès'
    } else {
      // Création
      await $fetch('/api/interests', {
        method: 'POST',
        body: {
          name: formData.value.name.trim(),
          icon: formData.value.icon || null,
          is_active: formData.value.is_active
        }
      })
      success.value = 'Intérêt créé avec succès'
    }
    
    showModal.value = false
    await fetchInterests()
  } catch (err: any) {
    error.value = err.data?.error || 'Erreur lors de la sauvegarde'
    console.error('Erreur saveInterest:', err)
  } finally {
    loading.value = false
  }
}

// Supprimer un intérêt
const deleteInterest = async (interest: Interest) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'intérêt "${interest.name}" ?`)) {
    return
  }
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await $fetch(`/api/interests/${interest.id}`, {
      method: 'DELETE'
    })
    success.value = 'Intérêt supprimé avec succès'
    await fetchInterests()
  } catch (err: any) {
    error.value = err.data?.error || 'Erreur lors de la suppression'
    console.error('Erreur deleteInterest:', err)
  } finally {
    loading.value = false
  }
}

// Basculer le statut actif/inactif
const toggleActive = async (interest: Interest) => {
  loading.value = true
  error.value = ''
  
  try {
    await $fetch(`/api/interests/${interest.id}`, {
      method: 'PUT',
      body: {
        is_active: !interest.is_active
      }
    })
    await fetchInterests()
  } catch (err: any) {
    error.value = err.data?.error || 'Erreur lors de la mise à jour'
    console.error('Erreur toggleActive:', err)
  } finally {
    loading.value = false
  }
}

// Charger les intérêts au montage
onMounted(() => {
  fetchInterests()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Intérêts"
      description="Gérez les centres d'intérêt disponibles"
    />
    
    <!-- Messages -->
    <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
      {{ error }}
    </div>
    <div v-if="success" class="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
      {{ success }}
    </div>
    
    <!-- Bouton Ajouter -->
    <div class="flex justify-end">
      <button
        @click="openCreateModal"
        class="bg-[#D4B08C] hover:bg-[#C5A07D] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un intérêt
      </button>
    </div>
    
    <!-- Liste des intérêts -->
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58]">
      <div v-if="loading && interests.length === 0" class="p-8 text-center text-gray-400">
        Chargement...
      </div>
      
      <div v-else-if="interests.length === 0" class="p-8 text-center text-gray-400">
        Aucun intérêt trouvé. Commencez par en créer un.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#5D5D58]">
              <th class="text-left p-4 text-gray-300 font-medium">Nom</th>
              <th class="text-left p-4 text-gray-300 font-medium">Icône</th>
              <th class="text-left p-4 text-gray-300 font-medium">Statut</th>
              <th class="text-right p-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="interest in interests" 
              :key="interest.id"
              class="border-b border-[#5D5D58] hover:bg-[#3E3E39] transition-colors"
            >
              <td class="p-4 text-white">{{ interest.name }}</td>
              <td class="p-4 text-white">
                <span v-if="interest.icon" class="text-2xl">{{ interest.icon }}</span>
                <span v-else class="text-gray-500 text-sm">-</span>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    interest.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  ]"
                >
                  {{ interest.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(interest)"
                    class="p-2 hover:bg-[#5D5D58] rounded-lg transition-colors text-blue-400"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteInterest(interest)"
                    class="p-2 hover:bg-[#5D5D58] rounded-lg transition-colors text-red-400"
                    title="Supprimer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal Créer/Éditer -->
    <div 
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-[#464640] rounded-xl border border-[#5D5D58] p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold text-white mb-4">
          {{ editingInterest ? 'Modifier l\'intérêt' : 'Créer un intérêt' }}
        </h3>
        
        <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm">
          {{ error }}
        </div>
        
        <form @submit.prevent="saveInterest" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Nom *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-[#3E3E39] border border-[#5D5D58] rounded-lg text-white focus:outline-none focus:border-[#D4B08C]"
              placeholder="Ex: Sport, Musique, Cuisine..."
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Icône (emoji)</label>
            <input
              v-model="formData.icon"
              type="text"
              class="w-full px-4 py-2 bg-[#3E3E39] border border-[#5D5D58] rounded-lg text-white focus:outline-none focus:border-[#D4B08C]"
              placeholder="Ex: ⚽ 🎵 🍳"
            />
          </div>
          
          <div class="flex items-center gap-2">
            <input
              v-model="formData.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 rounded border-[#5D5D58] bg-[#3E3E39] text-[#D4B08C] focus:ring-[#D4B08C]"
            />
            <label for="is_active" class="text-gray-300 text-sm">Actif</label>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-4 py-2 bg-[#3E3E39] hover:bg-[#5D5D58] text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-[#D4B08C] hover:bg-[#C5A07D] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
