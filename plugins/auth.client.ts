export default defineNuxtPlugin(() => {
  const { auth } = useSupabaseClient()
  const collectionStore = useCollectionStore()

  console.log('🔐 Auth plugin initialized')

  // Listen to auth state changes
  auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id })
    
    if (event === 'SIGNED_OUT') {
      console.log('🔐 User signed out - resetting store')
      // User logged out - reset store
      collectionStore.resetUserGames()
    } else if (event === 'SIGNED_IN' && session?.user) {
      console.log('🔐 User signed in - loading user games')
      // User logged in - load fresh data
      collectionStore.loadUserGames(true)
        .then(() => console.log('🔐 User games loaded successfully'))
        .catch((error) => console.error('🔐 Failed to load user games:', error))
    } else if (event === 'INITIAL_SESSION') {
      console.log('🔐 Initial session detected:', { hasSession: !!session, userId: session?.user?.id })
      if (session?.user) {
        console.log('🔐 Loading user games for initial session')
        collectionStore.loadUserGames(true)
          .then(() => console.log('🔐 Initial user games loaded successfully'))
          .catch((error) => console.error('🔐 Failed to load initial user games:', error))
      }
    }
  })
})
