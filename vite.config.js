import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 1. 关键设置：使用相对路径
  // 如果不加这行，APK 打开会是白屏，因为手机上没有域名根目录
  base: './', 
  
  build: {
    // 2. 显式指定输出目录，防止工具找不到
    outDir: 'dist',
    rollupOptions: {
      output: {
        // 3. 解决报错的关键：强制使用 'es' 格式
        // 覆盖掉工具默认的 'system' 格式，修复 "Unimplemented: output.format: system" 错误
        format: 'es',
      },
    },
  },
})