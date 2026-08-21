"use client";

import { useState } from "react";
import { COLORS, inputStyle } from "./theme";

const AGES = ["13", "14", "15", "16", "17", "18+"];
const MODES = ["In person", "Remote", "Hybrid"];
const PAID = ["Paid", "Unpaid"];
const FEE = ["Free", "Charges a Fee"];
const WHO_CAN_APPLY = [
  "All Students",
  "Public High School Students Only",
  "Underrepresented Students Only",
  "Female Identifying Students Only",
  "LGBTQ+ Students Only",
  "Low Income Students Only",
  "Male Identifying Students Only",
  "Jewish Identifying Students Only",
];

const CITIZENSHIP_PREFIX = "Must be citizens of ";
const OTHER_PREFIX = "Other: ";

// Quick-pick deadline options. These live alongside the deadline text field
// as buttons: clicking one sets application_deadline to that label (or a
// combination of labels) instead of a typed-in value.
export const QUICK_DEADLINES = ["Summer", "School Year", "Contact for deadline"];

// "Summer" and "School Year" can be selected together; "Contact for
// deadline" is exclusive of both and turns them off when picked.
const TOGGLE_DEADLINES = ["Summer", "School Year"];
const EXCLUSIVE_DEADLINE = "Contact for deadline";
const QUICK_DEADLINE_SEPARATOR = "-";

// Combines the selected quick-pick labels into the string that actually
// gets stored as application_deadline, e.g. ["Summer", "School Year"] ->
// "Summer-School Year". application_deadline is just a free-form string
// (letters, numbers, and dashes), so this is a perfectly valid value.
function buildQuickPickString(selected) {
  if (selected.includes(EXCLUSIVE_DEADLINE)) return EXCLUSIVE_DEADLINE;
  return selected.join(QUICK_DEADLINE_SEPARATOR);
}

// The inverse of buildQuickPickString: given a stored application_deadline
// string, figure out which quick-pick buttons (if any) it represents.
function parseQuickPickString(deadline) {
  const trimmed = (deadline || "").trim();
  if (!trimmed) return [];

  if (trimmed.toLowerCase() === EXCLUSIVE_DEADLINE.toLowerCase()) {
    return [EXCLUSIVE_DEADLINE];
  }

  const parts = trimmed.split(QUICK_DEADLINE_SEPARATOR).map((p) => p.trim());
  const matched = parts
    .map((p) => TOGGLE_DEADLINES.find((t) => t.toLowerCase() === p.toLowerCase()))
    .filter(Boolean);

  // Only treat this as a quick-pick combo if every dash-separated part
  // matched a known toggle option - otherwise it's just a custom string
  // (e.g. "TBD-2026") that happens to contain a dash.
  if (matched.length === parts.length && matched.length > 0) {
    return matched;
  }
  return [];
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.inkDim,
  display: "block",
  marginTop: 18,
  marginBottom: 4,
};

