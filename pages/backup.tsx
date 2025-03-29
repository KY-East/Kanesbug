import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { LogEntry } from '../lib/timelineUtils';

export default function BackupPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log("开始获取记录用于备份...");
        
        const q = query(collection(db, "logs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log("没有找到任何记录可供备份");
          setLogs([]);
          setError("暂无记录可供备份");
          setLoading(false);
          return;
        }
        
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data } as LogEntry;
        });
        
        console.log(`获取到 ${results.length} 条记录`);
        setLogs(results);
      } catch (error) {
        console.error("获取记录失败：", error);
        setError("获取记录失败，请重试");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // 导出为JSON格式
  const exportToJSON = () => {
    try {
      // 准备导出数据，移除循环引用
      const exportData = logs.map(log => {
        const { id, photo, note, createdAt, hasStageTag, eventType, eventIcon } = log;
        const timestamp = createdAt ? new Date(createdAt.seconds * 1000) : new Date();
        
        return {
          id,
          photo,
          note,
          createdAt: timestamp.toISOString(),
          hasStageTag,
          eventType,
          eventIcon,
          date: timestamp.toLocaleString('zh-CN')
        };
      });
      
      // 创建用于下载的Blob
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = url;
      a.download = `kane-beetle-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setBackupStatus('成功导出JSON格式备份文件');
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('导出JSON失败：', error);
      setError('导出失败，请重试');
    }
  };

  // 导出为CSV格式
  const exportToCSV = () => {
    try {
      // CSV标题行
      const headers = ['ID', '日期', '笔记内容', '照片链接', '标记', '事件类型'];
      
      // 数据行
      const rows = logs.map(log => {
        const date = log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString('zh-CN') : '';
        
        // 确保CSV字段中的逗号被正确处理
        const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;
        
        return [
          log.id,
          date,
          escapeCsvField(log.note || ''),
          log.photo || '',
          log.hasStageTag ? '是' : '否',
          log.eventType || ''
        ].join(',');
      });
      
      // 组合CSV内容
      const csv = [headers.join(','), ...rows].join('\n');
      
      // 创建用于下载的Blob
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = url;
      a.download = `kane-beetle-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setBackupStatus('成功导出CSV格式备份文件');
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('导出CSV失败：', error);
      setError('导出失败，请重试');
    }
  };

  // 处理导出操作
  const handleExport = () => {
    if (exportFormat === 'json') {
      exportToJSON();
    } else {
      exportToCSV();
    }
  };

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
            padding: '6px 12px'
          }}>
            成长时间线
          </Link>
          <Link href="/backup" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 200, 161, 0.5)'
          }}>
            备份导出
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
            💾
          </span>
          数据备份与导出
        </h2>
        
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
              fontSize: '50px', 
              marginBottom: '20px',
              color: '#5c7c6e',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}>
              💾
            </div>
            <p style={{ 
              color: '#5c7c6e',
              fontSize: '18px',
              position: 'relative',
              zIndex: '1'
            }}>
              正在统计Kane的观察记录...
            </p>
            <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ 
            backgroundColor: 'rgba(255, 218, 214, 0.7)',
            color: '#9a3d36',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #ff9e93',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            <span style={{ marginRight: '8px', fontSize: '24px' }}>⚠️</span>
            {error}
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
              <div style={{ 
                marginBottom: '24px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>📊</span>
                  备份统计
                </h3>
                
                <div style={{ fontSize: '16px', color: '#4a6359' }}>
                  <p>共有记录：<span style={{ fontWeight: 'bold' }}>{logs.length}条</span></p>
                  <p>最早记录：<span style={{ fontWeight: 'bold' }}>
                    {logs.length > 0 ? new Date(Math.min(...logs.map(log => log.createdAt.seconds * 1000))).toLocaleString('zh-CN') : '无'}
                  </span></p>
                  <p>最新记录：<span style={{ fontWeight: 'bold' }}>
                    {logs.length > 0 ? new Date(Math.max(...logs.map(log => log.createdAt.seconds * 1000))).toLocaleString('zh-CN') : '无'}
                  </span></p>
                </div>
              </div>
              
              <div style={{ 
                marginBottom: '24px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>💾</span>
                  导出记录
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ marginBottom: '8px', color: '#4a6359' }}>选择导出格式：</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="exportFormat" 
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={() => setExportFormat('json')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>JSON (完整数据)</span>
                    </label>
                    
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="exportFormat" 
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={() => setExportFormat('csv')}
                        style={{ marginRight: '6px' }}
                      />
                      <span>CSV (电子表格)</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleExport}
                  disabled={logs.length === 0}
                  style={{
                    backgroundColor: '#5d9178',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: logs.length === 0 ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>💾</span>
                  导出 Kane 的记录
                </button>
                
                {backupStatus && (
                  <div style={{
                    backgroundColor: 'rgba(218, 248, 214, 0.7)',
                    color: '#2a6b36',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '15px'
                  }}>
                    <span style={{ marginRight: '8px' }}>✅</span>
                    {backupStatus}
                  </div>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2eee5'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#416153',
                  marginBottom: '16px'
                }}>
                  <span style={{ marginRight: '8px' }}>💡</span>
                  备份提示
                </h3>
                
                <ul style={{ 
                  color: '#4a6359',
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  <li style={{ marginBottom: '8px' }}>定期备份可以防止意外数据丢失</li>
                  <li style={{ marginBottom: '8px' }}>JSON格式保留所有数据，适合完整备份</li>
                  <li style={{ marginBottom: '8px' }}>CSV格式可以在Excel等表格软件中查看</li>
                  <li style={{ marginBottom: '8px' }}>建议将备份文件保存在安全的地方</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 