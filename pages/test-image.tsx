import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

interface LogEntry {
  id: string;
  photo?: string;
  photoURL?: string;
  note: string;
  createdAt: { seconds: number };
}

export default function TestImagePage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [testUrl, setTestUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 尝试读取最新的一条记录
        const q = query(collection(db, "logs"), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log("没有找到记录");
          setLoading(false);
          return;
        }
        
        const results = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as LogEntry[];
        
        setLogs(results);
        
        // 如果有记录，设置测试URL
        if (results.length > 0) {
          const photoUrl = results[0].photo || results[0].photoURL || '';
          setTestUrl(photoUrl);
          
          // 设置代理URL
          if (photoUrl) {
            setProxyUrl(`/api/proxy-image?url=${encodeURIComponent(photoUrl)}`);
          }
          
          console.log("设置测试URL为:", photoUrl);
        }
      } catch (error) {
        console.error("获取记录失败:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>图片显示测试页面</h1>
      
      <Link href="/timeline" style={{ 
        display: 'inline-block',
        marginBottom: '20px',
        color: 'blue',
        textDecoration: 'underline'
      }}>
        返回时间线
      </Link>
      
      <div style={{ marginBottom: '30px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px' }}>
        <h2>代理API对比测试</h2>
        <p>这个页面展示了使用代理API与直接使用Firebase URL的区别</p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>方法1: 直接使用Firebase URL (原始方法)</h2>
        {loading ? (
          <p>加载中...</p>
        ) : logs.length === 0 ? (
          <p>没有记录</p>
        ) : (
          <div>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3>原始URL</h3>
                <p style={{ fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#eee', padding: '10px' }}>
                  {testUrl}
                </p>
              </div>
            </div>
            
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
              <p>使用img标签:</p>
              <img 
                src={testUrl} 
                alt="原始URL" 
                style={{ maxWidth: '100%', height: 'auto' }}
                onError={() => console.error("原始URL加载失败")}
              />
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>方法2: 通过代理API (推荐方法)</h2>
        {loading ? (
          <p>加载中...</p>
        ) : logs.length === 0 ? (
          <p>没有记录</p>
        ) : (
          <div>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3>代理URL</h3>
                <p style={{ fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#eee', padding: '10px' }}>
                  {proxyUrl}
                </p>
              </div>
            </div>
            
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
              <p>使用img标签 + 代理:</p>
              <img 
                src={proxyUrl} 
                alt="代理URL" 
                style={{ maxWidth: '100%', height: 'auto' }}
                onError={() => console.error("代理URL加载失败")}
              />
            </div>
            
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
              <p>使用Next.js Image (unoptimized) + 代理:</p>
              <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                <Image 
                  src={proxyUrl}
                  alt="代理URL with Next Image"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>方法3: Next.js Image直接使用Firebase URL + unoptimized</h2>
        {loading ? (
          <p>加载中...</p>
        ) : logs.length === 0 ? (
          <p>没有记录</p>
        ) : (
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
              <Image 
                src={testUrl}
                alt="Firebase URL with unoptimized"
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 