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

### 2024-03-31 ✅ 上线准备阶段完成
1. **科学手帐PDF功能全部完成**
   - 修复字体加载问题，优化为仅使用小体积字体（站酷快乐体、站酷小薇体）
   - 解决图片显示问题，统一图片URL属性，修正代理API URL构建方式
   - 添加图片诊断工具，帮助排查图片加载问题
   - 完善多记录布局功能，一页可展示多条记录，大幅减少打印页数
   - 支持根据记录类型（幼虫/蛹/成虫阶段）筛选生成PDF

2. **系统优化与文档整合**
   - 整合了PDF功能文档，将所有文档集中到docs目录
   - 移除过大的字体文件，优化系统性能
   - 完善了错误处理机制，提高系统稳定性
   - 优化资源加载方式，减少网络请求开销

3. **项目全面测试**
   - 验证所有核心功能：记录上传、时间线展示、PDF生成等
   - 确认各种设备（电脑、平板、手机）上的显示效果
   - 测试不同浏览器兼容性
   - 所有已知问题都已修复

4. **上线准备**
   - 完成部署文档更新，确保部署流程清晰
   - 确认Firebase设置和权限配置正确
   - 准备好备份和恢复策略
   - 项目已准备好进入正式上线阶段

### 2024-03-30
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

### 2024-06-26
1. 实现阶段标签替换功能
   - 修改 `upload.tsx` 中的 `addStageTag` 函数
   - 优化标签添加逻辑，确保点击新标签时替换掉已有的标签
   - 支持 `#幼虫阶段`、`#蛹阶段` 和 `#成虫阶段` 三种标签
   - 实现标签点击后的高亮反馈效果
   ```typescript
   // upload.tsx 中的标签处理函数
   const addStageTag = (tag: string) => {
     // 移除所有已有的阶段标签
     let newNote = note;
     ['#幼虫阶段', '#蛹阶段', '#成虫阶段'].forEach(stage => {
       if (newNote.startsWith(stage)) {
         newNote = newNote.substring(stage.length).trimStart();
       }
     });
     
     // 添加新的标签
     setNote(tag + ' ' + newNote);
   };
   ```

2. 实现记录分类功能
   - 为时间线页面添加 "成长阶段" 和 "日常记录" 两个标签页
   - 成长阶段：显示有阶段标签（以 `#幼虫阶段`、`#蛹阶段`、`#成虫阶段` 开头）的记录
   - 日常记录：显示没有阶段标签的记录
   - 每个分类有单独的样式和计数显示
   - 实现标签页切换动效和高亮状态
   ```typescript
   // 根据当前标签页筛选日志
   const filteredLogs = useMemo(() => {
     if (activeTab === 'growth') {
       return logs.filter(log => log.hasStageTag);
     } else {
       return logs.filter(log => !log.hasStageTag);
     }
   }, [logs, activeTab]);
   ```

3. 增强记录管理功能
   - 为每条记录添加编辑和删除功能
   - 实现编辑模式的文本框和保存逻辑
   - 添加删除确认机制，防止意外删除
   - 保持界面简洁，适合儿童使用
   - 实现数据刷新机制，确保操作后页面及时更新
   ```typescript
   // 删除确认逻辑
   const handleDeleteConfirm = () => {
     setIsDeleting(true);
   };
   
   // 处理确认删除
   const handleConfirmDelete = async () => {
     try {
       const entryRef = doc(db, 'logs', entry.id);
       await deleteDoc(entryRef);
       
       // 删除成功，刷新列表
       if (onUpdate) onUpdate();
     } catch (err) {
       console.error('删除失败:', err);
       alert('删除失败，请重试');
     } finally {
       setIsDeleting(false);
     }
   };
   ```

4. 扩展数据模型
   - 在 `LogEntry` 接口中添加 `hasStageTag` 字段
   - 完善 `eventType` 和 `eventIcon` 字段定义
   - 优化自动事件检测功能
   - 确保数据结构的一致性
   ```typescript
   export interface LogEntry {
     id: string;
     photo?: string;
     photoURL?: string;
     note: string;
     createdAt: { seconds: number };
     relativeDay?: number; // 相对于第一次记录的天数
     relativeWeek?: number; // 相对于第一次记录的周数
     tags?: string[]; // 标签：蜕皮、进食等
     eventType?: string; // 事件类型
     eventIcon?: string; // 事件图标
     hasStageTag?: boolean; // 是否有阶段标签
   }
   ```

5. 重构界面交互
   - 优化了成长阶段和日常记录的样式区分
   - 添加记录数量显示
   - 改善空状态提示信息
   - 提升整体视觉一致性

### 2024-06-27
1. 增强记录分类功能
   - 添加"全部"标签页，显示所有记录
   - 实现"日常记录"中按内容类型分组展示（进食、蜕皮等）
   - 添加"快速归档"功能，便于将日常记录归类为成长阶段
   - 添加成长阶段统计信息，显示各阶段的记录数量和持续天数
   - 优化界面布局，提升用户体验
   ```typescript
   // 按事件类型分组展示记录
   export function groupLogsByEventType(logs: LogEntry[]): Record<string, LogEntry[]> {
     if (!logs || logs.length === 0) {
       return {};
     }
     
     const result: Record<string, LogEntry[]> = {};
     
     logs.forEach(log => {
       // 检测事件类型
       const { type } = detectSpecialEvents(log.note || '');
       const eventType = log.eventType || type;
       
       // 如果类型不存在，则创建空数组
       if (!result[eventType]) {
         result[eventType] = [];
       }
       
       // 将日志添加到对应类型数组
       result[eventType].push(log);
     });
     
     return result;
   }
   ```

