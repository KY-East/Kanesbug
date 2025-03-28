/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseio.com https://*.googleapis.com; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://*.firebase.googleapis.com https://identitytoolkit.googleapis.com https://*.firebasestorage.googleapis.com; img-src 'self' blob: data: https://*.firebasestorage.googleapis.com; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 