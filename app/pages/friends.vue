<template>
  <div class="min-h-screen pb-8">
    <div class="max-w-md mx-auto px-4 pt-8">
      <!-- Friends Header -->
          <div class="px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-900">Your Wishlist</h1>
    </div>

      <!-- Friend Search -->
      <section class="bg-white/90 rounded-2xl shadow-lg p-5 mb-8">
        <label class="block text-sm font-medium mb-2 text-indigo-700" for="search">Search by username</label>
        <div class="flex gap-2">
          <input
            id="search"
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            placeholder="Enter username..."
            class="flex-1 rounded-lg border border-indigo-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white/80 text-gray-900 placeholder-indigo-300"
          />
        </div>
        <div v-if="searchResults.length" class="mt-4">
          <div v-for="user in searchResults" :key="user.username" class="flex items-center justify-between bg-indigo-50 rounded-lg p-3 mb-2">
            <span class="font-medium text-indigo-800">{{ user.username }}</span>
            <button
              class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm shadow transition-colors"
              @click="addFriend(user)"
            >Add Friend</button>
          </div>
        </div>
        <div v-else-if="searchQuery && !loadingSearch" class="mt-4 text-indigo-400 text-sm">No users found.</div>
        <div v-if="loadingSearch" class="mt-4 text-indigo-400 text-sm">Searching...</div>
      </section>

      <!-- Friends List -->
      <section class="bg-white/90 rounded-2xl shadow-lg p-5">
        <h2 class="text-lg font-bold mb-4 text-indigo-700">Friends List</h2>
        <div v-if="friends.length">
          <div v-for="friend in friends" :key="friend.username" class="bg-indigo-50 rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer hover:bg-indigo-100 transition" @click="goToProfile(friend.username)">
            <div>
              <div class="font-medium text-indigo-900">{{ friend.username }}</div>
              <div class="text-xs text-indigo-500">{{ friend.gamesCount }} games in collection</div>
            </div>
          </div>
        </div>
        <div v-else class="text-indigo-400 text-sm">No friends yet.</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'nuxt/app'

// Placeholder API
async function searchUsers(query: string): Promise<Array<{ username: string }>> {
  // Simulate API call
  await new Promise(r => setTimeout(r, 500))
  if (!query) return []
  // Example: return 3 fake users
  return [
    { username: 'boardgamer' },
    { username: 'meeplequeen' },
    { username: 'dicewizard' }
  ].filter(u => u.username.includes(query))
}

async function fetchFriends(): Promise<Array<{ username: string, gamesCount: number }>> {
  // Simulate API call
  await new Promise(r => setTimeout(r, 500))
  // Example: return 2 fake friends
  return [
    { username: 'meeplequeen', gamesCount: 12 },
    { username: 'dicewizard', gamesCount: 7 }
  ]
}

const searchQuery = ref('')
const searchResults = ref<Array<{ username: string }>>([])
const loadingSearch = ref(false)
const friends = ref<Array<{ username: string, gamesCount: number }>>([])
const router = useRouter()

async function onSearch() {
  loadingSearch.value = true
  searchResults.value = await searchUsers(searchQuery.value)
  loadingSearch.value = false
}

async function addFriend(user: { username: string }) {
  // Simulate adding friend
  friends.value.push({ username: user.username, gamesCount: Math.floor(Math.random() * 20) + 1 })
  // Optionally clear search
  searchQuery.value = ''
  searchResults.value = []
}

function goToProfile(username: string) {
  router.push(`/profile/${username}`)
}

// Fetch friends on mount
fetchFriends().then(f => friends.value = f)
</script>

<style scoped>
.bg-gradient-to-br {
  /* fallback for browsers that don't support gradients */
  background-color: #6366f1;
}
.drop-shadow {
  text-shadow: 0 2px 8px rgba(80, 0, 120, 0.15);
}
</style>
