"use client"

import { ChevronRight, MoreHorizontal, Folder, Forward, Trash2, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const { isMobile } = useSidebar()

  const isActive = (url: string) => {
    const localePrefix = `/${pathname.split('/')[1]}`
    const localizedUrl = `${localePrefix}${url}`
    return pathname.startsWith(localizedUrl)
  }

  const getLocalizedUrl = (url: string) => {
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
            {/*<DropdownMenu>*/}
            {/*  <DropdownMenuTrigger asChild>*/}
            {/*    <SidebarMenuAction showOnHover>*/}
            {/*      <MoreHorizontal />*/}
            {/*      <span className="sr-only">More</span>*/}
            {/*    </SidebarMenuAction>*/}
            {/*  </DropdownMenuTrigger>*/}
            {/*  <DropdownMenuContent*/}
            {/*      className="w-48 rounded-lg"*/}
            {/*      side={isMobile ? "bottom" : "right"}*/}
            {/*      align={isMobile ? "end" : "start"}*/}
            {/*  >*/}
            {/*    <DropdownMenuItem>*/}
            {/*      <Folder className="text-muted-foreground" />*/}
            {/*      <span>View {item.title}</span>*/}
            {/*    </DropdownMenuItem>*/}
            {/*    <DropdownMenuItem>*/}
            {/*      <Forward className="text-muted-foreground" />*/}
            {/*      <span>Share {item.title}</span>*/}
            {/*    </DropdownMenuItem>*/}
            {/*    <DropdownMenuSeparator />*/}
            {/*    <DropdownMenuItem>*/}
            {/*      <Trash2 className="text-muted-foreground" />*/}
            {/*      <span>Delete {item.title}</span>*/}
            {/*    </DropdownMenuItem>*/}
            {/*  </DropdownMenuContent>*/}
            {/*</DropdownMenu>*/}
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