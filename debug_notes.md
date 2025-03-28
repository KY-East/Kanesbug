# 项目调试笔记

## Firebase上传问题排查

### 已发现问题

1. **Firebase Storage桶配置错误**：
   - ❌ 错误：`kane-s-rhinoceros.firebasestorage.app`
   - ✅ 正确：`kane-s-rhinoceros.appspot.com`
   - ✅ 状态：已修复

2. **端口占用问题**：
   - ❌ 问题：多个Next.js服务同时运行，占用了从3000到3010的端口
   - ✅ 解决方案：使用`killall node`终止所有Node进程
   - ✅ 状态：已处理

3. **环境变量格式问题**：
   - ❌ 问题：在Vercel或类似环境中，带引号的环境变量可能导致CORS问题
   - ✅ 解决方案：改为硬编码Firebase配置
   - ✅ 状态：已修复

### 改进项目的修改

1. **使用Base64上传**：
   - 修改了上传逻辑，使用Base64编码方式上传文件
   - 这种方式可以避免直接的CORS预检请求问题

2. **添加详细日志**：
   - 在上传过程的关键点添加了控制台日志
   - 可以更容易地调试问题

3. **创建安全规则文件**：
   - 添加了`firestore.rules`和`storage.rules`
   - 配置为开发阶段的宽松权限

4. **添加CORS配置**：
   - 创建了`cors.json`文件，可用于配置Firebase Storage的CORS规则
   - 需要使用Google Cloud SDK应用该配置

### 待尝试的解决方案

如果上传仍然失败，可以尝试以下方法：

1. 使用Firebase CLI应用CORS配置：
   ```bash
   npm install -g firebase-tools
   firebase login
   gsutil cors set cors.json gs://kane-s-rhinoceros.appspot.com
   ```

2. 检查Firebase控制台中的Storage安全规则：
   - 确保规则允许上传操作
   - 可以临时设置为完全开放：`allow read, write;`

3. 使用不同的浏览器或隐私模式测试：
   - 排除浏览器缓存或扩展影响

4. 检查网络连接：
   - 确保能够连接到Firebase服务器
   - 可以通过ping或其他工具测试连接

### 其他注意事项

- Next.js开发服务器重启后会清除大部分缓存
- Firebase Storage在初始化后可能需要几秒钟才能完全连接
- 如果有自定义域名，需要在CORS配置中包含该域名 