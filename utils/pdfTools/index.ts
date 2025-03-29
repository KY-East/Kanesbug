/**
 * PDF工具函数索引文件
 * 集中导出所有PDF相关工具函数，便于导入使用
 */

// 智能排版系统
export * from './smartLayout';

// 多记录布局
export * from './multiRecordLayout';

// 装饰元素
export * from './decorations';

// 类型定义
export interface PDFResources {
  backgrounds?: {
    paper?: HTMLImageElement;
    grid?: HTMLImageElement;
    lines?: HTMLImageElement;
  };
  decorations?: {
    tape?: HTMLImageElement;
    paperclip?: HTMLImageElement;
    stickers?: HTMLImageElement[];
  };
  icons?: {
    beetle?: HTMLImageElement;
    leaf?: HTMLImageElement;
    measurement?: HTMLImageElement;
  };
  fonts?: {
    loaded: boolean;
    names: string[];
  };
}

/**
 * 加载PDF所需的资源
 * @returns Promise<PDFResources>
 */
export async function preloadPDFResources(): Promise<PDFResources> {
  const resources: PDFResources = {
    backgrounds: {},
    decorations: {},
    icons: {},
    fonts: {
      loaded: false,
      names: []
    }
  };
  
  // 加载背景资源
  try {
    const paperBg = new Image();
    paperBg.src = '/images/paper-texture.jpg';
    await new Promise<void>((resolve) => {
      paperBg.onload = () => resolve();
      paperBg.onerror = () => resolve(); // 即使失败也继续
    });
    resources.backgrounds!.paper = paperBg;
  } catch (err) {
    console.warn('加载纸张背景失败', err);
  }
  
  // 加载胶带资源
  try {
    const tape = new Image();
    tape.src = '/images/tape.png';
    await new Promise<void>((resolve) => {
      tape.onload = () => resolve();
      tape.onerror = () => resolve();
    });
    resources.decorations!.tape = tape;
  } catch (err) {
    console.warn('加载装饰资源失败', err);
  }
  
  // 加载图标资源
  try {
    const beetle = new Image();
    beetle.src = '/images/beetle-icon.png';
    await new Promise<void>((resolve) => {
      beetle.onload = () => resolve();
      beetle.onerror = () => resolve();
    });
    resources.icons!.beetle = beetle;
  } catch (err) {
    console.warn('加载图标资源失败', err);
  }
  
  return resources;
}

// 导出特定功能组
export const PdfTools = {
  // 布局工具
  Layout: {
    detectPhotoOrientation: require('./smartLayout').detectPhotoOrientation,
    determineLayout: require('./smartLayout').determineLayout,
    applyLayoutToPDF: require('./smartLayout').applyLayoutToPDF
  },
  
  // 多记录工具
  MultiRecord: {
    groupRecordsForLayout: require('./multiRecordLayout').groupRecordsForLayout,
    renderRecordGroupToPage: require('./multiRecordLayout').renderRecordGroupToPage
  },
  
  // 装饰工具
  Decorations: {
    loadDecorationResources: require('./decorations').loadDecorationResources,
    addTapeDecoration: require('./decorations').addTapeDecoration,
    addPaperClipDecoration: require('./decorations').addPaperClipDecoration,
    addShadowEffect: require('./decorations').addShadowEffect,
    addRandomPageDecorations: require('./decorations').addRandomPageDecorations,
    addScientificHeader: require('./decorations').addScientificHeader,
    addNotebookLines: require('./decorations').addNotebookLines
  }
}; 