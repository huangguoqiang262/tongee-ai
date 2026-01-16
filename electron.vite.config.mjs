import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    base: './',
    server: {
      host: '0.0.0.0' // 暴露到网络
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
      svgLoader({
        svgoConfig: {
          plugins: [
            {
              name: 'prefixIds',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            },
            // 确保SVG使用currentColor
            {
              name: 'addAttributesToSVGElement',
              params: {
                attributes: [{ fill: 'currentColor' }]
              }
            }
          ]
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
