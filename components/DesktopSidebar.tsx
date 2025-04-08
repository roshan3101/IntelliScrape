"use client"

import { CoinsIcon, Home, MenuIcon, ShieldCheckIcon, WorkflowIcon } from 'lucide-react'
import React, { useState } from 'react'
import Logo from './Logo'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { usePathname } from 'next/navigation'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
  } from "@/components/ui/sheet"
import UserAvailableCreditsBadge from './UserAvailableCreditsBadge'
  

const routes = [
    {
        href: "/",
        label: "Home",
        icon: Home
    },
    {
        href: "/workflows",
        label: "Workflows",
        icon: WorkflowIcon
    },
    {
        href: "/credentials",
        label: "Credentials",
        icon: ShieldCheckIcon
    },
    {
        href: "/billing",
        label: "Billing",
        icon: CoinsIcon
    }
]

function DesktopSidebar() {
    const pathname = usePathname();
    
    // Find the active route by checking if the pathname starts with the route's href
    const activeRoute = routes.find(route => {
        if (route.href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(route.href);
    }) || routes[0];

  return (
    <div className='hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary-30 dark:text-foreground text-muted-foreground border-r-2 border-separate'>
        <div className='flex justify-center items-center gap-2 border-b-[1px] border-separate p-4'>
            <Logo />
        </div>
        <div className='p-2'>
            <UserAvailableCreditsBadge />
        </div>
        <div className='flex flex-col p-2'>
            {routes.map((route) => (
                <Link
                key={route.href}
                href={route.href}
                className={buttonVariants({
                    variant: activeRoute.href === route.href ?
                        "sidebarActiveItem" : "sidebarItem"
                })}
                >
                    <route.icon size={20} />
                    {route.label}
                </Link>
            ))}
        </div>
    </div>
  )
}

export function MobileSidebar() {
    const pathname = usePathname();
    
    // Find the active route by checking if the pathname starts with the route's href
    const activeRoute = routes.find(route => {
        if (route.href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(route.href);
    }) || routes[0];

    const [isOpen,setOpen] = useState(false);


    return (
        <div className='block border-separate bg-background md:hidden'>
            <nav className='container flex items-center justify-between px-8'>
                <Sheet open={isOpen} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"} >
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-3/4 sm:w-[540px] space-y-4" side={"left"} >
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <Logo />
                        <UserAvailableCreditsBadge />
                        <div className='flex flex-col gap-1'>
                            {routes.map((route) => (
                                <Link
                                key={route.href}
                                href={route.href}
                                className={buttonVariants({
                                    variant: activeRoute.href === route.href ?
                                        "sidebarActiveItem" : "sidebarItem"
                                })}
                                onClick={() => setOpen(prev => !prev)}
                                >
                                    <route.icon size={20} />
                                    {route.label}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

            </nav>
        </div>
    )
}

export default DesktopSidebar