2. 阶段归档功能实现
   - 为日常记录添加"归档"按钮，支持快速标记为成长阶段
   - 支持选择"幼虫阶段"、"蛹阶段"或"成虫阶段"
   - 自动更新记录，并实时刷新界面显示
   - 保持界面简洁，操作直观易懂
   ```typescript
   // 处理归档功能
   const handleArchive = async (stage: string) => {
     if (!stage) return;
     
     setIsSaving(true);
     try {
       // 获取当前笔记内容，移除可能已存在的标签
       let newNote = entry.note;
       ['#幼虫阶段', '#蛹阶段', '#成虫阶段'].forEach(existingStage => {
         if (newNote.startsWith(existingStage)) {
           newNote = newNote.substring(existingStage.length).trimStart();
         }
       });
       
       // 添加新标签到笔记开头
       newNote = `${stage} ${newNote}`;
       
       // 更新记录
       const entryRef = doc(db, 'logs', entry.id);
       await updateDoc(entryRef, {
         note: newNote,
         hasStageTag: true
       });
       
       // 更新成功
       if (onUpdate) onUpdate();
     } catch (err) {
       console.error('归档失败:', err);
       alert('归档失败，请重试');
     } finally {
       setIsSaving(false);
     }
   };
   ```

3. 统计信息展示功能
   - 在"成长阶段"页面添加各阶段的统计信息
   - 显示每个阶段的记录数量和持续天数
   - 使用卡片式布局，视觉效果清晰
   - 适当使用图标和颜色增强可读性
   ```typescript
   // 计算阶段统计信息
   const stageStats = useMemo(() => {
     const stats: Record<string, StageStats> = {
       '幼虫阶段': { count: 0 },
       '蛹阶段': { count: 0 },
       '成虫阶段': { count: 0 }
     };
     
     logs.forEach(log => {
       // 检查笔记开头是否包含阶段标签
       const note = log.note || '';
       let stage = '';
       
       if (note.startsWith('#幼虫阶段')) {
         stage = '幼虫阶段';
       } else if (note.startsWith('#蛹阶段')) {
         stage = '蛹阶段';
       } else if (note.startsWith('#成虫阶段')) {
         stage = '成虫阶段';
       }
       
       if (stage) {
         const date = new Date(log.createdAt.seconds * 1000);
         stats[stage].count++;
         
         // 更新最早和最晚日期，用于计算持续天数
         if (!stats[stage].firstDate || date < stats[stage].firstDate) {
           stats[stage].firstDate = date;
         }
         
         if (!stats[stage].lastDate || date > stats[stage].lastDate) {
           stats[stage].lastDate = date;
         }
       }
     });
     
     return stats;
   }, [logs]);
   ```

### 2024-06-28
1. 实现数据备份与导出功能
   - 创建备份导出专用页面，提供多种数据导出格式
   - 支持JSON格式导出，保留完整数据结构和内容
   - 支持CSV格式导出，方便在电子表格软件中查看
   - 添加备份统计信息，显示记录数量和时间范围
   - 优化用户界面，提供明确的操作引导
   ```typescript
   // 导出为JSON格式
   const exportToJSON = () => {
     try {
       // 准备导出数据，移除循环引用
       const exportData = logs.map(log => {
         const { id, photo, note, createdAt, hasStageTag, eventType, eventIcon } = log;
         const timestamp = createdAt ? new Date(createdAt.seconds * 1000) : new Date();
         
         return {
           id,
           photo,
           note,
           createdAt: timestamp.toISOString(),
           hasStageTag,
           eventType,
           eventIcon,
           date: timestamp.toLocaleString('zh-CN')
         };
       });
       
       // 创建用于下载的Blob
       const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       
       // 创建下载链接
       const a = document.createElement('a');
       a.href = url;
       a.download = `kane-beetle-logs-${new Date().toISOString().split('T')[0]}.json`;
       document.body.appendChild(a);
       a.click();
       
       // 清理
       URL.revokeObjectURL(url);
       document.body.removeChild(a);
     } catch (error) {
       console.error('导出JSON失败：', error);
       setError('导出失败，请重试');
     }
   };
   ```

2. 添加导航菜单项
   - 在所有页面添加备份导出页面的导航链接
   - 保持界面风格一致，使用相同的导航栏样式
   - 使用适当的高亮状态指示当前页面

3. 优化备份用户体验
   - 添加备份提示信息，引导用户定期备份数据
   - 提供选择不同导出格式的选项（JSON和CSV）
   - 显示备份统计信息，包括记录数量和时间范围
   - 设计清晰的视觉反馈，指示导出操作是否成功

### 2024-07-01
1. 实现科学手帐风格PDF导出功能
   - 创建`science-journal.tsx`页面，添加PDF生成功能
   - 引入jsPDF和jspdf-autotable依赖处理PDF生成
   - 实现按不同样式和时间范围生成PDF的功能
   - 添加进度条和状态反馈，提升用户体验
   - 支持生成封面、目录、详细观察记录和统计信息

