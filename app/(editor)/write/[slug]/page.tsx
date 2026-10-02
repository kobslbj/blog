import { getBlogPost } from "lib/content";
import { notFound } from "next/navigation";
import { Editor } from "../editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getBlogPost(decodeURIComponent(slug), { includeDrafts: true });
	if (!post) {
		notFound();
	}
	return <Editor key={post.slug} post={post} />;
}
