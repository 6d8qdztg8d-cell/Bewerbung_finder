import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userService } from "@/services/users/user.service";
import { apiKeysSchema } from "@/domain/user/schemas";
import OpenAI from "openai";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await userService.getApiKeys(session.user.id);

  // Mask keys — return only last 4 chars for display
  return NextResponse.json({
    openaiApiKey: keys.openaiApiKey ? maskKey(keys.openaiApiKey) : null,
    rapidApiKey: keys.rapidApiKey ? maskKey(keys.rapidApiKey) : null,
    openaiConnected: !!keys.openaiApiKey || !!process.env.OPENAI_API_KEY,
    rapidConnected: !!keys.rapidApiKey || !!process.env.RAPID_API_KEY,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = apiKeysSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  await userService.upsertApiKeys(session.user.id, parsed.data);
  return NextResponse.json({ success: true });
}

// POST /api/settings/api-keys/test — validate OpenAI key works
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { apiKey?: string };
  const apiKey = body.apiKey ?? (await userService.getOpenAIKey(session.user.id)) ?? process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "sk-...") {
    return NextResponse.json({ valid: false, error: "Kein API-Key konfiguriert." }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey });
    // Lightweight call — just list models
    await client.models.list();
    return NextResponse.json({ valid: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung fehlgeschlagen.";
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}
