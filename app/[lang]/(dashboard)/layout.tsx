"use client"

import React from 'react'
import {usePathname} from 'next/navigation'
import {AppSidebar, data as sidebarData} from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {NavActions} from "@/components/nav-actions"
import {i18n, Locale} from "@/i18n.config"

// Generate routeMap from navMain data
const generateRouteMap = (navItems: typeof sidebarData.navMain) => {
    const routeMap: { [key: string]: string } = {}
    navItems.forEach(item => {
        const key = item.url.split('/').pop() || ''
        routeMap[key] = item.title
        if (item.items) {
            item.items.forEach(subItem => {
                const subKey = subItem.url.split('/').pop() || ''
                routeMap[subKey] = subItem.title
            })
        }
    })
    return routeMap
}

const routeMap = generateRouteMap(sidebarData.navMain)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(segment => segment !== '') ?? null

    // Remove the locale from the path segments if present
    const locale = i18n.locales.find(loc => loc === pathSegments[0]) as Locale | undefined
    const pathWithoutLocale = locale ? pathSegments.slice(1) : pathSegments

    const breadcrumbs = pathWithoutLocale.map((segment, index) => {
        const href = `/${locale ? locale + '/' : ''}${pathWithoutLocale.slice(0, index + 1).join('/')}`
        const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        return { href, label }
    })

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
                >
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <React.Fragment key={crumb.href}>
                                        {index > 0 && <BreadcrumbSeparator />}
                                        <BreadcrumbItem>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={crumb.href}>
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto px-3">
                        <NavActions />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}