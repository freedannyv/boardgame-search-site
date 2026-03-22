export type CollectionCondition = 'new' | 'used'

export interface AddToCollectionInput {
  gameId: string
  addedToCollectionDate?: string
  receivedAsGift?: boolean
  pricePaid?: number | null
  currency?: string | null
  condition?: CollectionCondition
  isComplete?: boolean
  missingComponents?: string | null
  edition?: string | null
  isSleeved?: boolean
  isOrganized?: boolean
  reasonForBuying?: string | null
  receivedFrom?: string | null
}

export interface CollectionItem {
  id: string
  user_id: string
  game_id: string
  added_to_collection_date: string
  received_as_gift: boolean
  price_paid: number | null
  currency: string | null
  condition: CollectionCondition
  is_complete: boolean
  missing_components: string | null
  edition: string | null
  is_sleeved: boolean
  is_organized: boolean
  reason_for_buying: string | null
  received_from: string | null
  created_at: string
  updated_at: string
}

export interface AddToWishlistInput {
  gameId: string
  notes?: string | null
}

export interface WishlistItem {
  id: string
  user_id: string
  game_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export const useUserGames = () => {
  const supabase = useSupabaseClient() as any
  const user = useSupabaseUser()

  const normalizeDate = (input?: string): string => {
    const fallback = new Date().toISOString().split('T')[0]
    return (input || fallback) as string
  }

  const getCurrentUserId = (): string => {
    const userId = user.value?.sub
    console.log('🔍 getCurrentUserId called:', { userId, hasUser: !!user.value, userSub: user.value?.sub })
    if (!userId) {
      throw new Error('No user is currently logged in')
    }
    return userId
  }

  // COLLECTION FUNCTIONS
  const addToCollection = async (input: AddToCollectionInput): Promise<CollectionItem> => {
    const userId = getCurrentUserId()

    console.log('Adding to collection', input)
    
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
          received_from: input.receivedFrom ?? null
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

      return data
    } catch (error) {
      console.log('the whole error', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to add game to collection')
    }
  }

  const removeFromCollection = async (gameId: string): Promise<void> => {
    const userId = getCurrentUserId()

    const { error } = await supabase
      .from('user_collection')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)

    if (error) {
      throw new Error(`Failed to remove game from collection: ${error.message}`)
    }
  }

  const isInCollection = async (gameId: string): Promise<boolean> => {
    const userId = getCurrentUserId()

    const { data, error } = await supabase
      .from('user_collection')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check if game is in collection: ${error.message}`)
    }

    return !!data
  }

  const getCollection = async (): Promise<CollectionItem[]> => {
    console.log('🔍 getCollection called')
    const userId = getCurrentUserId()
    console.log('🔍 Fetching collection for userId:', userId)

    const { data, error } = await supabase
      .from('user_collection')
      .select('*')
      .eq('user_id', userId)
      .order('added_to_collection_date', { ascending: false })

    if (error) {
      console.error('🔍 Error fetching collection:', error)
      throw new Error(`Failed to fetch collection: ${error.message}`)
    }

    console.log('🔍 Collection fetched successfully:', { count: data?.length || 0, items: data })
    return data || []
  }

  const updateCollectionItem = async (gameId: string, updates: Partial<CollectionItem>) => {
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
  const addToWishlist = async (input: AddToWishlistInput): Promise<WishlistItem> => {
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

  const removeFromWishlist = async (gameId: string): Promise<void> => {
    const userId = getCurrentUserId()

    const { error } = await supabase
      .from('user_wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
  }

  const isInWishlist = async (gameId: string): Promise<boolean> => {
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

  const getWishlist = async (): Promise<WishlistItem[]> => {
    console.log('🔍 getWishlist called')
    const userId = getCurrentUserId()
    console.log('🔍 Fetching wishlist for userId:', userId)

    const { data, error } = await supabase
      .from('user_wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🔍 Error fetching wishlist:', error)
      throw new Error(`Failed to fetch wishlist: ${error.message}`)
    }

    console.log('🔍 Wishlist fetched successfully:', { count: data?.length || 0, items: data })
    return data || []
  }

  const moveWishlistToCollection = async (gameId: string, collectionData: AddToCollectionInput): Promise<CollectionItem> => {
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
