import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { matchingService } from "@/services/matching/matching.service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analyzed = await matchingService.analyzeUserMatches(session.user.id);
    return NextResponse.json({ analyzed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
