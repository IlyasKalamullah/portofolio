/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // library PDF dijalankan langsung oleh Node (tidak di-bundle)
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Pastikan file mesin Prisma (.wasm) ikut ter-deploy ke server Vercel
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/runtime/**/*"],
    // font standar PDF (Helvetica dll.) dimuat dinamis oleh library PDF → sertakan manual
    "/api/cv/**/*": ["./node_modules/pdfkit/js/standard-fonts/**/*", "./node_modules/@react-pdf/**/*"],
  },
};
export default nextConfig;
