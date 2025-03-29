import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          {/* 添加自定义的字体样式 */}
          <style dangerouslySetInnerHTML={{
            __html: `
              /* 本地字体定义 */
              @font-face {
                font-family: 'ZCOOLKuaiLe';
                src: url('/fonts/zhankukuaile.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              
              @font-face {
                font-family: 'ZCOOLXiaoWei';
                src: url('/fonts/zhankuxiaowei.otf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              
              @font-face {
                font-family: 'SmileySans';
                src: url('/fonts/SmileySans-Oblique.otf') format('opentype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              
              @font-face {
                font-family: 'NotoSansSC';
                src: url('/fonts/SourceHanSansCN-Heavy.otf') format('opentype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              
              /* 字体类名 */
              .font-zcool-kuaile {
                font-family: ZCOOLKuaiLe, cursive;
              }
              
              .font-zcool-xiaowei {
                font-family: ZCOOLXiaoWei, serif;
              }
              
              .font-smiley-sans {
                font-family: SmileySans, sans-serif;
              }
              
              .font-noto {
                font-family: NotoSansSC, sans-serif;
              }
              
              /* 调试样式 */
              .font-debug {
                border-bottom: 1px dashed #ccc;
              }
            `
          }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
} 