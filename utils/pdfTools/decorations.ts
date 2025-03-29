/**
 * PDF装饰元素工具
 * 为科学手帐提供各种装饰效果
 */

import { jsPDF } from 'jspdf';

/**
 * 装饰类型
 */
export type DecorationType = 'tape' | 'paperclip' | 'sticker' | 'highlight' | 'shadow' | 'frame';

/**
 * 加载装饰所需资源
 * @returns 装饰资源对象
 */
export async function loadDecorationResources(): Promise<Record<string, HTMLImageElement | null>> {
  try {
    console.log("加载装饰元素资源...");
    
    // 添加错误处理和回退选项
    const loadWithFallback = async (path: string): Promise<HTMLImageElement | null> => {
      try {
        return await loadImage(path);
      } catch (err) {
        console.warn(`无法加载装饰元素 ${path}，使用空白替代`);
        return null;
      }
    };
    
    // 加载各种装饰元素
    const tapeImg = await loadWithFallback('/images/tape.png');
    const paperClipImg = await loadWithFallback('/images/paperclip.png');
    const stickerBug = await loadWithFallback('/images/sticker-bug.png');
    const stickerLeaf = await loadWithFallback('/images/sticker-leaf.png');
    
    console.log("装饰元素加载完成");
    
    return {
      tape: tapeImg,
      paperclip: paperClipImg,
      stickerBug: stickerBug,
      stickerLeaf: stickerLeaf
    };
  } catch (error) {
    console.error("加载装饰元素失败:", error);
    // 返回空对象，允许继续生成PDF但没有装饰
    return {
      tape: null,
      paperclip: null,
      stickerBug: null,
      stickerLeaf: null
    };
  }
}

/**
 * 加载图片
 * @param src 图片路径
 * @returns HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`加载图片: ${src}`);
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
}

/**
 * 在图片上添加胶带装饰
 * @param doc PDF文档对象
 * @param x 图片左上角x坐标
 * @param y 图片左上角y坐标
 * @param width 图片宽度
 * @param height 图片高度
 * @param tapeImg 胶带图片（如果没有则使用绘制的简单胶带）
 */
export function addTapeDecoration(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  tapeImg: HTMLImageElement | null = null
): void {
  try {
    if (tapeImg) {
      // 如果有胶带图片，使用图片
      // 左上角胶带
      doc.addImage(tapeImg, 'PNG', x - 5, y - 5, 20, 10);
      
      // 右上角胶带
      doc.addImage(tapeImg, 'PNG', x + width - 15, y - 5, 20, 10);
      
      // 随机添加第三条胶带，增加自然感
      if (Math.random() > 0.5) {
        const tapeX = x + width / 3 + (Math.random() * width / 3);
        doc.addImage(tapeImg, 'PNG', tapeX - 10, y - 5, 20, 10);
      }
    } else {
      // 没有胶带图片，绘制简单的胶带效果
      // 保存当前绘图状态
      doc.saveGraphicsState();
      
      // 设置半透明淡黄色
      doc.setFillColor(255, 255, 200, 0.5);
      doc.setDrawColor(230, 230, 180);
      
      // 左上角胶带
      doc.rect(x - 5, y - 3, 15, 8, 'F');
      doc.rect(x - 5, y - 3, 15, 8, 'S');
      
      // 右上角胶带
      doc.rect(x + width - 10, y - 3, 15, 8, 'F');
      doc.rect(x + width - 10, y - 3, 15, 8, 'S');
      
      // 恢复绘图状态
      doc.restoreGraphicsState();
    }
  } catch (err) {
    console.error("添加胶带装饰失败", err);
    // 出错时静默处理，不影响PDF生成
  }
}

/**
 * 在图片上添加回形针装饰
 * @param doc PDF文档
 * @param x 图片X坐标
 * @param y 图片Y坐标
 * @param paperClipImg 回形针图片资源
 */
export function addPaperClipDecoration(
  doc: jsPDF,
  x: number,
  y: number,
  paperClipImg: HTMLImageElement | null
): void {
  if (!paperClipImg) return;
  
  try {
    // 添加回形针到左上角
    doc.addImage(paperClipImg, 'PNG', x - 3, y - 3, 20, 20);
  } catch (err) {
    console.error("添加回形针装饰失败", err);
    // 出错时静默处理，不影响PDF生成
  }
}

