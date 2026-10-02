import { getBlogPost } from "lib/content";
import { getViews, incrementViews, viewsEnabled } from "lib/views";
import { type NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ slug: string }> };

function resolveSlug(raw: string): string | null {
	const slug = decodeURIComponent(raw);
	return getBlogPost(slug) ? slug : null;
}

export async function GET(_request: NextRequest, { params }: Context) {
	const slug = resolveSlug((await params).slug);
	if (!slug) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	if (!viewsEnabled()) {
		return NextResponse.json({ views: null });
	}
	return NextResponse.json(
		{ views: await getViews(slug) },
		{ headers: { "Cache-Control": "no-store" } },
	);
}

export async function POST(_request: NextRequest, { params }: Context) {
	const slug = resolveSlug((await params).slug);
	if (!slug) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	if (!viewsEnabled()) {
		return NextResponse.json({ views: null });
	}
	// Previewing locally shouldn't inflate the numbers.
	const views =
		process.env.NODE_ENV === "production"
			? await incrementViews(slug)
			: await getViews(slug);
	return NextResponse.json(
		{ views },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
