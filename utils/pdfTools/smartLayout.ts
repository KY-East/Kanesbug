/**
 * 智能排版系统 - 根据照片方向和文字长度智能选择最佳布局
 * 此模块负责处理图片分析和布局优化，为PDF生成提供支持
 */

import { jsPDF } from 'jspdf';
import { LogEntry } from '../../lib/timelineUtils';

// 照片方向类型
export type PhotoOrientation = 'landscape' | 'portrait' | 'square';

// 布局类型
export type LayoutType = 'photoTop' | 'photoLeft' | 'photoRight';

// 布局配置项
export interface LayoutConfig {
  photoWidth: number;
  photoHeight: number;
  photoX: number;
  photoY: number;
  textX: number;
  textY: number;
  textWidth: number;
  maxTextLines: number;
}

/**
 * 检测照片方向（横向、纵向或正方形）
 * @param img 已加载的图片元素
 * @returns 照片方向类型
 */
export function detectPhotoOrientation(img: HTMLImageElement): PhotoOrientation {
  const ratio = img.width / img.height;
  
  if (ratio > 1.2) {
    return 'landscape'; // 横向照片
  } else if (ratio < 0.8) {
    return 'portrait';  // 纵向照片
  } else {
    return 'square';    // 接近正方形
  }
}

/**
 * 根据照片方向和文字长度确定最佳布局
 * @param orientation 照片方向
 * @param textLength 文字长度
 * @returns 最适合的布局类型
 */
export function determineLayout(orientation: PhotoOrientation, textLength: number): LayoutType {
  // 文字超过200字，统一使用照片在上方的布局
  if (textLength > 200) {
    return 'photoTop';
  }
  
  // 根据照片方向选择默认布局
  switch (orientation) {
    case 'landscape':
      return 'photoTop';    // 横向照片放顶部
    case 'portrait':
      // 随机选择左右布局，增加设计活力感
      return Math.random() > 0.5 ? 'photoLeft' : 'photoRight';
    case 'square':
      // 方形照片也随机选择布局
      const layouts: LayoutType[] = ['photoTop', 'photoLeft', 'photoRight'];
      return layouts[Math.floor(Math.random() * layouts.length)];
    default:
      return 'photoTop'; // 默认布局
  }
}

/**
 * 根据布局类型生成布局配置
 * @param layoutType 布局类型
 * @param pageWidth 页面宽度
 * @param pageHeight 页面高度
 * @param margins 页面边距
 * @returns 布局配置对象
 */
export function getLayoutConfig(
  layoutType: LayoutType,
  pageWidth: number = 210, // A4宽度（mm）
  pageHeight: number = 297, // A4高度（mm）
  margins: number = 20
): LayoutConfig {
  
  const contentWidth = pageWidth - (margins * 2);
  const contentHeight = pageHeight - (margins * 2);
  
  switch (layoutType) {
    case 'photoTop':
      // 照片在上，文字在下
      return {
        photoWidth: contentWidth,
        photoHeight: contentHeight * 0.55, // 55%的内容区高度给照片
        photoX: margins,
        photoY: margins,
        textX: margins,
        textY: margins + (contentHeight * 0.55) + 10, // 照片下方10mm处
        textWidth: contentWidth,
        maxTextLines: 20 // 大约20行文本
      };
      
    case 'photoLeft':
      // 照片在左，文字在右
      return {
        photoWidth: contentWidth * 0.45, // 45%的内容区宽度给照片
        photoHeight: contentHeight * 0.6,
        photoX: margins,
        photoY: margins,
        textX: margins + (contentWidth * 0.45) + 5, // 照片右侧5mm处
        textY: margins,
        textWidth: contentWidth * 0.55 - 5, // 55%的内容区宽度给文字
        maxTextLines: 30 // 大约30行文本
      };
      
    case 'photoRight':
      // 照片在右，文字在左
      return {
        photoWidth: contentWidth * 0.45, // 45%的内容区宽度给照片
        photoHeight: contentHeight * 0.6,
        photoX: margins + contentWidth * 0.55, // 从右侧开始放置照片
        photoY: margins,
        textX: margins,
        textY: margins,
        textWidth: contentWidth * 0.55 - 5, // 55%的内容区宽度给文字
        maxTextLines: 30 // 大约30行文本
      };
      
    default:
      // 默认配置（同photoTop）
      return {
        photoWidth: contentWidth,
        photoHeight: contentHeight * 0.55,
        photoX: margins,
        photoY: margins,
        textX: margins,
        textY: margins + (contentHeight * 0.55) + 10,
        textWidth: contentWidth,
        maxTextLines: 20
      };
  }
}

