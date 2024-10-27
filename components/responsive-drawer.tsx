import React from 'react'
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface ResponsiveDrawerProps {
    triggerButton?: React.ReactNode
    title: string
    description?: string
    children: React.ReactNode
    className?: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ResponsiveDrawer({
                                     triggerButton,
                                     title,
                                     description,
                                     children,
                                     className,
                                     open,
                                     onOpenChange,
                                 }: ResponsiveDrawerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const content = (
        <>
            {isDesktop ? (
                <DialogContent className={className}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    {children}
                </DialogContent>
            ) : (
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && <DrawerDescription>{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div className={className}>
                        {children}
                    </div>
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            )}
        </>
    )

    return (
        <>
            {isDesktop ? (
                <Dialog open={open} onOpenChange={onOpenChange}>
                    {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
                    {content}
                </Dialog>
            ) : (
                <Drawer open={open} onOpenChange={onOpenChange}>
                    {triggerButton && <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>}
                    {content}
                </Drawer>
            )}
        </>
    )
}