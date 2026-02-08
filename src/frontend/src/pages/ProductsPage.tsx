import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetProducts, useGetCategories } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/backend';

export default function ProductsPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string; q?: string };
  const { data: allProducts, isLoading } = useGetProducts();
  const { data: categories } = useGetCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>(search.category || '');

  const filteredProducts = allProducts?.filter((product: Product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (search.q && !product.title.toLowerCase().includes(search.q.toLowerCase())) return false;
    return true;
  }) || [];

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('')}
                >
                  All Products
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('')}
                  >
                    All Products
                  </Button>
                  {categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {search.q ? `Search results for "${search.q}"` : selectedCategory || 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 animate-pulse" />
                    <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product: Product) => (
                <Card
                  key={product.id.toString()}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate({ to: `/products/${product.id}` })}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </p>
                    {Number(product.stock) < 10 && Number(product.stock) > 0 && (
                      <p className="text-xs text-destructive mt-1">
                        Only {product.stock.toString()} left in stock
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
