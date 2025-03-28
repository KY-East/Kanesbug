import React from 'react';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [funFact, setFunFact] = useState("独角仙是世界上最大的甲虫之一！");
  
  // 趣味知识列表
  const funFacts = [
    "独角仙是世界上最大的甲虫之一！",
    "独角仙的寿命可以长达3-5年！",
    "独角仙的幼虫期是它生命中最长的阶段！",
    "独角仙的角只是用来打架，不会伤害人类！",
    "独角仙的幼虫喜欢吃腐烂的木头！",
    "独角仙成虫会吃水果和树液！",
    "独角仙的幼虫可以长到拇指那么大！",
    "日本小朋友非常喜欢养独角仙！",
    "独角仙是甲虫家族中体型最大的成员之一，有些品种可以长到17厘米长！",
    "雄性独角仙的大角是用来与其他雄性争夺领地和雌性的武器！",
    "独角仙的幼虫期可能长达1-3年，而成虫期通常只有几个月！",
    "独角仙幼虫可以长到12厘米长，体重可达100克以上！",
    "独角仙的角不是用来捕食，而是用于展示力量和吸引雌性！",
    "在亚洲许多国家，独角仙是非常受欢迎的宠物昆虫！",
    "独角仙科包含约1,500多种不同的甲虫！",
    "独角仙的翅膀非常强壮，可以支撑它们飞行很长距离！",
    "雌性独角仙通常没有角或只有很小的角！",
    "独角仙的幼虫可以在地下生活长达三年才羽化为成虫！",
    "独角仙成虫主要在夜间活动，白天通常躲在树上休息！",
    "许多独角仙品种能够发出嘶嘶声来吓退天敌！",
    "独角仙的幼虫在生长过程中会经历3-5次蜕皮！",
    "独角仙的眼睛由许多小的六边形结构组成，能够捕捉周围环境的微小变化！",
    "独角仙的触角末端有特殊的感觉器官，可以感知气味、振动和温度！",
    "有些独角仙幼虫会自己制作一个'茧'，为蜕变为成虫做准备！",
    "独角仙成虫喜欢有树液流出的树木，因为树液是它们重要的食物来源！",
    "在某些文化中，独角仙被视为力量和勇气的象征！",
    "独角仙对维持森林生态系统健康有重要贡献，它们的幼虫帮助分解朽木！",
    "有些独角仙品种可以举起自身体重的850倍，相当于人类举起多辆汽车！",
    "独角仙的足部有特殊的结构，使它们能够牢固地抓住树干和叶子！",
    "独角仙的消化系统特别适合分解木质纤维，这是大多数动物无法消化的物质！"
  ];
  
  // 随机显示趣味知识
  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setFunFact(funFacts[randomIndex]);
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
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 200, 161, 0.5)'
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
        </nav>
      </header>

      <main>
        <section style={{
          position: 'relative',
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
          border: '2px solid #dbe9d1'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#416153',
            marginBottom: '16px',
            textAlign: 'center',
            position: 'relative',
            zIndex: '1'
          }}>
            欢迎来到 Kane 的独角仙世界
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#5c7c6e',
            marginBottom: '24px',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: '1'
          }}>
            在这个充满生机的小天地里，我们将一起见证独角仙从幼虫到成虫的神奇旅程。
            像龙猫照顾小梅一样，Kane正在悉心照料这个小生命。
          </p>
        </section>

        <div style={{
          backgroundColor: '#f0f7e9',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.05)',
          border: '2px solid #c8dcc0',
          position: 'relative'
        }}>
          <h3 style={{ 
            fontSize: '22px', 
            color: '#3a6a4b', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: '1'
          }}>
            <span style={{ marginRight: '10px', fontSize: '24px' }}>💡</span> 
            你知道吗？
          </h3>
          <p style={{ 
            fontSize: '17px', 
            marginBottom: '18px',
            color: '#4d6e5e',
            fontStyle: 'italic',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: '1',
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '10px'
          }}>
            {funFact}
          </p>
          <button 
            onClick={getRandomFact}
            style={{
              backgroundColor: '#76a58e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #5a8071',
              position: 'relative',
              zIndex: '1',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 6px 0 #5a8071';
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 0 #5a8071';
            }}
          >
            再来一个！
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '30px',
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
          
          <h3 style={{ 
            fontSize: '22px', 
            color: '#3a6a4b', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: '2px dashed #a8c8a1',
            paddingBottom: '10px',
            position: 'relative',
            zIndex: '1'
          }}>
            <span style={{ marginRight: '10px', fontSize: '24px' }}>📝</span> 
            独角仙饲养手册
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              borderRadius: '10px', 
              padding: '16px',
              border: '2px solid #d1fae5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              position: 'relative',
              zIndex: '1'
            }}>
              <h4 style={{ fontSize: '18px', color: '#047857', marginBottom: '8px' }}>
                1. 饲养环境 🏠
              </h4>
              <p style={{ margin: '4px 0' }}>- 温度：保持在 20-25℃，避免温度波动过大</p>
              <p style={{ margin: '4px 0' }}>- 湿度：保持在 60-70%，定期喷水保持湿度</p>
              <p style={{ margin: '4px 0' }}>- 容器：透气、防逃脱的饲养盒，至少10厘米深</p>
              <p style={{ margin: '4px 0' }}>- 基质：腐叶土、腐朽木屑混合物，深度至少6厘米</p>
              <p style={{ margin: '4px 0' }}>- 装饰：添加小树枝、树皮，提供攀爬和躲藏的地方</p>
              <p style={{ margin: '4px 0' }}>- 通风：确保饲养盒有足够的通风孔，但要防止幼虫逃跑</p>
            </div>

            <div style={{ 
              backgroundColor: '#f9f9f9', 
              borderRadius: '10px', 
              padding: '16px',
              border: '2px solid #ffedd5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ fontSize: '18px', color: '#c2410c', marginBottom: '8px' }}>
                2. 饮食指南 🍎
              </h4>
              <p style={{ margin: '4px 0' }}>- 幼虫食物：腐烂的阔叶树木（如橡树、樱花等）</p>
              <p style={{ margin: '4px 0' }}>- 成虫食物：熟透的香蕉、苹果、梨、西瓜等水果</p>
              <p style={{ margin: '4px 0' }}>- 专用食品：市售甲虫果冻，富含营养且方便使用</p>
              <p style={{ margin: '4px 0' }}>- 补充品：可适量添加蜂蜜水或糖水，增加能量摄入</p>
              <p style={{ margin: '4px 0' }}>- 投喂频率：成虫每1-2天一次，幼虫保持充足的木材供应</p>
              <p style={{ margin: '4px 0' }}>- 避免使用：化学添加剂或发霉腐败的食物</p>
            </div>

            <div style={{ 
              backgroundColor: '#f9f9f9', 
              borderRadius: '10px', 
              padding: '16px',
              border: '2px solid #ede9fe',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ fontSize: '18px', color: '#7e22ce', marginBottom: '8px' }}>
                3. 日常观察重点 👀
              </h4>
              <p style={{ margin: '4px 0' }}>- 幼虫观察：觅食活动、生长速度、蜕皮情况</p>
              <p style={{ margin: '4px 0' }}>- 蛹期观察：颜色变化（从白色到棕色）、保持安静的环境</p>
              <p style={{ margin: '4px 0' }}>- 成虫观察：进食情况、活动时间、互动行为</p>
              <p style={{ margin: '4px 0' }}>- 定期检查：每周检查容器内的湿度和食物供应</p>
              <p style={{ margin: '4px 0' }}>- 记录变化：拍照记录不同阶段的生长情况</p>
              <p style={{ margin: '4px 0' }}>- 异常情况：留意不正常的行为、拒食或颜色变化</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              borderRadius: '10px', 
              padding: '16px',
              border: '2px solid #dbeafe',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ fontSize: '18px', color: '#1e40af', marginBottom: '8px' }}>
                4. 容器清洁 🧹
              </h4>
              <p style={{ margin: '4px 0' }}>- 定期清洁：每2-4周清理一次废物和未食用的食物</p>
              <p style={{ margin: '4px 0' }}>- 部分更换：只更换顶部1/3的基质，避免打扰幼虫</p>
              <p style={{ margin: '4px 0' }}>- 清洁工具：使用干净的铲子和刷子，避免化学清洁剂</p>
              <p style={{ margin: '4px 0' }}>- 水盘清洁：每周清洗成虫饲养箱中的水盘</p>
              <p style={{ margin: '4px 0' }}>- 消毒方法：阳光暴晒或自然干燥，避免强力消毒剂</p>
              <p style={{ margin: '4px 0' }}>- 防霉措施：保持通风良好，控制湿度防止霉菌生长</p>
            </div>

            <div style={{ 
              backgroundColor: '#f9f9f9', 
              borderRadius: '10px', 
              padding: '16px',
              border: '2px solid #fce7f3',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ fontSize: '18px', color: '#be185d', marginBottom: '8px' }}>
                5. 特殊注意事项 ⚠️
              </h4>
              <p style={{ margin: '4px 0' }}>- 生长周期：幼虫1-3年，蛹约1个月，成虫2-4个月</p>
              <p style={{ margin: '4px 0' }}>- 季节变化：冬季可能需要保温措施，夏季注意防止过热</p>
              <p style={{ margin: '4px 0' }}>- 处理方式：轻柔搬运，避免伤害其柔软的腹部</p>
              <p style={{ margin: '4px 0' }}>- 同种饲养：可以集群饲养幼虫，但成虫雄性需要分开</p>
              <p style={{ margin: '4px 0' }}>- 光照管理：避免阳光直射，提供弱光环境</p>
              <p style={{ margin: '4px 0' }}>- 噪音控制：尽量减少周围环境的强烈震动和噪音</p>
            </div>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center',
          marginTop: '30px',
          marginBottom: '20px'
        }}>
          <Link href="/upload" style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#5d9178',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '40px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 6px 0 #3d6051',
            transition: 'all 0.2s',
            fontSize: '17px'
          }}
          onMouseOver={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.transform = 'translateY(-3px)';
            target.style.boxShadow = '0 9px 0 #3d6051';
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = '0 6px 0 #3d6051';
          }}>
            <span style={{ fontSize: '20px', marginRight: '10px' }}>📸</span>
            记录今天的奇遇
          </Link>
        </div>
      </main>
    </div>
  );
} 