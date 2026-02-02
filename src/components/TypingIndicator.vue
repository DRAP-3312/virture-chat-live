<script setup lang="ts">
import type { TypeIndicatorProps } from "../types/props";

defineProps<TypeIndicatorProps>();
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-2">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div
        v-if="iconButtonUrl"
        class="w-7 h-7 rounded-full overflow-hidden ring-1 ring-black/5"
      >
        <img
          :src="iconButtonUrl"
          alt="Bot avatar"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
        :style="{ backgroundColor: botMessageBackground || '#f3f4f6' }"
      >
        {{ instanceName ? instanceName.charAt(0).toUpperCase() : "B" }}
      </div>
    </div>

    <!-- Typing bubble -->
    <div class="flex flex-col gap-1">
      <div
        class="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm"
        :style="{
          backgroundColor: botMessageBackground || '#f3f4f6',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }"
      >
        <span
          v-for="i in 3"
          :key="i"
          class="h-2 w-2 rounded-full animate-bounce"
          :style="{
            backgroundColor: botMessageTextColor || '#6b7280',
            opacity: '0.6',
            animationDelay: `${(i - 1) * 0.15}s`,
            animationDuration: '1s',
          }"
        />
      </div>

      <!-- Typing text -->
      <span
        class="text-[10px] px-1 opacity-50"
        :style="{ color: textColor || '#6b7280' }"
      >
        {{ instanceName || "Asistente" }} está escribiendo...
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}
</style>
