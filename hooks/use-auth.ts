"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { User } from "@/types"
import { useApi } from "@/hooks/use-api"
import { toast } from "sonner";

const publicAuthPaths = ['/login', '/register', '/reset-password', '/forgot-password', '/verify']

export function useAuth() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const { post } = useApi()

    useEffect(() => {
        if (pathname !== null) {
            if (status === "unauthenticated" && !publicAuthPaths.includes(pathname)) {
                router.push("/login")
            } else if (status === "authenticated" && publicAuthPaths.includes(pathname)) {
                router.push("/dashboard")
            }
        }
    }, [status, router, pathname])

    const user: User = session?.user as User ?? {
        id: "",
        name: "",
        email: "",
        username: "",
        phone: "",
        profile_image: "",
        balance: "",
        email_verified_at: null,
        device_token: null,
        last_login_at: null,
        current_login_at: null,
        last_login_ip: null,
        current_login_ip: null,
        login_count: 0,
        provider: null,
        provider_id: null,
        google2fa_enabled: false,
        recovery_codes: null,
        created_at: "",
        updated_at: "",
        deleted_at: null,
    }

    const logout = async () => {
        try {
            const response = await post('/auth/logout', {})
            await signOut({ redirect: false })
            toast.success('Success', {
                description: response.message || 'Logged out successful.',
            })
            router.push("/login")
        } catch (error) {
            console.error('Logout error:', error)
            await signOut({ redirect: false })
            toast.success('Success', {
                description: 'Logged out successful.',
            })
            router.push("/login")
        }
    }

    return {
        user,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        logout,
    }
}