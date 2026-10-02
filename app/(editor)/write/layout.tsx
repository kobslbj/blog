import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
	title: { absolute: "Write" },
	robots: { index: false, follow: false },
};

// The editor writes MDX files to disk, so it only exists while running `next dev`.
export default function WriteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}
	return <div className="min-h-screen">{children}</div>;
}
