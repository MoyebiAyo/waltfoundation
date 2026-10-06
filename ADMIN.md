# Website Admin Dashboard — Guide

The site has a built-in content manager at **https://www.waltscharityef.com/admin**.
You log in with GitHub, edit content in a friendly interface, press **Save**, and the
website updates itself about a minute later. No code, no FTP, no developers needed.

```
You edit at /admin  →  saved to GitHub  →  Vercel rebuilds the site  →  live in ~1–2 min
```

---

## 1. One-time setup (~5 minutes, done once)

The dashboard needs a "GitHub OAuth App" so you can log in with your GitHub account.

1. Go to **https://github.com/settings/developers** → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** `Walt Foundation website admin`
   - **Homepage URL:** `https://www.waltscharityef.com`
   - **Authorization callback URL:** `https://www.waltscharityef.com/api/auth/callback`
3. Click **Register application**, then **Generate a new client secret**.
4. Copy the **Client ID** and **Client secret**.
5. Go to the Vercel dashboard → the `waltfoundation` project → **Settings** →
   **Environment Variables** and add two variables (for *Production*, *Preview* and
   *Development*):
   - `GITHUB_OAUTH_CLIENT_ID` = the Client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` = the Client secret
6. Redeploy the site once (Vercel → Deployments → ⋯ → Redeploy) so the new variables
   take effect.

Done. From now on, open **/admin** and click **Login with GitHub**.

> **Who can log in?** Only GitHub accounts that have write access to the
> `MoyebiAyo/waltfoundation` repository. To give someone else access, add them as a
> collaborator on the GitHub repository (Settings → Collaborators).

---

## 2. Everyday use

1. Open **https://www.waltscharityef.com/admin** and log in with GitHub.
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
- **`/admin`** is Decap CMS (open source) configured in `admin/config.yml`.
  Login is handled by `api/auth/request.js` + `api/auth/callback.js` using the
  GitHub OAuth env vars above.
- If an edit breaks something: the previous version is one click away — either
  revert the commit on GitHub, or fix the values back in the dashboard.

### Local development
```bash
npm install
npm run build        # optimize uploads + css + render content into HTML
npx serve .          # or: python -m http.server
```
