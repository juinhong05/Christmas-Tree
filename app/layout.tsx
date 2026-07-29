import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Python Christmas Tree",
  description: "A glowing animated Christmas tree made with code and starlight.",
  openGraph: {
    title: "Python Christmas Tree",
    description: "A glowing animated Christmas tree made with code and starlight.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Python Christmas Tree",
    description: "A glowing animated Christmas tree made with code and starlight.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
