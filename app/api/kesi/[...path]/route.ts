/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

function baseUrl() {
  return process.env.BACKEND_URL ?? "https://kesiliance-api.onrender.com";
}
function buildTargetURL(path: string[], req: NextRequest) {
  const qs = req.nextUrl.search || "";
  const joined = (path || []).join("/");
  return `${baseUrl()}/${joined}${qs}`;
}

async function forward(method: "GET" | "POST", req: NextRequest, path: string[]) {
  const url = buildTargetURL(path, req);
  const headers: Record<string, string> = { "x-api-key": process.env.API_KEY || "" };

  let body: BodyInit | undefined;
  if (method === "POST") {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const fwd = new FormData();
      for (const [k, v] of form.entries()) {
        if (v instanceof File) fwd.append(k, v, (v as File).name);
        else fwd.append(k, String(v));
      }
      body = fwd;
    } else {
      const text = await req.text();
      body = text;
      headers["content-type"] = ct || "application/json";
    }
  }

  try {
    const res = await fetch(url, { method, headers, body, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "";
    const buf = await res.arrayBuffer();
    const extra: Record<string, string> = { "content-type": contentType };
    const cd = res.headers.get("content-disposition");
    if (cd) extra["content-disposition"] = cd;
    return new NextResponse(buf, { status: res.status, headers: extra });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Proxy error", message: e?.message || String(e), target: url },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: any) {
  const { path } = await context.params;
  return forward("GET", req, path);
}

export async function POST(req: NextRequest, context: any) {
  const { path } = await context.params;
  return forward("POST", req, path);
}

