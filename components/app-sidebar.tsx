'use client'

import * as React from 'react'
import {
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  Store,
  Users
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { NavSecondary } from '@/components/nav-secondary'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchForm } from '@/components/search-form'

// This is sample data.
export const data = {
  teams: [
    {
      name: "Simbrella",
      logo: GalleryVerticalEnd,
      plan: "Simbrella",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: Store,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Security",
          url: "/settings/security",
        },
        {
          title: "Appearance",
          url: "/settings/appearance",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredNavMain = data.navMain.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.items?.some(subItem => subItem.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredNavSecondary = data.navSecondary.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
          <SearchForm onSearch={handleSearch} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={filteredNavMain} />
          {/*<NavProjects projects={data.projects}/>*/}
          <NavSecondary items={filteredNavSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          {isLoading ? (
              <Skeleton className="h-12 w-full" />
          ) : (
              <NavUser user={user} />
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
  )
}