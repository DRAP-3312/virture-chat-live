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
  <transition name="greet-modal-fade">
    <div
      class="absolute bottom-21.25 left-1.25 p-4 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.3)] text-[0.9rem] leading-relaxed z-1001 w-[60vw] lg:w-[20vw]"
      :style="{ backgroundColor, color: textColor }"
    >
      <div v-if="showCloseButton" class="flex justify-end">
        <button
          class="bg-transparent border-none text-xl p-0 font-bold cursor-pointer hover:opacity-80"
          :style="{ color: textColor }"
          @click="emit('dismiss')"
        >
          ✕
        </button>
      </div>
      <div class="cursor-pointer" @click="emit('start')">
        <p class="my-2.5 text-[1.1rem] font-sans">
          {{ message }}
        </p>
        <button
          class="text-white border-none px-4 py-1.5 rounded cursor-pointer block ml-auto mt-1.5 transition-colors duration-200"
          :style="{ backgroundColor: buttonColor }"
          @click.stop="emit('start')"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.greet-modal-fade-enter-active,
.greet-modal-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.greet-modal-fade-enter-from,
.greet-modal-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
