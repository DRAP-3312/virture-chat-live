<script setup lang="ts">
import { ref, watch } from "vue";
import { SendHorizontal } from "lucide-vue-next";
import type { MessageInputProps } from "../types/props";

const props = defineProps<MessageInputProps>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  send: [];
  typing: [isTyping: boolean];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

function handleInput(event: Event) {
  const input = (event.target as HTMLTextAreaElement).value;
  emit("update:modelValue", input);

  // Emit typing event
  emit("typing", input.trim() !== "");

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    emit("typing", false);
  }, 1000);
}

function handleEnterKey() {
  if (window.innerWidth >= 1024) {
    emit("send");
  }
}

function focusInput() {
  textareaRef.value?.focus();
}

// Auto-resize textarea
watch(
  () => props.modelValue,
  () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
    }
  },
);

defineExpose({ focusInput });
</script>

<template>
  <div class="flex gap-2 items-end p-3 h-full">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      placeholder="Escribe un mensaje..."
      class="grow p-3 outline-none resize-none text-sm rounded-xl transition-all duration-200 bg-transparent focus:ring-2 max-h-32 min-h-[44px]"
      :style="{
        backgroundColor: `${textColor}05`,
        color: textColor,
        border: `1.5px solid ${textColor}`,
        '--tw-ring-color': `${accentColor}30`,
      }"
      rows="1"
      @keyup.enter="handleEnterKey"
      @input="handleInput"
    ></textarea>

    <!-- Send button improved -->
    <button
      :disabled="!modelValue.trim()"
      class="min-w-[44px] h-11 rounded-xl text-white flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm flex-shrink-0"
      :style="{
        backgroundColor: accentColor,
        opacity: modelValue.trim() ? '1' : '0.4',
      }"
      @click="emit('send')"
    >
      <SendHorizontal :size="20" :stroke-width="2.5" />
    </button>
  </div>
</template>

<style scoped>
textarea:focus {
  outline: none;
}

textarea::placeholder {
  opacity: 0.5;
}
</style>
