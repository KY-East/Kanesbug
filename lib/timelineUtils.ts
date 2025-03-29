import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

// 定义日志条目接口
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

// 定义分组后的日志结构
export interface WeekGroup {
  id: number; // 周编号
  title: string; // 显示标题，如"第1周"
  entries: LogEntry[]; // 该周的记录
  color: string; // 时间轴颜色
  startDate: Date; // 周开始日期
  endDate: Date; // 周结束日期
  isFirst: boolean; // 是否为第一周（最新）
}

// 周颜色列表
const WEEK_COLORS = [
  '#4CAF50', // 绿色
  '#2196F3', // 蓝色
  '#FF9800', // 橙色
  '#9C27B0', // 紫色
  '#F44336', // 红色
  '#00BCD4', // 青色
  '#FFEB3B', // 黄色
  '#795548'  // 棕色
];

/**
 * 计算相对时间（相对于第一条记录）
 * @param currentDate 当前记录的日期
 * @param firstRecordDate 第一条记录的日期
 * @returns 包含相对天数和周数的对象
 */
export function calculateRelativeTime(currentDate: Date, firstRecordDate: Date) {
  const diffTime = Math.abs(currentDate.getTime() - firstRecordDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  
  return {
    day: diffDays + 1,  // 从第1天开始计数
    week: diffWeeks + 1 // 从第1周开始计数
  };
}

/**
 * 按周分组日志
 * @param logs 日志条目列表（已按时间排序）
 * @returns 按周分组后的日志
 */
export function groupLogsByWeek(logs: LogEntry[]): WeekGroup[] {
  if (!logs || logs.length === 0) {
    return [];
  }

  // 假设记录已经按时间倒序排列（最新的在前面）
  // 找到最早的记录时间作为参考点
  const allDates = logs.map(log => new Date(log.createdAt.seconds * 1000));
  // 防止排序错误，确保找到最早的记录
  const firstRecordDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  
  // 计算每条记录的相对天数和周数
  const logsWithRelativeDates = logs.map(log => {
    const logDate = new Date(log.createdAt.seconds * 1000);
    const { day, week } = calculateRelativeTime(logDate, firstRecordDate);
    
    return {
      ...log,
      relativeDay: day,
      relativeWeek: week
    };
  });
  
  // 按周分组
  const weekGroups: Record<number, LogEntry[]> = {};
  logsWithRelativeDates.forEach(log => {
    const week = log.relativeWeek || 1;
    if (!weekGroups[week]) {
      weekGroups[week] = [];
    }
    weekGroups[week].push(log);
  });
  
  // 转换为数组格式，方便在界面渲染
  const result: WeekGroup[] = Object.keys(weekGroups)
    .map(weekKey => {
      const weekNumber = parseInt(weekKey);
      const entries = weekGroups[weekNumber];
      
      // 找出该周的第一天（相对天数最小的）和最后一天
      const weekDates = entries.map(entry => new Date(entry.createdAt.seconds * 1000));
      const weekStartDate = startOfWeek(new Date(Math.min(...weekDates.map(d => d.getTime()))));
      const weekEndDate = endOfWeek(new Date(Math.max(...weekDates.map(d => d.getTime()))));
      
      // 为每周分配一个颜色
      const colorIndex = (weekNumber - 1) % WEEK_COLORS.length;
      
      return {
        id: weekNumber,
        title: `第${weekNumber}周`,
        entries: entries.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds), // 确保按时间倒序
        color: WEEK_COLORS[colorIndex],
        startDate: weekStartDate,
        endDate: weekEndDate,
        isFirst: weekNumber === Math.max(...Object.keys(weekGroups).map(Number))
      };
    })
    .sort((a, b) => b.id - a.id); // 按周数倒序排列，最新的周在最前面
  
  return result;
}

/**
 * 检测日志中是否包含特殊事件
 * @param note 日志备注文本
 * @returns 事件类型和图标
 */
export function detectSpecialEvents(note: string) {
  const events = [
    { type: 'molting', keyword: ['蜕皮', '脱皮'], icon: '🐛' },
    { type: 'feeding', keyword: ['进食', '吃'], icon: '🍽️' },
    { type: 'cocoon', keyword: ['结茧', '茧', '化蛹'], icon: '🧵' },
    { type: 'hatching', keyword: ['羽化', '成虫'], icon: '🦋' },
    { type: 'measuring', keyword: ['测量', '长度', '重量', '厘米', 'cm', '克', 'g'], icon: '📏' }
  ];
  
  for (const event of events) {
    if (event.keyword.some(keyword => note.includes(keyword))) {
      return event;
    }
  }
  
  return { type: 'activity', icon: '🦗' }; // 默认为普通活动
}

/**
 * 为日期生成友好的显示格式
 * @param date 日期对象
 * @returns 格式化的日期字符串
 */
export function formatDateDisplay(date: Date): string {
  return format(date, 'yyyy年MM月dd日 HH:mm');
}

/**
 * 按事件类型分组日志
 * @param logs 日志条目数组
 * @returns 按事件类型分组的对象
 */
export function groupLogsByEventType(logs: LogEntry[]): Record<string, LogEntry[]> {
  if (!logs || logs.length === 0) {
    return {};
  }
  
  const result: Record<string, LogEntry[]> = {};
  
  // 处理每条日志
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
  
  // 对每种类型的日志按时间倒序排序
  Object.keys(result).forEach(key => {
    result[key] = result[key].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  });
  
  return result;
}