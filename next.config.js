/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kruaixvqpcgenupgydul.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