/**
 * 应用布局到PDF文档
 * @param doc PDF文档对象
 * @param img 图片元素
 * @param text 文本内容
 * @param layoutType 布局类型
 * @param resources 资源对象（可选，用于装饰元素）
 * @param pageNumber 页码（用于页眉页脚）
 */
export async function applyLayout(
  doc: jsPDF,
  img: HTMLImageElement,
  text: string,
  layoutType: LayoutType,
  resources?: any,
  pageNumber?: number
): Promise<void> {
  try {
    // 获取布局配置
    const config = getLayoutConfig(layoutType);
    
    // 添加页面背景（如果资源中有背景）
    if (resources?.backgrounds?.paper) {
      doc.addImage(
        resources.backgrounds.paper, 
        'PNG', 
        0, 0, 
        210, 297 // A4页面大小
      );
    }
    
    // 添加页眉（如果提供了页码）
    if (typeof pageNumber === 'number') {
      doc.setFontSize(12);
      doc.text(`观察记录 #${pageNumber}`, 20, 15);
      doc.setFontSize(16); // 重置为默认字体大小
    }
    
    // 添加图片
    doc.addImage(
      img, 
      'JPEG', 
      config.photoX, 
      config.photoY, 
      config.photoWidth, 
      config.photoHeight
    );
    
    // 添加装饰元素（如果有）
    if (resources?.decorations?.tape) {
      try {
        // 左上角胶带
        doc.addImage(
          resources.decorations.tape, 
          'PNG', 
          config.photoX - 5, 
          config.photoY - 5, 
          20, 10
        );
        
        // 右上角胶带
        doc.addImage(
          resources.decorations.tape, 
          'PNG', 
          config.photoX + config.photoWidth - 15, 
          config.photoY - 5, 
          20, 10
        );
      } catch (err) {
        console.error("添加装饰失败", err);
        // 出错时静默处理，不影响PDF生成
      }
    }
    
    // 添加文本内容
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(text, config.textWidth);
    doc.text(splitText, config.textX, config.textY);
    
    // 添加页脚
    if (typeof pageNumber === 'number') {
      doc.setFontSize(10);
      doc.text(`Page ${pageNumber}`, 105, 287, { align: 'center' });
    }
    
  } catch (err) {
    console.error("应用布局失败", err);
    throw err;
  }
}

/**
 * 从URL加载图片并分析
 * @param url 图片URL
 * @returns Promise<{img: HTMLImageElement, orientation: PhotoOrientation}>
 */
export function loadAndAnalyzeImage(url: string): Promise<{
  img: HTMLImageElement,
  orientation: PhotoOrientation
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const orientation = detectPhotoOrientation(img);
      resolve({ img, orientation });
    };
    
    img.onerror = (err) => {
      reject(new Error(`图片加载失败: ${err}`));
    };
    
    img.src = url;
  });
}

/**
 * 智能渲染记录到PDF
 * @param doc PDF文档对象
 * @param log 日志条目
 * @param pageNumber 页码
 * @param resources 资源对象
 */
export async function smartRenderRecord(
  doc: jsPDF,
  log: LogEntry,
  pageNumber: number,
  resources?: any
): Promise<void> {
  try {
    // 加载并分析图片
    const { img, orientation } = await loadAndAnalyzeImage(log.photoURL);
    
    // 确定最佳布局
    const layoutType = determineLayout(orientation, log.note.length);
    
    // 应用布局到PDF
    await applyLayout(doc, img, log.note, layoutType, resources, pageNumber);
    
  } catch (err) {
    console.error(`智能渲染记录失败: ${err}`);
    // 失败时使用备用方式渲染（简单文本页）
    doc.text(`记录 #${pageNumber} - 加载失败`, 20, 20);
    doc.text(`日期: ${new Date(log.createdAt.seconds * 1000).toLocaleDateString()}`, 20, 30);
    doc.text(`注意: 照片加载失败，但您仍然可以看到以下笔记内容`, 20, 40);
    
    const splitText = doc.splitTextToSize(log.note, 170);
    doc.text(splitText, 20, 60);
  }
} 