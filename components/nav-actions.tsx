"use client"

import * as React from "react"
import {ModeToggle} from "@/components/mode-toggle";
import LocaleSwitcher from '@/components/locale-switcher'

export function NavActions() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <ModeToggle/>
      <LocaleSwitcher/>
    </div>
  )
}
