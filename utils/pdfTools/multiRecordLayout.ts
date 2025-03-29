/**
 * 多记录布局模块 - 实现一页放置多条记录以减少打印页数
 * 该模块提供记录分组和多记录布局渲染功能
 */

import { jsPDF } from 'jspdf';
import { LogEntry } from '../../lib/timelineUtils';
import { PhotoOrientation, detectPhotoOrientation, determineLayout } from './smartLayout';

// 布局类型
export type LayoutType = 'photoTop' | 'photoLeft' | 'photoRight';

// 记录组类型（一页可以显示多条记录）
export interface RecordGroup {
  records: LogEntry[];
  layoutType: 'single' | 'doubleVertical' | 'doubleHorizontal' | 'triple' | 'quad';
  dateKey?: string; // 日期分组键
}

// 分组结果类型
export interface GroupingResult {
  groups: RecordGroup[];
  totalPages: number;
}

/**
 * 将记录分组，确定最佳布局组合
 * @param logs 记录数组
 * @param groupByDate 是否按日期分组
 * @returns 分组结果
 */
export async function groupRecordsForLayout(
  logs: LogEntry[], 
  groupByDate: boolean = true
): Promise<GroupingResult> {
  console.log(`开始分组记录，共 ${logs.length} 条记录，按日期分组: ${groupByDate}`);
  
  // 检查记录数据结构
  if (logs.length > 0) {
    const sampleLog = logs[0];
    console.log(`记录示例 - photo: ${!!sampleLog.photo}, photoURL: ${!!sampleLog.photoURL}, note长度: ${sampleLog.note?.length || 0}`);
  }
  
  // 结果数组
  const groups: RecordGroup[] = [];
  
  // 按日期排序（从早到晚）
  const sortedLogs = [...logs].sort((a, b) => 
    a.createdAt.seconds - b.createdAt.seconds
  );
  
  // 如果按日期分组
  if (groupByDate) {
    // 按日期分组
    const dateGroups: Record<string, LogEntry[]> = {};
    
    for (const log of sortedLogs) {
      const date = new Date(log.createdAt.seconds * 1000);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }
      
      dateGroups[dateKey].push(log);
    }
    
    // 处理每个日期组
    for (const dateKey in dateGroups) {
      const dateRecords = dateGroups[dateKey];
      
      if (dateRecords.length === 1) {
        // 单条记录，单独一页
        groups.push({
          records: [dateRecords[0]],
          layoutType: 'single',
          dateKey
        });
      } else if (dateRecords.length === 2) {
        // 尝试加载图片并分析方向，以确定最佳布局
        try {
          const photo1 = new Image();
          photo1.crossOrigin = "anonymous";  // 添加跨域支持
          // 使用完整URL路径，确保类型安全
          const url1 = dateRecords[0].photoURL || '';
          photo1.src = typeof window !== 'undefined' ? 
            (window.location.origin + url1) : url1;
          
          const photo2 = new Image();
          photo2.crossOrigin = "anonymous";  // 添加跨域支持
          const url2 = dateRecords[1].photoURL || '';
          photo2.src = typeof window !== 'undefined' ? 
            (window.location.origin + url2) : url2;
          
          // 等待图片加载完成，添加错误处理和超时
          await Promise.all([
            new Promise<void>((resolve) => {
              photo1.onload = () => resolve();
              photo1.onerror = () => {
                console.warn(`无法加载图片: ${url1}，使用默认布局`);
                resolve(); // 继续处理，不中断流程
              };
              // 5秒超时
              setTimeout(() => {
                console.warn(`加载图片超时: ${url1}`);
                resolve(); // 继续处理，不中断流程
              }, 5000);
            }),
            new Promise<void>((resolve) => {
              photo2.onload = () => resolve();
              photo2.onerror = () => {
                console.warn(`无法加载图片: ${url2}，使用默认布局`);
                resolve(); // 继续处理，不中断流程
              };
              // 5秒超时
              setTimeout(() => {
                console.warn(`加载图片超时: ${url2}`);
                resolve(); // 继续处理，不中断流程
              }, 5000);
            })
          ]);
          
          // 检查图片是否真正加载成功
          const orientation1 = photo1.complete ? detectPhotoOrientation(photo1) : 'landscape';
          const orientation2 = photo2.complete ? detectPhotoOrientation(photo2) : 'landscape';
          
          // 确定布局方式
          if (orientation1 === 'landscape' && orientation2 === 'landscape') {
            // 两张横向照片 -> 垂直布局（上下排列）
            groups.push({
              records: dateRecords,
              layoutType: 'doubleVertical',
              dateKey
            });
          } else if (orientation1 === 'portrait' && orientation2 === 'portrait') {
            // 两张纵向照片 -> 水平布局（左右排列）
            groups.push({
              records: dateRecords,
              layoutType: 'doubleHorizontal',
              dateKey
            });
          } else {
            // 混合方向 -> 根据文本长度决定布局
            const totalTextLength = dateRecords[0].note.length + dateRecords[1].note.length;
            
            if (totalTextLength > 300) {
              // 文本较长，分为两页
              groups.push({
                records: [dateRecords[0]],
                layoutType: 'single',
                dateKey
              });
              groups.push({
                records: [dateRecords[1]],
                layoutType: 'single',
                dateKey
              });
            } else {
              // 文本较短，使用最适合的布局
              groups.push({
                records: dateRecords,
                layoutType: (orientation1 === 'landscape' || orientation2 === 'landscape') 
                  ? 'doubleVertical' // 有横向照片，上下排列
                  : 'doubleHorizontal', // 无横向照片，左右排列
                dateKey
              });
            }
          }
        } catch (err) {
          console.error(`分析照片失败: ${err}`);
          // 出错时默认单独布局
          dateRecords.forEach(record => {
            groups.push({
              records: [record],
              layoutType: 'single',
              dateKey
            });
          });
        }
      } else if (dateRecords.length === 3) {
        // 三条记录，使用三条记录布局
        groups.push({
          records: dateRecords,
          layoutType: 'triple',
          dateKey
        });
      } else if (dateRecords.length >= 4) {
        // 4条或更多记录，每4条一组使用四条记录布局
        for (let i = 0; i < dateRecords.length; i += 4) {
          const chunk = dateRecords.slice(i, i + 4);
          if (chunk.length === 4) {
            groups.push({
              records: chunk,
              layoutType: 'quad',
              dateKey
            });
          } else if (chunk.length === 3) {
            groups.push({
              records: chunk,
              layoutType: 'triple',
              dateKey
            });
          } else if (chunk.length === 2) {
            groups.push({
              records: chunk,
              layoutType: 'doubleVertical',
              dateKey
            });
          } else {
            groups.push({
              records: chunk,
              layoutType: 'single',
              dateKey
            });
          }
        }
      }
    }
  } else {
    // 不按日期分组，简单地每4条记录一组
    for (let i = 0; i < sortedLogs.length; i += 4) {
      const chunk = sortedLogs.slice(i, i + 4);
      
      if (chunk.length === 1) {
        groups.push({
          records: chunk,
          layoutType: 'single'
        });
      } else if (chunk.length === 2) {
        groups.push({
          records: chunk,
          layoutType: 'doubleVertical'
        });
      } else if (chunk.length === 3) {
        groups.push({
          records: chunk,
          layoutType: 'triple'
        });
      } else { // 4条
        groups.push({
          records: chunk,
          layoutType: 'quad'
        });
      }
    }
  }
  
  return {
    groups,
    totalPages: groups.length
  };
}

