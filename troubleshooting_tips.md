# Firebase上传问题故障排除指南

## 常见问题与解决方案

### 1. CORS错误 - Firebase Storage上传失败

**错误信息**:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

**可能的原因**:
- Firebase Storage桶配置错误
- Firebase Storage CORS规则未设置
- 浏览器缓存问题

**解决方案**:

1. **检查并修正Storage桶配置**:
   ```javascript
   // 正确
   storageBucket: "kane-s-rhinoceros.appspot.com"
   
   // 错误
   storageBucket: "kane-s-rhinoceros.firebasestorage.app"
   ```

2. **设置Firebase Storage CORS规则**:
   - 方法一：通过Firebase控制台 -> Storage -> 规则
   - 方法二：安装Google Cloud SDK并使用gsutil命令:
     ```bash
     gsutil cors set cors.json gs://kane-s-rhinoceros.appspot.com
     ```
   - 方法三：使用Firebase Admin SDK (需要服务账号密钥)

3. **清除浏览器缓存或使用隐私模式测试**

### 2. 端口占用问题 - Next.js服务器无法启动

**症状**:
- 多个Next.js服务同时运行
- 端口3000-3010被占用

**解决方案**:
```bash
# 终止所有Node进程
killall node 

# 或更精确地终止Next.js进程
pkill -f "node.*next"

# 清除Next.js缓存
rm -rf .next
```

### 3. 环境变量问题

**症状**:
- Firebase配置无法正确加载
- 环境变量值中的引号可能导致CORS问题

**解决方案**:
- 在`.env.local`文件中移除环境变量值周围的引号
- 或直接在代码中硬编码Firebase配置，尤其是在排障阶段

### 4. 上传方法改进

如果仍然遇到CORS问题，可以尝试修改上传逻辑:
```javascript
// 使用Base64编码方式上传
const reader = new FileReader();
const dataUrl = await new Promise<string>((resolve, reject) => {
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(selectedFile);
});

const fileData = dataUrl.split(',')[1];
const metadata = { contentType: selectedFile.type };
const uploadTask = uploadString(storageRef, fileData, 'base64', metadata);
```

### 5. Firebase规则问题

如果上传失败但无CORS错误，检查Firebase规则:

**storage.rules**:
```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write;
    }
  }
}
```

**firestore.rules**:
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```

### 6. 添加调试日志

在上传过程中的关键点添加日志:
```javascript
console.log('开始上传文件，配置:', {
  storageBucket: firebaseConfig.storageBucket
});

console.log('开始上传到路径:', `photos/${fileName}`);

// 上传后
console.log('文件上传成功，URL:', downloadURL);
```

### 7. 获取详细错误信息

使用浏览器开发者工具:
1. 打开控制台 (F12 或 Cmd+Option+I)
2. 查看"网络"标签下的请求，特别是OPTIONS预检请求
3. 查看"控制台"标签下的错误消息

### 8. 其他可能的解决方案

- 更新Firebase SDK到最新版本
- 检查网络连接，确保能访问Firebase服务
- 尝试使用不同的浏览器测试上传功能 