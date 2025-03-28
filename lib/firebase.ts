import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 配置 - 使用环境变量以避免API密钥泄露
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kane-s-rhinoceros.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kane-s-rhinoceros",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kane-s-rhinoceros.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1090143057688",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1090143057688:web:b1655257bc04f79de0106d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-T7RYJ2YBFR"
};

// 在开发模式下打印配置信息（不含密钥）
if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase配置信息:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 导出 Firestore 实例
export const db = getFirestore(app);

// 导出 Storage 实例
export const storage = getStorage(app); 