import type { Metadata, Viewport } from "next";

const inter = { className: "" };

export const metadata: Metadata = {
  title: "PantauTular",
  description: "Platform informasi sebaran penyakit menular di Indonesia",
  other: {
    "http-equiv": "Content-Security-Policy",
    content: "upgrade-insecure-requests",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
