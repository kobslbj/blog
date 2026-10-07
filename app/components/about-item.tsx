"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";

export type AboutPhoto = {
	src: string;
	alt: string;
	width: number;
	height: number;
};

export type AboutDeck = {
	title: string;
	slides: AboutPhoto[];
};

export function AboutItem({
	title,
	subtitle,
	date,
	dateItalic,
	photos = [],
	scan,
	deck,
	children,
}: {
	title: string;
	subtitle?: string;
	date: string;
	dateItalic?: boolean;
	photos?: AboutPhoto[];
	// Runs the Deeptector scan sweep over the photos when they open.
	scan?: boolean;
	// A talk or deck, opened slide by slide in the full-screen viewer.
	deck?: AboutDeck;
	children?: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [viewing, setViewing] = useState<{
		items: AboutPhoto[];
		index: number;
	} | null>(null);
	const hasPhotos = photos.length > 0;

	const details = (
		<>
			<span className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 font-medium">
				{title}
			</span>
			{subtitle && (
				<span className="text-neutral-600 dark:text-neutral-400">
					{subtitle}
				</span>
			)}
			{children && (
				<span className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
					{children}
				</span>
			)}
			<span className="text-neutral-500 dark:text-neutral-500 text-sm">
				<span className={dateItalic ? "italic" : ""}>{date}</span>
				{hasPhotos && (
					<span className="text-neutral-400 dark:text-neutral-600">
						{" · "}
						<span className="underline decoration-neutral-300 underline-offset-2 dark:decoration-neutral-700">
							{open
								? "Hide photos"
								: `${photos.length} photo${photos.length > 1 ? "s" : ""}`}
						</span>
						<span
							aria-hidden
							className={`ml-1 inline-block transition-transform duration-300 ${
								open ? "rotate-180" : ""
							}`}
						>
							↓
						</span>
					</span>
				)}
			</span>
		</>
	);

	return (
		<li>
			{hasPhotos ? (
				<button
					type="button"
					onClick={() => setOpen(!open)}
					aria-expanded={open}
					className="flex w-full cursor-pointer flex-col text-left"
				>
					{details}
				</button>
			) : (
				<div className="flex flex-col">{details}</div>
			)}

			{deck && (
				<button
					type="button"
					onClick={() => setViewing({ items: deck.slides, index: 0 })}
					className="group mt-3 flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-2 text-left transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
				>
					<span className="relative w-24 shrink-0 overflow-hidden rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800">
						<Image
							src={deck.slides[0].src}
							alt=""
							width={deck.slides[0].width}
							height={deck.slides[0].height}
							sizes="96px"
							className="m-0 block h-auto w-full"
						/>
					</span>
					<span className="flex min-w-0 flex-col">
						<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
							{deck.title}
						</span>
						<span className="text-xs text-neutral-500">
							{deck.slides.length} slides · View{" "}
							<span
								aria-hidden
								className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
							>
								→
							</span>
						</span>
					</span>
				</button>
			)}

			{hasPhotos && (
				<div
					className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
						open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
					}`}
				>
					<div className="overflow-hidden">
						<div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pt-4 pb-2">
							{photos.map((photo, i) => (
								<button
									key={photo.src}
									type="button"
									onClick={() => setViewing({ items: photos, index: i })}
									aria-label={`View photo: ${photo.alt}`}
									className="relative shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800"
								>
									<Image
										src={photo.src}
										alt={photo.alt}
										width={photo.width}
										height={photo.height}
										sizes="(max-width: 640px) 90vw, 576px"
										className="m-0 block h-64 w-auto max-w-[85vw] object-cover sm:h-72 sm:max-w-none"
									/>
									{scan && open && <ScanOverlay delay={i * 0.25} />}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{viewing && (
				<Lightbox
					photos={viewing.items}
					index={viewing.index}
					onChange={(index) => setViewing({ ...viewing, index })}
					onClose={() => setViewing(null)}
				/>
			)}
		</li>
	);
}

// Deeptector-style sweep: a scan line passes over the photo, then it gets a verdict.
function ScanOverlay({ delay }: { delay: number }) {
	return (
		<span className="pointer-events-none absolute inset-0 motion-reduce:hidden">
			<span
				style={{ animationDelay: `${delay}s` }}
				className="absolute inset-x-0 -top-16 h-16 animate-[deeptector-scan_1.6s_ease-in-out_both] bg-linear-to-b from-transparent via-indigo-400/40 to-transparent"
			>
				<span className="absolute inset-x-0 bottom-1/2 h-px bg-linear-to-r from-sky-400 via-indigo-400 to-pink-400" />
			</span>
			<span
				style={{ animationDelay: `${delay + 1.5}s` }}
				className="absolute top-2 left-2 animate-[deeptector-verdict_0.4s_ease-out_both] rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur"
			>
				Deeptector · ✓ Real photo
			</span>
		</span>
	);
}

function Lightbox({
	photos,
	index,
	onChange,
	onClose,
}: {
	photos: AboutPhoto[];
	index: number;
	onChange: (index: number) => void;
	onClose: () => void;
}) {
	const photo = photos[index];
	const step = (delta: number) =>
		onChange((index + delta + photos.length) % photos.length);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") onChange((index + 1) % photos.length);
			if (e.key === "ArrowLeft")
				onChange((index - 1 + photos.length) % photos.length);
		}
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [index, photos.length, onChange, onClose]);

	return (
		<div
			role="dialog"
			aria-modal
			aria-label={photo.alt}
			className="fixed inset-0 z-50 flex animate-[about-fade_0.2s_ease-out] items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
		>
			<button
				type="button"
				onClick={onClose}
				aria-label="Close"
				className="absolute inset-0 cursor-zoom-out"
			/>
			<Image
				key={photo.src}
				src={photo.src}
				alt={photo.alt}
				width={photo.width}
				height={photo.height}
				sizes="100vw"
				className="relative m-0 max-h-[85vh] w-auto max-w-full animate-[about-zoom_0.25s_ease-out] rounded-lg object-contain"
			/>
			{photos.length > 1 && (
				<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 text-sm text-white/80">
					<button
						type="button"
						onClick={() => step(-1)}
						aria-label="Previous photo"
						className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20"
					>
						←
					</button>
					<span className="tabular-nums">
						{index + 1} / {photos.length}
					</span>
					<button
						type="button"
						onClick={() => step(1)}
						aria-label="Next photo"
						className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20"
					>
						→
					</button>
				</div>
			)}
			<button
				type="button"
				onClick={onClose}
				aria-label="Close"
				className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-white/80 hover:bg-white/20"
			>
				✕
			</button>
		</div>
	);
}
