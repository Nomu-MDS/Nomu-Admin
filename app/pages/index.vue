<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})

const { user } = useUserSession()

const adminCards = [
  {
    title: 'Administration des Utilisateurs',
    description: 'Gérez les comptes, rôles et statuts des utilisateurs',
    icon: 'heroicons:users',
    to: '/users',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/20',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Administration des Intérêts',
    description: 'Gérez les centres d\'intérêt disponibles sur la plateforme',
    icon: 'heroicons:tag',
    to: '/interests',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Gestion des Signalements',
    description: 'Traitez les signalements et modérations utilisateurs',
    icon: 'heroicons:flag',
    to: '/reports',
    color: 'red',
    gradient: 'from-red-500/20 to-red-600/20',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
  },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Tableau de bord" 
      :description="`Bienvenue sur votre espace d'administration, ${user?.name || ''}.`"
    />

    <!-- Cards d'administration -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="card in adminCards"
        :key="card.to"
        :to="card.to"
        class="group bg-[#464640] p-6 rounded-xl shadow-sm border border-[#5D5D58] hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      >
        <div class="flex flex-col h-full">
          <!-- Icône -->
          <div class="flex items-start justify-between mb-4">
            <div :class="['p-3 rounded-lg', card.iconBg, card.borderColor, 'border-2']">
              <Icon :name="card.icon" :class="['w-8 h-8', card.iconColor]" />
            </div>
            <Icon 
              name="heroicons:arrow-right" 
              class="w-5 h-5 text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all duration-300" 
            />
          </div>

          <!-- Contenu -->
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2 group-hover:text-secondary transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ card.description }}
            </p>
          </div>

          <!-- Footer -->
          <div class="mt-4 pt-4 border-t border-[#5D5D58]">
            <span class="text-xs text-gray-500 group-hover:text-secondary/70 transition-colors font-medium uppercase tracking-wider">
              Accéder →
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
