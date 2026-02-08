import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useGetProducts } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { calculateSubtotal, calculateTax, calculateTotal, formatPrice } from '@/utils/pricing';
import type { Product } from '@/backend';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: allProducts } = useGetProducts();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const handleQuantityChange = async (productId: bigint, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ productId, quantity: BigInt(quantity) });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const cartItemsWithProducts = cart?.items.map((item) => {
    const product = allProducts?.find((p: Product) => p.id === item.productId);
    return {
      ...item,
      product,
      price: product ? Number(product.price) : 0,
      quantity: Number(item.quantity),
    };
  }) || [];

  const subtotalCents = calculateSubtotal(cartItemsWithProducts);
  const taxCents = calculateTax(subtotalCents);
  const totalCents = calculateTotal(subtotalCents, taxCents);

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some products to get started!</p>
            <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItemsWithProducts.map((item) => (
                <Card key={item.productId.toString()}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          {item.product?.title || `Product #${item.productId}`}
                        </h3>
                        <p className="text-xl font-bold text-primary mb-4">
                          ${formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={updateCartItem.isPending}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.productId, parseInt(e.target.value) || 1)
                              }
                              className="w-16 text-center"
                              min="1"
                              disabled={updateCartItem.isPending}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={updateCartItem.isPending}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.productId)}
                            disabled={removeFromCart.isPending}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-semibold">${formatPrice(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated tax</span>
                    <span className="font-semibold">${formatPrice(taxCents)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Order total</span>
                      <span className="text-primary">${formatPrice(totalCents)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
                    size="lg"
                    onClick={() => navigate({ to: '/checkout' })}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
