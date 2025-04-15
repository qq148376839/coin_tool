/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus' {
  export const ElMessage: any
  export const ElMessageBox: any
}

declare module '@element-plus/icons-vue' {
  export const ArrowLeft: any
} 