/**
 * 渲染记录组到PDF页面
 * @param doc PDF文档对象
 * @param group 记录组
 * @param pageNumber 页码
 * @param resources 资源对象
 */
export async function renderRecordGroupToPage(
  doc: jsPDF,
  group: RecordGroup,
  pageNumber: number,
  resources?: any
): Promise<void> {
  // 添加新页面（除第一页外）
  if (pageNumber > 1) {
    doc.addPage();
  }
  
  // 添加页面背景（如果有）
  if (resources?.backgrounds?.paper) {
    doc.addImage(
      resources.backgrounds.paper, 
      'PNG', 
      0, 0, 
      210, 297 // A4页面大小
    );
  }
  
  // 添加页眉
  doc.setFontSize(12);
  doc.text(`观察记录 - 第${pageNumber}页`, 20, 15);
  
  // 如果有日期组，显示日期
  if (group.dateKey) {
    const [year, month, day] = group.dateKey.split('-').map(Number);
    const dateStr = `${year}年${month}月${day}日`;
    doc.text(dateStr, 190, 15, { align: 'right' });
  }
  
  // 根据布局类型渲染记录
  switch (group.layoutType) {
    case 'single':
      await renderSingleRecord(doc, group.records[0], 'photoTop', resources);
      break;
      
    case 'doubleVertical':
      await renderDoubleVerticalRecords(doc, group.records, resources);
      break;
      
    case 'doubleHorizontal':
      await renderDoubleHorizontalRecords(doc, group.records, resources);
      break;
      
    case 'triple':
      await renderTripleRecords(doc, group.records, resources);
      break;
      
    case 'quad':
      await renderQuadRecords(doc, group.records, resources);
      break;
  }
  
  // 添加页脚
  doc.setFontSize(10);
  doc.text(`Page ${pageNumber}`, 105, 287, { align: 'center' });
}

