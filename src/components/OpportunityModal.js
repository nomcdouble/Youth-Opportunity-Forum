"use client";

import { COLORS, FONT, Chip, AgeChip } from "./theme";
import { formatDeadline } from "../lib/formatDeadline";

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.inkDim,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <div>{children}</div>
    </div>
  );
}

export default function OpportunityModal({
  listing,
  onClose,
  mode = "view",
  onApprove,
  onDecline,
  acting = false,
}) {
  if (!listing) return null;

  const ages = listing.ages || [];
  const whoCanApply = listing.who_can_apply || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 24, 40, 0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: 14,
          maxWidth: 640,
          width: "100%",
          padding: "32px 36px 36px",
          position: "relative",
          fontFamily: FONT,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            background: "none",
            border: "none",
            fontSize: 20,
            color: COLORS.inkDim,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
            paddingRight: 24,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.ink,
              }}
            >
              {listing.role_name}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: COLORS.inkDim }}>
              {listing.company_name}
            </p>
          </div>

          {mode === "view" ? (
            <a
              href={listing.website_url || "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                background: COLORS.purple,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 18px",
                borderRadius: 8,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Apply Now
            </a>
          ) : (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onApprove && onApprove(listing.id)}
                disabled={acting || listing.status === "approved"}
                style={{
                  background: COLORS.approvedText,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: listing.status === "approved" ? 0.5 : 1,
                }}
              >
                Approve
              </button>
              <button
                onClick={() => onDecline && onDecline(listing.id)}
                disabled={acting}
                style={{
                  background: COLORS.declinedText,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Decline
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 32px",
          }}
        >
          <div>
            <Field label="Age:">
              {ages.length > 0 ? ages.map((a) => <AgeChip key={a} age={a} />) : "—"}
            </Field>

            <Field label="Season:">
              <Chip>{formatDeadline(listing.application_deadline)}</Chip>
            </Field>

            <Field label="This Opportunity is Only Open To:">
              {whoCanApply.length > 0 ? (
                whoCanApply.map((w) => <Chip key={w}>{w}</Chip>)
              ) : (
                <Chip>All Students</Chip>
              )}
            </Field>

            <Field label="Description:">
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink, margin: 0 }}>
                {listing.description}
              </p>
              {listing.role_requirements && (
                <p
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: COLORS.inkDim,
                    marginTop: 10,
                  }}
                >
                  <strong>Requirements:</strong> {listing.role_requirements}
                </p>
              )}
            </Field>
          </div>

          <div>
            <Field label="Mode:">
              <Chip>{listing.mode}</Chip>
            </Field>

            <Field label="Location:">
              <Chip>{listing.location || "Remote"}</Chip>
            </Field>

            <Field label="Address:">
              <span style={{ fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>
                {[listing.street_address, listing.location, listing.zip_code]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </Field>

            <Field label="Program Fee/Tuition:">
              <Chip>{listing.fee_status}</Chip>
            </Field>

            <Field label="Paid Status:">
              <Chip>{listing.paid_status}</Chip>
            </Field>

            {listing.application_deadline && (
              <Field label="Application Deadline:">
                <span style={{ fontSize: 13, color: COLORS.ink, fontWeight: 600 }}>
                  {formatDeadline(listing.application_deadline)}
                </span>
              </Field>
            )}

            {mode === "moderate" && (
              <Field label="Contact:">
                <span style={{ fontSize: 13, color: COLORS.ink }}>
                  {listing.email}
                  {listing.mentor_linkedin_url && (
                    <>
                      {" · "}
                      <a
                        href={listing.mentor_linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: COLORS.purple }}
                      >
                        mentor LinkedIn
                      </a>
                    </>
                  )}
                </span>
              </Field>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
