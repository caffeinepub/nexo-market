import { Link } from '@tanstack/react-router';
import { useGetCategories } from '@/hooks/useQueries';
import { Menu } from 'lucide-react';

export default function SecondaryNav() {
  const { data: categories } = useGetCategories();

  return (
    <nav className="bg-[oklch(0.205_0_0)] text-white border-b border-white/10">
      <div className="w-full px-4">
        <div className="flex items-center gap-6 h-10 overflow-x-auto scrollbar-hide">
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors whitespace-nowrap"
          >
            <Menu className="h-4 w-4" />
            All
          </Link>
          {categories?.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to="/products"
              search={{ category: category.name }}
              className="text-sm font-medium hover:text-white/80 transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
