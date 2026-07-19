"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/",          icon: "🏠", label: "হোম",      id: "nav-home"     },
  { href: "/companion", icon: "🤖", label: "সহায়ক",   id: "nav-companion"},
  { href: "/cashbook",  icon: "📓", label: "হিসাব",    id: "nav-cashbook" },
  { href: "/protect",   icon: "🛡️", label: "সুরক্ষা",  id: "nav-protect"  },
];

// All extra tools shown in the "More" bottom sheet
const MORE_ITEMS = [
  { href: "/check-loan",      icon: "💵", label: "ঋণ যাচাইকারী"       },
  { href: "/compare",         icon: "📊", label: "ব্যাংক পণ্য তুলনা"        },
  { href: "/savings",         icon: "🎯", label: "সঞ্চয় পরিকল্পনা"  },
  { href: "/events-planner",  icon: "🎈", label: "উৎসব পরিকল্পনা"   },
  { href: "/health",          icon: "💚", label: "আর্থিক স্বাস্থ্য"  },
  { href: "/scenarios",       icon: "🔮", label: "যদি-তাহলে"         },
  { href: "/locator",         icon: "📍", label: "নিকটতম শাখা"       },
  { href: "/documents",       icon: "📄", label: "প্রয়োজনীয় নথি"   },
  { href: "/insurance",       icon: "🌱", label: "বীমা"              },
  { href: "/entitlements",    icon: "🏛️", label: "সরকারি সাহায্য"   },
  { href: "/rights",          icon: "⚖️", label: "আপনার অধিকার"     },
  { href: "/emergency",       icon: "🆘", label: "জরুরি গাইড"        },
  { href: "/remittance",      icon: "✈️", label: "রেমিট্যান্স"        },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More bottom sheet overlay */}
      {showMore && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 200, display: "flex", alignItems: "flex-end",
          }}
          onClick={() => setShowMore(false)}
          role="dialog"
          aria-modal="true"
          aria-label="সব সেবা"
        >
          <div
            style={{
              width: "100%", background: "var(--color-surface)",
              borderRadius: "16px 16px 0 0", padding: "20px 16px 32px",
              maxHeight: "75vh", overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>সব সেবা</h2>
              <button
                onClick={() => setShowMore(false)}
                style={{ fontSize: "20px", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
                aria-label="বন্ধ করুন"
              >✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {MORE_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "6px", padding: "14px 8px",
                    background: pathname === item.href ? "var(--color-primary-light, #e6f4f0)" : "var(--color-bg)",
                    borderRadius: "12px", textDecoration: "none",
                    border: pathname === item.href ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border-light)",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "26px" }}>{item.icon}</span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-primary)", textAlign: "center", fontWeight: "600", lineHeight: 1.3 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="bottom-nav" aria-label="প্রধান নেভিগেশন">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className={`nav-item${isActive ? " active" : ""}`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-item__icon" aria-hidden="true" style={{ fontSize: "24px" }}>
                {item.icon}
              </span>
              <span className="nav-item__label" style={{ fontSize: "11px" }}>{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          id="nav-more"
          className="nav-item"
          aria-label="আরও সেবা"
          onClick={() => setShowMore(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          <span className="nav-item__icon" aria-hidden="true" style={{ fontSize: "24px" }}>⋯</span>
          <span className="nav-item__label" style={{ fontSize: "11px" }}>আরও</span>
        </button>
      </nav>
    </>
  );
}