function Checkbox({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: COLORS.ink,
        marginRight: 14,
        marginTop: 8,
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export const initialForm = {
  email: "",
  company_name: "",
  role_name: "",
  website_url: "",
  ages: [],
  mode: "In person",
  location: "",
  street_address: "",
  zip_code: "",
  description: "",
  role_requirements: "",
  application_deadline: "",
  deadline_quick_pick: [],
  paid_status: "Paid",
  fee_status: "Free",
  who_can_apply: [],
  citizenship_checked: false,
  citizenship_country: "",
  who_other_checked: false,
  who_other_text: "",
  mentor_linkedin_url: "",
  agreed_tos: false,
};

// Turns a stored listing (as returned from the API/DB) back into editable
// form state - the inverse of the payload built in handleSubmit below.
export function deriveFormFromListing(listing) {
  if (!listing) return initialForm;

  const who = listing.who_can_apply || [];
  const citizenship = who.find((w) => w.startsWith(CITIZENSHIP_PREFIX));
  const other = who.find((w) => w.startsWith(OTHER_PREFIX));
  const baseWho = who.filter((w) => w !== citizenship && w !== other);

  const deadline = listing.application_deadline || "";
  const quickPicks = parseQuickPickString(deadline);

  return {
    email: listing.email || "",
    company_name: listing.company_name || "",
    role_name: listing.role_name || "",
    website_url: listing.website_url || "",
    ages: listing.ages || [],
    mode: listing.mode || "In person",
    location: listing.location || "",
    street_address: listing.street_address || "",
    zip_code: listing.zip_code || "",
    description: listing.description || "",
    role_requirements: listing.role_requirements || "",
    application_deadline: quickPicks.length ? "" : deadline,
    deadline_quick_pick: quickPicks,
    paid_status: listing.paid_status || "Paid",
    fee_status: listing.fee_status || "Free",
    who_can_apply: baseWho,
    citizenship_checked: Boolean(citizenship),
    citizenship_country: citizenship
      ? citizenship.slice(CITIZENSHIP_PREFIX.length)
      : "",
    who_other_checked: Boolean(other),
    who_other_text: other ? other.slice(OTHER_PREFIX.length) : "",
    mentor_linkedin_url: listing.mentor_linkedin_url || "",
    agreed_tos: true,
  };
}

function DeadlineField({ form, set, setForm }) {
  const selected = form.deadline_quick_pick;
  const active = selected.length > 0;
  const displayString = buildQuickPickString(selected);

  function pick(value) {
    setForm((prev) => {
      const prevSelected = prev.deadline_quick_pick;
      let next;

      if (value === EXCLUSIVE_DEADLINE) {
        // Toggle "Contact for deadline" on/off. Selecting it always
        // replaces (turns off) any selected Summer / School Year.
        const alreadyOnlyExclusive =
          prevSelected.length === 1 && prevSelected[0] === EXCLUSIVE_DEADLINE;
        next = alreadyOnlyExclusive ? [] : [EXCLUSIVE_DEADLINE];
      } else {
        // Toggle Summer / School Year - both can be on at once. Picking
        // either one turns "Contact for deadline" off.
        const withoutExclusive = prevSelected.filter((v) => v !== EXCLUSIVE_DEADLINE);
        next = withoutExclusive.includes(value)
          ? withoutExclusive.filter((v) => v !== value)
          : [...withoutExclusive, value];
      }

      return {
        ...prev,
        deadline_quick_pick: next,
        application_deadline: next.length ? "" : prev.application_deadline,
      };
    });
  }

  return (
    <>
      <label style={labelStyle}>
        Application deadline (optional)
        {active ? (
          // A quick-pick combo is active - show that string in place of
          // the free-text field instead of letting it be edited directly.
          <div
            style={{
              ...inputStyle,
              display: "flex",
              alignItems: "center",
              opacity: 0.7,
            }}
          >
            {displayString}
          </div>
        ) : (
          <input
            type="text"
            placeholder="e.g. 2026-03-15, Rolling, TBD-2026"
            pattern="[A-Za-z0-9\- ]*"
            title="Letters, numbers, dashes, and spaces only"
            value={form.application_deadline}
            onChange={(e) => set("application_deadline", e.target.value)}
            style={inputStyle}
          />
        )}
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_DEADLINES.map((q) => {
          const isActive = selected.includes(q);
          return (
            <button
              type="button"
              key={q}
              onClick={() => pick(q)}
              style={{
                background: isActive ? COLORS.purple : "transparent",
                color: isActive ? "#ffffff" : COLORS.ink,
                border: `1px solid ${isActive ? COLORS.purple : COLORS.border}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {q}
            </button>
          );
        })}
      </div>
    </>
  );
}

/**
 * Shared listing form used both to create a new listing (/apply) and to
 * edit an existing one from the moderation queue. The caller supplies
 * `initialListing` (null for a brand-new submission) and an `onSubmit`
 * handler that receives the built payload.
 */
export default function ListingForm({
  initialListing = null,
  mode = "create", // "create" | "edit"
  onSubmit,
  onCancel,
  submitting = false,
  error = "",
  submitLabel,
}) {
  const [form, setForm] = useState(() => deriveFormFromListing(initialListing));
  const [localError, setLocalError] = useState("");

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (form.citizenship_checked && !form.citizenship_country.trim()) {
      setLocalError("Please specify which country citizenship is required for.");
      return;
    }
    if (form.who_other_checked && !form.who_other_text.trim()) {
      setLocalError('Please specify the "Other" eligibility requirement.');
      return;
    }

    const who_can_apply = [...form.who_can_apply];
    if (form.citizenship_checked) {
      who_can_apply.push(`${CITIZENSHIP_PREFIX}${form.citizenship_country.trim()}`);
    }
    if (form.who_other_checked) {
      who_can_apply.push(`${OTHER_PREFIX}${form.who_other_text.trim()}`);
    }

    const payload = {
      email: form.email,
      company_name: form.company_name,
      role_name: form.role_name,
      website_url: form.website_url,
      ages: form.ages,
      mode: form.mode,
      who_can_apply,
      application_deadline:
        (form.deadline_quick_pick.length
          ? buildQuickPickString(form.deadline_quick_pick)
          : form.application_deadline) || null,
      role_requirements: form.role_requirements || null,
      location: form.mode === "Remote" ? null : form.location,
      street_address: form.mode === "Remote" ? null : form.street_address,
      zip_code: form.mode === "Remote" ? null : form.zip_code,
      description: form.description,
      paid_status: form.paid_status,
      fee_status: form.fee_status,
      mentor_linkedin_url: form.mentor_linkedin_url,
      agreed_tos: true,
    };

    onSubmit && onSubmit(payload);
  }

  const shownError = error || localError;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <label style={labelStyle}>
        Email *
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Company or organization name *
        <input
          required
          value={form.company_name}
          onChange={(e) => set("company_name", e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Name of role *
        <input
          required
          value={form.role_name}
          onChange={(e) => set("role_name", e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Link to website *
        <input
          type="text"
          required
          placeholder="yourcompany.com"
          value={form.website_url}
          onChange={(e) => set("website_url", e.target.value)}
          style={inputStyle}
        />
      </label>

      <div style={labelStyle}>Ages *</div>
      <div>
        {AGES.map((a) => (
          <Checkbox
            key={a}
            label={a}
            checked={form.ages.includes(a)}
            onChange={() => set("ages", toggleInArray(form.ages, a))}
          />
        ))}
      </div>

      <label style={labelStyle}>
        Mode *
        <select
          value={form.mode}
          onChange={(e) => set("mode", e.target.value)}
          style={inputStyle}
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {form.mode !== "Remote" && (
        <label style={labelStyle}>
          Location (city, state) *
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            style={inputStyle}
          />
        </label>
      )}

      {form.mode !== "Remote" && (
        <>
          <label style={{ ...labelStyle, marginTop: 24 }}>
            Street address *
            <input
              required
              placeholder="123 Main St, Suite 400"
              value={form.street_address}
              onChange={(e) => set("street_address", e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            ZIP / postal code (optional)
            <input
              value={form.zip_code}
              onChange={(e) => set("zip_code", e.target.value)}
              style={inputStyle}
            />
          </label>
        </>
      )}

      <label style={labelStyle}>
        Describe what your company or organization does (2-3 sentences) *
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      <label style={labelStyle}>
        Role requirements (optional)
        <textarea
          rows={2}
          value={form.role_requirements}
          onChange={(e) => set("role_requirements", e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      <DeadlineField form={form} set={set} setForm={setForm} />

      <label style={labelStyle}>
        Paid or unpaid? *
        <select
          value={form.paid_status}
          onChange={(e) => set("paid_status", e.target.value)}
          style={inputStyle}
        >
          {PAID.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Is this a free program? *
        <select
          value={form.fee_status}
          onChange={(e) => set("fee_status", e.target.value)}
          style={inputStyle}
        >
          {FEE.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <div style={labelStyle}>Who can apply? *</div>
      <div>
        {WHO_CAN_APPLY.map((w) => (
          <Checkbox
            key={w}
            label={w}
            checked={form.who_can_apply.includes(w)}
            onChange={() => set("who_can_apply", toggleInArray(form.who_can_apply, w))}
          />
        ))}
        <Checkbox
          label="Must be citizens of..."
          checked={form.citizenship_checked}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              citizenship_checked: e.target.checked,
              citizenship_country: e.target.checked ? prev.citizenship_country : "",
            }))
          }
        />
        {form.citizenship_checked && (
          <input
            type="text"
            required
            placeholder="Country (e.g. United States)"
            value={form.citizenship_country}
            onChange={(e) => set("citizenship_country", e.target.value)}
            style={{ ...inputStyle, marginTop: 6, marginBottom: 4 }}
          />
        )}
        <Checkbox
          label="Other"
          checked={form.who_other_checked}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              who_other_checked: e.target.checked,
              who_other_text: e.target.checked ? prev.who_other_text : "",
            }))
          }
        />
        {form.who_other_checked && (
          <input
            type="text"
            required
            placeholder="Describe who can apply"
            value={form.who_other_text}
            onChange={(e) => set("who_other_text", e.target.value)}
            style={{ ...inputStyle, marginTop: 6, marginBottom: 4 }}
          />
        )}
      </div>

      <label style={labelStyle}>
        LinkedIn profile of the mentor/manager (must be 18+) *
        <input
          required
          type="text"
          placeholder="linkedin.com/in/..."
          value={form.mentor_linkedin_url}
          onChange={(e) => set("mentor_linkedin_url", e.target.value)}
          style={inputStyle}
        />
      </label>

      {mode === "create" && (
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 12,
            color: COLORS.inkDim,
            marginTop: 20,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            required
            checked={form.agreed_tos}
            onChange={(e) => set("agreed_tos", e.target.checked)}
          />
          I agree to the Youth Opportunity Forum Terms of Service. *
        </label>
      )}

      {shownError && (
        <p style={{ color: "#a3341a", fontSize: 13 }}>{shownError}</p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            background: COLORS.purple,
            border: "none",
            borderRadius: 8,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            padding: "12px 12px",
            cursor: "pointer",
            opacity: submitting ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          {submitting
            ? mode === "create"
              ? "SUBMITTING…"
              : "SAVING…"
            : submitLabel || (mode === "create" ? "SUBMIT FOR REVIEW" : "SAVE CHANGES")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.inkDim,
              borderRadius: 8,
              padding: "12px 16px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
