export const siteConfig = {
	name: "Justin Li",
	author: "Justin Li",
	description:
		"Justin Li's blog about building startups, AI, and what I'm learning along the way.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://justinli.blog",
	email: "kobs666666@gmail.com",
	avatar: "/images/justin.jpg",
	bio: "Product builder from Taiwan 🇹🇼. Writing about startups and what I'm learning along the way.",
	x: "https://x.com/juuuustin__00",
	// giscus stores comments as GitHub Discussions on the blog repo.
	// These IDs are public (they appear in the giscus <script> tag); regenerate at https://giscus.app if the repo moves.
	giscus: {
		repo: "kobslbj/blog" as `${string}/${string}`,
		repoId: "R_kgDOQ5e82Q",
		category: "Announcements",
		categoryId: "DIC_kwDOQ5e82c4DFb-n",
	},
};

export const baseUrl = siteConfig.url;
