// frontend/src/components/FAQAccordion.js
import React, { useState } from "react";

export default function FAQAccordion({ items }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div>
      {items.map(f => (
        <div
          key={f.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginBottom: 12,
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        >
          {/* Accordion header */}
          <button
            onClick={() => toggle(f.id)}
            style={{
              all: "unset",
              cursor: "pointer",
              width: "100%",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: 500,
              color: "#111827"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Icon placeholder based on category */}
              <span style={{ fontSize: "18px", color: "#2563eb" }}>
                {f.category === "Account"
                  ? "👤"
                  : f.category === "Payments"
                  ? "💳"
                  : f.category === "Security"
                  ? "🔒"
                  : f.category === "API Integration"
                  ? "</>"
                  : "❓"}
              </span>
              {f.question}
            </span>
            <span style={{ fontSize: "18px", color: "#6b7280" }}>
              {openId === f.id ? "▾" : "›"}
            </span>
          </button>

          {/* Accordion content */}
          {openId === f.id && (
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #eee",
                background: "#f9fafb",
                color: "#374151"
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{f.answer}</div>
              {f.source_url && (
                <div style={{ marginTop: 8 }}>
                  <a href={f.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                    🔗 Read more
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
