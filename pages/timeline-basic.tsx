import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from 'next/link';

// 简单的格式化日期函数
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

interface LogEntry {
  id: string;
  photoURL: string;
  note: string;
  createdAt: { seconds: number };
}

export default function TimelineBasicPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "beetle_logs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LogEntry));
        setLogs(results);
      } catch (error) {
        console.error("获取记录失败：", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          🪲 独角仙成长日志
        </h1>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            首页
          </Link>
          <Link href="/upload" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            上传记录
          </Link>
          <Link href="/timeline-basic" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            成长时间线
          </Link>
        </nav>
      </header>

      <main>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          textAlign: 'center',
          color: '#3b82f6'
        }}>
          🕰️ 成长时间线
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#6b7280' }}>加载中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280' }}>暂无记录，请先上传一条吧！</p>
            <div style={{ marginTop: '20px' }}>
              <Link href="/upload" style={{
                display: 'inline-block',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                去上传记录
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {logs.map((log) => (
              <div 
                key={log.id}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #dbeafe',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  <div style={{ 
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                  }}>
                    <img
                      src={log.photoURL}
                      alt="独角仙照片"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #bfdbfe'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '8px' 
                    }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>📅</span>
                      <p style={{ 
                        color: '#3b82f6', 
                        fontWeight: '500', 
                        margin: 0 
                      }}>
                        {formatDate(log.createdAt.seconds)}
                      </p>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: '#f0f9ff',
                      padding: '12px',
                      borderRadius: '8px',
                      margin: '8px 0'
                    }}>
                      <p style={{ 
                        color: '#374151', 
                        whiteSpace: 'pre-line', 
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {log.note}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end' 
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af', 
                        fontStyle: 'italic' 
                      }}>
                        Kane的第 {Math.floor(Math.random() * 100) + 1} 次观察
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 