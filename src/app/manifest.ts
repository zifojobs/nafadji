import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Association Nafadji",
    short_name: "Nafadji",
    description: "Gestion de l'association Nafadji — cotisations, réunions, procès-verbaux",
    start_url: "/",
    display: "standalone",
    background_color: "#0B3D2E",
    theme_color: "#0B3D2E",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
