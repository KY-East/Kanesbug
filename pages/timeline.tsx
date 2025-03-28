import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

interface LogEntry {
  id: string;
  photoURL: string;
  note: string;
  createdAt: { seconds: number };
}

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

export default function TimelinePage() {
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
              fontSize: '18px'
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
        ) : logs.length === 0 ? (
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
              position: 'absolute',
              bottom: '-30px',
              right: '-30px',
              width: '150px',
              height: '150px',
              opacity: '0.2',
              zIndex: '0'
            }}>
              <img
                src="/images/leaf-decoration.svg"
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            <div style={{ 
              fontSize: '60px', 
              marginBottom: '20px',
              position: 'relative',
              zIndex: '1'
            }}>
              🔍
            </div>
            <p style={{ 
              color: '#5c7c6e', 
              marginBottom: '25px',
              fontSize: '18px',
              position: 'relative',
              zIndex: '1'
            }}>
              还没有任何记录，快来记录独角仙的成长吧！
            </p>
            <div style={{ 
              marginTop: '30px',
              position: 'relative',
              zIndex: '1'
            }}>
              <Link href="/upload" style={{
                display: 'inline-block',
                backgroundColor: '#5d9178',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 0 #3d6051',
                transition: 'all 0.2s',
                fontSize: '16px'
              }}
              onMouseOver={(e) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 6px 0 #3d6051';
              }}
              onMouseOut={(e) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 4px 0 #3d6051';
              }}>
                去记录第一次观察
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', zIndex: '1' }}>
            {logs.map((log) => (
              <div 
                key={log.id}
                style={{ 
                  position: 'relative',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                  border: '2px solid #c8dcc0',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  zIndex: '1',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(-5px)';
                  target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)';
                }}
              >
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
                
                <div style={{position: 'relative', zIndex: '2'}}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '15px' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '10px',
                      paddingBottom: '12px',
                      borderBottom: '1px dashed #cee5d5'
                    }}>
                      <span style={{ 
                        fontSize: '20px', 
                        marginRight: '10px',
                        color: '#5d9178'
                      }}>
                        🗓️
                      </span>
                      <p style={{ 
                        color: '#5d9178', 
                        fontWeight: '500', 
                        margin: 0,
                        fontSize: '16px'
                      }}>
                        {formatDate(log.createdAt.seconds)}
                      </p>
                      <div style={{
                        marginLeft: 'auto',
                        backgroundColor: '#e8f1ea',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#5d9178'
                      }}>
                        第 {logs.length - logs.indexOf(log)} 次观察
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    <img
                      src={log.photoURL}
                      alt="独角仙照片"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      height: '50px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                      pointerEvents: 'none'
                    }}></div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f1f8e9',
                    padding: '16px',
                    borderRadius: '12px',
                    margin: '8px 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      backgroundColor: '#f5f3e8',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#5d9178',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      观察笔记
                    </div>
                    <p style={{ 
                      color: '#4a6359', 
                      whiteSpace: 'pre-line', 
                      lineHeight: '1.7',
                      margin: '10px 0 0 0',
                      fontStyle: 'italic'
                    }}>
                      {log.note}
                    </p>
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