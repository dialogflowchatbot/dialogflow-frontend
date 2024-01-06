import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  return defineConfig({
    plugins: [UnoCSS(), vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      // 'process.env': env,
    },
    bulid: {
      minify: 'terser', // <-- add
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  })
}