2. 添加科学手帐资源文件
   - 添加纸张纹理背景图：notebook-paper.jpg
   - 添加装饰元素：tape.png（胶带）和paperclip.png（回形针）
   - 添加昆虫生长周期图：beetle-stages.png
   - 创建资源预加载功能，确保PDF生成时图片可用

3. 改进Layout组件，添加科学手帐导航入口
   - 在所有页面导航栏添加"科学手帐"入口
   - 保持界面风格统一，确保流畅的用户体验
   - 将备份与科学手帐功能相互关联

4. 优化PDF内容呈现
   - 使用装饰元素增强科学笔记本风格
   - 为照片添加胶带和回形针装饰效果
   - 实现照片轻微随机旋转，增加手工感
   - 设计清晰的观察记录页面布局

5. 修复PDF中文字体显示问题
   - 创建`utils/pdfFonts.ts`工具，提供中文字体支持函数
   - 实现`addChineseFont`函数设置PDF适用的中文字体配置
   - 添加`splitChineseText`函数安全分割中文文本
   - 使用`formatChineseDate`函数解决日期显示问题
   - 为所有PDF生成函数添加错误处理和降级机制
   - 确保即使字体不可用也能降级到英文显示内容

### 2024-07-02
1. 彻底解决PDF中文字体显示问题
   - 改进`utils/pdfFonts.ts`工具，从CDN加载思源黑体
   - 实现异步字体加载和嵌入功能
   - 修改`addChineseFont`函数为异步函数，返回字体加载状态
   - 优化PDF生成流程，支持优雅降级到简单字体
   - 确保在字体加载失败时仍能使用安全文本渲染方法生成可读PDF
   ```typescript
   // 从CDN加载思源黑体
   export const addChineseFont = async (doc: jsPDF) => {
     try {
       const fontUrl = "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/SubsetOTF/CN/NotoSansCJKsc-Regular.otf";
       const fontData = await fetchFont(fontUrl);
       
       if (fontData) {
         doc.addFileToVFS('NotoSansSC-Regular.ttf', fontData);
         doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
         doc.setFont('NotoSansSC');
         doc.setFontSize(12);
         return true;
       }
     } catch (err) {
       // 降级方案
       doc.setFont('helvetica');
       doc.setFontSize(10);
       doc.setLanguage('zh-CN');
       return false;
     }
   };
   ```

2. 改进PDF生成流程
   - 修改`generateScienceJournalPDF`函数以支持异步字体加载
   - 增加字体加载状态检查和提示信息
   - 优化页面生成顺序，确保文档页面正确创建
   - 添加中文字体加载失败的备用处理方案
   - 改进用户体验，使PDF生成过程更加鲁棒

### 2024-07-03
1. 新增科学手帐多种中文字体支持
   - 添加5种精选中文字体选项：
     - 站酷快乐体（儿童友好，俏皮）
     - 站酷小薇体（清新优雅）
     - 马善政书法（手写风格）
     - 得意黑（科技感童趣）
     - 思源黑体（正式风格）
   - 从CDN动态加载字体，减少项目体积
   - 实现字体预览功能，直观展示每种字体效果
   - 改进字体加载状态管理，添加加载中反馈
   - 优化字体切换UI，更加符合儿童使用习惯

2. 升级`pdfFonts.ts`工具
   - 重构字体管理模块，支持多种字体切换
   - 添加字体类型定义和相关辅助函数
   ```typescript
   export type ChineseFontType = 'noto' | 'zcool-kuaile' | 'zcool-xiaowei' | 'mashan-zheng' | 'smiley-sans';
   
   // 添加中文字体支持 - 从CDN加载字体
   export const addChineseFont = async (doc: jsPDF, fontType: ChineseFontType = 'noto') => {
     try {
       console.log(`尝试加载${getFontDisplayName(fontType)}...`);
       
       // 根据选择的字体类型获取CDN URL
       const fontUrl = getFontUrl(fontType);
       const fontData = await fetchFont(fontUrl);
       
       if (fontData) {
         // 字体文件名和字体名称
         const fontFileName = getFontFileName(fontType);
         const fontName = getFontName(fontType);
         
         // 添加字体到文档
         doc.addFileToVFS(fontFileName, fontData);
         doc.addFont(fontFileName, fontName, 'normal');
         doc.setFont(fontName);
         return true;
       }
     } catch (err) {
       // 降级方案...
     }
   };
   ```

### 2024-07-04
1. 改进PDF字体系统为本地化字体
   - 将字体文件从CDN加载改为本地存储，提升可靠性
   - 调整字体选择，移除马善政书法体
   - 新的字体加载路径结构：`public/fonts/`目录
   - 定义了清晰的字体映射结构，更易于维护
   ```typescript
   // 字体映射信息
   const fontMap: Record<ChineseFontType, { path: string, displayName: string }> = {
     'zcool-kuaile': {
       path: '/fonts/zhankukuaile.ttf',
       displayName: '站酷快乐体'
     },
     'zcool-xiaowei': {
       path: '/fonts/zhankuxiaowei.otf',
       displayName: '站酷小薇体'
     },
     'smiley-sans': {
       path: '/fonts/SmileySans-Oblique.otf',
       displayName: '得意黑'
     },
     'noto': {
       path: '/fonts/SourceHanSansCN-Heavy.otf',
       displayName: '思源黑体'
     }
   };
   ```

