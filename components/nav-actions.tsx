"use client"

import * as React from "react"
import {ModeToggle} from "@/components/mode-toggle";

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
    console.log(isOpen)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <ModeToggle/>
    </div>
  )
}