/**
 * 添加阴影效果
 * @param doc PDF文档对象
 * @param x 图片左上角x坐标
 * @param y 图片左上角y坐标
 * @param width 图片宽度
 * @param height 图片高度
 * @param blur 阴影模糊度（1-5）
 */
export function addShadowEffect(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  blur: number = 3
): void {
  try {
    // jsPDF没有直接支持阴影，所以使用多层矩形模拟阴影效果
    // 保存当前绘图状态
    doc.saveGraphicsState();
    
    // 绘制多层半透明矩形
    for (let i = 1; i <= blur; i++) {
      const opacity = 0.1 - (i * 0.015); // 越远越透明
      const offset = i * 0.8; // 偏移量
      
      doc.setFillColor(0, 0, 0, opacity);
      doc.rect(x + offset, y + offset, width, height, 'F');
    }
    
    // 恢复绘图状态
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("添加阴影效果失败", err);
    // 出错时静默处理
  }
}

/**
 * 添加照片边框
 * @param doc PDF文档对象
 * @param x 图片左上角x坐标
 * @param y 图片左上角y坐标
 * @param width 图片宽度
 * @param height 图片高度
 * @param frameStyle 边框样式：'simple'简单线框，'double'双线框，'thick'粗线框
 */
export function addPhotoFrame(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  frameStyle: 'simple' | 'double' | 'thick' = 'simple'
): void {
  try {
    // 保存当前绘图状态
    doc.saveGraphicsState();
    
    switch (frameStyle) {
      case 'simple':
        // 简单线框
        doc.setDrawColor(100, 100, 100);
        doc.rect(x, y, width, height, 'S');
        break;
        
      case 'double':
        // 双线框
        doc.setDrawColor(100, 100, 100);
        doc.rect(x, y, width, height, 'S');
        doc.setDrawColor(150, 150, 150);
        doc.rect(x - 1, y - 1, width + 2, height + 2, 'S');
        break;
        
      case 'thick':
        // 粗线框
        doc.setLineWidth(1.5);
        doc.setDrawColor(80, 80, 80);
        doc.rect(x, y, width, height, 'S');
        doc.setLineWidth(0.1); // 恢复默认线宽
        break;
    }
    
    // 恢复绘图状态
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("添加照片边框失败", err);
  }
}

/**
 * 添加手写标记效果
 * @param doc PDF文档对象
 * @param text 标记文本
 * @param x X坐标
 * @param y Y坐标
 * @param color 颜色（红色、蓝色等）
 * @param rotation 旋转角度（-15到15）
 */
export function addHandwrittenMark(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  color: 'red' | 'blue' | 'green' | 'orange' = 'red',
  rotation: number = 0
): void {
  if (!text) return;
  
  try {
    // 保存当前绘图状态
    doc.saveGraphicsState();
    
    // 设置颜色
    switch (color) {
      case 'red':
        doc.setTextColor(200, 40, 40);
        break;
      case 'blue':
        doc.setTextColor(30, 60, 200);
        break;
      case 'green':
        doc.setTextColor(40, 160, 40);
        break;
      case 'orange':
        doc.setTextColor(240, 140, 0);
        break;
    }
    
    // 设置字体和大小
    // 注意：这里假设已经加载了手写风格的字体
    // 如果没有，则使用默认字体
    try {
      doc.setFont('Indie Flower'); // 或其他手写风格字体
    } catch {
      // 如果字体不可用，使用默认字体
    }
    
    doc.setFontSize(12);
    
    // 应用旋转
    // 确保旋转角度在合理范围内
    const finalRotation = Math.min(15, Math.max(-15, rotation || (Math.random() * 10 - 5)));
    
    // 在PDF中应用变换
    doc.text(text, x, y, {
      angle: finalRotation,
      renderingMode: 'fill'
    });
    
    // 恢复绘图状态
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("添加手写标记失败", err);
    // 失败时使用普通文本
    doc.text(text, x, y);
  }
}

