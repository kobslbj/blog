import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Only real visitors are tracked: local dev (including the /write editor) never sends events.
if (process.env.NODE_ENV === "production") {
	if (key) {
		posthog.init(key, {
			// Proxied through next.config.ts rewrites so ad blockers don't drop events.
			api_host: "/ingest",
			ui_host: "https://us.posthog.com",
			defaults: "2026-05-30",
			person_profiles: "identified_only",
			capture_exceptions: true,
			session_recording: {
				maskAllInputs: true,
			},
		});
	}
} else if (!key) {
	console.error(
		"NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
	);
}
