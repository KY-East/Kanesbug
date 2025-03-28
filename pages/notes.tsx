import { useState } from 'react';
import Layout from '../components/Layout';

export default function NotesPage() {
  const [note, setNote] = useState('');

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">📝 Kane的观察笔记</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <textarea
            className="w-full h-48 p-4 border rounded-lg mb-4"
            placeholder="今天观察到了什么有趣的事情呢？"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => {
              // TODO: 实现保存功能
              alert('功能开发中...');
            }}
          >
            保存笔记
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">历史笔记</h2>
          <p className="text-gray-600 text-center">功能开发中...</p>
        </div>
      </div>
    </Layout>
  );
} 