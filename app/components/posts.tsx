import { countWords, formatDate, getBlogPosts, getBooks } from "lib/content";
import { readingTime } from "lib/text";
import Link from "next/link";

export function BlogPosts() {
	const posts = getBlogPosts();

	if (posts.length === 0) {
		return (
			<p className="text-neutral-600 dark:text-neutral-400">No posts yet.</p>
		);
	}

	return (
		<div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
			{posts.map((post) => (
				<Link
					key={post.slug}
					className="group flex items-start gap-5 py-6"
					href={`/blog/${post.slug}`}
				>
					<div className="min-w-0 flex-1">
						<h3 className="text-lg font-bold leading-snug tracking-tight text-neutral-900 group-hover:underline group-hover:decoration-neutral-400 group-hover:underline-offset-4 dark:text-neutral-100">
							{post.metadata.title}
						</h3>
						{post.metadata.summary && (
							<p className="mt-1 line-clamp-2 text-neutral-600 dark:text-neutral-400">
								{post.metadata.summary}
							</p>
						)}
						<p className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
							{formatDate(post.metadata.publishedAt)} ·{" "}
							{readingTime(countWords(post.content))}
						</p>
					</div>
					{post.metadata.image && (
						<div className="aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:w-32 dark:bg-neutral-900">
							{/* biome-ignore lint/performance/noImgElement: external image URLs */}
							<img
								src={post.metadata.image}
								alt=""
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						</div>
					)}
				</Link>
			))}
		</div>
	);
}

export function ReadPosts() {
	const books = getBooks();

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{books.map((book) => (
				<div key={book.slug} className="group flex flex-col">
					<div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
						{book.metadata.image ? (
							// biome-ignore lint/performance/noImgElement: external image URLs
							<img
								src={book.metadata.image}
								alt={book.metadata.title}
								loading="lazy"
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
