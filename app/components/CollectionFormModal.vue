<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import { useCollectionStore } from '~/stores/useCollectionStore'

interface Game {
  id: number | string
  name: string
  thumbnail?: string | null
  image?: string | null
}

interface FormData {
  addedToCollectionDate: string
  receivedAsGift: boolean
  pricePaid?: number
  currency?: string
  condition: 'new' | 'used'
  isComplete: boolean
  missingComponents?: string
  edition?: string
  isSleeved: boolean
  isOrganized: boolean
  reasonForBuying?: string
  receivedFrom?: string
}

const props = defineProps<{
  show: boolean
  game: Game
}>()

const emit = defineEmits<{
  close: []
}>()

const collectionStore = useCollectionStore()
const { isLoading } = storeToRefs(collectionStore)

// Form data
const formData = ref<FormData>({
  addedToCollectionDate: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
  receivedAsGift: false,
  pricePaid: undefined,
  currency: 'USD',
  condition: 'new',
  isComplete: true,
  missingComponents: undefined,
  edition: undefined,
  isSleeved: false,
  isOrganized: false,
  reasonForBuying: undefined,
  receivedFrom: undefined
})

// Additional info visibility
const showAdditionalInfo = ref(false)

// Currency options
const currencies: string[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']

// Condition options
const conditions = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
]

// Reset form to default state
function resetForm() {
  formData.value = {
    addedToCollectionDate: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
    receivedAsGift: false,
    pricePaid: undefined,
    currency: 'USD',
    condition: 'new',
    isComplete: true,
    missingComponents: undefined,
    edition: undefined,
    isSleeved: false,
    isOrganized: false,
    reasonForBuying: undefined,
    receivedFrom: undefined
  }
  showAdditionalInfo.value = false
}

async function handleSubmit() {
  try {
    await collectionStore.addGameToCollection({
      gameId: String(props.game.id),
      condition: formData.value.condition,
      pricePaid: formData.value.pricePaid || null,
      currency: formData.value.currency || null,
      receivedAsGift: formData.value.receivedAsGift,
      addedToCollectionDate: formData.value.addedToCollectionDate,
      isComplete: formData.value.isComplete,
      missingComponents: formData.value.missingComponents || null,
      edition: formData.value.edition || null,
      isSleeved: formData.value.isSleeved,
      isOrganized: formData.value.isOrganized,
      reasonForBuying: formData.value.reasonForBuying || null,
      receivedFrom: formData.value.receivedFrom || null,
      thumbnail: props.game.thumbnail || null,
      image: props.game.image || null,
      name: props.game.name || null
    })
  } catch (error) {
    console.error('Failed to add to collection:', error)
  } finally {
    resetForm()
    emit('close')
  }
}

function handleCancel() {
  resetForm()
  emit('close')
}

function toggleAdditionalInfo() {
  showAdditionalInfo.value = !showAdditionalInfo.value
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Add to Collection"
    max-width="md"
    @close="handleCancel"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Added to Collection Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Added to Collection
        </label>
        <input
          v-model="formData.addedToCollectionDate"
          type="date"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          required
        />
      </div>

      <!-- Received as Gift -->
      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="formData.receivedAsGift"
            type="checkbox"
            class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="text-gray-700 font-medium">Received as Gift?</span>
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Received From?</label>
        <input
          v-model="formData.receivedFrom"
          type="text"
          placeholder="e.g., Local game store, Amazon, friend..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

      <!-- Price and Currency (only if not a gift) -->
      <div v-if="!formData.receivedAsGift" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Price Paid</label>
            <input
              v-model.number="formData.pricePaid"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              v-model="formData.currency"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            >
              <option v-for="currency in currencies" :key="currency" :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Additional Info Toggle -->
      <div>
        <button
          type="button"
          @click="toggleAdditionalInfo"
          class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <Icon :name="showAdditionalInfo ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
          Additional Information
        </button>
      </div>

      <!-- Additional Info Section -->
      <div v-if="showAdditionalInfo" class="space-y-4 border-t border-gray-200 pt-4">
        <!-- Condition -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Condition</label>
          <div class="space-y-2">
            <label
              v-for="condition in conditions"
              :key="condition.value"
              class="flex items-center gap-3 cursor-pointer"
            >
              <input
                :value="condition.value"
                v-model="formData.condition"
                type="radio"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-gray-700">{{ condition.label }}</span>
            </label>
          </div>
        </div>

        <!-- Complete -->
        <div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="formData.isComplete"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-gray-700 font-medium">Complete?</span>
          </label>
        </div>

        <!-- Missing Components -->
        <div v-if="!formData.isComplete">
          <label class="block text-sm font-medium text-gray-700 mb-2">Missing Components</label>
          <textarea
            v-model="formData.missingComponents"
            rows="3"
            placeholder="Please specify which components are missing..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
            required
          />
        </div>

        <!-- Edition/Version -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Edition/Version</label>
          <input
            v-model="formData.edition"
            type="text"
            placeholder="e.g., First Edition, Deluxe Edition..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        <!-- Sleeved and Organized -->
        <div class="space-y-3">
          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.isSleeved"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-gray-700 font-medium">Sleeved?</span>
            </label>
          </div>
          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.isOrganized"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-gray-700 font-medium">Custom Insert?</span>
            </label>
          </div>
        </div>

        <!-- Reason for Buying -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            v-model="formData.reasonForBuying"
            rows="3"
            placeholder="Where you bought it? Why you "
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="handleCancel"
          class="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <Icon name="mdi:loading" class="w-4 h-4 animate-spin" />
            Adding...
          </span>
          <span v-else>Add to Collection</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>
