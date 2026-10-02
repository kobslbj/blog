"use client";

import { useEffect, useState } from "react";

function formatViews(views: number): string {
	return new Intl.NumberFormat("en-US", {
		notation: views >= 10_000 ? "compact" : "standard",
		maximumFractionDigits: 1,
	}).format(views);
}

/**
 * Shows how many times a post has been opened.
 * Counts once per browser session per post, and renders nothing until a number is available
 * (so it stays invisible when the view store isn't configured).
 */
export function ViewCounter({
	slug,
	prefix,
}: {
	slug: string;
	/** Rendered before the count, e.g. a " · " separator, only once a number is shown. */
	prefix?: string;
}) {
	const [views, setViews] = useState<number | null>(null);

	useEffect(() => {
		const storageKey = `viewed:${slug}`;
		let alreadyCounted = false;
		try {
			alreadyCounted = sessionStorage.getItem(storageKey) === "1";
		} catch {
			// sessionStorage can be unavailable (private mode); count anyway.
		}

		const controller = new AbortController();
		fetch(`/api/views/${encodeURIComponent(slug)}`, {
			method: alreadyCounted ? "GET" : "POST",
			signal: controller.signal,
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((data: { views: number | null } | null) => {
				if (data && typeof data.views === "number") {
					setViews(data.views);
					try {
						sessionStorage.setItem(storageKey, "1");
					} catch {}
				}
			})
			.catch(() => {});

		return () => controller.abort();
	}, [slug]);

	if (views === null) return null;

	return (
		<span>
			{prefix}
			{formatViews(views)} {views === 1 ? "view" : "views"}
		</span>
	);
}
