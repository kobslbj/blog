"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type PostInfo = {
	slug: string;
	title: string;
	words: number;
	language: "zh" | "en";
	/** Element id of the post body; read depth is measured against it. */
	bodyId: string;
};

const DEPTHS = [25, 50, 75, 100] as const;
// Readers who stop scrolling, typing or moving for this long count as away.
const IDLE_AFTER_MS = 30_000;
// Reaching the end only counts as a read after this much engaged time.
const MIN_READ_SECONDS = 30;

/**
 * Tracks how a post is read: scroll depth milestones, a "read complete" event,
 * engaged reading time, and clicks on outbound links. Renders nothing.
 */
export function PostAnalytics({
	slug,
	title,
	words,
	language,
	bodyId,
}: PostInfo) {
	useEffect(() => {
		const props = {
			post_slug: slug,
			post_title: title,
			post_words: words,
			post_language: language,
		};
		const reached = new Set<number>();
		let completed = false;
		let engagedMs = 0;
		let reportedMs = 0;
		let lastActive = Date.now();
		let lastTick = Date.now();

		const seconds = () => Math.round(engagedMs / 1000);

		const tick = () => {
			const now = Date.now();
			if (
				document.visibilityState === "visible" &&
				now - lastActive < IDLE_AFTER_MS
			) {
				engagedMs += now - lastTick;
			}
			lastTick = now;
		};

		const maybeComplete = () => {
			if (completed || !reached.has(100) || seconds() < MIN_READ_SECONDS)
				return;
			completed = true;
			posthog.capture("post_read_complete", {
				...props,
				engaged_seconds: seconds(),
			});
		};

		const measureDepth = () => {
			const body = document.getElementById(bodyId);
			if (!body) return;
			const rect = body.getBoundingClientRect();
			const read = Math.min(
				1,
				Math.max(0, (window.innerHeight - rect.top) / rect.height),
			);
			for (const depth of DEPTHS) {
				if (read * 100 >= depth && !reached.has(depth)) {
					reached.add(depth);
					posthog.capture("post_read_progress", { ...props, depth });
				}
			}
			maybeComplete();
		};

		// Sends the engaged time gained since the last report, e.g. each time the tab is hidden.
		const reportTime = () => {
			tick();
			const delta = Math.round((engagedMs - reportedMs) / 1000);
			if (delta < 1) return;
			reportedMs = engagedMs;
			posthog.capture(
				"post_engaged_time",
				{
					...props,
					engaged_seconds: delta,
					total_engaged_seconds: seconds(),
					max_depth: Math.max(0, ...reached),
				},
				{ transport: "sendBeacon" },
			);
		};

		const onActivity = () => {
			tick();
			lastActive = Date.now();
		};
		const onScroll = () => {
			onActivity();
			measureDepth();
		};
		const onVisibility = () => {
			if (document.visibilityState === "hidden") {
				reportTime();
			} else {
				lastTick = Date.now();
				lastActive = Date.now();
			}
		};
		const onClick = (event: MouseEvent) => {
			const link = (event.target as Element | null)?.closest?.("a[href]");
			if (!(link instanceof HTMLAnchorElement)) return;
			const url = new URL(link.href, window.location.href);
			if (url.origin === window.location.origin) return;
			posthog.capture("outbound_link_clicked", {
				...props,
				url: url.href,
				domain: url.hostname,
				link_text: link.textContent?.trim().slice(0, 100),
			});
		};

		const timer = window.setInterval(() => {
			tick();
			maybeComplete();
		}, 5_000);
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("pointermove", onActivity, { passive: true });
		window.addEventListener("keydown", onActivity);
		window.addEventListener("pagehide", reportTime);
		document.addEventListener("visibilitychange", onVisibility);
		document.addEventListener("click", onClick, { capture: true });
		measureDepth();

		return () => {
			// Client-side navigation away from the post.
			reportTime();
			window.clearInterval(timer);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("pointermove", onActivity);
			window.removeEventListener("keydown", onActivity);
			window.removeEventListener("pagehide", reportTime);
			document.removeEventListener("visibilitychange", onVisibility);
			document.removeEventListener("click", onClick, { capture: true });
		};
	}, [slug, title, words, language, bodyId]);

	return null;
}
