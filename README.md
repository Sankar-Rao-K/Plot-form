# DDS Expo Plot Enquiry Form

Standalone enquiry form (React + Vite), styled to match the Murthy Kotla property poster. Step 1 asks plot details (3 dropdowns); step 2 asks name, mobile and email. Banner image: `public/owner.jpg`.

Standalone enquiry form (React + Vite) with a Vercel serverless API that emails every submission through Resend.

## Deploy (about 10 minutes)

1. Upload this folder to a GitHub repository (do **not** upload `.env` or `node_modules`).
2. Vercel -> **Add New -> Project** -> import the repo. Framework: Vite (auto-detected).
3. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | your key from Resend (starts with `re_`) |
   | `TO_EMAIL` | `ddsexpoai@gmail.com` (optional, this is the default) |

4. Deploy. If you add or change variables later, **Redeploy** (Deployments -> ... -> Redeploy).

## Sender address: read this

Without `MAIL_FROM`, mail is sent from Resend's test address `onboarding@resend.dev`. Resend only delivers that to the **email address you registered your Resend account with**.

- Registered Resend with `ddsexpoai@gmail.com` -> works as is.
- Registered with another address -> either set `TO_EMAIL` to that address for now, or verify a domain you own in Resend (Domains) and set `MAIL_FROM` = `DDS Expo <enquiries@yourdomain.com>`.

## Optional environment variables

- `MAIL_FROM` - verified-domain sender (see above).
- `SEND_CUSTOMER_COPY` = `true` - also email the customer an acknowledgement (needs a verified domain in `MAIL_FROM`).

## Troubleshooting

Vercel -> your project -> **Logs** (filter: `/api/submit`). Failed sends print Resend's exact reason (e.g. "You can only send testing emails to your own email address").
Also check the Resend dashboard -> **Emails** and the Gmail spam folder.

## Spam protection

Hidden honeypot field + server-side validation of every field and option.

## Local testing

`npm install`, then `vercel dev` (Vite alone does not run `/api`). Put `RESEND_API_KEY=...` in `.env.local`.
