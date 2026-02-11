<script setup lang="ts">
import { computed } from "vue";
import { parseMessageContent } from "../utils/markdown";

const props = defineProps<MessageBubbleProps>();

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
      'flex my-1.5 max-w-[75%] gap-2 sm:max-w-[85%]',
      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
    ]"
  >
    <!-- Avatar (only for bot messages) -->
    <div v-if="!isUser" class="flex-shrink-0">
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
        :style="{ backgroundColor: botMessageBackground }"
      >
        {{ instanceName ? instanceName.charAt(0).toUpperCase() : "B" }}
      </div>
    </div>

    <!-- Message content wrapper -->
    <div
      :class="['flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start']"
    >
      <!-- Attachments -->
      <div
        v-if="message.attachments?.length"
        :class="[
          'flex flex-col gap-2 w-full max-w-[18.75rem]',
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
        class="message-bubble min-w-[2.5rem] break-words px-4 py-2.5 font-sans text-sm transition-all duration-200 shadow-sm"
        :style="{
          backgroundColor: isUser
            ? userMessageBackground
            : botMessageBackground,
          color: isUser ? userMessageTextColor : botMessageTextColor,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }"
        v-html="formattedContent"
      />

      <!-- Timestamp -->
      <div
        v-if="message.createdAt"
        :class="[
          'text-[10px] px-1 opacity-50',
          isUser ? 'text-right' : 'text-left',
        ]"
        :style="{ color: textColor }"
      >
        {{ formatTime(message.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MessageAttachment from "./MessageAttachment.vue";
import type { MessageBubbleProps } from "../types/props";
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
