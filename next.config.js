/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 严格模式 (React Strict Mode)
  // 帮助识别潜在问题，建议在开发环境中开启。
  reactStrictMode: true,

  // 2. 图片优化 (Image Optimization)
  // 配置允许加载图片的外部域名，增强安全性。
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.toycon.cn', // 允许您自己博客的图片
        port: '',
        pathname: '/uploads/**', // 只允许 /uploads/ 路径下的图片
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // 允许 GitHub 头像
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net', // 允许 jsDelivr CDN
      },
      {
        protocol: 'https',
        hostname: 'blog-1257292087.cos.ap-nanjing.myqcloud.com', // 允许 GitHub 原始内容
      },
    ],
  },

  // 3. 环境变量 (Environment Variables)
  // 将后端的 API 地址配置为环境变量，方便不同环境切换。
  // 在项目根目录的 .env.local 文件中添加 API_BASE_URL=http://localhost:8080
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // 4. 移除 console.log (Remove console.log in Production)
  // 在生产环境中自动移除所有 console.log 语句，减小打包体积并提升安全性。
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 5. SWC 编译器配置 (SWC Minification)
  // Next.js 默认使用 SWC 进行编译和压缩，速度很快。通常无需额外配置。
  swcMinify: true,

  // 6. 独立的构建输出目录 (Standalone Output)
  // 在构建时创建一个独立的 `standalone` 文件夹，包含所有必需的依赖，
  // 非常适合 Docker 部署，可以极大减小 Docker 镜像的体积。
  output: 'standalone',
};

module.exports = nextConfig;