2. 分离字体类型定义
   - 创建独立的`types.ts`文件，便于跨文件类型复用
   - 修改字体类型定义，保持项目一致性
   ```typescript
   // 支持的中文字体类型
   export type ChineseFontType = 'noto' | 'zcool-kuaile' | 'zcool-xiaowei' | 'smiley-sans';
   ```

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
│   ├── backup.tsx                # 备份导出页面
│   ├── science-journal.tsx       # 科学手帐PDF生成页面
│   └── notes.tsx                 # 儿子的观察日记（开发中）
│
├── utils/
│   └── pdfFonts.ts               # PDF中文字体支持工具
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
- ✅ 记录分类功能增强
  - ✅ 添加"全部"标签页，显示所有记录
  - ✅ 实现"日常记录"中按内容类型分组
  - ✅ 为"日常记录"添加快速归档按钮
  - ✅ 添加成长阶段统计信息，如"幼虫阶段已记录X天"
- ✅ 数据备份与导出功能
  - ✅ 添加数据导出功能，支持导出为JSON或CSV格式
  - ✅ 提供备份统计信息和使用指南
  - ⏳ 实现简单的备份恢复机制
- ✅ 科学手帐风格PDF导出功能
  - ✅ 设计科学笔记本风格报告，支持打印收藏
  - ✅ 包含照片、观察记录和统计数据
  - ✅ 详细设计文档: [科学手帐风格PDF设计方案](docs/science-journal-pdf-design.md)
  - ✅ 修复中文字体显示问题，添加字体支持工具
  - ⏳ 优化PDF生成性能和显示效果
  - ⏳ 支持嵌入自定义字体，实现更美观的中文显示
  - ⏳ 添加更多风格模板和装饰元素
- ⏳ 添加更多趣味互动元素
- ⏳ 儿子自由笔记页（支持画画、写日记）
- ⏳ 部署上线（Firebase Hosting 或 Vercel）
- ⏳ 图片优化与管理
  - ⏳ 优化图片加载性能
  - ⏳ 实现图片缩略图功能
  - ⏳ 添加图片编辑功能（裁剪、旋转等）
  - ⏳ 支持一次上传多张图片

# Kane的独角仙项目 - 问题排查记录

## 1. CORS和上传相关问题

### 初始问题
- Firebase Storage上传时出现CORS（跨域资源共享）错误
- 上传过程中卡住，没有明确的错误提示
- 上传成功但无法在时间线页面显示

### 排查过程
1. **Storage配置错误**
   - Firebase存储桶名称错误：原配置使用了`kane-s-rhinoceros.appspot.com`
   - 正确存储桶应为：`kane-s-rhinoceros.firebasestorage.app`
   - 修改了`lib/firebase.ts`中的配置

2. **CORS设置未应用**
   - 创建了`cors.json`配置文件
   - 使用Firebase CLI应用CORS设置：`firebase target:apply storage default kane-s-rhinoceros.firebasestorage.app`

3. **Firebase Storage未设置**
   - 发现Firebase Storage服务尚未在Firebase控制台中启用
   - 按照提示在Firebase控制台中设置Storage服务

4. **Storage规则阻止访问**
   - 发现默认规则设置为 `allow read, write: if false;`
   - 修改为 `allow read, write: if true;` 允许读写访问
   - 部署新规则：`firebase deploy --only storage`

5. **上传成功提示问题**
   - 上传成功但提示窗口不够明显
   - 修改成功提示样式，使其更加明显
   - 增加了模态窗口效果和自动关闭时间

6. **数据库字段不一致问题**
   - 上传页面使用的集合为 `logs`，照片字段为 `photo`
   - 时间线页面原使用 `beetle_logs`，期望字段为 `photoURL`
   - 修改时间线页面使用 `logs` 集合和 `photo` 字段

7. **安全问题 - API密钥泄露**
   - GitHub上暴露了Firebase API密钥
   - 修改配置使用环境变量：`process.env.NEXT_PUBLIC_FIREBASE_API_KEY`
   - 创建 `.env.local` 文件存储敏感信息
   - 更新 `.gitignore` 确保不提交环境变量文件

## 2. Firestore数据显示问题深入排查

### 更新：数据不显示问题排查
1. **集合名和字段名一致性问题**
   - 上传页(`upload.tsx`)使用的集合: `collection(db, 'logs')`
   - 时间线页(`timeline.tsx`)使用的集合: `collection(db, "logs")`
   - 上传页存储的字段名: `photo`, `note`, `createdAt`
   - 时间线页读取的字段名: `LogEntry { id: string; photoURL: string; note: string; createdAt: {...} }`
   - ⚠️ 问题：时间线页面定义的字段`photoURL`与上传页面存储的字段`photo`不一致

2. **组件中的字段名问题**
   - 发现`TimelineItem.tsx`组件中仍使用`photoURL`字段
   - 发现`timeline-basic.tsx`中也使用`photoURL`字段
   - 修改这些文件，将`photoURL`统一改为`photo`

