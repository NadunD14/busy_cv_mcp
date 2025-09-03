/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        // Handle pdfjs-dist worker
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
            }

            // Add fallback for node modules in client-side
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                canvas: false,
            }
        }

        return config
    },
    // Allow loading PDF.js worker from CDN
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig