import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Dev config by default - use `vite build --mode production` for library build
export default defineConfig(({ mode }) => {
  const isLibBuild = mode === 'production'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      ...(isLibBuild
        ? [dts({
            tsconfigPath: './tsconfig.app.json',
            rollupTypes: true,
            include: ['src/index.ts', 'src/types/chat.ts'],
            logLevel: 'warn',
          })]
        : []),
    ],
    build: isLibBuild
      ? {
          lib: {
            entry: {
              'virture-chat-live': resolve(__dirname, 'src/index.ts'),
              'widget-entry': resolve(__dirname, 'src/widget-entry.ts'),
            },
            name: 'VirtureChatLive',
            fileName: (format, entryName) => `${entryName}.${format}.js`,
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue',
              },
              assetFileNames: (assetInfo) => {
                if (assetInfo.name?.endsWith('.css')) return 'style.css'
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
