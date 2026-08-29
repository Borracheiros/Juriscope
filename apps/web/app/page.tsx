"use client";

import { useState } from "react";
import pt from "../locales/pt.json";
import { StatusView } from "../components/StatusView";
import type { CognitiveState } from "@juridico-ia/contracts";

export default function HomePage() {
  const [state, setState] = useState<CognitiveState>("NOT_COLLECTED");
  const [email, setEmail] = useState("lawyer.alpha@example.test");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("escritorio-alpha");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("LOADING");
    setError(null);
    const res = await fetch("/api/bff/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, tenantSlug }),
    });
    if (res.status === 401) {
      setState("ERROR");
      setError("Credenciais inválidas");
      return;
    }
    if (res.status === 403) {
      setState("FORBIDDEN");
      return;
    }
    if (!res.ok) {
      setState("ERROR");
      setError("Falha ao entrar");
      return;
    }
    setReady(true);
    setState("READY");
  }

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 24px",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 28,
      }}
    >
      <aside
        style={{
          background: "var(--color-sidebar)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 40px rgba(27,36,48,0.08)",
        }}
      >
        <p style={{ margin: 0, letterSpacing: "0.12em", fontSize: 12, textTransform: "uppercase" }}>Juridico-IA</p>
        <nav aria-label="Áreas de trabalho" style={{ marginTop: 24, display: "grid", gap: 8 }}>
          {["Intake", "Conflito", "Matéria", "Documentos", "Prazos", "Pesquisa", "Revisão de IA"].map((item) => (
            <span key={item} style={{ color: "#5c6570" }} aria-disabled="true">
              {item} — em breve
            </span>
          ))}
        </nav>
      </aside>
      <section>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 40, margin: "0 0 8px" }}>{pt.titulo}</h1>
        <p style={{ marginTop: 0 }}>{pt.subtitulo}</p>
        <StatusView state={state} detail={error ?? undefined} />
        {ready ? (
          <p>
            {pt.ondeEstou}. {pt.proximaAcao}. {pt.rascunhoIa}
          </p>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }} aria-label="Entrar">
            <label>
              {pt.email}
              <input
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: 10 }}
              />
            </label>
            <label>
              {pt.senha}
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{ display: "block", width: "100%", padding: 10 }}
              />
            </label>
            <label>
              {pt.escritorio}
              <input
                name="tenantSlug"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: 10 }}
              />
            </label>
            <button
              type="submit"
              disabled={state === "LOADING"}
              style={{
                background: "var(--color-primary)",
                color: "white",
                border: 0,
                padding: "12px 16px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              {pt.entrar}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
