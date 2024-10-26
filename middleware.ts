import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chain } from '@/middlewares/chain'
import { withI18nMiddleware } from '@/middlewares/withI18nMiddleware'
import { withAuthMiddleware } from '@/middlewares/withAuthMiddleware'
import { withTokenRefreshMiddleware } from '@/middlewares/withTokenRefreshMiddleware'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const handler = chain([
        withI18nMiddleware,
        withTokenRefreshMiddleware,
        withAuthMiddleware,
    ])

    return handler(request, {} as any, response)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|firebase-messaging-sw.js).*)'],
};