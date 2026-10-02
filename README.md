# Justin's Blog

Personal blog built with Next.js, live at [justinli.blog](https://justinli.blog).

Based on [Vercel's Portfolio Blog Starter](https://github.com/vercel/examples/tree/main/solutions/blog).

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS v4
- **Content**: MDX files in `content/`
- **Font**: Geist
- **Linting**: Biome

## Getting Started

```bash
pnpm install
pnpm dev
```

## Writing posts

Run `pnpm dev` and open **http://localhost:3000/write**. This is a local-only
editor (it returns 404 in production builds) that reads and writes the MDX files
in `content/blog/` directly:

- **New post** creates a draft. Drafts are hidden from the site but can be
  previewed locally at `/blog/<slug>`.
- The body is Markdown/MDX with a formatting toolbar, `⌘B` / `⌘I` / `⌘K`
  shortcuts, and `⌘S` to save (it also autosaves as you type).
- Paste or drop an image into the body to upload it to `public/images/blog/`.
- **Split** / **Preview** render the post through the same MDX pipeline as the
  live site.
- **Settings** holds the cover image, publish date, URL slug and delete.
- **Publish** flips the draft flag. Untitled drafts get a slug from the title.

Publishing a post on the site itself is still a git push:

```bash
git add content public && git commit -m "post: my new post" && git push
```

You can also skip the editor and create `content/blog/<slug>.mdx` by hand:

```mdx
---
title: "Post Title"
publishedAt: "2024-01-01"
summary: "Post summary"
image: "/images/blog/cover.jpg"
draft: true
---

Your content...
```

Books on the `/read` page live in `content/books/*.mdx` and only need
`title` and `image` frontmatter.

## View counts and comments

**View counts** are stored in Upstash Redis, provisioned through the Vercel
Marketplace. One-time setup:

```bash
vercel login
vercel link                       # pick the existing blog project
vercel integration add upstash    # creates the store and sets the env vars
vercel env pull .env.local --yes  # copies UPSTASH_REDIS_REST_URL / _TOKEN locally
```

Until those env vars exist the counter is hidden and `/api/views/<slug>`
returns `{ "views": null }`. Views are only incremented in production builds,
once per browser session per post.

**Comments** use [giscus](https://giscus.app), which stores each post's thread
as a GitHub Discussion on this repo (category "Announcements"). The repo and
category IDs live in `lib/site.ts`. The giscus GitHub App must be installed on
the repo once: https://github.com/apps/giscus.

## Project layout

```
app/
  (site)/        public pages, wrapped in the nav + footer shell
  (editor)/write local writing UI (dev only)
  components/    shared components (MDX renderer, nav, footer, post lists)
content/
  blog/          blog posts
  books/         reading list
lib/
  content.ts     reads/writes MDX + frontmatter
  site.ts        site name, URL, author, giscus IDs
  views.ts       view counter (Upstash Redis)
```

Set `NEXT_PUBLIC_SITE_URL` to override the canonical URL used for sitemap,
RSS and Open Graph tags.

## License

MIT
