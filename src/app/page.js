"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import HeroSection from "../components/HeroSection";
import OpportunityModal from "../components/OpportunityModal";
import { COLORS, FONT, Chip, inputStyle } from "../components/theme";
import { formatDeadline } from "../lib/formatDeadline";

const AGE_OPTIONS = ["13", "14", "15", "16", "17", "18+"];
const MODE_OPTIONS = ["In person", "Remote", "Hybrid"];
const PAID_OPTIONS = ["Paid", "Unpaid"];
const FEE_OPTIONS = ["Free", "Charges a Fee"];

const selectStyle = {
  ...inputStyle,
  padding: "8px 10px",
  fontSize: 12,
  color: COLORS.inkDim,
  minWidth: 110,
};

export default function BoardPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const [query, setQuery] = useState("");
  const [age, setAge] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [location, setLocation] = useState("");
  const [paid, setPaid] = useState("");
  const [fee, setFee] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeFilterCount = [age, modeFilter, location, paid, fee].filter(
    Boolean
  ).length;

  useEffect(() => {
    load();

    let channel;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("yof-board");
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;
        if (msg.type === "removed") {
          setListings((prev) => prev.filter((l) => l.id !== msg.id));
          setSelected((prev) => (prev && prev.id === msg.id ? null : prev));
        } else if (msg.type === "refresh") {
          refresh();
        }
      };
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", { cache: "no-store" });
      if (!res.ok) throw new Error("Couldn't load listings.");
      const json = await res.json();
      setListings(json.listings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/listings", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setListings(json.listings || []);
      setSelected(null);
    } catch {
    } finally {
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (
        query &&
        !`${l.company_name} ${l.role_name} ${l.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      if (age && !(l.ages || []).includes(age)) return false;
      if (modeFilter && l.mode !== modeFilter) return false;
      if (
        location &&
        !(l.location || "").toLowerCase().includes(location.toLowerCase())
      )
        return false;
      if (paid && l.paid_status !== paid) return false;
      if (fee && l.fee_status !== fee) return false;
      return true;
    });
  }, [listings, query, age, modeFilter, location, paid, fee]);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: FONT }}>
      <SiteHeader />
      <HeroSection />

      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              color: COLORS.teal,
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Search for Opportunities
          </h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: filtersOpen ? 14 : 28,
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Opportunities..."
              style={{
                ...inputStyle,
                borderRadius: 24,
                padding: "12px 18px",
                fontSize: 14,
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: filtersOpen ? COLORS.purple : "#ffffff",
                color: filtersOpen ? "#ffffff" : COLORS.ink,
                border: `1px solid ${filtersOpen ? COLORS.purple : COLORS.border}`,
                borderRadius: 24,
                padding: "0 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#ffffff",
                color: COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 24,
                padding: "0 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: refreshing ? "default" : "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {filtersOpen && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 28,
                padding: 16,
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
              }}
            >
              <select value={age} onChange={(e) => setAge(e.target.value)} style={selectStyle}>
                <option value="">Age: All</option>
                {AGE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="">Mode: All</option>
                {MODE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location:"
                style={{ ...selectStyle, width: 140 }}
              />
              <select value={paid} onChange={(e) => setPaid(e.target.value)} style={selectStyle}>
                <option value="">Salary: All</option>
                {PAID_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select value={fee} onChange={(e) => setFee(e.target.value)} style={selectStyle}>
                <option value="">Cost: All</option>
                {FEE_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAge("");
                    setModeFilter("");
                    setLocation("");
                    setPaid("");
                    setFee("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: COLORS.purple,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {error && <p style={{ color: "#a3341a", fontSize: 13 }}>{error}</p>}
          {loading && <p style={{ color: COLORS.inkDim }}>Loading…</p>}

          {!loading && filtered.length === 0 && !error && (
            <p style={{ color: COLORS.inkDim }}>
              No approved listings match your search.{" "}
              <Link href="/apply" style={{ color: COLORS.purple }}>
                Submit one
              </Link>
              .
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((l) => (
              <div
                key={l.id}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink }}>
                    {l.role_name}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.inkDim, margin: "2px 0 8px" }}>
                    {l.company_name}
                  </div>
                  <Chip bg={COLORS.approvedBg} color={COLORS.approvedText}>
                    Approved
                  </Chip>
                  <Chip>{formatDeadline(l.application_deadline)}</Chip>
                </div>
                <button
                  onClick={() => setSelected(l)}
                  style={{
                    background: COLORS.purple,
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  View Opportunity
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <OpportunityModal
          listing={selected}
          mode="view"
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
