"use client"

import * as React from "react"
import {ModeToggle} from "@/components/mode-toggle";
import LocaleSwitcher from '@/components/locale-switcher'
import { useAuth } from '@/hooks/use-auth'
import { Label } from '@/components/ui/label'

export function NavActions() {
  const { user, isLoading } = useAuth()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <Label>Balance: {user.balance}</Label>
      <ModeToggle/>
      <LocaleSwitcher/>
    </div>
  )
}