/**
 * 渲染单条记录
 * @param doc PDF文档对象
 * @param record 记录
 * @param layoutType 布局类型
 * @param resources 资源对象
 */
async function renderSingleRecord(
  doc: jsPDF,
  record: LogEntry,
  layoutType: LayoutType = 'photoTop',
  resources?: any
): Promise<void> {
  try {
    // 页面尺寸计算
    const margins = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margins * 2);
    const contentHeight = 257; // 297(A4高度) - 40(上下边距)
    
    // 添加网格线背景（如果有）
    if (resources?.backgrounds?.grid) {
      doc.addImage(
        resources.backgrounds.grid, 
        'PNG', 
        0, 0, 
        pageWidth, 297 // A4大小
      );
    }
    
    // 加载图片
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // 使用代理API获取图片
    const imgUrl = `/api/proxy-image?url=${encodeURIComponent(record.photo || '')}`;
      
    console.log(`正在加载单记录图片: ${imgUrl}`);
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        console.log(`单记录图片加载成功: ${imgUrl}`);
        resolve();
      };
      img.onerror = () => {
        console.error(`单记录图片加载失败: ${imgUrl}`);
        reject(new Error(`图片加载失败: ${imgUrl}`));
      };
      // 设置5秒超时
      const timeout = setTimeout(() => {
        console.error(`单记录图片加载超时: ${imgUrl}`);
        reject(new Error(`图片加载超时: ${imgUrl}`));
      }, 5000);
      
      img.src = imgUrl;
      
      // 如果图片已经加载完成，清除超时
      if (img.complete) {
        clearTimeout(timeout);
        resolve();
      }
    });
    
    // 根据布局类型确定各元素位置
    let imgWidth: number, imgHeight: number, imgX: number, imgY: number;
    let textX: number, textY: number, textWidth: number;
    
    // 根据布局类型设置位置和尺寸
    if (layoutType === 'photoTop') {
      // 照片在上方
      imgWidth = contentWidth;
      imgHeight = contentHeight * 0.5;
      imgX = margins;
      imgY = margins + 10; // 页眉下方10mm
      
      textX = margins;
      textY = imgY + imgHeight + 10;
      textWidth = contentWidth;
    } else if (layoutType === 'photoLeft') {
      // 照片在左侧
      imgWidth = contentWidth * 0.45;
      imgHeight = contentHeight * 0.6;
      imgX = margins;
      imgY = margins + 20; // 页眉下方20mm
      
      textX = imgX + imgWidth + 10;
      textY = imgY;
      textWidth = contentWidth - imgWidth - 10;
    } else {
      // 照片在右侧
      imgWidth = contentWidth * 0.45;
      imgHeight = contentHeight * 0.6;
      imgX = margins + contentWidth - imgWidth;
      imgY = margins + 20; // 页眉下方20mm
      
      textX = margins;
      textY = imgY;
      textWidth = contentWidth - imgWidth - 10;
    }
    
    // 添加图片
    doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    
    // 添加装饰（如果有）
    if (resources?.decorations?.tape) {
      try {
        // 添加左上角胶带效果
        doc.addImage(
          resources.decorations.tape, 
          'PNG', 
          imgX - 5, 
          imgY - 5, 
          20, 10
        );
        
        // 添加右上角胶带效果
        doc.addImage(
          resources.decorations.tape, 
          'PNG', 
          imgX + imgWidth - 15, 
          imgY - 5, 
          20, 10
        );
      } catch (err) {
        console.error("添加装饰失败", err);
      }
    }
    
    // 添加文字
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(record.note, textWidth);
    doc.text(splitText, textX, textY);
    
    // 添加日期
    const date = new Date(record.createdAt.seconds * 1000);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    doc.setFontSize(9);
    doc.text(dateStr, textX, textY - 5);
    
  } catch (err) {
    console.error(`渲染单条记录失败: ${err}`);
    // 渲染失败，显示错误信息
    doc.text("无法加载图片", 105, 140, { align: 'center' });
    doc.text(record.note, 20, 160);
  }
}

