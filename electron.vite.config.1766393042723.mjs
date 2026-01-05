// electron.vite.config.mjs
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    publicPath: './',
    server: {
      host: '0.0.0.0'
      // 暴露到网络
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview'
          }
        }
      }),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@renderer/styles/var.scss" as *;`
        }
      }
    }
  }
})
export { electron_vite_config_default as default }
