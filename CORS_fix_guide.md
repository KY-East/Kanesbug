# Firebase项目CORS问题修复指南

## 问题诊断

如果你遇到CORS（跨域资源共享）错误，通常会在浏览器控制台看到类似以下信息：

```
Access to fetch at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

或者

```
A cross-origin resource sharing (CORS) request was blocked because the response to the associated preflight request failed
```

## 可能的原因和解决方案

### 1. Firebase Storage桶配置错误

**症状**：上传到Firebase Storage失败，出现CORS预检请求失败

**解决方法**：
- 确保`lib/firebase.ts`中的storageBucket配置正确
- 正确格式应该是: `your-project-id.appspot.com`
- 不正确格式: `your-project-id.firebasestorage.app`

**当前项目正确配置**：
```js
storageBucket: "kane-s-rhinoceros.appspot.com"
```

### 2. Firebase Storage CORS规则未配置

**解决方法**：使用Google Cloud SDK设置CORS规则

```bash
# 安装Google Cloud SDK，然后运行：
gsutil cors set cors.json gs://kane-s-rhinoceros.appspot.com
```

其中`cors.json`内容为：
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Content-Length", "Content-Disposition"]
  }
]
```

### 3. Content Security Policy (CSP) 限制

**解决方法**：在`next.config.js`中设置适当的CSP标头

```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' https://*.firebaseio.com https://*.googleapis.com;
              connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com
                          https://firestore.googleapis.com https://*.firebase.googleapis.com 
                          https://identitytoolkit.googleapis.com https://*.firebasestorage.googleapis.com;
              img-src 'self' blob: data: https://*.firebasestorage.googleapis.com;
              style-src 'self' 'unsafe-inline';
            `.replace(/\s+/g, ' ')
          }
        ]
      }
    ]
  }
}
```

### 4. 使用Base64上传方法避免CORS问题

如当前项目中实现的，将文件转换为Base64格式后再上传：

```js
// 读取文件为Data URL
const reader = new FileReader();
const dataUrl = await new Promise<string>((resolve, reject) => {
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error('读取文件失败'));
  reader.readAsDataURL(selectedFile);
});

// 上传Base64编码的图片数据
const fileData = dataUrl.split(',')[1];
const metadata = { contentType: selectedFile.type };
const uploadTask = uploadString(storageRef, fileData, 'base64', metadata);
```

### 5. 其他可能的问题

- **环境变量问题**：确保没有用引号包裹环境变量值
- **Firebase初始化顺序问题**：确保先完成初始化再使用存储服务
- **浏览器缓存**：尝试清除浏览器缓存或使用隐私模式
- **网络限制**：检查是否有网络代理或防火墙阻止了请求

## 调试方法

在上传过程中添加更多日志：

```js
console.log('开始上传文件，使用配置:', {
  storageBucket: firebaseConfig.storageBucket
});

console.log('开始上传到路径:', `photos/${fileName}`);

// 上传后
console.log('文件上传成功，URL:', downloadURL);
```

使用浏览器开发者工具的网络面板监控请求，特别关注OPTIONS预检请求的响应状态码。 