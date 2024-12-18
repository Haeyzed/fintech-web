import type {Metadata} from "next";
import localFont from "next/font/local";
import "../globals.css";
import {AuthProvider, DictionaryProvider} from "./providers";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/sonner";
import {Locale, LOCALES} from "@/i18n.config";
import {getDictionary} from "@/lib/dictionary";
import {getDirection} from "@/lib/utils";
import {TooltipProvider} from "@/components/ui/tooltip";

const geistSans = localFont({
    src: "../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Simbrella",
    description: "Simple Fintech App",
};

export async function generateStaticParams() {
    return LOCALES.map(locale => ({lang: locale}))
}

export default async function RootLayout({
                                             children,

                                             params: {lang}
                                         }: Readonly<{
    children: React.ReactNode
    params: { lang: Locale }
}>) {
    const dictionary = await getDictionary(lang)
    const dir = getDirection(lang)
    return (
        <html lang={lang} dir={dir} suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <DictionaryProvider dictionary={dictionary}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthProvider>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                    <Toaster/>
                </AuthProvider>
            </ThemeProvider>
        </DictionaryProvider>
        </body>
        </html>
    );
}
