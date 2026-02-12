import { createMDX } from 'fumadocs-mdx/next';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['@takumi-rs/image-response'],
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
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