/**
 * 渲染两条垂直排列的记录（一页两条，上下排列）
 * @param doc PDF文档对象
 * @param records 记录数组（2条）
 * @param resources 资源对象
 */
async function renderDoubleVerticalRecords(
  doc: jsPDF,
  records: LogEntry[],
  resources?: any
): Promise<void> {
  if (records.length !== 2) {
    throw new Error("需要两条记录进行垂直排列");
  }
  
  const margins = 20;
  const pageWidth = 210;
  const pageHeight = 297;
  const recordHeight = (pageHeight - margins * 3) / 2; // 上下两部分的高度（中间有间隔）
  
  try {
    // 加载图片
    const imgs = await Promise.all(records.map(async (record) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // 使用代理API获取图片，统一使用photo属性
        const imgUrl = `/api/proxy-image?url=${encodeURIComponent(record.photo || '')}`;
        
        console.log(`正在加载图片: ${imgUrl}`);
        
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            console.log(`图片加载成功: ${imgUrl}`);
            resolve(img);
          };
          img.onerror = () => {
            console.error(`图片加载失败: ${imgUrl}`);
            reject(new Error(`图片加载失败: ${imgUrl}`));
          };
          // 设置5秒超时
          const timeout = setTimeout(() => {
            console.error(`图片加载超时: ${imgUrl}`);
            reject(new Error(`图片加载超时: ${imgUrl}`));
          }, 5000);
          
          img.src = imgUrl;
          
          // 如果图片已经加载完成，清除超时
          if (img.complete) {
            clearTimeout(timeout);
            resolve(img);
          }
        });
      } catch (error) {
        console.error(`处理图片URL失败:`, error);
        throw error;
      }
    }));
    
    // 第一条记录 - 上半部分
    const img1 = imgs[0];
    const imgWidth1 = pageWidth - margins * 2;
    const imgHeight1 = recordHeight * 0.6;
    const imgX1 = margins;
    const imgY1 = margins + 10;
    
    doc.addImage(img1, 'JPEG', imgX1, imgY1, imgWidth1, imgHeight1);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 - 5, imgY1 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 + imgWidth1 - 15, imgY1 - 5, 20, 10);
    }
    
    // 添加文字
    const textX1 = margins;
    const textY1 = imgY1 + imgHeight1 + 5;
    const textWidth1 = pageWidth - margins * 2;
    
    doc.setFontSize(10);
    const date1 = new Date(records[0].createdAt.seconds * 1000);
    const dateStr1 = `${date1.getFullYear()}年${date1.getMonth() + 1}月${date1.getDate()}日`;
    doc.text(dateStr1, textX1, textY1 - 5);
    
    doc.setFontSize(9);
    const splitText1 = doc.splitTextToSize(records[0].note, textWidth1);
    doc.text(splitText1, textX1, textY1);
    
    // 分隔线
    doc.setDrawColor(200, 200, 200);
    doc.line(margins, imgY1 + recordHeight, pageWidth - margins, imgY1 + recordHeight);
    
    // 第二条记录 - 下半部分
    const img2 = imgs[1];
    const imgWidth2 = pageWidth - margins * 2;
    const imgHeight2 = recordHeight * 0.6;
    const imgX2 = margins;
    const imgY2 = imgY1 + recordHeight + 10;
    
    doc.addImage(img2, 'JPEG', imgX2, imgY2, imgWidth2, imgHeight2);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 - 5, imgY2 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 + imgWidth2 - 15, imgY2 - 5, 20, 10);
    }
    
    // 添加文字
    const textX2 = margins;
    const textY2 = imgY2 + imgHeight2 + 5;
    const textWidth2 = pageWidth - margins * 2;
    
    doc.setFontSize(10);
    const date2 = new Date(records[1].createdAt.seconds * 1000);
    const dateStr2 = `${date2.getFullYear()}年${date2.getMonth() + 1}月${date2.getDate()}日`;
    doc.text(dateStr2, textX2, textY2 - 5);
    
    doc.setFontSize(9);
    const splitText2 = doc.splitTextToSize(records[1].note, textWidth2);
    doc.text(splitText2, textX2, textY2);
    
  } catch (err) {
    console.error(`渲染垂直双记录失败: ${err}`);
    // 渲染失败，显示错误信息
    doc.text("无法加载图片", 105, 140, { align: 'center' });
    doc.text(records.map(r => r.note).join('\n\n'), 20, 160);
  }
}

