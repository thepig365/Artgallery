/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.metmuseum.org",
      },
      {
        protocol: "https",
        hostname: "lakeimagesweb.artic.edu",
        pathname: "/iiif/**",
      },
    ],
  },
};

export default nextConfig;
