import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, uploadString } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import Link from 'next/link';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 添加阶段标签函数
  const addStageTag = (tag: string) => {
    // 移除所有已有的阶段标签
    let newNote = note;
    ['#幼虫阶段', '#蛹阶段', '#成虫阶段'].forEach(stage => {
      if (newNote.startsWith(stage)) {
        newNote = newNote.substring(stage.length).trimStart();
      }
    });
    
    // 添加新的标签
    setNote(tag + ' ' + newNote);
  };

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
    
    try {
      console.log('开始上传文件，使用硬编码配置:', {
        storageBucket: 'kane-s-rhinoceros.appspot.com'
      });
      
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      
      // 检查文件大小
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('文件大小不能超过5MB');
      }
      
      // 读取文件为Data URL
      const reader = new FileReader();
      
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsDataURL(selectedFile);
      });
      
      // 创建存储引用 - 直接使用硬编码的路径
      const storageRef = ref(storage, `photos/${fileName}`);
      
      try {
        // 上传Base64编码的图片数据
        const fileData = dataUrl.split(',')[1];
        const metadata = { contentType: selectedFile.type };
        
        // 上传图片
        console.log('开始上传到路径:', `photos/${fileName}`);
        const uploadTask = uploadString(storageRef, fileData, 'base64', metadata);
        
        // 等待上传完成
        const snapshot = await uploadTask;
        
        // 获取下载URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('文件上传成功，URL:', downloadURL);
        
        // 保存记录到Firestore
        console.log('准备写入Firestore，数据:', {
          photo: downloadURL,
          note: note,
          createdAt: 'serverTimestamp()'
        });
        
        // 特别检查我们使用的集合名
        console.log('使用的集合名称：', 'logs');
        
        const logRef = collection(db, 'logs');
        const docRef = await addDoc(logRef, {
          photo: downloadURL,
          note: note,
          createdAt: serverTimestamp()
        });
        console.log('🔥成功写入Firestore，文档ID:', docRef.id);
        console.log('✓ 使用photo字段，不使用photoURL字段');
        
        // 验证写入是否成功，立即读取回来
        const docSnap = await getDoc(doc(db, 'logs', docRef.id));
        if (docSnap.exists()) {
          console.log('✅ 验证成功：已从Firestore读取回数据:', docSnap.data());
          
          // 特别检查字段是否存在
          const data = docSnap.data();
          if (data.photo) {
            console.log('✅ 文档包含photo字段:', data.photo);
          } else {
            console.error('❌ 文档不包含photo字段');
          }
        } else {
          console.error('❌ 验证失败：无法读取刚才写入的文档');
        }
        
        setSelectedFile(null);
        setNote('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 5000);
        
      } catch (error) {
        console.error('上传或保存失败:', error);
        setErrorMessage(`上传失败: ${error instanceof Error ? error.message : '上传过程中出错'}`);
      }
      
    } catch (error: any) {
      console.error('文件处理过程发生错误:', error);
      setErrorMessage(`上传失败: ${error.message}`);
    } finally {
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
          <Link href="/backup" style={{ 
            color: '#427a5b', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '6px 12px'
          }}>
            备份导出
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
                      height: '280px',
                      margin: '0 auto',
                      marginBottom: '20px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '4px solid #dbe9d1',
                      backgroundColor: '#f9fdf6',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px'
                    }}>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="已选择的照片"
                        id="preview-image"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onLoad={(e) => {
                          // 图片加载完成后根据实际比例调整显示方式
                          const img = e.target as HTMLImageElement;
                          const ratio = img.naturalWidth / img.naturalHeight;
                          const container = img.parentElement;
                          
                          console.log(`预览图片比例: ${ratio} (${img.naturalWidth}x${img.naturalHeight})`);
                          
                          if (ratio > 1.2) {
                            // 横向图片：宽度优先
                            img.style.width = '100%';
                            img.style.height = 'auto';
                            if (container) container.style.padding = '20px 4px';
                          } else if (ratio < 0.8) {
                            // 纵向图片：高度优先
                            img.style.height = '100%';
                            img.style.width = 'auto';
                            if (container) container.style.padding = '4px 20px';
                          } else {
                            // 接近正方形
                            img.style.width = '90%';
                            img.style.height = '90%';
                            img.style.objectFit = 'cover';
                            if (container) container.style.padding = '8px';
                          }
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
              
              {/* 阶段标签选择区 */}
              <div style={{ 
                marginBottom: '15px', 
                backgroundColor: 'rgba(241, 248, 233, 0.7)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #a8c8a1'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '8px', 
                  color: '#3a6a4b',
                  fontWeight: 'bold'
                }}>
                  选择当前阶段：
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px' 
                }}>
                  {['#幼虫阶段', '#蛹阶段', '#成虫阶段'].map(stage => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => addStageTag(stage)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: note.startsWith(stage) ? '#4a7c59' : '#dbe9d1',
                        color: note.startsWith(stage) ? '#fff' : '#3a6a4b',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: note.startsWith(stage) ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
              
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
                backgroundColor: 'rgba(218, 248, 214, 0.7)',
                color: '#2a6b36',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #93ff9e',
                fontSize: '15px',
                textAlign: 'center',
                position: 'relative',
                zIndex: '1',
                animation: 'fadeIn 0.5s'
              }}>
                <span style={{ marginRight: '8px' }}>✅</span>
                上传成功！你的观察已记录在时间线上。
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