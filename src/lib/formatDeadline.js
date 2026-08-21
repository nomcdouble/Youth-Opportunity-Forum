const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ordinal(day) {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

// Recognizes a dash-joined combo of quick-pick labels (e.g.
// "Summer-School Year", as produced when both are selected together in the
// form) and renders it back out as a readable string instead of trying to
// parse it as a date.
const QUICK_PICK_TOKENS = ["Summer", "School Year"];

function formatQuickPickCombo(raw) {
  const parts = raw.split("-").map((p) => p.trim());
  const matched = parts
    .map((p) => QUICK_PICK_TOKENS.find((t) => t.toLowerCase() === p.toLowerCase()))
    .filter(Boolean);

  if (matched.length !== parts.length || matched.length === 0) return null;
  return matched.join(" & ");
}

export function formatDeadline(applicationDeadline) {
  if (!applicationDeadline) return "Rolling";

  const trimmed = applicationDeadline.trim();

  if (trimmed.toLowerCase() === "contact for deadline") {
    return "Contact for Deadline";
  }

  const combo = formatQuickPickCombo(trimmed);
  if (combo) return combo;

  const match = applicationDeadline.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return applicationDeadline;

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);

  const label = `${MONTHS[month]} ${ordinal(day)}`;
  const currentYear = new Date().getFullYear();
  return year === currentYear ? label : `${label}, ${year}`;
}
