"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import ListingForm from "../../components/ListingForm";
import { COLORS, FONT } from "../../components/theme";

export default function ApplyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload) {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed.");
      router.push("/");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: FONT,
  };

  return (
    <div style={pageStyle}>
      <SiteHeader />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link
          href="/"
          style={{ fontSize: 12, color: COLORS.inkDim, textDecoration: "none" }}
        >
          ← Back to the board
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.ink, marginTop: 12 }}>
          List a Role
        </h1>
        <p style={{ color: COLORS.inkDim, fontSize: 13 }}>
          Submit an opportunity for review. Approved listings appear on the public
          board.
        </p>

        <ListingForm
          mode="create"
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="SUBMIT FOR REVIEW"
        />
      </div>
    </div>
  );
}
