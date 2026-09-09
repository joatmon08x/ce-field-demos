import { NextResponse } from "next/server";
import { getRunbook } from "@/lib/runbooks/meta";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const runbook = getRunbook(slug);
  if (!runbook) {
    return NextResponse.json({ error: "Runbook not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...runbook,
    href: `/runbooks/commands/${runbook.slug}`,
  });
}
