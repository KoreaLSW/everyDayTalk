import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import Sakura from "../component/Sakura";
import SessionProvider from "./context/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative flex h-screen bg-[#FDF6E3] overflow-hidden">
        <Sakura />
        <Navbar />
        <SessionProvider>
          <main className="flex-1 relative z-10">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
