/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    // Avoid bundling node onnx bindings used by transformers in browser
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'onnxruntime-node': false
    };
    // Allow ffmpeg.wasm to run in web workers and remove node core fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false
    };
    return config;
  }
};

export default nextConfig;
