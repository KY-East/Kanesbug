/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasestorage.googleapis.com wss://*.firebaseio.com https://firestore.googleapis.com https://*.firebase.googleapis.com https://identitytoolkit.googleapis.com https://*.google.com; img-src 'self' blob: data: https://*.firebasestorage.googleapis.com https://storage.googleapis.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'self';"
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