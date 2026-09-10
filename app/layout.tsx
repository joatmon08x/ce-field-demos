import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ledgerly",
    template: "%s · Ledgerly",
  },
  description:
    "Fieldnote Workspace — fictional billing operations. Catalog prices are $49, $99, and $249.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/logo-mark.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('ledgerly-theme')==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();",
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
