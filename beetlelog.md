# 🪲 Kane's Beetle Journal

## 🧒 项目目标
本项目是为我的孩子 Kane 创建的一个独角仙（锹甲）饲养记录网站，记录从幼虫孵化、化蛹、羽化到成虫的全过程，包含照片上传、观察日志、时间线展示等功能。

## 🛠 使用技术
- **React/Next.js**：基于 Cursor 开发（自动生成页面与组件）
- **Firebase Firestore**：记录观察文字内容和时间戳
- **Firebase Storage**：用于存储上传的照片
- **Tailwind CSS**：用于界面美化（可选）
- **TypeScript**：类型安全提升开发体验

## 📝 更新日志

### 2024-03-28
1. 创建基础项目结构和文件
   - 初始化 Next.js 项目
   - 配置 Firebase 连接
   - 创建基础组件和页面
   - 实现上传和展示功能

2. 修改 Layout 组件样式
   - 简化导航栏设计
   - 更改导航项目样式为蓝色链接
   - 移除观察笔记入口（暂未开发）
   - 调整页面间距和阴影效果
   ```tsx
   // components/Layout.tsx
   import Link from "next/link";
   import { ReactNode } from "react";

   export default function Layout({ children }: { children: ReactNode }) {
     return (
       <div className="min-h-screen bg-gray-50">
         <header className="bg-white shadow p-4 flex justify-between items-center">
           <h1 className="text-xl font-bold">🐛 独角仙成长日志</h1>
           <nav className="space-x-4">
             <Link href="/" className="text-blue-600 hover:underline">
               首页
             </Link>
             <Link href="/upload" className="text-blue-600 hover:underline">
               上传记录
             </Link>
             <Link href="/timeline" className="text-blue-600 hover:underline">
               成长时间线
             </Link>
           </nav>
         </header>
         <main className="p-4">{children}</main>
       </div>
     );
   }
   ```

3. 创建时间线页面
   - 实现 Firestore 数据获取
   - 按时间倒序展示记录
   - 添加空状态提示
   - 优化页面布局和样式
   ```tsx
   // pages/timeline.tsx
   import { useEffect, useState } from "react";
   import { collection, query, orderBy, getDocs } from "firebase/firestore";
   import { db } from "../lib/firebase";
   import Layout from "../components/Layout";
   import TimelineItem from "../components/TimelineItem";

   interface LogEntry {
     id: string;
     photoURL: string;
     note: string;
     createdAt: { seconds: number };
   }

   export default function TimelinePage() {
     const [logs, setLogs] = useState<LogEntry[]>([]);

     useEffect(() => {
       const fetchLogs = async () => {
         const q = query(collection(db, "beetle_logs"), orderBy("createdAt", "desc"));
         const snapshot = await getDocs(q);
         const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LogEntry));
         setLogs(results);
       };
       fetchLogs();
     }, []);

     return (
       <Layout>
         <div className="max-w-2xl mx-auto">
           <h1 className="text-2xl font-bold mb-6">🕰️ 成长时间线</h1>
           {logs.length === 0 ? (
             <p className="text-gray-500">暂无记录，请先上传一条吧！</p>
           ) : (
             <div className="space-y-6">
               {logs.map((log) => (
                 <TimelineItem key={log.id} entry={log} />
               ))}
             </div>
           )}
         </div>
       </Layout>
     );
   }
   ```

4. 创建上传表单组件
   - 实现照片上传预览
   - 添加观察记录输入
   - 与 Firebase 集成
   - 美化界面和交互
   ```tsx
   // components/RecordForm.tsx（部分代码）
   export default function RecordForm() {
     const [file, setFile] = useState<File | null>(null);
     const [note, setNote] = useState("");
     const [uploading, setUploading] = useState(false);
     const [success, setSuccess] = useState(false);
     const [previewUrl, setPreviewUrl] = useState<string | null>(null);

     // 文件选择处理
     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const selectedFile = e.target.files?.[0] || null;
       setFile(selectedFile);
       
       // 创建预览图
       if (selectedFile) {
         const reader = new FileReader();
         reader.onloadend = () => {
           setPreviewUrl(reader.result as string);
         };
         reader.readAsDataURL(selectedFile);
       } else {
         setPreviewUrl(null);
       }
     };

     // 上传处理
     const handleUpload = async () => {
       // 上传逻辑实现...
     };

     return (
       <div className="bg-white rounded-lg shadow-md p-6">
         {/* 表单内容 */}
       </div>
     );
   }
   ```

