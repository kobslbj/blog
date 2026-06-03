import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { highlight } from "sugar-high";

function Table({ data }) {
	const headers = data.headers.map((header, index) => (
		<th key={index}>{header}</th>
	));
	const rows = data.rows.map((row, index) => (
		<tr key={index}>
			{row.map((cell, cellIndex) => (
				<td key={cellIndex}>{cell}</td>
			))}
		</tr>
	));

	return (
		<table>
			<thead>
				<tr>{headers}</tr>
			</thead>
			<tbody>{rows}</tbody>
		</table>
	);
}

function CustomLink(props) {
	const href = props.href;

	if (href.startsWith("/")) {
		return (
			<Link href={href} {...props}>
				{props.children}
			</Link>
		);
	}

	if (href.startsWith("#")) {
		return <a {...props} />;
	}

	return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
	return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

function YouTube({ id, start, title = "YouTube video player" }) {
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

function Code({ children, ...props }) {
	const codeHTML = highlight(children);
	return (
		<code
			// biome-ignore lint/security/noDangerouslySetInnerHtml: sugar-high library output is safe
			dangerouslySetInnerHTML={{ __html: codeHTML }}
			{...props}
		/>
	);
}

function slugify(str) {
	return str
		.toString()
		.toLowerCase()
		.trim() // Remove whitespace from both ends of a string
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/[^\w-]+/g, "") // Remove all non-word characters except for -
		.replace(/--+/g, "-"); // Replace multiple - with single -
}

function createHeading(level) {
	const Heading = ({ children }) => {
		const slug = slugify(children);
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

const components = {
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

export function CustomMDX(props) {
	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
		/>
	);
}
