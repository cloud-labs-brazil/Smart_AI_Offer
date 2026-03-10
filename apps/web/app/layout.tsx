import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
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
                    <ErrorBoundary
                        fallbackTitle="Smart Offer encountered an error"
                        showDetails={process.env.NODE_ENV === "development"}
                    >
                        {children}
                    </ErrorBoundary>
                </ThemeProvider>
            </body>
        </html>
    );
}
