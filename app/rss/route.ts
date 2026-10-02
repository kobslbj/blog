import { getBlogPosts } from "lib/content";
import { siteConfig } from "lib/site";

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export async function GET() {
	const itemsXml = getBlogPosts()
		.map(
			(post) => `    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${siteConfig.url}/blog/${post.slug}</link>
      <guid>${siteConfig.url}/blog/${post.slug}</guid>
      <description>${escapeXml(post.metadata.summary ?? "")}</description>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
    </item>`,
		)
		.join("\n");

	const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
${itemsXml}
  </channel>
</rss>`;

	return new Response(rssFeed, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}
