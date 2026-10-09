import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// Dev config by default - use `vite build --mode production` for library build
export default defineConfig(({ mode }) => {
  const isLibBuild = mode === 'production'

  return {
    define: {
      __WIDGET_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      vue(),
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
      : undefined,
    assetsInclude: ['**/*.mp3'],
  }
})
