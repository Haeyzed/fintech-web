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

            return NextResponse.redirect(redirectURL.toString());
        } else {
            // Extract locale from the pathname if it's present
            const pathLocale = pathname.split('/')[1];
            if (isValidLocale(pathLocale)) {
                locale = pathLocale;
            }
        }

        // Create a new response if one doesn't exist
        if (!response) {
            response = NextResponse.next();
        }

        // Set the App-Language header
        response.headers.set('App-Language', locale);

        // Set a cookie for the locale
        response.cookies.set('NEXT_LOCALE', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });

        // Call the next middleware and get its response
        const middlewareResponse = await middleware(request, event, response);

        // If the middleware returned a response, use it; otherwise, use our modified response
        const finalResponse = middlewareResponse instanceof NextResponse ? middlewareResponse : response;

        // Ensure the App-Language header is set on the final response
        finalResponse.headers.set('App-Language', locale);

        return finalResponse;
    };
}