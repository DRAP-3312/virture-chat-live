<script setup lang="ts">
import type { ChatHeaderProps } from "../types/props";

defineProps<ChatHeaderProps>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    class="flex p-3 w-full min-h-[72px] justify-between items-center relative border-b"
    :style="{
      color: textColor,
      backgroundColor: backgroundColor,
      borderColor: `${textColor}20`,
    }"
  >
    <!-- Avatar with status indicator -->
    <div class="relative">
      <div
        v-if="iconButtonUrl"
        class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-black/10"
      >
        <img
          :src="iconButtonUrl"
          alt="Avatar"
          class="w-full h-full object-cover rounded-full"
        />
      </div>
      <!-- Default avatar if no icon -->
      <div
        v-else
        class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-black/10 flex items-center justify-center text-white font-bold text-lg"
        :style="{
          backgroundColor: accentColor,
        }"
      >
        {{ instanceName ? instanceName.charAt(0).toUpperCase() : "C" }}
      </div>
      <!-- Online status indicator -->
      <div
        class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white"
        :style="{
          backgroundColor: socketState ? '#10b981' : '#fabe28',
        }"
      ></div>
    </div>

    <!-- Info with better spacing -->
    <div class="flex flex-col justify-center flex-1 ml-3 gap-0.5">
      <div class="flex items-center gap-2">
        <strong class="text-base font-semibold">
          {{ instanceName || "Chat en vivo" }}
        </strong>
        <span
          class="text-[10px] px-2 py-0.5 rounded-full font-medium"
          :style="{
            backgroundColor: socketState ? '#10b98120' : '#fef9c3',
            color: socketState ? '#10b981' : '#854d0e',
          }"
        >
          {{ socketState ? "En línea" : "Servicio no disponible" }}
        </span>
      </div>
      <span class="text-[11px] opacity-70">Estamos para ayudarte</span>
    </div>

    <!-- Close button improved -->
    <button
      class="min-w-[32px] h-8 bg-transparent border-none text-lg font-semibold cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/5"
      :style="{ color: textColor }"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>
