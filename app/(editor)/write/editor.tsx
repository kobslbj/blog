"use client";

import type { Post } from "lib/content";
import { countWords, formatDate, readingTime } from "lib/text";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	type ChangeEvent,
	type ClipboardEvent,
	type DragEvent,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	deletePost,
	type PostInput,
	renamePost,
	renderPreview,
	savePost,
	setPublished,
	uploadImage,
} from "./actions";

type SaveState = "saved" | "dirty" | "saving" | "error";
type View = "write" | "split" | "preview";

const AUTOSAVE_DELAY = 900;
const PREVIEW_DELAY = 400;

/* ------------------------------ small helpers ------------------------------ */

function useAutoHeight(
	ref: React.RefObject<HTMLTextAreaElement | null>,
	value: string,
) {
	// Fallback for browsers without `field-sizing: content`.
	// biome-ignore lint/correctness/useExhaustiveDependencies: `value` is the trigger, the DOM is the source
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || "fieldSizing" in el.style) return;
		el.style.height = "0px";
		el.style.height = `${el.scrollHeight}px`;
	}, [ref, value]);
}

function clock(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

type Selection = { start: number; end: number };

function lineStart(text: string, index: number): number {
	return text.lastIndexOf("\n", index - 1) + 1;
}

/* --------------------------------- Editor ---------------------------------- */

export function Editor({ post }: { post: Post }) {
	const router = useRouter();
	const [slug, setSlug] = useState(post.slug);
	const [draft, setDraft] = useState(post.metadata.draft ?? true);
	const [form, setForm] = useState<PostInput>({
		title: post.metadata.title,
		summary: post.metadata.summary ?? "",
		publishedAt: post.metadata.publishedAt,
		image: post.metadata.image ?? "",
		content: post.content,
	});
	const [saveState, setSaveState] = useState<SaveState>("saved");
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [view, setView] = useState<View>("write");
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<{ node: ReactNode; error?: string }>({
		node: null,
	});

	const formRef = useRef(form);
	const slugRef = useRef(slug);
	const versionRef = useRef(0);
	const savedVersionRef = useRef(0);
	// Set while a publish or rename may move the file, so autosave doesn't write to the old slug.
	const busyRef = useRef(false);
	const titleRef = useRef<HTMLTextAreaElement>(null);
	const bodyRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const pendingSelection = useRef<Selection | null>(null);

	formRef.current = form;
	slugRef.current = slug;

	useAutoHeight(titleRef, form.title);
	useAutoHeight(bodyRef, form.content);

	const update = useCallback((patch: Partial<PostInput>) => {
		versionRef.current += 1;
		setForm((prev) => ({ ...prev, ...patch }));
		setSaveState("dirty");
	}, []);

	/* ------------------------------- autosave ------------------------------ */

	const save = useCallback(async () => {
		if (busyRef.current) return;
		const version = versionRef.current;
		setSaveState("saving");
		const result = await savePost(slugRef.current, formRef.current);
		if (!result.ok) {
			setSaveState("error");
			setNotice(result.error);
			return;
		}
		savedVersionRef.current = version;
		setSavedAt(new Date(result.savedAt));
		setSaveState(versionRef.current === version ? "saved" : "dirty");
	}, []);

	// Saves anything typed while autosave was paused for a publish or rename.
	const saveIfDirty = useCallback(() => {
		if (versionRef.current !== savedVersionRef.current) save();
	}, [save]);

	const moveTo = useCallback((next: string) => {
		slugRef.current = next;
		setSlug(next);
		// router.replace would remount the editor from disk (it's keyed by slug) and drop unsaved edits.
		window.history.replaceState(null, "", `/write/${next}`);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: every edit to `form` restarts the autosave timer
	useEffect(() => {
		if (saveState !== "dirty") return;
		const timer = setTimeout(save, AUTOSAVE_DELAY);
		return () => clearTimeout(timer);
	}, [saveState, form, save]);

	useEffect(() => {
		const warn = (event: BeforeUnloadEvent) => {
			if (versionRef.current !== savedVersionRef.current) {
				event.preventDefault();
			}
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, []);

	/* -------------------------------- preview ------------------------------ */

	useEffect(() => {
		if (view === "write") return;
		let cancelled = false;
		const timer = setTimeout(async () => {
			const result = await renderPreview(form.content);
			if (cancelled) return;
			setPreview(
				result.ok ? { node: result.node } : { node: null, error: result.error },
			);
		}, PREVIEW_DELAY);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [view, form.content]);

	/* ------------------------------ formatting ----------------------------- */

	// biome-ignore lint/correctness/useExhaustiveDependencies: restore the caret after `form.content` is committed
	useLayoutEffect(() => {
		const sel = pendingSelection.current;
		const el = bodyRef.current;
		if (sel && el) {
			el.focus();
			el.setSelectionRange(sel.start, sel.end);
			pendingSelection.current = null;
		}
	}, [form.content]);

	const wrapSelection = useCallback(
		(before: string, after: string, placeholder: string) => {
			const el = bodyRef.current;
			if (!el) return;
			const { selectionStart, selectionEnd, value } = el;
			// Markdown ignores `**text **`, so whitespace at the edges of the selection stays outside the markers.
			const raw = value.slice(selectionStart, selectionEnd);
			const leading = raw.length - raw.trimStart().length;
			const trailing = raw.length - raw.trimEnd().length;
			const start = selectionStart + leading;
			const end = selectionEnd - trailing;
			const selected = value.slice(start, end) || placeholder;
			const next =
				value.slice(0, start) + before + selected + after + value.slice(end);
			pendingSelection.current = {
				start: start + before.length,
				end: start + before.length + selected.length,
			};
			update({ content: next });
		},
		[update],
	);

	const prefixLine = useCallback(
		(prefix: string) => {
			const el = bodyRef.current;
			if (!el) return;
			const { selectionStart: start, selectionEnd: end, value } = el;
			const from = lineStart(value, start);
			const to = value.indexOf("\n", end);
			const block = value.slice(from, to === -1 ? value.length : to);
			const lines = block.split("\n");
			const allPrefixed = lines.every((line) => line.startsWith(prefix));
			const nextLines = lines.map((line) =>
				allPrefixed
					? line.slice(prefix.length)
					: prefix + line.replace(/^(#{1,6} |> )/, ""),
			);
			const nextBlock = nextLines.join("\n");
			const next =
				value.slice(0, from) +
				nextBlock +
				value.slice(to === -1 ? value.length : to);
			pendingSelection.current = { start: from, end: from + nextBlock.length };
			update({ content: next });
		},
		[update],
	);

	const insertBlock = useCallback(
		(text: string, cursorOffset?: number) => {
			const el = bodyRef.current;
			if (!el) return;
			const { selectionStart: start, value } = el;
			const head = value.slice(0, start);
			const tail = value.slice(start);
			// Blocks need a blank line on each side, otherwise Markdown folds them into the neighbouring paragraph.
			const gapBefore =
				head.length === 0 || head.endsWith("\n\n")
					? ""
					: head.endsWith("\n")
						? "\n"
						: "\n\n";
			const gapAfter =
				tail.length === 0
					? "\n"
					: tail.startsWith("\n\n")
						? ""
						: tail.startsWith("\n")
							? "\n"
							: "\n\n";
			const cursor =
				head.length + gapBefore.length + (cursorOffset ?? text.length);
			pendingSelection.current = { start: cursor, end: cursor };
			update({ content: head + gapBefore + text + gapAfter + tail });
		},
		[update],
	);

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		const mod = event.metaKey || event.ctrlKey;
		if (!mod) return;
		switch (event.key.toLowerCase()) {
			case "b":
				event.preventDefault();
				wrapSelection("**", "**", "bold");
				break;
			case "i":
				event.preventDefault();
				wrapSelection("*", "*", "italic");
				break;
			case "k":
				event.preventDefault();
				wrapSelection("[", "](https://)", "link text");
				break;
			case "s":
				event.preventDefault();
				if (versionRef.current !== savedVersionRef.current) save();
				break;
			case "p":
				if (event.shiftKey) {
					event.preventDefault();
					setView((v) => (v === "write" ? "split" : "write"));
				}
				break;
		}
	};

	/* -------------------------------- images ------------------------------- */

	const upload = useCallback(
		async (file: File, asCover = false) => {
			setUploading(true);
			const data = new FormData();
			data.set("file", file);
			data.set("slug", slugRef.current);
			let result: Awaited<ReturnType<typeof uploadImage>>;
			try {
				result = await uploadImage(data);
			} catch {
				// Next rejects bodies over serverActions.bodySizeLimit before the action runs.
				result = {
					ok: false,
					error: "Couldn't upload that image. Is it under 10 MB?",
				};
			} finally {
				setUploading(false);
			}
			if (!result.ok) {
				setNotice(result.error);
				return;
			}
			if (asCover) {
				update({ image: result.url });
			} else {
				insertBlock(`![${file.name.replace(/\.[^.]+$/, "")}](${result.url})`);
			}
		},
		[insertBlock, update],
	);

	const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const file = Array.from(event.clipboardData.files).find((f) =>
			f.type.startsWith("image/"),
		);
		if (file) {
			event.preventDefault();
			upload(file);
		}
	};

	const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
		const file = Array.from(event.dataTransfer.files).find((f) =>
			f.type.startsWith("image/"),
		);
		if (file) {
			event.preventDefault();
			upload(file);
		}
	};

	const handleFilePick = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) upload(file, event.target.dataset.cover === "true");
		event.target.value = "";
	};

	/* ------------------------------- publishing ---------------------------- */

	const togglePublish = async () => {
		setNotice(null);
		const publishing = draft;
		const version = versionRef.current;
		busyRef.current = true;
		setSaveState("saving");
		const result = await setPublished(
			slugRef.current,
			publishing,
			formRef.current,
		);
		busyRef.current = false;
		if (!result.ok) {
			setSaveState("dirty");
			setNotice(result.error);
			return;
		}
		savedVersionRef.current = version;
		setSavedAt(new Date());
		setDraft(!publishing);
		if (result.slug !== slugRef.current) moveTo(result.slug);
		if (versionRef.current === version) {
			setSaveState("saved");
		} else {
			save();
		}
	};

	/* -------------------------------- derived ------------------------------ */

	const words = countWords(form.content);
	const status =
		saveState === "saving"
			? "saving…"
			: saveState === "dirty"
				? "unsaved changes"
				: saveState === "error"
					? "couldn't save"
					: savedAt
						? `saved ${clock(savedAt)}`
						: "saved";

	const showWrite = view !== "preview";
	const showPreview = view !== "write";

	return (
		<div className="flex min-h-screen flex-col">
			{/* ------------------------------ top bar ------------------------------ */}
			<header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-black/90">
				<div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
					<Link
						href="/write"
						className="shrink-0 text-sm text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
					>
						← Posts
					</Link>

					<p className="min-w-0 flex-1 truncate text-center font-mono text-xs text-neutral-500">
						<span
							className={
								draft
									? "text-amber-600 dark:text-amber-400"
									: "text-emerald-700 dark:text-emerald-400"
							}
						>
							{draft ? "draft" : "published"}
						</span>
						{" · "}
						{words} words · {readingTime(words)} · {status}
						{uploading && " · uploading image…"}
					</p>

					<div className="flex shrink-0 items-center gap-1 sm:gap-2">
						{/* biome-ignore lint/a11y/useSemanticElements: a fieldset would bring default border/padding into the pill toggle */}
						<div
							role="group"
							aria-label="View"
							className="hidden items-center rounded-full border border-neutral-200 p-0.5 text-xs sm:flex dark:border-neutral-800"
						>
							{(["write", "split", "preview"] as View[]).map((option) => (
								<button
									key={option}
									type="button"
									onClick={() => setView(option)}
									aria-pressed={view === option}
									className={`rounded-full px-3 py-1 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
										view === option
											? "bg-neutral-900 text-white dark:bg-white dark:text-black"
											: "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
									}`}
								>
									{option}
								</button>
							))}
						</div>
						<button
							type="button"
							onClick={() =>
								setView((v) => (v === "write" ? "preview" : "write"))
							}
							className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 sm:hidden dark:border-neutral-800 dark:text-neutral-400"
						>
							{view === "write" ? "Preview" : "Write"}
						</button>
						<button
							type="button"
							onClick={() => setSettingsOpen((open) => !open)}
							aria-expanded={settingsOpen}
							className={`rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
								settingsOpen
									? "bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Settings
						</button>
						<button
							type="button"
							onClick={togglePublish}
							disabled={saveState === "saving"}
							className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
						>
							{draft ? "Publish" : "Unpublish"}
						</button>
					</div>
				</div>
			</header>

			{notice && (
				<div className="border-b border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
					<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2 text-sm">
						<span>{notice}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							className="underline"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}

			{settingsOpen && (
				<Settings
					slug={slug}
					form={form}
					draft={draft}
					update={update}
					onPickCover={() => {
						if (fileInputRef.current) {
							fileInputRef.current.dataset.cover = "true";
							fileInputRef.current.click();
						}
					}}
					onRename={async (next) => {
						busyRef.current = true;
						const result = await renamePost(slugRef.current, next);
						busyRef.current = false;
						if (result.ok) {
							moveTo(result.slug);
						} else {
							setNotice(result.error);
						}
						saveIfDirty();
					}}
					onDelete={async () => {
						const result = await deletePost(slug);
						if (!result.ok) {
							setNotice(result.error);
							return;
						}
						savedVersionRef.current = versionRef.current;
						router.push("/write");
					}}
				/>
			)}

			{/* ------------------------------- canvas ------------------------------ */}
			<div
				className={`mx-auto grid w-full flex-1 max-w-6xl ${
					view === "split"
						? "lg:grid-cols-2 lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800"
						: ""
				}`}
			>
				{showWrite && (
					<div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
						<textarea
							ref={titleRef}
							value={form.title}
							onChange={(e) =>
								update({ title: e.target.value.replace(/\n/g, "") })
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									bodyRef.current?.focus();
								}
							}}
							placeholder="Title"
							rows={1}
							aria-label="Title"
							className="editor-field mb-3 text-4xl font-semibold leading-tight tracking-tight"
						/>
						<textarea
							value={form.summary}
							onChange={(e) =>
								update({ summary: e.target.value.replace(/\n/g, "") })
							}
							placeholder="Add a subtitle…"
							rows={1}
							aria-label="Subtitle"
							className="editor-field mb-6 text-xl leading-snug text-neutral-600 dark:text-neutral-400"
						/>

						<Toolbar
							onBold={() => wrapSelection("**", "**", "bold")}
							onItalic={() => wrapSelection("*", "*", "italic")}
							onHeading={(level) => prefixLine(`${"#".repeat(level)} `)}
							onQuote={() => prefixLine("> ")}
							onLink={() => wrapSelection("[", "](https://)", "link text")}
							onCode={() => {
								const el = bodyRef.current;
								const selected = el
									? el.value.slice(el.selectionStart, el.selectionEnd)
									: "";
								if (selected.includes("\n"))
									wrapSelection("```\n", "\n```", "code");
								else wrapSelection("`", "`", "code");
							}}
							onImage={() => {
								if (fileInputRef.current) {
									fileInputRef.current.dataset.cover = "false";
									fileInputRef.current.click();
								}
							}}
							onYouTube={() =>
								insertBlock('<YouTube id="" />', '<YouTube id="'.length)
							}
							onDivider={() => insertBlock("---")}
						/>

						<textarea
							ref={bodyRef}
							value={form.content}
							onChange={(e) => update({ content: e.target.value })}
							onKeyDown={handleKeyDown}
							onPaste={handlePaste}
							onDrop={handleDrop}
							placeholder="Start writing…"
							rows={12}
							aria-label="Body"
							spellCheck
							className="editor-field editor-body min-h-[60vh] pt-4 text-neutral-800 dark:text-neutral-200"
						/>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFilePick}
							className="hidden"
						/>
					</div>
				)}

				{showPreview && (
					<div className="mx-auto w-full max-w-xl px-6 py-12 sm:py-16">
						<h1 className="title font-semibold text-2xl tracking-tighter">
							{form.title || <span className="text-neutral-400">Untitled</span>}
						</h1>
						<div className="mt-2 mb-8">
							<p className="text-sm text-neutral-600 dark:text-neutral-400">
								{formatDate(form.publishedAt)}
							</p>
						</div>
						{preview.error ? (
							<pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
								{preview.error}
							</pre>
						) : (
							<article className="prose post">
								{preview.node ?? (
									<p className="text-neutral-400">Nothing to preview yet.</p>
								)}
							</article>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/* --------------------------------- Toolbar --------------------------------- */

function Toolbar({
	onBold,
	onItalic,
	onHeading,
	onQuote,
	onLink,
	onCode,
	onImage,
	onYouTube,
	onDivider,
}: {
	onBold: () => void;
	onItalic: () => void;
	onHeading: (level: 2 | 3) => void;
	onQuote: () => void;
	onLink: () => void;
	onCode: () => void;
	onImage: () => void;
	onYouTube: () => void;
	onDivider: () => void;
}) {
	const items: {
		label: string;
		title: string;
		onClick: () => void;
		className?: string;
	}[] = [
		{ label: "B", title: "Bold (⌘B)", onClick: onBold, className: "font-bold" },
		{
			label: "I",
			title: "Italic (⌘I)",
			onClick: onItalic,
			className: "italic",
		},
		{ label: "H2", title: "Heading", onClick: () => onHeading(2) },
		{ label: "H3", title: "Subheading", onClick: () => onHeading(3) },
		{ label: "“", title: "Quote", onClick: onQuote },
		{ label: "Link", title: "Link (⌘K)", onClick: onLink },
		{ label: "</>", title: "Code", onClick: onCode },
		{
			label: "Image",
			title: "Upload image (or paste / drop one)",
			onClick: onImage,
		},
		{ label: "YouTube", title: "Embed a YouTube video", onClick: onYouTube },
		{ label: "—", title: "Divider", onClick: onDivider },
	];

	return (
		<div
			role="toolbar"
			aria-label="Formatting"
			className="-mx-2 flex flex-wrap items-center gap-0.5 border-y border-neutral-200 py-1 font-mono text-xs text-neutral-500 dark:border-neutral-800"
		>
			{items.map((item) => (
				<button
					key={item.label}
					type="button"
					title={item.title}
					onMouseDown={(e) => e.preventDefault()}
					onClick={item.onClick}
					className={`rounded-md px-2 py-1 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white ${item.className ?? ""}`}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}

/* --------------------------------- Settings -------------------------------- */

function Settings({
	slug,
	form,
	draft,
	update,
	onPickCover,
	onRename,
	onDelete,
}: {
	slug: string;
	form: PostInput;
	draft: boolean;
	update: (patch: Partial<PostInput>) => void;
	onPickCover: () => void;
	onRename: (slug: string) => Promise<void>;
	onDelete: () => Promise<void>;
}) {
	const [slugInput, setSlugInput] = useState(slug);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const field =
		"w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:focus:border-neutral-600";
	const label =
		"mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500";
	const ghost =
		"shrink-0 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900";

	return (
		<section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
			<div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="sm:col-span-2">
					<label htmlFor="cover" className={label}>
						Cover image
					</label>
					<div className="flex gap-2">
						<input
							id="cover"
							className={field}
							value={form.image}
							onChange={(e) => update({ image: e.target.value })}
							placeholder="/images/blog/cover.jpg"
						/>
						<button type="button" onClick={onPickCover} className={ghost}>
							Upload
						</button>
					</div>
					{form.image && (
						// biome-ignore lint/performance/noImgElement: local preview of an arbitrary path
						<img
							src={form.image}
							alt=""
							className="mt-3 aspect-[16/9] w-full max-w-xs rounded-md object-cover"
						/>
					)}
				</div>

				<div>
					<label htmlFor="date" className={label}>
						Publish date
					</label>
					<input
						id="date"
						type="date"
						className={field}
						value={form.publishedAt}
						onChange={(e) => update({ publishedAt: e.target.value })}
					/>
				</div>

				<div>
					<label htmlFor="slug" className={label}>
						URL
					</label>
					<div className="flex gap-2">
						<input
							id="slug"
							className={`${field} font-mono`}
							value={slugInput}
							onChange={(e) => setSlugInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") onRename(slugInput);
							}}
							spellCheck={false}
						/>
						{slugInput !== slug && (
							<button
								type="button"
								onClick={() => onRename(slugInput)}
								className={ghost}
							>
								Rename
							</button>
						)}
					</div>
					<p className="mt-1 truncate font-mono text-xs text-neutral-500">
						<Link
							href={`/blog/${slug}`}
							target="_blank"
							className="underline underline-offset-2"
						>
							/blog/{slug}
						</Link>
						{draft && " · drafts are only visible locally"}
					</p>
				</div>

				<div className="flex items-end sm:col-span-2 lg:col-span-4">
					{confirmDelete ? (
						<div className="flex items-center gap-2 text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">
								Delete this post permanently?
							</span>
							<button
								type="button"
								onClick={onDelete}
								className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
							>
								Delete
							</button>
							<button
								type="button"
								onClick={() => setConfirmDelete(false)}
								className={ghost}
							>
								Keep
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setConfirmDelete(true)}
							className="text-sm text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline"
						>
							Delete post
						</button>
					)}
				</div>
			</div>
		</section>
	);
}