/**
 * 添加页面背景纹理
 * @param doc PDF文档对象
 * @param backgroundImg 背景图片
 * @param type 背景类型
 */
export function addPageBackground(
  doc: jsPDF,
  backgroundImg: HTMLImageElement | null = null,
  type: 'paper' | 'grid' | 'lines' | 'dots' = 'paper'
): void {
  try {
    if (backgroundImg) {
      // 使用提供的背景图片
      doc.addImage(backgroundImg, 'PNG', 0, 0, 210, 297); // A4尺寸
    } else {
      // 没有背景图片，根据类型绘制简单背景
      // 保存当前绘图状态
      doc.saveGraphicsState();
      
      // 基础背景色（米黄色）
      doc.setFillColor(252, 248, 232);
      doc.rect(0, 0, 210, 297, 'F');
      
      switch (type) {
        case 'grid':
          // 绘制网格线
          doc.setDrawColor(200, 200, 200, 0.3);
          doc.setLineWidth(0.1);
          
          // 水平线
          for (let y = 10; y < 297; y += 10) {
            doc.line(5, y, 205, y);
          }
          
          // 垂直线
          for (let x = 10; x < 210; x += 10) {
            doc.line(x, 5, x, 292);
          }
          break;
          
        case 'lines':
          // 横线
          doc.setDrawColor(180, 180, 200, 0.4);
          doc.setLineWidth(0.2);
          
          for (let y = 15; y < 297; y += 8) {
            doc.line(10, y, 200, y);
          }
          break;
          
        case 'dots':
          // 点阵
          doc.setDrawColor(150, 150, 150, 0.3);
          doc.setFillColor(150, 150, 150, 0.3);
          
          for (let y = 10; y < 297; y += 5) {
            for (let x = 10; x < 210; x += 5) {
              doc.circle(x, y, 0.2, 'F');
            }
          }
          break;
      }
      
      // 恢复绘图状态
      doc.restoreGraphicsState();
    }
  } catch (err) {
    console.error("添加页面背景失败", err);
    // 错误时不添加背景，保持白色
  }
}

/**
 * 添加手绘箭头
 * @param doc PDF文档对象
 * @param fromX 起点X坐标
 * @param fromY 起点Y坐标
 * @param toX 终点X坐标
 * @param toY 终点Y坐标
 * @param color 箭头颜色
 */
export function addHandDrawnArrow(
  doc: jsPDF,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: 'red' | 'blue' | 'black' = 'red'
): void {
  try {
    // 保存当前绘图状态
    doc.saveGraphicsState();
    
    // 设置颜色
    switch (color) {
      case 'red':
        doc.setDrawColor(200, 40, 40);
        break;
      case 'blue':
        doc.setDrawColor(30, 60, 200);
        break;
      case 'black':
        doc.setDrawColor(30, 30, 30);
        break;
    }
    
    // 设置线宽
    doc.setLineWidth(0.7);
    
    // 计算方向
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // 轻微调整起点和终点，模拟手绘不精确效果
    const jitterAmount = 0.8;
    fromX += (Math.random() - 0.5) * jitterAmount;
    fromY += (Math.random() - 0.5) * jitterAmount;
    toX += (Math.random() - 0.5) * jitterAmount;
    toY += (Math.random() - 0.5) * jitterAmount;
    
    // 绘制主线（微微弯曲）
    const curvature = 0.2;
    const midX = (fromX + toX) / 2 + (Math.random() - 0.5) * 4 * curvature;
    const midY = (fromY + toY) / 2 + (Math.random() - 0.5) * 4 * curvature;
    
    // 使用多段线模拟曲线
    doc.line(fromX, fromY, midX, midY);
    doc.line(midX, midY, toX, toY);
    
    // 绘制箭头
    const headLen = 3;
    doc.line(toX, toY, toX - headLen * Math.cos(angle - Math.PI / 7), toY - headLen * Math.sin(angle - Math.PI / 7));
    doc.line(toX, toY, toX - headLen * Math.cos(angle + Math.PI / 7), toY - headLen * Math.sin(angle + Math.PI / 7));
    
    // 恢复绘图状态
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("添加手绘箭头失败", err);
  }
}

