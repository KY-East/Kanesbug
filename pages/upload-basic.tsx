import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import Link from 'next/link';

export default function UploadBasicPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('请选择一张独角仙的照片');
      return;
    }
    
    if (!note.trim()) {
      setErrorMessage('请添加观察笔记');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    try {
      // 上传图片到 Firebase Storage
      const storageRef = ref(storage, `beetle_photos/${Date.now()}_${selectedFile.name}`);
      const uploadResult = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // 将记录保存到 Firestore
      await addDoc(collection(db, 'beetle_logs'), {
        photoURL: downloadURL,
        note: note,
        createdAt: serverTimestamp()
      });
      
      // 重置表单
      setSelectedFile(null);
      setNote('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      console.error('上传失败:', error);
      setErrorMessage('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

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
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          textAlign: 'center',
          color: '#3b82f6'
        }}>
          📸 上传观察记录
        </h2>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="photo" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4b5563'
                }}
              >
                📷 选择照片
              </label>
              
              <div style={{
                border: '2px dashed #bfdbfe',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f0f9ff',
                cursor: 'pointer'
              }} onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                
                {selectedFile ? (
                  <div>
                    <div style={{
                      maxWidth: '300px',
                      margin: '0 auto',
                      marginBottom: '10px'
                    }}>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #bfdbfe'
                        }}
                      />
                    </div>
                    <p style={{ color: '#4b5563', marginBottom: '10px' }}>
                      {selectedFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      删除照片
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#6b7280', marginBottom: '10px' }}>
                      点击此处上传照片
                    </p>
                    <span style={{ fontSize: '40px' }}>🔍</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="note" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4b5563'
                }}
              >
                📝 观察笔记
              </label>
              <textarea
                id="note"
                placeholder="写下你的观察..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #bfdbfe',
                  resize: 'vertical',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {errorMessage}
              </div>
            )}

            {uploadSuccess && (
              <div style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                上传成功！你的观察已记录。
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isUploading ? '上传中...' : '保存记录'}
              </button>
            </div>
          </form>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <Link href="/timeline-basic" style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            <span style={{ marginRight: '8px' }}>查看所有记录</span>
            <span>→</span>
          </Link>
        </div>
      </main>
    </div>
  );
} 