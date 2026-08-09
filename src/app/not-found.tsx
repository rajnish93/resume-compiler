import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#090d16", color: "#f8fafc", padding: "24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "5rem", fontWeight: 800, margin: 0, color: "#38bdf8" }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "8px", marginBottom: "16px" }}>Page Not Found</h2>
      <p style={{ color: "#94a3b8", maxWidth: "420px", marginBottom: "28px" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: "10px 22px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Return to Resume Builder
      </Link>
    </div>
  );
}
