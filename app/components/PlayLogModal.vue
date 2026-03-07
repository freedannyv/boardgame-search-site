<script setup lang="ts">
interface Game {
  id: number
  name: string
  thumbnail?: string
}

defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  startGame: []
  logFinishedGame: []
  close: []
}>()

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click="handleOverlayClick"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <!-- Header -->
        <div class="mb-6 text-center">
          <div v-if="game.thumbnail" class="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-xl">
            <img
              :src="game.thumbnail"
              :alt="game.name"
              class="h-full w-full object-cover"
            />
          </div>
          <h2 class="text-xl font-bold text-gray-900">Log a Play</h2>
          <p class="mt-1 text-sm text-gray-500">{{ game.name }}</p>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
            @click="emit('startGame')"
          >
            <Icon name="mdi:play-circle" class="h-6 w-6" />
            Start Game Now
          </button>

          <button
            type="button"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
            @click="emit('logFinishedGame')"
          >
            <Icon name="mdi:check-circle" class="h-6 w-6" />
            Already Finished
          </button>
        </div>

        <!-- Cancel -->
        <button
          type="button"
          class="mt-4 w-full rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
          @click="emit('close')"
        >
          Cancel
        </button>
      </div>
    </div>
  </Teleport>
</template>
