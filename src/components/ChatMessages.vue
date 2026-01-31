<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useChatStore } from '../composables/useChatStore'
import MessageBubble from './MessageBubble.vue'
import type { ChatMessage } from '../types/chat'

defineProps<{
  userMessageBackground: string
  userMessageTextColor: string
  botMessageBackground: string
  botMessageTextColor: string
}>()

const { messages, typingState } = useChatStore()
const messagesContainer = ref<HTMLDivElement | null>(null)

const filteredMessages = computed(() =>
  messages.value.filter((msg) => !msg.deleteMarker)
)

interface MessageGroup {
  formattedDate: string | null
  messages: ChatMessage[]
}

function formatGroupDate(date: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDate = new Date(date)

  if (messageDate.toDateString() === today.toDateString()) return 'Hoy'
  if (messageDate.toDateString() === yesterday.toDateString()) return 'Ayer'

  return messageDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const groupedMessages = computed<MessageGroup[]>(() => {
  if (!filteredMessages.value.length) return []

  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null

  for (const message of filteredMessages.value) {
    if (!message.createdAt) {
      if (!currentGroup) {
        currentGroup = { formattedDate: null, messages: [] }
        groups.push(currentGroup)
      }
      currentGroup.messages.push(message)
      continue
    }

    const messageDay = new Date(message.createdAt).toDateString()

    if (
      !currentGroup ||
      (currentGroup.messages[0]?.createdAt &&
        new Date(currentGroup.messages[0].createdAt).toDateString() !== messageDay)
    ) {
      currentGroup = {
        formattedDate: formatGroupDate(message.createdAt),
        messages: [],
      }
      groups.push(currentGroup)
    }

    currentGroup.messages.push(message)
  }

  return groups
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      setTimeout(() => {
        messagesContainer.value!.scrollTop = messagesContainer.value!.scrollHeight
      }, 50)
    }
  })
}

onMounted(scrollToBottom)
watch(messages, scrollToBottom, { deep: true })
watch(typingState, (state) => {
  if (state === 'in-progress') scrollToBottom()
})
</script>

<template>
  <div
    ref="messagesContainer"
    class="h-full overflow-y-auto flex flex-col w-full p-1.5 bg-transparent scrollbar-thin scrollbar-thumb-black/20 hover:scrollbar-thumb-black/40 scrollbar-track-transparent"
  >
    <template v-for="(group, gi) in groupedMessages" :key="`g-${gi}`">
      <div v-if="group.formattedDate" class="flex justify-center my-4">
        <div class="px-4 py-1 text-xs text-gray-500 bg-gray-200 rounded-md font-normal text-center">
          {{ group.formattedDate }}
        </div>
      </div>

      <MessageBubble
        v-for="(item, i) in group.messages"
        :key="item._id || i"
        :message="item"
        :user-message-background="userMessageBackground"
        :user-message-text-color="userMessageTextColor"
        :bot-message-background="botMessageBackground"
        :bot-message-text-color="botMessageTextColor"
      />
    </template>
  </div>
</template>
