/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Pastikan file mesin Prisma (.wasm) ikut ter-deploy ke server Vercel
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/runtime/**/*"],
  },
};
export default nextConfig;
