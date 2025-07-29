/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable server actions if needed
    serverActions: true,
  },
  // Increase body size limits for file uploads
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig