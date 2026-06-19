import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: BRAND.name,
        short_name: BRAND.shortName,
        description: BRAND.description,
        start_url: "/",
        display: "standalone",
        background_color: "#030712",
        theme_color: "#030712",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
        ],
    };
}
