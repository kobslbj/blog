"use client";

import Giscus from "@giscus/react";
import { siteConfig } from "lib/site";

/** GitHub Discussions-backed comments via giscus. Readers sign in with GitHub to comment or react. */
export function Comments() {
	const { repo, repoId, category, categoryId } = siteConfig.giscus;
	return (
		<section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
			<Giscus
				repo={repo}
				repoId={repoId}
				category={category}
				categoryId={categoryId}
				mapping="pathname"
				strict="1"
				reactionsEnabled="1"
				emitMetadata="0"
				inputPosition="top"
				theme="preferred_color_scheme"
				lang="en"
				loading="lazy"
			/>
		</section>
	);
}
