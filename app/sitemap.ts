import { getBlogPosts } from "lib/content";
import { siteConfig } from "lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const blogs = getBlogPosts().map((post) => ({
		url: `${siteConfig.url}/blog/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const routes = ["", "/about", "/blog", "/projects", "/read"].map((route) => ({
		url: `${siteConfig.url}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs];
}
