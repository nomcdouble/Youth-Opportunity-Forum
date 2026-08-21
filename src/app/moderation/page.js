"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import OpportunityModal from "../../components/OpportunityModal";
import ListingForm from "../../components/ListingForm";
import { COLORS, FONT, StatusBadge, inputStyle } from "../../components/theme";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editError, setEditError] = useState("");

  const channelRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("yof-board");
    }
    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  function broadcast(msg) {
    if (channelRef.current) channelRef.current.postMessage(msg);
  }

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? sessionStorage.getItem("admin_secret")
        : null;
    if (saved) {
      setSecret(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) throw new Error("Wrong password, or a server error.");
      const json = await res.json();
      setApps(json.applications || []);
    } catch (e) {
      setError(e.message);
      setAuthed(false);
      sessionStorage.removeItem("admin_secret");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    sessionStorage.setItem("admin_secret", secret);
    setAuthed(true);
  }

  async function approve(id) {
    setActingId(id);
    setError("");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) throw new Error("Couldn't update that application.");
      const json = await res.json();
      setApps((prev) => prev.map((a) => (a.id === id ? json.application : a)));
      setSelected((prev) => (prev && prev.id === id ? json.application : prev));
      broadcast({ type: "refresh" });
    } catch (e) {
      setError(e.message);
    } finally {
      setActingId(null);
    }
  }

  async function decline(id) {
    setActingId(id);
    setError("");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ status: "declined" }),
      });
      if (!res.ok) throw new Error("Couldn't decline that application.");
      const json = await res.json();
      setApps((prev) => prev.map((a) => (a.id === id ? json.application : a)));
      setSelected((prev) => (prev && prev.id === id ? json.application : prev));
      broadcast({ type: "removed", id });
    } catch (e) {
      setError(e.message);
    } finally {
      setActingId(null);
    }
  }

  async function removeFromListings(id) {
    setActingId(id);
    setError("");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) throw new Error("Couldn't remove that listing.");
      setApps((prev) => prev.filter((a) => a.id !== id));
      setEditingId((prev) => (prev === id ? null : prev));
      setSelected((prev) => (prev && prev.id === id ? null : prev));
      broadcast({ type: "removed", id });
    } catch (e) {
      setError(e.message);
    } finally {
      setActingId(null);
    }
  }

  async function saveEdit(id, payload) {
    setActingId(id);
    setEditError("");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't save changes.");
      setApps((prev) => prev.map((a) => (a.id === id ? json.application : a)));
      setSelected((prev) => (prev && prev.id === id ? json.application : prev));
      setEditingId(null);
      broadcast({ type: "refresh" });
    } catch (e) {
      setEditError(e.message);
    } finally {
      setActingId(null);
    }
  }

  async function clearAllApproved() {
    const approvedIds = apps.filter((a) => a.status === "approved").map((a) => a.id);
    if (approvedIds.length === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Remove all ${approvedIds.length} live listing${approvedIds.length === 1 ? "" : "s"} from the board? This can't be undone.`
      )
    ) {
      return;
    }
    setClearing(true);
    setError("");
    try {
      const results = await Promise.all(
        approvedIds.map((id) =>
          fetch(`/api/applications/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": secret },
          }).then((res) => ({ id, ok: res.ok }))
        )
      );
      const removedIds = results.filter((r) => r.ok).map((r) => r.id);
      if (removedIds.length < approvedIds.length) {
        setError("Some listings couldn't be removed. Try refreshing and retrying.");
      }
      setApps((prev) => prev.filter((a) => !removedIds.includes(a.id)));
      setSelected((prev) => (prev && removedIds.includes(prev.id) ? null : prev));
      broadcast({ type: "refresh" });
    } catch (e) {
      setError("Couldn't clear the live listings.");
    } finally {
      setClearing(false);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: FONT,
  };

  if (!authed) {
    return (
      <div style={pageStyle}>
        <SiteHeader />
        <div style={{ maxWidth: 380, margin: "80px auto 0", padding: "0 24px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>
            Moderation
          </h1>
          <p style={{ color: COLORS.inkDim, fontSize: 13, marginTop: 0 }}>
            Enter the admin password to continue.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin password"
              style={{ ...inputStyle, marginTop: 16 }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                marginTop: 12,
                width: "100%",
                background: COLORS.purple,
                border: "none",
                borderRadius: 8,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Enter
            </button>
          </form>
          {error && <p style={{ color: "#a3341a", fontSize: 13 }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <SiteHeader />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: 16,
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink, margin: 0 }}>
              Moderation
            </h1>
            <p style={{ color: COLORS.inkDim, fontSize: 13, margin: "4px 0 0" }}>
              Click a listing to review it. Declining pulls it off the front page but keeps it here, marked Declined.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={clearAllApproved}
              disabled={clearing || !apps.some((a) => a.status === "approved")}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.declinedText}`,
                color: COLORS.declinedText,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity:
                  clearing || !apps.some((a) => a.status === "approved") ? 0.5 : 1,
              }}
            >
              {clearing ? "Clearing…" : "Clear"}
            </button>
            <button
              onClick={load}
              disabled={loading}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.inkDim,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#a3341a", fontSize: 13 }}>{error}</p>}

        {apps.length === 0 && !loading && (
          <p style={{ color: COLORS.inkDim }}>
            No applications yet.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {apps.map((a) => (
            <div
              key={a.id}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  onClick={() => setSelected(a)}
                  style={{ minWidth: 240, flex: 1, cursor: "pointer" }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink }}>
                    {a.role_name}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.inkDim, margin: "2px 0 8px" }}>
                    {a.company_name} · {a.email}
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => approve(a.id)}
                    disabled={actingId === a.id || a.status === "approved"}
                    style={{
                      background: COLORS.approvedText,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decline(a.id)}
                    disabled={actingId === a.id || a.status === "declined"}
                    style={{
                      background: COLORS.declinedText,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      setEditError("");
                      setEditingId((prev) => (prev === a.id ? null : a.id));
                    }}
                    disabled={actingId === a.id}
                    style={{
                      background: editingId === a.id ? COLORS.ink : "transparent",
                      color: editingId === a.id ? "#ffffff" : COLORS.ink,
                      border: `1px solid ${COLORS.ink}`,
                      borderRadius: 8,
                      padding: "9px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {editingId === a.id && (
                <div
                  style={{
                    borderTop: `1px solid ${COLORS.border}`,
                    paddingTop: 4,
                  }}
                >
                  <p style={{ fontSize: 12, color: COLORS.inkDim, margin: "8px 0 0" }}>
                    {a.status === "approved"
                      ? "This listing is currently live on the front page."
                      : "This listing is not currently live on the front page."}
                  </p>

                  <ListingForm
                    key={a.id}
                    initialListing={a}
                    mode="edit"
                    submitting={actingId === a.id}
                    error={editError}
                    submitLabel="SAVE CHANGES"
                    onCancel={() => {
                      setEditError("");
                      setEditingId(null);
                    }}
                    onSubmit={(payload) => saveEdit(a.id, payload)}
                  />

                  <div
                    style={{
                      borderTop: `1px solid ${COLORS.border}`,
                      marginTop: 20,
                      paddingTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <p style={{ fontSize: 12, color: COLORS.inkDim, margin: 0 }}>
                      Removing takes this listing off the board entirely.
                    </p>
                    <button
                      onClick={() => removeFromListings(a.id)}
                      disabled={actingId === a.id}
                      style={{
                        background: "#a3341a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "9px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {actingId === a.id ? "Removing…" : "Remove from front page"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <OpportunityModal
          listing={selected}
          mode="moderate"
          onClose={() => setSelected(null)}
          onApprove={approve}
          onDecline={decline}
          acting={actingId === selected.id}
        />
      )}
    </div>
  );
}
