import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Dev config by default - use `vite build --mode production` for library build
export default defineConfig(({ mode }) => {
  const isLibBuild = mode === 'production'

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    build: isLibBuild
      ? {
          lib: {
            entry: 'src/App.vue',
            name: 'VueChatWidget',
            fileName: (format) => `vue-chat-widget.${format}.js`,
          },
          rollupOptions: {
            output: {
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === 'style.css') return 'vue-chat-widget.css'
                return assetInfo.name!
              },
            },
          },
          cssCodeSplit: false,
        }
      : undefined,
    assetsInclude: ['**/*.mp3'],
  }
})
