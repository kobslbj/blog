"use server";

import fs from "node:fs";
import path from "node:path";
import { mdxComponents, mdxOptions } from "app/components/mdx";
import {
	deletePost as deletePostFile,
	getBlogPosts,
	isValidSlug,
	type PostMetadata,
	postExists,
	readPost,
	renamePost as renamePostFile,
	slugify,
	writePost,
} from "lib/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";

function assertDev() {
	if (process.env.NODE_ENV === "production") {
		throw new Error("The editor is only available in development.");
	}
}

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

export type PostInput = {
	title: string;
	summary: string;
	publishedAt: string;
	image: string;
	content: string;
};

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function uniqueSlug(base: string): string {
	let slug = base;
	let n = 2;
	while (postExists(slug)) {
		slug = `${base}-${n++}`;
	}
	return slug;
}

export async function createPost(): Promise<Result<{ slug: string }>> {
	assertDev();
	const stamp = new Date()
		.toISOString()
		.replace(/[-:]/g, "")
		.slice(0, 13)
		.replace("T", "-");
	const slug = uniqueSlug(`untitled-${stamp}`);
	writePost(slug, { title: "", publishedAt: today(), draft: true }, "");
	revalidatePath("/write");
	return { ok: true, slug };
}

export async function savePost(
	slug: string,
	input: PostInput,
): Promise<Result<{ savedAt: string }>> {
	assertDev();
	const existing = readPost(slug);
	if (!existing) {
		return { ok: false, error: "This post no longer exists on disk." };
	}
	const metadata: PostMetadata = {
		title: input.title.trim(),
		publishedAt: input.publishedAt || today(),
		summary: input.summary.trim() || undefined,
		image: input.image.trim() || undefined,
		draft: existing.metadata.draft,
	};
	writePost(slug, metadata, input.content);
	revalidatePath("/write");
	revalidatePath(`/blog/${slug}`);
	return { ok: true, savedAt: new Date().toISOString() };
}

export async function setPublished(
	slug: string,
	published: boolean,
	input: PostInput,
): Promise<Result<{ slug: string }>> {
	assertDev();
	const existing = readPost(slug);
	if (!existing) {
		return { ok: false, error: "This post no longer exists on disk." };
	}
	if (published && !input.title.trim()) {
		return { ok: false, error: "Add a title before publishing." };
	}

	// First publish of an untitled draft: give it a real slug based on the title.
	let finalSlug = slug;
	if (published && slug.startsWith("untitled-")) {
		const fromTitle = slugify(input.title);
		if (fromTitle && isValidSlug(fromTitle)) {
			finalSlug = uniqueSlug(fromTitle);
			renamePostFile(slug, finalSlug);
		}
	}

	writePost(
		finalSlug,
		{
			title: input.title.trim(),
			publishedAt: input.publishedAt || today(),
			summary: input.summary.trim() || undefined,
			image: input.image.trim() || undefined,
			draft: !published,
		},
		input.content,
	);
	revalidatePath("/write");
	revalidatePath("/");
	revalidatePath("/blog");
	revalidatePath(`/blog/${finalSlug}`);
	return { ok: true, slug: finalSlug };
}

export async function renamePost(
	slug: string,
	nextSlug: string,
): Promise<Result<{ slug: string }>> {
	assertDev();
	const cleaned = nextSlug.trim();
	if (cleaned === slug) return { ok: true, slug };
	if (!isValidSlug(cleaned)) {
		return {
			ok: false,
			error: "Slugs can only contain letters, numbers and dashes.",
		};
	}
	if (postExists(cleaned)) {
		return {
			ok: false,
			error: `A post with the slug "${cleaned}" already exists.`,
		};
	}
	if (!postExists(slug)) {
		return { ok: false, error: "This post no longer exists on disk." };
	}
	renamePostFile(slug, cleaned);
	revalidatePath("/write");
	return { ok: true, slug: cleaned };
}

export async function deletePost(slug: string): Promise<Result> {
	assertDev();
	if (!postExists(slug)) {
		return { ok: false, error: "This post no longer exists on disk." };
	}
	deletePostFile(slug);
	revalidatePath("/write");
	revalidatePath("/");
	revalidatePath("/blog");
	return { ok: true };
}

const IMAGE_DIR = path.join(process.cwd(), "public", "images", "blog");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadImage(
	formData: FormData,
): Promise<Result<{ url: string }>> {
	assertDev();
	const file = formData.get("file");
	const slug = String(formData.get("slug") ?? "post");
	if (!(file instanceof File)) {
		return { ok: false, error: "No file received." };
	}
	if (!file.type.startsWith("image/")) {
		return { ok: false, error: "Only image files can be uploaded." };
	}
	if (file.size > MAX_IMAGE_BYTES) {
		return { ok: false, error: "Images must be smaller than 10 MB." };
	}

	const ext = path.extname(file.name).toLowerCase() || ".png";
	const base =
		slugify(path.basename(file.name, path.extname(file.name))) || "image";
	const prefix = isValidSlug(slug) ? `${slug}-` : "";
	fs.mkdirSync(IMAGE_DIR, { recursive: true });

	let name = `${prefix}${base}${ext}`;
	let n = 2;
	while (fs.existsSync(path.join(IMAGE_DIR, name))) {
		name = `${prefix}${base}-${n++}${ext}`;
	}
	fs.writeFileSync(
		path.join(IMAGE_DIR, name),
		Buffer.from(await file.arrayBuffer()),
	);
	return { ok: true, url: `/images/blog/${name}` };
}

export async function renderPreview(
	source: string,
): Promise<Result<{ node: ReactNode }>> {
	assertDev();
	if (!source.trim()) {
		return { ok: true, node: null };
	}
	try {
		const { content } = await compileMDX({
			source,
			components: mdxComponents,
			options: { mdxOptions },
		});
		return { ok: true, node: content };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error ? error.message : "Could not render preview.",
		};
	}
}

export async function listPostsForEditor() {
	assertDev();
	return getBlogPosts({ includeDrafts: true });
}

export async function createPostAndOpen(): Promise<void> {
	const result = await createPost();
	if (result.ok) {
		redirect(`/write/${result.slug}`);
	}
}
