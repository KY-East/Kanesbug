import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import Link from 'next/link';

export default function UploadPage() {
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
      setErrorMessage('请选择一张图片');
      return;
    }
    
    if (!note.trim()) {
      setErrorMessage('请填写观察笔记');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    // 添加上传超时保护
    const uploadTimeoutId = setTimeout(() => {
      setIsUploading(false);
      setErrorMessage('上传超时，请重试。可能是网络连接问题。');
    }, 30000); // 30秒超时
    
    try {
      console.log('开始上传，配置:', {
        storageBucket: 'kane-s-rhinoceros.firebasestorage.app'
      });
      
      // 创建文件名
      const timestamp = Date.now();
      const fileName = `photos/${timestamp}_${selectedFile.name}`;
      
      // 检查文件大小
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('文件大小不能超过5MB');
      }
      
      // 创建存储引用
      const fileRef = ref(storage, fileName);
      console.log('开始上传到:', fileName);
      
      let downloadURL = '';
      
      // 使用条件上传方法 - 在开发环境使用Base64避免CORS问题
      if (process.env.NODE_ENV === 'development') {
        console.log('使用开发环境Base64上传方式');
        // 使用Base64上传以避开CORS预检
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => {
            console.error('读取文件失败:', error);
            reject(new Error('读取文件失败'));
          };
          reader.readAsDataURL(selectedFile);
        });
        
        const fileData = dataUrl.split(',')[1];
        const metadata = { contentType: selectedFile.type };
        
        console.log('准备上传Base64数据...');
        const uploadResult = await uploadString(fileRef, fileData, 'base64', metadata);
        console.log('Base64上传成功:', uploadResult);
        
        console.log('获取下载URL...');
        downloadURL = await getDownloadURL(uploadResult.ref);
      } else {
        // 生产环境使用标准上传
        console.log('使用标准上传方式');
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        console.log('标准上传成功:', uploadResult);
        downloadURL = await getDownloadURL(uploadResult.ref);
      }
      
      console.log('获取下载URL成功:', downloadURL);
      
      // 保存记录到Firestore
      console.log('保存记录到Firestore...');
      const logRef = collection(db, 'logs');
      await addDoc(logRef, {
        photo: downloadURL,
        note: note,
        createdAt: serverTimestamp()
      });
      console.log('成功保存到Firestore');
      
      // 清除超时计时器
      clearTimeout(uploadTimeoutId);
      
      // 重置表单
      setSelectedFile(null);
      setNote('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 10000);
      
    } catch (error: any) {
      console.error('上传失败详情:', error);
      // 获取更详细的错误信息
      let errorMsg = '未知错误';
      if (error instanceof Error) {
        errorMsg = error.message;
        console.error('错误堆栈:', error.stack);
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object') {
        errorMsg = JSON.stringify(error);
      }
      setErrorMessage(`上传失败: ${errorMsg}`);
    } finally {
      // 清除超时计时器
      clearTimeout(uploadTimeoutId);
      setIsUploading(false);
    }
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
            padding: '6px 12px'
          }}>
            首页
          </Link>
          <Link href="/upload" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 200, 161, 0.5)'
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
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
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
            📸
          </span>
          记录今天的发现
        </h2>

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
            backgroundImage: 'url("/images/ghiblibug.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
          
          <form onSubmit={handleSubmit} style={{position: 'relative', zIndex: '2'}}>
            <div style={{ marginBottom: '30px', position: 'relative', zIndex: '1' }}>
              <label 
                htmlFor="photo" 
                style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: 'bold',
                  color: '#3a6a4b',
                  fontSize: '18px'
                }}
              >
                <span style={{ marginRight: '8px' }}>📷</span>
                拍下独角仙的样子
              </label>
              
              <div style={{
                border: '2px dashed #a8c8a1',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: 'rgba(241, 248, 233, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => fileInputRef.current?.click()}
              onMouseOver={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.backgroundColor = 'rgba(241, 248, 233, 0.9)';
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.backgroundColor = 'rgba(241, 248, 233, 0.7)';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = 'none';
              }}>
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
                      maxWidth: '350px',
                      margin: '0 auto',
                      marginBottom: '20px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '4px solid #dbe9d1'
                    }}>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="已选择的照片"
                        style={{
                          width: '100%',
                          maxHeight: '250px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <p style={{ 
                      color: '#5c7c6e', 
                      marginBottom: '15px',
                      fontSize: '15px'
                    }}>
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
                        backgroundColor: '#e05d5d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 0 #b44141',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.transform = 'translateY(-2px)';
                        target.style.boxShadow = '0 5px 0 #b44141';
                      }}
                      onMouseOut={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.transform = 'translateY(0)';
                        target.style.boxShadow = '0 3px 0 #b44141';
                      }}
                    >
                      重新选择照片
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      fontSize: '50px', 
                      marginBottom: '15px',
                      color: '#5c7c6e'
                    }}>
                      🔍
                    </div>
                    <p style={{ 
                      color: '#5c7c6e', 
                      marginBottom: '10px',
                      fontSize: '16px'
                    }}>
                      点击这里上传独角仙的照片
                    </p>
                    <p style={{ 
                      color: '#7c9a8c', 
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      像宫崎骏的电影一样，记录下每一个美好瞬间
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '30px', position: 'relative', zIndex: '1' }}>
              <label 
                htmlFor="note" 
                style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: 'bold',
                  color: '#3a6a4b',
                  fontSize: '18px'
                }}
              >
                <span style={{ marginRight: '8px' }}>📝</span>
                记录观察笔记
              </label>
              <textarea
                id="note"
                placeholder="像龙猫日记一样，写下你今天的观察发现..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '160px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #a8c8a1',
                  resize: 'vertical',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  color: '#4a6359',
                  lineHeight: '1.6',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: 'rgba(255, 218, 214, 0.7)',
                color: '#9a3d36',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #ff9e93',
                fontSize: '15px',
                textAlign: 'center',
                position: 'relative',
                zIndex: '1'
              }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                {errorMessage}
              </div>
            )}

            {uploadSuccess && (
              <div style={{
                backgroundColor: 'rgba(218, 248, 214, 0.9)',
                color: '#2a6b36',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '20px',
                border: '3px solid #93ff9e',
                fontSize: '18px',
                textAlign: 'center',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '1000',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                width: '80%',
                maxWidth: '500px',
                animation: 'fadeIn 0.7s'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>✅</div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1a5529' }}>太棒了！</h3>
                <p>你的观察记录已成功保存！</p>
                <p style={{ marginTop: '10px', fontSize: '16px' }}>快去<Link href="/timeline" style={{ color: '#1a7740', fontWeight: 'bold', textDecoration: 'underline' }}>时间线</Link>看看吧！</p>
                <button 
                  onClick={() => setUploadSuccess(false)}
                  style={{
                    marginTop: '20px',
                    padding: '8px 20px',
                    background: '#2a6b36',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  关闭提示
                </button>
              </div>
            )}

            <div style={{ 
              textAlign: 'center',
              marginTop: '25px',
              position: 'relative',
              zIndex: '1'
            }}>
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  backgroundColor: '#5d9178',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '14px 32px',
                  fontSize: '17px',
                  fontWeight: 'bold',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.7 : 1,
                  transition: 'all 0.3s',
                  boxShadow: '0 6px 0 #3d6051'
                }}
                onMouseOver={(e) => {
                  if (!isUploading) {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.transform = 'translateY(-3px)';
                    target.style.boxShadow = '0 9px 0 #3d6051';
                  }
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 6px 0 #3d6051';
                }}
              >
                {isUploading ? '正在上传...' : '记录这个瞬间'}
              </button>
            </div>
          </form>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <Link href="/timeline" style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#3a6a4b',
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgba(232, 245, 233, 0.7)',
            borderRadius: '30px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.backgroundColor = 'rgba(232, 245, 233, 0.9)';
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            target.style.backgroundColor = 'rgba(232, 245, 233, 0.7)';
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = 'none';
          }}>
            <span style={{ marginRight: '8px' }}>🕰️</span>
            查看成长历程
          </Link>
        </div>
      </main>
    </div>
  );
} 