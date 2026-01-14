import { ReadPosts } from "app/components/posts";

export const metadata = {
	title: "Read",
	description: "Books I read.",
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">
				Books I read
			</h1>
			<ReadPosts />
		</section>
	);
}
