import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি — আর্থিক সহায়ক",
  description: "আমরা কীভাবে আপনার তথ্য সুরক্ষিত রাখি এবং কোনো ব্যক্তিগত তথ্য সংরক্ষণ করি না।",
};

const PRIVACY_POINTS = [
  {
    icon: "🔒",
    title: "আপনার সংখ্যাগুলো আপনার ফোনেই থাকে",
    body: "ঋণ হিসাব, আর্থিক স্বাস্থ্য ও ক্যাশবুক — সব কিছু আপনার ডিভাইসে হিসাব হয়। কোনো সংখ্যা সার্ভারে পাঠানো হয় না।",
  },
  {
    icon: "📊",
    title: "শুধু সার্বজনীন পণ্য তথ্য সংরক্ষিত",
    body: "আমরা শুধু বাংলাদেশ ব্যাংক ও ব্যাংকের সরকারি ওয়েবসাইট থেকে পণ্যের তথ্য সংগ্রহ করি।",
  },
  {
    icon: "📡",
    title: "সীমিত অ্যানালিটিক্স",
    body: "আমরা শুধু পরিসংখ্যানগত তথ্য সংগ্রহ করি (যেমন: কতজন ঋণ চেকার ব্যবহার করলেন) — কোনো ব্যক্তিগত তথ্য নয়।",
  },
  {
    icon: "🚫",
    title: "কোনো লগইন নেই (Phase 1)",
    body: "Phase 1-এ কোনো অ্যাকাউন্ট তৈরির প্রয়োজন নেই। আপনি সম্পূর্ণ বেনামে সেবা ব্যবহার করতে পারবেন।",
  },
  {
    icon: "🗑️",
    title: "ডকুমেন্ট স্বয়ংক্রিয়ভাবে মুছে যায়",
    body: "যদি সার্ভারে কোনো ডকুমেন্ট তৈরি হয়, তা ২ ঘণ্টার মধ্যে স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।",
  },
  {
    icon: "ℹ️",
    title: "এটি তথ্য সেবা, পরামর্শ নয়",
    body: "আমরা কোনো ব্যক্তিগত আর্থিক পরামর্শ দিই না। সকল তথ্য সাধারণ শিক্ষামূলক উদ্দেশ্যে।",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="section-header">
        <h1 className="section-title">গোপনীয়তা নীতি</h1>
        <p className="section-subtitle">
          আমরা আপনার বিশ্বাসকে সম্মান করি
        </p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {PRIVACY_POINTS.map((point, i) => (
          <div
            key={i}
            className="card"
            style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}
          >
            <span style={{ fontSize: "var(--font-size-xl)", flexShrink: 0 }} aria-hidden="true">
              {point.icon}
            </span>
            <div>
              <p style={{ fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--space-1)" }}>
                {point.title}
              </p>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                {point.body}
              </p>
            </div>
          </div>
        ))}

        <div className="disclaimer" role="note">
          এই নীতি পর্যায়ক্রমে আপডেট হতে পারে। যেকোনো পরিবর্তনে আমরা ব্যবহারকারীদের জানাব।
          সর্বশেষ আপডেট: মে ২০২৬
        </div>
      </div>
    </>
  );
}
