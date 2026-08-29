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
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
