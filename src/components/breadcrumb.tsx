import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex mb-8 text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <ol className="flex items-center gap-2">
        <li className="flex items-center">
          <Link href="/" className="hover:text-primary flex items-center gap-1 transition-colors">
            <Home size={14} />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight size={14} className="shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
