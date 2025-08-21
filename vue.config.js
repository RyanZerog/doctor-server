import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/doctor-server/',   // ⚠️ 这里一定要写你的 GitHub 仓库名
  build: {
    outDir: 'dist',        // 默认就是 dist，如果你想生成 build 就改成 'build'
  },
  server: {
    port: 3000,            // 本地开发时访问 http://localhost:3000
    open: true             // 启动后自动打开浏览器
  }
})
