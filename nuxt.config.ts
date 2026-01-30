// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    // URL de l'API (côté serveur uniquement pour sécurité)
    apiBase: 'https://nomu.charlesremy.dev',
  },
})