import React, { useEffect, useState } from "react";
import FAQAccordion from "../components/FAQAccordion";

// Utility function to parse markdown-like text into React elements dynamically
function parseMarkdownToReact(text) {
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    // Headings: ### or #### at start
    if (/^####\s/.test(line)) {
      return <h4 key={idx}>{line.replace(/^####\s/, "")}</h4>;
    }
    if (/^###\s/.test(line)) {
      return <h3 key={idx}>{line.replace(/^###\s/, "")}</h3>;
    }
    if (/^##\s/.test(line)) {
      return <h2 key={idx}>{line.replace(/^##\s/, "")}</h2>;
    }
    if (/^#\s/.test(line)) {
      return <h1 key={idx}>{line.replace(/^#\s/, "")}</h1>;
    }

    // Bold text **...**
    // Since line can have multiple bold parts, replace with <strong>
    const boldParsed = line.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // Bullet points: lines starting with '1.' or '-' or '*'
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      // Extract bullet items - build list for consecutive lines?

      // For simplicity, wrap this line in <li> and the overall parent can be ul/ol later in usage

      // Since we might have to wrap multiple lines in ul/ol,
      // Instead of single line map, we need to group bullet lines.

      // But since context is limited, at least render line with bullet as <li>.
      // For now rendering simplest as <p> with bullet symbol.

      // This will be handled better below.

      // Just return the line with proper bullet symbol and bold parsing for now:
      return (
        <p key={idx} style={{ marginLeft: 20 }}>
          {boldParsed.map((el, i) => (
            <React.Fragment key={i}>{el}</React.Fragment>
          ))}
        </p>
      );
    }

    // Normal paragraphs with bold parsing
    return (
      <p key={idx}>
        {boldParsed.map((el, i) => (
          <React.Fragment key={i}>{el}</React.Fragment>
        ))}
      </p>
    );
  });
}

export default function FAQPage() {
  // Your existing state and logic here (unchanged)...

  const [faqsByCat, setFaqsByCat] = useState({});
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_BASE}/api/faqs`)
      .then((r) => r.json())
      .then(setFaqsByCat)
      .catch(console.error);
  }, []);

  const categories = [
    { name: "All Categories", icon: "" },
    { name: "Account", icon: "" },
    { name: "Payments", icon: "" },
    { name: "Security", icon: "" },
    { name: "API Integration", icon: "</>" },
  ];

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length === 0) {
      setSearchResult(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: val }),
      });
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

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search FAQs or Docs..."
          style={{
            width: "70%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>

      {loading && <p style={{ textAlign: "center" }}>Searching...</p>}
      {searchResult && query.trim().length > 0 && (
        <div
          style={{
            marginBottom: 30,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#f9fafb",
          }}
        >
          {searchResult.source === "faq" && searchResult.retrieved?.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {searchResult.retrieved[0].question}
              </h2>
              <div style={{ color: "#111827", whiteSpace: "pre-wrap" }}>
                {searchResult.answer}
              </div>
            </>
          )}

          {searchResult.source === "docs" && searchResult.retrieved?.length > 0 && (
            <div
              style={{
                fontSize: 14,
                color: "#111827",
                lineHeight: 1.6,
              }}
            >
              {parseMarkdownToReact(searchResult.retrieved[0].merged_content)}

              <div style={{ marginTop: 8, fontSize: 13, color: "#2563eb" }}>
                Source file: {searchResult.retrieved[0].filename}
              </div>
            </div>
          )}
        </div>
      )}

      {!searchResult || searchResult.source !== "docs" ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 30,
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
                    backgroundColor:
                      activeCategory === cat.name ? "#111827" : "white",
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
        </>
      ) : null}

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
