# Launching Orvannis — step by step

The code is committed and ready to go (see `git log`). These remaining steps need your own accounts, so I can't do them for you — here's exactly what to do.

## 1. Push to GitHub (~5 min)
1. Go to github.com → New repository → name it `orvannis-website` (private is fine, no README/license needed).
2. In this project folder, run:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/orvannis-website.git
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy to Vercel (~5 min)
1. Go to vercel.com → sign in with your GitHub account.
2. "Add New Project" → select `orvannis-website`.
3. Framework Preset: choose **"Other"** (it's a plain static HTML site).
4. Click **Deploy**. You'll get a live URL like `orvannis-website.vercel.app` within ~30 seconds.

## 3. Point orvannis.com at Vercel (~15 min + up to 48hr DNS wait)
1. Log into Porkbun → Domain Management → orvannis.com → DNS.
2. Delete any existing A/CNAME records for `@` and `www`.
3. Add:
   | Type | Host | Value |
   |---|---|---|
   | A | @ | 76.76.21.21 |
   | CNAME | www | cname.vercel-dns.com |
4. Back in Vercel → your project → Settings → Domains → add `orvannis.com` and `www.orvannis.com`.
5. Check propagation at whatsmydns.net before announcing the launch.

## Optional, can do anytime after launch
- **Analytics**: create a GA4 property, give me the Measurement ID, I'll wire it into all pages.
- **Contact form backend**: currently falls back to opening the visitor's email client (fully functional). If you want a real database + auto-reply instead, follow `orvannis-launch-guide/ORVANNIS-LAUNCH-GUIDE.md`, then paste the resulting URL into `backendUrl` in `site.config.js`.
- **Admin page password protection**: `vercel.json` now sends `noindex` headers for `/admin.html` and `/login.html` so they won't show up in search results, but there's still no real login wall. Low risk while there's no live backend behind it — worth adding before real customer data is involved.

## What was fixed/changed this session (for context)
See chat history for full detail. Headline items: dark mode was completely broken (fixed), About/Platform pages rendered blank until scroll (fixed), the homepage's 4 "See Flow/Pay/Connect/Reach" links all pointed to the wrong pages (fixed — 3 of 4 went to the contact form instead of their platform sections), banner/logo redesign, social links added, founder photo added, SEO meta tags + robots.txt + sitemap.xml added.
