import { getBlogPosts, type Post } from "lib/content";
import { countWords, formatDate } from "lib/text";
import Link from "next/link";
import { createPostAndOpen } from "./actions";

export const dynamic = "force-dynamic";

function PostRow({ post }: { post: Post }) {
	const words = countWords(post.content);
	return (
		<li>
			<Link
				href={`/write/${post.slug}`}
				className="group -mx-3 flex flex-col gap-1 rounded-lg px-3 py-3 transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none dark:hover:bg-neutral-900 dark:focus-visible:bg-neutral-900"
			>
				<span className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
					{post.metadata.title || (
						<span className="text-neutral-400">Untitled</span>
					)}
				</span>
				{post.metadata.summary && (
					<span className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
						{post.metadata.summary}
					</span>
				)}
				<span className="font-mono text-xs text-neutral-500">
					{formatDate(post.metadata.publishedAt)} · {words} words · /blog/
					{post.slug}
				</span>
			</Link>
		</li>
	);
}

function Section({
	title,
	posts,
	empty,
}: {
	title: string;
	posts: Post[];
	empty: string;
}) {
	return (
		<section className="mb-12">
			<h2 className="mb-3 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
				{title}
				<span className="text-neutral-400">{posts.length}</span>
			</h2>
			{posts.length === 0 ? (
				<p className="text-sm text-neutral-500">{empty}</p>
			) : (
				<ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
					{posts.map((post) => (
						<PostRow key={post.slug} post={post} />
					))}
				</ul>
			)}
		</section>
	);
}

export default function WritePage() {
	const posts = getBlogPosts({ includeDrafts: true });
	const drafts = posts.filter((post) => post.metadata.draft);
	const published = posts.filter((post) => !post.metadata.draft);

	return (
		<div className="mx-auto w-full max-w-2xl px-6 py-12">
			<header className="mb-12 flex items-end justify-between gap-4">
				<div>
					<p className="mb-1 font-mono text-xs uppercase tracking-widest text-neutral-500">
						Backstage
					</p>
					<h1 className="text-3xl font-semibold tracking-tighter">Posts</h1>
				</div>
				<form action={createPostAndOpen}>
					<button
						type="submit"
						className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
					>
						New post
					</button>
				</form>
			</header>

			<Section
				title="Drafts"
				posts={drafts}
				empty="Nothing in progress. Start a new post."
			/>
			<Section
				title="Published"
				posts={published}
				empty="Nothing published yet."
			/>

			<footer className="mt-16 border-t border-neutral-200 pt-6 font-mono text-xs leading-relaxed text-neutral-500 dark:border-neutral-800">
				<p>
					Posts are saved as MDX files in <code>content/blog/</code>. To put
					them online, commit and push:
				</p>
				<pre className="mt-2 overflow-x-auto rounded-md bg-neutral-100 p-3 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
					git add content public && git commit -m "post: …" && git push
				</pre>
				<p className="mt-3">
					<Link href="/" className="underline underline-offset-2">
						View site
					</Link>
				</p>
			</footer>
		</div>
	);
}
