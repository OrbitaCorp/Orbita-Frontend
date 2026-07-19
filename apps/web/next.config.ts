import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  // Subdominios de tienda en desarrollo: Next 16 bloquea recursos de dev
  // (/_next/*) servidos a orígenes distintos de localhost salvo que se listen
  // acá. Agregar cada tienda de prueba usada en local.
  allowedDevOrigins: [
    'orbita.local',
    'tienda1.orbita.local',
    'tienda2.orbita.local',
  ],
};

export default nextConfig;
