<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useWishlistStore } from './stores/useWishlistStore'
import { useFriendsStore } from './stores/useFriendsStore'

const wishlistStore = useWishlistStore()
const friendsStore = useFriendsStore()

// Initialize stores with placeholder data
onMounted(() => {
  wishlistStore.setWishlist([])
  friendsStore.setFriends([])
})
</script>
