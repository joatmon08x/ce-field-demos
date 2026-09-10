import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { BrandTheme } from "@/components/brand-theme";
import { getActiveBrand } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brand = getActiveBrand();

export const metadata: Metadata = {
  title: {
    default: brand.productName,
    template: `%s · ${brand.productName}`,
  },
  description: `${brand.workspaceName} — ${brand.tagline} Catalog prices are $49, $99, and $249.`,
  icons: {
    icon: [
      { url: `/brands/${brand.id}/favicon.svg`, type: "image/svg+xml" },
      { url: `/brands/${brand.id}/logo-mark.svg`, type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-brand={brand.id}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <BrandTheme />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('demo-theme')==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();",
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
