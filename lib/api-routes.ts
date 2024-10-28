import Env from './env'

export const API_URL = Env.API_URL + '/api/v1'

// Dashboard routes
export const DASHBOARD_API = '/dashboard/metrics'

// Auth routes
export const LOGIN_API = '/auth/login'
export const SOCIAL_LOGIN_API = '/auth'
export const SIGNUP_API = '/auth/register'
export const REFRESH_TOKEN_API = '/auth/refresh-token'
export const SEND_RESET_PASSWORD_LINK_API = '/auth/send-reset-password-link'
export const FORGOT_PASSWORD_API = '/auth/forgot-password'
export const RESET_PASSWORD_API = '/auth/reset-password'
export const CHANGE_PASSWORD_API = '/auth/user/change-password'
export const VERIFY_EMAIL_API = '/auth/verify-email-email'
export const LOGOUT_API = '/auth/logout'
export const USER_API = '/auth/user'
export const UPDATE_PROFILE_API = '/auth/user/update'

// User routes
export const USERS_API = (sqid?: string) => sqid ? `/users/${sqid}` : '/users'
export const USERS_BULK_DELETE_API = `${USERS_API()}/bulk-delete`
export const USERS_BULK_RESTORE_API = `${USERS_API()}/bulk-restore`
export const USERS_FORCE_DELETE_API = (sqid: string) => `${USERS_API(sqid)}/force-delete`
export const USERS_RESTORE_API = (sqid: string) => `${USERS_API(sqid)}/restore`
export const USERS_EXPORT_API = `${USERS_API()}/export`
export const USERS_IMPORT_API = `${USERS_API()}/import`
export const USERS_COLUMNS_API = `${USERS_API()}/table-columns`

// Transaction routes
export const TRANSACTIONS_API = (sqid?: string) => sqid ? `/transactions/${sqid}` : '/user/transactions'
export const TRANSACTIONS_BULK_DELETE_API = `${TRANSACTIONS_API()}/bulk-delete`
export const TRANSACTIONS_BULK_RESTORE_API = `${TRANSACTIONS_API()}/bulk-restore`
export const TRANSACTIONS_FORCE_DELETE_API = (sqid: string) => `${TRANSACTIONS_API(sqid)}/force-delete`
export const TRANSACTIONS_RESTORE_API = (sqid: string) => `${TRANSACTIONS_API(sqid)}/restore`
export const TRANSACTIONS_EXPORT_API = `${TRANSACTIONS_API()}/export`
export const TRANSACTIONS_IMPORT_API = `${TRANSACTIONS_API()}/import`
export const TRANSACTIONS_COLUMNS_API = `${TRANSACTIONS_API()}/table-columns`

// Address routes
export const OAUTH_CLIENT_API = (sqid?: string) => sqid ? `/addresses/${sqid}` : '/addresses'
export const OAUTH_CLIENT_BULK_DELETE_API = `${OAUTH_CLIENT_API()}/bulk-delete`
export const OAUTH_CLIENT_BULK_RESTORE_API = `${OAUTH_CLIENT_API()}/bulk-restore`
export const OAUTH_CLIENT_FORCE_DELETE_API = (sqid: string) => `${OAUTH_CLIENT_API(sqid)}/force-delete`
export const OAUTH_CLIENT_RESTORE_API = (sqid: string) => `${OAUTH_CLIENT_API(sqid)}/restore`
export const OAUTH_CLIENT_SET_DEFAULT_API = (sqid: string) => `${OAUTH_CLIENT_API(sqid)}/set-default`
export const OAUTH_CLIENT_EXPORT_API = `${OAUTH_CLIENT_API()}/export`
export const OAUTH_CLIENT_IMPORT_API = `${OAUTH_CLIENT_API()}/import`
export const OAUTH_CLIENT_COLUMNS_API = `${OAUTH_CLIENT_API()}/table-columns`

// Landing Page routes
export const LANDING_PAGE_DATA_API = '/landing-page-data'