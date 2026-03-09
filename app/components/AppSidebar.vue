<script setup lang="ts">
const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
  (e: 'close-mobile'): void
}>()

const { user, clear } = useUserSession()
const route = useRoute()

const navigation = computed(() => [
  { name: 'Tableau de bord', to: '/', icon: 'heroicons:home', current: route.path === '/' },
  { name: 'Utilisateurs', to: '/users', icon: 'heroicons:users', current: route.path.startsWith('/users') },
  { name: 'Intérêts', to: '/interests', icon: 'heroicons:tag', current: route.path.startsWith('/interests') },
  { name: 'Signalements', to: '/reports', icon: 'heroicons:flag', current: route.path.startsWith('/reports') },
])

async function logout() {
  try {
    await $fetch('/api/logout', { method: 'POST' })
    await clear()
    await navigateTo('/login', { replace: true })
  } catch (error) {
    console.error('Logout error:', error)
    await clear()
    window.location.href = '/login'
  }
}

function toggleSidebar() {
  emit('update:collapsed', !props.collapsed)
}

function closeMobileMenu() {
  emit('close-mobile')
}
</script>

<template>
  <aside 
    class="fixed lg:static inset-y-0 left-0 z-50 bg-sidebar border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-none"
    :class="[
      collapsed ? 'lg:w-20' : 'lg:w-64',
      mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Header / Logo -->
    <div class="p-6 border-b border-white/10 bg-sidebar relative flex flex-col items-center">
      <!-- Top Row: Logo & Toggle -->
      <div class="flex items-center w-full" :class="collapsed ? 'justify-center' : 'justify-between'">
        <!-- Logo étendu -->
        <img v-if="!collapsed" src="/nomu-logo-cream.svg" alt="Nomu" class="h-8 w-auto flex-shrink-0" />
        <!-- Favicon en mode replié -->
        <img v-else src="/favicon.ico" alt="Nomu" class="h-8 w-8 flex-shrink-0 object-contain" />
        
        <!-- Toggle Button (Desktop Only) -->
        <button 
          @click="toggleSidebar"
          class="hidden lg:flex items-center justify-center p-1.5 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-lg ml-2"
          v-if="!collapsed"
        >
          <Icon name="heroicons:chevron-double-left" class="w-5 h-5" />
        </button>
      </div>

      <!-- Collapsed button (Centered if collapsed) -->
      <button 
        @click="toggleSidebar"
        class="hidden lg:flex items-center justify-center p-1.5 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-lg mt-4"
        v-if="collapsed"
      >
        <Icon name="heroicons:chevron-double-right" class="w-5 h-5" />
      </button>

      <!-- Mobile Close Button -->
      <button @click="closeMobileMenu" class="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-white/10 text-gray-400">
        <Icon name="heroicons:x-mark" class="w-6 h-6" />
      </button>

      <!-- User Info (Below Logo) -->
      <div 
        :class="['mt-6 text-center transition-all duration-300 overflow-hidden', collapsed ? 'lg:h-0 opacity-0' : 'h-auto opacity-100']"
      >
        <div class="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-2 text-secondary text-2xl font-bold border-2 border-secondary/30">
          {{ user?.name?.charAt(0).toUpperCase() || 'A' }}
        </div>
        <p class="font-bold text-white truncate text-lg">{{ user?.name }}</p>
        <p class="text-xs text-gray-400 truncate uppercase tracking-widest">{{ user?.role }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative"
        :class="[
          item.current 
            ? 'bg-secondary text-navy font-bold' 
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
        ]"
        :title="collapsed ? item.name : ''"
      >
        <Icon 
          :name="item.icon" 
          class="w-6 h-6 flex-shrink-0 transition-colors duration-200"
          :class="item.current ? 'text-navy' : 'text-gray-400 group-hover:text-white'"
        />
        <span 
          :class="[
            'ml-3 whitespace-nowrap transition-all duration-300',
            collapsed ? 'lg:opacity-0 lg:w-0 hidden lg:block' : 'opacity-100'
          ]"
        >
          {{ item.name }}
        </span>

        <!-- Active Indicator for Collapsed State -->
        <div v-if="item.current && collapsed" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full lg:block hidden"></div>
      </NuxtLink>
    </nav>

    <!-- Footer / Logout -->
    <div class="p-4 border-t border-white/10 bg-sidebar">
      <button
        @click="logout"
        class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors group relative"
        :title="collapsed ? 'Déconnexion' : ''"
      >
        <Icon name="heroicons:arrow-left-on-rectangle" class="w-6 h-6 flex-shrink-0" />
        <span 
          :class="[
            'ml-3 whitespace-nowrap transition-all duration-300',
            collapsed ? 'lg:opacity-0 lg:w-0 hidden lg:block' : 'opacity-100'
          ]"
        >
          Déconnexion
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 4px;
}
</style>
