"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            fontFamily: "system-ui, sans-serif",
            background: "#FAFAF6",
            color: "#16151A",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "28px", margin: 0, letterSpacing: "-0.5px" }}>
            Something broke<span style={{ color: "#FD0178" }}>.</span>
          </h1>
          <p style={{ maxWidth: "420px", lineHeight: 1.6, color: "#5B5A63" }}>
            An unexpected error occurred. We&apos;ve been notified — try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#16151A",
              color: "#FAFAF6",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <div style={{ fontSize: "12px", color: "#5B5A63" }}>
            <NextError statusCode={500} />
          </div>
        </div>
      </body>
    </html>
  );
}
