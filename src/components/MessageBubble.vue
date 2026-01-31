<script setup lang="ts">
import { computed } from "vue";
import { parseMessageContent } from "../utils/markdown";
import type { ChatMessage } from "../types/chat";

const props = defineProps<{
  message: ChatMessage;
  userMessageBackground: string;
  userMessageTextColor: string;
  botMessageBackground: string;
  botMessageTextColor: string;
}>();

const isUser = computed(() => props.message.role === "user");

const formattedContent = computed(() => {
  if (!props.message.content) return "";
  return parseMessageContent(props.message.content);
});

function formatTime(timestamp?: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}
</script>

<template>
  <div
    :class="[
      'flex flex-col my-2 max-w-[70%] gap-2 sm:max-w-[85%]',
      isUser ? 'ml-auto items-end' : 'mr-auto items-start',
    ]"
  >
    <!-- Attachments -->
    <div
      v-if="message.attachments?.length"
      :class="[
        'flex flex-col gap-2 w-full max-w-75',
        message.attachments.some((a) => a.mimeType?.startsWith('image/'))
          ? 'grid grid-cols-3 gap-2'
          : '',
      ]"
    >
      <MessageAttachment
        v-for="(attachment, i) in message.attachments"
        :key="i"
        :attachment="attachment"
        :is-multiple="message.attachments!.length > 1"
      />
    </div>

    <!-- Text content -->
    <div
      v-if="message.content"
      class="message-bubble rounded-xl min-w-10 wrap-break-word px-4 py-3 font-sans text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :style="{
        backgroundColor: isUser ? userMessageBackground : botMessageBackground,
        color: isUser ? userMessageTextColor : botMessageTextColor,
      }"
      v-html="formattedContent"
    />

    <!-- Timestamp -->
    <div
      v-if="message.createdAt"
      :class="[
        'text-[10px] mt-0.5 opacity-60 text-gray-500',
        isUser ? 'text-right' : 'text-left',
      ]"
    >
      {{ formatTime(message.createdAt) }}
    </div>
  </div>
</template>

<script lang="ts">
import MessageAttachment from "./MessageAttachment.vue";
</script>

<style scoped>
.message-bubble :deep(a) {
  color: #15be86;
  text-decoration: underline;
  word-break: break-all;
}

.message-bubble :deep(strong) {
  font-weight: bold;
}

.message-bubble :deep(img.chat-image) {
  max-width: 100%;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  cursor: pointer;
}

.message-bubble :deep(img.chat-image.loading) {
  min-height: 100px;
  background-color: #f0f0f0;
  opacity: 1;
}

.message-bubble :deep(img.chat-image.loaded) {
  opacity: 1;
}

.message-bubble :deep(.image-container) {
  margin: 8px 0;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.message-bubble :deep(.image-container > a) {
  display: block;
  text-decoration: none;
  border-radius: 8px;
}

.message-bubble :deep(.image-container > a:hover img.chat-image) {
  transform: scale(1.02);
  filter: brightness(65%);
}

.message-bubble :deep(br) {
  content: "";
  display: block;
  margin-bottom: 0.5em;
}
</style>
