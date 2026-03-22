import type { Database } from '~/types/database.types'

export const useProfile = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  const ensureProfile = async () => {
    const userId = user.value?.sub

    if (!userId) {
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error checking profile:', error)
      return
    }

    if (!data) {
      const { data: authUserData, error: authUserError } = await supabase.auth.getUser()

      if (authUserError) {
        console.error('Error fetching auth user:', authUserError)
        return
      }

      const authUser = authUserData.user

      const payload = {
        id: userId,
        username: null,
        display_name: authUser?.user_metadata?.full_name ?? null,
        avatar_url: authUser?.user_metadata?.avatar_url ?? null,
        currency: 'USD',
      }

      console.log('insert payload:', payload)

      const { data: insertedData, error: insertError } = await supabase
        .from('profiles')
        .insert(payload)
        .select()
        .single()

      console.log('insertedData:', insertedData)
      console.log('insertError:', insertError)

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return
      }
    } else {
      console.log('Profile already exists')
    }
  }

  return { ensureProfile }
}