/**
 * 渲染两条水平排列的记录（一页两条，左右排列）
 * @param doc PDF文档对象
 * @param records 记录数组（2条）
 * @param resources 资源对象
 */
async function renderDoubleHorizontalRecords(
  doc: jsPDF,
  records: LogEntry[],
  resources?: any
): Promise<void> {
  if (records.length !== 2) {
    throw new Error("需要两条记录进行水平排列");
  }
  
  const margins = 20;
  const pageWidth = 210;
  const contentWidth = (pageWidth - margins * 3) / 2; // 左右两部分的宽度（中间有间隔）
  
  try {
    // 加载图片
    const imgs = await Promise.all(records.map(async (record) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // 使用代理API获取图片，统一使用photo属性
        const imgUrl = `/api/proxy-image?url=${encodeURIComponent(record.photo || '')}`;
        
        console.log(`正在加载图片: ${imgUrl}`);
        
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            console.log(`图片加载成功: ${imgUrl}`);
            resolve(img);
          };
          img.onerror = () => {
            console.error(`图片加载失败: ${imgUrl}`);
            reject(new Error(`图片加载失败: ${imgUrl}`));
          };
          // 设置5秒超时
          const timeout = setTimeout(() => {
            console.error(`图片加载超时: ${imgUrl}`);
            reject(new Error(`图片加载超时: ${imgUrl}`));
          }, 5000);
          
          img.src = imgUrl;
          
          // 如果图片已经加载完成，清除超时
          if (img.complete) {
            clearTimeout(timeout);
            resolve(img);
          }
        });
      } catch (error) {
        console.error(`处理图片URL失败:`, error);
        throw error;
      }
    }));
    
    // 第一条记录 - 左半部分
    const img1 = imgs[0];
    const imgWidth1 = contentWidth;
    const imgHeight1 = imgWidth1 * (img1.height / img1.width);
    const imgX1 = margins;
    const imgY1 = margins + 20;
    
    doc.addImage(img1, 'JPEG', imgX1, imgY1, imgWidth1, imgHeight1);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 - 5, imgY1 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 + imgWidth1 - 15, imgY1 - 5, 20, 10);
    }
    
    // 添加文字
    const textX1 = margins;
    const textY1 = imgY1 + imgHeight1 + 5;
    const textWidth1 = contentWidth;
    
    doc.setFontSize(10);
    const date1 = new Date(records[0].createdAt.seconds * 1000);
    const dateStr1 = `${date1.getFullYear()}年${date1.getMonth() + 1}月${date1.getDate()}日`;
    doc.text(dateStr1, textX1, textY1 - 5);
    
    doc.setFontSize(9);
    const splitText1 = doc.splitTextToSize(records[0].note, textWidth1);
    doc.text(splitText1, textX1, textY1);
    
    // 分隔线
    doc.setDrawColor(200, 200, 200);
    doc.line(margins + contentWidth + margins/2, margins + 10, margins + contentWidth + margins/2, 280);
    
    // 第二条记录 - 右半部分
    const img2 = imgs[1];
    const imgWidth2 = contentWidth;
    const imgHeight2 = imgWidth2 * (img2.height / img2.width);
    const imgX2 = margins * 2 + contentWidth;
    const imgY2 = margins + 20;
    
    doc.addImage(img2, 'JPEG', imgX2, imgY2, imgWidth2, imgHeight2);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 - 5, imgY2 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 + imgWidth2 - 15, imgY2 - 5, 20, 10);
    }
    
    // 添加文字
    const textX2 = imgX2;
    const textY2 = imgY2 + imgHeight2 + 5;
    const textWidth2 = contentWidth;
    
    doc.setFontSize(10);
    const date2 = new Date(records[1].createdAt.seconds * 1000);
    const dateStr2 = `${date2.getFullYear()}年${date2.getMonth() + 1}月${date2.getDate()}日`;
    doc.text(dateStr2, textX2, textY2 - 5);
    
    doc.setFontSize(9);
    const splitText2 = doc.splitTextToSize(records[1].note, textWidth2);
    doc.text(splitText2, textX2, textY2);
    
  } catch (err) {
    console.error(`渲染水平双记录失败: ${err}`);
    // 渲染失败，显示错误信息
    doc.text("无法加载图片", 105, 140, { align: 'center' });
    doc.text(records.map(r => r.note).join('\n\n'), 20, 160);
  }
}

