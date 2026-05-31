import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Node",
  description: "Node is a community of builders."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
