import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🪲</span>
          <h1 className="text-xl font-bold">Kane的独角仙成长日志</h1>
        </div>
        
        <nav className="space-x-6 mt-3 md:mt-0 flex items-center">
          <Link href="/" className="text-blue-600 hover:underline hover:text-blue-800 flex items-center">
            <span className="mr-1">🏠</span>
            <span>首页</span>
          </Link>
          <Link href="/upload" className="text-blue-600 hover:underline hover:text-blue-800 flex items-center">
            <span className="mr-1">📸</span>
            <span>上传记录</span>
          </Link>
          <Link href="/timeline" className="text-blue-600 hover:underline hover:text-blue-800 flex items-center">
            <span className="mr-1">🕰️</span>
            <span>成长时间线</span>
          </Link>
        </nav>
      </header>
      
      <div className="bg-blue-50 p-2 text-center text-blue-800 text-sm border-b border-blue-200">
        今天是Kane照顾独角仙的第 {Math.floor((new Date().getTime() - new Date('2023-06-01').getTime()) / (1000 * 60 * 60 * 24))} 天 - 继续记录这个奇妙的旅程吧！
      </div>
      
      <main className="p-4 max-w-6xl mx-auto">
        {children}
      </main>
      
      <footer className="bg-white p-4 border-t text-center text-gray-600 text-sm">
        <p>
          <span className="mr-2">✨</span>
          记录每一个精彩瞬间，见证独角仙的神奇成长
          <span className="ml-2">✨</span>
        </p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} Kane的独角仙日记</p>
      </footer>
    </div>
  );
} 