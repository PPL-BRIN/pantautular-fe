import type { Metadata } from "next";

const inter = { className: "" };

export const metadata: Metadata = {
  title: "PantauTular",
  description: "Platform informasi sebaran penyakit menular di Indonesia",
  viewport: "width=device-width, initial-scale=1",
  other: {
    "http-equiv": "Content-Security-Policy",
    content: "upgrade-insecure-requests",
  },
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
