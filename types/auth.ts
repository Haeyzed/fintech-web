export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    phone: string;
    profile_image: string;
    balance: string;
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

export interface PaymentMethod {
    id: string
    type: string
    details: Record<string, string>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string;
    reference: string;
    type: string;
    amount: string;
    status: string;
    description: string;
    created_at: string;
    updated_at: string;
    user: User;
    payment_method: PaymentMethod;
}

export interface TableState {
    search: string
    page: number
    perPage: number
    sortColumn: string | null
    sortDirection: 'asc' | 'desc' | null
    isTrashed: boolean
    dateRange: { startDate: string | null; endDate: string | null };
}