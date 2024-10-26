'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LOCALES, Locale, DEFAULT_LOCALE } from '@/i18n.config'
import { setCookie } from 'cookies-next'

const localeNames: Record<Locale, string> = {
  en: '🇺🇸 English',
  de: '🇩🇪 Deutsch',
  ar: '🇸🇦 العربية',
  fr: '🇫🇷 Français'
}

export default function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const currentLocale = LOCALES.find(locale => pathname.startsWith(`/${locale}`)) || DEFAULT_LOCALE

  const switchLocale = (locale: Locale) => {
    const currentPathname = pathname.split('/').slice(2).join('/')
    setCookie('NEXT_LOCALE', locale, { path: '/' })
    router.push(`/${locale}/${currentPathname}`)
  }

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 sm:w-[180px]"
              // className='w-10 sm:w-[180px]'
              aria-label="Select language"
          >
            <Globe className='h-4 w-4' aria-hidden="true" />
            <span className="hidden sm:inline-block sm:ml-2 sm:mr-auto">
            {localeNames[currentLocale]}
          </span>
            <ChevronDown className='hidden sm:inline-block sm:ml-2 h-4 w-4' aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-[180px] bg-card'>
          {LOCALES.map((locale) => (
              <DropdownMenuItem
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className="flex items-center justify-between"
              >
                <span>{localeNames[locale]}</span>
                {locale === currentLocale && (
                    <Check className='ml-2 h-4 w-4' aria-hidden="true" />
                )}
              </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
  )
}