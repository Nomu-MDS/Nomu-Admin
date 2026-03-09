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

// Gestion des erreurs OAuth passées en query param
const route = useRoute()
const oauthErrors: Record<string, string> = {
  not_admin:  'Accès refusé : ce compte Google n\'a pas les droits administrateur.',
  inactive:   'Compte désactivé. Contactez un super-administrateur.',
  google:     'Erreur lors de la connexion Google. Veuillez réessayer.',
}
if (route.query.error) {
  errorMessage.value = oauthErrors[route.query.error as string] ?? 'Erreur de connexion.'
}

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
    <div class="min-h-screen flex flex-col md:flex-row">
        <!-- Côté gauche : photo -->
        <div class="hidden md:flex md:basis-1/2 justify-center items-center p-4 bg-background">
          <div class="w-full rounded-lg h-full bg-cover bg-top relative" style="background-image: url('/img/login-bg.jpg')">
            <div class="absolute top-0 left-6 p-6 text-white flex flex-row gap-4 items-center mt-10">
              <img src="/nomu-logo.svg" class="w-[200px] h-auto">
              <span class="w-20 h-1 bg-[#3C3C3B]"></span>
            </div>
          </div>
        </div>
        
        <!-- Côté droit : formulaire -->
        <div class="flex-1 md:basis-1/2 flex justify-center items-center p-8 bg-background">
          <div class="w-full max-w-sm flex flex-col">
            <!-- Logo mobile -->
            <div class="md:hidden mb-10 flex flex-row gap-4 items-center">
              <img src="/nomu-logo.svg" alt="Nomu" class="h-8 w-auto">
            </div>

            <div class="mb-10">
              <h1 class="text-4xl font-bold text-navy mb-2 font-roca">Connexion</h1>
              <p class="text-navy/50">Administration Nomu</p>
            </div>

            <!-- Message d'erreur -->
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/10 border border-red-400/50 rounded-xl text-red-700 text-sm">
              {{ errorMessage }}
            </div>
            
            <form @submit.prevent="login" class="flex flex-col gap-3">
              <input
                v-model="credentials.email"
                type="email"
                placeholder="Adresse e-mail"
                :disabled="loading"
                class="bg-white border border-navy/15 p-4 rounded-xl text-navy placeholder-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <input
                v-model="credentials.password"
                type="password"
                placeholder="Mot de passe"
                :disabled="loading"
                class="bg-white border border-navy/15 p-4 rounded-xl text-navy placeholder-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <button 
                type="submit" 
                :disabled="!credentials.email || !credentials.password || loading" 
                class="bg-navy text-cream p-4 rounded-xl font-semibold mt-4 hover:bg-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

              <!-- Séparateur -->
              <div class="flex items-center gap-3 my-2">
                <span class="flex-1 h-px bg-navy/10"></span>
                <span class="text-navy/30 text-sm">ou</span>
                <span class="flex-1 h-px bg-navy/10"></span>
              </div>

              <!-- Bouton Google -->
              <a
                href="/auth/google"
                class="flex items-center justify-center gap-3 bg-white border border-navy/15 p-4 rounded-xl text-navy font-medium hover:bg-navy/5 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Continuer avec Google
              </a>
            </form>
          </div>
        </div>
    </div>
</template>