/**
 * 渲染三条记录（一页三条）
 * 布局：一条记录在上半部分，两条记录在下半部分左右并排
 * @param doc PDF文档对象
 * @param records 记录数组（3条）
 * @param resources 资源对象
 */
async function renderTripleRecords(
  doc: jsPDF,
  records: LogEntry[],
  resources?: any
): Promise<void> {
  if (records.length !== 3) {
    throw new Error("需要三条记录");
  }
  
  try {
    const margins = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    
    // 上部分占1/2高度
    const topHeight = (pageHeight - margins * 3) / 2;
    
    // 下部分每个记录占1/4页宽度
    const bottomWidth = (pageWidth - margins * 3) / 2;
    
    // 加载图片
    const imgs = await Promise.all(records.map(async (record) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // 使用代理API获取图片，统一使用photo属性
        const imgUrl = `/api/proxy-image?url=${encodeURIComponent(record.photo || '')}`;
        
        console.log(`正在加载图片: ${imgUrl}`);
        
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            console.log(`图片加载成功: ${imgUrl}`);
            resolve(img);
          };
          img.onerror = () => {
            console.error(`图片加载失败: ${imgUrl}`);
            reject(new Error(`图片加载失败: ${imgUrl}`));
          };
          // 设置5秒超时
          const timeout = setTimeout(() => {
            console.error(`图片加载超时: ${imgUrl}`);
            reject(new Error(`图片加载超时: ${imgUrl}`));
          }, 5000);
          
          img.src = imgUrl;
          
          // 如果图片已经加载完成，清除超时
          if (img.complete) {
            clearTimeout(timeout);
            resolve(img);
          }
        });
      } catch (error) {
        console.error(`处理图片URL失败:`, error);
        throw error;
      }
    }));
    
    // 第一条记录 - 上部分
    const img1 = imgs[0];
    const imgWidth1 = pageWidth - margins * 2;
    const imgHeight1 = topHeight * 0.6;
    const imgX1 = margins;
    const imgY1 = margins + 10;
    
    doc.addImage(img1, 'JPEG', imgX1, imgY1, imgWidth1, imgHeight1);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 - 5, imgY1 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX1 + imgWidth1 - 15, imgY1 - 5, 20, 10);
    }
    
    // 添加文字
    const textX1 = margins;
    const textY1 = imgY1 + imgHeight1 + 5;
    const textWidth1 = imgWidth1;
    
    doc.setFontSize(10);
    const date1 = new Date(records[0].createdAt.seconds * 1000);
    const dateStr1 = `${date1.getFullYear()}年${date1.getMonth() + 1}月${date1.getDate()}日`;
    doc.text(dateStr1, textX1, textY1 - 5);
    
    doc.setFontSize(9);
    const splitText1 = doc.splitTextToSize(records[0].note, textWidth1);
    doc.text(splitText1, textX1, textY1);
    
    // 分隔线
    doc.setDrawColor(200, 200, 200);
    doc.line(margins, imgY1 + topHeight, pageWidth - margins, imgY1 + topHeight);
    
    // 第二条记录 - 下左
    const img2 = imgs[1];
    const imgWidth2 = bottomWidth;
    const imgHeight2 = imgWidth2 * (img2.height / img2.width);
    const imgX2 = margins;
    const imgY2 = imgY1 + topHeight + 10;
    
    doc.addImage(img2, 'JPEG', imgX2, imgY2, imgWidth2, imgHeight2);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 - 5, imgY2 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX2 + imgWidth2 - 15, imgY2 - 5, 20, 10);
    }
    
    // 添加文字
    const textX2 = margins;
    const textY2 = imgY2 + imgHeight2 + 5;
    const textWidth2 = bottomWidth;
    
    doc.setFontSize(9);
    const date2 = new Date(records[1].createdAt.seconds * 1000);
    const dateStr2 = `${date2.getFullYear()}年${date2.getMonth() + 1}月${date2.getDate()}日`;
    doc.text(dateStr2, textX2, textY2 - 5);
    
    doc.setFontSize(8);
    const splitText2 = doc.splitTextToSize(records[1].note, textWidth2);
    doc.text(splitText2, textX2, textY2);
    
    // 垂直分隔线
    doc.setDrawColor(200, 200, 200);
    doc.line(margins + bottomWidth + margins/2, imgY1 + topHeight + 5, margins + bottomWidth + margins/2, 280);
    
    // 第三条记录 - 下右
    const img3 = imgs[2];
    const imgWidth3 = bottomWidth;
    const imgHeight3 = imgWidth3 * (img3.height / img3.width);
    const imgX3 = margins * 2 + bottomWidth;
    const imgY3 = imgY1 + topHeight + 10;
    
    doc.addImage(img3, 'JPEG', imgX3, imgY3, imgWidth3, imgHeight3);
    
    // 添加装饰
    if (resources?.decorations?.tape) {
      doc.addImage(resources.decorations.tape, 'PNG', imgX3 - 5, imgY3 - 5, 20, 10);
      doc.addImage(resources.decorations.tape, 'PNG', imgX3 + imgWidth3 - 15, imgY3 - 5, 20, 10);
    }
    
    // 添加文字
    const textX3 = imgX3;
    const textY3 = imgY3 + imgHeight3 + 5;
    const textWidth3 = bottomWidth;
    
    doc.setFontSize(9);
    const date3 = new Date(records[2].createdAt.seconds * 1000);
    const dateStr3 = `${date3.getFullYear()}年${date3.getMonth() + 1}月${date3.getDate()}日`;
    doc.text(dateStr3, textX3, textY3 - 5);
    
    doc.setFontSize(8);
    const splitText3 = doc.splitTextToSize(records[2].note, textWidth3);
    doc.text(splitText3, textX3, textY3);
    
  } catch (err) {
    console.error(`渲染三记录布局失败: ${err}`);
    // 渲染失败，显示错误信息
    doc.text("无法加载图片", 105, 140, { align: 'center' });
    doc.text(records.map((r, i) => `记录${i+1}: ${r.note}`).join('\n\n'), 20, 160);
  }
}