/**
 * 添加文本高亮效果
 * @param doc PDF文档对象
 * @param x 文本左上角X坐标
 * @param y 文本左上角Y坐标
 * @param width 文本宽度
 * @param height 文本高度
 * @param color 高亮颜色
 */
export function addTextHighlight(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color: 'yellow' | 'green' | 'pink' = 'yellow'
): void {
  try {
    // 保存当前绘图状态
    doc.saveGraphicsState();
    
    // 设置高亮颜色和透明度
    switch (color) {
      case 'yellow':
        doc.setFillColor(255, 255, 100, 0.3);
        break;
      case 'green':
        doc.setFillColor(150, 255, 150, 0.3);
        break;
      case 'pink':
        doc.setFillColor(255, 180, 180, 0.3);
        break;
    }
    
    // 绘制高亮矩形
    // 微微倾斜，模拟手工高亮
    const slope = (Math.random() - 0.5) * 0.05;
    
    // 绘制四边形而不是矩形，添加不规则性
    const points = [
      { x, y: y - height * 0.2 },
      { x: x + width, y: y - height * 0.2 + width * slope },
      { x: x + width, y: y + height * 0.8 + width * slope },
      { x, y: y + height * 0.8 }
    ];
    
    // jsPDF没有直接的多边形填充，所以使用两个三角形
    doc.triangle(
      points[0].x, points[0].y,
      points[1].x, points[1].y,
      points[3].x, points[3].y,
      'F'
    );
    
    doc.triangle(
      points[1].x, points[1].y,
      points[2].x, points[2].y,
      points[3].x, points[3].y,
      'F'
    );
    
    // 恢复绘图状态
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("添加文本高亮失败", err);
  }
}

/**
 * 为一整页添加所有需要的装饰元素
 * @param doc PDF文档对象
 * @param resources 资源对象，包含各种装饰图片
 * @param pageType 页面类型
 */
export function decoratePage(
  doc: jsPDF,
  resources: Record<string, any> | null = null,
  pageType: 'cover' | 'content' | 'stats' | 'back' = 'content'
): void {
  try {
    // 根据页面类型添加不同的装饰
    // 添加背景
    if (resources?.backgrounds?.paper) {
      addPageBackground(doc, resources.backgrounds.paper);
    } else {
      addPageBackground(doc, null, pageType === 'content' ? 'lines' : 'paper');
    }
    
    // 根据页面类型添加其他装饰
    switch (pageType) {
      case 'cover':
        // 封面装饰...
        break;
      case 'content':
        // 内容页面装饰...
        break;
      case 'stats':
        // 统计页面装饰...
        break;
      case 'back':
        // 封底装饰...
        break;
    }
  } catch (err) {
    console.error("页面装饰失败", err);
  }
}

/**
 * 添加科学笔记风格页眉
 * @param doc PDF文档
 * @param pageTitle 页面标题
 * @param pageNumber 页码
 */
export function addScientificHeader(
  doc: jsPDF,
  pageTitle: string,
  pageNumber: number
): void {
  try {
    // 设置字体
    doc.setFontSize(10);
    doc.setDrawColor(100, 100, 100);
    
    // 添加标题
    doc.text(pageTitle, 20, 15);
    
    // 添加页码
    doc.text(`Page ${pageNumber}`, 180, 15);
    
    // 添加分隔线
    doc.line(10, 18, 200, 18);
  } catch (err) {
    console.error("添加页眉失败", err);
  }
}

/**
 * 添加笔记本风格线条
 * @param doc PDF文档
 */
export function addNotebookLines(doc: jsPDF): void {
  try {
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.1);
    
    // 横线 - 从y=30开始，每8mm一条线
    for (let y = 30; y < 280; y += 8) {
      doc.line(10, y, 200, y);
    }
    
    // 左侧竖线（可选）
    doc.setDrawColor(220, 120, 120);
    doc.line(20, 30, 20, 280);
  } catch (err) {
    console.error("添加笔记本线条失败", err);
  }
} 