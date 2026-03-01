import type { Metadata } from "next";
import Script from "next/script";
import { Open_Sans, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JUA-KALI MULI TRADERS - Electronics & Appliances",
  description:
    "Quality electronics, home appliances, and juakali tools in Murang'a. Samsung, HP, Bosch, JBL, and more trusted brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${poppins.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="font-open-sans antialiased">
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('kickszone-theme') || 'system';
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider defaultTheme="system" storageKey="kickszone-theme">
          <QueryProvider>
            <SessionProvider>
              <div className="flex min-h-screen flex-col print:min-h-0">
                <Header />
                <main className="flex-1 pb-16 md:pb-20 lg:pb-0 print:pb-0">{children}</main>
                <Footer />
                <FloatingNav />
              </div>
              <Toaster />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
