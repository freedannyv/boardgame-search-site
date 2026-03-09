<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from './stores/useCollectionStore'
import { useWishlistStore } from './stores/useWishlistStore'
import { useUserStore } from './stores/useUserStore'
import { useFriendsStore } from './stores/useFriendsStore'

const collectionStore = useCollectionStore()
const wishlistStore = useWishlistStore()
const userStore = useUserStore()
const friendsStore = useFriendsStore()

// Initialize stores with placeholder data
onMounted(() => {
  collectionStore.setCollection([])
  wishlistStore.setWishlist([])
  friendsStore.setFriends([])
})
</script>
