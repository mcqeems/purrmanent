import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	allowedDevOrigins: ['10.10.17.190', 'localhost'],
	output: 'standalone',
};

export default nextConfig;
