"use client";

import posthog from "posthog-js";
import type { ComponentPropsWithoutRef } from "react";

/** An external link that sends a PostHog event when clicked. */
export function TrackedLink({
	href,
	event,
	properties,
	onClick,
	...props
}: ComponentPropsWithoutRef<"a"> & {
	href: string;
	event: string;
	properties?: Record<string, unknown>;
}) {
	return (
		<a
			{...props}
			href={href}
			onClick={(e) => {
				posthog.capture(event, { url: href, ...properties });
				onClick?.(e);
			}}
		/>
	);
}
