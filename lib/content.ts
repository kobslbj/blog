import fs from "node:fs";
import path from "node:path";

export type PostMetadata = {
	title: string;
	publishedAt: string;
	summary?: string;
	image?: string;
	draft?: boolean;
};

export type Post = {
	slug: string;
	metadata: PostMetadata;
	content: string;
};

export type BookMetadata = {
	title: string;
	image?: string;
};

export type Book = {
	slug: string;
	metadata: BookMetadata;
};

export const CONTENT_DIR = path.join(process.cwd(), "content");
export const BLOG_DIR = path.join(CONTENT_DIR, "blog");
export const BOOKS_DIR = path.join(CONTENT_DIR, "books");

// Only letters, numbers and dashes (unicode-aware so Chinese slugs work).
export const SLUG_PATTERN = /^[\p{L}\p{N}-]+$/u;

/* -------------------------------------------------------------------------- */
/*                                 Frontmatter                                */
/* -------------------------------------------------------------------------- */

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

type FrontmatterValue = string | boolean;

function parseValue(raw: string): FrontmatterValue {
	const value = raw.trim();
	if (value === "true") return true;
	if (value === "false") return false;
	if (value.startsWith('"') && value.endsWith('"')) {
		try {
			return JSON.parse(value) as string;
		} catch {
			return value.slice(1, -1);
		}
	}
	if (value.startsWith("'") && value.endsWith("'")) {
		return value.slice(1, -1).replace(/''/g, "'");
	}
	return value;
}

export function parseFrontmatter(fileContent: string): {
	metadata: Record<string, FrontmatterValue>;
	content: string;
} {
	const match = FRONTMATTER_PATTERN.exec(fileContent);
	if (!match) {
		return { metadata: {}, content: fileContent.trim() };
	}

	const metadata: Record<string, FrontmatterValue> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(":");
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		if (!key) continue;
		metadata[key] = parseValue(line.slice(separator + 1));
	}

	return {
		metadata,
		content: fileContent.slice(match[0].length).trim(),
	};
}

export function serializeFrontmatter(
	metadata: Record<string, FrontmatterValue | undefined>,
): string {
	const lines = Object.entries(metadata)
		.filter(([, value]) => value !== undefined && value !== "")
		.map(([key, value]) =>
			typeof value === "boolean"
				? `${key}: ${value}`
				: `${key}: ${JSON.stringify(value)}`,
		);
	return `---\n${lines.join("\n")}\n---\n`;
}

/* -------------------------------------------------------------------------- */
/*                                    Blog                                    */
/* -------------------------------------------------------------------------- */

function listMdxFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((file) => !file.startsWith(".") && path.extname(file) === ".mdx");
}

function toPostMetadata(raw: Record<string, FrontmatterValue>): PostMetadata {
	return {
		title: String(raw.title ?? ""),
		publishedAt: String(raw.publishedAt ?? ""),
		summary: raw.summary ? String(raw.summary) : undefined,
		image: raw.image ? String(raw.image) : undefined,
		draft: raw.draft === true,
	};
}

export function isValidSlug(slug: string): boolean {
	return SLUG_PATTERN.test(slug);
}

export function postFilePath(slug: string): string {
	if (!isValidSlug(slug)) {
		throw new Error(`Invalid slug: ${slug}`);
	}
	const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
	if (!filePath.startsWith(BLOG_DIR + path.sep)) {
		throw new Error(`Invalid slug: ${slug}`);
	}
	return filePath;
}

export function readPost(slug: string): Post | undefined {
	if (!isValidSlug(slug)) return undefined;
	const filePath = postFilePath(slug);
	if (!fs.existsSync(filePath)) return undefined;
	const { metadata, content } = parseFrontmatter(
		fs.readFileSync(filePath, "utf-8"),
	);
	return { slug, metadata: toPostMetadata(metadata), content };
}

function byNewest(a: Post, b: Post): number {
	return (
		new Date(b.metadata.publishedAt).getTime() -
		new Date(a.metadata.publishedAt).getTime()
	);
}

export function getBlogPosts(
	options: { includeDrafts?: boolean } = {},
): Post[] {
	const posts = listMdxFiles(BLOG_DIR)
		.map((file) => readPost(path.basename(file, ".mdx")))
		.filter((post): post is Post => post !== undefined);

	return posts
		.filter((post) => options.includeDrafts || !post.metadata.draft)
		.sort(byNewest);
}

export function getBlogPost(
	slug: string,
	options: { includeDrafts?: boolean } = {},
): Post | undefined {
	const post = readPost(slug);
	if (!post) return undefined;
	if (post.metadata.draft && !options.includeDrafts) return undefined;
	return post;
}

export function writePost(
	slug: string,
	metadata: PostMetadata,
	content: string,
): void {
	const filePath = postFilePath(slug);
	fs.mkdirSync(BLOG_DIR, { recursive: true });
	const frontmatter = serializeFrontmatter({
		title: metadata.title,
		publishedAt: metadata.publishedAt,
		summary: metadata.summary,
		image: metadata.image,
		draft: metadata.draft ? true : undefined,
	});
	fs.writeFileSync(filePath, `${frontmatter}\n${content.trim()}\n`, "utf-8");
}

export function postExists(slug: string): boolean {
	return isValidSlug(slug) && fs.existsSync(postFilePath(slug));
}

export function renamePost(fromSlug: string, toSlug: string): void {
	fs.renameSync(postFilePath(fromSlug), postFilePath(toSlug));
}

export function deletePost(slug: string): void {
	fs.rmSync(postFilePath(slug), { force: true });
}

/* -------------------------------------------------------------------------- */
/*                                    Books                                   */
/* -------------------------------------------------------------------------- */

export function getBooks(): Book[] {
	return listMdxFiles(BOOKS_DIR).map((file) => {
		const { metadata } = parseFrontmatter(
			fs.readFileSync(path.join(BOOKS_DIR, file), "utf-8"),
		);
		return {
			slug: path.basename(file, ".mdx"),
			metadata: {
				title: String(metadata.title ?? ""),
				image: metadata.image ? String(metadata.image) : undefined,
			},
		};
	});
}

export { countWords, formatDate, slugify } from "./text";
