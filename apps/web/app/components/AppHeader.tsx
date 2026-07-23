"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="app-header" role="banner" style={{ borderBottom: "1px solid #e2e8f0" }}>
      {/* Brand Logo */}
      <Link href="/" className="app-header__logo" aria-label="আর্থিক সহায়ক — হোম" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "#064e3b",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 2px 4px rgba(6,78,59,0.2)"
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="app-header__title" style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.01em" }}>
            আর্থিক সহায়ক
          </div>
        </div>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav" aria-label="প্রধান নেভিগেশন" style={{ marginRight: "1rem" }}>
        <Link href="/" className="desktop-nav__link">হোম</Link>
        <a href="#tools" className="desktop-nav__link">টুলস</a>
        <a href="#services" className="desktop-nav__link">সেবা</a>
        <a href="#support" className="desktop-nav__link">সহায়তা</a>
        <Link href="/privacy" className="desktop-nav__link">সম্পর্কে</Link>
      </nav>

      {/* Login CTA button */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link
          href="/login"
          className="brand-login-btn"
          id="header-login-btn"
          aria-label="লগইন করুন"
        >
          লগইন
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-emerald-800 transition-colors"
          aria-label="মেনু খুলুন"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            zIndex: 150
          }}
          className="md:hidden fade-in"
        >
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>হোম</Link>
          <a href="#tools" onClick={() => setMobileMenuOpen(false)} style={{ color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>টুলস</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} style={{ color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>সেবা</a>
          <a href="#support" onClick={() => setMobileMenuOpen(false)} style={{ color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>সহায়তা</a>
          <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} style={{ color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>সম্পর্কে</Link>
        </div>
      )}
    </header>
  );
}
