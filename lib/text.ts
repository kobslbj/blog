// Pure string helpers shared by server and client code (no Node APIs here).

export function slugify(input: string): string {
	return input
		.normalize("NFKC")
		.toLowerCase()
		.trim()
		.replace(/&/g, "-and-")
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
}

export function formatDate(date: string): string {
	if (!date) return "";
	const normalized = date.includes("T") ? date : `${date}T00:00:00`;
	return new Date(normalized).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

const CJK =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;

/** Counts CJK characters individually and everything else by whitespace-separated token. */
export function countWords(text: string): number {
	const stripped = text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_`~[\]()!-]/g, " ");
	const cjk = stripped.match(CJK)?.length ?? 0;
	const latin = stripped.replace(CJK, " ").split(/\s+/).filter(Boolean).length;
	return cjk + latin;
}

export function readingTime(words: number): string {
	return `${Math.max(1, Math.round(words / 220))} min read`;
}
