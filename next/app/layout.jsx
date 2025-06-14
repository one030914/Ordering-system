import { Inter } from "next/font/google";
import SessionNavbar from "./components/sessionNavbar";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export const metadata = {
    title: "網路早餐訂餐系統",
    description: "網路早餐訂餐系統",
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-TW" className="scroll-smooth">
            <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 flex flex-col`}>
                <SessionNavbar />
                <main className="flex-grow container mx-auto px-4 py-6">
                    {children}
                </main>
                <footer className="bg-gray-100 text-center text-sm py-4 text-gray-600">
                    &copy; {new Date().getFullYear()} 網路早餐訂餐系統 · All rights reserved.
                </footer>
            </body>
        </html>
    );
}
