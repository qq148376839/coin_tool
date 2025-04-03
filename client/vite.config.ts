import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Element Plus 相关函数
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      // 自动导入 Element Plus 组件
      resolvers: [ElementPlusResolver()],
    }),
  ],
  build: {
    // 添加构建配置
    minify: 'terser',
    sourcemap: false,
    // 忽略类型检查
    typescript: {
      ignoreBuildErrors: true
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['socket.io-client'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'socket.io-client': 'io'
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
