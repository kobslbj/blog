import { Redis } from "@upstash/redis";

// View counts live in Upstash Redis (provisioned through the Vercel Marketplace).
// Without UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN the counter is simply hidden,
// so local dev and the first deploy work before the store exists.

let client: Redis | null | undefined;

function redis(): Redis | null {
	if (client !== undefined) return client;
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	client = url && token ? new Redis({ url, token }) : null;
	return client;
}

export function viewsEnabled(): boolean {
	return redis() !== null;
}

const key = (slug: string) => `views:${slug}`;

export async function getViews(slug: string): Promise<number | null> {
	const db = redis();
	if (!db) return null;
	const value = await db.get<number>(key(slug));
	return value ?? 0;
}

export async function incrementViews(slug: string): Promise<number | null> {
	const db = redis();
	if (!db) return null;
	return db.incr(key(slug));
}
