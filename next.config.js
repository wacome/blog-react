/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 严格模式 (React Strict Mode)
  reactStrictMode: true,

  // 2. 图片优化 (Image Optimization)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.toycon.cn',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net', // 允许 jsDelivr CDN
      },
      {
        protocol: 'https',
        hostname: 'blog-1257292087.cos.ap-nanjing.myqcloud.com',
      },
    ],
  },

  // 3. 环境变量 (Environment Variables)
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // 4. 在生产环境中自动移除 console.log
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 5. 启用 SWC 压缩
  swcMinify: true,

  // 6. 独立的构建输出目录 (解决文件过大问题的关键！)
  output: 'standalone',
};

module.exports = nextConfig;