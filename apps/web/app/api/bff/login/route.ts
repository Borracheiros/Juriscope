const API = process.env.API_URL ?? "http://127.0.0.1:3001";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const headers = new Headers();
  headers.set("cache-control", "no-store");
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) headers.append("set-cookie", c);
  return new Response(text, { status: res.status, headers });
}
