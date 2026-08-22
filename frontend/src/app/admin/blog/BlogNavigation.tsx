'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BlogNavigation() {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Articles / Posts', href: '/admin/blog' },
    { name: 'Categories', href: '/admin/blog/categories' },
    { name: 'Tags', href: '/admin/blog/tags' },
    { name: 'Comments', href: '/admin/blog/comments' },
  ];

  return (
    <div className="flex border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar bg-gray-900/30 rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isActive 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
