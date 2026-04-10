import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { matchingService } from "@/services/matching/matching.service";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SKIPPED"]),
});

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const { id } = await params;
    const match = await matchingService.updateMatchStatus(
      id,
      session.user.id,
      parsed.data.status
    );
    return NextResponse.json({ match });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
