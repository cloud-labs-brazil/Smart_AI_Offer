import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Smart Offer",
    description: "AI Offers Management — Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="antialiased">
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
