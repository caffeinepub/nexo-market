import { useNavigate } from '@tanstack/react-router';
import { useGetProducts } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import PromoGrid from '@/components/storefront/PromoGrid';
import type { Product } from '@/backend';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: products } = useGetProducts();

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <div className="w-full">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Promo Grid */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <PromoGrid />
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featuredProducts.map((product: Product) => (
                <Card
                  key={product.id.toString()}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate({ to: `/products/${product.id}` })}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
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
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
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
                    <p className="text-lg font-bold text-primary">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today's Deals */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Today's Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product: Product) => (
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
                  <div className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded inline-block mb-2">
                    Deal
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-xl font-bold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
