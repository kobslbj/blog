import { formatDate, getBlogPosts } from "app/blog/utils";
import { getReadPosts } from "app/read/utils";
import Link from "next/link";

export function BlogPosts() {
	const allBlogs = getBlogPosts();

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{allBlogs
				.sort((a, b) => {
					if (
						new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
					) {
						return -1;
					}
					return 1;
				})
				.map((post) => (
					<Link
						key={post.slug}
						className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
						href={`/blog/${post.slug}`}
					>
						{post.metadata.image && (
							<div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
								{/* biome-ignore lint/performance/noImgElement: external image URLs */}
								<img
									src={post.metadata.image}
									alt={post.metadata.title}
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							</div>
						)}
						<div className="flex flex-col p-4">
							<p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
								{formatDate(post.metadata.publishedAt, false)}
							</p>
							<h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">
								{post.metadata.title}
							</h3>
							{post.metadata.summary && (
								<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
									{post.metadata.summary}
								</p>
							)}
						</div>
					</Link>
				))}
		</div>
	);
}

export function ReadPosts() {
	const allReads = getReadPosts();

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{allReads.map((book) => (
				<div key={book.slug} className="group flex flex-col">
					<div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
						{book.metadata.image ? (
							// biome-ignore lint/performance/noImgElement: external image URLs
							<img
								src={book.metadata.image}
								alt={book.metadata.title}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-neutral-400">
								<span className="text-sm">No cover</span>
							</div>
						)}
					</div>
					<h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2">
						{book.metadata.title}
					</h3>
				</div>
			))}
		</div>
	);
}
