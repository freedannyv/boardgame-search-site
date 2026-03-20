<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Profile',
  description: 'Manage your profile and settings'
})

// Tab state
const activeTab = ref<'profile' | 'settings'>('profile')

// User data
const userData = ref({
  username: 'dannyv',
  displayName: 'Danny V',
  bio: 'Board game enthusiast and collector',
  location: 'San Francisco, CA',
  avatar: '' as string | null,
  email: 'danny@example.com',
  currency: 'USD',
  language: 'en',
  timeFormat: '12h' as '12h' | '24h',
  profileVisibility: 'public' as 'public' | 'private',
  collectionVisibility: 'public' as 'public' | 'friends' | 'private',
  activityVisibility: true,
  emailNotifications: true,
  inAppNotifications: true,
  friendActivity: false,
  wishlistAlerts: true
})

// Edit state
const isEditingProfile = ref(false)
const editedProfile = ref({
  displayName: '',
  bio: '',
  location: ''
})

// Settings
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }
]

// Methods
function startEditingProfile() {
  editedProfile.value = {
    displayName: userData.value.displayName,
    bio: userData.value.bio,
    location: userData.value.location
  }
  isEditingProfile.value = true
}

function cancelEditingProfile() {
  isEditingProfile.value = false
}

function saveProfile() {
  userData.value.displayName = editedProfile.value.displayName
  userData.value.bio = editedProfile.value.bio
  userData.value.location = editedProfile.value.location
  isEditingProfile.value = false
}

function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // In a real app, upload to server and get URL
    const reader = new FileReader()
    reader.onload = (e) => {
      userData.value.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function changePassword() {
  // Open password change modal
  console.log('Change password')
}

function changeEmail() {
  // Open email change modal
  console.log('Change email')
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Identity Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-start gap-6">
        <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img 
                v-if="userData.avatar" 
                :src="userData.avatar" 
                :alt="userData.displayName"
                class="w-full h-full object-cover"
              />
              <Icon 
                v-else 
                name="mdi:account" 
                class="w-24 h-24 text-gray-400"
              />
            </div>
            <label class="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
              <Icon name="mdi:camera" class="w-4 h-4" />
              <input 
                type="file" 
                class="hidden" 
                accept="image/*"
                @change="handleAvatarUpload"
              />
            </label>
          </div>

        <!-- Basic Info -->
        <div class="w-full">
          <div class="mb-2">
            <h1 class="text-2xl font-bold text-gray-900">@{{ userData.username }}</h1>
            <p class="text-lg text-gray-700">{{ userData.displayName }}</p>
          </div>
          
          <div class="space-y-2">
            <p v-if="userData.bio" class="text-gray-600">{{ userData.bio }}</p>
            <p v-if="userData.location" class="text-gray-500 text-sm flex items-center gap-1">
              <Icon name="mdi:map-marker" class="w-4 h-4" />
              {{ userData.location }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>
        <button
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          @click="activeTab = 'settings'"
        >
          Settings
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="space-y-6">
      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button
              v-if="!isEditingProfile"
              @click="startEditingProfile"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!isEditingProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <p class="text-gray-900">{{ userData.displayName || 'Not set' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <p class="text-gray-900">{{ userData.bio || 'No bio set' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p class="text-gray-900">{{ userData.location || 'Not set' }}</p>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                v-model="editedProfile.displayName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                v-model="editedProfile.bio"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                v-model="editedProfile.location"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, Country"
              />
            </div>
            <div class="flex gap-3">
              <button
                @click="saveProfile"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                @click="cancelEditingProfile"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <!-- Account Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Email</p>
                <p class="text-sm text-gray-500">{{ userData.email }}</p>
              </div>
              <button
                @click="changeEmail"
                class="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Change
              </button>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Password</p>
                <p class="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
              <button
                @click="changePassword"
                class="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <!-- Experience Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                v-model="userData.currency"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option v-for="currency in currencies" :key="currency" :value="currency">
                  {{ currency }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                v-model="userData.language"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <div class="flex gap-4">
                <label class="flex items-center">
                  <input
                    v-model="userData.timeFormat"
                    type="radio"
                    value="12h"
                    class="mr-2"
                  />
                  <span class="text-gray-700">12-hour</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="userData.timeFormat"
                    type="radio"
                    value="24h"
                    class="mr-2"
                  />
                  <span class="text-gray-700">24-hour</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
              <select
                v-model="userData.profileVisibility"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Collection Visibility</label>
              <select
                v-model="userData.collectionVisibility"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Activity Visibility</p>
                <p class="text-sm text-gray-500">Show your recent activity to others</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="userData.activityVisibility"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Email Notifications</p>
                <p class="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="userData.emailNotifications"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">In-App Notifications</p>
                <p class="text-sm text-gray-500">Show notifications in the app</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="userData.inAppNotifications"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Friend Activity</p>
                <p class="text-sm text-gray-500">Updates when friends play games</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="userData.friendActivity"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-900">Wishlist Alerts</p>
                <p class="text-sm text-gray-500">Notify when wishlist games are on sale</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="userData.wishlistAlerts"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
