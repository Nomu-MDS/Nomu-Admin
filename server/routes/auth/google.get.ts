export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { tokens }) {
    const config = useRuntimeConfig()

    // Échanger l'id_token Google contre un token Nomu via le backend
    const response = await $fetch<{
      user: {
        id: number
        name: string
        email: string
        role: string
        is_active: boolean
      }
      token: string
    }>(`${config.apiBase}/auth/google/token`, {
      method: 'POST',
      body: { id_token: tokens.id_token },
    }).catch(() => null)

    if (!response?.user) {
      return sendRedirect(event, '/login?error=google')
    }

    if (!response.user.is_active) {
      return sendRedirect(event, '/login?error=inactive')
    }

    if (response.user.role !== 'admin') {
      return sendRedirect(event, '/login?error=not_admin')
    }

    await setUserSession(event, {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      },
      token: response.token,
    })

    return sendRedirect(event, '/')
  },

  onError(event, error) {
    console.error('[Google OAuth] Erreur:', error)
    return sendRedirect(event, '/login?error=google')
  },
})