3. **增强Firestore写入和读取逻辑**
   - 添加更详细的Firestore写入日志
   ```javascript
   console.log('准备写入Firestore，数据:', {
     photo: downloadURL,
     note: note,
     createdAt: 'serverTimestamp()'
   });
   
   try {
     const docRef = await addDoc(logRef, {...});
     console.log('🔥成功写入Firestore，文档ID:', docRef.id);
   } catch (firestoreError: any) {
     console.error('❌Firestore写入失败:', firestoreError);
     throw new Error(`Firestore写入失败: ${firestoreError?.message || '未知错误'}`);
   }
   ```

   - 增强时间线查询逻辑
   ```javascript
   console.log("开始从Firestore查询logs集合...");
   const q = query(collection(db, "logs"), orderBy("createdAt", "desc"));
   console.log("查询对象创建成功");
   
   const snapshot = await getDocs(q);
   console.log(`查询结果: 找到 ${snapshot.docs.length} 条记录`);
   
   if (snapshot.empty) {
     console.log("没有找到任何记录，集合可能为空");
     return;
   }
   
   const results = snapshot.docs.map((doc) => {
     const data = doc.data();
     console.log(`文档ID ${doc.id} 的数据:`, data);
     return { id: doc.id, ...data } as LogEntry;
   });
   ```

4. **错误处理改进**
   - 添加Firebase连接状态检查
   ```javascript
   // 尝试恢复可能的数据库连接问题
   console.log('尝试重新连接Firebase...');
   try {
     const app = getApp();
     console.log('Firebase应用已获取:', app.name);
   } catch (reconnectError) {
     console.error('Firebase重连失败:', reconnectError);
   }
   ```

5. **用户界面改进**
   - 增强错误提示样式和内容
   - 增加时间线跳转按钮
   - 优化成功提示，增加操作选项

### 系统性检查清单
- ✅ 检查集合名一致性：两处均使用`logs`
- ✅ 检查字段名一致性：已统一为`photo`, `note`, `createdAt`
- ✅ 检查组件模板使用的字段名：已统一为`photo`
- ✅ 检查Firebase配置：正确使用`kane-s-rhinoceros.firebasestorage.app`
- ✅ 检查安全规则：已配置为允许读写
- ✅ 增强错误处理：添加超时保护和详细日志
- ✅ 改进用户体验：增强提示和操作按钮

## 3. 最终解决方案与注意事项

### 最终解决步骤总结
1. 修正所有代码中的字段名不一致问题
2. 增强Firestore操作的错误处理和日志记录
3. 改进用户界面，提供更清晰的操作反馈
4. 系统性检查确保各部分配置一致

### 建议优化点
1. 考虑使用TypeScript类型定义共享数据模型，避免字段名不一致
2. 添加数据验证和清洁处理
3. 增加更多的用户引导和操作提示
4. 考虑添加自动重试机制应对网络波动

### 注意事项
1. 未来升级考虑添加身份验证和更严格的安全规则
2. 考虑对API密钥增加限制条件，只允许特定域访问
3. 定期检查Firebase日志确保没有滥用情况

# 照片显示问题解决记录 (2024-04-16)

## 1. 问题描述
- Firebase Storage照片URL在网页上无法正常显示
- 直接在浏览器中访问照片URL可以正常显示
- 通过`<img>`标签、背景图片和Next.js的Image组件都无法显示图片

## 2. 根本原因分析
1. **CORS/CSP限制**
   - Firebase Storage生成的图片URL包含临时Token和特殊字符
   - 这些URL在浏览器的跨域请求中被拦截或处理错误
   - Next.js的CSP设置可能阻止了外部图片加载

2. **URL编码问题**
   - 图片URL中包含大量特殊字符（如`%2F`、`%E6`等）
   - React/JSX可能对这些字符进行了二次编码，导致URL无效
   - 最终导致CDN返回404错误

3. **Storage Token问题**
   - Firebase的`alt=media&token=xxx`是临时访问凭证
   - 在React渲染过程中可能被错误处理
   - Next.js的Image组件优化功能可能与Firebase访问冲突

## 3. 解决方案实施

### 3.1 创建服务器端代理API
- 实现`pages/api/proxy-image.ts`端点:
  ```typescript
  // pages/api/proxy-image.ts
  import type { NextApiRequest, NextApiResponse } from 'next';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).send('缺少图片URL参数');
    }

    try {
      console.log('代理请求图片:', imageUrl);
      
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.error('源图片请求失败:', response.status, response.statusText);
        return res.status(response.status).send(`源图片请求失败: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('Content-Type');
      const buffer = await response.arrayBuffer();

      // 设置响应头
      res.setHeader('Content-Type', contentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // 发送图片数据
      res.status(200).send(Buffer.from(buffer));
      
      console.log('图片代理成功:', {
        url: imageUrl.substring(0, 50) + '...',
        size: buffer.byteLength,
        type: contentType
      });
    } catch (err) {
      console.error("代理图片失败:", err);
      res.status(500).send('图片获取错误');
    }
  }
  ```

### 3.2 更新TimelineItem组件
- 修改组件，使用代理API替代直接引用Firebase URL
- 添加错误处理、加载状态和失败回退机制
- 代码片段示例:
  ```tsx
  // TimelineItem.tsx
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    const rawUrl = entry.photo || entry.photoURL || '';
    if (rawUrl) {
      // 使用代理API处理图片URL
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
      setImageUrl(proxyUrl);
    }
  }, [entry.photo, entry.photoURL]);
  ```

### 3.3 更新时间线页面
- 修改页面中的图片显示代码，使用代理API
- 修复接口定义，同时支持photo和photoURL字段
- 代码片段示例:
  ```tsx
  <img
    src={`/api/proxy-image?url=${encodeURIComponent(log.photo || log.photoURL || '')}`}
    alt="独角仙照片"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
  ```

### 3.4 配置Next.js图片域
- 修改`next.config.js`添加Firebase域名配置
- 扩展CSP头，允许Firebase图片域
  ```javascript
  // next.config.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  ```

