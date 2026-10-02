import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			// The /write editor uploads images through a server action; it accepts up to 10 MB (see MAX_IMAGE_BYTES).
			bodySizeLimit: "11mb",
		},
	},
};

export default nextConfig;
