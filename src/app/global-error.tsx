"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error caught by Global Error Boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#090d16", color: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ef4444", marginBottom: "12px" }}>
            Something went wrong!
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: "480px", textAlign: "center" }}>
            An unexpected error occurred while rendering the application. You can try refreshing the page or clicking reset.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