### 3.5 创建测试页面
- 实现多种图片显示方法的对比测试页面
- 创建纯HTML测试页面排除框架因素
- 添加管理工具页面修复数据库中的字段问题

## 4. 测试与验证
- 通过`/test-image`页面测试原始URL与代理API的对比
- 验证在时间线页面的图片显示
- 确认多种图片格式（JPG、PNG等）都能正常显示

## 5. 最终解决方案
- 使用服务器端代理API方法完全解决了图片显示问题
- 此方案绕过了CORS/CSP限制
- 解决了URL编码和特殊字符处理问题
- 提供了统一的图片加载方法

## 6. 后续优化建议
- 添加图片缩略图生成功能
- 考虑使用图片CDN进一步优化加载速度
- 实现图片预加载以提升用户体验
- 添加图片加载失败的友好提示和重试按钮

# 图片自适应比例功能实现 (2024-04-17)

## 1. 需求背景
- 需要支持不同比例（横向、纵向、正方形）的照片自适应显示
- 避免图片被裁剪或变形，保持完整性
- 保持UI的一致性和美观度
- 在不同设备上提供良好的浏览体验

## 2. 功能实现

### 2.1 比例检测与自适应显示
- 通过检测图片的自然宽高比（`naturalWidth/naturalHeight`）判断图片类型：
  ```javascript
  const ratio = img.naturalWidth / img.naturalHeight;
  
  // 判断图片比例类型
  if (ratio > 1.2) {
    setAspectRatio('landscape'); // 横向图片
  } else if (ratio < 0.8) {
    setAspectRatio('portrait');  // 纵向图片
  } else {
    setAspectRatio('square');    // 接近正方形
  }
  ```

- 为不同比例的图片应用不同的布局策略：
  - 横向图片：宽度优先，高度自适应
  - 纵向图片：高度优先，宽度自适应，限制最大高度
  - 正方形图片：固定比例，适当填充边距

### 2.2 TimelineItem组件改进
- 使用`useRef`获取图片DOM元素进行比例检测
- 根据检测到的比例动态应用样式
- 优化图片加载和错误处理
- 代码示例:
  ```tsx
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const ratio = naturalWidth / naturalHeight;
      
      // 判断图片比例类型
      if (ratio > 1.2) {
        setAspectRatio('landscape'); 
      } else if (ratio < 0.8) {
        setAspectRatio('portrait');
      } else {
        setAspectRatio('square');
      }
    }
  };
  ```

### 2.3 时间线页面改进
- 修改图片容器为弹性布局（Flex）
- 使用JavaScript动态调整图片样式
- 添加鼠标悬停效果增强交互体验
- 代码示例:
  ```tsx
  <img
    src={`/api/proxy-image?url=${encodeURIComponent(log.photo || log.photoURL || '')}`}
    alt="独角仙照片"
    onLoad={(e) => {
      const img = e.target as HTMLImageElement;
      const ratio = img.naturalWidth / img.naturalHeight;
      
      // 根据比例应用不同样式
      if (ratio > 1.2) {
        img.style.width = '100%';
        img.style.height = 'auto';
      } else if (ratio < 0.8) {
        img.style.height = '90%';
        img.style.width = 'auto';
      } else {
        img.style.width = '85%';
        img.style.height = '85%';
      }
    }}
  />
  ```

### 2.4 上传预览页面改进
- 修改预览容器为固定高度的弹性布局
- 根据上传图片的比例自动调整容器内边距
- 添加平滑过渡效果

### 2.5 HTML版本页面更新
- 添加CSS类定义不同比例的图片样式
- 使用onload事件检测图片比例并应用对应类
- 通过类切换替代直接修改样式，提高性能

## 3. 测试与效果
- 横向图片（风景照）：完整显示，宽度占满容器
- 纵向图片（人像照）：完整显示，高度最大化但有限制
- 正方形图片：居中显示，适当边距

## 4. 后续优化方向
- 考虑添加图片懒加载功能减少初始加载时间
- 在服务器端生成合适尺寸的缩略图，减少带宽消耗
- 添加图片放大查看功能
- 考虑在移动设备上的特殊优化策略

# Kane独角仙项目UI改进计划 (2024-04-17)

## 1. 时间轴标记系统

### 1.1 功能需求
- 在时间线页面添加清晰的时间段标记（例如：第1周、第2周、第30天）
- 根据独角仙生长阶段分类展示（如：幼虫期、化蛹期、成虫期）
- 支持自动和手动时间段归类
- 界面简洁易用，适合8岁儿童操作

### 1.2 实现方案
1. **时间计算功能**
   - 基于第一条记录日期自动计算天数和周数
   - 记录示例：`第1天(4月17日)`、`第1周(4月17日-4月23日)`
   - 实现代码：
   ```javascript
   // 计算相对时间（相对于第一条记录）
   function calculateRelativeTime(currentDate, firstRecordDate) {
     const diffTime = Math.abs(currentDate - firstRecordDate);
     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
     const diffWeeks = Math.floor(diffDays / 7);
     
     return {
       day: diffDays + 1,  // 从第1天开始计数
       week: diffWeeks + 1 // 从第1周开始计数
     };
   }
   ```

