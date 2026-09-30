# Granados General Contractor website

Static site (HTML/CSS/JS) with a single Vercel serverless function for the contact form.

## Files

- `index.html`, `styles.css`, `script.js`: the site
- `api/contact.js`: sends contact form messages by email through Resend
- `images/`: placeholder photos (free Unsplash images)
- `video/hero.mp4`: placeholder homepage video (free Pexels clip)

## Replacing placeholder media

Drop your own photos into `images/` using the same filenames (for example `framing-1.jpg`) and they will show up automatically. Keep them around 1600 to 2000 pixels wide.

For the homepage video, replace `video/hero.mp4`. Aim for a 10 to 30 second clip, 1280x720 or 1920x1080, under about 15 MB, with no audio needed.

## Contact form email setup (Vercel environment variables)

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from resend.com |
| `CONTACT_TO_EMAIL` | where messages go (currently agranados112@gmail.com) |
| `CONTACT_FROM_EMAIL` | optional, after verifying the domain in Resend, e.g. `Granados Website <website@granadoscontractor.com>` |

To switch to a business email later, change `CONTACT_TO_EMAIL` in Vercel and redeploy. No code change needed.

## Local preview

```bash
python3 -m http.server 5173
```

The contact form only works once deployed to Vercel (or with `vercel dev`).
