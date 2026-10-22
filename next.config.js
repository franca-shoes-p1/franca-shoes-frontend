/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Página do Ateliê Sob Medida (arquivo estático em public/atelie/index.html)
      { source: '/atelie', destination: '/atelie/index.html' },
    ];
  },
};

module.exports = nextConfig;
