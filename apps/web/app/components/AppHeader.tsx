import Link from "next/link";

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
      <Link
        href="/privacy"
        className="btn btn--ghost btn--sm"
        id="header-privacy-link"
        aria-label="গোপনীয়তা নীতি দেখুন"
        style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-2) var(--space-3)" }}
      >
        🔒 গোপনীয়
      </Link>
    </header>
  );
}
