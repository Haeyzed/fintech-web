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

export interface BankAccount {
    id: string;
    account_number: string;
    account_type: string;
    balance: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    user: User
    bank: Bank
    currency: Currency
}

export interface Bank {
    id: string;
    name: string;
    code: string;
    slug: string;
    long_code: string;
    gateway: string | null;
    pay_with_bank: boolean;
    is_active: boolean;
    type: string;
    ussd: string | null;
    logo: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    country?: Country;
    currency?: Currency;
}

export interface Currency {
    id: string;
    name: string;
    code: string;
    precision: number;
    symbol: string;
    symbol_native: string;
    symbol_first: boolean;
    decimal_mark: string;
    thousands_separator: string;
    country?: Country;
}

export interface Country {
    id: string;
    name: string;
    iso2: string;
    iso3: string;
    phone_code: string;
    region: string;
    subregion: string;
    native: string;
    latitude: number;
    longitude: number;
    emoji: string;
    emojiU: string;
    status: boolean;
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
    bank_account: BankAccount;
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