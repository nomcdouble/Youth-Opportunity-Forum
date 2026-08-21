import { NextResponse } from "next/server";
import { validateApplication } from "../../../../lib/validate";
import { updateApplication, deleteApplication } from "../../../../lib/store";

export const dynamic = "force-dynamic";

function isAdmin(req) {
  const secret = req.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function PATCH(req, { params }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = (await req.json()) || {};
  const { status, ...fields } = body;

  let patch = {};

  // Approve / decline: called with just { status }.
  if (status !== undefined) {
    if (!["approved", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'approved' or 'declined'" },
        { status: 400 }
      );
    }
    patch.status = status;
  }

  // Editing listing details from the moderation queue: called with the
  // full set of listing fields, validated the same way a new submission
  // would be.
  if (Object.keys(fields).length > 0) {
    const result = validateApplication(fields);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    patch = { ...patch, ...result.value };
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  let updated;
  try {
    updated = await updateApplication(id, patch);
  } catch (err) {
    console.error("Failed to update application:", err);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (patch.status === "approved" && process.env.APPROVAL_WEBHOOK_URL) {
    try {
      await fetch(process.env.APPROVAL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "application.approved",
          application: updated,
        }),
      });
    } catch (err) {
      console.error("Approval webhook failed:", err);
    }
  }

  return NextResponse.json({ application: updated });
}

export async function DELETE(req, { params }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  let ok;
  try {
    ok = await deleteApplication(id);
  } catch (err) {
    console.error("Failed to delete application:", err);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }

  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
