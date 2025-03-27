import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    AutoImport({
      // 自动导入 Element Plus 相关函数
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      // 自动导入 Element Plus 组件
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
