This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ASF-TBI website

The Technology Business Incubator website is available at `/asf-tbi`; the AKGEC Skills Foundation homepage links to it from the main navigation. News articles have individual pages under `/asf-tbi/news/`.

To update the public incubator website, sign in through the existing admin login and select **ASF-TBI Website** from the admin dashboard. The editor supports text, numbers, links, lists and adding or removing entries, including hero slide and facility images. Save and publish to make edits live. The sample content can be restored from the editor if needed. Image and card carousels include touch scrolling and keyboard-accessible controls.

ASF-TBI content is stored separately from the Foundation homepage content in `data/asf-tbi-content.json`. It uses the same persistence mechanism as the existing admin-managed site content: Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured, or the local JSON file during local development. Demo statistics, startup profiles, event listings, funding examples, mentor profiles and partner categories are explicitly identified as illustrative.

Startup applications from the ASF-TBI form are stored separately from course registrations in `data/asf-tbi-applications.json`. The list and status updates are available only after admin sign-in at `/admin/asf-tbi/applications`. The submission endpoint validates form fields and HTTPS links, limits request size, uses a honeypot and per-client rate limit, and asks applicants to consent before their information is stored.

### Install the admin dashboard on iPhone

The admin dashboard is installable as a home-screen web app. Deploy the site to a public HTTPS URL first; `localhost` only works on the development computer. For production live changes and registrations, configure `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and `BLOB_READ_WRITE_TOKEN` in the hosting provider. Without persistent Blob storage, file-based JSON changes on serverless hosts may not persist reliably. Keep these values private and never add them to frontend code.

On iPhone, open the deployed site in **Safari**, visit `/admin`, sign in, tap **Share**, choose **Add to Home Screen**, then tap **Add**. Launch the ASF-TBI icon and sign in with the existing admin password. The installed app requires an internet connection for live edits and registrations; private admin content is intentionally not cached for offline use. Public application submissions will appear under **Startup applications**.

Administrators can add, edit or remove application questions in **ASF-TBI Website → Application Form**. Custom questions support short answers, long answers, HTTPS links and dropdown options, with required/optional and enabled settings. Responses are included in the separate startup-application review page. Existing saved website content and application records remain readable after this form configuration is added.

## Foundation homepage

Sign in to the admin panel and open **Website Content → Images & Highlights** to replace each homepage hero slide, At a Glance highlight photo, About photo, Industry photo, news/event photo or COE / Training centre photo separately. Edit story titles, dates and descriptions under **Recent News & Events**; choose their photos in the separate image manager. Complete stories appear in the homepage carousel and rotate automatically. Choose a JPEG, PNG, WebP or AVIF file and select **Save and publish** to make changes live. Images are resized and optimized as WebP before being stored. Vercel deployments use the configured `BLOB_READ_WRITE_TOKEN`; local development stores uploaded images under `public/uploads/`.
