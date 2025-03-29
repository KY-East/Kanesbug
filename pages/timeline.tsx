import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import TimelineGroup from '../components/TimelineGroup';
import { LogEntry, groupLogsByWeek, detectSpecialEvents, groupLogsByEventType } from '../lib/timelineUtils';
import TimelineItem from '../components/TimelineItem';

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 阶段统计信息类型
interface StageStats {
  count: number;
  firstDate?: Date;
  lastDate?: Date;
}

export default function TimelinePage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'growth' | 'daily'>('all');

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log("⭐️ 开始检索记录...")
        
        // 确认使用的集合名
        const collectionName = "logs";
        console.log(`使用集合名: '${collectionName}'`);
        
        // 检查条件
        console.log("使用的排序字段: 'createdAt'");
        
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        console.log("查询对象创建成功");
        
        const snapshot = await getDocs(q);
        console.log(`查询结果: 找到 ${snapshot.docs.length} 条记录`);
        
        if (snapshot.empty) {
          console.log("❌ 没有找到任何记录！请检查以下可能的原因:");
          console.log("1. Firestore集合'logs'是否为空");
          console.log("2. 上传时是否成功写入了数据");
          console.log("3. 上传的字段名和时间线读取的字段名是否一致");
          setLogs([]);
          return;
        }
        
        // 检查每条数据的字段
        const results = snapshot.docs.map((doc) => {
          const id = doc.id;
          const data = doc.data();
          
          // 输出完整的文档数据，不截断
          console.log(`文档 ${id} 的完整数据:`, JSON.stringify(data, null, 2));
          
          // 特别检查字段名
          if (data.photo) {
            console.log(`✅ 文档 ${id} 有'photo'字段: ${data.photo}`);
            // 验证URL是否有效
            try {
              new URL(data.photo);
              console.log(`✅ URL格式正确: ${data.photo}`);
            } catch (e) {
              console.error(`❌ URL格式错误: ${data.photo}`);
            }
          } else if (data.photoURL) {
            console.log(`❗ 文档 ${id} 使用了'photoURL'字段而不是'photo': ${data.photoURL}`);
            // 临时转换字段以显示图片
            data.photo = data.photoURL;
          } else {
            console.error(`❌ 文档 ${id} 既没有'photo'也没有'photoURL'字段`);
          }
          
          // 检测特殊事件标记
          try {
            const { type, icon } = detectSpecialEvents(data.note || '');
            data.eventType = type;
            data.eventIcon = icon;
            console.log(`事件检测: "${data.note.substring(0, 20)}..." => ${type} (${icon})`);
          } catch (e) {
            console.error('事件检测失败:', e);
          }
          
          // 检查是否有阶段标签
          const note = data.note || '';
          data.hasStageTag = note.startsWith('#幼虫阶段') || note.startsWith('#蛹阶段') || note.startsWith('#成虫阶段');
          
          return { id, ...data } as LogEntry;
        });
        
        console.log("最终处理的记录:", results);
        setLogs(results);
        
        // 按周分组记录，同时筛选出有阶段标签的记录
        const grouped = groupLogsByWeek(results);
        console.log("按周分组结果:", grouped);
        setGroupedLogs(grouped);
      } catch (error) {
        console.error("获取记录失败：", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [refreshKey]);

  // 根据当前标签页筛选日志
  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') {
      return logs; // 显示所有记录
    } else if (activeTab === 'growth') {
      return logs.filter(log => log.hasStageTag);
    } else {
      return logs.filter(log => !log.hasStageTag);
    }
  }, [logs, activeTab]);

  // 筛选后的分组日志
  const filteredGroupedLogs = useMemo(() => {
    // 对"全部"和"成长阶段"的记录进行分组
    if (activeTab === 'all' || activeTab === 'growth') {
      // 如果是"全部"标签，使用所有记录；如果是"成长阶段"，使用已过滤的记录
      return activeTab === 'all' ? groupLogsByWeek(logs) : groupedLogs;
    } else {
      return [];
    }
  }, [groupedLogs, logs, activeTab]);

  // 日常记录按事件类型分组
  const dailyLogsByType = useMemo(() => {
    if (activeTab === 'daily') {
      return groupLogsByEventType(filteredLogs);
    }
    return {};
  }, [filteredLogs, activeTab]);

  // 计算阶段统计信息
  const stageStats = useMemo(() => {
    const stats: Record<string, StageStats> = {
      '幼虫阶段': { count: 0 },
      '蛹阶段': { count: 0 },
      '成虫阶段': { count: 0 }
    };
    
    logs.forEach(log => {
      // 检查笔记开头是否包含阶段标签
      const note = log.note || '';
      let stage = '';
      
      if (note.startsWith('#幼虫阶段')) {
        stage = '幼虫阶段';
      } else if (note.startsWith('#蛹阶段')) {
        stage = '蛹阶段';
      } else if (note.startsWith('#成虫阶段')) {
        stage = '成虫阶段';
      }
      
      if (stage) {
        const date = new Date(log.createdAt.seconds * 1000);
        stats[stage].count++;
        
        // 更新最早和最晚日期
        if (!stats[stage].firstDate || date < stats[stage].firstDate) {
          stats[stage].firstDate = date;
        }
        
        if (!stats[stage].lastDate || date > stats[stage].lastDate) {
          stats[stage].lastDate = date;
        }
      }
    });
    
    return stats;
  }, [logs]);
  
  // 计算每个阶段的持续天数
  const stageDurations = useMemo(() => {
    const result: Record<string, number> = {};
    
    Object.entries(stageStats).forEach(([stage, data]) => {
      if (data.firstDate && data.lastDate) {
        const diffTime = Math.abs(data.lastDate.getTime() - data.firstDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        result[stage] = diffDays + 1; // 包括首尾两天
      }
    });
    
    return result;
  }, [stageStats]);

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
          fontSize: '26px', 
          fontWeight: 'bold',
          color: '#4a7c59'
        }}>
          🪲 Kane的独角仙奇遇记
        </h1>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link href="/" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px'
          }}>
            首页
          </Link>
          <Link href="/upload" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px'
          }}>
            上传记录
          </Link>
          <Link href="/timeline" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 200, 161, 0.5)'
          }}>
            成长时间线
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
            🕰️
          </span>
          成长的足迹
        </h2>
        
        {/* 分类标签页 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          gap: '12px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              background: activeTab === 'all' ? '#5d9178' : '#e2eee5',
              color: activeTab === 'all' ? 'white' : '#3a6a4b',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: activeTab === 'all' ? '0 4px 12px rgba(93, 145, 120, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ marginRight: '8px' }}>📋</span>
            全部记录
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              background: activeTab === 'growth' ? '#5d9178' : '#e2eee5',
              color: activeTab === 'growth' ? 'white' : '#3a6a4b',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: activeTab === 'growth' ? '0 4px 12px rgba(93, 145, 120, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ marginRight: '8px' }}>🌱</span>
            成长阶段
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              background: activeTab === 'daily' ? '#5d9178' : '#e2eee5',
              color: activeTab === 'daily' ? 'white' : '#3a6a4b',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: activeTab === 'daily' ? '0 4px 12px rgba(93, 145, 120, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ marginRight: '8px' }}>📝</span>
            日常记录
          </button>
        </div>
        
        {/* 阶段统计信息 - 仅在"成长阶段"选项卡中显示 */}
        {activeTab === 'growth' && !loading && filteredLogs.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {Object.entries(stageStats).map(([stage, stats]) => (
              <div key={stage} style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '10px',
                padding: '10px 16px',
                minWidth: '120px',
                textAlign: 'center',
                border: '1px solid #e2eee5',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  fontSize: '20px',
                  marginBottom: '4px' 
                }}>
                  {stage === '幼虫阶段' ? '🐛' : stage === '蛹阶段' ? '🧵' : '🦋'}
                </div>
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#416153'
                }}>
                  {stage}
                </div>
                <div style={{ 
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#5c7c6e'
                }}>
                  {stats.count > 0 ? (
                    <>
                      <div>{stats.count}条记录</div>
                      {stage in stageDurations ? <div>记录{stageDurations[stage]}天</div> : null}
                    </>
                  ) : (
                    <div>暂无记录</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
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
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              opacity: '0.4',
              zIndex: '0',
              backgroundImage: 'url("/images/ghibli-bg-pattern.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div style={{ 
              fontSize: '50px', 
              marginBottom: '20px',
              color: '#5c7c6e',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}>
              🌱
            </div>
            <p style={{ 
              color: '#5c7c6e',
              fontSize: '18px',
              position: 'relative',
              zIndex: '1'
            }}>
              正在寻找Kane的观察记录...
            </p>
            <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        ) : filteredLogs.length === 0 ? (
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
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              opacity: '0.4',
              zIndex: '0',
              backgroundImage: 'url("/images/ghibli-bg-pattern.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div style={{ 
              fontSize: '50px', 
              marginBottom: '20px',
              color: '#5c7c6e',
            }}>
              {activeTab === 'all' ? '📋' : activeTab === 'growth' ? '🌱' : '📝'}
            </div>
            <p style={{ 
              color: '#5c7c6e',
              fontSize: '18px',
              position: 'relative',
              zIndex: '1'
            }}>
              {activeTab === 'all' 
                ? '还没有任何记录，开始记录Kane的观察发现吧！'
                : activeTab === 'growth' 
                  ? '还没有记录任何成长阶段，点击上方阶段标签添加吧！' 
                  : '还没有日常记录，记录下每一个观察发现吧！'}
            </p>
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
              opacity: '0.4',
              zIndex: '0',
              backgroundImage: 'url("/images/ghibli-bg-pattern.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            
            <div style={{ position: 'relative', zIndex: '1' }}>
              {activeTab === 'growth' ? (
                /* 成长阶段展示 - 使用TimelineGroup分组展示 */
                filteredGroupedLogs.length > 0 ? (
                  filteredGroupedLogs.map((group) => (
                    <TimelineGroup
                      key={group.id}
                      groupTitle={group.title}
                      entries={group.entries}
                      color={group.color}
                      weekNumber={group.id}
                      startDate={group.startDate}
                      endDate={group.endDate}
                      isFirst={group.isFirst}
                      onUpdate={refreshData}
                    />
                  ))
                ) : (
                  <div className="space-y-6">
                    {filteredLogs.map((log, index) => (
                      <TimelineItem 
                        key={log.id} 
                        entry={log} 
                        observationIndex={filteredLogs.length - index} 
                        onUpdate={refreshData}
                        showArchiveButton={true}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* 日常记录展示 - 按事件类型分组展示 */
                <div className="space-y-6">
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: '#416153',
                    borderBottom: '2px solid #e2eee5',
                    paddingBottom: '8px'
                  }}>
                    日常观察记录 ({filteredLogs.length})
                  </h3>
                  
                  {/* 按事件类型分组 */}
                  {Object.keys(dailyLogsByType).length > 0 ? (
                    Object.entries(dailyLogsByType).map(([type, logs]) => (
                      <div key={type} style={{
                        marginBottom: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2eee5'
                      }}>
                        <h4 style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#416153',
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            marginRight: '8px',
                            fontSize: '20px'
                          }}>
                            {type === 'feeding' ? '🍽️ 进食' :
                            type === 'molting' ? '🐛 蜕皮' :
                            type === 'cocoon' ? '🧵 结茧' :
                            type === 'hatching' ? '🦋 羽化' :
                            type === 'measuring' ? '📏 测量' :
                            '🦗 活动'}
                          </span>
                          <span className="ml-auto text-sm text-gray-500">
                            {logs.length}条记录
                          </span>
                        </h4>
                        
                        <div className="space-y-4">
                          {logs.map((log, index) => (
                            <TimelineItem 
                              key={log.id} 
                              entry={log} 
                              observationIndex={filteredLogs.length - filteredLogs.findIndex(l => l.id === log.id)} 
                              onUpdate={refreshData}
                              showArchiveButton={true}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-6">
                      {filteredLogs.map((log, index) => (
                        <TimelineItem 
                          key={log.id} 
                          entry={log} 
                          observationIndex={filteredLogs.length - index} 
                          onUpdate={refreshData}
                          showArchiveButton={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 