2. **UI设计**
   - 添加彩色时间轴线，贯穿整个时间线
   - 每个时间段（周/月）使用不同颜色区分
   - 重要节点（如首次蜕皮、开始结茧）添加特殊图标标记
   - 简易示意图：
   ```
   [第1周] ——————●———————●———————●———————
                 |        |        |
                第1天    第3天     第5天
            (4/17)    (4/19)    (4/21)
   
   [第2周] ——————★———————●———————————————
                 |        |
              第8天★    第10天
             蜕皮    (4/26)
   ```

3. **分组展示**
   - 默认按周分组，可折叠/展开每周内容
   - 点击周标题展开/折叠该周的所有记录
   - 使用简单动画增强互动体验

### 1.3 技术实现步骤
1. 修改`timeline.tsx`，添加时间计算和分组逻辑
2. 创建新组件`TimelineGroup.tsx`，处理分组显示
3. 增强`TimelineItem.tsx`，支持显示相对日期
4. 添加简单的CSS动画效果

## 2. 简易分类标签系统

### 2.1 功能需求
- 支持基础标签：蜕皮、进食、活动、结茧、羽化等
- 上传时可简单选择标签（适合儿童操作）
- 时间线页面可按标签筛选查看
- 使用图标代替文字，简化儿童理解和操作

### 2.2 实现方案
1. **标签设计**
   - 使用直观图标表示不同行为
   - 标签列表（初期）：
     - 🥚 孵化
     - 🍽️ 进食
     - 🐛 蜕皮
     - 🧵 结茧
     - 🦋 羽化
     - 🦗 活动
     - 📏 测量

2. **上传页面优化**
   - 添加图标选择区，点击选择（无需文字输入）
   - 支持多选（最多选择2个标签）
   - 带有简单动画效果的选择反馈
   - 示例代码：
   ```jsx
   <div className="tag-selector">
     <p>选择看到了什么？（点击图标选择）</p>
     <div className="tag-icons">
       {tags.map(tag => (
         <button 
           key={tag.id}
           onClick={() => toggleTag(tag.id)}
           className={selectedTags.includes(tag.id) ? 'selected' : ''}
         >
           <span className="tag-icon">{tag.icon}</span>
         </button>
       ))}
     </div>
   </div>
   ```

3. **时间线筛选**
   - 顶部添加图标筛选栏
   - 默认显示全部，点击图标筛选对应类型
   - 图标保持简单，颜色鲜明
   - 筛选状态保持明确的视觉反馈

### 2.3 数据结构
```javascript
// Firestore数据结构
{
  "photo": "URL",
  "note": "看到独角仙在吃东西",
  "createdAt": Timestamp,
  "tags": ["feeding", "activity"]  // 新增字段
}
```

### 2.4 技术实现步骤
1. 更新`upload.tsx`，添加标签选择器
2. 修改`RecordForm.tsx`，支持标签数据存储
3. 增强`TimelineItem.tsx`，显示标签图标
4. 添加`timeline.tsx`筛选功能

## 3. 用户体验优化（额外建议）

### 3.1 图片查看优化
- 点击图片放大查看（简单模态框）
- 适配不同比例图片，保持清晰度
- 放大/缩小手势支持（触摸设备）

### 3.2 宫崎骏风格优化
- 添加更多手绘风格元素
- 独角仙生长阶段插图
- 背景纹理优化，增加自然元素

### 3.3 交互动画
- 页面切换时添加简单过渡效果
- 上传成功动画
- 记录加载时使用趣味加载动画

## 4. 实施路线图

### 4.1 第一阶段：时间轴标记
- 实现基础时间计算
- 添加周/天显示
- 实现基础分组功能

### 4.2 第二阶段：标签系统
- 设计并实现标签选择器
- 更新数据库结构
- 添加基础筛选功能

### 4.3 第三阶段：UI美化
- 优化视觉设计
- 添加交互动画
- 提升整体用户体验

## 5. 开发注意事项
- 保持界面简洁，适合8岁儿童使用
- 避免复杂操作，优先使用图标而非文字
- 确保反馈明确，操作结果立即可见
- 测试设备兼容性，确保在平板等设备上良好运行

# Kane独角仙项目功能优化计划 (2024-04-17)

## 1. 计数功能修复

### 1.1 问题描述
- 当前"Kane的第X次观察"显示的是随机数，每次刷新会变化
- 这导致观察次序混乱，无法准确反映Kane的观察历程

### 1.2 修复方案
- 使用实际记录数量作为观察次数编号
- 按照记录创建时间排序，确保编号的连续性
- 编号从1开始递增，最新的记录编号最大
- 实现代码示例：
```typescript
// 计算观察次数（按时间排序后的索引+1）
const observationNumber = logs.length - logs.findIndex(item => item.id === entry.id);
```

## 2. 阶段标签提示功能

### 2.1 功能需求
- 在上传页面提供简单的阶段标签按钮（如"#幼虫阶段"、"#蛹阶段"等）
- 点击按钮后自动在笔记文本开头添加对应标签文本
- 保持界面简洁，适合儿童操作

