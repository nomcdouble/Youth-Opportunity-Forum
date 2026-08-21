"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COLORS, FONT } from "./theme";

const MENU_ITEMS = [
  { label: "Search Opportunities", href: "/" },
  { label: "List a New Opportunity", href: "/apply" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "18px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Menu"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: open ? COLORS.cardBg : "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              color: COLORS.ink,
              width: 38,
              height: 38,
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span style={{ width: 18, height: 2, background: COLORS.ink, borderRadius: 2 }} />
            <span style={{ width: 18, height: 2, background: COLORS.ink, borderRadius: 2 }} />
            <span style={{ width: 18, height: 2, background: COLORS.ink, borderRadius: 2 }} />
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "#ffffff",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                boxShadow: "0 12px 30px rgba(20,24,40,0.15)",
                minWidth: 220,
                padding: 6,
                zIndex: 1100,
              }}
            >
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.ink,
                    textDecoration: "none",
                    fontFamily: FONT,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/"
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 20,
            color: COLORS.ink,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Youth Opportunity Forum
        </Link>
      </div>
    </header>
  );
}
