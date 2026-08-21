import { NextResponse } from "next/server";
import { validateApplication } from "../../../lib/validate";
import { listApplications, insertApplication } from "../../../lib/store";

export const dynamic = "force-dynamic";

function isAdmin(req) {
  const secret = req.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function GET(req) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await listApplications();
    return NextResponse.json({ applications });
  } catch (err) {
    console.error("Failed to list applications:", err);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = validateApplication(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const inserted = await insertApplication(result.value);
    return NextResponse.json({ application: inserted });
  } catch (err) {
    console.error("Failed to insert application:", err);
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
