import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Modes:
//   dev (default)  → vite dev server
//   production     → Vue component library build
//   widget         → Web Component build (Shadow DOM, customElement: true)
export default defineConfig(({ mode }) => {
  const isLibBuild = mode === 'production'
  const isWidgetBuild = mode === 'widget'

  return {
    plugins: [
      vue({
        customElement: isWidgetBuild || undefined,
      }),
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
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VirtureChatLive',
            fileName: (format) => `virture-chat-live.${format}.js`,
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
      : isWidgetBuild
        ? {
            lib: {
              entry: resolve(__dirname, 'src/widget-entry.ts'),
              name: 'VirtureChatWidget',
              fileName: (format) => `widget-entry.${format}.js`,
            },
            rollupOptions: {
              external: ['vue'],
              output: {
                exports: 'named',
                globals: {
                  vue: 'Vue',
                },
              },
            },
            emptyOutDir: false,
            cssCodeSplit: false,
          }
        : undefined,
    assetsInclude: ['**/*.mp3'],
  }
})
