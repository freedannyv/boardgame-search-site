<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const { ensureProfile } = useProfile()

watch(
  () => user.value?.sub,
  async (sub) => {
    console.log('confirm watcher sub:', sub)

    if (!sub) return

    await ensureProfile()
    await navigateTo('/')
  },
  { immediate: true }
)
</script>

<template>
  <div>Waiting for login...</div>
</template>