/**
 * 渲染四条记录（一页四条）
 * 布局：2x2网格布局，每条记录占1/4页面
 * @param doc PDF文档对象
 * @param records 记录数组（4条）
 * @param resources 资源对象
 */
async function renderQuadRecords(
  doc: jsPDF,
  records: LogEntry[],
  resources?: any
): Promise<void> {
  if (records.length !== 4) {
    throw new Error("需要四条记录");
  }
  
  try {
    const margins = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    
    // 页面划分为四个象限
    const cellWidth = (pageWidth - margins * 3) / 2;
    const cellHeight = (pageHeight - margins * 3) / 2;
    
    // 加载图片
    const imgs = await Promise.all(records.map(async (record) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // 使用代理API获取图片
        const imgUrl = typeof window !== 'undefined' 
          ? `/api/proxy-image?url=${encodeURIComponent(record.photoURL || '')}`
          : record.photoURL || '';
        
        console.log(`正在加载图片: ${imgUrl}`);
        
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            console.log(`图片加载成功: ${imgUrl}`);
            resolve(img);
          };
          img.onerror = () => {
            console.error(`图片加载失败: ${imgUrl}`);
            reject(new Error(`图片加载失败: ${imgUrl}`));
          };
          // 设置5秒超时
          const timeout = setTimeout(() => {
            console.error(`图片加载超时: ${imgUrl}`);
            reject(new Error(`图片加载超时: ${imgUrl}`));
          }, 5000);
          
          img.src = imgUrl;
          
          // 如果图片已经加载完成，清除超时
          if (img.complete) {
            clearTimeout(timeout);
            resolve(img);
          }
        });
      } catch (error) {
        console.error(`处理图片URL失败:`, error);
        throw error;
      }
    }));
    
    // 四个象限的位置
    const positions = [
      { x: margins, y: margins + 10 }, // 左上
      { x: margins * 2 + cellWidth, y: margins + 10 }, // 右上
      { x: margins, y: margins * 2 + cellHeight }, // 左下
      { x: margins * 2 + cellWidth, y: margins * 2 + cellHeight } // 右下
    ];
    
    // 绘制分隔线
    doc.setDrawColor(200, 200, 200);
    // 水平分隔线
    doc.line(margins, margins + cellHeight + 5, pageWidth - margins, margins + cellHeight + 5);
    // 垂直分隔线
    doc.line(margins + cellWidth + margins/2, margins, margins + cellWidth + margins/2, pageHeight - margins);
    
    // 渲染四条记录
    for (let i = 0; i < 4; i++) {
      const img = imgs[i];
      const record = records[i];
      const pos = positions[i];
      
      // 计算图片尺寸
      const imgWidth = cellWidth - 10; // 留一些边距
      const imgHeight = imgWidth * 0.75; // 固定高宽比
      
      // 添加图片
      doc.addImage(img, 'JPEG', pos.x + 5, pos.y + 5, imgWidth, imgHeight);
      
      // 添加装饰
      if (resources?.decorations?.tape) {
        doc.addImage(resources.decorations.tape, 'PNG', pos.x, pos.y, 20, 10);
        doc.addImage(resources.decorations.tape, 'PNG', pos.x + imgWidth - 10, pos.y, 20, 10);
      }
      
      // 添加日期
      doc.setFontSize(8);
      const date = new Date(record.createdAt.seconds * 1000);
      const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      doc.text(dateStr, pos.x + 5, pos.y + imgHeight + 12);
      
      // 添加文字
      doc.setFontSize(7); // 四格布局使用小字体
      const textWidth = cellWidth - 10;
      const splitText = doc.splitTextToSize(record.note, textWidth);
      // 限制文本行数，最多显示8行
      const limitedText = splitText.slice(0, 8);
      doc.text(limitedText, pos.x + 5, pos.y + imgHeight + 18);
      
      // 如果文本被截断，添加省略号
      if (splitText.length > 8) {
        doc.text('...', pos.x + 5, pos.y + imgHeight + 18 + 8 * 7);
      }
    }
    
  } catch (err) {
    console.error(`渲染四记录布局失败: ${err}`);
    // 渲染失败，显示错误信息
    doc.text("无法加载图片", 105, 140, { align: 'center' });
    doc.text("请尝试重新生成PDF", 105, 160, { align: 'center' });
  }
}

