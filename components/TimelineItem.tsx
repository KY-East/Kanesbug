import Image from 'next/image';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LogEntry {
  id: string;
  photo?: string;
  photoURL?: string;
  note: string;
  createdAt: { seconds: number };
  relativeDay?: number;
  eventType?: string; // 事件类型
  eventIcon?: string; // 事件图标
  hasStageTag?: boolean; // 是否已添加成长阶段标签
}

interface TimelineItemProps {
  entry: LogEntry;
  observationIndex?: number;
  onUpdate?: () => void;
  showArchiveButton?: boolean;
}

// 定义图片比例类型
type AspectRatioType = 'landscape' | 'portrait' | 'square' | 'unknown';

export default function TimelineItem({ entry, observationIndex, onUpdate, showArchiveButton = false }: TimelineItemProps) {
  // 将 Firestore 时间戳转换为 JavaScript Date 对象
  const date = new Date(entry.createdAt.seconds * 1000);
  
  // 尝试处理URL
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('unknown');
  const imgRef = useRef<HTMLImageElement>(null);
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNote, setEditedNote] = useState<string>(entry.note);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<string>('');
  
  useEffect(() => {
    // 确定图片URL
    const rawUrl = entry.photo || entry.photoURL || '';
    console.log("原始照片URL:", rawUrl);
    
    if (rawUrl) {
      try {
        // 使用代理API处理图片URL
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
        console.log("代理后的URL:", proxyUrl);
        setImageUrl(proxyUrl);
      } catch (e) {
        console.error("URL处理错误:", e);
        setImageError(true);
      }
    } else {
      setImageError(true);
    }
    
    setIsLoading(false);
  }, [entry.photo, entry.photoURL]);
  
  // 图片加载错误处理
  const handleImageError = () => {
    console.error("图片加载失败:", imageUrl);
    setImageError(true);
  };
  
  // 图片加载完成后检测比例
  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const ratio = naturalWidth / naturalHeight;
      
      console.log(`图片加载成功: ${imageUrl}, 尺寸: ${naturalWidth}x${naturalHeight}, 比例: ${ratio}`);
      
      // 判断图片比例类型
      if (ratio > 1.2) {
        setAspectRatio('landscape'); // 横向图片
      } else if (ratio < 0.8) {
        setAspectRatio('portrait');  // 纵向图片
      } else {
        setAspectRatio('square');    // 接近正方形
      }
    }
  };
  
  // 根据图片比例返回不同的样式
  const getImageContainerStyle = () => {
    // 基础样式
    const baseStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative' as const,
    };
    
    // 根据比例添加额外样式
    switch (aspectRatio) {
      case 'landscape':
        return {
          ...baseStyle,
          // 横向图片，限制高度
          padding: '0.5rem 0',
        };
      case 'portrait':
        return {
          ...baseStyle,
          // 纵向图片，限制宽度
          padding: '0 0.5rem',
        };
      case 'square':
        return {
          ...baseStyle,
          // 正方形，保持正方形比例
          padding: '0.25rem',
        };
      default:
        return baseStyle;
    }
  };
  
  // 根据图片比例返回不同的图片样式
  const getImageStyle = () => {
    // 基础样式
    const baseStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain' as const,
      borderRadius: '0.5rem',
      transition: 'transform 0.3s',
    };
    
    // 根据比例添加额外样式
    switch (aspectRatio) {
      case 'landscape':
        return {
          ...baseStyle,
          width: '100%',
          height: 'auto',
        };
      case 'portrait':
        return {
          ...baseStyle,
          width: 'auto',
          height: '100%',
          maxWidth: '85%', // 避免纵向图片太宽
        };
      case 'square':
        return {
          ...baseStyle,
          width: '85%',
          height: '85%',
          objectFit: 'cover' as const,
        };
      default:
        return {
          ...baseStyle,
          maxWidth: '100%',
          maxHeight: '100%',
        };
    }
  };
  
  // 处理编辑笔记
  const handleEdit = () => {
    setIsEditing(true);
    setEditedNote(entry.note);
  };
  
  // 处理取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNote(entry.note);
  };
  
  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editedNote.trim()) return;
    
    setIsSaving(true);
    try {
      const entryRef = doc(db, 'logs', entry.id);
      await updateDoc(entryRef, {
        note: editedNote
      });
      
      // 更新成功
      if (onUpdate) onUpdate();
      setIsEditing(false);
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 处理删除确认
  const handleDeleteConfirm = () => {
    setIsDeleting(true);
  };
  
  // 处理取消删除
  const handleCancelDelete = () => {
    setIsDeleting(false);
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
  
  // 处理归档
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
      setIsArchiving(false);
    } catch (err) {
      console.error('归档失败:', err);
      alert('归档失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="kid-card hover:border-green-300 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : imageUrl && !imageError ? (
            <div style={getImageContainerStyle()}>
              <img
                ref={imgRef}
                src={imageUrl}
                alt="独角仙照片"
                style={getImageStyle()}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">无图片或加载失败</p>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">📅</span>
            <p className="text-blue-600 font-medium">
              {format(date, "yyyy年MM月dd日 HH:mm")}
            </p>
            {entry.eventIcon && (
              <span className="ml-2 text-xl" title={entry.eventType}>
                {entry.eventIcon}
              </span>
            )}
          </div>
          
          {/* 编辑模式下显示文本框 */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              
              <div className="flex mt-2 space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-3 rounded-lg my-2">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {entry.note}
              </p>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {!isEditing && !isDeleting && !isArchiving && (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span className="mr-1">✏️</span> 编辑
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="text-xs px-2 py-1 text-red-600 hover:text-red-800 flex items-center"
                  >
                    <span className="mr-1">🗑️</span> 删除
                  </button>
                  
                  {/* 归档按钮 - 只在日常记录中显示 */}
                  {showArchiveButton && !entry.hasStageTag && (
                    <button
                      onClick={() => setIsArchiving(true)}
                      className="text-xs px-2 py-1 text-green-600 hover:text-green-800 flex items-center"
                    >
                      <span className="mr-1">📋</span> 归档
                    </button>
                  )}
                </>
              )}
              
              {/* 归档确认 */}
              {isArchiving && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-green-600 font-medium">选择阶段:</span>
                  {['#幼虫阶段', '#蛹阶段', '#成虫阶段'].map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleArchive(stage)}
                      className={`px-2 py-1 rounded ${
                        selectedStage === stage 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      onMouseEnter={() => setSelectedStage(stage)}
                    >
                      {stage === '#幼虫阶段' ? '幼虫' : 
                       stage === '#蛹阶段' ? '蛹' : '成虫'}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsArchiving(false)}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              )}
              
              {/* 删除确认 */}
              {isDeleting && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-600 font-medium">确定删除吗?</span>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    确定
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
            
            <span className="text-xs text-gray-500 italic">
              Kane的第 {observationIndex || entry.relativeDay || Math.floor(Math.random() * 100) + 1} 次观察
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 