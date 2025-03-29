import React, { useState } from 'react';
import { format } from 'date-fns';
import TimelineItem from './TimelineItem';

interface LogEntry {
  id: string;
  photo?: string;
  photoURL?: string;
  note: string;
  createdAt: { seconds: number };
  relativeDay?: number; // 相对于第一次记录的天数
  relativeWeek?: number; // 相对于第一次记录的周数
}

interface TimelineGroupProps {
  groupTitle: string;
  entries: LogEntry[];
  color: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  isFirst: boolean;
  onUpdate?: () => void; // 添加刷新回调
}

export default function TimelineGroup({ 
  groupTitle, 
  entries, 
  color,
  weekNumber,
  startDate,
  endDate,
  isFirst,
  onUpdate
}: TimelineGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 格式化时间范围
  const dateRangeText = `${format(startDate, 'MM月dd日')} ~ ${format(endDate, 'MM月dd日')}`;
  
  // 处理折叠/展开
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="timeline-group mb-10">
      {/* 周标题栏 */}
      <div 
        className="week-header cursor-pointer flex items-center p-3 rounded-lg mb-3 transition-all"
        style={{ 
          backgroundColor: `${color}20`, // 添加透明度
          borderLeft: `6px solid ${color}` 
        }}
        onClick={toggleExpand}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold" style={{ color }}>
            {groupTitle}
            {isFirst && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">最新</span>}
          </h3>
          <p className="text-sm text-gray-600">{dateRangeText}</p>
        </div>
        <div className="text-2xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          {isExpanded ? '🔽' : '▶️'}
        </div>
      </div>
      
      {/* 时间轴 */}
      {isExpanded && (
        <div className="timeline-content pl-6 relative">
          {/* 垂直时间轴线 */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full" 
            style={{ backgroundColor: color }}
          ></div>
          
          {/* 时间线内容 */}
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={entry.id} className="timeline-item relative">
                {/* 圆点标记 */}
                <div 
                  className="absolute left-0 w-4 h-4 rounded-full -ml-[9px] shadow-md border-2 border-white"
                  style={{ 
                    backgroundColor: color,
                    top: '24px'
                  }}
                ></div>
                
                {/* 计算相对天数 */}
                <div className="relative day-badge mb-2 ml-4">
                  <span 
                    className="text-sm font-medium px-3 py-1 rounded-full inline-block"
                    style={{ backgroundColor: `${color}30`, color: `${color}` }}
                  >
                    第 {entry.relativeDay || '?'} 天
                  </span>
                </div>
                
                {/* 记录内容 */}
                <div className="ml-4">
                  <TimelineItem 
                    entry={entry} 
                    observationIndex={entries.length - index} // 传递观察索引（倒序）
                    onUpdate={onUpdate} // 传递刷新回调
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 