import { BlogPosts } from "app/components/posts";

export default function Page() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				Who am I?
			</h1>
			<p className="mb-4">{`I'm Justin Li, a builder from Taiwan 🇹🇼.`}</p>
			<p className="mb-4">
				{`I'm interested in how AI can automate the operational work that keeps global trade moving.`}
			</p>
			<p className="mb-4">
				{`Right now, I'm building AI operations agents for customs brokers and freight forwarders, turning messy communication and workflows into structured, executable processes.`}
			</p>
			<p className="mb-4">
				{`This blog is where I share what I'm learning about startups.`}
			</p>
			<p className="mb-4">
				{`Always happy to connect with founders, operators, and curious builders.`}
			</p>
			<p className="mb-4">
				<a
					href="mailto:kobs666666@gmail.com"
					className="underline hover:opacity-70"
				>
					kobs666666@gmail.com
				</a>
			</p>

			<div className="my-8">
				<BlogPosts />
			</div>
		</section>
	);
}
