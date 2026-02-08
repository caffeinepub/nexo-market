import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useGetProducts, useAddToCart } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Loader2, Check, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import type { Product } from '@/backend';

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: allProducts } = useGetProducts();
  const addToCart = useAddToCart();

  const similarProducts = allProducts?.filter(
    (p: Product) => p.category === product?.category && p.id.toString() !== productId
  ).slice(0, 4) || [];

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: BigInt(productId), quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
      </div>
    );
  }

  const price = Number(product.price) / 100;
  const inStock = Number(product.stock) > 0;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-primary">4.0 out of 5 stars</span>
              </div>
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">About this item</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">${price.toFixed(2)}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>FREE delivery on orders over $25</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Deliver to your location</span>
                  </div>
                </div>

                {inStock ? (
                  <>
                    <div className="text-green-600 font-semibold">In Stock</div>
                    {Number(product.stock) < 10 && (
                      <div className="text-destructive text-sm">
                        Only {product.stock.toString()} left in stock - order soon
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-destructive font-semibold">Out of Stock</div>
                )}

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || !inStock}
                  className="w-full bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
                >
                  {addToCart.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: '/cart' })}
                  disabled={!inStock}
                  className="w-full"
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((similarProduct: Product) => (
                <Card
                  key={similarProduct.id.toString()}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate({ to: `/products/${similarProduct.id}` })}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      {similarProduct.image ? (
                        <img
                          src={similarProduct.image}
                          alt={similarProduct.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{similarProduct.title}</h3>
                    <p className="text-xl font-bold text-primary">
                      ${(Number(similarProduct.price) / 100).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
