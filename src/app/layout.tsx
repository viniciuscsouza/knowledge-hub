import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Hub de Conhecimento",
  description: "Sua base de conhecimento centralizada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
