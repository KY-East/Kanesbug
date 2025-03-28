import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 配置 - 使用硬编码值而不是环境变量，确保配置正确
const firebaseConfig = {
  apiKey: "AIzaSyAfIr_zFYxvO_B5OH7dwpLyeUCIhlYkOiU",
  authDomain: "kane-s-rhinoceros.firebaseapp.com",
  projectId: "kane-s-rhinoceros",
  storageBucket: "kane-s-rhinoceros.appspot.com",  // 正确的存储桶名称
  messagingSenderId: "1090143057688",
  appId: "1:1090143057688:web:b1655257bc04f79de0106d",
  measurementId: "G-T7RYJ2YBFR"
};

// 在开发模式下打印配置信息
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