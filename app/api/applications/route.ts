import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicationService } from "@/services/applications/application.service";
import { z } from "zod";

const createSchema = z.object({
  jobMatchId: z.string().cuid(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const { applications, total } = await applicationService.listByUser(
    session.user.id,
    status as Parameters<typeof applicationService.listByUser>[1],
    page
  );

  return NextResponse.json({ applications, total });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const application = await applicationService.createDraft(
      session.user.id,
      parsed.data.jobMatchId
    );
    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create application.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
