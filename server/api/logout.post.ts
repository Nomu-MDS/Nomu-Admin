export default defineEventHandler(async (event) => {
  // Récupérer la session avant de la supprimer (pour logging si nécessaire)
  const session = await getUserSession(event)
  
  // Supprimer complètement la session
  await clearUserSession(event)
  
  return {
    loggedOut: true,
  }
})
