import { AboutItem, type AboutPhoto } from "app/components/about-item";

export const metadata = {
	title: "About",
	description: "About me",
};

const portrait = { width: 1350, height: 1800 };

const photos: Record<string, AboutPhoto[]> = {
	hackathon: [
		{
			src: "/images/about/hackathon-award.jpg",
			alt: "Receiving the 1st place award from Chunghwa Telecom",
			width: 1800,
			height: 1013,
		},
		{
			src: "/images/about/hackathon-pitch.jpg",
			alt: "Pitching Deeptector to the Chunghwa Telecom judges",
			width: 1800,
			height: 1200,
		},
		{
			src: "/images/about/hackathon-deeptector.jpg",
			alt: "Deeptector title slide on the judges' screen",
			width: 1800,
			height: 1013,
		},
	],
	nycu: [
		{
			src: "/images/about/nycu-graduation.jpg",
			alt: "Graduation day at NYCU with classmates",
			width: 1800,
			height: 1200,
		},
	],
	jgp: [
		{
			src: "/images/about/jgp.jpg",
			alt: "Holding the Jamie's Gap Year Program sign with Jamie at AppWorks",
			...portrait,
		},
	],
	appier: [
		{
			src: "/images/about/appier-office.jpg",
			alt: "Standing next to the Appier robot at the Appier office",
			...portrait,
		},
		{
			src: "/images/about/appier-team.jpg",
			alt: "Group photo with the Appier team",
			...portrait,
		},
	],
	appworksBackend: [
		{
			src: "/images/about/appworks-backend.jpg",
			alt: "AppWorks School backend class group photo",
			...portrait,
		},
	],
	appworksFrontend: [
		{
			src: "/images/about/appworks-frontend.jpg",
			alt: "AppWorks School frontend class group photo",
			width: 1800,
			height: 1350,
		},
	],
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">About</h1>

			<div className="prose prose-neutral dark:prose-invert">
				<h2 className="font-semibold text-xl mb-4 tracking-tight">Awards</h2>

				<ul className="space-y-4 mb-8">
					<AboutItem
						title="2024 Hsinchu × Meichu Hackathon"
						subtitle="1st Place, Chunghwa Telecom Track"
						date="2024"
						photos={photos.hackathon}
						scan
					>
						Built{" "}
						<span className="bg-linear-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text font-semibold text-transparent">
							Deeptector
						</span>
						, a Chrome extension that helps X users spot misinformation and
						AI-generated images.
					</AboutItem>
				</ul>

				<h2 className="font-semibold text-xl mb-4 tracking-tight">Education</h2>

				<ul className="space-y-4 mb-8">
					<AboutItem
						title="National Yang Ming Chiao Tung University"
						subtitle="M.S. Institute of Artificial Intelligence Innovation"
						date="Quit school"
						dateItalic
					/>
					<AboutItem
						title="National Yang Ming Chiao Tung University"
						subtitle="B.S. Information Management and Finance"
						date="Sep 2021 – Jun 2025"
						photos={photos.nycu}
					/>
				</ul>

				<h2 className="font-semibold text-xl mb-4 tracking-tight">
					Experience
				</h2>

				<ul className="space-y-4">
					<AboutItem
						title="Jamie's Gap Year Program #3"
						date="Aug 2025 – Aug 2026"
						photos={photos.jgp}
					/>
					<AboutItem
						title="Military Service, ROC Army 254T"
						date="Jan 2026 – May 2026"
					/>
					<AboutItem
						title="Appier Technical Solutions Intern"
						date="Nov 2024 – Jun 2025"
						photos={photos.appier}
					/>
					<AboutItem
						title="NYCU GDSC Tech Team - Full Stack Lead"
						date="Sep 2024 – Jun 2025"
					/>
					<AboutItem
						title="LnData Web Development Intern"
						date="Jan 2024 – Aug 2024"
					/>
					<AboutItem
						title="AppWorks School Campus Backend trainee"
						date="Sep 2023 – Jan 2024"
						photos={photos.appworksBackend}
					/>
					<AboutItem
						title="AppWorks School Campus Frontend trainee"
						date="Jul 2023 – Aug 2023"
						photos={photos.appworksFrontend}
					/>
				</ul>
			</div>
		</section>
	);
}
