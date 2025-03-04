import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = { className: "" };

export const metadata: Metadata = {
  title: "PantauTular",
  description: "Platform informasi sebaran penyakit menular di Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PantauTular</title>
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}