import { cssVariables } from "@juridico-ia/design-system";
import "./globals.css";

export const metadata = {
  title: "Juridico-IA",
  description: "Plataforma jurídica multi-tenant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,600&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
