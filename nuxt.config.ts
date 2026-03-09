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

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Nomu Admin',
      link: [
        // Roca — Adobe Typekit (même kit que Nomu-Web)
        { rel: 'stylesheet', href: 'https://use.typekit.net/jcd0iqo.css' },
        // Poppins — Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'theme-color', content: '#0E224A' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },

  runtimeConfig: {
    // URL de l'API (côté serveur uniquement pour sécurité)
    apiBase: 'https://nomu.charlesremy.dev',
  },
})