# Website Admin Dashboard — Guide

The site has a built-in content manager at **https://www.waltscharityef.com/admin**.
You log in with GitHub, edit content in a friendly interface, press **Save**, and the
website updates itself about a minute later. No code, no FTP, no developers needed.

```
You edit at /admin  →  saved to GitHub  →  Vercel rebuilds the site  →  live in ~1–2 min
```

---

## 1. One-time setup (~5 minutes, done once)

The dashboard signs editors in with an **email + password**. Credentials are checked
against the `ADMIN_USERS` environment variable in Vercel, and saving content uses a
GitHub token (`GITHUB_CONTENT_TOKEN`) stored next to it. These were configured during
setup — this section is here in case they ever need to change.

**Change the password or add another editor:**
1. Vercel dashboard → the `waltfoundation` project → **Settings** → **Environment Variables** → edit `ADMIN_USERS`.
2. It is a JSON list — one object per editor:
   ```json
   [{"email":"admin@waltscharityef.com","password":"the-password"},
    {"email":"second@waltscharityef.com","password":"another-password"}]
   ```
3. Redeploy once (Deployments → ⋯ → Redeploy) so the change takes effect.

**Renew the GitHub token (only if saving ever starts failing):**
1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**.
2. "Walt Foundation website content" — regenerate it and paste the new value into the
   `GITHUB_CONTENT_TOKEN` environment variable in Vercel, then redeploy.

**Optional GitHub login:** editors who prefer GitHub can still use the
"Log in with GitHub instead" link on the sign-in page. It needs the GitHub OAuth app
("Walt Foundation website admin") and the `GITHUB_OAUTH_CLIENT_ID` /
`GITHUB_OAUTH_CLIENT_SECRET` environment variables in Vercel — already configured.

---

## 2. Everyday use

1. Open **https://www.waltscharityef.com/admin** and sign in with your email and password.
2. Pick a collection in the left sidebar:

| Sidebar entry | What it controls |
|---|---|
| **Outreach posts** | The impact log on the Gallery page — add a new post per outreach, with photos. Newest appears first. |
| **Homepage hero** | The big headline, subtitle, buttons and background slideshow photos. |
| **Programmes** | The four programme cards (homepage, About page, Donate page list). |
| **Videos** | The video grid on the homepage. |
| **Team** | Board members and the Grand Patron. |
| **Gallery** | The photo gallery, homepage photo preview and First Lady visit section. |
| **History timeline** | Milestones on the About page. |
| **Founder & Grand Patron section** | The photo + video pair on the About page. |
| **Site settings** | Donation amounts, bank accounts, contact details, social links, compliance numbers, stats, vision quote, contact-form topics. |

3. Make your changes and press **Save** (top right).
4. That's it — the site rebuilds automatically. Changes appear live in ~1–2 minutes.
   Every save is also a entry in the repository's history, so any change can be
   undone later.

### Adding photos
- Upload JPG or PNG images directly in any image field — the site automatically
  converts them to optimised WebP sizes at build time, so big phone photos are fine.
- "Thumbnail" fields can be left empty — the full photo is used automatically.

### Adding videos
- **Preferred: YouTube.** Upload the video to the Foundation's YouTube channel, copy
  the video ID from the link (`youtube.com/watch?v=`**`dQw4w9WgXcQ`** ← that part),
  and paste it into the "YouTube video ID" field. Nothing large is stored on the
  website, pages stay fast.
- Self-hosted MP4 files already in `assets/videos` keep working (leave YouTube ID
  empty and select the file). Avoid uploading new large MP4 files through the admin —
  they slow the site and the repository.

---

## 3. How it works (for whoever maintains the code)

- Content lives in **`content/*.json`** (one file per section, `content/outreaches/`
  for posts). The admin UI simply edits these files via the GitHub API.
- **`scripts/build-content.js`** (`npm run build:content`) renders the JSON into the
  `<!--content:…-->` marked regions of the HTML pages at build time — the site stays
  fully static, so SEO is untouched. The outreach log, video JSON-LD, sitemap
  lastmod and uploaded-image optimisation all happen in this step.
- Editing `content/*.json` by hand and running `npm run build` works exactly the
  same as editing in the dashboard.
- **`/admin`** is Decap CMS (open source) configured in `admin/config.js`. The
  sign-in form posts to `api/auth/login.js`, which checks the credentials and hands
  the browser a GitHub content token; "Log in with GitHub instead" uses
  `api/auth/request.js` + `api/auth/callback.js` (GitHub OAuth app flow).
- If an edit breaks something: the previous version is one click away — either
  revert the commit on GitHub, or fix the values back in the dashboard.

### Local development
```bash
npm install
npm run build        # optimize uploads + css + render content into HTML
npx serve .          # or: python -m http.server
```
