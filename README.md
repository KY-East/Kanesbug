# 🪲 Kane的独角仙成长日志

这是一个为孩子Kane设计的独角仙（锹甲）饲养记录网站，用于记录从幼虫到成虫的完整成长过程，界面友好、操作简单，适合孩子使用。

## 📋 功能特点

- 📝 **上传记录**：上传照片和观察笔记，记录每个成长阶段
- 📅 **时间线展示**：按时间线展示所有记录，直观展现成长过程
- 📚 **饲养手册**：提供独角仙饲养的基本知识和趣味信息
- 🎨 **精美界面**：采用适合儿童的界面设计，灵感来自宫崎骏风格

## 🛠️ 技术栈

- **前端**：React, Next.js, TypeScript
- **后端**：Firebase (Firestore, Storage)
- **部署**：Vercel/Firebase Hosting

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- Firebase 项目

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/kane-beetle-journal.git
   cd kane-beetle-journal
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置Firebase**
   - 在 [Firebase控制台](https://console.firebase.google.com/) 创建新项目
   - 启用 Firestore 和 Storage 服务
   - 创建 `.env.local` 文件并添加Firebase配置：
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
/
├── components/       # React组件
├── lib/              # 工具函数和Firebase配置
├── pages/            # Next.js页面
│   ├── index.tsx     # 首页（独角仙手册）
│   ├── upload.tsx    # 上传记录页面
│   └── timeline.tsx  # 时间线展示页面
├── public/           # 静态资源
│   └── images/       # 图片资源
└── styles/           # 样式文件
```

## 🔧 常见问题解决

### Firebase Storage CORS错误

如果遇到CORS相关错误，请设置Firebase Storage的CORS配置：

1. 创建 `cors.json` 文件：
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://localhost:3001", "您的网站域名"],
       "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": [
         "Content-Type", 
         "Content-Length", 
         "Content-Disposition", 
         "Content-Encoding",
         "Authorization", 
         "Origin", 
         "Accept"
       ]
     }
   ]
   ```

2. 使用Google Cloud SDK设置CORS：
   ```bash
   gsutil cors set cors.json gs://your-project-id.appspot.com
   ```

### Content Security Policy (CSP) 错误

如果遇到CSP相关错误，检查 `next.config.js` 是否包含以下配置：

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'..."
          }
        ]
      }
    ];
  }
};
```

## 📝 贡献指南

欢迎贡献您的代码和想法！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

项目采用 MIT 许可证 - 详情参见 LICENSE 文件 