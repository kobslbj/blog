import { Comments } from "app/components/comments";
import { CustomMDX } from "app/components/mdx";
import { ViewCounter } from "app/components/view-counter";
import { countWords, formatDate, getBlogPost, getBlogPosts } from "lib/content";
import { siteConfig } from "lib/site";
import { readingTime } from "lib/text";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

// Drafts are viewable locally so they can be previewed on the real page.
const includeDrafts = process.env.NODE_ENV !== "production";

export async function generateStaticParams() {
	return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
	params,
}: Props): Promise<Metadata | undefined> {
	const { slug } = await params;
	const post = getBlogPost(decodeURIComponent(slug), { includeDrafts });
	if (!post) {
		return;
	}

	const { title, publishedAt, summary, image } = post.metadata;
	const ogImage = image
		? image
		: `${siteConfig.url}/og?title=${encodeURIComponent(title)}`;

	return {
		title,
		description: summary,
		openGraph: {
			title,
			description: summary,
			type: "article",
			publishedTime: publishedAt,
			url: `${siteConfig.url}/blog/${post.slug}`,
			images: [{ url: ogImage }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: summary,
			images: [ogImage],
		},
	};
}

export default async function BlogPost({ params }: Props) {
	const { slug } = await params;
	const post = getBlogPost(decodeURIComponent(slug), { includeDrafts });

	if (!post) {
		notFound();
	}

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.metadata.title,
		datePublished: post.metadata.publishedAt,
		dateModified: post.metadata.publishedAt,
		description: post.metadata.summary,
		image: post.metadata.image
			? `${siteConfig.url}${post.metadata.image}`
			: `${siteConfig.url}/og?title=${encodeURIComponent(post.metadata.title)}`,
		url: `${siteConfig.url}/blog/${post.slug}`,
		author: {
			"@type": "Person",
			name: siteConfig.author,
		},
	};

	return (
		<section>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD for SEO, data is safely serialized
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<article>
				<header>
					<h1 className="title text-[2rem] font-bold leading-[1.2] tracking-tight text-neutral-900 sm:text-[2.5rem] dark:text-neutral-50">
						{post.metadata.title}
					</h1>
					{post.metadata.summary && (
						<p className="mt-3 text-xl leading-snug text-neutral-500 dark:text-neutral-400">
							{post.metadata.summary}
						</p>
					)}
					<div className="mt-8 flex items-center gap-3 border-b border-neutral-200 pb-6 dark:border-neutral-800">
						<Image
							src={siteConfig.avatar}
							alt={siteConfig.author}
							width={44}
							height={44}
							className="h-11 w-11 rounded-full object-cover"
						/>
						<div className="min-w-0 text-sm leading-relaxed">
							<Link
								href="/about"
								className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
							>
								{siteConfig.author}
							</Link>
							<p className="flex flex-wrap items-center gap-x-2 text-neutral-500 dark:text-neutral-400">
								<span>
									{formatDate(post.metadata.publishedAt)} ·{" "}
									{readingTime(countWords(post.content))}
								</span>
								{post.metadata.draft ? (
									<span className="rounded-full border border-amber-400 px-2 text-xs text-amber-600 dark:text-amber-400">
										Draft
									</span>
								) : (
									<ViewCounter slug={post.slug} prefix="· " />
								)}
							</p>
						</div>
					</div>
				</header>

				{post.metadata.image && (
					<figure className="mt-8">
						{/* biome-ignore lint/performance/noImgElement: cover images can be external URLs of unknown size */}
						<img
							src={post.metadata.image}
							alt=""
							className="h-auto w-full rounded-md bg-neutral-100 dark:bg-neutral-900"
						/>
					</figure>
				)}

				<div className="prose post mt-10">
					<CustomMDX source={post.content} />
				</div>
			</article>

			<aside className="mt-16 flex items-start gap-4 border-t border-neutral-200 pt-10 dark:border-neutral-800">
				<Image
					src={siteConfig.avatar}
					alt=""
					width={56}
					height={56}
					className="h-14 w-14 shrink-0 rounded-full object-cover"
				/>
				<div className="min-w-0">
					<p className="text-xs uppercase tracking-widest text-neutral-500">
						Written by
					</p>
					<Link
						href="/about"
						className="text-lg font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
					>
						{siteConfig.author}
					</Link>
					<p className="mt-1 text-neutral-600 dark:text-neutral-400">
						{siteConfig.bio}
					</p>
					<div className="mt-4 flex flex-wrap gap-2 text-sm">
						<a
							href={siteConfig.x}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full bg-black px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
						>
							Follow on X
						</a>
						<a
							href="/rss"
							className="rounded-full border border-neutral-200 px-4 py-1.5 font-medium transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
						>
							RSS
						</a>
					</div>
				</div>
			</aside>

			{!post.metadata.draft && <Comments />}
		</section>
	);
}
