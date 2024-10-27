import * as React from 'react'
import {useMediaQuery} from '@/hooks/use-media-query'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import {ScrollArea} from '@/components/ui/scroll-area'

interface ResponsiveDialogProps {
    trigger: React.ReactNode
    title: string
    description?: string
    children: React.ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ResponsiveDialog({
                                     trigger,
                                     title,
                                     description,
                                     children,
                                     open,
                                     onOpenChange,
                                 }: ResponsiveDialogProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const content = (
            <>{children}</>
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <ScrollArea className="h-full max-h-[80vh]">
                        {content}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className="bg-card">
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <ScrollArea className="h-full max-h-[80vh] overflow-y-auto">
                    <div className="px-4 pb-4">{content}</div>
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    )
}