# JKH Photo — Next.js + TinaCMS

## Setup

```bash
cd jkh-tina
npm install
npm run dev
```

- Site: http://localhost:3000
- Tina admin: http://localhost:3000/admin/index.html

## Adding Projects

1. Go to `/admin/index.html`
2. Click Projects → Create New
3. Fill in fields (title, category, client, date, location, coordinates, number)
4. Add gallery rows — pick layout type, upload images
5. Toggle "Show on Homepage" for featured projects
6. Optionally add credits
7. Save

## Deploy

```bash
npm run build
npx wrangler pages deploy ./out --project-name=jkh-photo
```

## Structure

```
app/
  layout.js              — nav, clock, fonts
  page.js                — homepage (video + project list)
  info/page.js           — info page
  projects/[slug]/
    page.js              — project route (server)
    ProjectPage.js       — project page (client)
components/              — Nav, Clock, Gallery, Credits, Lightbox, ProjectBanner, HomeProjectList, InfoPage
content/projects/        — .mdx files managed by Tina
styles/                  — globals.css, home.css, project.css, info.css
tina/config.ts           — CMS schema
public/video/            — drop reel.mp4 here
```
