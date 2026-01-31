<script setup lang="ts">
defineProps<{
  instanceName?: string;
}>();
</script>

<template>
  <div class="flex gap-2 p-3 text-gray-500 text-xs">
    <div
      v-if="instanceName"
      class="flex flex-row items-center gap-2 min-w-0 justify-center"
    >
      <span class="text-gray-600 truncate font-medium">
        {{ instanceName }}
      </span>
      <span class="items-center whitespace-nowrap text-gray-500">
        esta escribiendo
      </span>
      <span class="inline-flex items-center gap-0.5 h-[1em]">
        <span
          v-for="i in 3"
          :key="i"
          class="w-1 h-1 rounded-full bg-gray-400 animate-[wave_1.4s_ease-in-out_infinite]"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes wave {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
