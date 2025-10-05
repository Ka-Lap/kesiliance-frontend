import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const base = process.env.BACKEND_URL ?? "https://kesiliance-api.onrender.com";
  const joined = (params.path || []).join("/");
  const url = `${base}/${joined}${req.nextUrl.search || ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": process.env.API_KEY || "" },
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    console.error("Proxy GET error:", e);
    return NextResponse.json({ error: "Proxy GET failed", message: e?.message || String(e), url }, { status: 502 });
  }
}
