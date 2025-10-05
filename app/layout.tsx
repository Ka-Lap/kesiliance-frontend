import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KesiLiance Console",
  description: "Console pour importer, créer et matcher des entités",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
