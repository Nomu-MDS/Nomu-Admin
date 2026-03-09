<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})

const { user } = useUserSession()

const adminCards = [
  {
    label: 'Utilisateurs',
    description: 'Comptes, rôles et statuts',
    icon: 'heroicons:users',
    to: '/users',
  },
  {
    label: 'Intérêts',
    description: "Centres d'intérêt de la plateforme",
    icon: 'heroicons:tag',
    to: '/interests',
  },
  {
    label: 'Signalements',
    description: 'Modération et traitements',
    icon: 'heroicons:flag',
    to: '/reports',
  },
]

const reindexing = ref(false)
const reindexResult = ref<{ success: boolean; indexed: number } | null>(null)
const reindexError = ref<string | null>(null)

async function triggerReindex() {
  reindexing.value = true
  reindexResult.value = null
  reindexError.value = null
  try {
    const data = await $fetch<{ success: boolean; indexed: number }>('/api/reindex', { method: 'POST' })
    reindexResult.value = data
  } catch {
    reindexError.value = 'Erreur lors de la réindexation'
  } finally {
    reindexing.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-navy">Tableau de bord</h1>
      <p class="text-navy/50 mt-1 text-sm">Bienvenue, {{ user?.name }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NuxtLink
        v-for="card in adminCards"
        :key="card.to"
        :to="card.to"
        class="group flex items-center gap-4 bg-card border border-navy/10 rounded-xl p-5 hover:border-navy/25 hover:bg-navy/5 transition-all duration-200"
      >
        <div class="p-3 rounded-lg bg-navy/5 border border-navy/10 shrink-0">
          <Icon :name="card.icon" class="w-6 h-6 text-navy" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-navy text-sm">{{ card.label }}</p>
          <p class="text-navy/40 text-xs mt-0.5 truncate">{{ card.description }}</p>
        </div>
        <Icon name="heroicons:chevron-right" class="w-4 h-4 text-navy/20 group-hover:text-navy/60 ml-auto transition-colors shrink-0" />
      </NuxtLink>
    </div>

    <!-- Section maintenance -->
    <div>
      <h2 class="text-sm font-semibold text-navy/50 uppercase tracking-wider mb-3">Maintenance</h2>
      <div class="bg-card border border-navy/10 rounded-xl p-5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-navy/5 border border-navy/10 shrink-0">
            <Icon name="heroicons:magnifying-glass" class="w-6 h-6 text-navy" />
          </div>
          <div>
            <p class="font-semibold text-navy text-sm">Réindexation Meilisearch</p>
            <p class="text-navy/40 text-xs mt-0.5">Reconstruire l'index de recherche depuis la base de données</p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span v-if="reindexResult" class="text-xs text-green-600 font-medium">
            ✓ {{ reindexResult.indexed }} profils indexés
          </span>
          <span v-if="reindexError" class="text-xs text-red-500 font-medium">
            {{ reindexError }}
          </span>
          <button
            :disabled="reindexing"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="triggerReindex"
          >
            <Icon
              :name="reindexing ? 'heroicons:arrow-path' : 'heroicons:arrow-path'"
              class="w-4 h-4"
              :class="{ 'animate-spin': reindexing }"
            />
            {{ reindexing ? 'Réindexation…' : 'Lancer la réindexation' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
