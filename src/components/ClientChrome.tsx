"use client";

import { useEffect } from "react";
import ScrollProgress from "./ScrollProgress";
import BackToTop from "./BackToTop";
import CookieBanner from "./CookieBanner";
import SiteSearch from "./SiteSearch";
import { captureUtm } from "@/lib/utm";

/**
 * Client-only site chrome: scroll progress, site search, back-to-top,
 * and the cookie banner. Mounted once in the root layout.
 */
export default function ClientChrome() {
  useEffect(() => {
    // Capture UTM params (if present) and persist them for contact forms.
    captureUtm();
  }, []);

  return (
    <>
      <ScrollProgress />
      <SiteSearch />
      <BackToTop />
      <CookieBanner />
    </>
  );
}
