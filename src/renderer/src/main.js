import VMdPreview from '@kangc/v-md-editor/lib/preview'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'
import '@kangc/v-md-editor/lib/style/preview.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
// 引入复制代码插件和对应的 CSS 文件
import createCopyCodePreview from '@kangc/v-md-editor/lib/plugins/copy-code/index'
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css'
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/npm.js'
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import LoginModel from './components/LoginModel'
import './styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.component('Editor', Editor)
app.component('Toolbar', Toolbar)
app.use(LoginModel)
VMdPreview.use(vuepressTheme, {
  Prism
})
VMdPreview.use(createLineNumbertPlugin())
VMdPreview.use(createCopyCodePreview())
VMdPreview.use(createMermaidPlugin())
app.use(VMdPreview)
app.mount('#app')
