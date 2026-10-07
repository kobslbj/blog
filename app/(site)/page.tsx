import { BlogPosts } from "app/components/posts";

export default function Page() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				Who am I?
			</h1>
			<p className="mb-4">{`I'm Justin Li, a product builder from Taiwan 🇹🇼.`}</p>
			<p className="mb-4">
				{`This blog is where I share what I'm learning about startups.`}
			</p>
			<p className="mb-4">
				{`Always happy to connect with founders and curious builders.`}
			</p>
			<p className="mb-4">
				<a
					href="mailto:kobs666666@gmail.com"
					className="underline hover:opacity-70"
				>
					kobs666666@gmail.com
				</a>
			</p>

			<h2 className="mt-12 mb-8 text-2xl font-semibold tracking-tighter">
				Why I write
			</h2>
			<p className="mb-4">{`I believe words quietly shape people.`}</p>
			<p className="mb-4">{`In the AI era, writing keeps things human.`}</p>
			<p className="mb-4">{`It helps me sort out my own thinking.`}</p>
			<p className="mb-4">
				{`And sometimes it reaches someone and starts a connection.`}
			</p>

			<div className="my-8">
				<BlogPosts />
			</div>
		</section>
	);
}
