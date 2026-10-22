/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Página do Ateliê Sob Medida (arquivo estático em public/atelie/index.html)
      { source: '/atelie', destination: '/atelie/index.html' },
      // Assistente "Monte a sua loja" (botão Quero a minha loja da home)
      { source: '/monte-sua-loja', destination: '/monte-sua-loja/index.html' },
      { source: '/monte-seu-site', destination: '/monte-seu-site/index.html' },
      { source: '/assistentes', destination: '/assistentes/index.html' },
    ];
  },
};

module.exports = nextConfig;
