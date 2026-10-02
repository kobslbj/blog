import "./global.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { siteConfig } from "lib/site";
import type { Metadata } from "next";
import { Noto_Serif_TC, Source_Serif_4 } from "next/font/google";

// Reading font for posts: Source Serif for Latin text, Noto Serif TC for Chinese.
const sourceSerif = Source_Serif_4({
	subsets: ["latin"],
	style: ["normal", "italic"],
	variable: "--font-source-serif",
	display: "swap",
});

// CJK fonts have no subset to preload; the browser only fetches the slices a page actually uses.
const notoSerifTC = Noto_Serif_TC({
	weight: ["400", "600", "700"],
	variable: "--font-noto-serif-tc",
	display: "swap",
	preload: false,
});

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	openGraph: {
		title: siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		siteName: siteConfig.name,
		locale: "en_US",
		type: "website",
	},
	alternates: {
		types: {
			"application/rss+xml": `${siteConfig.url}/rss`,
		},
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSerif.variable} ${notoSerifTC.variable} text-black bg-white dark:text-white dark:bg-black`}
		>
			<body className="antialiased">
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
