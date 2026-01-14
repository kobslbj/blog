export const metadata = {
	title: "About",
	description: "About me",
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">About</h1>

			<div className="prose prose-neutral dark:prose-invert">
				<h2 className="font-semibold text-xl mb-4 tracking-tight">Education</h2>

				<ul className="space-y-4 mb-8">
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								National Yang Ming Chiao Tung University
							</span>
							<span className="text-neutral-600 dark:text-neutral-400">
								M.S. Institute of Artificial Intelligence Innovation
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm italic">
								Quit school
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								National Yang Ming Chiao Tung University
							</span>
							<span className="text-neutral-600 dark:text-neutral-400">
								B.S. Information Management and Finance
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Sep 2021 – Jun 2025
							</span>
						</div>
					</li>
				</ul>

				<h2 className="font-semibold text-xl mb-4 tracking-tight">
					Experience
				</h2>

				<ul className="space-y-4">
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								Jamie's Gap Year Program #3
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Aug 2025 – Now
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								Appier Technical Solutions Intern
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Nov 2024 – Jun 2025
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								NYCU GDSC Tech Team - Full Stack Lead
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Sep 2024 – Jun 2025
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								LnData Web Development Intern
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Jan 2024 – Aug 2024
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								AppWorks School Campus Backend trainee
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Sep 2023 – Jan 2024
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col">
							<span className="text-neutral-900 dark:text-neutral-100 font-medium">
								AppWorks School Campus Frontend trainee
							</span>
							<span className="text-neutral-500 dark:text-neutral-500 text-sm">
								Jul 2023 – Aug 2023
							</span>
						</div>
					</li>
				</ul>
			</div>
		</section>
	);
}
