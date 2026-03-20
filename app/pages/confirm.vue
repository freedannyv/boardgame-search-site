<script setup lang="ts">
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

watch(
  user,
  async () => {
    if (user.value) {
      const path = redirectInfo.pluck()
      await navigateTo(path || '/')
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="p-6">
    Signing you in...
  </div>
</template>