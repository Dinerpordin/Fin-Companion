import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import AppHeader from "./components/AppHeader";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "আর্থিক সহায়ক — Bangladesh Financial Companion",
  description:
    "বাংলাদেশের জন্য গোপনীয়তা-প্রথম আর্থিক তুলনা ও গাইডেন্স প্ল্যাটফর্ম। ঋণ পরীক্ষা করুন, পণ্য তুলনা করুন, এবং AI সহায়কের সাহায্যে সিদ্ধান্ত নিন।",
  keywords: ["Bangladesh bank", "loan calculator", "DPS", "FD", "financial comparison", "আর্থিক সহায়ক"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "আর্থিক সহায়ক",
  },
  openGraph: {
    title: "আর্থিক সহায়ক — Bangladesh Financial Companion",
    description: "বাংলাদেশের জন্য গোপনীয়তা-প্রথম আর্থিক তুলনা প্ল্যাটফর্ম",
    type: "website",
    locale: "bn_BD",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a5050",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn-BD">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        <a href="#main-content" className="skip-link">মূল বিষয়বস্তুতে যান</a>
        <div className="app-shell">
          <AppHeader />
          <main className="page-content" id="main-content">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
