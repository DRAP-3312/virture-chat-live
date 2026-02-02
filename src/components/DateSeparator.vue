<script setup lang="ts">
defineProps<{
  date: string;
  textColor: string;
  backgroundColor: string;
}>();
</script>

<template>
  <div class="flex justify-center my-6">
    <div
      class="px-3 py-1.5 text-[10px] rounded-full font-medium text-center backdrop-blur-sm"
      :style="{
        backgroundColor: backgroundColor,
        color: textColor,
        border: `1px solid ${textColor}`,
        opacity: 0.7,
      }"
    >
      {{ date }}
    </div>
  </div>
</template>