### 2.2 实现方案
- 添加几个大按钮，每个按钮代表一个生长阶段
- 点击按钮将对应标签添加到笔记输入框
- 设计美观直观的按钮样式
- 实现代码示例：
```jsx
<div className="stage-tags mb-3">
  <p className="text-sm text-gray-600 mb-2">选择当前阶段：</p>
  <div className="flex flex-wrap gap-2">
    {['#幼虫阶段', '#蛹阶段', '#成虫阶段'].map(stage => (
      <button
        key={stage}
        type="button"
        className="py-2 px-4 bg-green-100 hover:bg-green-200 rounded-full text-sm"
        onClick={() => {
          // 如果笔记已有标签，则不重复添加
          if (!note.startsWith(stage)) {
            setNote(stage + ' ' + note);
          }
        }}
      >
        {stage}
      </button>
    ))}
  </div>
</div>
```

## 3. 内容自动识别功能

### 3.1 功能描述
- 系统自动分析笔记内容，识别关键事件类型（如蜕皮、进食等）
- 不需要用户手动选择标签，减少操作复杂度
- 在时间线页面显示对应事件图标

### 3.2 实现方案
- 使用已开发的`detectSpecialEvents`函数检测特殊事件
- 根据笔记内容中的关键词自动归类
- 在时间线展示对应图标
- 可识别的事件类型包括：
  - 🥚 孵化（关键词：孵化）
  - 🍽️ 进食（关键词：进食、吃）
  - 🐛 蜕皮（关键词：蜕皮、脱皮）
  - 🧵 结茧（关键词：结茧、茧、化蛹）
  - 🦋 羽化（关键词：羽化、成虫）
  - 📏 测量（关键词：测量、长度、重量）
  - 🦗 活动（默认类型）

## 4. 记录管理功能

### 4.1 编辑功能
- 允许修改已上传的观察记录
- 编辑范围包括笔记内容、阶段标签等
- 点击记录旁的"编辑"按钮进入编辑模式
- 编辑完成后保存更新到数据库

### 4.2 安全删除功能
- 只允许一次删除一条记录，防止误操作
- 删除前显示确认对话框
- 删除操作仅从界面移除，数据库保留备份
- 实现恢复机制，可通过管理页面恢复已删除记录

### 4.3 实现安全性考虑
- 针对儿童用户，删除按钮设计需要谨慎
- 可考虑使用小图标+确认的组合方式
- 或将删除功能仅对家长开放（需要简单的"家长模式"）

## 5. 技术实现步骤

### 5.1 修复计数功能
1. 修改`TimelineItem.tsx`，计算准确的观察次序
2. 确保次序保持稳定，不受页面刷新影响

### 5.2 添加阶段标签
1. 更新`upload.tsx`，添加阶段标签按钮组
2. 实现点击按钮向笔记添加标签文本的功能

### 5.3 内容自动识别
1. 优化`detectSpecialEvents`函数，提高识别准确性
2. 在`TimelineItem.tsx`中显示识别结果图标

### 5.4 管理功能实现
1. 创建`EditRecord.tsx`组件，实现编辑功能
2. 添加删除确认对话框和删除处理逻辑
3. 创建简易的管理页面，用于恢复已删除记录

### 2024-07-21
1. 修复科学手帐页面导航栏布局问题
   - 修正标题"Kane的独角仙奇遇记"在导航栏中换行的问题
   - 调整导航项目的间距，将gap从20px减少到10px
   - 为标题和导航链接添加`whiteSpace: 'nowrap'`属性确保不换行
   - 减小字体大小和内边距，优化整体布局
   - 为导航添加`flexWrap: 'nowrap'`属性
   - 为标题添加`margin: 0`消除默认边距

### 2024-07-23
1. PDF生成功能优化
   - 开发智能排版系统，根据照片方向和文字长度自动选择最佳布局
   - 实现多记录布局功能，支持在一页显示2-3条记录，减少打印页数和成本
   - 增强PDF整体设计，添加装饰元素增强科学笔记本风格
   - 整合文档资料，创建统一的PDF设计与实现文档

2. 智能排版系统开发
   - 实现了照片方向自动检测功能（横向/纵向/方形）
   - 根据方向和文字长度智能选择布局：
     - 横向照片默认放顶部，文字在下方
     - 纵向照片随机选择左右布局，增加设计活力感
     - 文字超过200字时统一使用照片在上方的布局

3. 多记录布局系统
   - 实现一页多记录布局功能，大幅减少打印页数
   - 按日期分组，同一天的记录优先放在一起
   - 支持五种布局组合（单条/双垂直/双水平/三条/四条）
   - 智能布局算法，根据照片方向和内容自动优化排列

4. 装饰元素系统
   - 开发照片装饰功能，实现"胶带贴照片"效果
   - 添加手绘风格的装饰元素，增强科学笔记本感
   - 改进页眉页脚设计，更符合科学手帐的风格

5. 文档整合与创建
   - 将所有PDF相关设计和实现文档整合到统一的`docs/pdf-documentation.md`文件
   - 文档内容包括功能概述、设计方案、技术实现、优化方案、常见问题解决方案和进度日志
   - 设计方案详细描述了视觉风格、页面布局和UI界面设计
   - 技术实现部分包含关键文件、核心实现代码和字体支持等内容