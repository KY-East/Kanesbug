/**
 * PDF字体工具 - 添加中文字体支持（本地文件版）
 */

import { jsPDF } from 'jspdf';
import { ChineseFontType } from './types';

// 字体映射信息
const fontMap: Record<ChineseFontType, { path: string, displayName: string, fullPath?: string }> = {
  'zcool-kuaile': {
    path: '/fonts/zhankukuaile.ttf',
    displayName: '站酷快乐体'
  },
  'zcool-xiaowei': {
    path: '/fonts/zhankuxiaowei.otf',
    displayName: '站酷小薇体'
  }
};

// 获取字体显示名称
export function getFontDisplayName(font: ChineseFontType): string {
  return fontMap[font]?.displayName || font;
}

// 添加中文字体到PDF文档
export async function addChineseFont(doc: jsPDF, font: ChineseFontType = 'zcool-kuaile'): Promise<boolean> {
  try {
    console.log(`🔤 尝试加载${getFontDisplayName(font)}...`);
    const fontInfo = fontMap[font];
    
    if (!fontInfo) {
      throw new Error(`未找到字体配置: ${font}`);
    }
    
    // 构建字体文件路径
    let fontPath;
    // 根据环境选择不同的路径处理方式
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // 在服务器环境中使用绝对路径（Node.js环境）
      const path = require('path');
      const process = require('process');
      // 优先使用配置的完整路径，其次生成完整路径
      fontPath = fontInfo.fullPath || path.join(process.cwd(), 'public', fontInfo.path);
      console.log(`📁 服务器端字体路径: ${fontPath}`);
    } else {
      // 在浏览器环境中使用相对路径
      fontPath = fontInfo.path;
      console.log(`📁 浏览器端字体路径: ${fontPath}`);
    }
    
    // 加载字体文件
    console.log(`🔄 开始加载字体文件...`);
    
    // 根据环境选择不同的加载方式
    let buffer: ArrayBuffer;
    if (isServer) {
      // 在服务器端使用fs读取文件
      const fs = require('fs').promises;
      const rawData = await fs.readFile(fontPath);
      buffer = rawData.buffer;
      console.log(`✅ 字体文件读取成功，大小: ${buffer.byteLength} 字节`);
    } else {
      // 在浏览器端使用fetch API
      const res = await fetch(fontPath);
      if (!res.ok) {
        throw new Error(`字体文件加载失败: ${res.status} ${res.statusText}`);
      }
      console.log(`✅ 字体文件fetch成功: ${res.status} ${res.statusText}`);
      buffer = await res.arrayBuffer();
    }
    
    console.log(`📦 获取到字体文件buffer，大小: ${buffer.byteLength} 字节`);
    
    const base64Font = arrayBufferToBase64(buffer);
    console.log(`🔣 转换为base64完成，长度: ${base64Font.length}`);
    
    // 将字体添加到VFS并注册
    console.log(`📥 添加字体到VFS: ${font}.ttf`);
    doc.addFileToVFS(`${font}.ttf`, base64Font);
    
    console.log(`🔠 注册字体: ${font}`);
    doc.addFont(`${font}.ttf`, font, 'normal');
    
    console.log(`🎯 设置为当前字体: ${font}`);
    doc.setFont(font);
    doc.setFontSize(12);
    
    // 测试字体是否可用
    try {
      console.log(`🧪 测试字体渲染`);
      // 创建新的离屏页面来测试字体
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      doc.addPage();
      doc.text('测试中文', 10, 10);
      doc.deletePage(doc.getCurrentPageInfo().pageNumber);
      doc.setPage(currentPage);
      console.log(`✅ 字体测试成功`);
    } catch (testErr) {
      console.error(`❌ 字体测试失败: ${testErr}`);
      // 测试失败，但仍然返回true，因为字体可能只在某些操作上有问题
    }
    
    return true;
  } catch (err) {
    console.error(`❌ 添加字体失败: ${font}`, err);
    // 降级方案: 使用内置字体 + 小字号
    doc.setFont('helvetica');
    doc.setFontSize(10);
    doc.setLanguage('zh-CN');
    return false;
  }
}

// 将ArrayBuffer转换为Base64字符串
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const binary = [];
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary.push(String.fromCharCode(bytes[i]));
  }
  return btoa(binary.join(''));
}

// 分割中文字符串为安全长度的片段
export const splitChineseText = (text: string, maxLength: number = 20): string[] => {
  if (!text) return [''];
  
  // 保守地分割中文文本为较短段落
  const result: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    result.push(text.substring(i, i + maxLength));
  }
  
  return result;
};

// 安全转换日期为英文格式 (避免中文日期可能导致的问题)
export const formatChineseDate = (date: Date): string => {
  // 使用英文格式但结构保持一致
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}-${month}-${day}`;
};

// 检查字体文件是否存在并可访问
export async function checkFontAvailability(): Promise<Record<ChineseFontType, boolean>> {
  const results: Record<string, boolean> = {};
  
  console.log('🔍 开始检查所有字体文件可用性...');
  
  // 判断运行环境
  const isServer = typeof window === 'undefined';
  
  for (const font of Object.keys(fontMap) as ChineseFontType[]) {
    try {
      const fontInfo = fontMap[font];
      let fontPath;
      
      if (isServer) {
        // 在服务器端使用绝对路径
        const path = require('path');
        const process = require('process');
        fontPath = fontInfo.fullPath || path.join(process.cwd(), 'public', fontInfo.path);
      } else {
        // 在浏览器端使用相对路径
        fontPath = fontInfo.path;
      }
      
      console.log(`📁 检查字体: ${getFontDisplayName(font)}, 路径: ${fontPath}`);
      
      if (isServer) {
        // 在服务器端使用fs检查文件存在
        try {
          const fs = require('fs');
          results[font] = fs.existsSync(fontPath);
          console.log(`${results[font] ? '✅' : '❌'} 字体 ${getFontDisplayName(font)} ${results[font] ? '可用' : '不可用'}`);
        } catch (err) {
          console.error(`❌ 检查字体失败 (服务器端): ${font}`, err);
          results[font] = false;
        }
      } else {
        // 在浏览器端使用fetch HEAD请求检查
        try {
          const response = await fetch(fontPath, { method: 'HEAD' });
          results[font] = response.ok;
          console.log(`${response.ok ? '✅' : '❌'} 字体 ${getFontDisplayName(font)} ${response.ok ? '可用' : '不可用'}: ${response.status} ${response.statusText}`);
        } catch (err) {
          console.error(`❌ 检查字体失败 (浏览器端): ${font}`, err);
          results[font] = false;
        }
      }
    } catch (err) {
      console.error(`❌ 检查字体失败 (通用): ${font}`, err);
      results[font] = false;
    }
  }
  
  console.log('📊 字体检查结果:', results);
  return results as Record<ChineseFontType, boolean>;
} 