5. 完善首页，增加趣味性
   - 添加趣味独角仙知识卡片
   - 改进饲养指南展示
   - 使用孩子友好的色彩和互动元素
   - 优化阅读体验

6. 创建全局样式
   - 定义孩子友好的 UI 组件
   - 添加有趣的交互动画
   - 优化移动端体验
   - 提高整体一致性

7. 完善 TimelineItem 展示
   - 优化照片展示效果
   - 美化日期和文字布局
   - 添加趣味的布局元素
   - 提升整体美观度

8. 补充部署文档
   - Firebase 配置详细说明
   - Vercel 部署流程
   - 本地开发环境设置
   - 常见问题解决方案

### 2024-03-29
1. 修复 Tailwind CSS 配置问题
   - 修正 postcss.config.js 文件，将 '@tailwindcss/postcss' 改为 'tailwindcss'
   - 解决 CSS 加载问题，确保正确引入全局样式
   - 重启开发服务器并确认样式加载正确

2. 内容丰富与扩展
   - 增加了约30条独角仙趣味知识
   - 扩展饲养指南，从3个部分增加到5个部分
   - 为每个指南类别添加更详细的具体建议和提示
   - 使用不同颜色区分不同类别的指南信息

3. 改进 Layout 组件，提升儿童友好度
   - 添加更多emoji和视觉提示
   - 增加天数计数器显示照顾独角仙的天数
   - 添加页脚信息和鼓励性文字
   - 改善移动设备适配，使用响应式设计

4. 创建备用纯CSS页面
   - 创建不依赖Tailwind的备用页面，使用内联样式
   - 实现基本的主页、上传页和时间线页作为备份
   - 确保在样式加载失败时仍能提供基本功能

### 2024-03-30
1. 优化页面背景与装饰效果
   - 移除了重复拼贴的背景模式，改为更简洁的设计
   - 在饲养手册部分添加ghibli-bg-pattern.png作为背景装饰
   - 调整背景图不透明度为0.4，提高可见度
   - 确保所有按钮和交互元素正常工作

2. 提高视觉吸引力和儿童友好度
   - 优化卡片布局，使用更清晰的边框和阴影
   - 调整颜色方案，确保文字易于阅读
   - 在上传页面使用ghiblibug.png作为装饰元素
   - 在时间线页面应用统一的视觉风格

3. 解决技术问题
   - 修复JavaScript语法错误（茧字符引起的引号嵌套问题）
   - 暂时移除对Tailwind CSS的依赖，使用内联样式代替
   - 确保各页面之间的样式一致性
   - 改善响应式布局，提升在不同设备上的体验

4. 页面功能确认
   - 首页：成功展示饲养手册和趣味知识
   - 上传页：图片上传和笔记功能正常工作
   - 时间线：以美观的方式展示历史记录

## ✅ 项目结构
```
.
├── lib/
│   └── firebase.ts               # Firebase 初始化配置
│
├── pages/
│   ├── index.tsx                 # 首页：独角仙手册展示
│   ├── upload.tsx                # 上传记录页面
│   ├── timeline.tsx              # 时间线展示所有记录
│   └── notes.tsx                 # 儿子的观察日记（开发中）
│
├── components/
│   ├── RecordForm.tsx            # 上传记录表单
│   ├── TimelineItem.tsx          # 时间线中的单条记录展示
│   └── Layout.tsx                # 公共布局组件
│
├── styles/
│   └── globals.css               # 全局样式 / Tailwind
│
├── .env.local                    # Firebase 环境变量
├── README.md                     # 项目说明与部署指南
├── beetlelog.md                  # 开发日志
```

## 📄 页面功能说明
| 页面         | 功能说明                                                  |
|--------------|-----------------------------------------------------------|
| `/`          | 首页，展示《独角仙饲养手册》，趣味知识，跳转记录页       |
| `/upload`    | 上传页面：填写观察内容 + 上传照片，保存到 Firebase       |
| `/timeline`  | 展示所有观察记录（按时间排序，图文结合）                 |
| `/notes`     | 自由记录儿子想说的话、想画的图（功能开发中）             |


## 🔒 Firebase 安全规则（开发阶段）
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 🏁 下一步计划
- ✅ 上传图片 + 日志功能
- ✅ 成长时间线展示功能
- ✅ 美化孩子友好的界面
- ⏳ 添加更多趣味互动元素
- ⏳ 儿子自由笔记页（支持画画、写日记）
- ⏳ 部署上线（Firebase Hosting 或 Vercel）
- ⏳ 添加昆虫成长阶段标签功能