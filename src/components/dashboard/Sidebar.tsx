'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
};

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link href={href} className={`flex items-center p-3 rounded-md ${active ? 'bg-blue-900 bg-opacity-50' : 'hover:bg-gray-800'}`}>
      <div className="w-6 h-6 mr-3 text-gray-400">{icon}</div>
      <span className={active ? 'text-white' : 'text-gray-400'}>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-white">Smart Budgeting</h1>
        </div>
        
        <nav className="space-y-2">
          <SidebarItem 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            label="Overview"
            href="/dashboard"
            active={isActive('/dashboard')}
          />
          <SidebarItem 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Expense"
            href="/dashboard/expense"
            active={isActive('/dashboard/expense')}
          />
          <SidebarItem 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label="Reports"
            href="/dashboard/reports"
            active={isActive('/dashboard/reports')}
          />
          <SidebarItem 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            label="Accounts"
            href="/dashboard/accounts"
            active={isActive('/dashboard/accounts')}
          />
          <SidebarItem 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Subscriptions"
            href="/dashboard/subscriptions"
            active={isActive('/dashboard/subscriptions')}
          />
        </nav>
      </div>
    </div>
  );
}
