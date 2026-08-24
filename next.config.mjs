/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    // EN: the pattern pages read Python sources from the repo at build time.
    '/**': ['./src/**/*.py', './src/**/Output.txt', './ai_patterns/**/*'],
  },
};

export default nextConfig;
