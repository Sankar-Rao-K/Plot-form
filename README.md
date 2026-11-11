# DDS Expo Plot Enquiry Form

A standalone, responsive customer enquiry form built with React + Vite and a Vercel serverless API. Form submissions are emailed to `ddsexpoai@gmail.com` through Resend.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Create a Resend account at https://resend.com and create an API key.
4. Create a `.env` file in the project root:

   ```env
   RESEND_API_KEY=re_your_api_key
   ```

5. Run the frontend with `npm run dev`.

For local end-to-end testing, use Vercel CLI (`npm i -g vercel`) and `vercel dev` after adding the environment variable in `.env.local` (or importing it into your shell). Vite's dev server alone does not run the `/api` function.

## Deploy to Vercel

1. Upload this project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. In **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = your Resend API key
   - Optional `MAIL_FROM` = a sender identity on a domain verified in Resend, e.g. `DDS Expo <enquiries@yourdomain.com>`
5. Redeploy after adding environment variables.

## Email sender setup (important)

The API currently uses Resend's testing sender `onboarding@resend.dev`. Resend's testing sender is restricted to the email address associated with your Resend account. To deliver enquiries to `ddsexpoai@gmail.com`, make sure that address is permitted by your Resend account's test-mode rules, or verify a domain you control in Resend and set `MAIL_FROM` to an address on that verified domain. Do not put the Resend API key in frontend code.

The recipient is fixed server-side to `ddsexpoai@gmail.com`. Change it in `api/submit.js` only if the business inbox changes.
