<script setup lang="ts">
// Désactiver le middleware pour la page de login
definePageMeta({
  middleware: [],
  layout: false
})

const { loggedIn, fetch: refreshSession } = useUserSession()

// Redirection si déjà connecté
onMounted(() => {
  if (loggedIn.value) {
    navigateTo('/')
  }
})

const credentials = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

async function login() {
  // Reset erreur
  errorMessage.value = ''
  loading.value = true
  
  try {
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: credentials,
    })

    // Rafraîchir la session côté client
    await refreshSession()
    
    // Redirection vers la page d'accueil
    await navigateTo('/', { replace: true })
  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    
    // Gestion des différents types d'erreurs
    if (error.statusCode === 403) {
      errorMessage.value = 'Accès refusé : vous devez être administrateur'
    } else if (error.statusCode === 401) {
      errorMessage.value = 'Email ou mot de passe incorrect'
    } else if (error.statusCode === 400) {
      errorMessage.value = error.message || 'Données invalides'
    } else {
      errorMessage.value = 'Erreur de connexion. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
    <div class="min-h-screen flex flex-col md:flex-row bg-background">
        <div class="hidden md:flex md:basis-1/2 justify-center items-center p-4">
          <div class="w-full rounded-lg h-full bg-cover bg-top bg-[url(~/assets/images/login-bg.jpg)] relative">
            <div class="absolute top-0 left-6 p-6 text-white flex flex-row gap-4 items-center">
              <img src="/nomu-logo.svg" alt="">
              <span class="w-20 h-1 bg-primary"></span>
            </div>
          </div>
        </div>
        
        <div class="flex-1 md:basis-1/2 flex justify-center items-center p-4">
          <div class="w-3/4 h-full flex flex-col justify-center items-center">
            <div class="md:hidden mb-12 mt-0 flex flex-row gap-4 items-center absolute top-6 left-1/2 -translate-x-1/2">
              <img src="/nomu-logo.svg" alt="" class="h-12 invert">
              <span class="w-12 h-1 bg-secondary"></span>
            </div>
            
            <div class="w-full md:w-3/4 text-white mb-12">
              <h1 class="text-4xl md:text-6xl font-bold mb-3">Connexion</h1>
              <p class="font-light">À l'administration de Nomu</p>
              
              <!-- Message d'erreur -->
              <div v-if="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
                {{ errorMessage }}
              </div>
            </div>
            
            <form @submit.prevent="login" class="flex flex-col gap-4 w-full md:w-3/4 mt-8 max-w-sm md:max-w-full">
              <input
                v-model="credentials.email"
                type="email"
                placeholder="Mail"
                :disabled="loading"
                class="bg-primary-600 p-4 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <input
                v-model="credentials.password"
                type="password"
                placeholder="Mot de passe"
                :disabled="loading"
                class="bg-primary-600 p-4 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <button 
                type="submit" 
                :disabled="!credentials.email || !credentials.password || loading" 
                class="bg-secondary p-4 rounded-md text-black font-bold mt-20 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span v-if="loading" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
                <span v-else>Se connecter</span>
              </button>
            </form>
          </div>
        </div>
    </div>
</template>
