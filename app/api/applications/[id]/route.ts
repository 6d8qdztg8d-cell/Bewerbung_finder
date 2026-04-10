import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicationService } from "@/services/applications/application.service";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum([
    "DRAFT",
    "READY",
    "SUBMITTED",
    "ACKNOWLEDGED",
    "REJECTED",
    "INTERVIEW",
    "OFFER",
    "WITHDRAWN",
  ]),
});

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await applicationService.getById(id, session.user.id);

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  return NextResponse.json({ application });
}

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
    const application = await applicationService.updateStatus(
      id,
      session.user.id,
      parsed.data.status
    );
    return NextResponse.json({ application });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
