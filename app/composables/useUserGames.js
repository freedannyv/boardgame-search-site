export const useUserGames = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const normalizeDate = (input) => {
    const fallback = new Date().toISOString().split('T')[0]
    return input || fallback
  }

  const getCurrentUserId = () => {
    const userId = user.value?.sub
    if (!userId) {
      throw new Error('No user is currently logged in')
    }
    return userId
  }

  // COLLECTION FUNCTIONS
  const addToCollection = async (input) => {
    const userId = getCurrentUserId()
    
    // Validation: if game is incomplete, missing components must be specified
    if (input.isComplete === false && (!input.missingComponents || input.missingComponents.trim() === '')) {
      throw new Error('Please specify which components are missing when the game is incomplete')
    }
    
    // Auto-set missing_components to null if game is complete
    const processedInput = {
      ...input,
      missingComponents: input.isComplete === true ? null : input.missingComponents
    }

    try {
      // 1. Send request to database
      const { data, error } = await supabase
        .from('user_collection')
        .insert({
          user_id: userId,
          game_id: input.gameId,
          added_to_collection_date: normalizeDate(input.addedToCollectionDate),
          received_as_gift: input.receivedAsGift || false,
          price_paid: input.pricePaid ?? null,
          currency: input.currency ?? null,
          condition: input.condition || 'new',
          is_complete: input.isComplete ?? true,
          missing_components: processedInput.missingComponents ?? null,
          edition: input.edition ?? null,
          is_sleeved: input.isSleeved || false,
          is_organized: input.isOrganized || false,
          reason_for_buying: input.reasonForBuying ?? null,
          received_from: input.receivedFrom ?? null,
          thumbnail: input.thumbnail ?? null,
          image: input.image ?? null,
          name: input.name ?? null
        })
        .select()
        .single()

      if (error) {
        // Check for unique constraint violation (duplicate)
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('This game is already in your collection')
        }
        throw error
      }

      // Return the response data (store will be updated by the store function)
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to add game to collection')
    }
  }

  const removeFromCollection = async (gameId) => {
    const userId = getCurrentUserId()

    try {
      // 1. Send request to database
      const { error } = await supabase
        .from('user_collection')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId)

      if (error) {
        throw new Error(`Failed to remove game from collection: ${error.message}`)
      }
    } catch (error) {
      throw error
    }
  }

  const isInCollection = async (gameId) => {
    // Get the store instance
    const collectionStore = useCollectionStore()
    
    // Check if store has data and if game exists in collection
    if (collectionStore.collection.length === 0) {
      return false
    }
    
    return collectionStore.collection.some(item => item.game_id === gameId)
  }

  const getCollection = async () => {
    const userId = getCurrentUserId()

    const { data, error } = await supabase
      .from('user_collection')
      .select('*')
      .eq('user_id', userId)
      .order('added_to_collection_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch collection: ${error.message}`)
    }

    return data || []
  }

  const updateCollectionItem = async (gameId, updates) => {
    const userId = getCurrentUserId()

    // Validation: if game is incomplete, missing components must be specified
    if (updates.is_complete === false && (!updates.missing_components || updates.missing_components.trim() === '')) {
      throw new Error('Please specify which components are missing when the game is incomplete')
    }
    
    // Auto-set missing_components to null if game is complete
    const processedUpdates = {
      ...updates,
      missing_components: updates.is_complete === true ? null : updates.missing_components
    }

    const { data, error } = await supabase
      .from('user_collection')
      .update(processedUpdates)
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // WISHLIST FUNCTIONS
  const addToWishlist = async (input) => {
    const userId = getCurrentUserId()

    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .insert({
          user_id: userId,
          game_id: input.gameId,
          notes: input.notes ?? null
        })
        .select()
        .single()

      if (error) {
        // Check for unique constraint violation (duplicate)
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('This game is already in your wishlist')
        }
        throw error
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to add game to wishlist')
    }
  }

  const removeFromWishlist = async (gameId) => {
    const userId = getCurrentUserId()

    const { error } = await supabase
      .from('user_wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
  }

  const isInWishlist = async (gameId) => {
    const userId = getCurrentUserId()

    const { data, error } = await supabase
      .from('user_wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check if game is in wishlist: ${error.message}`)
    }

    return !!data
  }

  const getWishlist = async () => {
    const userId = getCurrentUserId()

    const { data, error } = await supabase
      .from('user_wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch wishlist: ${error.message}`)
    }

    return data || []
  }

  const moveWishlistToCollection = async (gameId, collectionData) => {
    const userId = getCurrentUserId()

    // First add to collection and capture the result
    const collectionItem = await addToCollection(collectionData)

    // Then remove from wishlist
    await removeFromWishlist(gameId)

    // Return the newly created collection item
    return collectionItem
  }

  return {
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollection,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlist,
    moveWishlistToCollection,
    updateCollectionItem
  }
}
