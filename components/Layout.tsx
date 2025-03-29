import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9f7f1'
    }}>
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #a8c8a1'
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
            padding: '6px 12px'
          }}>
            备份
          </Link>
          <Link href="/science-journal" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px'
          }}>
            科学手帐
          </Link>
        </nav>
      </header>
      <main style={{ padding: '16px' }}>{children}</main>
    </div>
  );
} 