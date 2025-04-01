"use client"

import { cn } from '@/lib/utils';
import { SquareDashedMousePointer } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

function Logo({
    fontSize="2xl",
    iconSize=20
    }:{
        fontSize?:String;
        iconSize?:Number;
    }) {
  return (
    <Link href={"/"} className={cn("text-2xl font-extrabold flex items-center gap-2",fontSize)} >
        <div className='rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-2'>
            <SquareDashedMousePointer size={String(iconSize)} className='stroke-white' />
        </div>
        <div>
            <span className='bg-gradient-to-r from-purple-500 to-purple-800 bg-clip-text text-transparent'>
            Intelli
            </span>
            <span className='text-stone-700 dark:text-stone-300'>
                Scrape
            </span>
        </div>
    </Link>
  )
}

export default Logo;