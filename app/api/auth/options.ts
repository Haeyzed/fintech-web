import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthResponse, User } from '@/types'
import { API_BASE_URL } from "@/lib/api-client"

declare module "next-auth" {
    interface Session {
        user: User & {
            token: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: User;
        token: string;
        exp: number;
    }
}

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

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials)
                    })

                    const data: AuthResponse = await response.json()

                    if (data.success) {
                        return {
                            ...data.data.user,
                            token: data.data.token,
                            exp: Math.floor(Date.now() / 1000) + data.data.expires_in
                        }
                    }

                    return null
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user as User
                token.token = (user as User & { token: string }).token
                token.exp = (user as User & { exp: number }).exp
            }

            // Check if the token is about to expire
            const now = Math.floor(Date.now() / 1000)
            if (token.exp - now < REFRESH_TOKEN_THRESHOLD) {
                try {
                    const refreshedData = await refreshToken(token.token)
                    if (refreshedData.success) {
                        token.token = refreshedData.data.token
                        token.exp = Math.floor(Date.now() / 1000) + refreshedData.data.expires_in
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error)
                    // If refresh fails, we'll let the token expire naturally
                }
            }

            return token
        },
        async session({ session, token }) {
            session.user = {
                ...token.user,
                token: token.token
            }
            return session
        },
    },
    session: {
        strategy: 'jwt',
    },
}

export default authOptions