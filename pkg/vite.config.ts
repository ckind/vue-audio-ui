import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      // todo: better way to specific output name?
      afterBuild: dtsMap => {
        fs.rename('./dist/index.d.ts', './dist/v-audio-ui.d.ts', () => {});
      }
    })
  ],
  build: {
    lib: {
      entry: "./index.ts",
      name: "v-audio-ui",
      fileName: "v-audio-ui",
      formats: ["es", "umd", "cjs"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
