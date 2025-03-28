import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 有趣的独角仙知识
const funFacts = [
  "独角仙是世界上最大的甲虫之一，成虫可以长到5-7厘米！",
  "独角仙的幼虫阶段可以持续1-3年，而成虫通常只能存活几个月。",
  "雄性独角仙会使用它们的大角来争夺领地和吸引雌性。",
  "独角仙的幼虫主要以腐烂的木材为食，帮助分解森林中的倒木。",
  "独角仙可以发出嘶嘶声来吓跑天敌。",
  "在日本，独角仙是非常受欢迎的宠物昆虫。",
  "独角仙有强大的飞行能力，晚上会被灯光吸引。",
  "独角仙的幼虫是森林生态系统中的重要分解者。",
  "独角仙的角并不用于进食，主要用于竞争和防御。",
  "一些独角仙品种可以举起自身体重的850倍，相当于人类举起多辆汽车！"
];

// 饲养指南
const careGuidelines = [
  {
    title: "居住环境",
    content: "提供宽敞的玻璃或塑料容器，底部铺设约10厘米深的腐殖质土壤或木屑。添加一些小树枝和树叶，模拟自然环境。"
  },
  {
    title: "饮食",
    content: "成虫喜欢吃成熟的水果，如香蕉、梨子和苹果。也可提供特制的甲虫果冻。幼虫则需要腐烂的木材作为食物。"
  },
  {
    title: "温度与湿度",
    content: "保持环境温度在22-28°C之间，湿度在60-70%。每天喷水保持土壤微湿但不过湿。"
  },
  {
    title: "日常护理",
    content: "定期清理粪便和剩余食物，每周检查一次容器内的湿度和食物供应。避免阳光直射，提供弱光环境。"
  }
];

export default function BasicHomePage() {
  // 随机选择一个有趣的事实
  const [randomFact, setRandomFact] = useState<string>("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setRandomFact(funFacts[randomIndex]);
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
          <Link href="/upload-basic" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            上传记录
          </Link>
          <Link href="/timeline-basic" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            成长时间线
          </Link>
        </nav>
      </header>

      <main>
        <section style={{
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '4px solid #3b82f6'
          }}>
            <img
              src="/beetle.jpg"
              alt="Kane的独角仙"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/200?text=独角仙';
              }}
            />
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            欢迎来到 Kane 的独角仙世界！
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#4b5563',
            marginBottom: '24px',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            在这里，我们将记录 Kane 的独角仙从幼虫到成虫的整个成长过程。
            快来一起探索这个奇妙的昆虫世界吧！
          </p>
        </section>

        <section style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '2px solid #bfdbfe'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>💡</span>
            你知道吗？
          </h3>
          <p style={{
            fontSize: '18px',
            color: '#1e3a8a',
            fontStyle: 'italic',
            lineHeight: '1.6'
          }}>
            {randomFact}
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>📋</span>
            独角仙饲养指南
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {careGuidelines.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '8px'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: '16px',
                  color: '#4b5563',
                  lineHeight: '1.5'
                }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '40px',
          marginBottom: '20px'
        }}>
          <Link href="/upload-basic" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.5)',
              transition: 'all 0.2s ease'
            }}
          >
            📸 开始记录独角仙的成长
          </Link>
        </div>
      </main>

      <footer style={{
        marginTop: '60px',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280'
      }}>
        <p>© 2023 Kane的独角仙日记 | 由爱与科学驱动</p>
      </footer>
    </div>
  );
} 