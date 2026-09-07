# React + Vite

## Contact form setup

The contact form posts to `/api/contact`, which sends email through [Resend's email API](https://resend.com/docs/api-reference/emails/send-email). The endpoint runs in Vite development/preview and as a Vercel serverless function in production. Static-only hosting needs a separate server for this endpoint.

1. Copy `.env.example` to `.env.local`.
2. Set `RESEND_API_KEY` to your Resend key and `CONTACT_FROM_EMAIL` to an allowed sender on your verified Resend domain. Set `CONTACT_TO_EMAIL` to your receiving inbox (defaults to the portfolio email).
3. Restart `npm run dev`. For Vercel, add the same server environment variables in the project settings and redeploy.
4. Submit a test message and check the receiving inbox and Resend delivery logs. An API success confirms acceptance, not inbox delivery.

Keep the key server-side; never use a `VITE_` prefix or commit `.env.local`. Without configuration, the form shows an error and offers a direct email link. Failed submissions preserve the visitor's text. The hidden website field filters basic bot submissions; configure rate limiting in your hosting platform for public traffic.

Run endpoint checks with `node --test tests/contact.test.js`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
