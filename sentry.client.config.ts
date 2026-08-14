// Sentry client config — captures errors in the browser.
// The DSN is public by design; set NEXT_PUBLIC_SENTRY_DSN in GitHub Actions secrets.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Errors are sampled 100% in development, 20% in production.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Disable session replay unless a DSN is configured (keeps the static
  // export lean when Sentry isn't set up yet).
  replaysSessionSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 0.1 : 0,
  replaysOnErrorSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 1.0 : 0,
});
