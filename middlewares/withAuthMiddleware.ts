import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { CustomMiddleware } from './chain'
import { i18n, Locale } from "@/i18n.config"

const protectedPaths = ['/dashboard','/transactions']
const publicAuthPaths = ['/login', '/register', '/reset-password', '/forgot-password', '/verify']

function getRoutesWithLocale(routes: string[], locales: Locale[]) {
    let routesWithLocale = [...routes]

    routes.forEach(route => {
        locales.forEach(
            locale =>
                (routesWithLocale = [
                    ...routesWithLocale,
                    `/${locale}${route}`
                ])
        )
    })

    return routesWithLocale
}

export function withAuthMiddleware(middleware: CustomMiddleware): CustomMiddleware {
    return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        const pathname = request.nextUrl.pathname

        const protectedPathsWithLocale = getRoutesWithLocale(protectedPaths, [...i18n.locales])
        const publicAuthPathsWithLocale = getRoutesWithLocale(publicAuthPaths, [...i18n.locales])

        if (!token || (token.exp && token.exp * 1000 < Date.now())) {
            if (protectedPathsWithLocale.includes(pathname)) {
                const signInUrl = new URL('/api/auth/signin', request.url)
                signInUrl.searchParams.set('callbackUrl', pathname)
                return NextResponse.redirect(signInUrl)
            }
        } else {
            // User is authenticated
            if (publicAuthPathsWithLocale.includes(pathname)) {
                // Redirect to dashboard if user tries to access login, register, etc.
                return NextResponse.redirect(new URL('/transactions', request.url))
            }
        }

        // If the token is valid, continue with the request
        return middleware(request, event, response)
    }
}