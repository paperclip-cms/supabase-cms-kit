import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
   children: React.ReactNode;
   header?: React.ReactNode;
}

export default function MainLayout({ children, header }: MainLayoutProps) {
   return (
      <div className="h-svh overflow-hidden p-2 w-full">
         <div className="border border-gray-400 dark:border-border rounded-md overflow-hidden flex flex-col items-center justify-start bg-[#fafafa] dark:bg-[#101011] h-full w-full">
            {header}
            <div className={cn('overflow-auto w-full', header ? 'h-[calc(100%-56px)]' : 'h-full')}>
               {children}
            </div>
         </div>
      </div>
   );
}
