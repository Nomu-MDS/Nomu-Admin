export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user } = useUserSession()

  // Vérification de la connexion
  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  // Vérification stricte du rôle admin
  if (!user.value || user.value.role !== 'admin') {
    console.warn('Tentative d\'accès non autorisé:', user.value)
    return navigateTo('/unauthorized')
  }
})
