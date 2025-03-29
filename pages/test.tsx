import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function TestPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查整个logs集合
  const checkFirestore = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 开始检查Firestore...");
      
      // 获取logs集合中的所有文档
      const logsRef = collection(db, "logs");
      const q = query(logsRef, orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      
      console.log(`读取到 ${snapshot.docs.length} 条记录`);
      
      if (snapshot.empty) {
        setError("没有找到任何记录，logs集合可能为空");
        setLogs([]);
      } else {
        const logsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`文档 ${doc.id}:`, data);
          return {
            id: doc.id,
            ...data,
            // 转换时间戳为可读格式
            createdAt: data.createdAt ? 
              new Date(data.createdAt.seconds * 1000).toLocaleString() : 
              '未知时间'
          };
        });
        
        setLogs(logsData);
      }
    } catch (err: any) {
      console.error("Firestore读取错误:", err);
      setError(`读取Firestore失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirestore();
  }, []);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <h1 style={{ marginBottom: '20px' }}>Firestore 数据检查</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ marginRight: '15px' }}>首页</Link>
        <Link href="/upload" style={{ marginRight: '15px' }}>上传页</Link>
        <Link href="/timeline" style={{ marginRight: '15px' }}>时间线</Link>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={checkFirestore} 
          style={{
            padding: '8px 15px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          刷新数据
        </button>
      </div>
      
      {loading && <p>加载中...</p>}
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <h2>logs 集合中的记录：</h2>
      
      {logs.length === 0 && !loading ? (
        <p>没有找到任何记录</p>
      ) : (
        <div>
          {logs.map(log => (
            <div key={log.id} style={{ 
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <p><strong>文档ID:</strong> {log.id}</p>
              <p><strong>创建时间:</strong> {log.createdAt}</p>
              <p><strong>笔记:</strong> {log.note}</p>
              
              {log.photo ? (
                <div>
                  <p><strong>photo字段存在 ✅</strong></p>
                  <img 
                    src={log.photo} 
                    alt="照片" 
                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} 
                  />
                </div>
              ) : log.photoURL ? (
                <div>
                  <p><strong>使用的是photoURL字段，不是photo ❌</strong></p>
                  <img 
                    src={log.photoURL} 
                    alt="照片" 
                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} 
                  />
                </div>
              ) : (
                <p style={{ color: 'red' }}>没有找到photo或photoURL字段</p>
              )}
              
              <div style={{ marginTop: '10px' }}>
                <strong>所有字段:</strong>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 