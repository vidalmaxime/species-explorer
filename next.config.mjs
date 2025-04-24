/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-leaflet", "leaflet", "@xenova/transformers"],

  // Add ESLint configuration to prevent failing builds due to warnings
  eslint: {
    // Warning during build won't fail the build
    ignoreDuringBuilds: true,
  },

  // Add caching headers for model files
  async headers() {
    return [
      {
        source: "/model-cache/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
    ];
  },

  // Override the default webpack configuration
  webpack: (config) => {
    // Exclude binary modules from client-side bundling
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };

    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    // Ignore warnings from node modules
    config.ignoreWarnings = [
      { module: /node_modules\/@xenova\/transformers/ },
      {
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
};

export default nextConfig;
