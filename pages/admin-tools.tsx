import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LogEntry {
  id: string;
  photo?: string;
  photoURL?: string;
  note: string;
  createdAt: { seconds: number };
}

export default function AdminToolsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isFixing, setIsFixing] = useState(false);

  // 加载数据
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "logs"));
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LogEntry[];
        
        setLogs(results);
        
        // 分析问题
        const withPhotoURL = results.filter(log => log.photoURL && !log.photo).length;
        const withPhoto = results.filter(log => log.photo).length;
        const withBoth = results.filter(log => log.photo && log.photoURL).length;
        const withNone = results.filter(log => !log.photo && !log.photoURL).length;
        
        setMessage(`总记录数: ${results.length} | 仅有photoURL: ${withPhotoURL} | 仅有photo: ${withPhoto} | 两者都有: ${withBoth} | 两者都没有: ${withNone}`);
      } catch (error) {
        console.error("获取记录失败:", error);
        setMessage(`获取记录失败: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // 修复photoURL到photo的函数
  const fixPhotoField = async () => {
    if (isFixing) return;
    
    setIsFixing(true);
    setMessage('正在修复...');
    
    try {
      // 找出所有有photoURL但没有photo的记录
      const needFix = logs.filter(log => log.photoURL && !log.photo);
      
      if (needFix.length === 0) {
        setMessage('没有需要修复的记录');
        setIsFixing(false);
        return;
      }
      
      // 逐个更新
      let fixed = 0;
      for (const log of needFix) {
        const docRef = doc(db, "logs", log.id);
        await updateDoc(docRef, {
          photo: log.photoURL
        });
        fixed++;
        setMessage(`正在修复... ${fixed}/${needFix.length}`);
      }
      
      // 重新加载数据
      const snapshot = await getDocs(collection(db, "logs"));
      const updatedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LogEntry[];
      
      setLogs(updatedResults);
      setMessage(`修复完成！已修复 ${fixed} 条记录。`);
    } catch (error) {
      console.error("修复失败:", error);
      setMessage(`修复失败: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>数据库管理工具</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ marginBottom: '10px' }}>{message}</p>
        
        <button 
          onClick={fixPhotoField}
          disabled={isFixing || loading}
          style={{
            padding: '8px 16px',
            backgroundColor: isFixing ? '#ccc' : '#4a7c59',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFixing ? 'not-allowed' : 'pointer'
          }}
        >
          {isFixing ? '修复中...' : '修复photoURL字段问题'}
        </button>
      </div>
      
      <h2 style={{ marginBottom: '10px', marginTop: '30px' }}>数据库记录</h2>
      
      {loading ? (
        <p>加载中...</p>
      ) : logs.length === 0 ? (
        <p>没有记录</p>
      ) : (
        <div style={{ 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>ID</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>photo字段</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>photoURL字段</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>笔记</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', fontSize: '12px' }}>{log.id}</td>
                  <td style={{ padding: '8px', fontSize: '12px' }}>
                    {log.photo ? (
                      <span style={{ color: 'green' }}>✓ 有</span>
                    ) : (
                      <span style={{ color: 'red' }}>✗ 无</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', fontSize: '12px' }}>
                    {log.photoURL ? (
                      <span style={{ color: 'green' }}>✓ 有</span>
                    ) : (
                      <span style={{ color: 'red' }}>✗ 无</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', fontSize: '12px' }}>
                    {log.note ? log.note.substring(0, 30) + (log.note.length > 30 ? '...' : '') : '无'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 