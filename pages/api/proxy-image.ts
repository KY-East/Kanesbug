import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.url as string;
  
  if (!imageUrl) {
    return res.status(400).send('缺少图片URL参数');
  }

  try {
    console.log('代理请求图片:', imageUrl);
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('源图片请求失败:', response.status, response.statusText);
      return res.status(response.status).send(`源图片请求失败: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('Content-Type');
    const buffer = await response.arrayBuffer();

    // 设置响应头
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 发送图片数据
    res.status(200).send(Buffer.from(buffer));
    
    console.log('图片代理成功:', {
      url: imageUrl.substring(0, 50) + '...',
      size: buffer.byteLength,
      type: contentType
    });
  } catch (err) {
    console.error("代理图片失败:", err);
    res.status(500).send('图片获取错误');
  }
} 