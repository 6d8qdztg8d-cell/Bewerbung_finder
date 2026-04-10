import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userService } from "@/services/users/user.service";
import { userProfileSchema } from "@/domain/user/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await userService.getProfile(session.user.id);
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = userProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const profile = await userService.upsertProfile(session.user.id, parsed.data);
  return NextResponse.json({ profile });
}
