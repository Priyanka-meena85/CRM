import "@/styles/globals.css";
import { Metadata } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Priya Boutique CRM",
  description: "Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-text font-body min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
