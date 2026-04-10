import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { matchingService } from "@/services/matching/matching.service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const { matches, total } = await matchingService.getUserMatches(
    session.user.id,
    status,
    page
  );

  return NextResponse.json({ matches, total });
}
