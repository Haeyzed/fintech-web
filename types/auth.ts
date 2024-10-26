export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    phone: string;
    profile_image: string;
    email_verified_at: string | null;
    device_token: string | null;
    last_login_at: string | null;
    current_login_at: string | null;
    last_login_ip: string | null;
    current_login_ip: string | null;
    login_count: number;
    provider: string | null;
    provider_id: string | null;
    google2fa_enabled: boolean;
    recovery_codes: string[] | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
        token_type: string;
        expires_in: number;
    };
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}