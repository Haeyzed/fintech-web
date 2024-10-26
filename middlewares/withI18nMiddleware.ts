import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { i18n, Locale } from '@/i18n.config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { CustomMiddleware } from './chain';

function getLocale(request: NextRequest): Locale {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const locales = i18n.locales;
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    return matchLocale(languages, locales, i18n.defaultLocale) as Locale;
}

function isValidLocale(locale: string): locale is Locale {
    return i18n.locales.includes(locale as Locale);
}

export function withI18nMiddleware(middleware: CustomMiddleware) {
    return async (
        request: NextRequest,
        event: NextFetchEvent,
        response: NextResponse
    ) => {
        const pathname = request.nextUrl.pathname;
        const pathnameIsMissingLocale = i18n.locales.every(
            locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        );

        let locale = getLocale(request);

        if (pathnameIsMissingLocale) {
            const redirectURL = new URL(request.url);
            redirectURL.pathname = `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;

            // Preserve query parameters
            redirectURL.search = request.nextUrl.search;

            response = NextResponse.redirect(redirectURL.toString());
        } else {
            // Extract locale from the pathname if it's present
            const pathLocale = pathname.split('/')[1];
            if (isValidLocale(pathLocale)) {
                locale = pathLocale;
            }
        }

        // Set the X-App-Language header
        response.headers.set('App-Language', locale);

        return middleware(request, event, response);
    };
}