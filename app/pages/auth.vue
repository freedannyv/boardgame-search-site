<script setup lang="ts">
const supabase = useSupabaseClient()

const mode = ref<'login' | 'signup'>('login')

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const signIn = async () => {
  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  await navigateTo('/')
}

const validateSignUp = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
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

const signUp = async () => {
  if (!validateSignUp()) {
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/confirm`,
    },
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  successMessage.value = 'Check your email to confirm your account.'
  loading.value = false
}

const signInWithGoogle = async () => {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
  }

  return { data, error }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6">
    
    <!-- Tabs -->
    <div class="flex mb-6 border-b">
      <button
        class="flex-1 py-2"
        :class="mode === 'login' ? 'border-b-2 border-black font-bold' : ''"
        @click="mode = 'login'"
      >
        Login
      </button>

      <button
        class="flex-1 py-2"
        :class="mode === 'signup' ? 'border-b-2 border-black font-bold' : ''"
        @click="mode = 'signup'"
      >
        Sign Up
      </button>
    </div>

    <!-- Email Form -->
    <div class="space-y-3">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full border rounded px-3 py-2"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full border rounded px-3 py-2"
        :class="{ 'border-red-500': mode === 'signup' && confirmPassword && password !== confirmPassword }"
      />

      <!-- Confirm Password (only for signup) -->
      <input
        v-if="mode === 'signup'"
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="w-full border rounded px-3 py-2"
        :class="{ 'border-red-500': confirmPassword && password !== confirmPassword }"
        @keyup.enter="mode === 'signup' ? signUp() : signIn()"
      />

      <!-- Login -->
      <button
        v-if="mode === 'login'"
        class="w-full px-4 py-2 rounded bg-black text-white"
        :disabled="loading"
        @click="signIn"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <!-- Signup -->
      <button
        v-if="mode === 'signup'"
        class="w-full px-4 py-2 rounded bg-black text-white"
        :disabled="loading"
        @click="signUp"
      >
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>
    </div>

    <!-- Divider -->
    <div class="my-6 text-center text-sm text-gray-500">
      OR
    </div>

    <!-- Google -->
    <button
      class="w-full px-4 py-2 border rounded"
      @click="signInWithGoogle"
    >
      Continue with Google
    </button>
    
    <!-- Forgot password -->
    <div v-if="mode === 'login'" class="mt-4 text-sm text-center">
      <NuxtLink to="/reset" class="underline">
        Forgot password?
      </NuxtLink>
    </div>
    
    <!-- Messages -->
    <p v-if="errorMessage" class="mt-4 text-red-600">
      {{ errorMessage }}
    </p>

    <p v-if="successMessage" class="mt-4 text-green-700">
      {{ successMessage }}
    </p>


  </div>
</template>