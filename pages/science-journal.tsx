import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { LogEntry } from '../lib/timelineUtils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // 如果需要表格功能
import { addChineseFont, splitChineseText, formatChineseDate, getFontDisplayName, checkFontAvailability } from '../utils/pdfFonts';
import { ChineseFontType } from '../utils/types';
// 导入PDF工具模块
import { groupRecordsForLayout, renderRecordGroupToPageSafe, GroupingResult } from '../utils/pdfTools/multiRecordLayout';
// 导入图片诊断工具
import { generateImageDiagnosticPage } from '../utils/pdfTools/renderRecordGroupToPage';

// 分割文本为多行的辅助函数
const splitTextToLines = (text: string, maxChars: number = 20): string[] => {
  if (!text) return [''];
  
  const result: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    result.push(text.substring(i, i + maxChars));
  }
  
  return result;
};

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN');
};

export default function ScienceJournalPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  
  // 样式和选项设置
  const [style, setStyle] = useState<'classic' | 'nature' | 'lab'>('classic');
  const [timeRange, setTimeRange] = useState<'all' | 'larvae' | 'pupa' | 'adult'>('all');
  const [includeStats, setIncludeStats] = useState(true);
  const [selectedFont, setSelectedFont] = useState<ChineseFontType>('zcool-kuaile');
  const [fontAvailability, setFontAvailability] = useState<Record<ChineseFontType, boolean>>({} as Record<ChineseFontType, boolean>);
  const [fontCheckComplete, setFontCheckComplete] = useState(false);
  // 添加布局模式选项
  const [layoutMode, setLayoutMode] = useState<'single' | 'multi'>('single');

  // 获取记录
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log("开始获取记录用于科学手帐生成...");
        
        const q = query(collection(db, "logs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log("没有找到任何记录可供生成科学手帐");
          setLogs([]);
          setError("暂无记录可供生成科学手帐");
          setLoading(false);
          return;
        }
        
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data } as LogEntry;
        });
        
        console.log(`获取到 ${results.length} 条记录`);
        setLogs(results);
      } catch (error) {
        console.error("获取记录失败：", error);
        setError("获取记录失败，请重试");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // 加载图片
  const loadImage = async (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      try {
        console.log(`尝试加载图片: ${src}`);
        const img = new Image();
        img.crossOrigin = "anonymous";  // 添加跨域支持
        img.onload = () => {
          console.log(`图片加载成功: ${src}`);
          resolve(img);
        };
        img.onerror = (e) => {
          console.error(`图片加载失败: ${src}`, e);
          reject(new Error(`图片加载失败: ${src}`));
        };
        // 使用完整URL，包括域名
        img.src = window.location.origin + src;
      } catch (err) {
        console.error(`图片加载过程出错: ${src}`, err);
        reject(err);
      }
    });
  };

  // 预加载所需资源
  const preloadResources = async () => {
    try {
      console.log("开始加载科学手帐所需资源...");
      
      // 添加错误处理和回退选项
      const loadWithFallback = async (path: string): Promise<HTMLImageElement | null> => {
        try {
          return await loadImage(path);
        } catch (err) {
          console.warn(`无法加载 ${path}，使用空白图片替代`);
          return null;
        }
      };
      
      // 加载背景和装饰元素
      const paperTexture = await loadWithFallback('/images/notebook-paper.jpg');
      const tapeImg = await loadWithFallback('/images/tape.png');
      const paperClipImg = await loadWithFallback('/images/paperclip.png');
      const beetleStages = await loadWithFallback('/images/beetle-stages.png');
      
      console.log("资源加载完成或已使用替代资源");
      
      return {
        paperTexture,
        tapeImg,
        paperClipImg,
        beetleStages
      };
    } catch (error) {
      console.error("加载资源失败:", error);
      // 返回空对象而不是抛出错误，允许继续生成PDF但没有装饰元素
      return {
        paperTexture: null,
        tapeImg: null,
        paperClipImg: null,
        beetleStages: null
      };
    }
  };

  // 生成封面页
  const generateCoverPage = async (doc: jsPDF, resources: any) => {
    try {
      // 添加纸张背景
      if (resources.paperTexture) {
        doc.addImage(
          resources.paperTexture, 
          'JPEG', 
          0, 0, 
          210, 297
        );
      }
      
      // 避免widths属性问题的安全text函数
      const safeText = (text: string, x: number, y: number, options: any = {}) => {
        try {
          doc.text(text, x, y, options);
        } catch (err) {
          // 如果有widths问题，改用简单写入模式
          if (err instanceof Error && err.message.includes("widths")) {
            console.log("使用安全文本模式:", text);
            const lines = text.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const xPos = options.align === 'center' ? x - (doc.getTextWidth(line) / 2) : x;
              doc.text(line, xPos, y + (i * 10));
            }
          } else {
            throw err;
          }
        }
      };
      
      // 添加标题
      doc.setFontSize(22); // 降低字号以适应中文
      safeText('Kane的独角仙观察日记', 105, 60, { align: 'center' });
      
      // 添加日期范围
      if (logs.length > 0) {
        const firstDate = formatDate(new Date(Math.min(...logs.map(log => log.createdAt.seconds * 1000))));
        const lastDate = formatDate(new Date(Math.max(...logs.map(log => log.createdAt.seconds * 1000))));
        
        doc.setFontSize(12);
        safeText(`观察时间: ${firstDate} 至 ${lastDate}`, 105, 80, { align: 'center' });
        safeText(`总共记录: ${logs.length} 条观察`, 105, 90, { align: 'center' });
      }
      
      // 添加昆虫图片
      if (resources.beetleStages) {
        doc.addImage(
          resources.beetleStages,
          'PNG',
          60, 120,
          90, 70
        );
      }
      
      // 添加作者信息
      doc.setFontSize(12);
      safeText(`by Kane (8岁半)`, 105, 220, { align: 'center' });
      
      // 添加胶带装饰
      if (resources.tapeImg) {
        doc.addImage(resources.tapeImg, 'PNG', 40, 40, 30, 15);
        doc.addImage(resources.tapeImg, 'PNG', 140, 40, 30, 15);
      }
    } catch (err) {
      console.error("生成封面页出错:", err);
      // 如果装饰元素失败，至少确保标题和基本信息存在
      doc.setFontSize(22);
      try {
        doc.text('Kane Beetle Journal', 105, 60, { align: 'center' });
        
        if (logs.length > 0) {
          const firstDate = formatDate(new Date(Math.min(...logs.map(log => log.createdAt.seconds * 1000))));
          const lastDate = formatDate(new Date(Math.max(...logs.map(log => log.createdAt.seconds * 1000))));
          
          doc.setFontSize(12);
          doc.text(`Observation Period: ${firstDate} - ${lastDate}`, 105, 80, { align: 'center' });
          doc.text(`Total Records: ${logs.length}`, 105, 90, { align: 'center' });
        }
        
        doc.setFontSize(12);
        doc.text(`by Kane (8.5 years)`, 105, 220, { align: 'center' });
      } catch (textErr) {
        console.error("文本渲染失败，使用基础文本:", textErr);
        // 最后的备选方案 - 使用最基本的文本渲染
        doc.setFontSize(22);
        doc.text('Kane Beetle Journal', 20, 60);
      }
    }
  };

  // 生成目录
  const generateTableOfContents = async (doc: jsPDF, logs: LogEntry[]) => {
    try {
      doc.addPage();
      doc.setFontSize(20);
      
      // 使用安全文本方法
      const safeText = (text: string, x: number, y: number, options: any = {}) => {
        try {
          doc.text(text, x, y, options);
        } catch (err) {
          if (err instanceof Error && err.message.includes("widths")) {
            console.log("使用安全文本模式(目录):", text);
            if (options.align === 'center') {
              // 居中处理
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y, options);
            } else {
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y);
            }
          } else {
            throw err;
          }
        }
      };
      
      safeText('观察目录', 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      logs.forEach((log, index) => {
        const date = formatDate(new Date(log.createdAt.seconds * 1000));
        const title = log.note.substring(0, 25) + (log.note.length > 25 ? '...' : '');
        try {
          safeText(`${index + 1}. ${date}: ${title}`, 20, 50 + index * 8);
        } catch (err) {
          // 如果仍然失败，使用纯英文
          console.log(`目录项${index}渲染失败，使用简化版本`);
          doc.text(`${index + 1}. Entry ${date}`, 20, 50 + index * 8);
        }
      });
    } catch (err) {
      console.error("生成目录页面失败:", err);
      // 确保至少有目录标题
      doc.addPage();
      doc.setFontSize(20);
      try {
        doc.text('Contents', 105, 30, { align: 'center' });
      } catch(e) {
        doc.text('Contents', 20, 30);
      }
    }
  };

  // 生成记录页面
  const generateRecordPage = async (doc: jsPDF, record: LogEntry, index: number, resources: any) => {
    try {
      doc.addPage();
      
      // 使用安全文本方法
      const safeText = (text: string, x: number, y: number, options: any = {}) => {
        try {
          doc.text(text, x, y, options);
        } catch (err) {
          if (err instanceof Error && err.message.includes("widths")) {
            console.log("使用安全文本模式(记录页):", text);
            if (options.align === 'center') {
              // 居中处理
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y, options);
            } else {
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y);
            }
          } else {
            throw err;
          }
        }
      };
      
      // 添加纸张背景
      if (resources.paperTexture) {
        try {
          doc.addImage(
            resources.paperTexture, 
            'JPEG', 
            0, 0, 
            210, 297
          );
        } catch (err) {
          console.error("添加纸张背景失败:", err);
        }
      }
      
      // 页眉 - 记录编号和日期
      const date = new Date(record.createdAt.seconds * 1000);
      doc.setFontSize(14);
      safeText(`观察记录 #${index}`, 20, 20);
      
      doc.setFontSize(10);
      safeText(`日期: ${formatDate(date)}`, 20, 30);
      
      // 检测阶段标签
      let stageText = '';
      if (record.note.startsWith('#幼虫阶段')) {
        stageText = '🐛 幼虫阶段';
      } else if (record.note.startsWith('#蛹阶段')) {
        stageText = '🧵 蛹阶段';
      } else if (record.note.startsWith('#成虫阶段')) {
        stageText = '🦗 成虫阶段';
      }
      
      if (stageText) {
        doc.setFontSize(12);
        safeText(stageText, 150, 20);
      }
      
      // 添加照片区域
      if (record.photo) {
        // 添加纸张夹装饰
        if (resources.paperClipImg) {
          try {
            doc.addImage(resources.paperClipImg, 'PNG', 20, 35, 25, 25);
          } catch (err) {
            console.error("添加回形针装饰失败:", err);
          }
        }
        
        try {
          // 通过代理API获取图片
          const imgUrl = `/api/proxy-image?url=${encodeURIComponent(record.photo)}`;
          const img = await loadImage(imgUrl);
          
          // 计算图片尺寸以保持比例
          const maxWidth = 160;
          const maxHeight = 100;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // 简化图片添加方式，避免使用旋转等高级功能
          const centerX = 105;
          const centerY = 80;
          doc.addImage(img, 'JPEG', centerX - width/2, centerY - height/2, width, height);
          
          // 添加阴影效果 - 通过在下方添加灰色矩形实现
          doc.setFillColor(200, 200, 200);
          doc.roundedRect(centerX - width/2 - 2, centerY + height/2 + 2, width + 4, 3, 1, 1, 'F');
          
          // 添加胶带装饰
          if (resources.tapeImg) {
            try {
              doc.addImage(resources.tapeImg, 'PNG', centerX - width/2 - 10, centerY - height/2 - 10, 20, 10);
              doc.addImage(resources.tapeImg, 'PNG', centerX + width/2 - 10, centerY - height/2 - 10, 20, 10);
            } catch (err) {
              console.error("添加胶带装饰失败:", err);
            }
          }
        } catch (error) {
          console.error('加载图片失败:', error);
          // 添加图片错误提示
          doc.setTextColor(255, 0, 0);
          doc.text('(图片加载失败)', 105, 80, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      }
      
      // 添加笔记内容区
      doc.setFontSize(10);
      const noteY = record.photo ? 170 : 60;
      
      // 处理笔记内容，移除阶段标签
      let note = record.note;
      ['#幼虫阶段', '#蛹阶段', '#成虫阶段'].forEach(stage => {
        if (note.startsWith(stage)) {
          note = note.substring(stage.length).trim();
        }
      });
      
      // 分行显示
      const lines = splitTextToLines(note, 40); // 每行最多40个字符
      lines.forEach((line, idx) => {
        try {
          safeText(line, 25, noteY + idx * 8);
        } catch (err) {
          // 如果仍然失败，使用英文替代
          console.log(`笔记行${idx}渲染失败，使用简化版本`);
          doc.text(`Note line ${idx+1}`, 25, noteY + idx * 8);
        }
      });
      
      // 添加页脚
      doc.setFontSize(10);
      safeText(`- ${index} -`, 105, 280, { align: 'center' });
    } catch (err) {
      console.error("生成记录页面失败:", err);
      
      // 确保至少有基本内容
      try {
        doc.addPage();
        doc.setFontSize(14);
        doc.text(`Record #${index}`, 20, 20);
        
        const date = new Date(record.createdAt.seconds * 1000);
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(date)}`, 20, 30);
        
        // 添加页脚
        doc.setFontSize(10);
        doc.text(`- ${index} -`, 105, 280, { align: 'center' });
      } catch (e) {
        console.error("记录页面基本内容生成失败:", e);
      }
    }
  };

  // 生成阶段统计页面
  const generateStatsPages = async (doc: jsPDF, logs: LogEntry[]) => {
    try {
      if (includeStats && logs.length > 0) {
        doc.addPage();
        doc.setFontSize(20);
        
        // 使用安全文本方法
        const safeText = (text: string, x: number, y: number, options: any = {}) => {
          try {
            doc.text(text, x, y, options);
          } catch (err) {
            if (err instanceof Error && err.message.includes("widths")) {
              console.log("使用安全文本模式(统计页):", text);
              if (options.align === 'center') {
                // 居中处理
                doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y, options);
              } else {
                doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y);
              }
            } else {
              throw err;
            }
          }
        };
        
        safeText('观察统计', 105, 30, { align: 'center' });
        
        // 按阶段分组
        const stages = {
          '幼虫阶段': logs.filter(log => log.note.startsWith('#幼虫阶段')),
          '蛹阶段': logs.filter(log => log.note.startsWith('#蛹阶段')),
          '成虫阶段': logs.filter(log => log.note.startsWith('#成虫阶段')),
          '其他': logs.filter(log => !log.note.startsWith('#幼虫阶段') && !log.note.startsWith('#蛹阶段') && !log.note.startsWith('#成虫阶段'))
        };
        
        const stageTranslations = {
          '幼虫阶段': 'Larva Stage',
          '蛹阶段': 'Pupa Stage',
          '成虫阶段': 'Adult Stage',
          '其他': 'Other Records'
        };
        
        let y = 50;
        for (const [stage, entries] of Object.entries(stages)) {
          if (entries.length > 0) {
            doc.setFontSize(14);
            try {
              safeText(`${stage}`, 20, y);
            } catch (err) {
              // 降级使用英文
              doc.text(stageTranslations[stage as keyof typeof stageTranslations], 20, y);
            }
            
            doc.setFontSize(10);
            try {
              safeText(`记录数量: ${entries.length} 条`, 20, y + 10);
            } catch (err) {
              doc.text(`Records: ${entries.length}`, 20, y + 10);
            }
            
            // 计算阶段持续天数
            if (entries.length > 1) {
              const timestamps = entries.map(e => e.createdAt.seconds * 1000);
              const firstDate = new Date(Math.min(...timestamps));
              const lastDate = new Date(Math.max(...timestamps));
              
              const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              try {
                safeText(`持续天数: ${diffDays} 天`, 20, y + 20);
                safeText(`开始日期: ${formatDate(firstDate)}`, 20, y + 30);
                safeText(`最新日期: ${formatDate(lastDate)}`, 20, y + 40);
              } catch (err) {
                doc.text(`Duration: ${diffDays} days`, 20, y + 20);
                doc.text(`Start: ${formatDate(firstDate)}`, 20, y + 30);
                doc.text(`End: ${formatDate(lastDate)}`, 20, y + 40);
              }
            }
            
            y += 50;
          }
        }
      }
    } catch (err) {
      console.error("生成统计页面失败:", err);
      try {
        // 简单地创建基本统计页面
        doc.addPage();
        doc.setFontSize(20);
        doc.text('Statistics', 105, 30, { align: 'center' });
      } catch (e) {
        console.error("基础统计页面创建失败:", e);
      }
    }
  };

  // 生成封底页
  const generateBackCover = async (doc: jsPDF) => {
    try {
      doc.addPage();
      doc.setFontSize(20);
      
      // 使用安全文本方法
      const safeText = (text: string, x: number, y: number, options: any = {}) => {
        try {
          doc.text(text, x, y, options);
        } catch (err) {
          if (err instanceof Error && err.message.includes("widths")) {
            console.log("使用安全文本模式(封底):", text);
            if (options.align === 'center') {
              // 居中处理
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y, options);
            } else {
              doc.text(text.replace(/[^\x00-\x7F]/g, '?'), x, y);
            }
          } else {
            throw err;
          }
        }
      };
      
      safeText('观察日记', 105, 100, { align: 'center' });
      
      doc.setFontSize(14);
      safeText('记录每一个精彩瞬间', 105, 120, { align: 'center' });
      
      doc.setFontSize(10);
      safeText(`生成日期: ${formatDate(new Date())}`, 105, 270, { align: 'center' });
    } catch (err) {
      console.error("生成封底页面失败:", err);
      try {
        // 简单地创建基本封底
        doc.addPage();
        doc.setFontSize(20);
        doc.text('Observation Journal', 105, 100, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Generated: ${formatDate(new Date())}`, 105, 270, { align: 'center' });
      } catch (e) {
        console.error("基础封底创建失败:", e);
      }
    }
  };

  // 核心PDF生成函数
  const generateScienceJournalPDF = async () => {
    if (logs.length === 0) {
      setError("没有记录可以生成科学手帐");
      return;
    }
    
    setGenerating(true);
    setProgress(0);
    setError('');
    
    try {
      // 加载资源
      const resources = await preloadResources();
      setProgress(10);
      
      // 筛选记录
      let filteredLogs = [...logs];
      if (timeRange !== 'all') {
        const stagePrefix = timeRange === 'larvae' ? '#幼虫阶段' : timeRange === 'pupa' ? '#蛹阶段' : '#成虫阶段';
        filteredLogs = logs.filter(log => log.note.startsWith(stagePrefix));
      }
      
      if (filteredLogs.length === 0) {
        throw new Error(`没有${timeRange === 'larvae' ? '幼虫阶段' : timeRange === 'pupa' ? '蛹阶段' : '成虫阶段'}的记录`);
      }
      
      // 创建PDF文档
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16 // 使用更高浮点精度避免坐标问题
      });
      
      // 添加中文字体支持
      console.log(`设置中文字体支持: ${getFontDisplayName(selectedFont)}...`);
      const fontLoaded = await addChineseFont(doc, selectedFont);
      console.log("中文字体加载状态:", fontLoaded ? "成功" : "失败");

      // 添加图片诊断页面，帮助排查图片问题
      await generateImageDiagnosticPage(doc, filteredLogs);
      
      // 生成封面
      await generateCoverPage(doc, resources);
      setProgress(20);
      
      // 生成目录
      await generateTableOfContents(doc, filteredLogs);
      setProgress(30);
      
      // 根据布局模式生成内容页面
      if (layoutMode === 'multi') {
        // 使用多记录布局模式
        try {
          console.log("使用多记录布局模式，开始分组排列记录...");
          
          // 转换资源对象格式以匹配工具函数预期
          const toolResources = {
            backgrounds: { 
              paper: resources.paperTexture 
            },
            decorations: { 
              tape: resources.tapeImg, 
              paperclip: resources.paperClipImg 
            },
            icons: { 
              beetle: resources.beetleStages 
            },
            fonts: {
              loaded: true,
              names: [selectedFont]
            }
          };
          
          // 添加超时处理
          const groupResultPromise = groupRecordsForLayout(filteredLogs, true);
          const timeoutPromise = new Promise<GroupingResult>((_, reject) => 
            setTimeout(() => reject(new Error("分组记录超时，可能是图片加载问题")), 15000)
          );
          
          // 添加调试信息，验证传递给工具函数的数据结构
          console.log(`开始处理多记录布局，记录数量: ${filteredLogs.length}`);
          if (filteredLogs.length > 0) {
            const sample = filteredLogs[0];
            console.log(`记录示例 - photo字段: ${!!sample.photo}, photoURL字段: ${!!sample.photoURL}, note长度: ${sample.note?.length || 0}`);
          }
          
          console.log(`资源对象结构:`, {
            背景可用: !!toolResources.backgrounds?.paper,
            装饰可用: !!toolResources.decorations?.tape && !!toolResources.decorations?.paperclip,
            图标可用: !!toolResources.icons?.beetle,
            字体状态: toolResources.fonts?.loaded
          });
          
          const groupResult = await Promise.race([groupResultPromise, timeoutPromise]) as GroupingResult;
          console.log(`记录分组完成，共 ${groupResult.totalPages} 页`);
          
          // 渲染每个记录组
          const pagesPercentage = 50; // 记录页面占进度的50%
          for (let i = 0; i < groupResult.groups.length; i++) {
            try {
              await renderRecordGroupToPageSafe(doc, groupResult.groups[i], i+1, toolResources);
              setProgress(30 + ((i+1)/groupResult.groups.length) * pagesPercentage);
            } catch (renderError) {
              console.error(`渲染记录组 #${i+1} 失败:`, renderError);
              // 继续处理其他组，不要让一个组的失败导致整个过程失败
            }
          }
        } catch (groupError: unknown) {
          console.error("多记录布局处理失败:", groupError);
          const errorMessage = groupError instanceof Error ? groupError.message : '未知错误';
          setError(`多记录布局失败: ${errorMessage}。请尝试使用"每条记录单独一页"选项。`);
          
          // 降级到单条记录模式
          console.log("降级到单条记录模式...");
          const recordsPercentage = 50;
          for (let i = 0; i < filteredLogs.length; i++) {
            await generateRecordPage(doc, filteredLogs[i], i+1, resources);
            setProgress(30 + ((i+1)/filteredLogs.length) * recordsPercentage);
          }
        }
      } else {
        // 使用单条记录模式（传统方式）
        const recordsPercentage = 50; // 记录页面占进度的50%
        for (let i = 0; i < filteredLogs.length; i++) {
          await generateRecordPage(doc, filteredLogs[i], i+1, resources);
          setProgress(30 + ((i+1)/filteredLogs.length) * recordsPercentage);
        }
      }
      
      // 生成阶段统计
      if (includeStats) {
        await generateStatsPages(doc, filteredLogs);
      }
      setProgress(90);
      
      // 生成封底
      await generateBackCover(doc);
      setProgress(95);
      
      // 保存前设置输出选项
      const outputOptions = {
        filename: `kane-beetle-journal-${new Date().toISOString().split('T')[0]}.pdf`,
        compress: true, // 使用压缩
      };
      
      // 保存PDF
      doc.save(outputOptions.filename);
      setProgress(100);
      
      // 显示成功消息
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('生成PDF失败:', error);
      setError('PDF生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  // 检查字体文件是否可用
  useEffect(() => {
    const checkFonts = async () => {
      console.log('🔍 组件挂载，开始检查字体文件...');
      try {
        const results = await checkFontAvailability();
        setFontAvailability(results);
        setFontCheckComplete(true);
        
        // 如果当前选择的字体不可用，自动切换到可用的字体
        if (results && !results[selectedFont]) {
          const availableFonts = Object.entries(results)
            .filter(([_, available]) => available)
            .map(([font]) => font as ChineseFontType);
          
          if (availableFonts.length > 0) {
            console.log(`⚠️ 当前选择的字体 ${selectedFont} 不可用，自动切换到:`, availableFonts[0]);
            setSelectedFont(availableFonts[0]);
          }
        }
        
      } catch (err) {
        console.error('❌ 检查字体文件失败:', err);
        setFontCheckComplete(true);
      }
    };
    
    checkFonts();
  }, []);

  // 修改字体选择区域，让每个字体选项直接使用对应字体显示
  const renderFontOptions = () => {
    // 直接定义字体样式，避免依赖类名
    const fontStyles = {
      'zcool-kuaile': {
        fontFamily: "ZCOOLKuaiLe, cursive",
        className: 'font-zcool-kuaile'
      },
      'zcool-xiaowei': {
        fontFamily: "ZCOOLXiaoWei, serif",
        className: 'font-zcool-xiaowei'
      }
    };
    
    const fontOptions = [
      { value: 'zcool-kuaile', label: '站酷快乐体', recommended: true },
      { value: 'zcool-xiaowei', label: '站酷小薇体', recommended: false },
    ];
    
    return fontOptions.map(option => {
      const fontStyle = fontStyles[option.value as keyof typeof fontStyles];
      
      return (
        <label key={option.value} style={{ 
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '10px 16px',
          borderRadius: '8px',
          backgroundColor: selectedFont === option.value ? '#e2f0e8' : 'transparent',
          border: '1px solid ' + (selectedFont === option.value ? '#a8c8a1' : '#e2eee5'),
          marginBottom: '10px',
          opacity: fontCheckComplete && !fontAvailability[option.value as ChineseFontType] ? 0.5 : 1,
          transition: 'all 0.2s ease',
          boxShadow: selectedFont === option.value ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
        }}>
          <input 
            type="radio" 
            name="font" 
            value={option.value}
            checked={selectedFont === option.value}
            onChange={() => setSelectedFont(option.value as ChineseFontType)}
            style={{ marginRight: '12px' }}
            disabled={fontCheckComplete && !fontAvailability[option.value as ChineseFontType]}
          />
          <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
            {/* 应用双重字体样式 - CSS类和内联样式 */}
            <div 
              className={`${fontStyle.className} font-debug`} 
              style={{
                fontFamily: fontStyle.fontFamily,
                fontSize: '24px', 
                lineHeight: 1.2, 
                fontWeight: 'bold'
              }}
            >
              {getFontDisplayName(option.value as ChineseFontType)}
            </div>
            <div 
              className={`${fontStyle.className}`}
              style={{
                fontFamily: fontStyle.fontFamily,
                fontSize: '14px', 
                color: '#666', 
                marginTop: '8px'
              }}
            >
              今天观察到幼虫正在进食，它很有活力
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '12px'}}>
              {option.recommended && (
                <span style={{ color: '#499a6c', marginRight: '10px' }}>推荐使用</span>
              )}
              {fontCheckComplete && (
                <span style={{ 
                  color: fontAvailability[option.value as ChineseFontType] ? '#499a6c' : '#d9534f'
                }}>
                  {fontAvailability[option.value as ChineseFontType] ? '(字体可用)' : '(字体不可用)'}
                </span>
              )}
            </div>
          </div>
          {selectedFont === option.value && (
            <div style={{marginLeft: '10px', color: '#5d9178', fontSize: '20px'}}>✓</div>
          )}
        </label>
      );
    });
  };

  return (
    <div style={{
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '"Hiragino Kaku Gothic Pro", "MS Gothic", sans-serif',
      background: '#f9f7f1',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '2px solid #a8c8a1'
      }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold',
          color: '#4a7c59',
          margin: 0,
          whiteSpace: 'nowrap'
        }}>
          🪲 Kane的独角仙奇遇记
        </h1>
        <nav style={{ display: 'flex', gap: '10px', marginLeft: '15px', flexWrap: 'nowrap' }}>
          <Link href="/" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 10px',
            whiteSpace: 'nowrap'
          }}>
            首页
          </Link>
          <Link href="/upload" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 10px',
            whiteSpace: 'nowrap'
          }}>
            上传记录
          </Link>
          <Link href="/timeline" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 10px',
            whiteSpace: 'nowrap'
          }}>
            时间线
          </Link>
          <Link href="/backup" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 10px',
            whiteSpace: 'nowrap'
          }}>
            备份
          </Link>
          <Link href="/science-journal" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 10px',
            whiteSpace: 'nowrap',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 200, 161, 0.5)'
          }}>
            科学手帐
          </Link>
        </nav>
      </header>

      <main>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '32px',
          textAlign: 'center',
          color: '#416153',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '-15px',
            fontSize: '40px',
            opacity: '0.2',
            zIndex: '-1'
          }}>
            📓
          </span>
          科学手帐生成器
        </h2>
        
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            border: '2px solid #c8dcc0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              fontSize: '50px', 
              marginBottom: '20px',
              color: '#5c7c6e',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}>
              📚
            </div>
            <p style={{ 
              color: '#5c7c6e',
              fontSize: '18px',
              position: 'relative',
              zIndex: '1'
            }}>
              正在统计Kane的观察记录...
            </p>
            <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            border: '2px solid #c8dcc0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              opacity: '0.15',
              zIndex: '0',
              backgroundImage: 'url("/images/notebook-paper.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            
            <div style={{ position: 'relative', zIndex: '1' }}>
              {error && (
                <div style={{ 
                  backgroundColor: 'rgba(255, 218, 214, 0.7)',
                  color: '#9a3d36',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  border: '1px solid #ff9e93',
                  fontSize: '16px',
                  textAlign: 'center'
                }}>
                  <span style={{ marginRight: '8px', fontSize: '24px' }}>⚠️</span>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{
                  backgroundColor: 'rgba(218, 248, 214, 0.7)',
                  color: '#2a6b36',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontSize: '15px'
                }}>
                  <span style={{ marginRight: '8px' }}>✅</span>
                  科学手帐PDF生成成功！
                </div>
              )}
              
              <div style={{ 
                marginBottom: '24px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>📊</span>
                  记录统计
                </h3>
                
                <div style={{ fontSize: '16px', color: '#4a6359' }}>
                  <p>共有记录：<span style={{ fontWeight: 'bold' }}>{logs.length}条</span></p>
                  <p>幼虫阶段：<span style={{ fontWeight: 'bold' }}>
                    {logs.filter(log => log.note.startsWith('#幼虫阶段')).length}条
                  </span></p>
                  <p>蛹阶段：<span style={{ fontWeight: 'bold' }}>
                    {logs.filter(log => log.note.startsWith('#蛹阶段')).length}条
                  </span></p>
                  <p>成虫阶段：<span style={{ fontWeight: 'bold' }}>
                    {logs.filter(log => log.note.startsWith('#成虫阶段')).length}条
                  </span></p>
                </div>
              </div>
              
              <div style={{ 
                marginBottom: '24px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>⚙️</span>
                  生成选项
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ marginBottom: '8px', color: '#4a6359', fontWeight: 'bold' }}>选择样式：</p>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="style" 
                        value="classic"
                        checked={style === 'classic'}
                        onChange={() => setStyle('classic')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>经典科学笔记</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="style" 
                        value="nature"
                        checked={style === 'nature'}
                        onChange={() => setStyle('nature')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>自然探索风格</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="style" 
                        value="lab"
                        checked={style === 'lab'}
                        onChange={() => setStyle('lab')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>实验室风格</span>
                    </label>
                  </div>
                  
                  <p style={{ marginBottom: '12px', color: '#4a6359', fontWeight: 'bold' }}>选择字体：</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
                    {renderFontOptions()}
                  </div>

                  <p style={{ marginBottom: '8px', color: '#4a6359', fontWeight: 'bold' }}>时间范围：</p>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="timeRange" 
                        value="all"
                        checked={timeRange === 'all'}
                        onChange={() => setTimeRange('all')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>全部记录</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="timeRange" 
                        value="larvae"
                        checked={timeRange === 'larvae'}
                        onChange={() => setTimeRange('larvae')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>仅幼虫阶段</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="timeRange" 
                        value="pupa"
                        checked={timeRange === 'pupa'}
                        onChange={() => setTimeRange('pupa')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>仅蛹阶段</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="timeRange" 
                        value="adult"
                        checked={timeRange === 'adult'}
                        onChange={() => setTimeRange('adult')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>仅成虫阶段</span>
                    </label>
                  </div>
                  
                  <p style={{ marginBottom: '8px', color: '#4a6359', fontWeight: 'bold' }}>布局方式：</p>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="layoutMode" 
                        value="single"
                        checked={layoutMode === 'single'}
                        onChange={() => setLayoutMode('single')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>每条记录单独一页</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="layoutMode" 
                        value="multi"
                        checked={layoutMode === 'multi'}
                        onChange={() => setLayoutMode('multi')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>智能组合多条记录</span>
                    </label>
                  </div>
                  
                  <p style={{ marginBottom: '8px', color: '#4a6359', fontWeight: 'bold' }}>附加选项：</p>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={includeStats}
                        onChange={(e) => setIncludeStats(e.target.checked)}
                        style={{ marginRight: '6px' }}
                      />
                      <span>包含统计信息</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={generateScienceJournalPDF}
                  disabled={logs.length === 0 || generating}
                  style={{
                    backgroundColor: '#5d9178',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: logs.length === 0 || generating ? 'not-allowed' : 'pointer',
                    opacity: logs.length === 0 || generating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>📓</span>
                  {generating ? '正在生成...' : '生成科学手帐PDF'}
                </button>
                
                {generating && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ textAlign: 'center', marginBottom: '8px', color: '#4a6359' }}>
                      进度: {Math.round(progress)}%
                    </p>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e2eee5',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        backgroundColor: '#5d9178',
                        transition: 'width 0.3s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>💡</span>
                  科学手帐使用提示
                </h3>
                
                <ul style={{ 
                  color: '#4a6359',
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  <li style={{ marginBottom: '8px' }}>生成的PDF文件适合打印出来作为Kane的科学笔记本</li>
                  <li style={{ marginBottom: '8px' }}>每条记录会生成一个单独的页面，包含照片和观察笔记</li>
                  <li style={{ marginBottom: '8px' }}>不同的样式有不同的背景和装饰效果</li>
                  <li style={{ marginBottom: '8px' }}>你可以选择只生成特定阶段的记录</li>
                  <li style={{ marginBottom: '8px' }}>统计信息包含每个阶段的记录数量和持续天数</li>
                  <li style={{ marginBottom: '8px' }}>多记录布局可以在一页上智能排列多条记录，节省打印纸张</li>
                  <li style={{ marginBottom: '8px' }}>系统会根据照片方向和内容长度自动选择最佳布局</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 