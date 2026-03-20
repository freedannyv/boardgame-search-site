<script setup lang="ts">
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMessage = ref('')

const signInWithGoogle = async () => {
  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1>Login</h1>

    <button @click="signInWithGoogle" :disabled="loading">
      {{ loading ? 'Redirecting...' : 'Continue with Google' }}
    </button>

    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>