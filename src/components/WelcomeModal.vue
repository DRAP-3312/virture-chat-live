<script setup lang="ts">
defineProps<{
  message: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  showCloseButton: boolean;
}>();

const emit = defineEmits<{
  start: [];
  dismiss: [];
}>();
</script>

<template>
  <transition name="greet-modal-bounce">
    <div
      class="absolute bottom-21.25 left-1.25 p-5 rounded-2xl shadow-2xl text-sm leading-relaxed z-1001 w-[65vw] lg:w-[22vw] backdrop-blur-sm animate-float-subtle"
      :style="{
        backgroundColor,
        color: textColor,
        border: `1px solid ${textColor}15`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }"
    >
      <!-- Close button with better styling -->
      <div v-if="showCloseButton" class="flex justify-end -mt-1 -mr-1 mb-2">
        <button
          class="bg-transparent border-none text-lg p-1.5 font-semibold cursor-pointer rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 hover:bg-black/5 hover:rotate-90"
          :style="{ color: `${textColor}70` }"
          @click="emit('dismiss')"
        >
          ✕
        </button>
      </div>

      <!-- Content with better layout -->
      <div class="flex flex-col gap-3">
        <!-- Message with icon -->
        <div class="flex gap-3 items-start">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-subtle"
            :style="{ backgroundColor: `${buttonColor}20` }"
          >
            <span class="text-xl">👋</span>
          </div>
          <p class="text-sm font-medium leading-relaxed pt-1.5">
            {{ message }}
          </p>
        </div>

        <!-- CTA Button with enhanced styling -->
        <button
          class="text-white border-none px-5 py-2.5 rounded-xl cursor-pointer font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
          :style="{
            backgroundColor: buttonColor,
            boxShadow: `0 4px 12px ${buttonColor}40`,
          }"
          @click="emit('start')"
        >
          {{ buttonText }} →
        </button>
      </div>

      <!-- Decorative element (pulse ring) -->
      <div
        class="absolute -bottom-2 -right-2 w-4 h-4 rounded-full animate-ping-slow"
        :style="{ backgroundColor: buttonColor, opacity: 0.4 }"
      />
    </div>
  </transition>
</template>

<style scoped>
/* Enhanced bounce animation with scale */
.greet-modal-bounce-enter-active {
  animation: modal-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.greet-modal-bounce-leave-active {
  animation: modal-bounce-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes modal-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px) rotate(-5deg);
  }
  50% {
    transform: scale(1.05) translateY(-5px) rotate(2deg);
  }
  70% {
    transform: scale(0.95) translateY(2px) rotate(-1deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0) rotate(0);
  }
}

@keyframes modal-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
}

/* Subtle pulse animation for icon */
@keyframes pulse-subtle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

/* Slow ping for decorative element */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Subtle float animation for the modal */
@keyframes float-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-float-subtle {
  animation: float-subtle 1.8s ease-in-out infinite;
}
</style>
