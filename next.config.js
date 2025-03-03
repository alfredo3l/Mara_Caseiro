/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      's2.glbimg.com',
      'finger.ind.br',
      'classic.exame.com',
      'consultoriodehipnose.com.br',
      'img.freepik.com',
      'storage.googleapis.com',
      'divulgacandcontas.tse.jus.br',
      'randomuser.me'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'divulgacandcontas.tse.jus.br',
        port: '',
        pathname: '/divulga/rest/arquivo/img/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configurações adicionais para otimização
  reactStrictMode: true,
  swcMinify: true,
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: ['@geist-ui/core'],
  }
}

module.exports = nextConfig 