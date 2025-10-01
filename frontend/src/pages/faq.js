// frontend/src/pages/FAQPage.js
import React, { useEffect, useState } from "react";
import FAQAccordion from "../components/FAQAccordion";

function parseMarkdownToReact(text) {
  const lines = (text || "").split("\n");
  return lines.map((line, idx) => {
    if (/^####\s/.test(line)) return <h4 key={idx}>{line.replace(/^####\s/, "")}</h4>;
    if (/^###\s/.test(line)) return <h3 key={idx}>{line.replace(/^###\s/, "")}</h3>;
    if (/^##\s/.test(line)) return <h2 key={idx}>{line.replace(/^##\s/, "")}</h2>;
    if (/^#\s/.test(line)) return <h1 key={idx}>{line.replace(/^#\s/, "")}</h1>;

    const boldParsed = line.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
      return part;
    });

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      return (
        <p key={idx} style={{ marginLeft: 20 }}>
          {boldParsed.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>)}
        </p>
      );
    }

    return (
      <p key={idx}>
        {boldParsed.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>)}
      </p>
    );
  });
}

export default function FAQPage() {
  const [faqsByCat, setFaqsByCat] = useState({});
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || "https://faq-api-dev.payintelli.com";

  //const API_BASE = process.env.REACT_APP_API_BASE || "http://13.201.38.90:8000";

  useEffect(() => {
    fetch(`${API_BASE}/api/faqs`)
      .then((r) => r.json())
      .then(setFaqsByCat)
      .catch(console.error);
  }, [API_BASE]);

  const categories = [
    { name: "All Categories", icon: "" },
    { name: "Account", icon: "" },
    { name: "Payments", icon: "" },
    { name: "Security", icon: "" },
    { name: "API Integration", icon: "" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearchResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs =
    activeCategory === "All Categories"
      ? Object.values(faqsByCat).flat()
      : faqsByCat[activeCategory] || [];

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "32px", fontWeight: "bold" }}>
        Frequently Asked Questions
      </h1>
      <p style={{ textAlign: "center", color: "#555", marginBottom: 30 }}>
        Find answers to common questions about account management, payments, security,
        and our API.
      </p>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", justifyContent: "center", marginBottom: 12, gap: 8 }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question..."
          style={{
            width: "70%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#87a3deff",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Ask
        </button>
      </form>

      {loading && <p style={{ textAlign: "center" }}>Searching...</p>}

      {searchResult && (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#f9fafb",
          }}
        >
          {/* FAQ result */}
          {searchResult.source === "faq" && (
            <>
              {searchResult.retrieved?.length > 0 ? (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
                    {searchResult.retrieved[0].question}
                  </h2>
                  <div style={{ color: "#111827", whiteSpace: "pre-wrap" }}>
                    {searchResult.answer}
                  </div>
                </>
              ) : (
                <div style={{ color: "#6b7280", fontStyle: "italic" }}>
                  {searchResult.answer}
                </div>
              )}
            </>
          )}

          {/* Docs result */}
          {searchResult.source === "docs" && searchResult.retrieved?.length > 0 && (
            <div style={{ fontSize: 14, color: "#111827", lineHeight: 1.6 }}>
              {parseMarkdownToReact(searchResult.retrieved[0].merged_content)}
              <div style={{ marginTop: 8, fontSize: 13, color: "#2563eb" }}>
                Source file: {searchResult.retrieved[0].filename}
              </div>
            </div>
          )}

          {/* 🔥 Fallback for when source=null and retrieved=[] */}
          {(!searchResult.source || searchResult.retrieved?.length === 0) && (
            <div style={{ color: "#6b7280", fontStyle: "italic" }}>
              {searchResult.answer}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {categories.map((cat) => {
          const count =
            cat.name === "All Categories"
              ? Object.values(faqsByCat).flat().length
              : (faqsByCat[cat.name] || []).length;

          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                border: "1px solid #ddd",
                backgroundColor: activeCategory === cat.name ? "#111827" : "white",
                color: activeCategory === cat.name ? "white" : "#111827",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <span>{cat.icon}</span>
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      <FAQAccordion items={filteredFaqs} />

      <div
        style={{
          marginTop: 40,
          padding: 24,
          borderRadius: 12,
          border: "1px solid #cce4ff",
          backgroundColor: "#f0f8ff",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Still need help?
        </h2>
        <p style={{ marginBottom: 20, color: "#333" }}>
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#bae6fd",
              color: "#0369a1",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={() => (window.location.href = "/contact-support")}
          >
            ☎ Contact Support
          </button>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#bae6fd",
              color: "#0369a1",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={() => (window.location.href = "/documentation")}
          >
            📖 Browse Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
