import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			// The /write editor uploads images through a server action; it accepts up to 10 MB (see MAX_IMAGE_BYTES).
			bodySizeLimit: "11mb",
		},
	},
	async redirects() {
		return [{ source: "/read", destination: "/resources", permanent: true }];
	},
	// PostHog reverse proxy: events go to /ingest on our own domain so tracking blockers don't drop them.
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/array/:path*",
				destination: "https://us-assets.i.posthog.com/array/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"}/:path*`,
			},
		];
	},
	// PostHog API paths end in a trailing slash; don't redirect them away.
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
