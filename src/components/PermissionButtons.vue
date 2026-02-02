<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  textColor: string;
  accentColor: string;
  stateBtnUbication: boolean;
  stateBtnAlerts: boolean;
}>();

const emit = defineEmits<{
  requestLocation: [];
  requestAudio: [];
  close: [];
}>();

const showLocationFeedback = ref(false);
const showSoundFeedback = ref(false);

async function handleLocationClick() {
  emit("requestLocation");
  showLocationFeedback.value = true;
  setTimeout(() => {
    showLocationFeedback.value = false;
  }, 3000);
}

function handleAudioClick() {
  emit("requestAudio");
  showSoundFeedback.value = true;
  setTimeout(() => {
    showSoundFeedback.value = false;
  }, 3000);
}
</script>

<template>
  <div class="w-full p-3 relative">
    <!-- Feedback notifications -->
    <transition name="feedback-slide">
      <div
        v-if="showLocationFeedback || showSoundFeedback"
        class="absolute -top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-3"
        :style="{
          backgroundColor: showLocationFeedback ? '#10b98190' : '#8b5cf690',
          color: 'white',
        }"
      >
        <div
          class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <span class="font-medium text-sm">
          {{
            showLocationFeedback
              ? "¡Ubicación compartida!"
              : "¡Notificaciones activadas!"
          }}
        </span>
      </div>
    </transition>

    <!-- Permission buttons container -->
    <div
      class="rounded-lg flex gap-2 p-3 shadow-sm backdrop-blur-sm"
      :style="{
        backgroundColor: `${textColor}05`,
        border: `1px solid ${textColor}15`,
      }"
    >
      <div class="flex gap-2 w-full">
        <!-- Location permission button -->
        <button
          v-if="!stateBtnUbication"
          class="flex gap-2 justify-center items-center px-4 py-2.5 rounded-lg grow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 permission-btn"
          :style="{
            border: `1.5px solid ${accentColor}40`,
            color: textColor,
            backgroundColor: 'transparent',
            '--accent-color': accentColor,
          }"
          @click="handleLocationClick"
        >
          <!-- Location icon SVG -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-xs font-medium">Ubicación</p>
        </button>

        <!-- Audio/Alerts permission button -->
        <button
          v-if="!stateBtnAlerts"
          class="flex gap-2 justify-center items-center px-4 py-2.5 rounded-lg grow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 permission-btn"
          :style="{
            border: `1.5px solid ${accentColor}40`,
            color: textColor,
            backgroundColor: 'transparent',
            '--accent-color': accentColor,
          }"
          @click="handleAudioClick"
        >
          <!-- Bell icon SVG -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
            />
          </svg>
          <p class="text-xs font-medium">Alertas</p>
        </button>
      </div>

      <!-- Close button -->
      <button
        class="min-w-[28px] h-full rounded-lg justify-center items-center transition-all duration-200 hover:bg-black/5 flex"
        :style="{ color: `${textColor}60` }"
        @click="emit('close')"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.permission-btn:hover {
  background-color: var(--accent-color) !important;
  opacity: 0.9;
  color: white;
}

.feedback-slide-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}
.feedback-slide-leave-active {
  transition:
    opacity 0.3s ease-in,
    transform 0.3s ease-in;
}
.feedback-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}
.feedback-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
