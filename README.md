# 🪲 Kane's Beetle Journal

这是一个为孩子设计的独角仙（锹甲）饲养记录网站，用于记录从幼虫到成虫的完整成长过程，界面友好、操作简单，适合孩子使用。

## 🌟 主要功能

- 📖 独角仙饲养手册：提供基础饲养知识和趣味科普
- 📸 上传观察记录：上传照片和文字记录饲养过程
- 📅 成长时间线：按时间顺序展示所有记录
- 🎮 有趣互动：孩子友好的界面设计和互动元素

## 🛠 技术栈

- **前端框架**：React + Next.js + TypeScript
- **数据存储**：Firebase Firestore
- **图片存储**：Firebase Storage
- **样式**：Tailwind CSS + 自定义组件

## 🚀 本地开发

1. **克隆项目**：
```bash
git clone https://github.com/your-username/kanes-beetle-journal.git
cd kanes-beetle-journal
```

2. **安装依赖**：
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**：
   创建 `.env.local` 文件，并添加 Firebase 配置：
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **启动开发服务器**：
```bash
npm run dev
# 或
yarn dev
```

5. **访问本地网站**：
   打开浏览器访问 http://localhost:3000

## 🌩 部署上线

### 使用 Vercel 部署（推荐）

1. **创建 Vercel 账号**：
   访问 [Vercel](https://vercel.com/) 并使用 GitHub 账号注册

2. **导入项目**：
   在 Vercel 控制台，点击 "Import Project" 并选择你的 GitHub 仓库

3. **配置环境变量**：
   在部署设置中，添加之前的 Firebase 环境变量

4. **部署**：
   点击 "Deploy" 按钮，Vercel 会自动构建并部署你的应用

5. **自定义域名**（可选）：
   在项目设置中，可以添加自定义域名

### 使用 Firebase Hosting 部署

1. **安装 Firebase CLI**：
```bash
npm install -g firebase-tools
```

2. **登录 Firebase**：
```bash
firebase login
```

3. **初始化项目**：
```bash
firebase init hosting
```
   选择你的 Firebase 项目，并将 `out` 设为公共目录

4. **构建项目**：
```bash
npm run build
npm run export
# 或
yarn build
yarn export
```

5. **部署到 Firebase**：
```bash
firebase deploy --only hosting
```

## 📝 Firebase 数据库设置

1. **创建 Firestore 集合**：
   - 集合名称：`beetle_logs`
   - 字段：
     - `note`: string（文字记录）
     - `photoURL`: string（图片URL）
     - `createdAt`: timestamp（创建时间）

2. **设置安全规则**：
   在 Firebase 控制台 -> Firestore -> 规则，添加：
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. **Storage 安全规则**：
   在 Firebase 控制台 -> Storage -> 规则，添加：
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

> 注意：生产环境建议设置更严格的安全规则。

## 🤔 遇到问题？

1. **无法连接 Firebase**：
   - 检查 `.env.local` 文件中的配置是否正确
   - 确认 Firebase 项目是否已正确创建
   - 确认 Firestore 和 Storage 是否已启用

2. **图片上传失败**：
   - 检查 Storage 安全规则是否正确
   - 确认网络连接是否正常

3. **时间线不显示内容**：
   - 确认是否有成功上传的记录
   - 检查 Firestore 安全规则是否允许读取

## 📄 许可

MIT License 