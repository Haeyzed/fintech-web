'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {onMessage} from 'firebase/messaging'
import {fetchToken, messaging} from '@/lib/firebase'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'

type NotificationPermissionStatus = NotificationPermission | null

/**
 * Request notification permission and fetch FCM token
 * @returns {Promise<string | null>} FCM token or null if not available
 */
async function getNotificationPermissionAndToken(): Promise<string | null> {
    if (!('Notification' in window)) {
        console.info('This browser does not support desktop notification')
        return null
    }

    if (Notification.permission === 'granted') return await fetchToken()

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') return await fetchToken()
    }

    console.log('Notification permission not granted.')
    return null
}

/**
 * Custom hook for managing FCM token and notifications
 * @returns {Object} FCM token, notification permission status, and error
 */
export const useFcmToken = () => {
    const router = useRouter()
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermissionStatus>(null)
    const [token, setToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const retryLoadToken = useRef(0)
    const isLoading = useRef(false)


    const loadToken = useCallback(async () => {
        if (isLoading.current) return

        isLoading.current = true
        try {
            const newToken = await getNotificationPermissionAndToken()

            if (Notification.permission === 'denied') {
                setNotificationPermissionStatus('denied')
                console.info('Push Notifications permission denied')
                toast.error('Push Notifications permission denied')
                return
            }

            if (!newToken) {
                if (retryLoadToken.current >= 3) {
                    setError('Unable to load token, please refresh the browser')
                    console.info('Push Notifications issue - unable to load token after 3 retries')
                    toast.error('Unable to load FCM token, please refresh the browser')
                    return
                }

                retryLoadToken.current += 1
                console.error('An error occurred while retrieving token. Retrying...')
                toast.loading('Retrying to load FCM token...')
                await loadToken()
                return
            }

            setNotificationPermissionStatus(Notification.permission)
            setToken(newToken)
            // await sendTokenToServer(newToken)
        } catch (err) {
            console.error('Error in loadToken:', err)
            setError('Failed to load FCM token')
            toast.error('Failed to load FCM token')
        } finally {
            isLoading.current = false
        }
    }, [])

    useEffect(() => {
        if ('Notification' in window) {
            loadToken()
        }
    }, [loadToken])

    useEffect(() => {
        let unsubscribe: (() => void) | null = null

        const setupListener = async () => {
            if (!token) return

            console.log(`onMessage registered with token ${token}`)
            const m = await messaging()
            if (!m) return

            unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== 'granted') return

                console.log('Foreground push notification received:', payload)
                const link = payload.fcmOptions?.link || payload.data?.link

                const notificationOptions = {
                    title: payload.notification?.title || 'New message',
                    body: payload.notification?.body || 'This is a new message',
                    data: link ? { url: link } : undefined,
                }

                toast(notificationOptions.title, {
                    description: notificationOptions.body,
                    action: link ? {
                        label: 'Visit',
                        onClick: () => router.push(link),
                    } : undefined,
                })

                const n = new Notification(notificationOptions.title, notificationOptions)

                n.onclick = (event) => {
                    event.preventDefault()
                    const clickedLink = (event.target as any)?.data?.url
                    if (clickedLink) {
                        router.push(clickedLink)
                    } else {
                        console.log('No link found in the notification payload')
                    }
                }
            })
        }

        setupListener()

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [token, router])

    return { token, notificationPermissionStatus, error }
}