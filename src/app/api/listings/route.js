import { NextResponse } from "next/server";
import { validateApplication } from "../../../lib/validate";
import { listApplications, insertApplication } from "../../../lib/store";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function toPublicListing(a) {
  const {
    id,
    company_name,
    role_name,
    website_url,
    ages,
    mode,
    location,
    street_address,
    zip_code,
    description,
    role_requirements,
    application_deadline,
    paid_status,
    fee_status,
    who_can_apply,
    created_at,
  } = a;
  return {
    id,
    company_name,
    role_name,
    website_url,
    ages,
    mode,
    location,
    street_address,
    zip_code,
    description,
    role_requirements,
    application_deadline,
    paid_status,
    fee_status,
    who_can_apply,
    created_at,
  };
}

export async function GET() {
  try {
    const applications = await listApplications();
    const listings = applications
      .filter((a) => a.status === "approved")
      .map(toPublicListing);

    return NextResponse.json({ listings }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Failed to load listings:", err);
    return NextResponse.json(
      { error: "Failed to load listings" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = validateApplication(body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const inserted = await insertApplication(result.value);
    return NextResponse.json(
      { id: inserted.id, status: inserted.status, created_at: inserted.created_at },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Failed to insert listing:", err);
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
