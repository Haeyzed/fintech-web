import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { CustomMiddleware } from './chain'
import { API_BASE_URL } from "@/components/utils/api-client"
import { AuthResponse } from "@/types/auth"

const REFRESH_TOKEN_THRESHOLD = 5 * 60 // 5 minutes in seconds

async function refreshToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Failed to refresh token')
    }

    return await response.json()
}

export function withTokenRefreshMiddleware(middleware: CustomMiddleware): CustomMiddleware {
    return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        if (token && token.exp) {
            const now = Math.floor(Date.now() / 1000)
            if (token.exp - now < REFRESH_TOKEN_THRESHOLD) {
                try {
                    const refreshedData = await refreshToken(token.token)
                    if (refreshedData.success) {
                        // Update the token in the response
                        const updatedToken = {
                            ...token,
                            token: refreshedData.data.token,
                            exp: Math.floor(Date.now() / 1000) + refreshedData.data.expires_in
                        }

                        // Set the updated token in the response cookies
                        response.cookies.set({
                            name: 'next-auth.session-token',
                            value: JSON.stringify(updatedToken),
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: refreshedData.data.expires_in
                        })

                        // Update the Authorization header for downstream middleware and API calls
                        request.headers.set('Authorization', `Bearer ${refreshedData.data.token}`)
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error)
                    // Handle refresh failure (e.g., redirect to login)
                    const signInUrl = new URL('/api/auth/signin', request.url)
                    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
                    return NextResponse.redirect(signInUrl)
                }
            }
        }

        return middleware(request, event, response)
    }
}