import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@/app/globals.css";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
