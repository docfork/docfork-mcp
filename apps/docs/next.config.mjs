import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['@takumi-rs/image-response'],
  async rewrites() {
    return [
      {
        source: '/:path*.md',
        destination: '/llms.md/:path*',
      },
    ];
  },
};

export default withMDX(config);