/**
 * 渲染记录组到PDF页面的安全包装函数
 * 添加详细错误处理和诊断信息
 */
export async function renderRecordGroupToPageSafe(
  doc: jsPDF,
  group: RecordGroup,
  pageNumber: number,
  resources?: any
): Promise<void> {
  try {
    console.log(`开始渲染记录组 #${pageNumber}，布局类型: ${group.layoutType}，包含 ${group.records.length} 条记录`);
    
    // 检查resources对象
    if (!resources) {
      console.warn(`渲染页面 #${pageNumber} 时没有提供resources对象，使用默认处理`);
    } else {
      console.log(`资源检查 - 页面 #${pageNumber}:`, {
        '背景可用': !!resources.backgrounds?.paper,
        '装饰可用': !!resources.decorations?.tape,
        '图标可用': !!resources.icons?.beetle
      });
    }
    
    // 检查记录是否有必要的数据
    for (let i = 0; i < group.records.length; i++) {
      const record = group.records[i];
      if (!record.photoURL) {
        console.warn(`记录组 #${pageNumber} 中的记录 #${i} 没有照片URL`);
      }
      if (!record.note) {
        console.warn(`记录组 #${pageNumber} 中的记录 #${i} 没有笔记内容`);
      }
    }
    
    // 调用原始函数
    await renderRecordGroupToPage(doc, group, pageNumber, resources);
    
    console.log(`记录组 #${pageNumber} 渲染完成`);
  } catch (error) {
    console.error(`渲染记录组 #${pageNumber} 时发生错误:`, error);
    
    // 尝试添加错误信息页
    try {
      doc.setFontSize(14);
      doc.setTextColor(255, 0, 0);
      doc.text(`错误: 无法渲染页面 #${pageNumber}`, 20, 50);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`布局类型: ${group.layoutType}`, 20, 70);
      doc.text(`记录数量: ${group.records.length}`, 20, 80);
      doc.text(`日期组: ${group.dateKey || '无'}`, 20, 90);
      
      // 记录错误信息
      if (error instanceof Error) {
        doc.text(`错误信息: ${error.message}`, 20, 110);
      } else {
        doc.text(`未知错误类型`, 20, 110);
      }
    } catch (e) {
      console.error('无法添加错误信息页:', e);
    }
    
    // 重新抛出错误让上层处理
    throw error;
  }
} 