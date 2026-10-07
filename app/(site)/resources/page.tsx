import { ReadPosts } from "app/components/posts";

export const metadata = {
	title: "Resources",
	description: "Books, articles, and videos I recommend.",
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">
				Resources
			</h1>
			<h2 className="font-semibold text-xl mb-4 tracking-tight">Books</h2>
			<ReadPosts />
		</section>
	);
}
