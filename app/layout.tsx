import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Jiraint – Project Management",
  description:
    "A powerful, modern project management tool for engineering teams. Kanban boards, sprint planning, and issue tracking – all in one place.",
  keywords: [
    "project management",
    "kanban board",
    "scrum",
    "agile",
    "issue tracker",
    "sprint planning",
    "jira alternative",
  ],
  authors: [{ name: "Jiraint" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
