/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/prompts/:path*',
        destination: 'http://localhost:5000/api/prompts/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
