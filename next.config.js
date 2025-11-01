/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enable static export for GitHub Pages
    output: 'export',

    // Set base path to your repository name
    // Replace 'your-repo-name' with your actual GitHub repository name
    basePath: process.env.NODE_ENV === 'production' ? '/mi-shraban.github.io' : '',

    // Disable image optimization for static export
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'codeforces.com' },
            { protocol: 'https', hostname: 'github.com' },
            { protocol: 'https', hostname: 'repository-images.githubusercontent.com' },
            { protocol: 'https', hostname: 'opengraph.githubassets.com' }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
        dangerouslyAllowSVG: false,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Security headers (won't work on GitHub Pages, but keep for local dev)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
                    }
                ]
            }
        ]
    },

    // Webpack configuration
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.pdf$/i,
            type: 'asset/resource'
        })

        if (!isServer && process.env.NODE_ENV === 'production') {
            config.devtool = false
        }

        return config
    },

    // Compiler options for optimization
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn']
        } : false
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourusername.github.io/your-repo-name'
    }
}

module.exports = nextConfig