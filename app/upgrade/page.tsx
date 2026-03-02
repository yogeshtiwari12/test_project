"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "ConiaCloud Starter",
    storage: "10 GB",
    price: "1.00",
    popular: false,
    highlight: false,
    features: [
      "10 GB of storage",
      "Access to ConiaCloud experts",
      "Share with up to 100 ConiaCloud Users",
      "Email support",
    ],
  },
  {
    name: "ConiaCloud Basic",
    storage: "25 GB",
    price: "19.25",
    popular: true,
    highlight: true,
    features: [
      "25 GB of storage",
      "Access to ConiaCloud experts",
      "Share with up to 1000 ConiaCloud Users",
      "Priority email support",
      "Advanced file management",
    ],
  },
  {
    name: "ConiaCloud Standard",
    storage: "100 GB",
    price: "31.25",
    popular: false,
    highlight: false,
    features: [
      "100 GB of storage",
      "Access to ConiaCloud experts",
      "Share unlimited",
      "24/7 priority support",
      "Advanced file management",
      "Custom integrations",
    ],
  },
];

function CheckIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function UpgradePage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f13",
      color: "#e4e4f0",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      padding: "60px 24px 80px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e1e35", border: "1px solid #2a2a3a", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#818cf8" />
          </svg>
          <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 600 }}>Upgrade your plan</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 14, background: "linear-gradient(135deg, #e4e4f0 40%, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Choose the right plan for you
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 460, margin: "0 auto" }}>
          All plans billed annually. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", maxWidth: 1100, margin: "0 auto" }}>
        {plans.map((plan) => {
          const isHovered = hoveredPlan === plan.name;
          const isHighlight = plan.highlight;
          return (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                width: 320,
                background: isHighlight ? "linear-gradient(160deg, #1a1a35 0%, #16162a 100%)" : "#13131e",
                border: `1.5px solid ${isHighlight ? "#6366f1" : isHovered ? "#2a2a4a" : "#1e1e2e"}`,
                borderRadius: 20,
                padding: "28px 28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                position: "relative",
                transform: isHighlight ? "scale(1.04)" : "scale(1)",
                boxShadow: isHighlight ? "0 0 40px rgba(99,102,241,0.15)" : isHovered ? "0 8px 30px rgba(0,0,0,0.3)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
            >
              {/* Popular badge */}
              <div style={{
                position: "absolute",
                top: -13,
                left: 24,
                background: isHighlight ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1e1e35",
                border: `1px solid ${isHighlight ? "transparent" : "#2a2a3a"}`,
                color: isHighlight ? "#fff" : "#9ca3af",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {isHighlight ? "⚡ Most Popular" : "Most Popular"}
              </div>

              {/* Plan name + storage */}
              <div style={{ marginTop: 12, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{plan.name}</p>
                <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: "#e4e4f0" }}>{plan.storage}</h2>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>€</span>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-1px", color: "#e4e4f0", lineHeight: 1 }}>{plan.price.split(".")[0]}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#9ca3af", marginBottom: 2 }}>.{plan.price.split(".")[1]}</span>
                <div style={{ marginBottom: 4, marginLeft: 4 }}>
                  <p style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.3 }}>per</p>
                  <p style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.3 }}>year</p>
                </div>
              </div>

              {/* CTA button */}
              <button
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: isHighlight ? "none" : "1px solid #2a2a3a",
                  background: isHighlight
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : isHovered ? "#1e1e35" : "#161622",
                  color: isHighlight ? "#fff" : "#818cf8",
                  transition: "background 0.15s, transform 0.1s",
                  transform: isHovered ? "translateY(-1px)" : "none",
                  boxShadow: isHighlight && isHovered ? "0 6px 20px rgba(99,102,241,0.35)" : "none",
                } as React.CSSProperties}
              >
                Upgrade
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: "#1e1e2e", margin: "24px 0" }} />

              {/* Features */}
              <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
                What&apos;s included
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#9ca3af" }}>
                    <span style={{ color: isHighlight ? "#818cf8" : "#6366f1", flexShrink: 0, marginTop: 1 }}>
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{ textAlign: "center", marginTop: 48, fontSize: 13, color: "#374151" }}>
        Need a custom plan?{" "}
        <span style={{ color: "#818cf8", cursor: "pointer", textDecoration: "underline" }}>Contact us</span>
        {" · "}
        <Link href="/" style={{ color: "#4b5563", textDecoration: "none" }}>← Back to Drive</Link>
      </p>
    </div>
  );
}
