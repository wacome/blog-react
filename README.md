# 博客前端

这是一个使用 React、Next.js 和 Tailwind CSS 开发的博客前端项目。

## 项目结构

```
blog-react/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── app/         # Next.js App Router
│   ├── components/  # React组件
│   ├── lib/         # 工具函数
│   └── styles/      # 样式
├── tailwind.config.ts  # Tailwind配置
└── next.config.js      # Next.js配置
```

## 功能

- 博客文章展示
- 标签和分类
- 文章归档
- 图书馆展示
- 评论系统
- 后台管理界面
  - 文章管理
  - 评论管理
  - 标签管理
  - 友链管理
  - 图书管理
  - 一言管理
  - 统计信息

## 开发环境

- Node.js 18+
- React 18
- Next.js 14
- Tailwind CSS 3

## 安装和运行

1. 克隆仓库

```bash
git clone <repository-url>
cd blog-react
```

2. 安装依赖

```bash
npm install
```

3. 运行开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

5. 运行生产版本

```bash
npm start
```

## 项目预览

访问 http://localhost:3000 查看项目运行效果。

## 项目技术栈

- React - 用户界面库
- Next.js - React框架
- Tailwind CSS - 样式库
- Framer Motion - 动画库
- Zustand - 状态管理
- React-Markdown - Markdown渲染
- Axios - HTTP请求
- date-fns - 日期处理

## 贡献

欢迎提交 Issues 和 Pull Requests。
