import type { H3Event } from 'h3'

type FetchOptions = Omit<Parameters<typeof $fetch>[1], 'headers'> & {
  extraHeaders?: Record<string, string>
}

export async function apiFetch<T = any>(
  event: H3Event,
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const session = await getUserSession(event)
  const { extraHeaders, ...fetchOptions } = options

  const doFetch = (token: string) =>
    $fetch<T>(`${config.apiBase}${path}`, {
      ...fetchOptions,
      headers: {
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      },
    })

  try {
    return await doFetch(session.token as string)
  } catch (error: any) {
    if (error.status === 401 && (session as any).refreshToken) {
      try {
        const refreshed = await $fetch<{ token: string; refreshToken: string }>(
          `${config.apiBase}/auth/refresh`,
          {
            method: 'POST',
            body: { refreshToken: (session as any).refreshToken },
          }
        )
        await setUserSession(event, {
          ...session,
          token: refreshed.token,
          refreshToken: refreshed.refreshToken,
        })
        return await doFetch(refreshed.token)
      } catch {
        await clearUserSession(event)
        throw createError({ statusCode: 401, message: 'Session expirée' })
      }
    }
    throw error
  }
}
