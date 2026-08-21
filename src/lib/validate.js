const VALID_MODES = ["In person", "Remote", "Hybrid"];
const VALID_PAID = ["Paid", "Unpaid"];
const VALID_FEE = ["Free", "Charges a Fee"];
const VALID_AGES = ["13", "14", "15", "16", "17", "18+"];
const VALID_WHO_CAN_APPLY = [
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

function isValidWhoCanApply(w) {
  if (typeof w !== "string") return false;
  if (VALID_WHO_CAN_APPLY.includes(w)) return true;
  if (w.startsWith(CITIZENSHIP_PREFIX) && w.length > CITIZENSHIP_PREFIX.length) {
    return true;
  }
  if (w.startsWith(OTHER_PREFIX) && w.length > OTHER_PREFIX.length) {
    return true;
  }
  return false;
}

// application_deadline is a free-form string (not a date/int) - it can be
// a typed-in date, "Rolling", "TBD-2026", or a quick-pick combo like
// "Summer-School Year". Letters, numbers, dashes, and spaces are allowed;
// anything else is rejected.
const DEADLINE_PATTERN = /^[A-Za-z0-9\- ]+$/;

function isValidDeadlineString(value) {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value !== "string") return false;
  return DEADLINE_PATTERN.test(value.trim());
}

function normalizeUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Accept any string as a URL - just make sure it has a protocol.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateApplication(body) {
  const b = body || {};

  const required = [
    "email",
    "company_name",
    "role_name",
    "website_url",
    "mode",
    "description",
    "paid_status",
    "fee_status",
    "mentor_linkedin_url",
  ];
  for (const field of required) {
    if (!b[field] || typeof b[field] !== "string" || !b[field].trim()) {
      return { ok: false, error: `${field} is required` };
    }
  }

  if (!Array.isArray(b.ages) || b.ages.length === 0) {
    return { ok: false, error: "ages must be a non-empty array" };
  }
  if (b.ages.some((a) => !VALID_AGES.includes(a))) {
    return {
      ok: false,
      error: `ages must only contain: ${VALID_AGES.join(", ")}`,
    };
  }

  if (!Array.isArray(b.who_can_apply) || b.who_can_apply.length === 0) {
    return { ok: false, error: "who_can_apply must be a non-empty array" };
  }
  if (b.who_can_apply.some((w) => !isValidWhoCanApply(w))) {
    return {
      ok: false,
      error: `who_can_apply must only contain: ${VALID_WHO_CAN_APPLY.join(", ")}, or a \"${CITIZENSHIP_PREFIX}...\" / \"${OTHER_PREFIX}...\" entry`,
    };
  }

  if (!VALID_MODES.includes(b.mode)) {
    return { ok: false, error: `mode must be one of: ${VALID_MODES.join(", ")}` };
  }
  if (b.mode !== "Remote" && !(b.location && b.location.trim())) {
    return { ok: false, error: "location is required unless mode is Remote" };
  }
  if (b.mode !== "Remote" && !(b.street_address && b.street_address.trim())) {
    return { ok: false, error: "street_address is required unless mode is Remote" };
  }

  if (!VALID_PAID.includes(b.paid_status)) {
    return { ok: false, error: `paid_status must be one of: ${VALID_PAID.join(", ")}` };
  }
  if (!VALID_FEE.includes(b.fee_status)) {
    return { ok: false, error: `fee_status must be one of: ${VALID_FEE.join(", ")}` };
  }

  if (!isValidDeadlineString(b.application_deadline)) {
    return {
      ok: false,
      error: "application_deadline may only contain letters, numbers, dashes, and spaces",
    };
  }

  if (b.agreed_tos !== true) {
    return { ok: false, error: "agreed_tos must be true" };
  }

  return {
    ok: true,
    value: {
      email: b.email.trim(),
      company_name: b.company_name.trim(),
      role_name: b.role_name.trim(),
      website_url: normalizeUrl(b.website_url),
      ages: b.ages,
      mode: b.mode,
      location: b.location ? b.location.trim() : null,
      street_address: b.street_address ? b.street_address.trim() : null,
      zip_code: b.zip_code ? b.zip_code.trim() : null,
      description: b.description.trim(),
      role_requirements: b.role_requirements ? b.role_requirements.trim() : null,
      application_deadline: b.application_deadline ? b.application_deadline.trim() : null,
      paid_status: b.paid_status,
      fee_status: b.fee_status,
      who_can_apply: b.who_can_apply,
      mentor_linkedin_url: normalizeUrl(b.mentor_linkedin_url),
      agreed_tos: true,
    },
  };
}
