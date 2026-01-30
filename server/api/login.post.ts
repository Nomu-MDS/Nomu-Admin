export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validation des entrées
  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      message: 'Email et mot de passe requis',
    })
  }

  const { email, password } = body

  try {
    // Appel à l'API externe
    const config = useRuntimeConfig()
    
    const response = await $fetch<{
      user: {
        id: number
        name: string
        email: string
        role: string
        is_active: boolean
        bio?: string
        location?: string
        createdAt: string
        updatedAt: string
      }
      token: string
    }>(`${config.apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })

    // Vérification du rôle admin
    if (response.user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Accès refusé : rôle administrateur requis',
      })
    }

    // Création de la session sécurisée
    await setUserSession(event, {
      user: {
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      },
      token: response.token,
    })

    return {
      success: true,
      user: {
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      },
    }
  } catch (error: any) {
    // Si c'est déjà une erreur qu'on a créée, la propager
    if (error.statusCode) {
      throw error
    }
    
    // Erreur de l'API externe (mauvais identifiants)
    console.error('Login API error:', error)
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect',
    })
  }
})
