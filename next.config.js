/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'img.picui.cn', 'img1.doubanio.com', 'avatars.githubusercontent.com'],
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000 http://localhost:8080 https://cdn.jsdelivr.net https://fonts.googleapis.com chrome-extension://*",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "img-src 'self' data: blob: http://localhost:3000 http://localhost:8080 https://cdn.jsdelivr.net https://tse2-mm.cn.bing.net https://images.unsplash.com https://img1.doubanio.com https://img.picui.cn https://qlogo.cn https://p.qlogo.cn https://picx.zhimg.com https://pic1.zhimg.com https://pic2.zhimg.com https://pic3.zhimg.com https://pic4.zhimg.com https://pic5.zhimg.com https://pic6.zhimg.com https://pic7.zhimg.com https://pic8.zhimg.com https://pic9.zhimg.com https://i.loli.net https://s1.ax1x.com https://user-images.githubusercontent.com https://raw.githubusercontent.com https://avatars.githubusercontent.com https://files.catbox.moe https://pbs.twimg.com https://media.istockphoto.com https://images.pexels.com https://images.unsplash.com https://lh3.googleusercontent.com https://cdn.jsdelivr.net;",
              "connect-src 'self' http://localhost:3000 http://localhost:8080 https://fonts.googleapis.com https://fonts.gstatic.com",
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
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/uploads/:path*', // 代理到后端
      },
    ];
  },
};

module.exports = nextConfig; 