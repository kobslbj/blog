import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";

type MDXComponents = NonNullable<MDXRemoteProps["components"]>;

import React, { type ComponentPropsWithoutRef, type ReactNode } from "react";
import remarkCjkFriendly from "remark-cjk-friendly";
import { highlight } from "sugar-high";

type TableData = {
	headers: ReactNode[];
	rows: ReactNode[][];
};

function Table({ data }: { data: TableData }) {
	return (
		<table>
			<thead>
				<tr>
					{data.headers.map((header, index) => (
						<th key={index}>{header}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.rows.map((row, index) => (
					<tr key={index}>
						{row.map((cell, cellIndex) => (
							<td key={cellIndex}>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function CustomLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
	if (href.startsWith("/")) {
		return <Link href={href} {...props} />;
	}

	if (href.startsWith("#")) {
		return <a href={href} {...props} />;
	}

	return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props: ImageProps) {
	return <Image className="rounded-lg" {...props} />;
}

function YouTube({
	id,
	start,
	title = "YouTube video player",
}: {
	id: string;
	start?: number;
	title?: string;
}) {
	const params = new URLSearchParams();
	if (start) {
		params.set("start", String(start));
	}
	const query = params.toString();
	const src = `https://www.youtube-nocookie.com/embed/${id}${query ? `?${query}` : ""}`;

	return (
		<div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg">
			<iframe
				className="absolute inset-0 h-full w-full"
				src={src}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
			/>
		</div>
	);
}

function Code({ children, ...props }: ComponentPropsWithoutRef<"code">) {
	if (typeof children !== "string") {
		return <code {...props}>{children}</code>;
	}
	const codeHTML = highlight(children);
	return (
		<code
			// biome-ignore lint/security/noDangerouslySetInnerHtml: sugar-high library output is safe
			dangerouslySetInnerHTML={{ __html: codeHTML }}
			{...props}
		/>
	);
}

function textOf(node: ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	if (React.isValidElement<{ children?: ReactNode }>(node)) {
		return textOf(node.props.children);
	}
	return "";
}

function slugifyHeading(node: ReactNode): string {
	return textOf(node)
		.toLowerCase()
		.trim()
		.replace(/&/g, "-and-")
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
	const Heading = ({ children }: { children?: ReactNode }) => {
		const slug = slugifyHeading(children);
		return React.createElement(
			`h${level}`,
			{ id: slug },
			[
				React.createElement("a", {
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "anchor",
				}),
			],
			children,
		);
	};

	Heading.displayName = `Heading${level}`;

	return Heading;
}

export const mdxComponents: MDXComponents = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: RoundedImage,
	a: CustomLink,
	code: Code,
	Table,
	YouTube,
};

// `**強調**` next to CJK punctuation (「」！，。) is not valid CommonMark emphasis without this plugin.
export const mdxOptions = {
	remarkPlugins: [remarkCjkFriendly],
};

export function CustomMDX(props: MDXRemoteProps) {
	return (
		<MDXRemote
			{...props}
			options={{ ...props.options, mdxOptions }}
			components={{ ...mdxComponents, ...(props.components || {}) }}
		/>
	);
}
