import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'scholar.googleusercontent.com' },
      { protocol: 'https', hostname: 'cu.ac.bd' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'heat.ugc.gov.bd' },
      { protocol: 'https', hostname: 'bangladesh.gov.bd' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
};

export default nextConfig;
