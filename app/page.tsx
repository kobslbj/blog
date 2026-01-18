import { BlogPosts } from "app/components/posts";

export default function Page() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				Who am I ?
			</h1>
			<p className="mb-4">
				{`I'm Justin. I'm building a startup. I work on products because they're interesting, and sometimes they make the world a little better.`}
			</p>

			<p className="mb-4">
				{`I'm currently open for freelance projects. If you have any needs, feel free to reach out. I'm also open to startup collaborations or just chatting about ideas — welcome to connect!`}
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
