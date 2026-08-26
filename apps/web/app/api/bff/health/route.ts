const API = process.env.API_URL ?? "http://127.0.0.1:3001";

export async function GET() {
  const res = await fetch(`${API}/v1/health`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "cache-control": "no-store", "content-type": "application/json" },
  });
}
