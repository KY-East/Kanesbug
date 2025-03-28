import React from 'react';
import Link from 'next/link';

export default function SimpleHomePage() {
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
          <Link href="/timeline" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            成长时间线
          </Link>
        </nav>
      </header>

      <main>
        <h2 style={{ fontSize: '28px', textAlign: 'center', color: '#3b82f6', marginBottom: '20px' }}>
          Kane的独角仙饲养日记
        </h2>

        <div style={{
          backgroundColor: '#eff6ff',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          border: '2px solid #bfdbfe'
        }}>
          <h3 style={{ fontSize: '20px', color: '#3b82f6', marginBottom: '12px' }}>
            📚 趣味知识
          </h3>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>
            独角仙是世界上最大的甲虫之一！
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '20px', color: '#3b82f6', marginBottom: '12px' }}>
            📝 独角仙饲养指南
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', color: '#047857', marginBottom: '8px' }}>
              1. 饲养环境 🏠
            </h4>
            <p>- 温度：保持在 20-25℃</p>
            <p>- 湿度：保持在 60-70%</p>
            <p>- 容器：透气、防逃脱的饲养盒</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', color: '#EA580C', marginBottom: '8px' }}>
              2. 饲养材料 🍎
            </h4>
            <p>- 腐叶：橡树、樱花等落叶</p>
            <p>- 木屑：白木屑或椰子壳</p>
            <p>- 果实：香蕉、苹果等（成虫）</p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '18px', color: '#9333EA', marginBottom: '8px' }}>
              3. 日常观察重点 👀
            </h4>
            <p>- 幼虫：食量、活动状态、蜕皮情况</p>
            <p>- 蛹期：颜色变化、保持安静环境</p>
            <p>- 成虫：进食情况、活动能力</p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/upload" style={{
            display: 'inline-block',
            backgroundColor: '#16A34A',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #166534'
          }}>
            📸 记录今天的观察
          </Link>
        </div>
      </main>
    </div>
  );
} 