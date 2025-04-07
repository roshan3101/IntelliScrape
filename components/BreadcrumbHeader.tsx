"use client"

import { usePathname } from 'next/navigation'
import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { MobileSidebar } from './DesktopSidebar';

function BreadcrumbHeader() {
    const pathname = usePathname();
    const paths = pathname === "/" ? [""] : pathname.split("/");

  return (
    <div className='flex items-center flex-start'>
        <MobileSidebar />
        <Breadcrumb>
            <BreadcrumbList>
                {paths.map((path,index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            <BreadcrumbLink className='capitalize' href={`/${path}`}>
                                {path === "" ? "home" : path}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index !== paths.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    </div>
  )
}

export default BreadcrumbHeader