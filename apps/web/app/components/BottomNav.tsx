"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  Bot, 
  Notebook, 
  ShieldCheck, 
  Banknote, 
  BarChart3, 
  Target, 
  CalendarRange, 
  HeartPulse, 
  Sparkles, 
  MapPin, 
  FileText, 
  Heart, 
  Building2, 
  Scale, 
  AlertOctagon, 
  Send,
  MoreHorizontal,
  X
} from "lucide-react";

type NavItem = {
  href: string;
  icon: any;
  label: string;
  id?: string;
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/",          icon: Home, label: "হোম",      id: "nav-home"     },
  { href: "/companion", icon: Bot, label: "সহায়ক",   id: "nav-companion"},
  { href: "https://hishab-nikash-delta.vercel.app/", icon: Notebook, label: "হিসাব", id: "nav-cashbook", external: true },
  { href: "/protect",   icon: ShieldCheck, label: "সুরক্ষা",  id: "nav-protect"  },
];

// All extra tools shown in the "More" bottom sheet
const MORE_ITEMS: NavItem[] = [
  { href: "https://hishab-nikash-delta.vercel.app/", icon: Notebook, label: "হিসাব নিকাশ", external: true },
  { href: "/check-loan",      icon: Banknote, label: "ঋণ যাচাইকারী"       },
  { href: "/compare",         icon: BarChart3, label: "ব্যাংক পণ্য তুলনা"        },
  { href: "/savings",         icon: Target, label: "সঞ্চয় পরিকল্পনা"  },
  { href: "/events-planner",  icon: CalendarRange, label: "উৎসব পরিকল্পনা"   },
  { href: "/health",          icon: HeartPulse, label: "আর্থিক স্বাস্থ্য"  },
  { href: "/scenarios",       icon: Sparkles, label: "যদি-তাহলে"         },
  { href: "/locator",         icon: MapPin, label: "নিকটতম শাখা"       },
  { href: "/documents",       icon: FileText, label: "প্রয়োজনীয় নথি"   },
  { href: "/insurance",       icon: Heart, label: "বীমা"              },
  { href: "/entitlements",    icon: Building2, label: "সরকারি সাহায্য"   },
  { href: "/rights",          icon: Scale, label: "আপনার অধিকার"     },
  { href: "/emergency",       icon: AlertOctagon, label: "জরুরি গাইড"        },
  { href: "/remittance",      icon: Send, label: "রেমিট্যান্স"        },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More bottom sheet overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-end"
          onClick={() => setShowMore(false)}
          role="dialog"
          aria-modal="true"
          aria-label="সব সেবা"
        >
          <div
            className="w-full bg-white rounded-t-2xl p-5 pb-8 max-h-[75vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">সব সেবা</h2>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MORE_ITEMS.map(item => {
                const IconComponent = item.icon;
                const isActive = !item.external && pathname === item.href;

                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border text-decoration-none transition-all bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    >
                      <IconComponent className="w-6 h-6 text-slate-500" />
                      <span className="text-[10px] text-center font-semibold leading-normal">{item.label}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-decoration-none transition-all ${
                      isActive 
                        ? "bg-teal-50 border-primary text-primary" 
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 ${isActive ? "text-primary" : "text-slate-500"}`} />
                    <span className="text-[10px] text-center font-semibold leading-normal">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="bottom-nav" aria-label="প্রধান নেভিগেশন">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.external && (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/"));
          const IconComponent = item.icon;

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                id={item.id}
                className="nav-item"
                aria-label={item.label}
              >
                <span className="nav-item__icon" aria-hidden="true">
                  <IconComponent className="w-6 h-6" />
                </span>
                <span className="nav-item__label">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className={`nav-item${isActive ? " active" : ""}`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-item__icon" aria-hidden="true">
                <IconComponent className="w-6 h-6" />
              </span>
              <span className="nav-item__label">{item.label}</span>
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
          <span className="nav-item__icon" aria-hidden="true">
            <MoreHorizontal className="w-6 h-6" />
          </span>
          <span className="nav-item__label">আরও</span>
        </button>
      </nav>
    </>
  );
}
