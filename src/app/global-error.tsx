"use client";

// Last resort when even the root layout fails, so the language may be unknown: a minimal page
// with both languages, each block marked with its own lang.
export default function GlobalError({ retry }: { error: Error; retry: () => void }) {
  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#fff8f5",
          color: "#1f1b17",
          fontFamily: "system-ui, 'Noto Sans Bengali', sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p lang="bn" style={{ fontSize: 22, fontWeight: 700 }}>
            কিছু একটা সমস্যা হয়েছে।
          </p>
          <p lang="en" style={{ fontSize: 18 }}>
            Something went wrong.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "#005c55",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <span lang="bn">আবার চেষ্টা করুন</span> · <span lang="en">Try again</span>
          </button>
        </div>
      </body>
    </html>
  );
}
