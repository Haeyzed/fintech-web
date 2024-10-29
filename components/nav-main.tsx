"use client"

import {ChevronRight, type LucideIcon} from "lucide-react"
import {usePathname} from "next/navigation"
import Link from "next/link"

import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({
                          items,
                        }: {
  items: NavItem[]
}) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (!pathname) return false
    const localePrefix = `/${pathname.split('/')[1]}`
    const localizedUrl = `${localePrefix}${url}`
    return pathname.startsWith(localizedUrl)
  }

  const getLocalizedUrl = (url: string) => {
    if (!pathname) return url
    const locale = pathname.split('/')[1]
    return `/${locale}${url}`
  }

  const renderMenuItem = (item: NavItem) => {
    const isItemActive = isActive(item.url) || item.items?.some(subItem => isActive(subItem.url))

    if (item.items) {
      return (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={isItemActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title} isActive={isItemActive}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                      <Link href={getLocalizedUrl(subItem.url)}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    } else {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <Link href={getLocalizedUrl(item.url)}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>App</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(renderMenuItem)}
      </SidebarMenu>
    </SidebarGroup>
  )
}