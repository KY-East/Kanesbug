/**
 * 调试图片加载工具函数
 * 用于诊断和解决图片加载问题
 */

import { jsPDF } from 'jspdf';
import { LogEntry } from '../../lib/timelineUtils';

/**
 * 图片诊断页面
 * 生成一个仅包含图片相关信息的PDF页面
 * @param doc PDF文档对象
 * @param records 记录数组
 */
export async function generateImageDiagnosticPage(
  doc: jsPDF,
  records: LogEntry[]
): Promise<void> {
  // 添加新页面
  doc.addPage();
  
  // 添加页面标题
  doc.setFontSize(16);
  doc.text('图片诊断页面', 20, 20);
  
  // 遍历所有记录，输出图片URL信息
  doc.setFontSize(10);
  let y = 40;
  
  doc.text(`总记录数: ${records.length}`, 20, y);
  y += 10;
  
  for (let i = 0; i < Math.min(records.length, 5); i++) {
    const record = records[i];
    
    doc.text(`记录 #${i+1}:`, 20, y);
    y += 8;
    
    const photoInfo = `photo: ${record.photo ? '有值' : '无'} ${record.photo ? record.photo.substring(0, 30) + '...' : ''}`;
    doc.text(photoInfo, 30, y);
    y += 8;
    
    const photoURLInfo = `photoURL: ${record.photoURL ? '有值' : '无'} ${record.photoURL ? record.photoURL.substring(0, 30) + '...' : ''}`;
    doc.text(photoURLInfo, 30, y);
    y += 8;
    
    doc.text(`note长度: ${record.note.length} 字符`, 30, y);
    y += 15;
  }
  
  // 添加代理API信息
  doc.setFontSize(12);
  doc.text('图片代理API路径:', 20, y);
  y += 10;
  
  // 如果有第一条记录且有图片，提供代理API示例
  if (records.length > 0 && records[0].photo) {
    const sampleURL = `/api/proxy-image?url=${encodeURIComponent(records[0].photo)}`;
    doc.text(`示例: ${sampleURL}`, 20, y);
  } else if (records.length > 0 && records[0].photoURL) {
    const sampleURL = `/api/proxy-image?url=${encodeURIComponent(records[0].photoURL)}`;
    doc.text(`示例: ${sampleURL}`, 20, y);
  } else {
    doc.text('没有可用的图片URL', 20, y);
  }
  
  // 添加图片加载流程说明
  y += 20;
  doc.setFontSize(12);
  doc.text('图片加载流程:', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.text('1. 获取记录的photo属性值', 30, y); y += 8;
  doc.text('2. 使用代理API构建URL', 30, y); y += 8;
  doc.text('3. 创建Image对象并设置crossOrigin="anonymous"', 30, y); y += 8;
  doc.text('4. 加载图片，设置5秒超时', 30, y); y += 8;
  doc.text('5. 将加载的图片添加到PDF', 30, y);
} 