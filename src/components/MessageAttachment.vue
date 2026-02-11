<script setup lang="ts">
import { ref, computed } from "vue";
import { FileText, Download, ImageOff } from "lucide-vue-next";
import TooltipHover from "./TooltipHover.vue";
import type { MessageAttachmentProps } from "../types/props";

const props = defineProps<MessageAttachmentProps>();

const loading = ref(true);
const error = ref(false);
const focusImg = ref(false);

const isImage = computed(() => props.attachment.mimeType?.startsWith("image/"));
const isPdf = computed(() => props.attachment.mimeType === "application/pdf");

function onImageLoad() {
  loading.value = false;
  error.value = false;
}
function onImageError() {
  loading.value = false;
  error.value = true;
}
function openUrl() {
  window.open(props.attachment.url, "_blank");
}
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
</script>

<template>
  <div class="w-full">
    <!-- Image -->
    <div
      v-if="isImage"
      class="relative w-full overflow-hidden group transition-all duration-200 rounded-lg"
    >
      <div
        v-if="loading"
        :class="[
          'flex items-center justify-center bg-gray-300/50 rounded-lg animate-pulse w-full',
          isMultiple ? 'aspect-square' : 'h-48',
        ]"
      >
        <div
          class="w-[1.875rem] h-[1.875rem] border-[3px] border-gray-200 border-t-blue-500 rounded-full animate-spin"
        ></div>
      </div>

      <div
        v-if="error"
        class="relative cursor-pointer"
        @click="openUrl"
        @mouseover="focusImg = true"
        @mouseleave="focusImg = false"
      >
        <div
          :class="[
            'flex flex-col text-gray-600 items-center justify-center bg-gray-200 rounded-lg transition-all duration-300 w-full',
            isMultiple ? 'aspect-square' : 'h-48',
          ]"
        >
          <div
            v-if="!focusImg"
            class="flex flex-col w-full h-full justify-center items-center"
          >
            <ImageOff :size="32" />
            <p class="text-sm mt-2">Imagen no disponible</p>
          </div>
        </div>
        <div
          v-if="focusImg"
          class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none"
        >
          <div class="text-center text-white">
            <p class="text-sm font-semibold drop-shadow-lg">
              {{ attachment.fileName }}
            </p>
            <p class="text-xs mt-1 opacity-90">Click para abrir</p>
          </div>
        </div>
      </div>

      <div v-if="!error" class="relative rounded-lg overflow-hidden">
        <img
          :src="attachment.url"
          :alt="attachment.fileName"
          :class="[
            'cursor-pointer transition-all duration-300 rounded-lg w-full group-hover:brightness-75 group-hover:scale-[1.02]',
            isMultiple
              ? 'aspect-square object-cover'
              : 'h-auto max-h-96 object-contain',
            { hidden: loading },
          ]"
          @load="onImageLoad"
          @error="onImageError"
          @click="openUrl"
          @mouseover="focusImg = true"
          @mouseleave="focusImg = false"
        />
        <div
          v-if="focusImg && !loading"
          class="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none rounded-lg"
        >
          <div class="text-center text-white">
            <p class="text-sm font-semibold drop-shadow-lg">
              {{ attachment.fileName }}
            </p>
            <p class="text-xs mt-1 opacity-90">Click para abrir</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF -->
    <TooltipHover v-else-if="isPdf">
      <div
        class="group flex flex-col items-center justify-center w-14 h-14 rounded-lg cursor-pointer transition-all duration-300 bg-slate-700 hover:bg-slate-600 hover:shadow-lg hover:scale-[1.05]"
        @click="openUrl"
      >
        <FileText :size="24" class="text-red-500" />
        <p class="text-[10px] font-semibold text-white mt-0.5">PDF</p>
      </div>
      <template #content>
        <p class="text-xs font-medium text-white truncate max-w-[12rem]">
          {{ attachment.fileName }}
        </p>
        <p class="text-[10px] text-gray-300">
          {{ formatFileSize(attachment.fileSize) }}
        </p>
        <p class="text-[10px] text-purple-300 mt-0.5">Click para abrir</p>
      </template>
    </TooltipHover>

    <!-- Other files -->
    <div
      v-else
      class="group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 w-full bg-gray-800/30 hover:bg-gray-800/50 hover:shadow-lg hover:scale-[1.02]"
      @click="openUrl"
      @mouseover="focusImg = true"
      @mouseleave="focusImg = false"
    >
      <div
        class="shrink-0 flex flex-col items-center transition-transform group-hover:scale-110"
      >
        <Download :size="32" class="text-red-500" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-white truncate">
          {{ attachment.fileName }}
        </p>
        <p class="text-xs text-gray-200">
          {{ formatFileSize(attachment.fileSize) }}
        </p>
        <p v-if="focusImg" class="text-xs text-purple-300 mt-1">
          Click para abrir
        </p>
      </div>
    </div>
  </div>
</template>
