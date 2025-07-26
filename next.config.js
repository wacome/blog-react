/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com', 'api.toycon.cn', 'blog-1257292087.cos.ap-nanjing.myqcloud.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
      {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://cdn.jsdelivr.net https://blog-1257292087.cos.ap-nanjing.myqcloud.com https://tse2-mm.cn.bing.net https://user-images.githubusercontent.com https://raw.githubusercontent.com",
              "connect-src 'self' http://localhost:8080 https://fonts.googleapis.com https://fonts.gstatic.com https://api.toycon.cn",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self' chrome-extension://*"
            ].join('; ')
          }
        ]
      }
    ];
      },
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const apiBaseUrl = isDevelopment ? 'http://localhost:8080' : 'https://api.toycon.cn';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBaseUrl}/uploads/:path*`,
      },]
  },
};

module.exports = nextConfig;