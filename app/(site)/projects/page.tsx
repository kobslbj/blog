import Image from "next/image";

export const metadata = {
	title: "Projects",
	description: "iOS apps I've built and shipped.",
};

type Project = {
	name: string;
	tagline: string;
	icon: string;
	website: string;
	appStore: string;
	description: string[];
	facts: string[];
	screens: { src: string; alt: string }[];
};

const projects: Project[] = [
	{
		name: "67",
		tagline: "An app blocker for doomscrolling.",
		icon: "/images/projects/67-icon.png",
		website: "https://www.do67.app/",
		appStore: "https://apps.apple.com/app/id6813799876",
		description: [
			"67 blocks the apps you open without thinking, like TikTok, Instagram, and Threads.",
			"To get back in, you do the 6-7 gesture on camera ten times: one hand up, the other down. That earns you five minutes, and then the block comes back on its own.",
		],
		facts: ["Free for one app", "No ads", "No account", "Chrome extension"],
		screens: [
			{ src: "/images/projects/67-wall.jpg", alt: "67 blocking Threads" },
			{
				src: "/images/projects/67-camera.jpg",
				alt: "Doing the 67 gesture on camera",
			},
			{ src: "/images/projects/67-home.jpg", alt: "67 home screen" },
		],
	},
	{
		name: "Halo",
		tagline: "A digital business card and AI personal CRM.",
		icon: "/images/projects/halo-icon.png",
		website: "https://www.halocards.app/",
		appStore: "https://apps.apple.com/app/id6787860052",
		description: [
			"Halo lets you share your business card with a QR code or a link. Anyone can open it in a browser, without the app.",
			"When someone hands you a paper card, you scan it and AI fills in the contact. Everyone you meet lands in one inbox, with where you met and what mattered.",
		],
		facts: ["Free to share", "AI card scanning", "Web card at halocards.app"],
		screens: [
			{ src: "/images/projects/halo-card.jpg", alt: "Halo digital card" },
			{
				src: "/images/projects/halo-scan.jpg",
				alt: "Scanning a paper business card",
			},
			{ src: "/images/projects/halo-share.jpg", alt: "Sharing a card by QR" },
			{ src: "/images/projects/halo-inbox.jpg", alt: "Contacts inbox" },
		],
	},
];

function Phone({ src, alt }: { src: string; alt: string }) {
	return (
		<div className="w-40 shrink-0 snap-start rounded-[1.75rem] bg-neutral-900 p-1.5 shadow-sm ring-1 ring-neutral-200 sm:w-44 dark:ring-neutral-700">
			<div className="overflow-hidden rounded-[1.4rem] bg-black">
				<Image
					src={src}
					alt={alt}
					width={750}
					height={1631}
					sizes="176px"
					className="block h-auto w-full scale-[1.02]"
				/>
			</div>
		</div>
	);
}

function ProjectSection({ project }: { project: Project }) {
	return (
		<article className="mb-20">
			<div className="mb-6 flex items-center gap-4">
				<Image
					src={project.icon}
					alt={`${project.name} app icon`}
					width={64}
					height={64}
					className="h-16 w-16 rounded-[22%] ring-1 ring-neutral-200 dark:ring-neutral-800"
				/>
				<div>
					<h2 className="text-xl font-semibold tracking-tight">
						{project.name}
					</h2>
					<p className="text-neutral-600 dark:text-neutral-400">
						{project.tagline}
					</p>
				</div>
			</div>

			<div className="-mx-2 mb-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3">
				{project.screens.map((screen) => (
					<Phone key={screen.src} {...screen} />
				))}
			</div>

			{project.description.map((paragraph) => (
				<p key={paragraph} className="mb-4">
					{paragraph}
				</p>
			))}

			<ul className="mb-6 flex flex-wrap gap-2">
				{project.facts.map((fact) => (
					<li
						key={fact}
						className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
					>
						{fact}
					</li>
				))}
			</ul>

			<div className="flex flex-wrap gap-3 text-sm">
				<a
					href={project.appStore}
					target="_blank"
					rel="noopener noreferrer"
					className="rounded-full bg-black px-4 py-2 font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
				>
					Download on the App Store
				</a>
				<a
					href={project.website}
					target="_blank"
					rel="noopener noreferrer"
					className="rounded-full border border-neutral-200 px-4 py-2 font-medium transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
				>
					{new URL(project.website).hostname.replace("www.", "")} ↗
				</a>
			</div>
		</article>
	);
}

export default function Page() {
	return (
		<section>
			<h1 className="mb-4 text-2xl font-semibold tracking-tighter">
				Things I've built
			</h1>
			<p className="mb-12 text-neutral-600 dark:text-neutral-400">
				iOS apps I designed, built, and shipped.
			</p>
			{projects.map((project) => (
				<ProjectSection key={project.name} project={project} />
			))}
		</section>
	);
}
