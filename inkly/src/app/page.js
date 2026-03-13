/**
 * @purpose: Landing page for Inkly — redirects to the writing experience.
 * @features: Gradient hero, call-to-action link to /write.
 * @params: None (page component).
 */

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3.5rem",
          fontWeight: 700,
          background: "linear-gradient(135deg, #6c5ce7, #a29bfe, #6c5ce7)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 1rem",
          letterSpacing: "-0.03em",
        }}
      >
        Inkly
      </h1>
      <p
        style={{
          fontSize: "1.15rem",
          color: "var(--text-secondary)",
          maxWidth: "420px",
          lineHeight: 1.6,
          margin: "0 0 2rem",
        }}
      >
        An AI-powered notes app with rich typography, draggable media, and a
        beautiful writing experience.
      </p>
      <Link
        href="/write"
        style={{
          padding: "14px 36px",
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, #6c5ce7, #7c6ef7)",
          color: "#fff",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: 600,
          boxShadow: "0 4px 24px rgba(108, 92, 231, 0.35)",
          transition: "all 0.2s ease",
        }}
      >
        Start Writing →
      </Link>
    </main>
  );
}
