<script setup lang="ts">
const supabase = useSupabaseClient()

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const sendResetEmail = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/update`,
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  successMessage.value = 'Password reset email sent.'
  loading.value = false
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Reset password</h1>

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="w-full border rounded px-3 py-2"
    />

    <button
      class="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      :disabled="loading"
      @click="sendResetEmail"
    >
      {{ loading ? 'Sending...' : 'Send reset email' }}
    </button>

    <p v-if="successMessage" class="text-green-700">
      {{ successMessage }}
    </p>

    <p v-if="errorMessage" class="text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>