import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | AI Resume Builder",
    absolute: "AI Resume Builder",
  },
  description:
    "AI resume builder is the easiest way to create a resume using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <NextThemesProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </NextThemesProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
