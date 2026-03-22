<script setup lang="ts">
const supabase = useSupabaseClient()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validatePassword = () => {
  if (!password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields'
    return false
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return false
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return false
  }
  
  return true
}

const updatePassword = async () => {
  if (!validatePassword()) {
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { error } = await supabase.auth.updateUser({
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  successMessage.value = 'Password updated successfully.'
  loading.value = false

  // Wait a moment to show success message, then redirect
  setTimeout(async () => {
    await navigateTo('/auth')
  }, 1500)
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Choose a new password</h1>

    <input
      v-model="password"
      type="password"
      placeholder="New password"
      class="w-full border rounded px-3 py-2"
      :class="{ 'border-red-500': confirmPassword && password !== confirmPassword }"
    />

    <input
      v-model="confirmPassword"
      type="password"
      placeholder="Confirm new password"
      class="w-full border rounded px-3 py-2"
      :class="{ 'border-red-500': confirmPassword && password !== confirmPassword }"
      @keyup.enter="updatePassword"
    />

    <button
      class="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      :disabled="loading"
      @click="updatePassword"
    >
      {{ loading ? 'Updating...' : 'Update password' }}
    </button>

    <p v-if="successMessage" class="text-green-700">
      {{ successMessage }}
    </p>

    <p v-if="errorMessage" class="text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>