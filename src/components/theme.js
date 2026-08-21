export const COLORS = {
  bg: "#ffffff",
  hero: "#eeebe2",
  ink: "#1b2440",
  inkDim: "#5b6478",
  teal: "#2fa7c9",
  purple: "#6c4fe0",
  purpleDark: "#5a3fce",
  border: "#e2e0d8",
  cardBg: "#f5f3ee",
  chipBg: "#dceef6",
  chipText: "#1b6a86",
  green: "#c8ecd3",
  greenText: "1d6b3b",
  yellow: "#f6dd8a",
  yellowText: "#7a5b06",
  approvedBg: "#dcf3e1",
  approvedText: "#1f7a3f",
  declinedBg: "#fbdcd4",
  declinedText: "#a3341a",
  pendingBg: "#eceef2",
  pendingText: "#4a5468",
};

export const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function Chip({ children, bg, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color: color || COLORS.chipText,
        background: bg || COLORS.chipBg,
        borderRadius: 5,
        padding: "4px 10px",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  );
}

export function AgeChip({ age }) {
  const isOlder = age === "18+" || age === "18";
  return (
    <Chip bg={isOlder ? COLORS.yellow : COLORS.green} color={isOlder ? COLORS.yellowText : COLORS.greenText}>
      {age}
    </Chip>
  );
}

export function StatusBadge({ status }) {
  const map = {
    approved: { label: "Approved", bg: COLORS.approvedBg, color: COLORS.approvedText },
    declined: { label: "Declined", bg: COLORS.declinedBg, color: COLORS.declinedText },
    pending: { label: "Pending", bg: COLORS.pendingBg, color: COLORS.pendingText },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color: s.color,
        background: s.bg,
        borderRadius: 20,
        padding: "4px 12px",
      }}
    >
      {s.label}
    </span>
  );
}

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  color: COLORS.ink,
  padding: "10px 12px",
  fontSize: 13,
  fontFamily: FONT,
};
