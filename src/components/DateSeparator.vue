<script setup lang="ts">
defineProps<{
  date: string;
  textColor: string;
}>();
</script>

<template>
  <div class="flex justify-center my-6">
    <div
      class="px-3 py-1.5 text-[10px] rounded-full font-medium text-center backdrop-blur-sm"
      :style="{
        backgroundColor: `${textColor}08`,
        color: `${textColor}70`,
        border: `1px solid ${textColor}10`,
      }"
    >
      {{ date }}
    </div>
  </div>
</template>
