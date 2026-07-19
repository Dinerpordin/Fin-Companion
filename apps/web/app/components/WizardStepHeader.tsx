"use client";

import AudioAssist from "./AudioAssist";

type WizardStepHeaderProps = {
  step: number;
  total: number;
  icon: string;
  title: string;
  audioText: string;
};

/**
 * WizardStepHeader — Reusable header for step-by-step guided flows.
 * Shows a progress bar, large icon, bold question title, and inline audio button.
 * Designed for low-literacy users: icon + audio removes dependency on reading.
 */
export default function WizardStepHeader({
  step,
  total,
  icon,
  title,
  audioText,
}: WizardStepHeaderProps) {
  const progress = (step / total) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* Step counter + progress bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 600 }}>
          ধাপ {step} / {total}
        </span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>
          {Math.round(progress)}% সম্পন্ন
        </span>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`ধাপ ${step} এর ${total}`}
        style={{
          height: "6px",
          background: "var(--color-border-light)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-normal)",
          }}
        />
      </div>

      {/* Large step icon */}
      <div style={{ textAlign: "center", fontSize: "48px", lineHeight: 1, margin: "var(--space-2) 0" }}>
        {icon}
      </div>

      {/* Question title + audio button */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
        <h3
          style={{
            flex: 1,
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          <AudioAssist text={audioText} size="md" />
        </div>
      </div>
    </div>
  );
}
