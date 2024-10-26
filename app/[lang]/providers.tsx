'use client'

import { SessionProvider } from 'next-auth/react'
import { type getDictionary } from '@/lib/dictionary'
import React from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
}


type Dictionary = Awaited<ReturnType<typeof getDictionary>>

const DictionaryContext = React.createContext<Dictionary | null>(null)

export function DictionaryProvider({
                                               dictionary,
                                               children
                                           }: {
    dictionary: Dictionary
    children: React.ReactNode
}) {
    return (
        <DictionaryContext.Provider value={dictionary}>
            {children}
        </DictionaryContext.Provider>
    )
}

export function useDictionary() {
    const dictionary = React.useContext(DictionaryContext)
    if (dictionary === null) {
        throw new Error(
            'useDictionary hook must be used within Dictionary Provider'
        )
    }

    return dictionary
}
