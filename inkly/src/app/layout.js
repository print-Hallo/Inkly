/**
 * @purpose: Root layout for the Inkly app.
 * @features: Inter font from Google Fonts, global CSS, dark-mode-ready metadata.
 * @params: {Object} children - Child page components rendered inside the layout.
 */

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Inkly — AI-Powered Notes",
  description:
    "A rich writing experience with typography, draggable multimedia, and AI-powered tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
