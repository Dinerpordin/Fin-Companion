import Link from "next/link";
import { Lock, User } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="app-header" role="banner">
      <Link href="/" className="app-header__logo" aria-label="আর্থিক সহায়ক — হোম">
        <div className="app-header__logo-mark" aria-hidden="true">আ</div>
        <div>
          <div className="app-header__title">আর্থিক সহায়ক</div>
          <div className="app-header__subtitle">Bangladesh Financial Companion</div>
        </div>
      </Link>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <Link
          href="/account"
          className="btn btn--ghost btn--sm flex items-center gap-1.5"
          id="header-account-link"
          aria-label="একাউন্ট মডিউল"
          style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-2) var(--space-3)" }}
        >
          <User className="w-3.5 h-3.5 text-primary" />
          <span>একাউন্ট</span>
        </Link>
        <Link
          href="/privacy"
          className="btn btn--ghost btn--sm flex items-center gap-1.5"
          id="header-privacy-link"
          aria-label="গোপনীয়তা নীতি দেখুন"
          style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-2) var(--space-3)" }}
        >
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>গোপনীয়তা</span>
        </Link>
      </div>
    </header>
  );
}
